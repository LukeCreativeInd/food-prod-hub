import "server-only";

import { Session } from "@shopify/shopify-api";

import { SHOPIFY_GRAPHQL_TIMEOUT_MS, SHOPIFY_REQUIRED_SCOPES } from "./constants";
import { createShopifyApi } from "./config";
import {
  loadCredentialForConnection,
  updateRefreshedCredential,
} from "./repository";

type GraphqlPayload<T> = {
  data?: T;
  errors?: Array<{ message?: string; extensions?: Record<string, unknown> }>;
  extensions?: {
    cost?: {
      requestedQueryCost?: number;
      actualQueryCost?: number;
      throttleStatus?: {
        currentlyAvailable?: number;
        restoreRate?: number;
      };
    };
  };
};

export class ShopifyGraphqlError extends Error {
  constructor(
    public readonly category: string,
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}

async function currentCredential(connectionId: string) {
  const credential = await loadCredentialForConnection(connectionId);
  const expiresAt = credential.access_token_expires_at
    ? new Date(credential.access_token_expires_at)
    : null;

  if (expiresAt && expiresAt.getTime() <= Date.now() + 5 * 60_000) {
    if (!credential.refreshToken) {
      throw new ShopifyGraphqlError("refresh_token_missing", "Credential refresh is required.", false);
    }

    const shopify = createShopifyApi();
    const refreshed = await shopify.auth.refreshToken({
      shop: credential.shopDomain,
      refreshToken: credential.refreshToken,
    });

    if (!refreshed.session.accessToken) {
      throw new ShopifyGraphqlError("token_refresh_failed", "Credential refresh failed.", true);
    }

    await updateRefreshedCredential(credential.id, {
      accessToken: refreshed.session.accessToken,
      refreshToken: refreshed.session.refreshToken ?? credential.refreshToken,
      accessTokenExpiresAt: refreshed.session.expires ?? null,
      refreshTokenExpiresAt: refreshed.session.refreshTokenExpires ?? null,
    });

    return {
      ...credential,
      accessToken: refreshed.session.accessToken,
      refreshToken: refreshed.session.refreshToken ?? credential.refreshToken,
      access_token_expires_at: refreshed.session.expires?.toISOString() ?? null,
    };
  }

  return credential;
}

export async function shopifyGraphqlRequest<T>(
  connectionId: string,
  query: string,
  variables: Record<string, unknown> = {},
) {
  const credential = await currentCredential(connectionId);

  if (!SHOPIFY_REQUIRED_SCOPES.every((scope) => credential.scopes.includes(scope))) {
    throw new ShopifyGraphqlError("scope_mismatch", "Required Shopify scopes are missing.", false);
  }

  const shopify = createShopifyApi();
  const session = new Session({
    id: `offline_${credential.shopDomain}`,
    shop: credential.shopDomain,
    state: "",
    isOnline: false,
    scope: credential.scopes.join(","),
    accessToken: credential.accessToken,
  });
  const client = new shopify.clients.Graphql({ session });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHOPIFY_GRAPHQL_TIMEOUT_MS);

  try {
    const response = await client.request<T>(query, {
      variables,
      retries: 1,
      signal: controller.signal,
    });
    const payload = response as GraphqlPayload<T>;

    if (payload.errors?.length) {
      const throttled = payload.errors.some(
        (error) => error.extensions?.code === "THROTTLED",
      );
      throw new ShopifyGraphqlError(
        throttled ? "graphql_throttled" : "graphql_error",
        "Shopify GraphQL request failed.",
        throttled,
      );
    }

    if (!payload.data) {
      throw new ShopifyGraphqlError("graphql_empty_response", "Shopify returned no data.", true);
    }

    return {
      data: payload.data,
      cost: payload.extensions?.cost ?? null,
    };
  } catch (error) {
    if (error instanceof ShopifyGraphqlError) {
      throw error;
    }

    const aborted = error instanceof Error && error.name === "AbortError";
    throw new ShopifyGraphqlError(
      aborted ? "graphql_timeout" : "graphql_transport_error",
      aborted ? "Shopify GraphQL request timed out." : "Shopify GraphQL transport failed.",
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const SHOP_QUERY = `#graphql
  query EveryBatchShopIdentity {
    shop {
      id
      name
      myshopifyDomain
      ianaTimezone
    }
  }
`;

export const ORDER_QUERY = `#graphql
  query EveryBatchOrder($id: ID!) {
    order(id: $id) {
      id
      name
      createdAt
      updatedAt
      cancelledAt
      closedAt
      displayFinancialStatus
      displayFulfillmentStatus
      currencyCode
      test
      sourceName
      tags
      customAttributes { key value }
      lineItems(first: 250) {
        nodes {
          id
          title
          variantTitle
          sku
          quantity
          currentQuantity
          customAttributes { key value }
          product { id }
          variant { id title sku }
          sellingPlan { name sellingPlanId }
        }
        pageInfo { hasNextPage endCursor }
      }
      refunds {
        refundLineItems(first: 250) {
          nodes { quantity lineItem { id } }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  }
`;

export const PRODUCT_QUERY = `#graphql
  query EveryBatchProduct($id: ID!) {
    product(id: $id) {
      id
      title
      status
      updatedAt
      variants(first: 250) {
        nodes { id title sku }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const ORDERS_PAGE_QUERY = `#graphql
  query EveryBatchOrdersPage($after: String, $query: String!) {
    orders(first: 50, after: $after, query: $query, sortKey: UPDATED_AT) {
      nodes {
        id
        name
        createdAt
        updatedAt
        cancelledAt
        closedAt
        displayFinancialStatus
        displayFulfillmentStatus
        currencyCode
        test
        sourceName
        tags
        customAttributes { key value }
        lineItems(first: 250) {
          nodes {
            id
            title
            variantTitle
            sku
            quantity
            currentQuantity
            customAttributes { key value }
            product { id }
            variant { id title sku }
            sellingPlan { name sellingPlanId }
          }
          pageInfo { hasNextPage endCursor }
        }
        refunds {
          refundLineItems(first: 250) {
            nodes { quantity lineItem { id } }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const PRODUCTS_PAGE_QUERY = `#graphql
  query EveryBatchProductsPage($after: String) {
    products(first: 50, after: $after, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        status
        updatedAt
        variants(first: 250) {
          nodes { id title sku }
          pageInfo { hasNextPage endCursor }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
