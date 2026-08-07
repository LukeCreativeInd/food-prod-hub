import { notFound } from "next/navigation";

import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ReviewRow = {
  id: string;
  organisation_id: string;
  facility_id: string;
  production_date: string;
  version_number: number;
  status: "draft" | "reviewed" | "stale" | "frozen" | "cancelled";
  capture_fingerprint: string;
  contribution_count: number;
  source_order_count: number;
  source_line_count: number;
  connection_count: number;
  demand_line_count: number;
  external_contribution_count: number;
  external_source_line_count: number;
  scoped_blocker_count: number;
  unscoped_blocker_count: number;
  exclusion_count: number;
  inactive_source_count: number;
  review_note: string | null;
  created_by_profile_id: string;
  created_at: string;
  reviewed_by_profile_id: string | null;
  reviewed_at: string | null;
  unscoped_blockers_acknowledged_at: string | null;
  frozen_by_profile_id: string | null;
  frozen_at: string | null;
  stale_at: string | null;
  cancelled_at: string | null;
};

type ReviewLineRow = {
  id: string;
  internal_item_id: string;
  output_uom: string;
  frozen_quantity: number | string;
  source_order_count: number;
  source_line_count: number;
  contribution_count: number;
  connection_count: number;
};

type ContributionRow = {
  id: string;
  source_contribution_id: string;
  connection_id: string;
  source_order_id: string;
  source_order_line_id: string;
  mapping_id: string;
  mapping_output_id: string;
  delivery_interpretation_id: string;
  internal_item_id: string;
  output_uom: string;
  contribution_quantity: number | string;
  contribution_input_fingerprint: string;
};

type IssueRow = {
  id: string;
  source_issue_id: string;
  source_order_id: string;
  source_order_line_id: string;
  classification: "blocked" | "excluded" | "inactive_source";
  issue_category: string;
  scope_classification: "scoped" | "unscoped";
};

type ExternalCommitmentRow = {
  id: string;
  commitment_owner_id: string;
  owner_frozen_review_id: string;
  source_contribution_id: string;
  source_order_id: string;
  source_order_line_id: string;
  internal_item_id: string;
  output_uom: string;
  current_quantity: number | string;
  contribution_input_fingerprint: string;
};

type DeltaRow = {
  id: string;
  version_number: number;
  status: "pending_review" | "approved" | "rejected" | "stale" | "superseded";
  comparison_fingerprint: string;
  source_delta_count: number;
  aggregate_line_count: number;
  positive_source_count: number;
  negative_source_count: number;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_category: string | null;
};

type DeltaLineRow = {
  id: string;
  facility_id: string;
  production_date: string;
  internal_item_id: string;
  output_uom: string;
  signed_delta_quantity: number | string;
  positive_source_count: number;
  negative_source_count: number;
  source_delta_count: number;
};

type DeltaContributionRow = {
  id: string;
  source_order_id: string;
  source_order_line_id: string;
  facility_id: string;
  production_date: string;
  internal_item_id: string;
  output_uom: string;
  frozen_quantity: number | string;
  current_quantity: number | string;
  signed_delta_quantity: number | string;
  change_category: string;
};

type EffectiveRow = {
  frozen_review_id: string;
  approved_delta_version_id: string | null;
  facility_id: string;
  production_date: string;
  internal_item_id: string;
  output_uom: string;
  frozen_quantity: number | string;
  approved_delta_quantity: number | string;
  effective_quantity: number | string;
};

type ItemRow = { id: string; display_name: string };
type FacilityRow = { id: string; code: string; name: string };
type ProfileRow = { id: string; full_name: string | null; email: string };

function short(value: string) {
  return value.slice(0, 8);
}

function dateTime(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function mapNames<T extends { internalItemId: string }>(
  rows: T[],
  items: Map<string, string>,
) {
  return rows.map((row) => ({
    ...row,
    internalItemName:
      items.get(row.internalItemId) ?? `Internal item ${short(row.internalItemId)}`,
  }));
}

export async function getProductionDemandReviewDetail(reviewId: string) {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("production.view");
  if (!authContext.organisation) throw new Error("Current organisation is required.");
  const organisationId = authContext.organisation.id;
  const supabase = await createClient();

  const reviewResult = await supabase
    .from("production_demand_reviews")
    .select("*")
    .eq("organisation_id", organisationId)
    .eq("id", reviewId)
    .maybeSingle();
  if (reviewResult.error || !reviewResult.data) notFound();
  const review = reviewResult.data as ReviewRow;

  const [linesResult, contributionsResult, externalResult, issuesResult, deltasResult, facilityResult] =
    await Promise.all([
      supabase.from("production_demand_review_lines").select("id,internal_item_id,output_uom,frozen_quantity,source_order_count,source_line_count,contribution_count,connection_count").eq("organisation_id", organisationId).eq("review_id", reviewId).order("internal_item_id"),
      supabase.from("production_demand_review_contributions").select("id,source_contribution_id,connection_id,source_order_id,source_order_line_id,mapping_id,mapping_output_id,delivery_interpretation_id,internal_item_id,output_uom,contribution_quantity,contribution_input_fingerprint").eq("organisation_id", organisationId).eq("review_id", reviewId).order("source_order_line_id"),
      supabase.from("production_demand_review_external_commitments").select("id,commitment_owner_id,owner_frozen_review_id,source_contribution_id,source_order_id,source_order_line_id,internal_item_id,output_uom,current_quantity,contribution_input_fingerprint").eq("organisation_id", organisationId).eq("review_id", reviewId).order("source_order_line_id"),
      supabase.from("production_demand_review_issues").select("id,source_issue_id,source_order_id,source_order_line_id,classification,issue_category,scope_classification").eq("organisation_id", organisationId).eq("review_id", reviewId).order("scope_classification"),
      supabase.from("production_demand_delta_versions").select("id,version_number,status,comparison_fingerprint,source_delta_count,aggregate_line_count,positive_source_count,negative_source_count,created_at,approved_at,rejected_at,rejection_category").eq("organisation_id", organisationId).eq("frozen_review_id", reviewId).order("version_number", { ascending: false }),
      supabase.from("facilities").select("id,code,name").eq("organisation_id", organisationId).eq("id", review.facility_id).maybeSingle(),
    ]);

  if (linesResult.error || contributionsResult.error || externalResult.error || issuesResult.error || deltasResult.error) {
    throw new Error("Production Demand review evidence could not be loaded.");
  }

  const rawLines = (linesResult.data ?? []) as ReviewLineRow[];
  const rawContributions = (contributionsResult.data ?? []) as ContributionRow[];
  const rawExternal = (externalResult.data ?? []) as ExternalCommitmentRow[];
  const itemIds = [...new Set([...rawLines.map((row) => row.internal_item_id), ...rawContributions.map((row) => row.internal_item_id), ...rawExternal.map((row) => row.internal_item_id)])];
  const itemsResult = itemIds.length > 0
    ? await supabase.from("internal_items").select("id,display_name").eq("organisation_id", organisationId).in("id", itemIds)
    : { data: [] as ItemRow[], error: null };
  const items = new Map(((itemsResult.data ?? []) as ItemRow[]).map((item) => [item.id, item.display_name]));

  const actorIds = [review.created_by_profile_id, review.reviewed_by_profile_id, review.frozen_by_profile_id].filter((id): id is string => Boolean(id));
  const profilesResult = actorIds.length > 0
    ? await supabase.from("profiles").select("id,full_name,email").in("id", actorIds)
    : { data: [] as ProfileRow[], error: null };
  const profiles = new Map(((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile.full_name || profile.email]));

  const effectiveResult = review.status === "frozen"
    ? await supabase.rpc("get_production_demand_effective_frozen", { p_frozen_review_id: reviewId })
    : { data: [] as EffectiveRow[], error: null };

  return {
    canManage: permissionKeys.includes("production.manage"),
    review: {
      id: review.id,
      facilityId: review.facility_id,
      facilityName: facilityResult.data
        ? `${(facilityResult.data as FacilityRow).code} - ${(facilityResult.data as FacilityRow).name}`
        : `Facility ${short(review.facility_id)}`,
      productionDate: review.production_date,
      versionNumber: review.version_number,
      status: review.status,
      captureFingerprint: review.capture_fingerprint,
      contributionCount: review.contribution_count,
      sourceOrderCount: review.source_order_count,
      sourceLineCount: review.source_line_count,
      connectionCount: review.connection_count,
      demandLineCount: review.demand_line_count,
      externalContributionCount: review.external_contribution_count,
      externalSourceLineCount: review.external_source_line_count,
      scopedBlockerCount: review.scoped_blocker_count,
      unscopedBlockerCount: review.unscoped_blocker_count,
      exclusionCount: review.exclusion_count,
      inactiveSourceCount: review.inactive_source_count,
      reviewNote: review.review_note,
      createdBy: profiles.get(review.created_by_profile_id) ?? `Profile ${short(review.created_by_profile_id)}`,
      createdAt: dateTime(review.created_at),
      reviewedBy: review.reviewed_by_profile_id ? profiles.get(review.reviewed_by_profile_id) ?? `Profile ${short(review.reviewed_by_profile_id)}` : null,
      reviewedAt: dateTime(review.reviewed_at),
      blockersAcknowledgedAt: dateTime(review.unscoped_blockers_acknowledged_at),
      frozenBy: review.frozen_by_profile_id ? profiles.get(review.frozen_by_profile_id) ?? `Profile ${short(review.frozen_by_profile_id)}` : null,
      frozenAt: dateTime(review.frozen_at),
      staleAt: dateTime(review.stale_at),
      cancelledAt: dateTime(review.cancelled_at),
    },
    lines: mapNames(rawLines.map((row) => ({ id: row.id, internalItemId: row.internal_item_id, outputUom: row.output_uom, quantity: String(row.frozen_quantity), sourceOrderCount: row.source_order_count, sourceLineCount: row.source_line_count, contributionCount: row.contribution_count, connectionCount: row.connection_count })), items),
    contributions: mapNames(rawContributions.map((row) => ({ id: row.id, sourceContributionId: row.source_contribution_id, connectionId: row.connection_id, sourceOrderId: row.source_order_id, sourceOrderLineId: row.source_order_line_id, mappingId: row.mapping_id, mappingOutputId: row.mapping_output_id, interpretationId: row.delivery_interpretation_id, internalItemId: row.internal_item_id, outputUom: row.output_uom, quantity: String(row.contribution_quantity), fingerprint: row.contribution_input_fingerprint })), items),
    externalCommitments: mapNames(rawExternal.map((row) => ({ id: row.id, commitmentOwnerId: row.commitment_owner_id, ownerReviewId: row.owner_frozen_review_id, sourceContributionId: row.source_contribution_id, sourceOrderId: row.source_order_id, sourceOrderLineId: row.source_order_line_id, internalItemId: row.internal_item_id, outputUom: row.output_uom, quantity: String(row.current_quantity), fingerprint: row.contribution_input_fingerprint })), items),
    issues: (issuesResult.data ?? []) as IssueRow[],
    deltas: ((deltasResult.data ?? []) as DeltaRow[]).map((delta) => ({ id: delta.id, versionNumber: delta.version_number, status: delta.status, comparisonFingerprint: delta.comparison_fingerprint, sourceDeltaCount: delta.source_delta_count, aggregateLineCount: delta.aggregate_line_count, positiveSourceCount: delta.positive_source_count, negativeSourceCount: delta.negative_source_count, createdAt: dateTime(delta.created_at), approvedAt: dateTime(delta.approved_at), rejectedAt: dateTime(delta.rejected_at), rejectionCategory: delta.rejection_category })),
    effective: ((effectiveResult.data ?? []) as EffectiveRow[]).map((row) => ({ approvedDeltaVersionId: row.approved_delta_version_id, facilityId: row.facility_id, productionDate: row.production_date, internalItemId: row.internal_item_id, internalItemName: items.get(row.internal_item_id) ?? `Internal item ${short(row.internal_item_id)}`, outputUom: row.output_uom, frozenQuantity: String(row.frozen_quantity), approvedDeltaQuantity: String(row.approved_delta_quantity), effectiveQuantity: String(row.effective_quantity) })),
  };
}

export async function getProductionDemandDeltaDetail(reviewId: string, deltaVersionId: string) {
  const reviewData = await getProductionDemandReviewDetail(reviewId);
  const delta = reviewData.deltas.find((candidate) => candidate.id === deltaVersionId);
  if (!delta) notFound();
  const { authContext } = await requirePermissionAccessWithPermissions("production.view");
  if (!authContext.organisation) throw new Error("Current organisation is required.");
  const supabase = await createClient();
  const [linesResult, evidenceResult] = await Promise.all([
    supabase.from("production_demand_delta_lines").select("id,facility_id,production_date,internal_item_id,output_uom,signed_delta_quantity,positive_source_count,negative_source_count,source_delta_count").eq("organisation_id", authContext.organisation.id).eq("delta_version_id", deltaVersionId).order("production_date"),
    supabase.from("production_demand_delta_contributions").select("id,source_order_id,source_order_line_id,facility_id,production_date,internal_item_id,output_uom,frozen_quantity,current_quantity,signed_delta_quantity,change_category").eq("organisation_id", authContext.organisation.id).eq("delta_version_id", deltaVersionId).order("source_order_line_id"),
  ]);
  if (linesResult.error || evidenceResult.error) throw new Error("Production Demand delta evidence could not be loaded.");
  const rawLines = (linesResult.data ?? []) as DeltaLineRow[];
  const rawEvidence = (evidenceResult.data ?? []) as DeltaContributionRow[];
  const itemIds = [...new Set([...rawLines.map((row) => row.internal_item_id), ...rawEvidence.map((row) => row.internal_item_id)])];
  const itemsResult = itemIds.length > 0 ? await supabase.from("internal_items").select("id,display_name").eq("organisation_id", authContext.organisation.id).in("id", itemIds) : { data: [] as ItemRow[] };
  const items = new Map(((itemsResult.data ?? []) as ItemRow[]).map((item) => [item.id, item.display_name]));
  return {
    ...reviewData,
    delta,
    deltaLines: mapNames(rawLines.map((row) => ({ id: row.id, facilityId: row.facility_id, productionDate: row.production_date, internalItemId: row.internal_item_id, outputUom: row.output_uom, signedDeltaQuantity: String(row.signed_delta_quantity), positiveSourceCount: row.positive_source_count, negativeSourceCount: row.negative_source_count, sourceDeltaCount: row.source_delta_count })), items),
    deltaEvidence: mapNames(rawEvidence.map((row) => ({ id: row.id, sourceOrderId: row.source_order_id, sourceOrderLineId: row.source_order_line_id, facilityId: row.facility_id, productionDate: row.production_date, internalItemId: row.internal_item_id, outputUom: row.output_uom, frozenQuantity: String(row.frozen_quantity), currentQuantity: String(row.current_quantity), signedDeltaQuantity: String(row.signed_delta_quantity), changeCategory: row.change_category })), items),
  };
}
