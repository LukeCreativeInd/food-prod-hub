import { NextResponse } from "next/server";

import {
  getShopifyEnvironment,
  isShopifyRuntimeConfigured,
} from "@/lib/shopify/config";
import {
  assertShopifyRouteHost,
  safeRouteError,
} from "@/lib/shopify/runtime-boundary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    assertShopifyRouteHost(request);
    return NextResponse.json({
      configured: isShopifyRuntimeConfigured(),
      environment: getShopifyEnvironment(),
      liveExecutionScheduled: false,
    });
  } catch (error) {
    const safe = safeRouteError(error);
    return NextResponse.json({ error: safe.category }, { status: safe.status });
  }
}
