export type ShopifyEnvironment = "development" | "staging" | "production";

export type EncryptedValue = {
  ciphertext: string;
  iv: string;
  tag: string;
};

export type ShopifyCredentialRecord = {
  id: string;
  installation_id: string;
  organisation_id: string | null;
  connection_id: string | null;
  environment: ShopifyEnvironment;
  access_token_ciphertext: string;
  access_token_iv: string;
  access_token_tag: string;
  refresh_token_ciphertext: string | null;
  refresh_token_iv: string | null;
  refresh_token_tag: string | null;
  access_token_expires_at: string | null;
  refresh_token_expires_at: string | null;
  encryption_key_version: string;
  credential_status: "active" | "refresh_required" | "revoked" | "invalid";
};

export type ShopifyConnectorJob = {
  id: string;
  installation_id: string;
  organisation_id: string | null;
  connection_id: string | null;
  environment: ShopifyEnvironment;
  job_kind:
    | "webhook"
    | "product_discovery"
    | "order_backfill"
    | "reconciliation"
    | "privacy";
  topic: string;
  provider_event_id: string;
  reference_data: Record<string, unknown>;
  attempt_count: number;
};

export type NormalizedShopifyOrder = {
  provider_order_id: string;
  provider_order_reference: string | null;
  provider_order_status: string | null;
  financial_status: string | null;
  fulfilment_status: string | null;
  cancellation_status: "not_cancelled" | "partially_cancelled" | "cancelled";
  refund_status: "none" | "partial" | "full" | "unknown";
  currency_code: string;
  is_test: boolean;
  is_draft: boolean;
  source_tags: string[];
  note_attributes: Array<{ name: string; value: string }>;
  provider_created_at: string | null;
  provider_updated_at: string;
  provider_cancelled_at: string | null;
  observed_at: string;
};

export type NormalizedShopifyLine = {
  provider_line_id: string;
  provider_product_id: string | null;
  provider_variant_id: string | null;
  source_sku: string | null;
  source_title: string;
  source_variant_title: string | null;
  source_unit: string | null;
  original_quantity: number;
  current_quantity: number;
  cancelled_quantity: number;
  refunded_quantity: number;
  lifecycle_status: "active" | "cancelled" | "removed" | "refunded";
  bundle_group_reference: string | null;
  parent_provider_line_id: string | null;
  selling_plan_reference: string | null;
  line_attributes: Record<string, string>;
};
