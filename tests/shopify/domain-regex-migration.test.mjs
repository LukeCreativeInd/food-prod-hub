import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const migration047 = readFileSync(
  new URL("../../supabase/migrations/047_shopify_connector_foundation.sql", import.meta.url),
  "utf8",
);
const migration048 = readFileSync(
  new URL("../../supabase/migrations/048_shopify_domain_regex_fix.sql", import.meta.url),
  "utf8",
);

const faultyPattern = String.raw`^[a-z0-9][a-z0-9-]*[a-z0-9]\\.myshopify\\.com$`;
const correctedPattern = String.raw`^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$`;

function functionDefinition(source, signature, nextMarker) {
  const start = source.indexOf(signature);
  const end = source.indexOf(nextMarker, start);

  assert.notEqual(start, -1, `Missing function: ${signature}`);
  assert.notEqual(end, -1, `Missing function terminator after: ${signature}`);

  return source.slice(start, end);
}

test("Migration 047 remains the exact applied artifact", () => {
  assert.equal(migration047.match(/\n/g)?.length, 2137);
  assert.equal(
    createHash("sha256").update(migration047).digest("hex"),
    "cf28720d98bfc08b5b6ad06da9e5501bc558548cee1b532918eebfc7dc27e855",
  );
});

test("Migration 048 repairs both constraints and both function validators", () => {
  for (const constraint of [
    "shopify_install_intents_shop_domain_check",
    "shopify_installations_shop_domain_check",
  ]) {
    assert.match(migration048, new RegExp(`drop constraint ${constraint};`));
    assert.match(migration048, new RegExp(`add constraint ${constraint}`));
  }

  assert.equal(migration048.split(correctedPattern).length - 1, 4);
  assert.doesNotMatch(migration048, new RegExp(faultyPattern.replaceAll("\\", "\\\\")));
});

test("Migration 048 changes only the regex inside each replaced function body", () => {
  const tenantSignature = "create or replace function public.create_shopify_install_intent(";
  const providerSignature = "create or replace function public.store_verified_shopify_installation(";

  const originalTenant = functionDefinition(
    migration047,
    tenantSignature,
    "comment on function public.create_shopify_install_intent",
  ).replaceAll(faultyPattern, correctedPattern);
  const repairedTenant = functionDefinition(
    migration048,
    tenantSignature,
    "comment on function public.create_shopify_install_intent",
  );
  const originalProvider = functionDefinition(
    migration047,
    providerSignature,
    "comment on function public.store_verified_shopify_installation",
  ).replaceAll(faultyPattern, correctedPattern);
  const repairedProvider = functionDefinition(
    migration048,
    providerSignature,
    "comment on function public.store_verified_shopify_installation",
  );

  assert.equal(repairedTenant, originalTenant);
  assert.equal(repairedProvider, originalProvider);
});

test("Migration 048 preserves SECURITY DEFINER search paths and exact ACL boundaries", () => {
  assert.equal(migration048.match(/security definer/g)?.length, 2);
  assert.equal(migration048.match(/set search_path = public/g)?.length, 2);
  assert.doesNotMatch(migration048, /execute\s+format\s*\(/i);

  assert.match(
    migration048,
    /revoke all on function public\.create_shopify_install_intent\(uuid, uuid, text, text, uuid, uuid\)\s+from public, anon, authenticated;/,
  );
  assert.match(
    migration048,
    /grant execute on function public\.create_shopify_install_intent\(uuid, uuid, text, text, uuid, uuid\)\s+to authenticated;/,
  );
  assert.match(
    migration048,
    /revoke all on function public\.store_verified_shopify_installation\(text, text, text, text, text, text\[\], text, text, text, text, text, text, text, timestamptz, timestamptz, text, text\)\s+from public, anon, authenticated;/,
  );
  assert.match(
    migration048,
    /grant execute on function public\.store_verified_shopify_installation\(text, text, text, text, text, text\[\], text, text, text, text, text, text, text, timestamptz, timestamptz, text, text\)\s+to service_role;/,
  );
});

test("the repaired contract accepts canonical domains and rejects lookalikes", () => {
  const pattern = new RegExp(correctedPattern);

  assert.equal(pattern.test("task233-dev.myshopify.com"), true);
  assert.equal(pattern.test("store-123.myshopify.com"), true);
  assert.equal(pattern.test("store.myshopify.com.evil.example"), false);
  assert.equal(pattern.test("https://store.myshopify.com"), false);
  assert.equal(pattern.test("valid_store.myshopify.com"), false);
  assert.equal(pattern.test(".myshopify.com"), false);
  assert.equal(pattern.test("store..myshopify.com"), false);
  assert.equal(pattern.test("example.com"), false);
});

test("the domain repair remains immutable when Migration 050 is added", () => {
  const migrations = readdirSync(new URL("../../supabase/migrations/", import.meta.url));
  assert.equal(migrations.filter((name) => name.startsWith("050_")).length, 1);
  assert.equal(migrations.some((name) => name.startsWith("051_")), false);
});
