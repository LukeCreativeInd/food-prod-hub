import { NextResponse } from "next/server";

import { constantTimeSecretMatch } from "@/lib/shopify/webhook";
import {
  assertShopifyRouteHost,
  safeRouteError,
} from "@/lib/shopify/runtime-boundary";
import { runShopifyWorkerBatch } from "@/lib/shopify/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    assertShopifyRouteHost(request);

    const expected = process.env.SHOPIFY_WORKER_SECRET;
    const authorization = request.headers.get("authorization") ?? "";
    const provided = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : "";

    if (!expected || !provided || !constantTimeSecretMatch(provided, expected)) {
      return NextResponse.json({ error: "authentication_failed" }, { status: 401 });
    }

    const result = await runShopifyWorkerBatch(5);
    return NextResponse.json({ ok: true, claimed: result.claimed, results: result.results });
  } catch (error) {
    const safe = safeRouteError(error);
    return NextResponse.json({ error: safe.category }, { status: safe.status });
  }
}
