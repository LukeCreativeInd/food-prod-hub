import { NextResponse } from "next/server";

import { getShopifyEnvironment } from "@/lib/shopify/config";
import { acceptVerifiedWebhook } from "@/lib/shopify/repository";
import {
  assertShopifyRouteHost,
  safeRouteError,
} from "@/lib/shopify/runtime-boundary";
import {
  readShopifyWebhook,
  redactedWebhookReference,
} from "@/lib/shopify/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertShopifyRouteHost(request);
    const webhook = await readShopifyWebhook(request);
    const referenceData = redactedWebhookReference(webhook.topic, webhook.body);
    const accepted = await acceptVerifiedWebhook({
      environment: getShopifyEnvironment(),
      shopDomain: webhook.domain,
      webhookId: webhook.webhookId,
      topic: webhook.topic,
      apiVersion: webhook.apiVersion,
      triggeredAt: webhook.triggeredAt,
      payloadDigest: webhook.payloadDigest,
      referenceData,
    });

    return NextResponse.json(
      { ok: true, duplicate: accepted.duplicate },
      { status: 200 },
    );
  } catch (error) {
    const safe = safeRouteError(error);
    return NextResponse.json({ error: safe.category }, { status: safe.status });
  }
}
