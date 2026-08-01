"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getReceivingQaActionContext } from "@/lib/qa-receiving-data";
import {
  QA_PERMISSIONS,
  QA_REVIEW_DECISIONS,
  type QaResultType,
  type QaReviewDecision,
} from "@/lib/qa-schema-types";
import { createClient } from "@/lib/supabase/server";

type TemplateItemRow = {
  id: string;
  result_type: QaResultType;
  is_required: boolean;
  allow_not_applicable: boolean;
  requires_comment_on_fail: boolean;
  triggers_review: boolean;
  recommends_hold: boolean;
  requires_approval: boolean;
  warning_min: number | null;
  warning_max: number | null;
  critical_min: number | null;
  critical_max: number | null;
  unit: string | null;
  option_values: unknown;
  metadata: unknown;
};

type CheckRow = {
  id: string;
  organisation_id: string;
  template_id: string;
  template_version_id: string;
  status: string;
  inventory_receipt_id: string | null;
};

type ExistingResultRow = {
  id: string;
  template_item_id: string;
};

type ParsedResult = {
  item: TemplateItemRow;
  isBlank: boolean;
  status: "draft" | "recorded";
  outcome: "pass" | "fail" | "warning" | "not_applicable" | "needs_review" | null;
  value_boolean: boolean | null;
  value_number: number | null;
  value_text: string | null;
  value_date: string | null;
  value_time: string | null;
  value_timestamp: string | null;
  unit: string | null;
  original_value_text: string | null;
  comment: string | null;
  exception_flag: boolean;
  requires_review: boolean;
  requires_hold_review: boolean;
};

const editableStatuses = ["draft", "in_progress"];
const reviewableStatuses = ["completed", "needs_review"];

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function parseBoolean(value: string) {
  if (value === "pass" || value === "yes" || value === "acknowledged") {
    return true;
  }

  if (value === "fail" || value === "no" || value === "not_acknowledged") {
    return false;
  }

  return null;
}

function normaliseDateTimeInput(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normaliseKey(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function stringArrayFromMetadata(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const candidate = (value as Record<string, unknown>)[key];

  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate
    .map((item) => (typeof item === "string" ? normaliseKey(item) : null))
    .filter((item): item is string => Boolean(item));
}

function selectionOutcome(rawValue: string, item: TemplateItemRow) {
  const value = normaliseKey(rawValue);
  const reviewValues = stringArrayFromMetadata(item.metadata, "review_values");
  const holdValues = stringArrayFromMetadata(item.metadata, "hold_recommendation_values");
  const failValues = stringArrayFromMetadata(item.metadata, "fail_values");
  const warningValues = stringArrayFromMetadata(item.metadata, "warning_values");
  const passValues = stringArrayFromMetadata(item.metadata, "pass_values");

  if (passValues.includes(value) || ["accepted", "accept", "pass", "passed", "ok", "clear"].includes(value)) {
    return "pass" as const;
  }

  if (failValues.includes(value) || ["rejected", "reject", "fail", "failed"].includes(value)) {
    return "fail" as const;
  }

  if (
    warningValues.includes(value) ||
    reviewValues.includes(value) ||
    holdValues.includes(value) ||
    [
      "conditional",
      "conditional_acceptance",
      "needs_review",
      "review_required",
      "hold_recommended",
      "escalated",
      "quarantine",
    ].includes(value)
  ) {
    return "warning" as const;
  }

  return "pass" as const;
}

function numericOutcome(value: number, item: TemplateItemRow) {
  if (
    (item.critical_min !== null && value < item.critical_min) ||
    (item.critical_max !== null && value > item.critical_max)
  ) {
    return "fail" as const;
  }

  if (
    (item.warning_min !== null && value < item.warning_min) ||
    (item.warning_max !== null && value > item.warning_max)
  ) {
    return "warning" as const;
  }

  return "pass" as const;
}

function parseResult(formData: FormData, item: TemplateItemRow): ParsedResult {
  const rawValue = getString(formData, `result_${item.id}`);
  const comment = getOptionalString(formData, `comment_${item.id}`);
  const isNotApplicable = getString(formData, `not_applicable_${item.id}`) === "on";
  const base = {
    item,
    value_boolean: null,
    value_number: null,
    value_text: null,
    value_date: null,
    value_time: null,
    value_timestamp: null,
    unit: item.unit,
    original_value_text: rawValue || null,
    comment,
  };

  if (isNotApplicable && item.allow_not_applicable) {
    return {
      ...base,
      isBlank: false,
      status: "recorded",
      outcome: "not_applicable",
      exception_flag: false,
      requires_review: false,
      requires_hold_review: false,
    };
  }

  if (!rawValue) {
    return {
      ...base,
      isBlank: true,
      status: "draft",
      outcome: null,
      exception_flag: false,
      requires_review: false,
      requires_hold_review: false,
    };
  }

  let outcome: ParsedResult["outcome"] = "pass";
  let valueBoolean: boolean | null = null;
  let valueNumber: number | null = null;
  let valueText: string | null = null;
  let valueDate: string | null = null;
  let valueTime: string | null = null;
  let valueTimestamp: string | null = null;

  if (["pass_fail", "yes_no", "acknowledgement"].includes(item.result_type)) {
    valueBoolean = parseBoolean(rawValue);
    outcome = valueBoolean ? "pass" : "fail";
  } else if (item.result_type === "number" || item.result_type === "temperature") {
    valueNumber = Number.parseFloat(rawValue);

    if (!Number.isFinite(valueNumber)) {
      return {
        ...base,
        isBlank: true,
        status: "draft",
        outcome: null,
        exception_flag: false,
        requires_review: false,
        requires_hold_review: false,
      };
    }

    outcome = numericOutcome(valueNumber, item);
  } else if (item.result_type === "date") {
    valueDate = rawValue;
  } else if (item.result_type === "time") {
    valueTime = rawValue;
  } else if (item.result_type === "datetime") {
    valueTimestamp = normaliseDateTimeInput(rawValue);

    if (!valueTimestamp) {
      return {
        ...base,
        isBlank: true,
        status: "draft",
        outcome: null,
        exception_flag: false,
        requires_review: false,
        requires_hold_review: false,
      };
    }
  } else if (item.result_type === "selection") {
    valueText = rawValue;
    outcome = selectionOutcome(rawValue, item);
  } else {
    valueText = rawValue;
  }

  const hasException = outcome === "fail" || outcome === "warning";
  const normalisedRawValue = normaliseKey(rawValue);
  const explicitReviewValues = stringArrayFromMetadata(item.metadata, "review_values");
  const explicitHoldValues = stringArrayFromMetadata(item.metadata, "hold_recommendation_values");
  const explicitApprovalValues = stringArrayFromMetadata(item.metadata, "approval_values");
  const requiresReview =
    hasException &&
    (item.triggers_review ||
      explicitReviewValues.includes(normalisedRawValue) ||
      explicitApprovalValues.includes(normalisedRawValue) ||
      item.requires_approval);
  const requiresHoldReview =
    hasException &&
    (item.recommends_hold || explicitHoldValues.includes(normalisedRawValue));
  const requiresApproval =
    hasException &&
    (item.requires_approval || explicitApprovalValues.includes(normalisedRawValue));

  return {
    ...base,
    isBlank: false,
    status: "recorded",
    outcome,
    value_boolean: valueBoolean,
    value_number: valueNumber,
    value_text: valueText,
    value_date: valueDate,
    value_time: valueTime,
    value_timestamp: valueTimestamp,
    exception_flag: hasException,
    requires_review: requiresReview,
    requires_hold_review: requiresHoldReview,
    item: {
      ...item,
      requires_approval: requiresApproval,
    },
  };
}

function redirectToCheck(checkId: string, status: string): never {
  redirect(`/qa/receiving/${checkId}?qa=${status}`);
}

function summariseOverall(results: ParsedResult[]) {
  const recorded = results.filter((result) => !result.isBlank);
  const requiresReview = recorded.some(
    (result) => result.requires_review || result.requires_hold_review,
  );
  const requiresApproval = recorded.some(
    (result) => result.requires_review && result.item.requires_approval,
  );

  if (requiresReview) {
    return {
      status: "needs_review" as const,
      outcome: "needs_review" as const,
      requiresReview,
      requiresApproval,
    };
  }

  if (recorded.some((result) => result.outcome === "fail")) {
    return {
      status: "completed" as const,
      outcome: "fail" as const,
      requiresReview,
      requiresApproval,
    };
  }

  if (recorded.some((result) => result.outcome === "warning")) {
    return {
      status: "completed" as const,
      outcome: "warning" as const,
      requiresReview,
      requiresApproval,
    };
  }

  if (recorded.length > 0 && recorded.every((result) => result.outcome === "not_applicable")) {
    return {
      status: "completed" as const,
      outcome: "not_applicable" as const,
      requiresReview,
      requiresApproval,
    };
  }

  return {
    status: "completed" as const,
    outcome: "pass" as const,
    requiresReview,
    requiresApproval,
  };
}

export async function startReceivingQaCheckAction(formData: FormData) {
  const { organisationId, profileId } = await getReceivingQaActionContext(
    QA_PERMISSIONS.checksCreate,
  );
  const receiptId = getString(formData, "receipt_id");
  const receiptLineId = getOptionalString(formData, "receipt_line_id");
  const templateId = getString(formData, "template_id");

  if (!receiptId || !templateId) {
    redirect("/qa/receiving/new?qa=missing_required");
  }

  const supabase = await createClient();
  const [templateResult, receiptResult, lineResult] = await Promise.all([
    supabase
      .from("qa_templates")
      .select("id, current_template_version_id, category, status")
      .eq("organisation_id", organisationId)
      .eq("id", templateId)
      .eq("category", "receiving")
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle(),
    supabase
      .from("inventory_receipts")
      .select("id, supplier_id, purchase_document_id, receipt_number, received_at, status")
      .eq("organisation_id", organisationId)
      .eq("id", receiptId)
      .in("status", ["draft", "posted"])
      .is("archived_at", null)
      .maybeSingle(),
    receiptLineId
      ? supabase
          .from("inventory_receipt_lines")
          .select(
            "id, receipt_id, internal_item_id, stock_location_id, inventory_lot_id, status",
          )
          .eq("organisation_id", organisationId)
          .eq("id", receiptLineId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (templateResult.error || receiptResult.error || lineResult.error) {
    redirect("/qa/receiving/new?qa=error");
  }

  const template = templateResult.data as {
    id: string;
    current_template_version_id: string | null;
  } | null;
  const receipt = receiptResult.data as {
    id: string;
    supplier_id: string | null;
  } | null;
  const line = lineResult.data as {
    id: string;
    receipt_id: string;
    internal_item_id: string;
    stock_location_id: string;
    inventory_lot_id: string | null;
  } | null;

  if (!template?.current_template_version_id || !receipt) {
    redirect("/qa/receiving/new?qa=invalid_source");
  }

  if (receiptLineId && (!line || line.receipt_id !== receipt.id)) {
    redirect("/qa/receiving/new?qa=invalid_line");
  }

  const { data: versionData, error: versionError } = await supabase
    .from("qa_template_versions")
    .select("id, status")
    .eq("organisation_id", organisationId)
    .eq("template_id", template.id)
    .eq("id", template.current_template_version_id)
    .eq("status", "published")
    .is("archived_at", null)
    .maybeSingle();

  if (versionError || !versionData) {
    redirect("/qa/receiving/new?qa=no_template");
  }

  const { data: checkData, error: insertError } = await supabase
    .from("qa_check_instances")
    .insert({
      organisation_id: organisationId,
      template_id: template.id,
      template_version_id: template.current_template_version_id,
      category: "receiving",
      status: "in_progress",
      source_type: line ? "receiving_line" : "receiving",
      inventory_receipt_id: receipt.id,
      inventory_receipt_line_id: line?.id ?? null,
      inventory_lot_id: line?.inventory_lot_id ?? null,
      supplier_id: receipt.supplier_id,
      internal_item_id: line?.internal_item_id ?? null,
      stock_location_id: line?.stock_location_id ?? null,
      created_by_profile_id: profileId,
      started_by_profile_id: profileId,
      started_at: new Date().toISOString(),
      overall_outcome: "pending",
    })
    .select("id")
    .single();

  if (insertError || !checkData) {
    redirect("/qa/receiving/new?qa=error");
  }

  revalidatePath("/qa/receiving");
  redirectToCheck((checkData as { id: string }).id, "created");
}

export async function saveReceivingQaCheckAction(formData: FormData) {
  const { organisationId, profileId } = await getReceivingQaActionContext(
    QA_PERMISSIONS.checksComplete,
  );
  const checkId = getString(formData, "check_id");
  const intent = getString(formData, "intent");
  const notes = getOptionalString(formData, "notes");

  if (!checkId) {
    redirect("/qa/receiving?qa=invalid_check");
  }

  const supabase = await createClient();
  const { data: checkData, error: checkError } = await supabase
    .from("qa_check_instances")
    .select("id, organisation_id, template_id, template_version_id, status, inventory_receipt_id")
    .eq("organisation_id", organisationId)
    .eq("id", checkId)
    .eq("category", "receiving")
    .is("archived_at", null)
    .maybeSingle();

  if (checkError || !checkData) {
    redirect("/qa/receiving?qa=invalid_check");
  }

  const check = checkData as CheckRow;

  if (!editableStatuses.includes(check.status)) {
    redirectToCheck(check.id, "read_only");
  }

  const [itemsResult, existingResultsResult] = await Promise.all([
    supabase
      .from("qa_template_items")
      .select(
        "id, result_type, is_required, allow_not_applicable, requires_comment_on_fail, triggers_review, recommends_hold, requires_approval, warning_min, warning_max, critical_min, critical_max, unit, option_values, metadata",
      )
      .eq("organisation_id", organisationId)
      .eq("template_version_id", check.template_version_id)
      .is("archived_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("qa_check_results")
      .select("id, template_item_id")
      .eq("organisation_id", organisationId)
      .eq("check_instance_id", check.id)
      .is("archived_at", null),
  ]);

  if (itemsResult.error || existingResultsResult.error) {
    redirectToCheck(check.id, "error");
  }

  const items = (itemsResult.data ?? []) as TemplateItemRow[];
  const existingResults = (existingResultsResult.data ?? []) as ExistingResultRow[];
  const existingByItemId = new Map(
    existingResults.map((result) => [result.template_item_id, result]),
  );
  const parsedResults = items.map((item) => parseResult(formData, item));
  const now = new Date().toISOString();

  for (const parsed of parsedResults) {
    const existing = existingByItemId.get(parsed.item.id);
    const payload = {
      status: parsed.status,
      outcome: parsed.outcome,
      value_boolean: parsed.value_boolean,
      value_number: parsed.value_number,
      value_text: parsed.value_text,
      value_date: parsed.value_date,
      value_time: parsed.value_time,
      value_timestamp: parsed.value_timestamp,
      unit: parsed.unit,
      original_value_text: parsed.original_value_text,
      comment: parsed.comment,
      exception_flag: parsed.exception_flag,
      requires_review: parsed.requires_review,
      requires_hold_review: parsed.requires_hold_review,
      recorded_by_profile_id: parsed.isBlank ? null : profileId,
      recorded_at: parsed.isBlank ? null : now,
    };

    if (existing) {
      const { error } = await supabase
        .from("qa_check_results")
        .update(payload)
        .eq("organisation_id", organisationId)
        .eq("id", existing.id);

      if (error) {
        redirectToCheck(check.id, "result_error");
      }
    } else if (!parsed.isBlank) {
      const { error } = await supabase.from("qa_check_results").insert({
        organisation_id: organisationId,
        check_instance_id: check.id,
        template_version_id: check.template_version_id,
        template_item_id: parsed.item.id,
        result_type: parsed.item.result_type,
        ...payload,
      });

      if (error) {
        redirectToCheck(check.id, "result_error");
      }
    }
  }

  if (intent !== "complete") {
    const { error: updateError } = await supabase
      .from("qa_check_instances")
      .update({
        status: "in_progress",
        notes,
      })
      .eq("organisation_id", organisationId)
      .eq("id", check.id);

    if (updateError) {
      redirectToCheck(check.id, "error");
    }

    revalidatePath("/qa/receiving");
    revalidatePath(`/qa/receiving/${check.id}`);
    redirectToCheck(check.id, "saved");
  }

  const missingRequired = parsedResults.some(
    (result) => result.item.is_required && result.isBlank,
  );
  const missingFailComments = parsedResults.some(
    (result) =>
      result.item.requires_comment_on_fail &&
      (result.exception_flag || result.requires_review || result.requires_hold_review) &&
      !result.comment,
  );

  if (missingRequired) {
    redirectToCheck(check.id, "missing_required");
  }

  if (missingFailComments) {
    redirectToCheck(check.id, "missing_comment");
  }

  const summary = summariseOverall(parsedResults);
  const { error: completeError } = await supabase
    .from("qa_check_instances")
    .update({
      status: summary.status,
      completed_by_profile_id: profileId,
      completed_at: now,
      overall_outcome: summary.outcome,
      requires_review: summary.requiresReview,
      requires_approval: summary.requiresApproval,
      notes,
    })
    .eq("organisation_id", organisationId)
    .eq("id", check.id);

  if (completeError) {
    redirectToCheck(check.id, "complete_error");
  }

  revalidatePath("/qa/receiving");
  revalidatePath(`/qa/receiving/${check.id}`);
  redirectToCheck(check.id, summary.status === "needs_review" ? "completed_review" : "completed");
}

export async function reviewReceivingQaCheckAction(formData: FormData) {
  const { organisationId, profileId } = await getReceivingQaActionContext(
    QA_PERMISSIONS.reviewsManage,
  );
  const checkId = getString(formData, "check_id");
  const decisionInput = getString(formData, "decision") as QaReviewDecision;
  const notesInput = getOptionalString(formData, "review_notes") ?? "";
  const recommendHold = getString(formData, "recommend_hold") === "on";

  if (!checkId || !QA_REVIEW_DECISIONS.includes(decisionInput) || decisionInput === "pending") {
    redirect(`/qa/receiving/${checkId || ""}?qa=invalid_review`);
  }

  const supabase = await createClient();
  const { data: checkData, error: checkError } = await supabase
    .from("qa_check_instances")
    .select("id, status")
    .eq("organisation_id", organisationId)
    .eq("id", checkId)
    .eq("category", "receiving")
    .is("archived_at", null)
    .maybeSingle();

  if (checkError || !checkData) {
    redirect("/qa/receiving?qa=invalid_check");
  }

  const check = checkData as { id: string; status: string };

  if (!reviewableStatuses.includes(check.status)) {
    redirectToCheck(check.id, "review_not_available");
  }

  const notes = recommendHold
    ? `${notesInput}${notesInput ? "\n\n" : ""}Hold recommendation only: review the linked receipt or lot. Formal inventory hold/release is introduced in task 217.`
    : notesInput;
  const now = new Date().toISOString();
  const { error: reviewError } = await supabase.from("qa_reviews").insert({
    organisation_id: organisationId,
    check_instance_id: check.id,
    reviewer_profile_id: profileId,
    decision: decisionInput,
    notes: notes || null,
    reviewed_at: now,
  });

  if (reviewError) {
    redirectToCheck(check.id, "review_error");
  }

  const { error: statusError } = await supabase
    .from("qa_check_instances")
    .update({
      status: "reviewed",
    })
    .eq("organisation_id", organisationId)
    .eq("id", check.id);

  if (statusError) {
    redirectToCheck(check.id, "review_status_error");
  }

  revalidatePath("/qa/receiving");
  revalidatePath(`/qa/receiving/${check.id}`);
  redirectToCheck(check.id, recommendHold ? "reviewed_hold_recommended" : "reviewed");
}
