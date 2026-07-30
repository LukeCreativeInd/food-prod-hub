"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentPermissionKeys, requireAppAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  isProductionPlanStatus,
  type ProductionPlanStatus,
} from "@/lib/production-planning-types";
import { createClient } from "@/lib/supabase/server";

type ActionStatus =
  | "created"
  | "line_added"
  | "batch_created"
  | "status_updated"
  | "missing_date"
  | "missing_plan"
  | "missing_item"
  | "invalid_item"
  | "invalid_quantity"
  | "invalid_unit"
  | "invalid_status"
  | "line_blocked"
  | "plan_locked"
  | "not_found"
  | "no_permission"
  | "error";

type AccessRequirement =
  | "production_plans.create"
  | "production_plans.manage"
  | "production_batches.create";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function getPositiveNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  const parsed = Number(value);

  if (!value || !Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function redirectToList(status: ActionStatus): never {
  redirect(`/production-plan?plan=${status}`);
}

function redirectToPlan(planId: string, status: ActionStatus): never {
  redirect(`/production-plan/${planId}?plan=${status}`);
}

function revalidateProductionPlanPaths(planId?: string) {
  revalidatePath("/production-plan");
  revalidatePath("/production");
  revalidatePath("/dashboard");

  if (planId) {
    revalidatePath(`/production-plan/${planId}`);
  }
}

async function requireProductionMutationAccess(
  requiredPermission: AccessRequirement,
) {
  const [authContext, permissionKeys] = await Promise.all([
    requireAppAccess(),
    getCurrentPermissionKeys(),
  ]);

  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }

  if (!permissionKeys.includes(requiredPermission)) {
    return null;
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
    permissionKeys,
  };
}

async function requireCreateOrManagePlanAccess() {
  const [authContext, permissionKeys] = await Promise.all([
    requireAppAccess(),
    getCurrentPermissionKeys(),
  ]);

  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }

  if (
    !permissionKeys.includes("production_plans.create") &&
    !permissionKeys.includes("production_plans.manage")
  ) {
    return null;
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
    permissionKeys,
  };
}

async function getEditablePlan(organisationId: string, planId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("production_plans")
    .select("id, status, archived_at")
    .eq("organisation_id", organisationId)
    .eq("id", planId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    status: string;
    archived_at: string | null;
  };
}

async function getOutputItem({
  organisationId,
  outputItemId,
}: {
  organisationId: string;
  outputItemId: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, base_unit")
    .eq("organisation_id", organisationId)
    .eq("id", outputItemId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    item_type: string;
    base_unit: string | null;
  };
}

async function getActiveFormula(organisationId: string, outputItemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formula_versions")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("output_internal_item_id", outputItemId)
    .eq("status", "active")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.id as string;
}

async function getLatestCostingSnapshot(
  organisationId: string,
  outputItemId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costing_snapshots")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("internal_item_id", outputItemId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.id as string;
}

async function isValidProductionArea({
  organisationId,
  productionAreaId,
}: {
  organisationId: string;
  productionAreaId: string | null;
}) {
  if (!productionAreaId) {
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("production_areas")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", productionAreaId)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function createProductionPlanAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const access = await requireProductionMutationAccess("production_plans.create");

  if (!access) {
    redirectToList("no_permission");
  }

  const planDate = getString(formData, "plan_date");

  if (!planDate || !isValidDateInput(planDate)) {
    redirectToList("missing_date");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("production_plans")
    .insert({
      organisation_id: access.organisationId,
      plan_date: planDate,
      name: getOptionalString(formData, "name"),
      notes: getOptionalString(formData, "notes"),
      status: "draft",
      created_by_profile_id: access.profileId,
    })
    .select("id")
    .single();

  logDevRouteTiming("production-plans.create", timingStartedAt, {
    status: error ? "error" : "created",
  });

  if (error || !data) {
    redirectToList("error");
  }

  revalidateProductionPlanPaths(data.id as string);
  redirectToPlan(data.id as string, "created");
}

export async function addProductionPlanLineAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const access = await requireCreateOrManagePlanAccess();

  if (!access) {
    redirectToList("no_permission");
  }

  const planId = getString(formData, "production_plan_id");
  const outputItemId = getString(formData, "output_internal_item_id");
  const plannedQuantity = getPositiveNumber(formData, "planned_quantity");
  const plannedUnit = getString(formData, "planned_unit");
  const productionAreaId = getOptionalString(formData, "production_area_id");

  if (!planId) {
    redirectToList("missing_plan");
  }

  if (!outputItemId) {
    redirectToPlan(planId, "missing_item");
  }

  if (!plannedQuantity) {
    redirectToPlan(planId, "invalid_quantity");
  }

  if (!plannedUnit) {
    redirectToPlan(planId, "invalid_unit");
  }

  const [plan, outputItem, areaValid] = await Promise.all([
    getEditablePlan(access.organisationId, planId),
    getOutputItem({ organisationId: access.organisationId, outputItemId }),
    isValidProductionArea({
      organisationId: access.organisationId,
      productionAreaId,
    }),
  ]);

  if (!plan || plan.archived_at) {
    redirectToList("not_found");
  }

  if (!["draft", "planned"].includes(plan.status)) {
    redirectToPlan(planId, "plan_locked");
  }

  if (
    !outputItem ||
    !["finished_product", "component"].includes(outputItem.item_type)
  ) {
    redirectToPlan(planId, "invalid_item");
  }

  if (!areaValid) {
    redirectToPlan(planId, "error");
  }

  const [formulaVersionId, costingSnapshotId] = await Promise.all([
    getActiveFormula(access.organisationId, outputItemId),
    getLatestCostingSnapshot(access.organisationId, outputItemId),
  ]);
  const supabase = await createClient();
  const { error } = await supabase.from("production_plan_lines").insert({
    organisation_id: access.organisationId,
    production_plan_id: planId,
    output_internal_item_id: outputItemId,
    formula_version_id: formulaVersionId,
    costing_snapshot_id: costingSnapshotId,
    planned_quantity: plannedQuantity,
    planned_unit: plannedUnit,
    production_area_id: productionAreaId,
    status: formulaVersionId ? "planned" : "blocked",
    notes: getOptionalString(formData, "notes"),
  });

  logDevRouteTiming("production-plan-lines.create", timingStartedAt, {
    planId,
    status: error ? "error" : "line_added",
    hasFormula: Boolean(formulaVersionId),
  });

  if (error) {
    redirectToPlan(planId, "error");
  }

  revalidateProductionPlanPaths(planId);
  redirectToPlan(planId, "line_added");
}

export async function createProductionBatchFromLineAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const access = await requireProductionMutationAccess("production_batches.create");

  if (!access) {
    redirectToList("no_permission");
  }

  const planId = getString(formData, "production_plan_id");
  const planLineId = getString(formData, "production_plan_line_id");

  if (!planId || !planLineId) {
    redirectToList("missing_plan");
  }

  const supabase = await createClient();
  const { data: line, error: lineError } = await supabase
    .from("production_plan_lines")
    .select(
      "id, production_plan_id, output_internal_item_id, formula_version_id, costing_snapshot_id, planned_quantity, planned_unit, production_area_id, status, archived_at",
    )
    .eq("organisation_id", access.organisationId)
    .eq("id", planLineId)
    .eq("production_plan_id", planId)
    .maybeSingle();

  if (lineError || !line || (line as { archived_at: string | null }).archived_at) {
    redirectToPlan(planId, "not_found");
  }

  const typedLine = line as {
    id: string;
    production_plan_id: string;
    output_internal_item_id: string;
    formula_version_id: string | null;
    costing_snapshot_id: string | null;
    planned_quantity: number | string;
    planned_unit: string;
    production_area_id: string | null;
    status: string;
  };

  if (typedLine.status === "blocked") {
    redirectToPlan(planId, "line_blocked");
  }

  if (!["planned", "ready"].includes(typedLine.status)) {
    redirectToPlan(planId, "plan_locked");
  }

  const { error } = await supabase.from("production_batches").insert({
    organisation_id: access.organisationId,
    production_plan_id: planId,
    production_plan_line_id: planLineId,
    output_internal_item_id: typedLine.output_internal_item_id,
    formula_version_id: typedLine.formula_version_id,
    costing_snapshot_id: typedLine.costing_snapshot_id,
    batch_number: getOptionalString(formData, "batch_number"),
    planned_quantity: typedLine.planned_quantity,
    planned_unit: typedLine.planned_unit,
    production_area_id: typedLine.production_area_id,
    status: "planned",
    created_by_profile_id: access.profileId,
  });

  logDevRouteTiming("production-batches.create-from-line", timingStartedAt, {
    planId,
    planLineId,
    status: error ? "error" : "batch_created",
  });

  if (error) {
    redirectToPlan(planId, "error");
  }

  revalidateProductionPlanPaths(planId);
  redirectToPlan(planId, "batch_created");
}

export async function updateProductionPlanStatusAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const access = await requireProductionMutationAccess("production_plans.manage");

  if (!access) {
    redirectToList("no_permission");
  }

  const planId = getString(formData, "production_plan_id");
  const targetStatus = getString(formData, "status");

  if (!planId) {
    redirectToList("missing_plan");
  }

  if (
    !isProductionPlanStatus(targetStatus) ||
    !["draft", "planned", "approved", "cancelled", "archived"].includes(
      targetStatus,
    )
  ) {
    redirectToPlan(planId, "invalid_status");
  }

  const plan = await getEditablePlan(access.organisationId, planId);

  if (!plan) {
    redirectToList("not_found");
  }

  const updates: {
    status: ProductionPlanStatus;
    approved_by_profile_id?: string | null;
    approved_at?: string | null;
    archived_at?: string | null;
  } = {
    status: targetStatus,
  };

  if (targetStatus === "approved") {
    updates.approved_by_profile_id = access.profileId;
    updates.approved_at = new Date().toISOString();
  }

  if (targetStatus === "archived") {
    updates.archived_at = new Date().toISOString();
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("production_plans")
    .update(updates)
    .eq("organisation_id", access.organisationId)
    .eq("id", planId);

  logDevRouteTiming("production-plans.update-status", timingStartedAt, {
    planId,
    targetStatus,
    status: error ? "error" : "status_updated",
  });

  if (error) {
    redirectToPlan(planId, "error");
  }

  revalidateProductionPlanPaths(planId);
  redirectToPlan(planId, "status_updated");
}
