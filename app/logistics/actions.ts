"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  isDeliveryTemperatureClass,
  isDispatchType,
} from "@/lib/logistics-types";
import { createClient } from "@/lib/supabase/server";

type LogisticsRpcResult = {
  ok?: boolean;
  status?: string;
  code?: string;
  message?: string;
  dispatch_run_id?: string;
  manifest_id?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  return getString(formData, key) || null;
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

function redirectToDispatchList(status: string): never {
  redirect(`/logistics/dispatch-runs?dispatch=${encodeURIComponent(status)}`);
}

function redirectToDispatchRun(runId: string, status: string): never {
  redirect(`/logistics/dispatch-runs/${runId}?dispatch=${encodeURIComponent(status)}`);
}

function redirectToManifest(manifestId: string, status: string): never {
  redirect(`/logistics/manifests/${manifestId}?manifest=${encodeURIComponent(status)}`);
}

function revalidateLogistics(runId?: string, manifestId?: string) {
  revalidatePath("/logistics");
  revalidatePath("/logistics/dispatch-runs");
  revalidatePath("/logistics/manifests");
  if (runId) revalidatePath(`/logistics/dispatch-runs/${runId}`);
  if (manifestId) revalidatePath(`/logistics/manifests/${manifestId}`);
}

async function requireMutationAccess(permissionKey: string) {
  const authContext = await requirePermissionAccess(permissionKey);
  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }
  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
  };
}

async function carrierSelectionIsValid({
  organisationId,
  carrierId,
  serviceId,
}: {
  organisationId: string;
  carrierId: string | null;
  serviceId: string | null;
}) {
  if (serviceId && !carrierId) return false;
  if (!carrierId) return true;
  const supabase = await createClient();
  const carrierResult = await supabase
    .from("logistics_carriers")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", carrierId)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle();
  if (carrierResult.error || !carrierResult.data) return false;
  if (!serviceId) return true;
  const serviceResult = await supabase
    .from("logistics_carrier_services")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", serviceId)
    .eq("carrier_id", carrierId)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle();
  return !serviceResult.error && Boolean(serviceResult.data);
}

async function editableRunExists(organisationId: string, runId: string) {
  const supabase = await createClient();
  const [runResult, manifestResult] = await Promise.all([
    supabase
      .from("logistics_dispatch_runs")
      .select("id, delivery_date")
      .eq("organisation_id", organisationId)
      .eq("id", runId)
      .eq("status", "draft")
      .is("archived_at", null)
      .maybeSingle(),
    supabase
      .from("logistics_manifests")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("dispatch_run_id", runId)
      .eq("status", "generated")
      .is("archived_at", null)
      .limit(1),
  ]);
  if (runResult.error || manifestResult.error || !runResult.data || (manifestResult.data?.length ?? 0) > 0) {
    return null;
  }
  return runResult.data as { id: string; delivery_date: string };
}

async function editableDeliveryExists(
  organisationId: string,
  runId: string,
  deliveryId: string,
) {
  const supabase = await createClient();
  const result = await supabase
    .from("logistics_dispatch_deliveries")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("dispatch_run_id", runId)
    .eq("id", deliveryId)
    .eq("status", "draft")
    .is("archived_at", null)
    .maybeSingle();

  return !result.error && Boolean(result.data);
}

function mapRpcStatus(result: LogisticsRpcResult | null, fallback: string) {
  return result?.status ?? result?.code ?? fallback;
}

export async function createDispatchRunAction(formData: FormData) {
  const startedAt = Date.now();
  const access = await requireMutationAccess("dispatch_runs.create");
  const dispatchType = getString(formData, "dispatch_type");
  const dispatchDate = getString(formData, "dispatch_date");
  const deliveryDate = getString(formData, "delivery_date");
  const carrierId = getOptionalString(formData, "default_carrier_id");
  const serviceId = getOptionalString(formData, "default_carrier_service_id");

  if (!isDispatchType(dispatchType)) redirectToDispatchList("invalid_dispatch_type");
  if (!isDateValue(dispatchDate) || !isDateValue(deliveryDate) || deliveryDate < dispatchDate) {
    redirectToDispatchList("invalid_dates");
  }
  if (!(await carrierSelectionIsValid({ organisationId: access.organisationId, carrierId, serviceId }))) {
    redirectToDispatchList("invalid_carrier_service");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_logistics_dispatch_run", {
    p_organisation_id: access.organisationId,
    p_dispatch_type: dispatchType,
    p_dispatch_date: dispatchDate,
    p_delivery_date: deliveryDate,
    p_name: getOptionalString(formData, "name"),
    p_default_carrier_id: carrierId,
    p_default_carrier_service_id: serviceId,
    p_notes: getOptionalString(formData, "notes"),
  });
  const result = data as LogisticsRpcResult | null;
  logDevRouteTiming("logistics.dispatch-run.create", startedAt, { status: error ? "error" : mapRpcStatus(result, "error") });
  if (error || !result?.ok || !result.dispatch_run_id) redirectToDispatchList(error ? "error" : mapRpcStatus(result, "error"));
  revalidateLogistics(result.dispatch_run_id);
  redirectToDispatchRun(result.dispatch_run_id, "created");
}

export async function updateDispatchRunAction(formData: FormData) {
  const access = await requireMutationAccess("dispatch_runs.manage");
  const runId = getString(formData, "dispatch_run_id");
  const dispatchType = getString(formData, "dispatch_type");
  const dispatchDate = getString(formData, "dispatch_date");
  const deliveryDate = getString(formData, "delivery_date");
  if (!runId) redirectToDispatchList("dispatch_run_not_found");
  if (!isDispatchType(dispatchType)) redirectToDispatchRun(runId, "invalid_dispatch_type");
  if (!isDateValue(dispatchDate) || !isDateValue(deliveryDate) || deliveryDate < dispatchDate) redirectToDispatchRun(runId, "invalid_dates");
  const carrierId = getOptionalString(formData, "default_carrier_id");
  const serviceId = getOptionalString(formData, "default_carrier_service_id");
  if (!(await carrierSelectionIsValid({ organisationId: access.organisationId, carrierId, serviceId }))) redirectToDispatchRun(runId, "invalid_carrier_service");
  if (!(await editableRunExists(access.organisationId, runId))) redirectToDispatchRun(runId, "dispatch_run_locked");
  const supabase = await createClient();
  const { error } = await supabase
    .from("logistics_dispatch_runs")
    .update({
      name: getOptionalString(formData, "name"),
      dispatch_type: dispatchType,
      dispatch_date: dispatchDate,
      delivery_date: deliveryDate,
      default_carrier_id: carrierId,
      default_carrier_service_id: serviceId,
      notes: getOptionalString(formData, "notes"),
      updated_by_profile_id: access.profileId,
    })
    .eq("organisation_id", access.organisationId)
    .eq("id", runId)
    .eq("status", "draft")
    .is("archived_at", null);
  if (error) redirectToDispatchRun(runId, "error");
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, "run_updated");
}

function validateDeliveryInput(formData: FormData) {
  const recipientName = getString(formData, "recipient_name");
  const addressLine1 = getString(formData, "address_line_1");
  const suburbCity = getString(formData, "suburb_city");
  const stateRegion = getString(formData, "state_region");
  const postcode = getString(formData, "postcode");
  const countryCode = getString(formData, "country_code").toUpperCase();
  const deliveryDate = getString(formData, "delivery_date");
  const cartonCount = getNumber(formData, "carton_count");
  const totalWeightKg = getNumber(formData, "total_weight_kg");
  const sequenceNumber = getNumber(formData, "sequence_number");
  const temperatureClass = getString(formData, "temperature_class");
  const email = getOptionalString(formData, "email");
  const sourceType = getOptionalString(formData, "source_type");

  if (!recipientName || !addressLine1 || !suburbCity || !stateRegion || !postcode || !/^[A-Z]{2}$/.test(countryCode)) return { error: "missing_delivery_fields" as const };
  if (!isDateValue(deliveryDate)) return { error: "invalid_delivery_date" as const };
  if (cartonCount === null || cartonCount < 0 || !Number.isInteger(cartonCount)) return { error: "invalid_carton_count" as const };
  if (totalWeightKg !== null && totalWeightKg < 0) return { error: "invalid_weight" as const };
  if (sequenceNumber !== null && (!Number.isInteger(sequenceNumber) || sequenceNumber <= 0)) return { error: "invalid_sequence" as const };
  if (temperatureClass && !isDeliveryTemperatureClass(temperatureClass)) return { error: "invalid_temperature_class" as const };
  if (email && (!email.includes("@") || email.startsWith("@"))) return { error: "invalid_email" as const };
  if (sourceType && !/^[a-z0-9][a-z0-9_-]*$/.test(sourceType)) return { error: "invalid_source_type" as const };

  return {
    error: null,
    data: {
      recipient_name: recipientName,
      company_name: getOptionalString(formData, "company_name"),
      address_line_1: addressLine1,
      address_line_2: getOptionalString(formData, "address_line_2"),
      suburb_city: suburbCity,
      state_region: stateRegion,
      postcode,
      country_code: countryCode,
      phone: getOptionalString(formData, "phone"),
      email,
      delivery_notes: getOptionalString(formData, "delivery_notes"),
      delivery_date: deliveryDate,
      external_order_reference: getOptionalString(formData, "external_order_reference"),
      source_type: sourceType,
      source_reference: getOptionalString(formData, "source_reference"),
      carton_count: cartonCount,
      total_weight_kg: totalWeightKg,
      temperature_class: temperatureClass || null,
      sequence_number: sequenceNumber,
    },
  };
}

export async function addDispatchDeliveryAction(formData: FormData) {
  const access = await requireMutationAccess("dispatch_runs.create");
  const runId = getString(formData, "dispatch_run_id");
  if (!runId) redirectToDispatchList("dispatch_run_not_found");
  const run = await editableRunExists(access.organisationId, runId);
  if (!run) redirectToDispatchRun(runId, "dispatch_run_locked");
  const input = validateDeliveryInput(formData);
  if (input.error || !input.data) redirectToDispatchRun(runId, input.error ?? "error");
  const carrierId = getOptionalString(formData, "carrier_id");
  const serviceId = getOptionalString(formData, "carrier_service_id");
  if (!(await carrierSelectionIsValid({ organisationId: access.organisationId, carrierId, serviceId }))) redirectToDispatchRun(runId, "invalid_carrier_service");
  const supabase = await createClient();
  const { error } = await supabase.from("logistics_dispatch_deliveries").insert({
    organisation_id: access.organisationId,
    dispatch_run_id: runId,
    ...input.data,
    carrier_id: carrierId,
    carrier_service_id: serviceId,
    status: "draft",
    validation_status: "not_checked",
    created_by_profile_id: access.profileId,
    updated_by_profile_id: access.profileId,
  });
  if (error) redirectToDispatchRun(runId, "error");
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, "delivery_added");
}

export async function updateDispatchDeliveryAction(formData: FormData) {
  const access = await requireMutationAccess("dispatch_runs.manage");
  const runId = getString(formData, "dispatch_run_id");
  const deliveryId = getString(formData, "delivery_id");
  if (!runId || !deliveryId) redirectToDispatchList("dispatch_delivery_not_found");
  if (!(await editableRunExists(access.organisationId, runId))) redirectToDispatchRun(runId, "dispatch_run_locked");
  const input = validateDeliveryInput(formData);
  if (input.error || !input.data) redirect(`/logistics/dispatch-runs/${runId}/deliveries/${deliveryId}/edit?dispatch=${input.error ?? "error"}`);
  const carrierId = getOptionalString(formData, "carrier_id");
  const serviceId = getOptionalString(formData, "carrier_service_id");
  if (!(await carrierSelectionIsValid({ organisationId: access.organisationId, carrierId, serviceId }))) redirect(`/logistics/dispatch-runs/${runId}/deliveries/${deliveryId}/edit?dispatch=invalid_carrier_service`);
  const supabase = await createClient();
  const { error } = await supabase
    .from("logistics_dispatch_deliveries")
    .update({
      ...input.data,
      carrier_id: carrierId,
      carrier_service_id: serviceId,
      validation_status: "not_checked",
      validation_errors: [],
      updated_by_profile_id: access.profileId,
    })
    .eq("organisation_id", access.organisationId)
    .eq("dispatch_run_id", runId)
    .eq("id", deliveryId)
    .eq("status", "draft")
    .is("archived_at", null);
  if (error) redirect(`/logistics/dispatch-runs/${runId}/deliveries/${deliveryId}/edit?dispatch=error`);
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, "delivery_updated");
}

export async function archiveDispatchDeliveryAction(formData: FormData) {
  await requireMutationAccess("dispatch_runs.manage");
  const runId = getString(formData, "dispatch_run_id");
  const deliveryId = getString(formData, "delivery_id");
  if (!runId || !deliveryId) redirectToDispatchList("dispatch_delivery_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("archive_logistics_dispatch_delivery", { p_dispatch_delivery_id: deliveryId });
  const result = data as LogisticsRpcResult | null;
  if (error || !result?.ok) redirectToDispatchRun(runId, error ? "error" : mapRpcStatus(result, "error"));
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, "delivery_archived");
}

function validateLineInput(formData: FormData) {
  const itemName = getString(formData, "item_name_snapshot");
  const quantity = getNumber(formData, "quantity");
  const unit = getString(formData, "unit");
  const lineNumber = getNumber(formData, "line_number");
  if (!itemName) return { error: "missing_item_name" as const };
  if (quantity === null || quantity <= 0) return { error: "invalid_quantity" as const };
  if (!unit) return { error: "invalid_unit" as const };
  if (lineNumber === null || !Number.isInteger(lineNumber) || lineNumber <= 0) return { error: "invalid_line_number" as const };
  return {
    error: null,
    data: {
      line_number: lineNumber,
      item_name_snapshot: itemName,
      item_code_snapshot: getOptionalString(formData, "item_code_snapshot"),
      quantity,
      unit,
      external_line_reference: getOptionalString(formData, "external_line_reference"),
      internal_item_id: getOptionalString(formData, "internal_item_id"),
    },
  };
}

async function internalItemIsValid(organisationId: string, itemId: string | null) {
  if (!itemId) return true;
  const supabase = await createClient();
  const result = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", itemId)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle();
  return !result.error && Boolean(result.data);
}

export async function addDispatchLineAction(formData: FormData) {
  const access = await requireMutationAccess("dispatch_runs.create");
  const runId = getString(formData, "dispatch_run_id");
  const deliveryId = getString(formData, "delivery_id");
  if (!runId || !deliveryId) redirectToDispatchList("dispatch_delivery_not_found");
  if (!(await editableRunExists(access.organisationId, runId))) redirectToDispatchRun(runId, "dispatch_run_locked");
  if (!(await editableDeliveryExists(access.organisationId, runId, deliveryId))) redirectToDispatchRun(runId, "dispatch_delivery_not_found");
  const input = validateLineInput(formData);
  if (input.error || !input.data) redirectToDispatchRun(runId, input.error ?? "error");
  if (!(await internalItemIsValid(access.organisationId, input.data.internal_item_id))) redirectToDispatchRun(runId, "invalid_internal_item");
  const supabase = await createClient();
  const { error } = await supabase.from("logistics_dispatch_lines").insert({
    organisation_id: access.organisationId,
    dispatch_delivery_id: deliveryId,
    ...input.data,
  });
  if (error) redirectToDispatchRun(runId, error.code === "23505" ? "duplicate_line_number" : "error");
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, "line_added");
}

export async function updateDispatchLineAction(formData: FormData) {
  const access = await requireMutationAccess("dispatch_runs.manage");
  const runId = getString(formData, "dispatch_run_id");
  const deliveryId = getString(formData, "delivery_id");
  const lineId = getString(formData, "line_id");
  if (!runId || !deliveryId || !lineId) redirectToDispatchList("dispatch_line_not_found");
  if (!(await editableRunExists(access.organisationId, runId))) redirectToDispatchRun(runId, "dispatch_run_locked");
  if (!(await editableDeliveryExists(access.organisationId, runId, deliveryId))) redirectToDispatchRun(runId, "dispatch_delivery_not_found");
  const input = validateLineInput(formData);
  const editPath = `/logistics/dispatch-runs/${runId}/deliveries/${deliveryId}/lines/${lineId}/edit`;
  if (input.error || !input.data) redirect(`${editPath}?dispatch=${input.error ?? "error"}`);
  if (!(await internalItemIsValid(access.organisationId, input.data.internal_item_id))) redirect(`${editPath}?dispatch=invalid_internal_item`);
  const supabase = await createClient();
  const { error } = await supabase
    .from("logistics_dispatch_lines")
    .update(input.data)
    .eq("organisation_id", access.organisationId)
    .eq("dispatch_delivery_id", deliveryId)
    .eq("id", lineId)
    .is("archived_at", null);
  if (error) redirect(`${editPath}?dispatch=${error.code === "23505" ? "duplicate_line_number" : "error"}`);
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, "line_updated");
}

export async function archiveDispatchLineAction(formData: FormData) {
  await requireMutationAccess("dispatch_runs.manage");
  const runId = getString(formData, "dispatch_run_id");
  const lineId = getString(formData, "line_id");
  if (!runId || !lineId) redirectToDispatchList("dispatch_line_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("archive_logistics_dispatch_line", { p_dispatch_line_id: lineId });
  const result = data as LogisticsRpcResult | null;
  if (error || !result?.ok) redirectToDispatchRun(runId, error ? "error" : mapRpcStatus(result, "error"));
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, "line_archived");
}

export async function validateDispatchRunAction(formData: FormData) {
  await requireMutationAccess("dispatch_runs.manage");
  const runId = getString(formData, "dispatch_run_id");
  if (!runId) redirectToDispatchList("dispatch_run_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_logistics_dispatch_run", { p_dispatch_run_id: runId });
  const result = data as LogisticsRpcResult | null;
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, error ? "error" : result?.ok ? "validation_passed" : mapRpcStatus(result, "validation_failed"));
}

export async function createManifestDraftAction(formData: FormData) {
  await requireMutationAccess("manifests.create");
  const runId = getString(formData, "dispatch_run_id");
  if (!runId) redirectToDispatchList("dispatch_run_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_logistics_manifest_draft", {
    p_dispatch_run_id: runId,
    p_notes: getOptionalString(formData, "notes"),
  });
  const result = data as LogisticsRpcResult | null;
  if (error || !result?.ok || !result.manifest_id) redirectToDispatchRun(runId, error ? "error" : mapRpcStatus(result, "error"));
  revalidateLogistics(runId, result.manifest_id);
  redirectToManifest(result.manifest_id, result.status ?? "draft_created");
}

export async function generateManifestAction(formData: FormData) {
  await requireMutationAccess("manifests.manage");
  const manifestId = getString(formData, "manifest_id");
  const runId = getString(formData, "dispatch_run_id");
  if (!manifestId) redirect("/logistics/manifests?manifest=manifest_not_found");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_logistics_manifest", { p_manifest_id: manifestId });
  const result = data as LogisticsRpcResult | null;
  revalidateLogistics(runId || result?.dispatch_run_id, manifestId);
  redirectToManifest(manifestId, error ? "error" : result?.ok ? result.status ?? "generated" : mapRpcStatus(result, "error"));
}

export async function transitionDispatchRunAction(formData: FormData) {
  await requireMutationAccess("dispatch_runs.manage");
  const runId = getString(formData, "dispatch_run_id");
  const targetStatus = getString(formData, "target_status");
  if (!runId) redirectToDispatchList("dispatch_run_not_found");
  if (!["ready", "dispatched", "cancelled"].includes(targetStatus)) redirectToDispatchRun(runId, "invalid_transition");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("transition_logistics_dispatch_run", {
    p_dispatch_run_id: runId,
    p_target_status: targetStatus,
    p_cancellation_reason: getOptionalString(formData, "cancellation_reason"),
  });
  const result = data as LogisticsRpcResult | null;
  revalidateLogistics(runId);
  redirectToDispatchRun(runId, error ? "error" : result?.ok ? result.status ?? targetStatus : mapRpcStatus(result, "error"));
}
