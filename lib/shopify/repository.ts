import "server-only";

import { createTrustedSupabaseClient } from "@/lib/supabase/admin";

import { decryptShopifySecret, encryptShopifySecret } from "./crypto";
import { sha256 } from "./crypto";
import type {
  NormalizedShopifyLine,
  NormalizedShopifyOrder,
  ShopifyConnectorJob,
  ShopifyCredentialRecord,
  ShopifyEnvironment,
} from "./types";

function rpcError(operation: string, error: { message: string } | null) {
  if (error) {
    console.error(`[shopify] ${operation} failed`, { message: error.message });
    throw new Error(`${operation}_failed`);
  }
}

export async function storeVerifiedInstallation(input: {
  environment: ShopifyEnvironment;
  shopId: string;
  shopDomain: string;
  shopName: string;
  shopTimezone: string | null;
  scopes: string[];
  apiVersion: string;
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  claimTokenDigest: string | null;
}) {
  const access = encryptShopifySecret(input.accessToken);
  const refresh = input.refreshToken
    ? encryptShopifySecret(input.refreshToken)
    : null;
  const keyVersion = process.env.SHOPIFY_CREDENTIAL_KEY_VERSION;

  if (!keyVersion) {
    throw new Error("Shopify credential key version is not configured.");
  }

  const supabase = createTrustedSupabaseClient();
  const { data, error } = await supabase.rpc("store_verified_shopify_installation", {
    target_environment: input.environment,
    verified_shopify_shop_id: input.shopId,
    verified_shop_domain: input.shopDomain,
    verified_shop_display_name: input.shopName,
    verified_shop_timezone: input.shopTimezone ?? "",
    verified_granted_scopes: input.scopes,
    selected_api_version: input.apiVersion,
    encrypted_access_token: access.ciphertext,
    access_token_iv_value: access.iv,
    access_token_tag_value: access.tag,
    encrypted_refresh_token: refresh?.ciphertext ?? null,
    refresh_token_iv_value: refresh?.iv ?? null,
    refresh_token_tag_value: refresh?.tag ?? null,
    access_token_expiry: input.accessTokenExpiresAt?.toISOString() ?? null,
    refresh_token_expiry: input.refreshTokenExpiresAt?.toISOString() ?? null,
    selected_key_version: keyVersion,
    claim_token_digest_value: input.claimTokenDigest,
  });

  rpcError("store_verified_installation", error);
  return data as {
    installation_id: string;
    connection_id: string | null;
    claimed: boolean;
    installation_status: string;
  };
}

export async function acceptVerifiedWebhook(input: {
  environment: ShopifyEnvironment;
  shopDomain: string;
  webhookId: string;
  topic: string;
  apiVersion: string;
  triggeredAt: string;
  payloadDigest: string;
  referenceData: Record<string, string>;
}) {
  const supabase = createTrustedSupabaseClient();
  const { data, error } = await supabase.rpc("accept_shopify_webhook", {
    target_environment: input.environment,
    verified_shop_domain: input.shopDomain,
    verified_webhook_id: input.webhookId,
    verified_topic: input.topic,
    verified_api_version: input.apiVersion,
    verified_triggered_at: input.triggeredAt,
    verified_payload_digest: input.payloadDigest,
    redacted_reference_data: input.referenceData,
  });

  rpcError("accept_verified_webhook", error);
  return data as {
    accepted: boolean;
    duplicate: boolean;
    job_id: string;
  };
}

export async function claimConnectorJobs(
  environment: ShopifyEnvironment,
  workerId: string,
  limit: number,
) {
  const supabase = createTrustedSupabaseClient();
  const { data, error } = await supabase.rpc("claim_shopify_connector_jobs", {
    target_environment: environment,
    worker_identifier: workerId,
    claim_limit: limit,
  });

  rpcError("claim_connector_jobs", error);
  return (data ?? []) as ShopifyConnectorJob[];
}

export async function completeConnectorJob(input: {
  environment: ShopifyEnvironment;
  jobId: string;
  workerId: string;
  status: "succeeded" | "retryable_failed" | "permanent_failed" | "ignored";
  retryAfter?: Date;
  safeErrorCategory?: string;
}) {
  const supabase = createTrustedSupabaseClient();
  const { error } = await supabase.rpc("complete_shopify_connector_job", {
    target_environment: input.environment,
    target_job_id: input.jobId,
    worker_identifier: input.workerId,
    completion_status: input.status,
    retry_after: input.retryAfter?.toISOString() ?? null,
    safe_error_category_value: input.safeErrorCategory ?? null,
  });

  rpcError("complete_connector_job", error);
}

export async function loadCredentialForConnection(connectionId: string) {
  const supabase = createTrustedSupabaseClient();
  const { data, error } = await supabase
    .from("shopify_connection_credentials")
    .select(
      "id,installation_id,organisation_id,connection_id,environment,access_token_ciphertext,access_token_iv,access_token_tag,refresh_token_ciphertext,refresh_token_iv,refresh_token_tag,access_token_expires_at,refresh_token_expires_at,encryption_key_version,credential_status,shopify_installations!inner(shop_domain,granted_scopes,installation_status)",
    )
    .eq("connection_id", connectionId)
    .maybeSingle();

  if (error) {
    console.error("[shopify] credential lookup failed", { message: error.message });
    throw new Error("credential_lookup_failed");
  }

  if (!data || data.credential_status !== "active") {
    throw new Error("active_credential_not_found");
  }

  const row = data as unknown as ShopifyCredentialRecord & {
    shopify_installations: {
      shop_domain: string;
      granted_scopes: string[];
      installation_status: string;
    };
  };

  if (row.shopify_installations.installation_status !== "installed") {
    throw new Error("shopify_installation_not_active");
  }

  return {
    ...row,
    shopDomain: row.shopify_installations.shop_domain,
    scopes: row.shopify_installations.granted_scopes,
    accessToken: decryptShopifySecret({
      ciphertext: row.access_token_ciphertext,
      iv: row.access_token_iv,
      tag: row.access_token_tag,
    }),
    refreshToken:
      row.refresh_token_ciphertext && row.refresh_token_iv && row.refresh_token_tag
        ? decryptShopifySecret({
            ciphertext: row.refresh_token_ciphertext,
            iv: row.refresh_token_iv,
            tag: row.refresh_token_tag,
          })
        : null,
  };
}

export async function updateRefreshedCredential(
  credentialId: string,
  input: {
    accessToken: string;
    refreshToken: string | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
  },
) {
  const access = encryptShopifySecret(input.accessToken);
  const refresh = input.refreshToken
    ? encryptShopifySecret(input.refreshToken)
    : null;
  const supabase = createTrustedSupabaseClient();
  const { error } = await supabase
    .from("shopify_connection_credentials")
    .update({
      access_token_ciphertext: access.ciphertext,
      access_token_iv: access.iv,
      access_token_tag: access.tag,
      refresh_token_ciphertext: refresh?.ciphertext ?? null,
      refresh_token_iv: refresh?.iv ?? null,
      refresh_token_tag: refresh?.tag ?? null,
      access_token_expires_at: input.accessTokenExpiresAt?.toISOString() ?? null,
      refresh_token_expires_at: input.refreshTokenExpiresAt?.toISOString() ?? null,
      credential_status: "active",
      last_rotated_at: new Date().toISOString(),
    })
    .eq("id", credentialId)
    .eq("credential_status", "active");

  rpcError("update_refreshed_credential", error);
}

export async function upsertCatalogueItem(input: {
  connectionId: string;
  productId: string;
  variantId: string;
  sku: string | null;
  productTitle: string;
  variantTitle: string | null;
  status: string | null;
  providerUpdatedAt: string | null;
  observedAt: string;
}) {
  const supabase = createTrustedSupabaseClient();
  const { data, error } = await supabase.rpc("upsert_shopify_catalogue_item", {
    target_connection_id: input.connectionId,
    provider_product_id_value: input.productId,
    provider_variant_id_value: input.variantId,
    source_sku_value: input.sku ?? "",
    source_product_title_value: input.productTitle,
    source_variant_title_value: input.variantTitle ?? "",
    source_status_value: input.status ?? "",
    provider_updated_at_value: input.providerUpdatedAt,
    observed_at_value: input.observedAt,
  });

  rpcError("upsert_catalogue_item", error);
  return data;
}

export async function archiveCatalogueProduct(input: {
  connectionId: string;
  productId: string;
  observedAt: string;
}) {
  const supabase = createTrustedSupabaseClient();
  const { data, error } = await supabase.rpc("archive_shopify_catalogue_product", {
    target_connection_id: input.connectionId,
    provider_product_id_value: input.productId,
    observed_at_value: input.observedAt,
  });

  rpcError("archive_catalogue_product", error);
  return data as number;
}

export async function upsertOrderProjection(input: {
  connectionId: string;
  order: NormalizedShopifyOrder & { source_attributes: Record<string, string> };
  lines: NormalizedShopifyLine[];
  completeLineProjection: boolean;
}) {
  const supabase = createTrustedSupabaseClient();
  const { data, error } = await supabase.rpc("upsert_shopify_order_projection", {
    target_connection_id: input.connectionId,
    normalized_order: input.order,
    normalized_lines: input.lines,
    complete_line_projection: input.completeLineProjection,
  });

  rpcError("upsert_order_projection", error);
  return data as {
    source_order_id: string;
    projection_version: number;
    stale_ignored: boolean;
  };
}

export async function completePrivacyRequest(
  environment: ShopifyEnvironment,
  providerRequestId: string,
  outcome: "no_customer_pii_persisted" | "legal_review_required",
) {
  const supabase = createTrustedSupabaseClient();
  const { error } = await supabase
    .from("shopify_privacy_requests")
    .update({
      status: outcome === "legal_review_required" ? "legal_review_required" : "completed",
      safe_outcome_category: outcome,
      completed_at: new Date().toISOString(),
    })
    .eq("environment", environment)
    .eq("provider_request_id", providerRequestId)
    .eq("status", "queued");

  rpcError("complete_privacy_request", error);
}

export async function updateConnectionHealth(
  connectionId: string,
  input: {
    health: "healthy" | "degraded" | "error" | "syncing";
    errorCategory?: string | null;
    succeeded?: boolean;
  },
) {
  const now = new Date().toISOString();
  const supabase = createTrustedSupabaseClient();
  const { error } = await supabase
    .from("commerce_connections")
    .update({
      technical_health: input.health,
      unresolved_error_category: input.errorCategory ?? null,
      last_sync_attempted_at: now,
      last_sync_succeeded_at: input.succeeded ? now : undefined,
    })
    .eq("id", connectionId)
    .eq("provider_key", "shopify")
    .is("archived_at", null)
    .not("business_status", "in", "(revoked,archived)");

  rpcError("update_connection_health", error);
}

export async function completeObservationAttempt(
  connectionId: string,
  providerEventId: string,
  input: {
    status: "processed" | "ignored" | "failed";
    safeErrorCategory?: string | null;
  },
) {
  const supabase = createTrustedSupabaseClient();
  const now = new Date().toISOString();
  const { data: observation, error: observationError } = await supabase
    .from("commerce_source_observations")
    .update({
      processing_status: input.status,
      safe_error_category: input.safeErrorCategory ?? null,
      processed_at: now,
    })
    .eq("connection_id", connectionId)
    .eq("provider_event_id", providerEventId)
    .in("processing_status", ["pending", "processing"])
    .select("id")
    .maybeSingle();

  rpcError("complete_observation", observationError);

  if (!observation) {
    return;
  }

  const attemptStatus =
    input.status === "processed"
      ? "succeeded"
      : input.status === "ignored"
        ? "skipped"
        : "permanent_failed";
  const { error: attemptError } = await supabase
    .from("commerce_processing_attempts")
    .update({
      status: attemptStatus,
      retry_classification: input.status === "failed" ? "permanent" : "not_required",
      safe_error_category: input.safeErrorCategory ?? null,
      completed_at: now,
    })
    .eq("source_observation_id", observation.id)
    .eq("attempt_number", 1)
    .eq("status", "queued");

  rpcError("complete_processing_attempt", attemptError);
}

export async function enqueueNextSyncPage(
  job: ShopifyConnectorJob,
  cursor: string,
) {
  if (!job.connection_id || !job.organisation_id) {
    throw new Error("sync_job_connection_missing");
  }

  const syncRunId = job.reference_data.sync_run_id;
  if (typeof syncRunId !== "string") {
    throw new Error("sync_run_reference_missing");
  }

  const referenceData = { ...job.reference_data, cursor };
  const providerEventId = `system:${syncRunId}:${sha256(cursor).slice(0, 24)}`;
  const supabase = createTrustedSupabaseClient();
  const { error } = await supabase.from("shopify_connector_jobs").insert({
    installation_id: job.installation_id,
    organisation_id: job.organisation_id,
    connection_id: job.connection_id,
    environment: job.environment,
    job_kind: job.job_kind,
    topic: job.topic,
    provider_event_id: providerEventId,
    payload_digest: sha256(JSON.stringify(referenceData)),
    reference_data: referenceData,
  });

  rpcError("enqueue_next_sync_page", error);
}

export async function updateSyncRunProgress(input: {
  job: ShopifyConnectorJob;
  cursor: string | null;
  complete: boolean;
  observations: number;
  ordersCreatedOrUpdated?: number;
  linesCreatedOrUpdated?: number;
}) {
  const syncRunId = input.job.reference_data.sync_run_id;
  const checkpointId = input.job.reference_data.sync_checkpoint_id;

  if (
    typeof syncRunId !== "string" ||
    typeof checkpointId !== "string" ||
    !input.job.connection_id
  ) {
    throw new Error("sync_progress_reference_missing");
  }

  const supabase = createTrustedSupabaseClient();
  const now = new Date().toISOString();
  const { data: run, error: runReadError } = await supabase
    .from("commerce_sync_runs")
    .select("observations_received,orders_created,orders_updated,lines_created,lines_updated")
    .eq("id", syncRunId)
    .eq("connection_id", input.job.connection_id)
    .single();

  rpcError("read_sync_run_progress", runReadError);

  const { error: checkpointError } = await supabase
    .from("commerce_sync_checkpoints")
    .update({
      status: input.complete ? "idle" : "running",
      cursor_reference: input.cursor,
      last_attempted_at: now,
      last_succeeded_at: input.complete ? now : undefined,
      safe_error_category: null,
    })
    .eq("id", checkpointId)
    .eq("connection_id", input.job.connection_id);
  rpcError("update_sync_checkpoint", checkpointError);

  const { error: runError } = await supabase
    .from("commerce_sync_runs")
    .update({
      status: input.complete ? "succeeded" : "running",
      started_at: now,
      completed_at: input.complete ? now : null,
      observations_received:
        (run?.observations_received ?? 0) + input.observations,
      orders_updated:
        (run?.orders_updated ?? 0) + (input.ordersCreatedOrUpdated ?? 0),
      lines_updated:
        (run?.lines_updated ?? 0) + (input.linesCreatedOrUpdated ?? 0),
      safe_error_category: null,
      safe_error_summary: null,
    })
    .eq("id", syncRunId)
    .eq("connection_id", input.job.connection_id);
  rpcError("update_sync_run", runError);

  if (input.complete) {
    const readinessColumn =
      input.job.job_kind === "product_discovery"
        ? "discovery_status"
        : input.job.job_kind === "order_backfill"
          ? "backfill_status"
          : "reconciliation_status";
    const { error: connectionError } = await supabase
      .from("commerce_connections")
      .update({ [readinessColumn]: "complete" })
      .eq("id", input.job.connection_id)
      .eq("provider_key", "shopify");
    rpcError("update_sync_readiness", connectionError);
  }
}

export async function failSyncRun(job: ShopifyConnectorJob, category: string) {
  const syncRunId = job.reference_data.sync_run_id;
  const checkpointId = job.reference_data.sync_checkpoint_id;

  if (
    typeof syncRunId !== "string" ||
    typeof checkpointId !== "string" ||
    !job.connection_id
  ) {
    return;
  }

  const supabase = createTrustedSupabaseClient();
  const now = new Date().toISOString();
  const { error: checkpointError } = await supabase
    .from("commerce_sync_checkpoints")
    .update({
      status: "error",
      last_attempted_at: now,
      safe_error_category: category,
    })
    .eq("id", checkpointId)
    .eq("connection_id", job.connection_id);
  rpcError("fail_sync_checkpoint", checkpointError);

  const { error: runError } = await supabase
    .from("commerce_sync_runs")
    .update({
      status: "failed",
      completed_at: now,
      safe_error_category: category,
      safe_error_summary: "Shopify connector processing failed. Review the safe error category.",
    })
    .eq("id", syncRunId)
    .eq("connection_id", job.connection_id);
  rpcError("fail_sync_run", runError);

  const readinessColumn =
    job.job_kind === "product_discovery"
      ? "discovery_status"
      : job.job_kind === "order_backfill"
        ? "backfill_status"
        : "reconciliation_status";
  const { error: connectionError } = await supabase
    .from("commerce_connections")
    .update({ [readinessColumn]: "failed" })
    .eq("id", job.connection_id)
    .eq("provider_key", "shopify");
  rpcError("fail_sync_readiness", connectionError);
}
