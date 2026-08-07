"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type DemandWorkflowResult = {
  ok?: boolean;
  status?: string;
  code?: string;
  review_id?: string;
  delta_version_id?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  return getString(formData, key) || null;
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function statusOf(result: DemandWorkflowResult | null, fallback = "error") {
  if (!result) return fallback;
  return result.ok
    ? result.status ?? result.code ?? fallback
    : result.code ?? result.status ?? fallback;
}

function redirectToDemand(status: string): never {
  redirect(`/production-demand?demand=${encodeURIComponent(status)}`);
}

function redirectToReview(reviewId: string, status: string): never {
  redirect(
    `/production-demand/reviews/${reviewId}?demand=${encodeURIComponent(status)}`,
  );
}

function redirectToDelta(
  reviewId: string,
  deltaVersionId: string,
  status: string,
): never {
  redirect(
    `/production-demand/reviews/${reviewId}/deltas/${deltaVersionId}?demand=${encodeURIComponent(status)}`,
  );
}

function revalidateDemand(reviewId?: string, deltaVersionId?: string) {
  revalidatePath("/production-demand");
  revalidatePath("/production");
  if (reviewId) revalidatePath(`/production-demand/reviews/${reviewId}`);
  if (reviewId && deltaVersionId) {
    revalidatePath(
      `/production-demand/reviews/${reviewId}/deltas/${deltaVersionId}`,
    );
  }
}

async function requireManageAccess() {
  const authContext = await requirePermissionAccess("production.manage");
  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }
  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
  };
}

export async function createProductionDemandReviewAction(formData: FormData) {
  const startedAt = Date.now();
  const authContext = await requireManageAccess();
  const facilityId = getString(formData, "facility_id");
  const productionDate = getString(formData, "production_date");

  if (!facilityId) redirectToDemand("facility_required");
  if (!isDate(productionDate)) redirectToDemand("production_date_required");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_production_demand_review", {
    p_organisation_id: authContext.organisationId,
    p_facility_id: facilityId,
    p_production_date: productionDate,
    p_review_note: getOptionalString(formData, "review_note"),
  });
  const result = data as DemandWorkflowResult | null;
  const status = error ? "error" : statusOf(result);
  logDevRouteTiming("production-demand.review.create", startedAt, { status });

  if (error || !result?.review_id) redirectToDemand(status);
  revalidateDemand(result.review_id);
  redirectToReview(result.review_id, status);
}

async function runReviewAction(
  formData: FormData,
  rpc:
    | "mark_production_demand_review_reviewed"
    | "acknowledge_production_demand_unscoped_blockers"
    | "cancel_production_demand_review",
) {
  await requireManageAccess();
  const reviewId = getString(formData, "review_id");
  if (!reviewId) redirectToDemand("review_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(rpc, { p_review_id: reviewId });
  const result = data as DemandWorkflowResult | null;
  const status = error ? "error" : statusOf(result);
  revalidateDemand(reviewId);
  redirectToReview(reviewId, status);
}

export async function markProductionDemandReviewReviewedAction(
  formData: FormData,
) {
  return runReviewAction(formData, "mark_production_demand_review_reviewed");
}

export async function acknowledgeProductionDemandBlockersAction(
  formData: FormData,
) {
  return runReviewAction(
    formData,
    "acknowledge_production_demand_unscoped_blockers",
  );
}

export async function cancelProductionDemandReviewAction(formData: FormData) {
  return runReviewAction(formData, "cancel_production_demand_review");
}

export async function freezeProductionDemandReviewAction(formData: FormData) {
  const startedAt = Date.now();
  await requireManageAccess();
  const reviewId = getString(formData, "review_id");
  if (!reviewId) redirectToDemand("review_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("freeze_production_demand_review", {
    p_review_id: reviewId,
    p_confirmation: getString(formData, "confirmation"),
  });
  const result = data as DemandWorkflowResult | null;
  const status = error ? "error" : statusOf(result);
  logDevRouteTiming("production-demand.review.freeze", startedAt, { status });
  revalidateDemand(reviewId);
  redirectToReview(reviewId, status);
}

export async function generateProductionDemandDeltaAction(formData: FormData) {
  const startedAt = Date.now();
  await requireManageAccess();
  const reviewId = getString(formData, "review_id");
  if (!reviewId) redirectToDemand("review_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_production_demand_delta", {
    p_frozen_review_id: reviewId,
  });
  const result = data as DemandWorkflowResult | null;
  const status = error ? "error" : statusOf(result);
  logDevRouteTiming("production-demand.delta.generate", startedAt, { status });
  revalidateDemand(reviewId, result?.delta_version_id);
  if (result?.delta_version_id) {
    redirectToDelta(reviewId, result.delta_version_id, status);
  }
  redirectToReview(reviewId, status);
}

export async function approveProductionDemandDeltaAction(formData: FormData) {
  const startedAt = Date.now();
  await requireManageAccess();
  const reviewId = getString(formData, "review_id");
  const deltaVersionId = getString(formData, "delta_version_id");
  if (!reviewId || !deltaVersionId) redirectToDemand("delta_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("approve_production_demand_delta", {
    p_delta_version_id: deltaVersionId,
  });
  const result = data as DemandWorkflowResult | null;
  const status = error ? "error" : statusOf(result);
  logDevRouteTiming("production-demand.delta.approve", startedAt, { status });
  revalidateDemand(reviewId, deltaVersionId);
  redirectToDelta(reviewId, deltaVersionId, status);
}

export async function rejectProductionDemandDeltaAction(formData: FormData) {
  await requireManageAccess();
  const reviewId = getString(formData, "review_id");
  const deltaVersionId = getString(formData, "delta_version_id");
  if (!reviewId || !deltaVersionId) redirectToDemand("delta_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reject_production_demand_delta", {
    p_delta_version_id: deltaVersionId,
    p_rejection_category: getString(formData, "rejection_category"),
    p_rejection_note: getOptionalString(formData, "rejection_note"),
  });
  const result = data as DemandWorkflowResult | null;
  const status = error ? "error" : statusOf(result);
  revalidateDemand(reviewId, deltaVersionId);
  redirectToDelta(reviewId, deltaVersionId, status);
}
