import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

import { decryptAesGcm, encryptAesGcm } from "../../lib/shopify/crypto-core.ts";
import {
  normalizeShopifyDomain,
  shopDomainFromSessionDestination,
} from "../../lib/shopify/identity.ts";

test("normalizes verified myshopify domains and rejects lookalikes", () => {
  assert.equal(normalizeShopifyDomain("  Example-Store.myshopify.com "), "example-store.myshopify.com");
  assert.equal(normalizeShopifyDomain("valid-store.myshopify.com"), "valid-store.myshopify.com");
  assert.equal(normalizeShopifyDomain("store-123.myshopify.com"), "store-123.myshopify.com");
  assert.equal(
    shopDomainFromSessionDestination("https://example-store.myshopify.com/admin"),
    "example-store.myshopify.com",
  );
  assert.throws(() => normalizeShopifyDomain("example.com"), /invalid_shop_domain/);
  assert.throws(
    () => normalizeShopifyDomain("valid-store.myshopify.com.evil.example"),
    /invalid_shop_domain/,
  );
  assert.throws(() => normalizeShopifyDomain("valid_store.myshopify.com"), /invalid_shop_domain/);
  assert.throws(() => normalizeShopifyDomain(".myshopify.com"), /invalid_shop_domain/);
  assert.throws(() => normalizeShopifyDomain("store..myshopify.com"), /invalid_shop_domain/);
  assert.throws(
    () => normalizeShopifyDomain("https://valid-store.myshopify.com"),
    /invalid_shop_domain/,
  );
  assert.throws(
    () => shopDomainFromSessionDestination("http://example-store.myshopify.com"),
    /invalid_session_destination/,
  );
});

test("AES-256-GCM credential ciphertext round-trips and rejects a wrong key", () => {
  const key = randomBytes(32);
  const encrypted = encryptAesGcm("shpat_test_secret", key);

  assert.notEqual(encrypted.ciphertext, "shpat_test_secret");
  assert.equal(decryptAesGcm(encrypted, key), "shpat_test_secret");
  assert.throws(() => decryptAesGcm(encrypted, randomBytes(32)));
});
