"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { QA_HOLD_REASON_CATEGORIES, QA_PERMISSIONS } from "@/lib/qa-schema-types";
import { createClient } from "@/lib/supabase/server";

type QaHoldRpcResult = {
  ok?: boolean;
  status?: string;
  code?: string;
  message?: string;
  hold_id?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalUuid(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value || null;
}

function normaliseDateTime(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function statusParam(result: QaHoldRpcResult | null, fallback = "error") {
  if (result?.ok) {
    return result.code ?? result.status ?? "ok";
  }

  return result?.code ?? result?.status ?? fallback;
}

export async function placeQaInventoryLotHoldAction(formData: FormData) {
  const access = await requirePermissionAccess(QA_PERMISSIONS.holdsPlace);
  const inventoryLotId = getString(formData, "inventory_lot_id");
  const reasonCategory = getString(formData, "reason_category") || "qa_review";
  const reason = getString(formData, "reason");
  const notes = getString(formData, "notes") || null;
  const sourceCheckInstanceId = getOptionalUuid(formData, "source_check_instance_id");
  const sourceCheckResultId = getOptionalUuid(formData, "source_check_result_id");
  const sourceReviewId = getOptionalUuid(formData, "source_review_id");
  const reviewDueAt = normaliseDateTime(getString(formData, "review_due_at"));
  const returnTo = getString(formData, "return_to") || "/qa/holds";

  if (!access.organisation) {
    redirect("/select-workspace");
  }

  if (!inventoryLotId || !reason) {
    redirect(`${returnTo}?hold=missing_fields`);
  }

  if (
    !QA_HOLD_REASON_CATEGORIES.includes(
      reasonCategory as (typeof QA_HOLD_REASON_CATEGORIES)[number],
    )
  ) {
    redirect(`${returnTo}?hold=invalid_reason_category`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_qa_inventory_lot_hold", {
    p_inventory_lot_id: inventoryLotId,
    p_reason_category: reasonCategory,
    p_reason: reason,
    p_notes: notes,
    p_source_check_instance_id: sourceCheckInstanceId,
    p_source_check_result_id: sourceCheckResultId,
    p_source_review_id: sourceReviewId,
    p_review_due_at: reviewDueAt,
  });
  const result = data as QaHoldRpcResult | null;

  revalidatePath("/qa/holds");
  revalidatePath("/stock-on-hand");
  revalidatePath("/inventory-traceability");

  if (sourceCheckInstanceId) {
    revalidatePath(`/qa/receiving/${sourceCheckInstanceId}`);
  }

  if (error || !result?.ok) {
    redirect(`${returnTo}?hold=${statusParam(result)}`);
  }

  redirect(`/qa/holds/${result.hold_id}?hold=hold_placed`);
}

export async function releaseQaInventoryLotHoldAction(formData: FormData) {
  await requirePermissionAccess(QA_PERMISSIONS.holdsRelease);
  const holdId = getString(formData, "hold_id");
  const resolutionNotes = getString(formData, "resolution_notes");
  const releaseReason = getString(formData, "release_reason") || null;

  if (!holdId || !resolutionNotes) {
    redirect(holdId ? `/qa/holds/${holdId}?hold=missing_release_notes` : "/qa/holds?hold=invalid_hold");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("release_qa_inventory_lot_hold", {
    p_qa_hold_id: holdId,
    p_resolution_notes: resolutionNotes,
    p_release_reason: releaseReason,
  });
  const result = data as QaHoldRpcResult | null;

  revalidatePath("/qa/holds");
  revalidatePath(`/qa/holds/${holdId}`);
  revalidatePath("/stock-on-hand");
  revalidatePath("/inventory-traceability");

  if (error || !result?.ok) {
    redirect(`/qa/holds/${holdId}?hold=${statusParam(result)}`);
  }

  redirect(`/qa/holds/${holdId}?hold=hold_released`);
}
