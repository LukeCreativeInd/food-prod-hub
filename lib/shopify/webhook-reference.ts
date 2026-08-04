import { createHash } from "node:crypto";

import type { ShopifyWebhookTopic } from "./constants";

function safeId(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).slice(0, 200)
    : null;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function redactedWebhookReference(
  topic: ShopifyWebhookTopic,
  body: Record<string, unknown>,
) {
  const providerOrderId = safeId(body.admin_graphql_api_id ?? body.id);
  const providerProductId = safeId(body.admin_graphql_api_id ?? body.id);
  const reference: Record<string, string> = {};

  if (topic.startsWith("orders/") || topic === "refunds/create") {
    const refundOrder = body.order && typeof body.order === "object"
      ? (body.order as Record<string, unknown>)
      : null;
    const orderId =
      topic === "refunds/create"
        ? safeId(refundOrder?.admin_graphql_api_id ?? body.order_id)
        : providerOrderId;
    if (orderId) {
      reference.provider_order_id = /^\d+$/.test(orderId)
        ? `gid://shopify/Order/${orderId}`
        : orderId;
    }
  }

  if (topic.startsWith("products/") && providerProductId) {
    reference.provider_product_id = providerProductId;
  }

  const updatedAt = safeId(body.updated_at);
  if (updatedAt) reference.provider_updated_at = updatedAt;

  if (topic.startsWith("customers/") || topic === "shop/redact") {
    const customer = body.customer && typeof body.customer === "object"
      ? (body.customer as Record<string, unknown>)
      : null;
    const subjectId = safeId(customer?.id ?? body.customer_id ?? body.shop_id);
    if (subjectId) reference.subject_reference_hash = digest(subjectId);
  }

  return reference;
}
