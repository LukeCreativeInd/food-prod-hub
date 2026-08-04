import "server-only";
import "@shopify/shopify-api/adapters/web-api";

import { ApiVersion, LogSeverity, shopifyApi } from "@shopify/shopify-api";

import { SHOPIFY_REQUIRED_SCOPES } from "./constants";
import type { ShopifyEnvironment } from "./types";

export function getShopifyEnvironment(): ShopifyEnvironment {
  const configured = process.env.SHOPIFY_APP_ENVIRONMENT;

  if (
    configured === "development" ||
    configured === "staging" ||
    configured === "production"
  ) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SHOPIFY_APP_ENVIRONMENT must be explicit in production.");
  }

  return "development";
}

export function getShopifyWorkerEnvironment(): ShopifyEnvironment {
  const configured = process.env.SHOPIFY_APP_ENVIRONMENT;

  if (
    configured === "development" ||
    configured === "staging" ||
    configured === "production"
  ) {
    return configured;
  }

  throw new Error("shopify_worker_environment_not_configured");
}

export function isShopifyRuntimeConfigured() {
  return Boolean(
    process.env.SHOPIFY_APP_CLIENT_ID &&
      process.env.SHOPIFY_APP_CLIENT_SECRET &&
      process.env.SHOPIFY_APP_HOST &&
      process.env.SHOPIFY_CREDENTIAL_ENCRYPTION_KEY &&
      process.env.SHOPIFY_CREDENTIAL_KEY_VERSION &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function createShopifyApi() {
  const apiKey = process.env.SHOPIFY_APP_CLIENT_ID;
  const apiSecretKey = process.env.SHOPIFY_APP_CLIENT_SECRET;
  const appHost = process.env.SHOPIFY_APP_HOST;

  if (!apiKey || !apiSecretKey || !appHost) {
    throw new Error("Shopify app runtime is not configured.");
  }

  const host = new URL(appHost);

  if (process.env.NODE_ENV === "production" && host.protocol !== "https:") {
    throw new Error("Production Shopify app host must use HTTPS.");
  }

  return shopifyApi({
    apiKey,
    apiSecretKey,
    scopes: [...SHOPIFY_REQUIRED_SCOPES],
    hostName: host.host,
    hostScheme: host.protocol === "http:" ? "http" : "https",
    apiVersion: ApiVersion.July26,
    isEmbeddedApp: true,
    userAgentPrefix: "EveryBatch-Shopify-Connector/1",
    logger: {
      level: LogSeverity.Warning,
      httpRequests: false,
      timestamps: true,
      log: (severity, message) => {
        const redacted = message
          .replace(/shpat_[A-Za-z0-9_-]+/g, "[REDACTED_TOKEN]")
          .replace(/Bearer\s+[^\s]+/gi, "Bearer [REDACTED]");

        if (severity <= LogSeverity.Error) {
          console.error("[shopify]", redacted);
        } else if (process.env.NODE_ENV !== "production") {
          console.warn("[shopify]", redacted);
        }
      },
    },
  });
}
