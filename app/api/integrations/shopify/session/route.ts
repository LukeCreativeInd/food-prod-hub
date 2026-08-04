import { RequestedTokenType } from "@shopify/shopify-api";
import { NextResponse } from "next/server";

import { SHOPIFY_API_VERSION } from "@/lib/shopify/constants";
import { createShopifyApi, getShopifyEnvironment } from "@/lib/shopify/config";
import { sha256 } from "@/lib/shopify/crypto";
import {
  normalizeShopifyDomain,
  safeShopifyGid,
  shopDomainFromSessionDestination,
} from "@/lib/shopify/identity";
import { storeVerifiedInstallation } from "@/lib/shopify/repository";
import {
  assertShopifyRouteHost,
  safeRouteError,
} from "@/lib/shopify/runtime-boundary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ShopIdentityResponse = {
  shop: {
    id: string;
    name: string;
    myshopifyDomain: string;
    ianaTimezone: string | null;
  };
};

const SHOP_IDENTITY_QUERY = `#graphql
  query EveryBatchVerifiedShopIdentity {
    shop {
      id
      name
      myshopifyDomain
      ianaTimezone
    }
  }
`;

export async function POST(request: Request) {
  try {
    assertShopifyRouteHost(request);

    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) {
      throw new Error("authentication_required");
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > 4096) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > 4096) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    let body: { claimToken?: unknown };
    try {
      body = (rawBody ? JSON.parse(rawBody) : {}) as { claimToken?: unknown };
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const claimToken =
      typeof body.claimToken === "string" && /^[0-9a-f]{64}$/.test(body.claimToken)
        ? body.claimToken
        : null;
    const sessionToken = authorization.slice("Bearer ".length).trim();
    const shopify = createShopifyApi();
    const payload = await shopify.session.decodeSessionToken(sessionToken);
    const shopDomain = shopDomainFromSessionDestination(payload.dest);
    const exchange = await shopify.auth.tokenExchange({
      shop: shopDomain,
      sessionToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
      expiring: true,
    });

    if (!exchange.session.accessToken) {
      throw new Error("shopify_offline_token_missing");
    }

    const client = new shopify.clients.Graphql({ session: exchange.session });
    const response = await client.request<ShopIdentityResponse>(
      SHOP_IDENTITY_QUERY,
      { retries: 1 },
    );

    if (response.errors?.graphQLErrors?.length || !response.data?.shop) {
      throw new Error("shopify_identity_query_failed");
    }

    const verifiedDomain = normalizeShopifyDomain(
      response.data.shop.myshopifyDomain,
    );
    const verifiedShopId = safeShopifyGid(response.data.shop.id, "Shop");

    if (verifiedDomain !== shopDomain || !verifiedShopId) {
      throw new Error("shopify_identity_mismatch");
    }

    const result = await storeVerifiedInstallation({
      environment: getShopifyEnvironment(),
      shopId: verifiedShopId,
      shopDomain: verifiedDomain,
      shopName: response.data.shop.name,
      shopTimezone: response.data.shop.ianaTimezone,
      scopes: exchange.session.scope
        ? exchange.session.scope.split(",").map((scope) => scope.trim()).filter(Boolean)
        : [],
      apiVersion: SHOPIFY_API_VERSION,
      accessToken: exchange.session.accessToken,
      refreshToken: exchange.session.refreshToken ?? null,
      accessTokenExpiresAt: exchange.session.expires ?? null,
      refreshTokenExpiresAt: exchange.session.refreshTokenExpires ?? null,
      claimTokenDigest: claimToken ? sha256(claimToken) : null,
    });

    return NextResponse.json({
      ok: true,
      shopDomain: verifiedDomain,
      installationStatus: result.installation_status,
      associationStatus: result.claimed ? "claimed" : "claim_required",
      connectionId: result.connection_id,
    });
  } catch (error) {
    const safe = safeRouteError(error);
    return NextResponse.json({ error: safe.category }, { status: safe.status });
  }
}
