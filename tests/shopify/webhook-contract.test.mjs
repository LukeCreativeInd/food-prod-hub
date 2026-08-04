import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import "@shopify/shopify-api/adapters/web-api";
import { ApiVersion, shopifyApi } from "@shopify/shopify-api";

const secret = "test-shopify-client-secret";
const shopify = shopifyApi({
  apiKey: "test-client-id",
  apiSecretKey: secret,
  hostName: "localhost:3000",
  hostScheme: "http",
  apiVersion: ApiVersion.July26,
  isEmbeddedApp: true,
  isTesting: true,
});

function webhookRequest(rawBody, hmac) {
  return new Request("http://localhost:3000/api/integrations/shopify/webhooks", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-hmac-sha256": hmac,
      "x-shopify-topic": "orders/create",
      "x-shopify-shop-domain": "test-shop.myshopify.com",
      "x-shopify-api-version": "2026-07",
      "x-shopify-webhook-id": "webhook-test-1",
    },
    body: rawBody,
  });
}

test("official Shopify validator accepts a raw-body HMAC and rejects tampering", async () => {
  const rawBody = JSON.stringify({ id: 1, admin_graphql_api_id: "gid://shopify/Order/1" });
  const hmac = createHmac("sha256", secret).update(rawBody).digest("base64");
  const valid = await shopify.webhooks.validate({
    rawBody,
    rawRequest: webhookRequest(rawBody, hmac),
  });
  const invalid = await shopify.webhooks.validate({
    rawBody: `${rawBody} `,
    rawRequest: webhookRequest(`${rawBody} `, hmac),
  });

  assert.equal(valid.valid, true);
  assert.equal(invalid.valid, false);
});

test("Migration 047 keeps secrets and provider writes outside authenticated access", async () => {
  const sql = await readFile(
    new URL("../../supabase/migrations/047_shopify_connector_foundation.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /alter table public\.shopify_connection_credentials enable row level security;/);
  assert.match(
    sql,
    /revoke all on table public\.shopify_connection_credentials from public, anon, authenticated;/,
  );
  assert.doesNotMatch(
    sql,
    /grant (?:insert|update|delete).*shopify_connection_credentials to authenticated/i,
  );
  assert.match(sql, /grant execute on function public\.accept_shopify_webhook[\s\S]*to service_role;/);
  assert.match(
    sql,
    /grant execute on function public\.archive_shopify_catalogue_product\(uuid, text, timestamptz\)[\s\S]*to service_role;/,
  );
  assert.doesNotMatch(sql, /insert into public\.commerce_connections[\s\S]*Clean Eats/i);
  assert.doesNotMatch(sql, /security definer[\s\S]*execute\s+format\s*\(/i);
});
