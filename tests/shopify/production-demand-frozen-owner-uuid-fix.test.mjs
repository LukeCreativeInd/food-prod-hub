import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migration051 = readFileSync(new URL("051_production_demand_contribution_foundation.sql", migrationsDirectory), "utf8");
const migration052 = readFileSync(new URL("052_production_demand_digest_schema_fix.sql", migrationsDirectory), "utf8");
const migration053 = readFileSync(new URL("053_production_demand_review_freeze_delta_workflow.sql", migrationsDirectory), "utf8");
const migration054 = readFileSync(new URL("054_production_demand_source_lock_order_fix.sql", migrationsDirectory), "utf8");
const migration055 = readFileSync(new URL("055_production_demand_frozen_owner_uuid_fix.sql", migrationsDirectory), "utf8");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function functionDefinition(source, name) {
  return source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`))?.[0] ?? "";
}

function ownershipInsert(source) {
  return source.match(/insert into public\.production_demand_commitment_source_owners \([\s\S]*?order by evidence\.source_order_line_id;/)?.[0] ?? "";
}

test("Migration 055 is the only UUID correction and Migration 056 is absent", () => {
  const migrations = readdirSync(migrationsDirectory);
  assert.deepEqual(migrations.filter((name) => name.startsWith("055_")), ["055_production_demand_frozen_owner_uuid_fix.sql"]);
  assert.equal(migrations.some((name) => name.startsWith("056_")), false);
  assert.match(migration055, /^begin;/);
  assert.match(migration055, /commit;\s*$/);
});

test("Migrations 051 through 054 retain their exact immutable fingerprints", () => {
  assert.equal(sha256(migration051), "388504209314465b3e9b5774cd57480492d4f087944dcda1603e5e49a1621cd4");
  assert.equal(sha256(migration052), "39952e96feb877c214f5b6503639038351899246c30a419189157ac9d35c57dd");
  assert.equal(sha256(migration053), "6b6625a82ca309bba2b5f86071654607524ffb00781de0a4a3e5e3d49a3b8a2c");
  assert.equal(sha256(migration054), "b4a1537a45153f481bfc9d2618fe114ee48e7ba8363e35f187aaad528a315b0d");
});

test("Migration 055 replaces only the complete freeze function", () => {
  const replaced = [...migration055.matchAll(/create or replace function public\.([a-z0-9_]+)\(/g)].map((match) => match[1]);
  assert.deepEqual(replaced, ["freeze_production_demand_review"]);
  assert.doesNotMatch(migration055, /create or replace function public\.approve_production_demand_delta/);
});

test("freeze differs from Migration 054 only by the explicit UUID cast", () => {
  const freeze054 = functionDefinition(migration054, "freeze_production_demand_review");
  const freeze055 = functionDefinition(migration055, "freeze_production_demand_review");
  assert.equal(freeze055.replace("null::uuid", "null"), freeze054);
  assert.equal((freeze055.match(/null::uuid/g) ?? []).length, 1);
});

test("frozen-base ownership lineage is explicitly typed and no bare NULL remains", () => {
  const insert = ownershipInsert(migration055);
  assert.match(insert, /'frozen_base',\s+null::uuid,\s+v_profile_id/);
  assert.doesNotMatch(insert, /'frozen_base',\s+null,/);
  assert.match(migration053, /'frozen_base',\s+null,\s+v_profile_id/);
  assert.match(migration054, /'frozen_base',\s+null,\s+v_profile_id/);
});

test("typed-NULL source contract covers the nullable UUID destination", () => {
  const executableSql = migration055.replace(/--.*$/gm, "");
  assert.match(migration053, /first_approved_delta_version_id uuid null/);
  assert.match(ownershipInsert(migration055), /first_approved_delta_version_id,[\s\S]*'frozen_base',\s+null::uuid/);
  assert.doesNotMatch(executableSql, /\bnull\s+as\b|\bthen\s+null\b|\belse\s+null\b/i);
});

test("evidence barrier, deterministic source locks and frozen ownership remain intact", () => {
  const freeze = functionDefinition(migration055, "freeze_production_demand_review");
  const permission = freeze.indexOf("production_demand_require_permission");
  const evidenceBarrier = freeze.indexOf("production_demand_lock_evidence_organisation");
  const reviewLock = freeze.indexOf("for update");
  const sourceLock = freeze.indexOf("order by ordered.source_order_line_id::text");
  const ownership = freeze.indexOf("'frozen_base'");
  assert.ok(permission >= 0 && permission < evidenceBarrier);
  assert.ok(evidenceBarrier < reviewLock && reviewLock < sourceLock && sourceLock < ownership);
  assert.match(freeze, /select ordered\.source_order_line_id[\s\S]*select distinct evidence\.source_order_line_id[\s\S]*order by ordered\.source_order_line_id::text/);
});

test("freeze retains authenticated-only fixed-path SECURITY DEFINER ACLs", () => {
  const freeze = functionDefinition(migration055, "freeze_production_demand_review");
  assert.match(freeze, /security definer/);
  assert.match(freeze, /set search_path = public/);
  assert.match(freeze, /public\.is_active_member/);
  assert.match(freeze, /'production\.manage'/);
  assert.match(migration055, /revoke all on function public\.freeze_production_demand_review\(uuid, text\)[\s\S]*from public, anon, authenticated, service_role/);
  assert.match(migration055, /grant execute on function public\.freeze_production_demand_review\(uuid, text\)[\s\S]*to authenticated/);
  assert.doesNotMatch(migration055, /execute\s+format|execute\s+immediate|\bexecute\s+v_/i);
});

test("Migration 055 contains no schema, RLS, policy, role or downstream change", () => {
  assert.doesNotMatch(migration055, /\b(create|alter|drop)\s+table\b/i);
  assert.doesNotMatch(migration055, /create\s+(?:unique\s+)?index|create\s+policy|alter\s+table[\s\S]*row level security/i);
  assert.doesNotMatch(migration055, /grant\s+(?:select|insert|update|delete|all)\s+on\s+table|insert into public\.(permissions|role_permissions)/i);
  assert.doesNotMatch(migration055, /insert into public\.(production_plans|production_plan_lines|production_batches|production_tasks|inventory_|stock_movements|commerce_|shopify_)/i);
  assert.doesNotMatch(migration055, /update public\.(production_plans|production_plan_lines|production_batches|production_tasks|inventory_|stock_movements|commerce_|shopify_)/i);
  assert.doesNotMatch(migration055, /unfreeze|auto(?:matic)?[_ -]?approve/i);
});
