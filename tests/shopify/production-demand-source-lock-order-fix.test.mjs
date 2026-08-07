import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migration051 = readFileSync(new URL("051_production_demand_contribution_foundation.sql", migrationsDirectory), "utf8");
const migration052 = readFileSync(new URL("052_production_demand_digest_schema_fix.sql", migrationsDirectory), "utf8");
const migration053 = readFileSync(new URL("053_production_demand_review_freeze_delta_workflow.sql", migrationsDirectory), "utf8");
const migration054 = readFileSync(new URL("054_production_demand_source_lock_order_fix.sql", migrationsDirectory), "utf8");

const freezeInvalid = `  for v_source_line_id in
    select distinct evidence.source_order_line_id
    from public.production_demand_review_contributions evidence
    where evidence.organisation_id = v_review.organisation_id
      and evidence.review_id = v_review.id
    order by evidence.source_order_line_id::text
  loop`;
const freezeCorrected = `  for v_source_line_id in
    select ordered.source_order_line_id
    from (
      select distinct evidence.source_order_line_id
      from public.production_demand_review_contributions evidence
      where evidence.organisation_id = v_review.organisation_id
        and evidence.review_id = v_review.id
    ) ordered
    order by ordered.source_order_line_id::text
  loop`;
const approvalInvalid = `  for v_source_line_id in
    select distinct evidence.source_order_line_id
    from public.production_demand_delta_contributions evidence
    where evidence.organisation_id = v_delta.organisation_id
      and evidence.delta_version_id = v_delta.id
      and evidence.current_contribution_id is not null
    order by evidence.source_order_line_id::text
  loop`;
const approvalCorrected = `  for v_source_line_id in
    select ordered.source_order_line_id
    from (
      select distinct evidence.source_order_line_id
      from public.production_demand_delta_contributions evidence
      where evidence.organisation_id = v_delta.organisation_id
        and evidence.delta_version_id = v_delta.id
        and evidence.current_contribution_id is not null
    ) ordered
    order by ordered.source_order_line_id::text
  loop`;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function functionDefinition(source, name) {
  return source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`))?.[0] ?? "";
}

test("Migration 054 remains the unique source-lock correction beside Migration 055", () => {
  const migrations = readdirSync(migrationsDirectory);
  assert.deepEqual(migrations.filter((name) => name.startsWith("054_")), ["054_production_demand_source_lock_order_fix.sql"]);
  assert.deepEqual(migrations.filter((name) => name.startsWith("055_")), ["055_production_demand_frozen_owner_uuid_fix.sql"]);
  assert.deepEqual(migrations.filter((name) => name.startsWith("056_")), [
    "056_production_data_staging_parser_foundation.sql",
  ]);
  assert.match(migration054, /^begin;/);
  assert.match(migration054, /commit;\s*$/);
});

test("Migrations 051 through 054 remain exact immutable artifacts", () => {
  assert.equal(sha256(migration051), "388504209314465b3e9b5774cd57480492d4f087944dcda1603e5e49a1621cd4");
  assert.equal(sha256(migration052), "39952e96feb877c214f5b6503639038351899246c30a419189157ac9d35c57dd");
  assert.equal(sha256(migration053), "6b6625a82ca309bba2b5f86071654607524ffb00781de0a4a3e5e3d49a3b8a2c");
  assert.equal(sha256(migration054), "b4a1537a45153f481bfc9d2618fe114ee48e7ba8363e35f187aaad528a315b0d");
});

test("Migration 054 replaces exactly freeze and delta approval", () => {
  const replaced = [...migration054.matchAll(/create or replace function public\.([a-z0-9_]+)\(/g)].map((match) => match[1]);
  assert.deepEqual(replaced, ["freeze_production_demand_review", "approve_production_demand_delta"]);
});

test("corrected functions differ from Migration 053 only at the DISTINCT ordering query", () => {
  const freeze053 = functionDefinition(migration053, "freeze_production_demand_review");
  const freeze054 = functionDefinition(migration054, "freeze_production_demand_review");
  const approval053 = functionDefinition(migration053, "approve_production_demand_delta");
  const approval054 = functionDefinition(migration054, "approve_production_demand_delta");
  assert.equal(freeze054.replace(freezeCorrected, freezeInvalid), freeze053);
  assert.equal(approval054.replace(approvalCorrected, approvalInvalid), approval053);
});

test("freeze and approval use one deterministic distinct source-line ordering contract", () => {
  const freeze = functionDefinition(migration054, "freeze_production_demand_review");
  const approval = functionDefinition(migration054, "approve_production_demand_delta");
  assert.match(freeze, /select ordered\.source_order_line_id[\s\S]*select distinct evidence\.source_order_line_id[\s\S]*\) ordered\s+order by ordered\.source_order_line_id::text/);
  assert.match(approval, /select ordered\.source_order_line_id[\s\S]*select distinct evidence\.source_order_line_id[\s\S]*\) ordered\s+order by ordered\.source_order_line_id::text/);
  assert.doesNotMatch(freeze, /select distinct evidence\.source_order_line_id[\s\S]*order by evidence\.source_order_line_id::text/);
  assert.doesNotMatch(approval, /select distinct evidence\.source_order_line_id[\s\S]*order by evidence\.source_order_line_id::text/);
});

test("effective Task 237 functions contain no same-level DISTINCT cast ordering defect", () => {
  const effective = migration053
    .replace(functionDefinition(migration053, "freeze_production_demand_review"), functionDefinition(migration054, "freeze_production_demand_review"))
    .replace(functionDefinition(migration053, "approve_production_demand_delta"), functionDefinition(migration054, "approve_production_demand_delta"));
  const definitions = [...effective.matchAll(/create or replace function public\.[a-z0-9_]+\([\s\S]*?\n\$\$;/g)].map((match) => match[0]);
  const invalidPattern = /select distinct\s+([a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*)[\s\S]*?order by\s+\1::text/i;
  for (const definition of definitions) assert.doesNotMatch(definition, invalidPattern);
});

test("organisation barrier and deterministic lock hierarchy are preserved", () => {
  for (const name of ["freeze_production_demand_review", "approve_production_demand_delta"]) {
    const definition = functionDefinition(migration054, name);
    const permission = definition.indexOf("production_demand_require_permission");
    const evidenceBarrier = definition.indexOf("production_demand_lock_evidence_organisation");
    const reviewLock = definition.indexOf("for update");
    const orderedSourceLock = definition.indexOf("order by ordered.source_order_line_id::text");
    assert.ok(permission >= 0 && permission < evidenceBarrier);
    assert.ok(evidenceBarrier < reviewLock);
    assert.ok(reviewLock < orderedSourceLock);
  }
  assert.doesNotMatch(migration054, /lock table/i);
});

test("freeze and approval retain authenticated-only fixed-path definer ACLs", () => {
  for (const name of ["freeze_production_demand_review", "approve_production_demand_delta"]) {
    const definition = functionDefinition(migration054, name);
    assert.match(definition, /security definer/);
    assert.match(definition, /set search_path = public/);
    assert.match(definition, /public\.is_active_member/);
    assert.match(definition, /'production\.manage'/);
    assert.match(migration054, new RegExp(`revoke all on function public\\.${name}\\([\\s\\S]*?from public, anon, authenticated, service_role`));
    assert.match(migration054, new RegExp(`grant execute on function public\\.${name}\\([\\s\\S]*?to authenticated`));
  }
  assert.doesNotMatch(migration054, /execute\s+format|execute\s+immediate|\bexecute\s+v_/i);
});

test("Migration 054 contains no schema, RLS, policy, role or downstream-domain change", () => {
  assert.doesNotMatch(migration054, /\b(create|alter|drop)\s+table\b/i);
  assert.doesNotMatch(migration054, /create\s+(?:unique\s+)?index|create\s+policy|alter\s+table[\s\S]*row level security/i);
  assert.doesNotMatch(migration054, /grant\s+(?:select|insert|update|delete|all)\s+on\s+table|insert into public\.(permissions|role_permissions)/i);
  assert.doesNotMatch(migration054, /insert into public\.(production_plans|production_plan_lines|production_batches|production_tasks|inventory_|stock_movements|commerce_|shopify_)/i);
  assert.doesNotMatch(migration054, /update public\.(production_plans|production_plan_lines|production_batches|production_tasks|inventory_|stock_movements|commerce_|shopify_)/i);
  assert.doesNotMatch(migration054, /unfreeze|auto(?:matic)?[_ -]?approve/i);
});
