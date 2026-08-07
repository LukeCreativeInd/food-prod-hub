import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migrationNames = {
  45: "045_facility_schema_foundation.sql",
  46: "046_commerce_connection_order_intake_foundation.sql",
  47: "047_shopify_connector_foundation.sql",
  48: "048_shopify_domain_regex_fix.sql",
  49: "049_commerce_catalogue_mapping_foundation.sql",
  50: "050_delivery_calendar_production_date_foundation.sql",
};
const priorMigrations = Object.fromEntries(
  Object.entries(migrationNames).map(([number, filename]) => [
    number,
    readFileSync(new URL(filename, migrationsDirectory), "utf8"),
  ]),
);
const migration051 = readFileSync(
  new URL("051_production_demand_contribution_foundation.sql", migrationsDirectory),
  "utf8",
);
const migration052 = readFileSync(
  new URL("052_production_demand_digest_schema_fix.sql", migrationsDirectory),
  "utf8",
);
const demandData = readFileSync(
  new URL("../../lib/production-demand-data.ts", import.meta.url),
  "utf8",
);
const demandPage = readFileSync(
  new URL("../../app/production-demand/page.tsx", import.meta.url),
  "utf8",
);
const navigation = readFileSync(
  new URL("../../lib/navigation.ts", import.meta.url),
  "utf8",
);
const pageTitles = readFileSync(
  new URL("../../lib/page-title.ts", import.meta.url),
  "utf8",
);

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

function expand(sourceQuantity, mapping) {
  if (mapping.kind === "exclusion") {
    return [];
  }

  return mapping.outputs.map((output) => ({
    internalItemId: output.internalItemId,
    uom: output.uom,
    quantity: sourceQuantity * output.multiplier,
  }));
}

function aggregate(contributions) {
  const rows = new Map();

  for (const contribution of contributions.filter((row) => row.status === "active")) {
    const key = [
      contribution.organisationId,
      contribution.facilityId,
      contribution.productionDate,
      contribution.internalItemId,
      contribution.uom,
    ].join("|");
    const current = rows.get(key) ?? {
      quantity: 0,
      connections: new Set(),
      orders: new Set(),
      lines: new Set(),
      contributions: 0,
    };
    current.quantity += contribution.quantity;
    current.connections.add(contribution.connectionId);
    current.orders.add(contribution.orderId);
    current.lines.add(contribution.lineId);
    current.contributions += 1;
    rows.set(key, current);
  }

  return [...rows.values()].map((row) => ({
    quantity: row.quantity,
    connectionCount: row.connections.size,
    orderCount: row.orders.size,
    lineCount: row.lines.size,
    contributionCount: row.contributions,
  }));
}

function issueFingerprint(evidence) {
  return sha256(
    [
      evidence.sourceLineId,
      evidence.projectionVersion,
      evidence.currentQuantity,
      evidence.lifecycle,
      evidence.connectionState,
      evidence.classification,
      evidence.category,
      evidence.mappingId ?? "",
      evidence.mappingVersion ?? "",
      evidence.interpretationId ?? "",
      evidence.interpretationRevision ?? "",
      evidence.facilityId ?? "",
      evidence.productionDate ?? "",
      evidence.refundState ?? "",
      "production-demand-v1",
    ].join("|"),
  );
}

function reconcileIssue(current, evidence, nextId, nextCreatedAt) {
  const fingerprint = issueFingerprint(evidence);

  if (current?.fingerprint === fingerprint) {
    return { current, history: [], issuesCreated: 0, issuesRetained: 1 };
  }

  return {
    current: { id: nextId, createdAt: nextCreatedAt, fingerprint },
    history: current ? [{ ...current, status: "resolved" }] : [],
    issuesCreated: 1,
    issuesRetained: 0,
  };
}

test("Migration 052 is the only correction and Migrations 045 through 051 remain immutable", () => {
  const expected = {
    45: "8f7679d2eeab8fabc0f2e13fb69ec133bf103e817de3da65c7209e624d7c3aba",
    46: "ac28056b56d30cc9504eecd6c83f71c03fadbd1169cd785643c93a0a623b0b79",
    47: "cf28720d98bfc08b5b6ad06da9e5501bc558548cee1b532918eebfc7dc27e855",
    48: "51f31ab3b079853994ff1026759e1eb509d21d330c70a37c640a84213591a26b",
    49: "b1f17b57dc3fb29b0f91503c1985f680e4386732be3c9eced13da4be9a2d4583",
    50: "864d1f72368a914d31e5d5d714f3fdd7bc652de02f382ae0bbbf65e2ad9df816",
  };

  for (const [number, source] of Object.entries(priorMigrations)) {
    assert.equal(sha256(source), expected[number]);
  }

  const migrations = readdirSync(migrationsDirectory);
  assert.equal(migrations.filter((name) => name.startsWith("051_")).length, 1);
  assert.equal(sha256(migration051), "388504209314465b3e9b5774cd57480492d4f087944dcda1603e5e49a1621cd4");
  assert.equal(migrations.filter((name) => name.startsWith("052_")).length, 1);
  assert.equal(migrations.filter((name) => name.startsWith("053_")).length, 1);
  assert.match(migration051, /^begin;/);
  assert.match(migration051, /commit;\s*$/);
  assert.match(migration052, /^begin;/);
  assert.match(migration052, /commit;\s*$/);
});

test("Migration 052 only schema-qualifies the two internal fingerprint digest calls", () => {
  const functionPattern = /create or replace function public\.production_generate_source_line\([\s\S]*?\n\$\$;/;
  const function051 = migration051.match(functionPattern)?.[0];
  const function052 = migration052.match(functionPattern)?.[0];

  assert.ok(function051);
  assert.ok(function052);
  assert.equal((migration052.match(/create or replace function/g) ?? []).length, 1);
  assert.equal((migration052.match(/extensions\.digest\(/g) ?? []).length, 2);
  assert.equal((migration052.match(/(?:^|[^.])\bdigest\(/gm) ?? []).length, 0);
  assert.equal(function052.replaceAll("extensions.digest(", "digest("), function051);
  assert.match(function052, /security definer/);
  assert.match(function052, /set search_path = public/);
  assert.doesNotMatch(migration052, /create extension|alter extension|set schema|extensions\s*,\s*public/i);
});

test("Migration 052 preserves the internal function ACL and leaves external RPC ACLs untouched", () => {
  assert.match(
    migration052,
    /revoke all on function public\.production_generate_source_line\(uuid, uuid\)\s+from public, anon, authenticated, service_role;/,
  );
  assert.doesNotMatch(
    migration052,
    /grant execute on function public\.production_generate_source_line\(uuid, uuid\)/,
  );
  assert.doesNotMatch(
    migration052,
    /(recalculate_production_demand_for_source_line|recalculate_production_demand_for_source_order|recalculate_production_demand_for_source_order_worker)/,
  );
});

test("Migration 052 changes no schema, policy, grant, downstream data or frozen-demand boundary", () => {
  assert.doesNotMatch(migration052, /create table|alter table|create policy|drop policy|enable row level security/i);
  assert.doesNotMatch(migration052, /grant\s+/i);
  assert.doesNotMatch(migration052, /insert into public\.(permissions|role_permissions)/i);
  assert.doesNotMatch(migration052, /(insert into|update|delete from) public\.(production_plans|production_plan_lines|production_batches|production_tasks|inventory_|stock_movements|qa_|logistics_)/i);
  assert.doesNotMatch(migration052, /create table public\.production_demand_(frozen|snapshot)/i);
});

test("four tenant Production Demand tables use RLS and SELECT-only authenticated access", () => {
  const tables = [
    "production_demand_generation_runs",
    "production_demand_contributions",
    "production_demand_generation_issues",
    "production_live_demand",
  ];

  for (const table of tables) {
    assert.match(migration051, new RegExp(`create table public\\.${table}`));
    assert.match(migration051, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(migration051, new RegExp(`revoke all on table public\\.${table}\\s+from public, anon, authenticated, service_role;`));
    assert.match(migration051, new RegExp(`grant select on table public\\.${table} to authenticated;`));
  }

  assert.equal((migration051.match(/for select\s+to authenticated/g) ?? []).length, 4);
  assert.doesNotMatch(migration051, /create policy[\s\S]{0,180}for (insert|update|delete)/i);
  assert.doesNotMatch(migration051, /grant (insert|update|delete|all) on table public\.production_/i);
  assert.doesNotMatch(migration051, /is_platform_admin\(\)/);
});

test("same-tenant lineage is enforced for source, mapping, interpretation, facility and item", () => {
  for (const constraint of [
    "production_demand_contributions_connection_fk",
    "production_demand_contributions_order_fk",
    "production_demand_contributions_line_fk",
    "production_demand_contributions_mapping_fk",
    "production_demand_contributions_output_fk",
    "production_demand_contributions_interpretation_fk",
    "production_demand_contributions_internal_item_fk",
    "production_demand_contributions_facility_fk",
    "production_live_demand_facility_fk",
    "production_live_demand_internal_item_fk",
  ]) {
    assert.match(migration051, new RegExp(constraint));
  }
  assert.match(migration051, /foreign key \(organisation_id, source_order_line_id, source_order_id, connection_id\)/);
  assert.match(migration051, /foreign key \(organisation_id, mapping_output_id, mapping_id\)/);
  assert.match(migration051, /foreign key \(organisation_id, facility_id\)/);
});

test("contributions and issues are append-oriented and current interpretations are unique", () => {
  assert.match(migration051, /production_demand_contributions_one_active_item_idx[\s\S]*where status = 'active'/);
  assert.match(migration051, /production_demand_generation_issues_one_current_idx[\s\S]*where status = 'current'/);
  assert.match(migration051, /Production Demand contributions are append-oriented/);
  assert.match(migration051, /Production Demand issues are append-oriented/);
  assert.match(migration051, /Production Demand history cannot be deleted/);
  assert.equal((migration051.match(/before delete on public\.production_/g) ?? []).length, 4);
  assert.match(migration051, /production_demand_generation_issues_fingerprint_check[\s\S]*input_fingerprint ~ '\^\[0-9a-f\]\{64\}\$'/);
});

test("unchanged issue evidence retains its ID, fingerprint and created timestamp", () => {
  const evidence = {
    sourceLineId: "line-1",
    projectionVersion: 1,
    currentQuantity: 10,
    lifecycle: "active",
    connectionState: "active",
    classification: "blocked",
    category: "mapping_missing",
  };
  const first = reconcileIssue(null, evidence, "issue-1", "2026-08-06T01:00:00Z");
  const second = reconcileIssue(
    first.current,
    evidence,
    "issue-2",
    "2026-08-06T02:00:00Z",
  );

  assert.equal(first.issuesCreated, 1);
  assert.equal(second.issuesRetained, 1);
  assert.equal(second.issuesCreated, 0);
  assert.deepEqual(second.current, first.current);
  assert.equal(second.history.length, 0);
  assert.match(second.current.fingerprint, /^[0-9a-f]{64}$/);
});

test("meaningful blocker, exclusion and eligibility inputs replace issue evidence", () => {
  const base = {
    sourceLineId: "line-1",
    projectionVersion: 1,
    currentQuantity: 10,
    lifecycle: "active",
    connectionState: "active",
    classification: "blocked",
    category: "mapping_missing",
  };
  const first = reconcileIssue(null, base, "issue-1", "2026-08-06T01:00:00Z");

  for (const change of [
    { category: "mapping_pending", mappingId: "mapping-1", mappingVersion: 1 },
    { category: "delivery_interpretation_blocked", interpretationId: "delivery-1", interpretationRevision: 2 },
    { category: "facility_inactive", facilityId: "facility-1", productionDate: "2026-08-10" },
    { projectionVersion: 2, currentQuantity: 8 },
    { connectionState: "paused" },
    { refundState: "partial" },
    { classification: "excluded", category: "mapping_excluded", mappingId: "mapping-2", mappingVersion: 3 },
  ]) {
    const next = reconcileIssue(
      first.current,
      { ...base, ...change },
      "issue-next",
      "2026-08-06T02:00:00Z",
    );
    assert.notEqual(next.current.fingerprint, first.current.fingerprint);
    assert.equal(next.issuesCreated, 1);
    assert.equal(next.issuesRetained, 0);
    assert.equal(next.history.length, 1);
  }
});

test("issue SQL locks current evidence, retains matching fingerprints and replaces changed evidence", () => {
  assert.match(migration051, /select issue\.\*[\s\S]*into v_current_issue[\s\S]*status = 'current'[\s\S]*for update;/);
  assert.match(migration051, /if found and v_current_issue\.input_fingerprint = v_issue_fingerprint then[\s\S]*v_issues_retained := 1;/);
  assert.match(migration051, /else[\s\S]*resolved_by_generation_run_id = v_run\.id[\s\S]*insert into public\.production_demand_generation_issues[\s\S]*v_issue_fingerprint[\s\S]*v_issues_created := 1;/);
  assert.match(migration051, /update public\.production_demand_generation_issues issue[\s\S]*status = 'resolved'[\s\S]*where issue\.organisation_id = v_source\.organisation_id[\s\S]*issue\.status = 'current';[\s\S]*update public\.production_demand_contributions/);
});

test("issue fingerprint uses meaningful evidence but excludes run and clock values", () => {
  const start = migration051.indexOf("v_issue_fingerprint := encode");
  const end = migration051.indexOf("update public.production_demand_contributions contribution", start);
  const fingerprintSql = migration051.slice(start, end);

  for (const field of [
    "source_order_line_id",
    "source_projection_version",
    "current_quantity",
    "cancelled_quantity",
    "refunded_quantity",
    "source_lifecycle_status",
    "order_cancelled",
    "order_refund",
    "connection_business",
    "classification",
    "issue_category",
    "provider_variant_id",
    "mapping_id",
    "mapping_version",
    "mapping_kind",
    "mapping_outputs",
    "interpretation_id",
    "interpretation_revision",
    "interpretation_status",
    "delivery_date",
    "production_date",
    "facility_id",
    "generator_version",
  ]) {
    assert.match(fingerprintSql, new RegExp(field));
  }

  assert.doesNotMatch(fingerprintSql, /generation_run_id|v_run\.id|now\(\)|current_timestamp|requested_by_profile_id/);
});

test("generation runs distinguish issue line outcomes, created records and retained records", () => {
  assert.match(migration051, /issues_created integer not null default 0/);
  assert.match(migration051, /issues_retained integer not null default 0/);
  assert.match(migration051, /'issues_created', v_issues_created/);
  assert.match(migration051, /'issues_retained', v_issues_retained/);
  assert.match(migration051, /v_issues_created := v_issues_created \+ coalesce\(\(v_result ->> 'issues_created'\)::integer, 0\)/);
  assert.match(migration051, /v_issues_retained := v_issues_retained \+ coalesce\(\(v_result ->> 'issues_retained'\)::integer, 0\)/);
  assert.equal((migration051.match(/issues_created = \(v_result ->> 'issues_created'\)::integer/g) ?? []).length, 3);
  assert.equal((migration051.match(/issues_retained = \(v_result ->> 'issues_retained'\)::integer/g) ?? []).length, 3);
  assert.match(demandData, /issues_created,issues_retained/);
  assert.match(demandPage, /issue records created/);
  assert.match(demandPage, /unchanged issue records retained/);
});

test("tenant recalculation boundaries derive source values and require production.manage", () => {
  for (const signature of [
    "recalculate_production_demand_for_source_line(uuid)",
    "recalculate_production_demand_for_source_order(uuid)",
  ]) {
    const escaped = signature.replace(/[().]/g, "\\$&");
    assert.match(migration051, new RegExp(`revoke all on function public\\.${escaped}\\s+from public, anon, authenticated, service_role;`));
    assert.match(migration051, new RegExp(`grant execute on function public\\.${escaped}\\s+to authenticated;`));
  }

  assert.match(migration051, /production_demand_require_permission[\s\S]*is_active_member[\s\S]*has_permission/);
  assert.match(migration051, /'production\.manage'/);
  assert.doesNotMatch(migration051, /requested_(contribution_)?quantity|target_quantity/);
  assert.equal((migration051.match(/set search_path = public/g) ?? []).length, 12);
  assert.doesNotMatch(migration051, /execute\s+format\s*\(/i);
});

test("worker access is isolated to one order hook and tenant UI never uses service role", () => {
  assert.match(migration051, /coalesce\(auth\.jwt\(\) ->> 'role', ''\) <> 'service_role'/);
  assert.doesNotMatch(migration051, /auth\.role\(\)/);
  assert.match(migration051, /grant execute on function public\.recalculate_production_demand_for_source_order_worker\(uuid\)\s+to service_role/);
  assert.doesNotMatch(`${demandData}\n${demandPage}`, /service[_-]?role/i);
});

test("direct, bundle and one-output pack quantities expand exactly", () => {
  assert.deepEqual(
    expand(12, {
      kind: "direct",
      outputs: [{ internalItemId: "meal", multiplier: 1, uom: "each" }],
    }),
    [{ internalItemId: "meal", quantity: 12, uom: "each" }],
  );
  assert.deepEqual(
    expand(10, {
      kind: "bundle",
      outputs: [
        { internalItemId: "a", multiplier: 2, uom: "each" },
        { internalItemId: "b", multiplier: 3, uom: "each" },
        { internalItemId: "c", multiplier: 1, uom: "each" },
      ],
    }).map((row) => row.quantity),
    [20, 30, 10],
  );
  assert.equal(
    expand(4, {
      kind: "bundle",
      outputs: [{ internalItemId: "tray", multiplier: 6, uom: "each" }],
    })[0].quantity,
    24,
  );
});

test("approved exclusions create no contribution and remain resolved evidence", () => {
  assert.deepEqual(expand(10, { kind: "exclusion", outputs: [] }), []);
  assert.match(migration051, /v_issue_classification := 'excluded'[\s\S]*v_issue_category := 'mapping_excluded'/);
  assert.match(migration051, /if v_issue_classification = 'excluded'[\s\S]*v_exclusions := 1/);
});

test("eligibility records safe explicit blockers instead of silently skipping", () => {
  for (const category of [
    "mapping_missing",
    "mapping_pending",
    "mapping_invalid",
    "delivery_interpretation_missing",
    "delivery_interpretation_blocked",
    "facility_missing",
    "facility_inactive",
    "source_quantity_invalid",
    "source_line_removed",
    "source_order_cancelled",
    "internal_item_inactive",
    "uom_mismatch",
    "connection_not_eligible",
    "ambiguous_source_state",
  ]) {
    assert.match(migration051, new RegExp(`'${category}'`));
  }
  assert.match(migration051, /insert into public\.production_demand_generation_issues/);
});

test("current quantity is used once and refund ambiguity is blocked rather than guessed", () => {
  assert.match(migration051, /v_source\.current_quantity \* v_output\.quantity_multiplier/);
  assert.match(migration051, /Canonical Commerce current_quantity snapshot/);
  assert.doesNotMatch(migration051, /original_quantity\s*-\s*cancelled_quantity/);
  assert.doesNotMatch(migration051, /current_quantity\s*-\s*refunded_quantity/);
  assert.match(migration051, /refunded_quantity > 0[\s\S]*ambiguous_source_state/);
  assert.match(migration051, /current_projection_version/);
});

test("fingerprinting and supersession keep unchanged regeneration idempotent", () => {
  assert.match(migration051, /input_fingerprint ~ '\^\[0-9a-f\]\{64\}\$'/);
  assert.match(migration051, /digest\(concat_ws\('\|'/);
  assert.match(migration051, /v_current_contribution\.input_fingerprint = v_fingerprint[\s\S]*v_retained := v_retained \+ 1/);
  assert.match(migration051, /status = 'superseded'[\s\S]*superseded_by_generation_run_id = v_run\.id/);
});

test("live demand aggregates exact dimensions and excludes superseded contributions", () => {
  const base = {
    organisationId: "org",
    facilityId: "facility-a",
    productionDate: "2026-08-10",
    internalItemId: "meal",
    uom: "each",
    status: "active",
  };
  const rows = aggregate([
    { ...base, connectionId: "cea", orderId: "o1", lineId: "l1", quantity: 120 },
    { ...base, connectionId: "cew", orderId: "o2", lineId: "l2", quantity: 40 },
    { ...base, connectionId: "made-active", orderId: "o3", lineId: "l3", quantity: 25 },
    { ...base, connectionId: "old", orderId: "o4", lineId: "l4", quantity: 999, status: "superseded" },
  ]);
  assert.deepEqual(rows, [{ quantity: 185, connectionCount: 3, orderCount: 3, lineCount: 3, contributionCount: 3 }]);
  assert.match(migration051, /facility_id,[\s\S]*production_date,[\s\S]*internal_item_id,[\s\S]*output_uom/);
  assert.match(migration051, /contribution\.status = 'active'/);
});

test("facility, production date and UOM remain separate aggregate keys", () => {
  const rows = aggregate([
    { organisationId: "org", facilityId: "a", productionDate: "2026-08-10", internalItemId: "meal", uom: "each", status: "active", connectionId: "c", orderId: "o1", lineId: "l1", quantity: 1 },
    { organisationId: "org", facilityId: "b", productionDate: "2026-08-10", internalItemId: "meal", uom: "each", status: "active", connectionId: "c", orderId: "o2", lineId: "l2", quantity: 1 },
    { organisationId: "org", facilityId: "a", productionDate: "2026-08-11", internalItemId: "meal", uom: "each", status: "active", connectionId: "c", orderId: "o3", lineId: "l3", quantity: 1 },
    { organisationId: "org", facilityId: "a", productionDate: "2026-08-10", internalItemId: "meal", uom: "kg", status: "active", connectionId: "c", orderId: "o4", lineId: "l4", quantity: 1 },
  ]);
  assert.equal(rows.length, 4);
  assert.match(migration051, /production_live_demand_key_unique/);
});

test("Production Demand UI keeps live demand truthful while Task 237 adds server-controlled review capture", () => {
  assert.match(demandData, /requirePermissionAccessWithPermissions\("production\.view"\)/);
  assert.match(demandData, /Confirm Migrations 051-053 are applied/);
  assert.match(demandPage, /No live Production Demand/);
  assert.match(demandPage, /No demand rows have been fabricated/);
  assert.match(demandPage, /Demand review and freeze/);
  assert.match(demandPage, /Capture review/);
  assert.doesNotMatch(demandPage, /name="(quantity|frozen_quantity|delta_quantity)"|Create production plan/i);
  assert.doesNotMatch(`${demandData}\n${demandPage}`, /access_token|refresh_token|ciphertext|raw_(payload|webhook)|customer_(name|email|phone)|shipping_address/i);
  assert.match(navigation, /label: "Production Demand"[\s\S]*href: "\/production-demand"[\s\S]*requiredPermission: "production\.view"/);
  assert.match(pageTitles, /"\/production-demand": \{ title: "Production Demand", context: "Production" \}/);
});

test("Migration 051 neither seeds data nor mutates plans, batches, inventory, QA or prior domains", () => {
  const schemaBeforeFunctions = migration051.slice(
    0,
    migration051.indexOf("-- Lifecycle protection"),
  );
  assert.doesNotMatch(schemaBeforeFunctions, /insert into public\./i);
  assert.doesNotMatch(migration051, /(insert into|update|delete from) public\.(production_plans|production_plan_lines|production_batches|production_tasks|inventory_|stock_movements|qa_|logistics_)/i);
  assert.doesNotMatch(migration051, /create table public\.production_demand_(frozen|snapshot)/i);
  assert.doesNotMatch(migration051, /insert into public\.(permissions|role_permissions)/i);
  assert.doesNotMatch(`${demandData}\n${demandPage}`, /stock-on-hand|stock_movements|inventory_reserv/i);
});
