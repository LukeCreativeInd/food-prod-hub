import "server-only";

import { randomUUID } from "node:crypto";

import { getShopifyWorkerEnvironment } from "./config";
import {
  ORDER_QUERY,
  ORDERS_PAGE_QUERY,
  PRODUCT_QUERY,
  PRODUCTS_PAGE_QUERY,
  ShopifyGraphqlError,
  shopifyGraphqlRequest,
} from "./graphql";
import { normalizeShopifyOrderProjection } from "./normalization";
import {
  archiveCatalogueProduct,
  claimConnectorJobs,
  completeConnectorJob,
  completeObservationAttempt,
  completePrivacyRequest,
  enqueueNextSyncPage,
  failSyncRun,
  updateConnectionHealth,
  updateSyncRunProgress,
  upsertCatalogueItem,
  upsertOrderProjection,
} from "./repository";
import type { ShopifyConnectorJob } from "./types";

function reference(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

async function processOrderJob(job: ShopifyConnectorJob) {
  if (!job.connection_id) {
    return "ignored" as const;
  }

  const orderId = reference(job.reference_data.provider_order_id);
  if (!orderId?.startsWith("gid://shopify/Order/")) {
    throw new ShopifyGraphqlError(
      "order_reference_missing",
      "Webhook did not include a canonical order GID.",
      false,
    );
  }

  const response = await shopifyGraphqlRequest<{
    order: Record<string, unknown> | null;
  }>(job.connection_id, ORDER_QUERY, { id: orderId });

  if (!response.data.order) {
    return "ignored" as const;
  }

  const normalized = normalizeShopifyOrderProjection(response.data.order);
  await upsertOrderProjection({
    connectionId: job.connection_id,
    ...normalized,
  });

  return "succeeded" as const;
}

async function processProductJob(job: ShopifyConnectorJob) {
  if (!job.connection_id) {
    return "ignored" as const;
  }

  const productId = reference(job.reference_data.provider_product_id);
  if (!productId?.startsWith("gid://shopify/Product/")) {
    throw new ShopifyGraphqlError(
      "product_reference_missing",
      "Webhook did not include a canonical product GID.",
      false,
    );
  }

  if (job.topic === "products/delete") {
    await archiveCatalogueProduct({
      connectionId: job.connection_id,
      productId,
      observedAt:
        reference(job.reference_data.provider_updated_at) ??
        new Date().toISOString(),
    });
    return "succeeded" as const;
  }

  const response = await shopifyGraphqlRequest<{
    product: {
      id: string;
      title: string;
      status: string;
      updatedAt: string;
      variants: {
        nodes: Array<{ id: string; title: string; sku: string | null }>;
        pageInfo: { hasNextPage: boolean };
      };
    } | null;
  }>(job.connection_id, PRODUCT_QUERY, { id: productId });

  if (!response.data.product) {
    return "ignored" as const;
  }

  const observedAt = new Date().toISOString();
  for (const variant of response.data.product.variants.nodes) {
    await upsertCatalogueItem({
      connectionId: job.connection_id,
      productId: response.data.product.id,
      variantId: variant.id,
      sku: variant.sku,
      productTitle: response.data.product.title,
      variantTitle: variant.title,
      status: response.data.product.status,
      providerUpdatedAt: response.data.product.updatedAt,
      observedAt,
    });
  }

  if (response.data.product.variants.pageInfo.hasNextPage) {
    throw new ShopifyGraphqlError(
      "product_variant_pagination_required",
      "Product has more than 250 variants; resumable variant pagination is required.",
      false,
    );
  }

  return "succeeded" as const;
}

async function processProductDiscoveryPage(job: ShopifyConnectorJob) {
  if (!job.connection_id) return "ignored" as const;

  const cursor = reference(job.reference_data.cursor);
  const response = await shopifyGraphqlRequest<{
    products: {
      nodes: Array<{
        id: string;
        title: string;
        status: string;
        updatedAt: string;
        variants: {
          nodes: Array<{ id: string; title: string; sku: string | null }>;
          pageInfo: { hasNextPage: boolean };
        };
      }>;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  }>(job.connection_id, PRODUCTS_PAGE_QUERY, { after: cursor });

  let variantCount = 0;
  const observedAt = new Date().toISOString();
  for (const product of response.data.products.nodes) {
    if (product.variants.pageInfo.hasNextPage) {
      throw new ShopifyGraphqlError(
        "product_variant_pagination_required",
        "Product has more than 250 variants.",
        false,
      );
    }

    for (const variant of product.variants.nodes) {
      await upsertCatalogueItem({
        connectionId: job.connection_id,
        productId: product.id,
        variantId: variant.id,
        sku: variant.sku,
        productTitle: product.title,
        variantTitle: variant.title,
        status: product.status,
        providerUpdatedAt: product.updatedAt,
        observedAt,
      });
      variantCount += 1;
    }
  }

  const nextCursor = response.data.products.pageInfo.endCursor;
  const complete = !response.data.products.pageInfo.hasNextPage || !nextCursor;
  if (!complete && nextCursor) await enqueueNextSyncPage(job, nextCursor);
  await updateSyncRunProgress({
    job,
    cursor: nextCursor,
    complete,
    observations: response.data.products.nodes.length,
    linesCreatedOrUpdated: variantCount,
  });
  return "succeeded" as const;
}

function orderSearchQuery(job: ShopifyConnectorJob) {
  const from = reference(job.reference_data.window_from);
  const to = reference(job.reference_data.window_to);
  const parts: string[] = [];
  if (from) parts.push(`updated_at:>=${from}`);
  if (to) parts.push(`updated_at:<=${to}`);
  return parts.join(" ") || "updated_at:>=1970-01-01T00:00:00Z";
}

async function processOrderSyncPage(job: ShopifyConnectorJob) {
  if (!job.connection_id) return "ignored" as const;

  const cursor = reference(job.reference_data.cursor);
  const response = await shopifyGraphqlRequest<{
    orders: {
      nodes: Array<Record<string, unknown>>;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  }>(job.connection_id, ORDERS_PAGE_QUERY, {
    after: cursor,
    query: orderSearchQuery(job),
  });

  let lineCount = 0;
  for (const order of response.data.orders.nodes) {
    const normalized = normalizeShopifyOrderProjection(order);
    await upsertOrderProjection({ connectionId: job.connection_id, ...normalized });
    lineCount += normalized.lines.length;
  }

  const nextCursor = response.data.orders.pageInfo.endCursor;
  const complete = !response.data.orders.pageInfo.hasNextPage || !nextCursor;
  if (!complete && nextCursor) await enqueueNextSyncPage(job, nextCursor);
  await updateSyncRunProgress({
    job,
    cursor: nextCursor,
    complete,
    observations: response.data.orders.nodes.length,
    ordersCreatedOrUpdated: response.data.orders.nodes.length,
    linesCreatedOrUpdated: lineCount,
  });
  return "succeeded" as const;
}

async function processJob(job: ShopifyConnectorJob) {
  if (job.job_kind === "privacy") {
    await completePrivacyRequest(
      job.environment,
      job.provider_event_id,
      job.topic === "shop/redact"
        ? "legal_review_required"
        : "no_customer_pii_persisted",
    );
    return "succeeded" as const;
  }

  if (job.topic === "system/product_discovery") {
    return processProductDiscoveryPage(job);
  }

  if (
    job.topic === "system/order_backfill" ||
    job.topic === "system/reconciliation"
  ) {
    return processOrderSyncPage(job);
  }

  if (job.topic === "app/uninstalled") {
    return "succeeded" as const;
  }

  if (job.topic.startsWith("orders/") || job.topic === "refunds/create") {
    return processOrderJob(job);
  }

  if (job.topic.startsWith("products/")) {
    return processProductJob(job);
  }

  return "ignored" as const;
}

export async function runShopifyWorkerBatch(limit = 5) {
  const environment = getShopifyWorkerEnvironment();
  const workerId = `everybatch-${randomUUID()}`;
  const jobs = await claimConnectorJobs(
    environment,
    workerId,
    Math.min(Math.max(limit, 1), 10),
  );
  const results: Array<{ jobId: string; status: string }> = [];

  for (const job of jobs) {
    if (job.environment !== environment) {
      throw new Error("claimed_job_environment_mismatch");
    }

    try {
      if (job.connection_id) {
        await updateConnectionHealth(job.connection_id, { health: "syncing" });
      }

      const status = await processJob(job);
      await completeConnectorJob({
        environment,
        jobId: job.id,
        workerId,
        status,
      });

      if (job.connection_id) {
        await completeObservationAttempt(job.connection_id, job.provider_event_id, {
          status: status === "succeeded" ? "processed" : "ignored",
        });
        await updateConnectionHealth(job.connection_id, {
          health: "healthy",
          succeeded: status === "succeeded",
        });
      }

      results.push({ jobId: job.id, status });
    } catch (error) {
      const shopifyError = error instanceof ShopifyGraphqlError ? error : null;
      const retryable = shopifyError?.retryable === true && job.attempt_count < 5;
      const category = shopifyError?.category ?? "processing_failed";

      await completeConnectorJob({
        environment,
        jobId: job.id,
        workerId,
        status: retryable ? "retryable_failed" : "permanent_failed",
        retryAfter: retryable
          ? new Date(Date.now() + Math.min(30, 2 ** job.attempt_count) * 60_000)
          : undefined,
        safeErrorCategory: category,
      });

      if (job.connection_id) {
        if (!retryable) {
          await completeObservationAttempt(job.connection_id, job.provider_event_id, {
            status: "failed",
            safeErrorCategory: category,
          });
        }
        await updateConnectionHealth(job.connection_id, {
          health: retryable ? "degraded" : "error",
          errorCategory: category,
        });
      }

      if (!retryable) {
        await failSyncRun(job, category);
      }

      results.push({
        jobId: job.id,
        status: retryable ? "retryable_failed" : "permanent_failed",
      });
    }
  }

  return { workerId, claimed: jobs.length, results };
}
