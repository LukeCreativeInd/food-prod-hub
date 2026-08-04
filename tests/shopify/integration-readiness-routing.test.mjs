import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildShopifyConnectionSummaries,
  classifyShopifyReadinessFailures,
  shopifyReadinessMessage,
} from "../../lib/shopify/integration-readiness.ts";

const integrationsLoader = readFileSync(
  new URL("../../lib/shopify-integration-data.ts", import.meta.url),
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
const appModeRouting = readFileSync(
  new URL("../../lib/app-mode-routing.ts", import.meta.url),
  "utf8",
);
const pageTitles = readFileSync(
  new URL("../../lib/page-title.ts", import.meta.url),
  "utf8",
);
const sessionRoute = readFileSync(
  new URL("../../app/api/integrations/shopify/session/route.ts", import.meta.url),
  "utf8",
);

test("zero connections and zero catalogue items are a valid ready state", () => {
  assert.equal(
    classifyShopifyReadinessFailures([
      { query: "commerce_connections", error: null },
      { query: "commerce_external_catalogue_items", error: null },
      { query: "facilities", error: null },
      { query: "commerce_sync_runs", error: null },
    ]),
    "ready",
  );
  assert.deepEqual(buildShopifyConnectionSummaries([], []), []);
});

test("missing optional catalogue rows do not prevent a connection summary", () => {
  const summaries = buildShopifyConnectionSummaries(
    [
      {
        id: "connection-1",
        storefront_display_name: "Example store",
        provider_domain: null,
        environment: "development",
        business_status: "pending",
        owner_authorisation_status: "pending",
        manufacturer_acceptance_status: "pending",
        installation_status: "not_installed",
        technical_health: "unknown",
        facility_readiness: "not_assigned",
        mapping_readiness: "not_started",
        bundle_readiness: "not_started",
        delivery_parser_readiness: "not_started",
        delivery_calendar_readiness: "not_started",
        discovery_status: "not_started",
        backfill_status: "not_started",
        reconciliation_status: "not_started",
        demand_readiness: "blocked",
        last_sync_attempted_at: null,
        last_sync_succeeded_at: null,
        unresolved_error_category: null,
        access_token: "must-not-serialize",
        customer_email: "must-not-serialize@example.com",
      },
    ],
    [],
  );

  assert.equal(summaries.length, 1);
  assert.equal(summaries[0].catalogueItemCount, 0);
  assert.equal("access_token" in summaries[0], false);
  assert.equal("customer_email" in summaries[0], false);
});

test("schema, permission and genuine query failures remain distinct", () => {
  assert.equal(
    classifyShopifyReadinessFailures([
      { query: "facilities", error: { code: "42703" } },
    ]),
    "schema_missing",
  );
  assert.equal(
    classifyShopifyReadinessFailures([
      { query: "commerce_connections", error: { code: "42501" } },
    ]),
    "permission_denied",
  );
  assert.equal(
    classifyShopifyReadinessFailures([
      { query: "commerce_sync_runs", error: { code: "PGRST000" } },
    ]),
    "query_error",
  );
  assert.match(
    shopifyReadinessMessage("permission_denied"),
    /No connection state has been assumed/,
  );
  assert.match(
    shopifyReadinessMessage("query_error"),
    /No connection or synchronization state has been assumed/,
  );
});

test("tenant readiness uses only safe readable projections", () => {
  for (const table of [
    "commerce_connections",
    "commerce_external_catalogue_items",
    "facilities",
    "commerce_sync_runs",
  ]) {
    assert.match(integrationsLoader, new RegExp(`\\.from\\(\"${table}\"\\)`));
  }

  for (const sensitiveTable of [
    "shopify_connection_credentials",
    "shopify_connector_jobs",
    "shopify_privacy_requests",
    "shopify_installations",
  ]) {
    assert.doesNotMatch(integrationsLoader, new RegExp(sensitiveTable));
  }

  assert.doesNotMatch(integrationsLoader, /service[_-]?role/i);
  assert.match(integrationsLoader, /requirePermissionAccessWithPermissions\(\"admin\.integrations\.view\"\)/);
  assert.match(integrationsLoader, /\.select\(\"id,name,code\"\)/);
  assert.doesNotMatch(integrationsLoader, /facility_name|facility_code/);
});

test("Integrations presents Shopify once without invented retail or wholesale providers", () => {
  assert.equal(integrationsPage.match(/title="Shopify"/g)?.length, 1);
  assert.doesNotMatch(integrationsPage, /Shopify Retail|Shopify Wholesale/);
  assert.match(integrationsPage, /No Shopify connection/);
  assert.match(integrationsPage, /No synchronization runs/);
  assert.doesNotMatch(integrationsPage, /Sync successful|Backfill complete|Reconciliation complete/);
});

test("tenant Shopify route is narrowly admitted while other host boundaries remain", () => {
  assert.match(appModeRouting, /"\/integrations",\s*"\/shopify",\s*"\/admin"/);
  assert.match(appModeRouting, /if \(resolvedMode\.mode === "central_app"\)[\s\S]*isTenantAppCanonicalRoute/);
  assert.match(appModeRouting, /if \(resolvedMode\.mode === "platform_admin"\)/);
  assert.match(appModeRouting, /if \(resolvedMode\.mode === "support"\)/);
  assert.match(appModeRouting, /if \(resolvedMode\.mode === "tenant_app"\)/);
});

test("Shopify tenant setup is read-only and retains the Integrations permission guard", () => {
  assert.match(shopifyPage, /getShopifyIntegrationPageData\(\)/);
  assert.match(shopifyPage, /mode\.mode !== "tenant_app"/);
  assert.match(shopifyPage, /mode\.mode === "central_app"/);
  assert.match(shopifyPage, /mode\.mode === "platform_admin"/);
  assert.match(shopifyPage, /mode\.mode === "support"/);
  assert.match(shopifyPage, /No Shopify store connected/);
  assert.match(pageTitles, /"\/shopify": \{ title: "Shopify Setup", context: "Admin" \}/);
  assert.doesNotMatch(shopifyPage, /<form|\.insert\(|\.update\(|\.upsert\(|\.rpc\(/);
  assert.doesNotMatch(shopifyPage, /access[_-]?token|refresh[_-]?token|ciphertext|customer_email/i);
});

test("embedded Shopify identity validation remains on the dedicated session route", () => {
  assert.match(sessionRoute, /decodeSessionToken/);
  assert.match(sessionRoute, /tokenExchange/);
  assert.doesNotMatch(shopifyPage, /decodeSessionToken|tokenExchange/);
});
