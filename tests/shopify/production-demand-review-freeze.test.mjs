import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migration051 = readFileSync(new URL("051_production_demand_contribution_foundation.sql", migrationsDirectory), "utf8");
const migration052 = readFileSync(new URL("052_production_demand_digest_schema_fix.sql", migrationsDirectory), "utf8");
const migration053 = readFileSync(new URL("053_production_demand_review_freeze_delta_workflow.sql", migrationsDirectory), "utf8");
const actions = readFileSync(new URL("../../app/production-demand/actions.ts", import.meta.url), "utf8");
const reviewPage = readFileSync(new URL("../../app/production-demand/reviews/[reviewId]/page.tsx", import.meta.url), "utf8");
const deltaPage = readFileSync(new URL("../../app/production-demand/reviews/[reviewId]/deltas/[deltaVersionId]/page.tsx", import.meta.url), "utf8");
const dataHelper = readFileSync(new URL("../../lib/production-demand-review-data.ts", import.meta.url), "utf8");
const appModeRouting = readFileSync(new URL("../../lib/app-mode-routing.ts", import.meta.url), "utf8");

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }

function cumulativeEffective(base, versions) {
  const approved = versions.find((version) => version.status === "approved");
  return base + (approved?.delta ?? 0);
}

function sourceDiff(frozen, current) {
  const keys = new Set([...frozen.keys(), ...current.keys()]);
  return [...keys].flatMap((key) => {
    const before = frozen.get(key) ?? 0;
    const after = current.get(key) ?? 0;
    return before === after ? [] : [{ key, before, after, delta: after - before }];
  });
}

function functionDefinition(name) {
  return migration053.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`))?.[0] ?? "";
}

test("Migration 053 remains transactional and unique beside corrective Migrations 054 and 055", () => {
  const migrations = readdirSync(migrationsDirectory);
  assert.equal(migrations.filter((name) => name.startsWith("053_")).length, 1);
  assert.equal(migrations.filter((name) => name.startsWith("054_")).length, 1);
  assert.equal(migrations.filter((name) => name.startsWith("055_")).length, 1);
  assert.equal(migrations.some((name) => name.startsWith("056_")), false);
  assert.match(migration053, /^begin;/);
  assert.match(migration053, /commit;\s*$/);
});

test("Task 236 migration fingerprints remain immutable", () => {
  assert.equal(sha256(migration051), "388504209314465b3e9b5774cd57480492d4f087944dcda1603e5e49a1621cd4");
  assert.equal(sha256(migration052), "39952e96feb877c214f5b6503639038351899246c30a419189157ac9d35c57dd");
});

test("Task 236 and Task 237 share one closed organisation evidence barrier", () => {
  const helper = functionDefinition("production_demand_lock_evidence_organisation");
  assert.match(helper, /security invoker/);
  assert.match(helper, /set search_path = public/);
  assert.match(helper, /hashtextextended\([\s\S]*'production-demand-evidence-v1\|' \|\| target_organisation_id::text[\s\S]*,\s*0\s*\)/);
  assert.match(migration053, /revoke all on function public\.production_demand_lock_evidence_organisation\(uuid\)[\s\S]*from public, anon, authenticated, service_role/);
  assert.doesNotMatch(migration053, /grant execute on function public\.production_demand_lock_evidence_organisation/);
  assert.doesNotMatch(migration053, /lock table public\.production_(?:demand_contributions|demand_generation_issues|live_demand)/i);
});

test("Migration 053 replaces the complete Task 236 generator behind the evidence barrier", () => {
  const generator = functionDefinition("production_generate_source_line");
  const organisationLookup = generator.indexOf("select run.organisation_id");
  const evidenceLock = generator.indexOf("production_demand_lock_evidence_organisation");
  const runLock = generator.indexOf("select run.*", evidenceLock);
  const sourceLock = generator.indexOf("for update of line, source_order, connection");
  const firstEvidenceMutation = Math.min(
    generator.indexOf("update public.production_demand_contributions"),
    generator.indexOf("update public.production_demand_generation_issues"),
  );
  assert.ok(organisationLookup >= 0 && organisationLookup < evidenceLock);
  assert.ok(evidenceLock < runLock);
  assert.ok(runLock < sourceLock);
  assert.ok(sourceLock < firstEvidenceMutation);
  assert.equal((generator.match(/extensions\.digest\(/g) ?? []).length, 2);
  assert.match(generator, /and run\.organisation_id = v_resolved_organisation_id[\s\S]*and run\.status = 'running'[\s\S]*for update/);
  assert.match(migration053, /revoke all on function public\.production_generate_source_line\(uuid, uuid\)[\s\S]*from public, anon, authenticated, service_role/);
});

test("all tenant and worker generation paths reach the locked source-line generator", () => {
  assert.match(migration051, /recalculate_production_demand_for_source_line[\s\S]*production_generate_source_line\(v_source\.id, v_run_id\)/);
  assert.match(migration051, /production_process_source_order[\s\S]*production_generate_source_line\(v_line\.id, v_run\.id\)/);
  assert.match(migration051, /recalculate_production_demand_for_source_order[\s\S]*production_process_source_order\(v_source_order\.id, v_run_id\)/);
  assert.match(migration051, /recalculate_production_demand_for_source_order_worker[\s\S]*production_process_source_order\(v_source_order\.id, v_run_id\)/);
});

test("ten review, ownership, evidence, delta and event tables are tenant owned", () => {
  const tables = [
    "production_demand_reviews",
    "production_demand_review_lines",
    "production_demand_review_contributions",
    "production_demand_review_issues",
    "production_demand_delta_versions",
    "production_demand_commitment_source_owners",
    "production_demand_review_external_commitments",
    "production_demand_delta_contributions",
    "production_demand_delta_lines",
    "production_demand_review_events",
  ];
  for (const table of tables) {
    assert.match(migration053, new RegExp(`create table public\\.${table} \\([\\s\\S]*?organisation_id uuid not null`));
    assert.match(migration053, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(migration053, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated, service_role;`));
    assert.match(migration053, new RegExp(`grant select on table public\\.${table} to authenticated;`));
  }
});

test("review scope and uniqueness are organisation, facility and production date", () => {
  assert.match(migration053, /production_demand_reviews_scope_version_unique[\s\S]*unique \(organisation_id, facility_id, production_date, version_number\)/);
  assert.match(migration053, /production_demand_reviews_one_open_scope_idx[\s\S]*where status in \('draft', 'reviewed'\)/);
  assert.match(migration053, /production_demand_reviews_one_frozen_scope_idx[\s\S]*where status = 'frozen'/);
  assert.match(migration053, /production_demand_reviews_facility_fk[\s\S]*foreign key \(organisation_id, facility_id\)/);
});

test("review capture accepts scope and note only, with server-derived arithmetic", () => {
  const signature = migration053.match(/create or replace function public\.create_production_demand_review\(([\s\S]*?)\)\nreturns jsonb/)?.[1] ?? "";
  assert.match(signature, /p_organisation_id uuid/);
  assert.match(signature, /p_facility_id uuid/);
  assert.match(signature, /p_production_date date/);
  assert.match(signature, /p_review_note text/);
  assert.doesNotMatch(signature, /quantity|fingerprint|contribution_id|source_order/);
  assert.match(migration053, /sum\(contribution\.contribution_quantity\)::numeric\(38, 12\)/);
  assert.match(migration053, /live_demand_reconciliation_failed/);
  assert.match(migration053, /no_live_demand/);
  assert.match(migration053, /no_unowned_live_demand/);
});

test("one immutable owner exists per tenant source line with same-tenant lineage", () => {
  assert.match(migration053, /production_demand_commitment_source_owners_source_unique[\s\S]*unique \(organisation_id, source_order_line_id\)/);
  assert.match(migration053, /production_demand_commitment_source_owners_line_fk[\s\S]*foreign key \(organisation_id, source_order_line_id, source_order_id, connection_id\)/);
  assert.match(migration053, /production_demand_commitment_source_owners_first_delta_fk[\s\S]*first_approved_delta_version_id[\s\S]*owner_frozen_review_id/);
  assert.match(migration053, /ownership_origin in \('frozen_base', 'approved_delta'\)/);
  assert.match(migration053, /production_demand_commitment_source_owners_reject_update_trigger/);
  assert.match(migration053, /production_demand_commitment_source_owners_reject_delete_trigger/);
});

test("review capture separates externally owned context and reconciles base plus external", () => {
  assert.match(migration053, /create table public\.production_demand_review_external_commitments/);
  assert.match(migration053, /production_demand_review_external_commitments_owner_fk[\s\S]*commitment_owner_id[\s\S]*owner_frozen_review_id/);
  assert.match(migration053, /production_demand_review_scope_capture_reconciles/);
  assert.match(migration053, /production_demand_review_contributions evidence[\s\S]*union all[\s\S]*production_demand_review_external_commitments external/);
  assert.match(reviewPage, /Externally committed demand/);
  assert.match(reviewPage, /Owner review/);
});

test("fingerprints are deterministic and all pgcrypto calls are schema-qualified", () => {
  assert.ok((migration053.match(/extensions\.digest\(/g) ?? []).length >= 3);
  assert.equal((migration053.match(/(?:^|[^.])\bdigest\(/gm) ?? []).length, 0);
  assert.match(migration053, /string_agg\(evidence_value, E'\\n' order by evidence_value\)/);
  assert.doesNotMatch(migration053, /capture_fingerprint[\s\S]{0,80}(now\(\)|gen_random_uuid)/);
});

test("scoped blockers stop freeze and exact unscoped evidence requires acknowledgement", () => {
  assert.match(migration053, /if v_scoped_blockers > 0[\s\S]*scoped_blockers_present/);
  assert.match(migration053, /acknowledged_unscoped_blocker_fingerprint is distinct from v_unscoped_fingerprint/);
  assert.match(migration053, /unscoped_blockers_require_acknowledgement/);
  assert.match(reviewPage, /does not resolve or override any blocker/i);
});

test("review transitions are bounded and frozen demand has no unfreeze path", () => {
  assert.match(migration053, /old\.status = 'draft' and new\.status in \('reviewed', 'cancelled'\)/);
  assert.match(migration053, /old\.status = 'reviewed' and new\.status in \('stale', 'frozen', 'cancelled'\)/);
  assert.match(migration053, /Frozen Production Demand cannot be changed or unfrozen/);
  assert.doesNotMatch(migration053, /create or replace function public\.[^(]*unfreeze/i);
  assert.doesNotMatch(reviewPage, /unfreeze/i);
});

test("freeze uses narrow locks, final fingerprints and a durable stale state", () => {
  assert.match(migration053, /for update;/);
  assert.match(migration053, /pg_advisory_xact_lock/);
  assert.match(migration053, /Final evidence check immediately before the irreversible transition/);
  assert.match(migration053, /set status = 'stale'[\s\S]*review_marked_stale/);
  assert.match(migration053, /p_confirmation <> 'FREEZE'/);
});

test("captured children, deltas and events reject update and delete", () => {
  for (const table of [
    "production_demand_review_lines",
    "production_demand_review_contributions",
    "production_demand_review_issues",
    "production_demand_commitment_source_owners",
    "production_demand_review_external_commitments",
    "production_demand_delta_contributions",
    "production_demand_delta_lines",
    "production_demand_review_events",
  ]) {
    assert.match(migration053, new RegExp(`${table}_reject_update_trigger`));
    assert.match(migration053, new RegExp(`${table}_reject_delete_trigger`));
  }
});

test("source differences preserve signed exact-key moves and exact UOM", () => {
  const frozen = new Map([["line-1|facility-a|2026-08-10|item-a|ea", 10]]);
  const current = new Map([["line-1|facility-b|2026-08-11|item-b|kg", 10]]);
  const differences = sourceDiff(frozen, current);
  assert.deepEqual(differences.map((row) => row.delta).sort((a, b) => a - b), [-10, 10]);
  assert.equal(differences.length, 2);
  assert.match(migration053, /full join current_state[\s\S]*source_order_line_id[\s\S]*facility_id[\s\S]*production_date[\s\S]*internal_item_id[\s\S]*output_uom[\s\S]*mapping_output_id/);
});

test("cross-review ownership excludes another review and counts moved demand once", () => {
  const ownerBySource = new Map([["line-1", "review-a"]]);
  const reviewA = [{ source: "line-1", facility: "b", quantity: 10 }].filter((row) => ownerBySource.get(row.source) === "review-a");
  const reviewB = [{ source: "line-1", facility: "b", quantity: 10 }].filter((row) => !ownerBySource.has(row.source));
  assert.equal(reviewA.reduce((sum, row) => sum + row.quantity, 0), 10);
  assert.equal(reviewB.reduce((sum, row) => sum + row.quantity, 0), 0);
  assert.match(migration053, /owner\.owner_frozen_review_id = review\.id[\s\S]*owner\.id is null/);
  assert.match(migration053, /production_demand_global_commitment_ownership_reconciles/);
});

test("freeze and approved deltas claim ownership but pending and rejected candidates do not", () => {
  const freeze = functionDefinition("freeze_production_demand_review");
  const approve = functionDefinition("approve_production_demand_delta");
  const generate = functionDefinition("generate_production_demand_delta");
  const reject = functionDefinition("reject_production_demand_delta");
  assert.match(freeze, /insert into public\.production_demand_commitment_source_owners[\s\S]*'frozen_base'/);
  assert.match(approve, /insert into public\.production_demand_commitment_source_owners[\s\S]*'approved_delta'/);
  assert.doesNotMatch(generate, /insert into public\.production_demand_commitment_source_owners/);
  assert.doesNotMatch(reject, /insert into public\.production_demand_commitment_source_owners/);
  assert.match(approve, /commitment_ownership_conflict[\s\S]*return jsonb_build_object/);
});

test("mixed-UOM deltas have no global quantity total", () => {
  const exactUom = new Map([["each", 10], ["kg", -2]]);
  assert.equal(exactUom.get("each"), 10);
  assert.equal(exactUom.get("kg"), -2);
  assert.equal(exactUom.has("global"), false);
  assert.doesNotMatch(migration053 + dataHelper + reviewPage + deltaPage, /net_delta_quantity|netDeltaQuantity|Net delta/);
  assert.match(migration053, /group by[\s\S]*evidence\.output_uom[\s\S]*having sum\(evidence\.signed_delta_quantity\) <> 0/);
});

test("evidence-sensitive mutations use the organisation-first deterministic lock order", () => {
  for (const name of [
    "create_production_demand_review",
    "mark_production_demand_review_reviewed",
    "acknowledge_production_demand_unscoped_blockers",
    "freeze_production_demand_review",
    "generate_production_demand_delta",
    "approve_production_demand_delta",
    "reject_production_demand_delta",
  ]) {
    const definition = functionDefinition(name);
    const membership = definition.indexOf("public.is_active_member");
    const permission = definition.indexOf("production_demand_require_permission");
    const evidenceLock = definition.indexOf("production_demand_lock_evidence_organisation");
    const scopeLock = definition.indexOf("pg_advisory_xact_lock", evidenceLock);
    const rowLock = definition.indexOf("for update", scopeLock);
    assert.ok(permission >= 0 && permission < evidenceLock, `${name} checks permission before the evidence barrier`);
    if (membership >= 0) assert.ok(membership < permission, `${name} resolves same-tenant context first`);
    assert.ok(evidenceLock < scopeLock, `${name} takes the evidence barrier before its scope/review advisory lock`);
    if (rowLock >= 0) assert.ok(scopeLock < rowLock, `${name} takes advisory locks before row locks`);
  }
  for (const name of ["generate_production_demand_delta", "approve_production_demand_delta", "reject_production_demand_delta"]) {
    const definition = functionDefinition(name);
    const reviewLock = definition.indexOf("for update");
    const deltaLock = definition.indexOf("order by delta.id", reviewLock);
    assert.ok(reviewLock < deltaLock, `${name} locks review before deterministic delta headers`);
  }
  assert.match(migration053, /order by evidence\.source_order_line_id::text[\s\S]*pg_advisory_xact_lock/);
});

test("delta candidates are idempotent and one pending candidate is current", () => {
  assert.match(migration053, /production_demand_delta_versions_one_pending_idx[\s\S]*where status = 'pending_review'/);
  assert.match(migration053, /v_pending\.comparison_fingerprint = v_comparison_fingerprint[\s\S]*'status', 'retained'/);
  assert.match(migration053, /set status = 'superseded'[\s\S]*comparison_changed/);
});

test("latest approved cumulative delta replaces rather than adds to prior approval", () => {
  const first = [{ status: "approved", delta: 10 }];
  assert.equal(cumulativeEffective(100, first), 110);
  const replacement = [
    { status: "superseded", delta: 10 },
    { status: "approved", delta: 6 },
  ];
  assert.equal(cumulativeEffective(100, replacement), 106);
  assert.notEqual(cumulativeEffective(100, replacement), 116);
  assert.match(migration053, /production_demand_delta_versions_one_approved_idx[\s\S]*where status = 'approved'/);
  assert.match(migration053, /line\.status = 'approved'|delta\.status = 'approved'/);
});

test("pending and rejected deltas do not affect effective demand", () => {
  assert.equal(cumulativeEffective(100, [{ status: "pending_review", delta: 7 }]), 100);
  assert.equal(cumulativeEffective(100, [{ status: "rejected", delta: -4 }]), 100);
  assert.match(migration053, /current_approved[\s\S]*delta\.status = 'approved'/);
});

test("delta approval rechecks evidence and rejection uses bounded categories", () => {
  assert.match(migration053, /approve_production_demand_delta[\s\S]*production_demand_delta_comparison_fingerprint[\s\S]*delta_stale/);
  assert.match(migration053, /source_evidence_incomplete[\s\S]*quantity_requires_confirmation[\s\S]*operational_decision/);
  assert.match(migration053, /rejection_note is null or length\(btrim\(rejection_note\)\) between 1 and 500/);
});

test("all tenant mutations require production.manage and reads use production.view", () => {
  assert.ok((migration053.match(/'production\.manage'/g) ?? []).length >= 8);
  assert.ok((migration053.match(/'production\.view'/g) ?? []).length >= 11);
  assert.match(actions, /requirePermissionAccess\("production\.manage"\)/);
  assert.match(dataHelper, /requirePermissionAccessWithPermissions\("production\.view"\)/);
  assert.doesNotMatch(migration053, /is_platform_admin\(\)/);
});

test("ID-based trusted functions hide cross-tenant review and delta existence", () => {
  const guardedReviewLookups = migration053.match(
    /where review\.id = p_(?:frozen_)?review_id\s+and public\.is_active_member\(review\.organisation_id\)/g,
  ) ?? [];
  const guardedDeltaLookups = migration053.match(
    /where delta\.id = p_delta_version_id\s+and public\.is_active_member\(delta\.organisation_id\)/g,
  ) ?? [];
  assert.equal(guardedReviewLookups.length, 6);
  assert.equal(guardedDeltaLookups.length, 2);
});

test("new tables expose SELECT only and no DELETE policies", () => {
  assert.equal((migration053.match(/for select to authenticated/g) ?? []).length, 10);
  assert.doesNotMatch(migration053, /create policy[\s\S]{0,160}for (insert|update|delete)/i);
  assert.doesNotMatch(migration053, /grant (insert|update|delete|all) on table/i);
});

test("tenant RPC ACLs are authenticated only and internal helpers remain closed", () => {
  const rpcNames = [
    "create_production_demand_review",
    "mark_production_demand_review_reviewed",
    "acknowledge_production_demand_unscoped_blockers",
    "cancel_production_demand_review",
    "freeze_production_demand_review",
    "generate_production_demand_delta",
    "approve_production_demand_delta",
    "reject_production_demand_delta",
    "get_production_demand_effective_frozen",
  ];
  for (const name of rpcNames) {
    assert.match(migration053, new RegExp(`grant execute on function public\\.${name}`));
    assert.match(migration053, new RegExp(`revoke all on function public\\.${name}`));
  }
  assert.doesNotMatch(migration053, /grant execute[\s\S]{0,120}to (anon|public|service_role)/i);
});

test("SECURITY DEFINER functions have fixed search paths and no dynamic SQL", () => {
  const definerCount = (migration053.match(/security definer/g) ?? []).length;
  const searchPathCount = (migration053.match(/set search_path = public/g) ?? []).length;
  assert.ok(definerCount >= 13);
  assert.ok(searchPathCount >= definerCount);
  assert.doesNotMatch(migration053, /execute\s+format|execute\s+immediate|\bexecute\s+v_/i);
});

test("migration contains no seeds or downstream operational writes", () => {
  assert.doesNotMatch(migration053, /insert into public\.(permissions|role_permissions|production_plans|production_plan_lines|production_batches|production_tasks|inventory_lots|stock_movements|commerce_source_orders|commerce_source_order_lines)/i);
  assert.doesNotMatch(migration053, /update public\.(production_live_demand|commerce_|inventory_|stock_movements|production_plans|production_plan_lines)/i);
  assert.doesNotMatch(migration053, /insert into public\.(commerce_|inventory_|stock_movements|production_plans|production_plan_lines)/i);
  assert.doesNotMatch(migration053, /seed|dummy|example only|fake demand/i);
});

test("review and delta UI exposes decisions without manual quantities or planning allocation", () => {
  assert.match(reviewPage, /Mark reviewed/);
  assert.match(reviewPage, /Type FREEZE/);
  assert.match(reviewPage, /Generate current delta/);
  assert.match(deltaPage, /Approve cumulative delta/);
  assert.match(deltaPage, /Reject candidate/);
  assert.doesNotMatch(reviewPage + deltaPage, /name="(quantity|delta_quantity|frozen_quantity)"/);
  assert.doesNotMatch(reviewPage + deltaPage, /Create Production Plan|Allocate demand|Create batch/);
});

test("nested review and delta routes inherit canonical tenant host isolation", () => {
  assert.match(appModeRouting, /"\/production-demand"/);
  assert.match(reviewPage, /requirePermissionAccessWithPermissions|ProductionDemandReviewDetail/);
  assert.match(dataHelper, /requirePermissionAccessWithPermissions\("production\.view"\)/);
});

test("source drilldown is privacy-minimised", () => {
  assert.match(reviewPage, /sourceOrderId[\s\S]*mappingId[\s\S]*interpretationId/);
  assert.doesNotMatch(reviewPage + deltaPage + dataHelper, /customer_(name|email|phone|address)|shipping_address|raw_payload|access_token|ciphertext/i);
});
