import "server-only";

import { createHash } from "node:crypto";

import type { EncryptedValue } from "./types";
import { decryptAesGcm, encryptAesGcm } from "./crypto-core";

function credentialKey() {
  const encodedKey = process.env.SHOPIFY_CREDENTIAL_ENCRYPTION_KEY;

  if (!encodedKey) {
    throw new Error("Shopify credential encryption is not configured.");
  }

  const key = Buffer.from(encodedKey, "base64");

  if (key.length !== 32) {
    throw new Error("Shopify credential encryption key must be 32 bytes.");
  }

  return key;
}

export function encryptShopifySecret(value: string): EncryptedValue {
  return encryptAesGcm(value, credentialKey());
}

export function decryptShopifySecret(value: EncryptedValue) {
  return decryptAesGcm(value, credentialKey());
}

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}
