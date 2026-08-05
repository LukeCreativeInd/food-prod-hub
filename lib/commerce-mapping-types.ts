export type CommerceMappingKind = "direct" | "bundle" | "exclusion";

export type CommerceMappingStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "superseded"
  | "archived";

export type CommerceMappingFilter =
  | "all"
  | "unresolved"
  | "pending"
  | "approved"
  | "excluded"
  | "error"
  | "archived";

export type CommerceMappingReadiness =
  | "not_started"
  | "in_progress"
  | "ready"
  | "blocked";

export type CommerceMappingSchemaStatus =
  | "ready"
  | "schema_missing"
  | "permission_denied"
  | "query_error";

export type CommerceConnectionRow = {
  id: string;
  storefront_display_name: string;
  provider_domain: string | null;
  environment: string;
  business_status: string;
  discovery_status: string;
  mapping_readiness: CommerceMappingReadiness;
  bundle_readiness: string;
};

export type CommerceCatalogueItemRow = {
  id: string;
  connection_id: string;
  provider_product_id: string;
  provider_variant_id: string;
  source_sku: string | null;
  source_product_title: string;
  source_variant_title: string | null;
  source_status: string | null;
  last_observed_at: string;
  archived_at: string | null;
};

export type CommerceMappingRow = {
  id: string;
  connection_id: string;
  external_catalogue_item_id: string;
  provider_variant_id: string;
  mapping_kind: CommerceMappingKind;
  status: CommerceMappingStatus;
  version_number: number;
  supersedes_mapping_id: string | null;
  safe_note: string | null;
  submitted_by_profile_id: string | null;
  submitted_at: string | null;
  approved_by_profile_id: string | null;
  approved_at: string | null;
  rejected_by_profile_id: string | null;
  rejected_at: string | null;
  rejection_reason_category: string | null;
  created_by_profile_id: string;
  updated_by_profile_id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type CommerceMappingOutputRow = {
  id: string;
  mapping_id: string;
  internal_item_id: string;
  quantity_multiplier: number;
  output_uom: string;
  sequence: number;
  output_role: string;
  created_at: string;
};

export type CommerceMappingEventRow = {
  id: string;
  mapping_id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  reason_category: string | null;
  safe_summary: string | null;
  actor_profile_id: string;
  created_at: string;
};

export type CommerceMappingInternalItem = {
  id: string;
  itemType: "finished_product" | "component";
  displayName: string;
  baseUnit: string;
  status: string;
  archivedAt: string | null;
};

export type CommerceMappingResolvedState =
  | "unresolved"
  | "pending"
  | "approved"
  | "excluded"
  | "error"
  | "archived";

export type CommerceCatalogueMappingItem = CommerceCatalogueItemRow & {
  resolvedState: CommerceMappingResolvedState;
  currentMapping: CommerceMappingRow | null;
  currentOutputs: CommerceMappingOutputRow[];
  hasInvalidTarget: boolean;
};

export type CommerceMappingReadinessSummary = {
  activeCount: number;
  unresolvedCount: number;
  pendingCount: number;
  approvedCount: number;
  excludedCount: number;
  errorCount: number;
  archivedCount: number;
  readiness: CommerceMappingReadiness;
};
