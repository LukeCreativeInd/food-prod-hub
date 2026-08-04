export const SHOPIFY_API_VERSION = "2026-07" as const;
export const SHOPIFY_ADAPTER_VERSION = "shopify-v1" as const;

export const SHOPIFY_REQUIRED_SCOPES = ["read_orders", "read_products"] as const;

export const SHOPIFY_WEBHOOK_TOPICS = [
  "app/uninstalled",
  "customers/data_request",
  "customers/redact",
  "shop/redact",
  "orders/create",
  "orders/updated",
  "orders/cancelled",
  "refunds/create",
  "products/create",
  "products/update",
  "products/delete",
] as const;

export type ShopifyWebhookTopic = (typeof SHOPIFY_WEBHOOK_TOPICS)[number];

export const SHOPIFY_MAX_WEBHOOK_BYTES = 1_048_576;
export const SHOPIFY_GRAPHQL_TIMEOUT_MS = 15_000;
export const SHOPIFY_DEFAULT_BACKFILL_DAYS = 60;
export const SHOPIFY_MAX_BACKFILL_DAYS_WITHOUT_READ_ALL = 60;
