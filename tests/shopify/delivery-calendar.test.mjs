import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const migrationDirectory = new URL("../../supabase/migrations/", import.meta.url);
const migration050 = readFileSync(
  new URL("050_delivery_calendar_production_date_foundation.sql", migrationDirectory),
  "utf8",
);
const deliveryData = readFileSync(
  new URL("../../lib/delivery-configuration-data.ts", import.meta.url),
  "utf8",
);
const deliveryActions = readFileSync(
  new URL("../../app/shopify/actions.ts", import.meta.url),
  "utf8",
);
const integrationsPage = readFileSync(
  new URL("../../app/integrations/page.tsx", import.meta.url),
  "utf8",
);
const shopifyPage = readFileSync(
  new URL("../../app/shopify/page.tsx", import.meta.url),
  "utf8",
);
const workspaceNav = readFileSync(
  new URL("../../components/shopify/shopify-workspace-nav.tsx", import.meta.url),
  "utf8",
);
const parserPage = readFileSync(
  new URL("../../app/shopify/delivery-parser/page.tsx", import.meta.url),
  "utf8",
);

const productionDateResolver = migration050.slice(
  migration050.indexOf("create or replace function public.resolve_delivery_production_date"),
  migration050.indexOf("create or replace function public.resolve_commerce_order_delivery"),
);
const orderDeliveryResolver = migration050.slice(
  migration050.indexOf("create or replace function public.resolve_commerce_order_delivery"),
  migration050.indexOf("-- Row-level security and explicit least-privilege grants"),
);

function effectiveRows(rows, date) {
  return rows.filter(
    (row) =>
      ["published", "superseded"].includes(row.status) &&
      row.effectiveFrom <= date &&
      (row.effectiveTo === null || row.effectiveTo >= date),
  );
}

function dateInTimeZone(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

test("Migration 050 remains the single delivery foundation migration after 049", () => {
  const migrations = readdirSync(migrationDirectory);
  const schemaSection = migration050.slice(
    0,
    migration050.indexOf("-- Internal guards, lifecycle protection"),
  );
  assert.equal(migrations.filter((name) => name.startsWith("050_")).length, 1);
  assert.equal(migrations.some((name) => name.startsWith("051_")), false);
  assert.match(migration050, /^begin;/);
  assert.match(migration050, /commit;\s*$/);
  assert.doesNotMatch(schemaSection, /insert into public\./i);
  assert.ok(sha256(migration050).length === 64);
});

test("all twelve tenant-owned tables exist with RLS and SELECT-only policies", () => {
  const tables = [
    "delivery_zones",
    "delivery_services",
    "delivery_service_zone_assignments",
    "delivery_calendars",
    "delivery_calendar_versions",
    "delivery_calendar_rules",
    "delivery_calendar_exceptions",
    "delivery_parser_profiles",
    "delivery_parser_profile_fields",
    "commerce_order_delivery_interpretations",
    "commerce_order_delivery_overrides",
    "delivery_configuration_events",
  ];

  for (const table of tables) {
    assert.match(migration050, new RegExp(`create table public\\.${table}`));
    assert.match(migration050, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(migration050, new RegExp(`grant select on table public\\.${table} to authenticated;`));
  }

  assert.equal((migration050.match(/for select to authenticated/g) ?? []).length, 12);
  assert.doesNotMatch(migration050, /create policy[\s\S]{0,180}for (insert|update|delete)/i);
  assert.doesNotMatch(migration050, /grant (insert|update|delete|all) on table public\.(delivery_|commerce_order_delivery_)/i);
});

test("same-tenant references are relational rather than RLS-only", () => {
  for (const constraint of [
    "delivery_services_facility_fk",
    "delivery_services_carrier_fk",
    "delivery_services_carrier_service_fk",
    "delivery_service_zone_assignments_connection_fk",
    "delivery_calendar_rules_connection_fk",
    "delivery_calendar_rules_zone_fk",
    "delivery_calendar_rules_service_fk",
    "delivery_calendar_rules_facility_fk",
    "delivery_parser_profiles_connection_fk",
    "commerce_order_delivery_interpretations_order_fk",
    "commerce_order_delivery_overrides_order_fk",
  ]) {
    assert.match(migration050, new RegExp(constraint));
  }
  assert.match(migration050, /foreign key \(organisation_id, source_order_id, connection_id\)/);
  assert.match(migration050, /references public\.commerce_source_orders \(organisation_id, id, connection_id\)/);
});

test("published calendar and parser history is immutable and draft children are guarded", () => {
  assert.match(migration050, /Published calendar versions are immutable except for controlled forward supersession/);
  assert.match(migration050, /Published parser profiles are immutable except for controlled forward supersession/);
  assert.match(migration050, /delivery_calendar_rules_require_draft_trigger/);
  assert.match(migration050, /delivery_calendar_exceptions_require_draft_trigger/);
  assert.match(migration050, /delivery_parser_profile_fields_require_draft_trigger/);
  assert.match(migration050, /delivery_reject_append_history_change/);
  assert.match(migration050, /delivery_reject_hard_delete/);
});

test("resolution preserves the approved precedence and blocks ambiguity", () => {
  assert.match(migration050, /'ambiguous_exact_date_exception'/);
  assert.match(migration050, /'ambiguous_calendar_rule'/);
  assert.match(migration050, /'ambiguous_zone_service_assignment'/);
  assert.match(migration050, /when target_connection_id is not null then 3/);
  assert.match(migration050, /when target_zone_id is not null or target_service_id is not null then 4/);
  assert.match(migration050, /else 5/);
  assert.match(migration050, /status', 'overridden'/);
  assert.match(migration050, /exact_date_blocked/);
  assert.match(migration050, /calendar_rule_missing/);
  assert.doesNotMatch(migration050, /order by random\(\)/i);
});

test("historical calendar versions remain effective after controlled supersession", () => {
  const initialVersion = [
    { id: "v1", status: "published", effectiveFrom: "2026-08-01", effectiveTo: null },
  ];
  const versions = [
    { id: "v1", status: "superseded", effectiveFrom: "2026-08-01", effectiveTo: "2026-08-31" },
    { id: "v2", status: "published", effectiveFrom: "2026-09-01", effectiveTo: null },
    { id: "draft", status: "draft", effectiveFrom: "2026-07-01", effectiveTo: null },
    { id: "rejected", status: "rejected", effectiveFrom: "2026-07-01", effectiveTo: null },
    { id: "archived", status: "archived", effectiveFrom: "2026-07-01", effectiveTo: null },
  ];

  assert.deepEqual(effectiveRows(initialVersion, "2026-08-20").map(({ id }) => id), ["v1"]);
  assert.deepEqual(effectiveRows(versions, "2026-08-20").map(({ id }) => id), ["v1"]);
  assert.deepEqual(effectiveRows(versions, "2026-09-20").map(({ id }) => id), ["v2"]);
  assert.deepEqual(effectiveRows(versions, "2026-06-20"), []);
  assert.equal(
    (productionDateResolver.match(/version\.status in \('published', 'superseded'\)/g) ?? []).length,
    5,
  );
  assert.doesNotMatch(productionDateResolver, /version\.archived_at is null/);
  assert.match(productionDateResolver, /ambiguous_exact_date_exception/);
  assert.match(migration050, /published_version\.status in \('published', 'superseded'\)/);
});

test("historical parser selection uses source-order time and blocks ambiguity", () => {
  const profiles = [
    { id: "august", status: "superseded", effectiveFrom: "2026-08-01", effectiveTo: "2026-08-31" },
    { id: "september", status: "published", effectiveFrom: "2026-09-01", effectiveTo: null },
  ];

  assert.deepEqual(effectiveRows(profiles, "2026-08-20").map(({ id }) => id), ["august"]);
  assert.deepEqual(effectiveRows(profiles, "2026-09-20").map(({ id }) => id), ["september"]);
  assert.equal(
    effectiveRows(
      [...profiles, { id: "overlap", status: "published", effectiveFrom: "2026-08-15", effectiveTo: null }],
      "2026-09-20",
    ).length,
    2,
  );
  assert.equal(
    dateInTimeZone("2026-10-04T13:30:00.000Z", "Australia/Melbourne"),
    "2026-10-05",
  );
  assert.match(orderDeliveryResolver, /v_order\.provider_created_at/);
  assert.match(orderDeliveryResolver, /v_order\.provider_updated_at/);
  assert.match(orderDeliveryResolver, /v_order\.created_at/);
  assert.match(orderDeliveryResolver, /profile\.status in \('published', 'superseded'\)/);
  assert.match(orderDeliveryResolver, /'ambiguous_parser_profile'/);
  assert.match(orderDeliveryResolver, /'parser_effective_date', v_parser_effective_date/);
  assert.match(orderDeliveryResolver, /case when v_override\.id is null then v_parser\.id else null end/);
  assert.doesNotMatch(orderDeliveryResolver, /now\(\) at time zone profile\.timezone/);
  assert.doesNotMatch(orderDeliveryResolver, /\bcurrent_date\b/);
  assert.doesNotMatch(orderDeliveryResolver, /order by profile\.version_number/);
  assert.ok(
    (migration050.match(/Parser profile effective periods cannot overlap\./g) ?? []).length >= 2,
  );
});

test("timezone and date parsing are explicit and bounded", () => {
  assert.match(migration050, /pg_catalog\.pg_timezone_names/);
  assert.doesNotMatch(migration050, /\bcurrent_date\b/);
  assert.match(migration050, /now\(\) at time zone profile\.timezone/);
  assert.match(migration050, /now\(\) at time zone calendar\.timezone/);
  assert.match(orderDeliveryResolver, /v_parser_source_timestamp at time zone profile\.timezone/);
  assert.match(migration050, /'YYYY-MM-DD', 'DD\/MM\/YYYY', 'MM\/DD\/YYYY'/);
  assert.match(migration050, /extract\(isodow from v_delivery_date\)/);
  assert.doesNotMatch(migration050, /browser.*timezone|new Date\(.*requested_delivery/i);
});

test("parser profiles are connection-specific exact-key configurations", () => {
  assert.match(migration050, /delivery_parser_profiles_connection_fk/);
  assert.match(migration050, /delivery_parser_profile_fields_profile_source_unique/);
  assert.match(migration050, /source_location in \('order_attribute', 'source_tag'\)/);
  assert.match(migration050, /Parser source location must be order_attribute or source_tag/);
  assert.match(orderDeliveryResolver, /v_field\.source_location = 'order_attribute'/);
  assert.match(orderDeliveryResolver, /v_field\.source_location = 'source_tag'/);
  assert.doesNotMatch(`${migration050}\n${deliveryData}\n${parserPage}`, /line_attribute/);
  assert.match(parserPage, /Line attributes remain deferred/);
  assert.match(migration050, /Exact allowlisted source keys/);
  assert.doesNotMatch(migration050, /requested_regex|regex_pattern|execute\s+format/i);
});

test("source interpretation stores safe evidence without raw payload or customer PII", () => {
  assert.match(migration050, /matched_fields/);
  assert.match(migration050, /projection_version/);
  assert.doesNotMatch(migration050, /customer_(name|email|phone)|shipping_address|billing_address/i);
  assert.doesNotMatch(migration050, /postcode\s+(text|varchar|character)/i);
  assert.doesNotMatch(migration050, /raw_(payload|webhook)/i);
});

test("tenant RPCs require active membership and exact existing permissions", () => {
  assert.match(migration050, /delivery_require_permission[\s\S]*is_active_member[\s\S]*has_permission/);
  assert.match(migration050, /admin\.integrations\.view/);
  assert.match(migration050, /admin\.integrations\.manage/);
  assert.doesNotMatch(migration050, /insert into public\.permissions|insert into public\.role_permissions/);
  assert.doesNotMatch(migration050, /is_platform_admin\(\)/);
  assert.doesNotMatch(migration050, /service_role/);
  assert.doesNotMatch(migration050, /execute\s+format\s*\(/i);
});

test("Task 235 never creates demand or mutates operational modules", () => {
  assert.doesNotMatch(migration050, /insert into public\.(production_|inventory_|qa_|logistics_)/i);
  assert.doesNotMatch(migration050, /update public\.(production_|inventory_|qa_|logistics_)/i);
  assert.doesNotMatch(migration050, /create table public\.production_demand/i);
  assert.doesNotMatch(deliveryActions, /service[_-]?role|production_demand|stock_movements/i);
});

test("Integrations is compact and Shopify owns provider-specific configuration", () => {
  assert.equal(integrationsPage.match(/>Shopify</g)?.length, 1);
  assert.match(integrationsPage, /Connected integrations/);
  assert.match(integrationsPage, /Available integrations/);
  assert.match(integrationsPage, /Coming soon/);
  assert.doesNotMatch(integrationsPage, /Product mappings|Recent synchronization evidence|Development-store installation claim/);
  for (const route of [
    "/shopify/delivery-zones",
    "/shopify/delivery-services",
    "/shopify/delivery-calendars",
    "/shopify/delivery-parser",
    "/shopify/delivery-exceptions",
  ]) {
    assert.match(workspaceNav, new RegExp(route));
  }
  assert.match(shopifyPage, /Zapiet remains the customer-facing calendar/);
});

test("delivery data and actions use authenticated tenant clients only", () => {
  assert.match(deliveryData, /requirePermissionAccessWithPermissions\("admin\.integrations\.view"\)/);
  assert.match(deliveryActions, /requirePermissionAccess\("admin\.integrations\.manage"\)/);
  assert.match(deliveryActions, /\.rpc\("create_delivery_zone"/);
  assert.match(deliveryActions, /\.rpc\("create_delivery_service"/);
  assert.match(deliveryActions, /\.rpc\("create_delivery_calendar_draft"/);
  assert.match(deliveryActions, /\.rpc\("create_delivery_parser_profile_draft"/);
  assert.doesNotMatch(`${deliveryData}\n${deliveryActions}`, /shopify_connection_credentials|access_token|ciphertext|customer_email/i);
});
