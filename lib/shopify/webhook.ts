import "server-only";

import { timingSafeEqual } from "node:crypto";

import {
  SHOPIFY_MAX_WEBHOOK_BYTES,
  SHOPIFY_WEBHOOK_TOPICS,
  type ShopifyWebhookTopic,
} from "./constants";
import { createShopifyApi } from "./config";
import { sha256 } from "./crypto";
import { normalizeShopifyDomain } from "./identity";
export { redactedWebhookReference } from "./webhook-reference";

function header(request: Request, name: string) {
  return request.headers.get(name)?.trim() ?? "";
}

export async function readShopifyWebhook(request: Request) {
  if (request.method !== "POST") {
    throw new Error("method_not_allowed");
  }

  const contentType = header(request, "content-type").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    throw new Error("unsupported_content_type");
  }

  const lengthHeader = Number(header(request, "content-length"));
  if (Number.isFinite(lengthHeader) && lengthHeader > SHOPIFY_MAX_WEBHOOK_BYTES) {
    throw new Error("payload_too_large");
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > SHOPIFY_MAX_WEBHOOK_BYTES) {
    throw new Error("payload_too_large");
  }

  const shopify = createShopifyApi();
  const validation = await shopify.webhooks.validate({
    rawBody,
    rawRequest: request,
  });

  if (!validation.valid) {
    throw new Error(`invalid_webhook_${validation.reason}`);
  }

  const topic = validation.topic.toLowerCase() as ShopifyWebhookTopic;
  if (!SHOPIFY_WEBHOOK_TOPICS.includes(topic)) {
    throw new Error("unsupported_webhook_topic");
  }

  const domain = normalizeShopifyDomain(validation.domain);
  const body = JSON.parse(rawBody) as Record<string, unknown>;

  return {
    rawBody,
    body,
    topic,
    domain,
    webhookId: validation.webhookId,
    apiVersion: validation.apiVersion,
    triggeredAt: validation.triggeredAt ?? new Date().toISOString(),
    payloadDigest: sha256(rawBody),
  };
}

export function constantTimeSecretMatch(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
