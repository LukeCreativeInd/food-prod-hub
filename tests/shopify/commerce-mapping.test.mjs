import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

import {
  buildCommerceCatalogueMappingItems,
  classifyCommerceMappingQueryError,
  filterCommerceMappingItems,
  summariseCommerceMappingReadiness,
} from "../../lib/commerce-mapping.ts";

const migrationsDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migration045 = readFileSync(new URL("045_facility_schema_foundation.sql", migrationsDirectory), "utf8");
const migration046 = readFileSync(new URL("046_commerce_connection_order_intake_foundation.sql", migrationsDirectory), "utf8");
const migration047 = readFileSync(new URL("047_shopify_connector_foundation.sql", migrationsDirectory), "utf8");
const migration048 = readFileSync(new URL("048_shopify_domain_regex_fix.sql", migrationsDirectory), "utf8");
const migration049 = readFileSync(new URL("049_commerce_catalogue_mapping_foundation.sql", migrationsDirectory), "utf8");
const mappingLoader = readFileSync(new URL("../../lib/commerce-mapping-data.ts", import.meta.url), "utf8");
const mappingActions = readFileSync(new URL("../../app/integrations/shopify/mappings/actions.ts", import.meta.url), "utf8");
const mappingListPage = readFileSync(new URL("../../app/integrations/shopify/mappings/page.tsx", import.meta.url), "utf8");
const mappingDetailPage = readFileSync(new URL("../../app/integrations/shopify/mappings/[catalogueItemId]/page.tsx", import.meta.url), "utf8");
const integrationsPage = readFileSync(new URL("../../app/integrations/page.tsx", import.meta.url), "utf8");

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

function functionBody(signature, nextMarker) {
  const start = migration049.indexOf(signature);
  const end = migration049.indexOf(nextMarker, start);
  assert.notEqual(start, -1, `Missing function ${signature}`);
  assert.notEqual(end, -1, `Missing marker after ${signature}`);
  return migration049.slice(start, end);
}

test("Migrations 045 through 048 remain exact immutable artifacts", () => {
  assert.equal(sha256(migration045), "8f7679d2eeab8fabc0f2e13fb69ec133bf103e817de3da65c7209e624d7c3aba");
  assert.equal(sha256(migration046), "ac28056b56d30cc9504eecd6c83f71c03fadbd1169cd785643c93a0a623b0b79");
  assert.equal(sha256(migration047), "cf28720d98bfc08b5b6ad06da9e5501bc558548cee1b532918eebfc7dc27e855");
  assert.equal(sha256(migration048), "51f31ab3b079853994ff1026759e1eb509d21d330c70a37c640a84213591a26b");
});

test("Migration 049 remains the complete immutable mapping schema before Migration 050", () => {
  for (const table of [
    "commerce_catalogue_mappings",
    "commerce_catalogue_mapping_outputs",
    "commerce_catalogue_mapping_events",
  ]) {
    assert.match(migration049, new RegExp(`create table public\\.${table}`));
    assert.match(migration049, new RegExp(`alter table public\\.${table} enable row level security;`));
  }

  const migrations = readdirSync(migrationsDirectory);
  assert.equal(migrations.filter((name) => name.startsWith("049_")).length, 1);
  assert.equal(
    sha256(migration049),
    "b1f17b57dc3fb29b0f91503c1985f680e4386732be3c9eced13da4be9a2d4583",
  );
  assert.equal(migrations.filter((name) => name.startsWith("050_")).length, 1);
  assert.equal(migrations.filter((name) => name.startsWith("051_")).length, 1);
  assert.equal(migrations.filter((name) => name.startsWith("052_")).length, 1);
  assert.equal(migrations.filter((name) => name.startsWith("053_")).length, 1);
});

test("same-tenant source, output and supersession constraints are relational", () => {
  assert.match(migration049, /commerce_catalogue_mappings_source_identity_fk[\s\S]*organisation_id,[\s\S]*external_catalogue_item_id,[\s\S]*connection_id,[\s\S]*provider_variant_id/);
  assert.match(migration049, /commerce_catalogue_mapping_outputs_internal_item_fk[\s\S]*foreign key \(organisation_id, internal_item_id\)/);
  assert.match(migration049, /commerce_catalogue_mappings_supersedes_fk[\s\S]*supersedes_mapping_id,[\s\S]*connection_id,[\s\S]*external_catalogue_item_id,[\s\S]*provider_variant_id/);
  assert.match(migration049, /commerce_catalogue_mappings_self_supersession_check/);
});

test("current working and approved source interpretations are unique", () => {
  assert.match(migration049, /commerce_catalogue_mappings_one_working_version_idx[\s\S]*status in \('draft', 'pending_review'\)/);
  assert.match(migration049, /commerce_catalogue_mappings_one_current_approved_idx[\s\S]*status = 'approved'/);
  assert.match(migration049, /commerce_catalogue_mappings_source_version_unique[\s\S]*connection_id, provider_variant_id, version_number/);
  assert.match(migration049, /commerce_catalogue_mapping_outputs_item_unique/);
});

test("authenticated table access is SELECT-only behind exact tenant permission", () => {
  assert.equal((migration049.match(/for select to authenticated/g) ?? []).length, 3);
  assert.equal((migration049.match(/grant select on table public\.commerce_catalogue_/g) ?? []).length, 3);
  assert.doesNotMatch(migration049, /create policy[\s\S]{0,180}for (insert|update|delete)/i);
  assert.doesNotMatch(migration049, /grant (insert|update|delete|all).*commerce_catalogue_/i);
  assert.doesNotMatch(migration049, /is_platform_admin\(\)[\s\S]{0,220}commerce_catalogue_mappings_select/i);
  assert.match(migration049, /is_active_member\(organisation_id\)[\s\S]*has_permission\(organisation_id, 'admin\.integrations\.view'\)/);
});

test("tenant mutation RPCs are fixed-path authenticated security boundaries", () => {
  const rpcSignatures = [
    "create_commerce_catalogue_mapping_draft(uuid, text, uuid, text)",
    "replace_commerce_catalogue_mapping_outputs(uuid, jsonb)",
    "submit_commerce_catalogue_mapping(uuid)",
    "approve_commerce_catalogue_mapping(uuid)",
    "reject_commerce_catalogue_mapping(uuid, text)",
    "archive_commerce_catalogue_mapping(uuid)",
  ];

  for (const signature of rpcSignatures) {
    assert.match(migration049, new RegExp(`revoke all on function public\\.${signature.replace(/[().]/g, "\\$&")}\\s+from public, anon, authenticated;`));
    assert.match(migration049, new RegExp(`grant execute on function public\\.${signature.replace(/[().]/g, "\\$&")}\\s+to authenticated;`));
  }

  assert.equal((migration049.match(/security definer/g) ?? []).length, 9);
  assert.equal((migration049.match(/set search_path = public/g) ?? []).length, 12);
  assert.doesNotMatch(migration049, /execute\s+format\s*\(/i);
  assert.match(migration049, /commerce_require_catalogue_mapping_permission[\s\S]*is_active_member[\s\S]*admin\.integrations\.manage/);
});

test("mapping lifecycle supports direct, bundle and explicit exclusion safely", () => {
  assert.match(migration049, /mapping_kind in \('direct', 'bundle', 'exclusion'\)/);
  assert.match(migration049, /mapping_kind = 'direct'[\s\S]*v_output_count = 1/);
  assert.match(migration049, /mapping_kind = 'bundle'[\s\S]*v_output_count >= 2[\s\S]*v_single_multiplier <> 1/);
  assert.match(migration049, /mapping_kind = 'exclusion'[\s\S]*v_output_count = 0/);
  assert.match(migration049, /quantity_multiplier > 0/);
  assert.match(migration049, /item\.item_type not in \('finished_product', 'component'\)/);
  assert.match(migration049, /lower\(btrim\(item\.base_unit\)\)[\s\S]*lower\(btrim\(output\.output_uom\)\)/);
});

test("approved history and events cannot be silently rewritten", () => {
  assert.match(migration049, /Approved mappings are immutable except for controlled supersession or archive/);
  assert.match(migration049, /Rejected, superseded and archived mapping history is immutable/);
  assert.match(migration049, /commerce_catalogue_mapping_events_append_only_trigger/);
  assert.match(migration049, /Mapping outputs are replaced as a complete draft set, not updated in place/);
  assert.match(migration049, /pg_advisory_xact_lock/);
});

test("source-line reassessment changes status only and never creates demand", () => {
  const refreshBody = functionBody(
    "create or replace function public.commerce_refresh_catalogue_mapping_state(",
    "comment on function public.commerce_refresh_catalogue_mapping_state",
  );
  assert.match(refreshBody, /update public\.commerce_source_order_lines[\s\S]*interpretation_status = v_interpretation_status/);
  assert.doesNotMatch(refreshBody, /(original|current|cancelled|refunded)_quantity\s*=/);
  assert.doesNotMatch(migration049, /insert into public\.(production_demand|production_contributions|production_plans)/i);
  assert.doesNotMatch(migration049, /update public\.(formula_versions|formula_lines|facilities|inventory_lots|stock_movements)/i);
  assert.match(refreshBody, /mapping_readiness = v_mapping_readiness[\s\S]*bundle_readiness = v_bundle_readiness/);
  assert.doesNotMatch(refreshBody, /demand_readiness\s*=/);
});

test("readiness never treats an empty catalogue as ready", () => {
  assert.equal(summariseCommerceMappingReadiness([]).readiness, "not_started");

  const item = {
    id: "external-1",
    connection_id: "connection-1",
    provider_product_id: "product-1",
    provider_variant_id: "variant-1",
    source_sku: "SKU-1",
    source_product_title: "Naked Chicken",
    source_variant_title: "Regular",
    source_status: "active",
    last_observed_at: "2026-08-05T00:00:00Z",
    archived_at: null,
  };
  const unresolved = buildCommerceCatalogueMappingItems([item], [], [], []);
  assert.equal(summariseCommerceMappingReadiness(unresolved).readiness, "not_started");

  const directMapping = {
    id: "mapping-1",
    connection_id: "connection-1",
    external_catalogue_item_id: "external-1",
    provider_variant_id: "variant-1",
    mapping_kind: "direct",
    status: "approved",
    version_number: 1,
    supersedes_mapping_id: null,
    safe_note: null,
    submitted_by_profile_id: "profile-1",
    submitted_at: "2026-08-05T00:00:00Z",
    approved_by_profile_id: "profile-1",
    approved_at: "2026-08-05T00:00:00Z",
    rejected_by_profile_id: null,
    rejected_at: null,
    rejection_reason_category: null,
    created_by_profile_id: "profile-1",
    updated_by_profile_id: "profile-1",
    created_at: "2026-08-05T00:00:00Z",
    updated_at: "2026-08-05T00:00:00Z",
    archived_at: null,
  };
  const output = {
    id: "output-1",
    mapping_id: "mapping-1",
    internal_item_id: "internal-1",
    quantity_multiplier: 1,
    output_uom: "each",
    sequence: 1,
    output_role: "primary",
    created_at: "2026-08-05T00:00:00Z",
  };
  const internalItem = {
    id: "internal-1",
    itemType: "finished_product",
    displayName: "Naked Chicken",
    baseUnit: "each",
    status: "active",
    archivedAt: null,
  };
  const approved = buildCommerceCatalogueMappingItems(
    [item],
    [directMapping],
    [output],
    [internalItem],
  );
  assert.equal(summariseCommerceMappingReadiness(approved).readiness, "ready");

  const invalid = buildCommerceCatalogueMappingItems(
    [item],
    [directMapping],
    [output],
    [{ ...internalItem, status: "inactive" }],
  );
  assert.equal(summariseCommerceMappingReadiness(invalid).readiness, "blocked");
});

test("mapping search uses evidence fields without turning title or SKU into identity", () => {
  const items = buildCommerceCatalogueMappingItems(
    [
      {
        id: "external-1",
        connection_id: "connection-1",
        provider_product_id: "product-1",
        provider_variant_id: "variant-1",
        source_sku: "NCR-100",
        source_product_title: "Naked Chicken",
        source_variant_title: "Regular",
        source_status: "active",
        last_observed_at: "2026-08-05T00:00:00Z",
        archived_at: null,
      },
    ],
    [],
    [],
    [],
  );
  assert.equal(filterCommerceMappingItems(items, "all", "NCR-100").length, 1);
  assert.equal(filterCommerceMappingItems(items, "unresolved", "variant-1").length, 1);
  assert.match(migration049, /provider variant identity is canonical/i);
  assert.doesNotMatch(mappingActions, /source_(product_)?title|source_sku/);
});

test("Tenant Admin mapping UI is privacy-safe and RPC-backed", () => {
  assert.match(mappingLoader, /requirePermissionAccessWithPermissions\("admin\.integrations\.view"\)/);
  assert.match(mappingActions, /requirePermissionAccess\("admin\.integrations\.manage"\)/);
  assert.doesNotMatch(mappingLoader, /shopify_connection_credentials|shopify_connector_jobs|shopify_privacy_requests/);
  assert.doesNotMatch(mappingActions, /service[_-]?role/i);
  assert.doesNotMatch(`${mappingListPage}\n${mappingDetailPage}`, /customer_email|access_token|refresh_token|ciphertext|raw webhook/i);
  assert.match(mappingListPage, /No Shopify connection/);
  assert.match(mappingListPage, /No catalogue discovered/);
  assert.match(mappingDetailPage, /Create superseding draft/);
  assert.match(mappingDetailPage, /Explicit exclusion/);
  assert.equal(integrationsPage.match(/>Shopify</g)?.length, 1);
  assert.doesNotMatch(integrationsPage, /Shopify Retail|Shopify Wholesale/);
  assert.match(mappingLoader, /getCommerceMappingListData\(\{ catalogueItemId \}\)/);
  assert.match(mappingDetailPage, /You have read-only mapping access/);
});

test("query failures remain truthful and distinguish schema from permission", () => {
  assert.equal(classifyCommerceMappingQueryError(null), "ready");
  assert.equal(classifyCommerceMappingQueryError({ code: "42P01" }), "schema_missing");
  assert.equal(classifyCommerceMappingQueryError({ code: "42501" }), "permission_denied");
  assert.equal(classifyCommerceMappingQueryError({ code: "PGRST000" }), "query_error");
});
