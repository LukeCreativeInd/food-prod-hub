import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

import {
  CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY,
  CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION,
  PRODUCTION_IMPORT_PARSER_LIMITS,
  PRODUCTION_IMPORT_TARGET_CONCEPTS,
  fingerprintProductionImportValue,
  productionImportParserRegistry,
  selectProductionImportParser,
} from "../../lib/production-import/parser.ts";
import { deriveProductionImportRunStatus } from "../../lib/production-import/run-status.ts";

const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migration = readFileSync(
  new URL("056_production_data_staging_parser_foundation.sql", migrationsDirectory),
  "utf8",
);

const commonHeaders = [
  "package_version",
  "priority",
  "workflow_status",
  "source_type",
  "source_name",
  "source_row_reference",
  "submitted_by",
  "submitted_date",
  "operational_owner",
  "approval_status",
  "evidence_class",
  "evidence_confidence",
];

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function itemCsv(overrides = {}) {
  const headers = [
    ...commonHeaders,
    "collection_item_key",
    "current_item_name",
    "item_type",
    "base_uom",
    "staff_notes",
  ];
  const values = {
    package_version: "v01",
    priority: "normal",
    workflow_status: "submitted",
    source_type: "staff_current_truth",
    source_name: "synthetic-task-241.csv",
    source_row_reference: "Item Register:ITEM-DEMO-001",
    submitted_by: "Synthetic Tester",
    submitted_date: "2026-08-07",
    operational_owner: "Synthetic Owner",
    approval_status: "pending",
    evidence_class: "current_confirmed",
    evidence_confidence: "staff_confirmed",
    collection_item_key: "ITEM-DEMO-001",
    current_item_name: " Synthetic Item ",
    item_type: "component",
    base_uom: "kg",
    staff_notes: "=NOT_EXECUTED()",
    ...overrides,
  };

  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
  return `${headers.join(",")}\n${headers.map((header) => escape(values[header] ?? "")).join(",")}\n`;
}

function parseCsv(content, datasetKey = "item_register") {
  const selection = selectProductionImportParser({
    mimeType: "text/csv",
    filename: "synthetic.csv",
  });
  assert.equal(selection.supported, true);
  if (!selection.supported) throw new Error("Expected CSV parser");
  return selection.parser.parse({
    content,
    datasetKey,
    sourceChecksum: sha256(content),
    expectedByteSize: new TextEncoder().encode(content).byteLength,
    expectedMimeType: "text/csv",
    mimeType: "text/csv",
    filename: "synthetic.csv",
  });
}

test("Migration 056 is the only new migration number and remains transactional", () => {
  const migrations = readdirSync(migrationsDirectory);
  assert.equal(migrations.filter((name) => name.startsWith("056_")).length, 1);
  assert.equal(migrations.some((name) => name.startsWith("057_")), false);
  assert.match(migration, /^begin;/);
  assert.match(migration, /commit;\s*$/);
});

test("seven tenant-owned evidence tables have RLS, read-only grants and no write policies", () => {
  const tables = [
    "production_import_runs",
    "production_import_sources",
    "production_import_parser_runs",
    "production_import_staged_records",
    "production_import_staged_fields",
    "production_import_issues",
    "production_import_events",
  ];

  for (const table of tables) {
    assert.match(
      migration,
      new RegExp(`create table public\\.${table} \\([\\s\\S]*?organisation_id uuid not null`),
    );
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(
      migration,
      new RegExp(`create policy ${table}_select_view[\\s\\S]*?for select[\\s\\S]*?to authenticated`),
    );
    assert.match(
      migration,
      new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated, service_role;`),
    );
    assert.match(migration, new RegExp(`grant select on table public\\.${table} to authenticated;`));
    assert.doesNotMatch(
      migration,
      new RegExp(`create policy ${table}_[^\\n]*(?:insert|update|delete)`, "i"),
    );
  }
});

test("same-tenant keys protect run, source, parser, staged and facility lineage", () => {
  for (const fragment of [
    "production_import_runs_facility_tenant_fkey",
    "production_import_runs_supersedes_tenant_fkey",
    "production_import_sources_run_tenant_fkey",
    "production_import_sources_facility_tenant_fkey",
    "production_import_sources_supersedes_tenant_fkey",
    "production_import_parser_runs_source_tenant_fkey",
    "production_import_staged_records_parser_tenant_fkey",
    "production_import_staged_records_source_tenant_fkey",
    "production_import_staged_fields_record_tenant_fkey",
    "production_import_issues_record_tenant_fkey",
  ]) {
    assert.match(migration, new RegExp(fragment));
  }
  assert.match(migration, /foreign key \(organisation_id, import_run_id, source_id\)/);
  assert.match(migration, /foreign key \(organisation_id, import_run_id, parser_run_id\)/);
});

test("permissions are minimal and demo, support and platform roles gain no import access", () => {
  assert.match(migration, /'production_imports\.view'/);
  assert.match(migration, /'production_imports\.manage'/);
  assert.doesNotMatch(migration, /production_imports\.(?:review|apply)/);

  for (const role of ["organisation_admin", "operations_manager", "production_manager"]) {
    assert.match(migration, new RegExp(`\\('${role}', 'production_imports\\.view'\\)`));
    assert.match(migration, new RegExp(`\\('${role}', 'production_imports\\.manage'\\)`));
  }

  const permissionSeed = migration.match(
    /with production_import_role_permissions[\s\S]*?on conflict \(role_id, permission_id\) do nothing;/,
  )?.[0];
  assert.ok(permissionSeed);
  for (const role of [
    "phase_1_demo_user",
    "viewer",
    "staff",
    "tablet_user",
    "qa_manager",
    "warehouse_manager",
    "wholesale_manager",
    "platform_admin",
  ]) {
    assert.doesNotMatch(permissionSeed, new RegExp(`'${role}'`));
  }
});

test("private source storage uses exact four-part paths and manual least-privilege policies", () => {
  assert.match(migration, /'production-imports',[\s\S]*?false,[\s\S]*?20971520/);
  assert.match(migration, /cardinality\(string_to_array\(storage_path, '\/'\)\) = 4/);
  assert.match(migration, /object_segment <> 'source'/);
  assert.match(migration, /segment_count <> 4/);
  assert.match(migration, /production_imports\.view/);
  assert.match(migration, /production_imports\.manage/);
  assert.doesNotMatch(migration, /create policy[\s\S]{0,160}on storage\.objects/i);
  assert.match(migration, /No UPDATE or DELETE policy is part of Task 241/);
});

test("SECURITY DEFINER workflows have fixed paths and least-privilege grants", () => {
  const functions = [
    "production_import_require_permission",
    "production_import_refresh_run_status",
    "create_production_import_run",
    "register_production_import_source",
    "complete_production_import_source_upload",
    "start_production_import_parser_run",
    "finalize_production_import_parser_run",
    "fail_production_import_parser_run",
    "cancel_production_import_run",
    "can_access_production_import_storage_path",
  ];
  for (const functionName of functions) {
    const definition = migration.match(
      new RegExp(`create or replace function public\\.${functionName}\\([\\s\\S]*?\\n\\$\\$;`),
    )?.[0];
    assert.ok(definition, `${functionName} definition is present`);
    assert.match(definition, /security definer/);
    assert.match(definition, /set search_path = public/);
    assert.doesNotMatch(definition, /execute\s+format|\bexecute\s+[^;]+/i);
  }
  const executeGrants = migration.match(/grant execute on function[^;]+;/g) ?? [];
  assert.ok(executeGrants.length > 0);
  for (const grant of executeGrants) {
    assert.match(grant, /to authenticated;$/);
    assert.doesNotMatch(grant, /\bto\s+(?:public|anon|service_role)\b/);
  }
  assert.doesNotMatch(migration, /grant execute on function public\.production_import_require_permission/);
  for (const internalParserFunction of [
    "start_production_import_parser_run",
    "finalize_production_import_parser_run",
    "fail_production_import_parser_run",
  ]) {
    assert.doesNotMatch(
      migration,
      new RegExp(`grant execute on function public\\.${internalParserFunction}`),
    );
  }
});

test("run status is reconciled from every active source instead of the last parser writer", () => {
  const completed = (blockerCount = 0, completedAt = 20) => ({
    status: "completed",
    isSelected: true,
    blockerCount,
    completedAt,
  });
  const failed = (completedAt = 10) => ({
    status: "failed",
    isSelected: false,
    blockerCount: 0,
    completedAt,
  });
  const running = {
    status: "running",
    isSelected: false,
    blockerCount: 0,
    completedAt: null,
  };

  assert.equal(
    deriveProductionImportRunStatus("parsing", [
      { status: "verified", parsers: [completed()] },
      { status: "verified", parsers: [completed()] },
    ]),
    "ready_for_mapping",
  );
  assert.equal(
    deriveProductionImportRunStatus("parsing", [
      { status: "uploaded_unverified", parsers: [failed()] },
      { status: "verified", parsers: [completed()] },
    ]),
    "parser_failed",
  );
  assert.equal(
    deriveProductionImportRunStatus("parsing", [
      { status: "verified", parsers: [completed(1)] },
      { status: "verified", parsers: [completed()] },
    ]),
    "needs_attention",
  );
  assert.equal(
    deriveProductionImportRunStatus("parsing", [
      { status: "verified", parsers: [completed()] },
      { status: "uploaded_unverified", parsers: [] },
    ]),
    "source_ready",
  );
  assert.equal(
    deriveProductionImportRunStatus("source_ready", [
      { status: "uploaded_unverified", parsers: [running] },
      { status: "verified", parsers: [completed()] },
    ]),
    "parsing",
  );
  assert.equal(
    deriveProductionImportRunStatus("parser_failed", [
      { status: "verified", parsers: [failed(10), completed(0, 20)] },
    ]),
    "ready_for_mapping",
  );
  assert.equal(
    deriveProductionImportRunStatus("cancelled", [
      { status: "verified", parsers: [completed()] },
    ]),
    "cancelled",
  );

  const refreshFunction = migration.match(
    /create or replace function public\.production_import_refresh_run_status\([\s\S]*?\n\$\$;/,
  )?.[0];
  assert.ok(refreshFunction);
  assert.match(refreshFunction, /for update/);
  assert.match(refreshFunction, /source\.status not in \('superseded', 'archived'\)/);
  assert.match(refreshFunction, /v_running_parser_count > 0 then 'parsing'/);
  assert.match(refreshFunction, /v_unresolved_failed_count > 0 then 'parser_failed'/);
  assert.match(refreshFunction, /v_missing_selected_count > 0 then 'source_ready'/);
  assert.match(refreshFunction, /v_blocking_selected_count > 0 then 'needs_attention'/);
});

test("official parser persistence is dormant and cannot be forged by authenticated callers", () => {
  for (const signature of [
    "start_production_import_parser_run\\(uuid, text, text\\)",
    "finalize_production_import_parser_run\\(uuid, text, bigint, text, jsonb, jsonb, jsonb\\)",
    "fail_production_import_parser_run\\(uuid, text, text\\)",
  ]) {
    assert.match(
      migration,
      new RegExp(`revoke all on function public\\.${signature}[\\s\\S]*?from public, anon, authenticated, service_role;`),
    );
    assert.doesNotMatch(migration, new RegExp(`grant execute on function public\\.${signature}`));
  }
  assert.match(migration, /Internal dormant parser finalization boundary/);
  assert.match(migration, /verified_source_checksum_mismatch/);
  assert.match(migration, /verified_source_size_mismatch/);
  assert.match(migration, /verified_source_mime_mismatch/);
});

test("source upload remains unverified while Storage size and optional MIME metadata are checked", () => {
  assert.match(migration, /'uploaded_unverified'/);
  assert.doesNotMatch(migration, /'accepted'/);
  assert.match(migration, /storage_object_size_unavailable/);
  assert.match(migration, /storage_object_size_mismatch/);
  assert.match(migration, /storage_object_mime_mismatch/);
  assert.match(migration, /status = 'uploaded_unverified'/);
  assert.match(migration, /'checksum_verified', false/);
  assert.match(migration, /No UPDATE or DELETE policy is part of Task 241/);

  const storageHelper = migration.match(
    /create or replace function public\.can_access_production_import_storage_path\([\s\S]*?\n\$\$;/,
  )?.[0];
  assert.ok(storageHelper);
  assert.equal((storageHelper.match(/public\.has_permission\(/g) ?? []).length, 1);
});

test("evidence is immutable and canonical domains are never mutated", () => {
  assert.match(migration, /production_import_sources_protect_evidence_trigger/);
  assert.match(migration, /production_import_parser_runs_protect_evidence_trigger/);
  assert.match(migration, /production_import_staged_records_immutable_trigger/);
  assert.match(migration, /production_import_staged_fields_immutable_trigger/);
  assert.match(migration, /production_import_events_immutable_trigger/);
  assert.match(migration, /source_checksum_snapshot/);
  assert.match(migration, /extensions\.digest\(/);
  assert.equal((migration.match(/(?:^|[^.])\bdigest\(/gm) ?? []).length, 0);

  for (const table of [
    "internal_items",
    "formula_versions",
    "formula_lines",
    "production_plans",
    "production_batches",
    "production_tasks",
    "inventory_lots",
    "stock_movements",
    "qa_checks",
  ]) {
    assert.doesNotMatch(migration, new RegExp(`(?:insert into|update|delete from) public\\.${table}`, "i"));
  }
});

test("parser registry is code-owned, versioned and supports only bounded explicit CSV", () => {
  assert.equal(productionImportParserRegistry.length, 1);
  assert.equal(productionImportParserRegistry[0].key, CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_KEY);
  assert.equal(
    productionImportParserRegistry[0].version,
    CLEAN_EATS_PRODUCTION_COLLECTION_CSV_PARSER_VERSION,
  );
  assert.deepEqual(productionImportParserRegistry[0].supportedExtensions, [".csv"]);
  assert.equal(PRODUCTION_IMPORT_PARSER_LIMITS.maxRows, 10_000);
  assert.equal(PRODUCTION_IMPORT_PARSER_LIMITS.maxColumns, 128);
  assert.equal(PRODUCTION_IMPORT_TARGET_CONCEPTS.includes("recipe"), false);
});

test("unsupported XLSX remains private evidence and returns a bounded diagnostic", () => {
  const selection = selectProductionImportParser({
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: "synthetic.xlsx",
  });
  assert.equal(selection.supported, false);
  if (selection.supported) throw new Error("XLSX must remain unsupported in Task 241");
  assert.equal(selection.issue.code, "source_format_not_supported");
  assert.equal(selection.issue.severity, "blocker");
});

test("controlled CSV parse preserves raw cells, trims suggestions and never executes formulas", () => {
  const content = itemCsv();
  const result = parseCsv(content);
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].collection_key, "ITEM-DEMO-001");
  assert.equal(result.records[0].target_concept, "item_master");
  assert.equal(result.records[0].raw_fields.current_item_name, " Synthetic Item ");
  assert.equal(result.records[0].normalized_fields.current_item_name, "Synthetic Item");
  assert.equal(result.records[0].raw_fields.staff_notes, "=NOT_EXECUTED()");
  assert.ok(
    result.records[0].issues.some((entry) => entry.code === "spreadsheet_formula_text_preserved"),
  );
  assert.equal(result.diagnostics.outputFingerprint.length, 64);
});

test("same source checksum and parser version produce deterministic output", () => {
  const content = itemCsv();
  const first = parseCsv(content);
  const second = parseCsv(content);
  assert.deepEqual(first, second);
  assert.equal(
    fingerprintProductionImportValue(first.records),
    fingerprintProductionImportValue(second.records),
  );
});

test("checksum mismatch and malformed sources fail safely without staged records", () => {
  const content = itemCsv();
  const selection = selectProductionImportParser({ mimeType: "text/csv", filename: "source.csv" });
  assert.equal(selection.supported, true);
  if (!selection.supported) throw new Error("Expected CSV parser");

  const mismatch = selection.parser.parse({
    content,
    datasetKey: "item_register",
    sourceChecksum: "0".repeat(64),
    expectedByteSize: new TextEncoder().encode(content).byteLength,
    expectedMimeType: "text/csv",
    mimeType: "text/csv",
    filename: "source.csv",
  });
  assert.equal(mismatch.records.length, 0);
  assert.equal(mismatch.issues[0].code, "source_checksum_mismatch");

  const sizeMismatch = selection.parser.parse({
    content,
    datasetKey: "item_register",
    sourceChecksum: sha256(content),
    expectedByteSize: new TextEncoder().encode(content).byteLength + 1,
    expectedMimeType: "text/csv",
    mimeType: "text/csv",
    filename: "source.csv",
  });
  assert.equal(sizeMismatch.records.length, 0);
  assert.equal(sizeMismatch.issues[0].code, "source_byte_size_mismatch");

  const mimeMismatch = selection.parser.parse({
    content,
    datasetKey: "item_register",
    sourceChecksum: sha256(content),
    expectedByteSize: new TextEncoder().encode(content).byteLength,
    expectedMimeType: "application/vnd.ms-excel",
    mimeType: "text/csv",
    filename: "source.csv",
  });
  assert.equal(mimeMismatch.records.length, 0);
  assert.equal(mimeMismatch.issues[0].code, "source_mime_type_mismatch");

  const malformed = 'package_version,"unclosed\n';
  const malformedResult = selection.parser.parse({
    content: malformed,
    datasetKey: "item_register",
    sourceChecksum: sha256(malformed),
    expectedByteSize: new TextEncoder().encode(malformed).byteLength,
    expectedMimeType: "text/csv",
    mimeType: "text/csv",
    filename: "source.csv",
  });
  assert.equal(malformedResult.records.length, 0);
  assert.equal(malformedResult.issues[0].code, "csv_unclosed_quote");
});

test("ambiguous yield rows remain evidence and are not guessed into a canonical concept", () => {
  const datasetHeaders = [
    ...commonHeaders,
    "collection_rule_key",
    "method_key",
    "rule_category",
    "expected_value",
    "measure_kind",
    "basis_context",
  ];
  const values = [
    "v01",
    "normal",
    "submitted",
    "staff_current_truth",
    "synthetic-task-241.csv",
    "Yield & Batch Rules:BATCH-DEMO-001",
    "Synthetic Tester",
    "2026-08-07",
    "Synthetic Owner",
    "pending",
    "current_confirmed",
    "staff_confirmed",
    "BATCH-DEMO-001",
    "METHOD-DEMO-001",
    "unknown",
    "10",
    "quantity",
    "Synthetic basis only",
  ];
  const content = `${datasetHeaders.join(",")}\n${values.join(",")}\n`;
  const result = parseCsv(content, "yield_batch_rules");
  assert.equal(result.records[0].target_concept, "legacy_evidence");
  assert.ok(result.records[0].issues.some((entry) => entry.code === "yield_batch_target_ambiguous"));
});
