"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import {
  isDeliveryTemperatureClass,
  isLogisticsCarrierProviderType,
  isLogisticsCarrierServiceType,
} from "@/lib/logistics-types";
import { createClient } from "@/lib/supabase/server";

const codePattern = /^[a-z0-9][a-z0-9_-]*$/;

export type CarrierFormValues = {
  name: string;
  code: string;
  providerType: string;
  status: string;
  notes: string;
};

export type CarrierServiceFormValues = {
  name: string;
  code: string;
  serviceType: string;
  status: string;
  temperatureClass: string;
  notes: string;
};

export type CarrierConfigurationActionState<TValues> = {
  status: "idle" | "error";
  message: string;
  field?: "name" | "code" | "provider_type" | "status" | "service_type" | "temperature_class";
  values: TValues;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getCarrierValues(formData: FormData): CarrierFormValues {
  return {
    name: getString(formData, "name"),
    code: getString(formData, "code").toLowerCase(),
    providerType: getString(formData, "provider_type"),
    status: getString(formData, "status"),
    notes: getString(formData, "notes"),
  };
}

function getServiceValues(formData: FormData): CarrierServiceFormValues {
  return {
    name: getString(formData, "name"),
    code: getString(formData, "code").toLowerCase(),
    serviceType: getString(formData, "service_type"),
    status: getString(formData, "status"),
    temperatureClass: getString(formData, "temperature_class"),
    notes: getString(formData, "notes"),
  };
}

function actionError<TValues>(
  values: TValues,
  message: string,
  field?: CarrierConfigurationActionState<TValues>["field"],
): CarrierConfigurationActionState<TValues> {
  return { status: "error", message, field, values };
}

function logConfigurationError(
  operation: string,
  error: { code?: string; message?: string; details?: string | null } | null,
  recordId?: string,
) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[logistics-carrier-configuration]", {
      operation,
      recordId,
      code: error?.code,
      message: error?.message,
      details: error?.details,
    });
  }
}

function redirectToList(status: string): never {
  redirect(`/logistics/carriers?carrier=${encodeURIComponent(status)}`);
}

function redirectToCarrier(carrierId: string, status: string): never {
  redirect(
    `/logistics/carriers/${carrierId}?carrier=${encodeURIComponent(status)}`,
  );
}

function revalidateCarrierConfiguration(carrierId?: string) {
  revalidatePath("/logistics");
  revalidatePath("/logistics/carriers");
  revalidatePath("/logistics/carrier-exports");
  revalidatePath("/logistics/dispatch-runs");
  if (carrierId) revalidatePath(`/logistics/carriers/${carrierId}`);
}

async function requireManageAccess() {
  const authContext = await requirePermissionAccess(
    "logistics_configuration.manage",
  );
  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }
  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
  };
}

function validateStatus(status: string) {
  return status === "active" || status === "inactive";
}

async function carrierCodeExists(
  organisationId: string,
  code: string,
  excludeId?: string,
) {
  const supabase = await createClient();
  let query = supabase
    .from("logistics_carriers")
    .select("id")
    .eq("organisation_id", organisationId)
    .ilike("code", code)
    .is("archived_at", null);
  if (excludeId) query = query.neq("id", excludeId);
  const result = await query.limit(1);
  if (result.error) throw new Error("Could not check carrier codes.");
  return (result.data?.length ?? 0) > 0;
}

async function serviceCodeExists(
  organisationId: string,
  carrierId: string,
  code: string,
  excludeId?: string,
) {
  const supabase = await createClient();
  let query = supabase
    .from("logistics_carrier_services")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("carrier_id", carrierId)
    .ilike("code", code)
    .is("archived_at", null);
  if (excludeId) query = query.neq("id", excludeId);
  const result = await query.limit(1);
  if (result.error) throw new Error("Could not check carrier service codes.");
  return (result.data?.length ?? 0) > 0;
}

async function activeCarrierExists(organisationId: string, carrierId: string) {
  const supabase = await createClient();
  const result = await supabase
    .from("logistics_carriers")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", carrierId)
    .is("archived_at", null)
    .maybeSingle();
  return !result.error && Boolean(result.data);
}

async function currentServiceExists(
  organisationId: string,
  carrierId: string,
  serviceId: string,
) {
  const supabase = await createClient();
  const result = await supabase
    .from("logistics_carrier_services")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("carrier_id", carrierId)
    .eq("id", serviceId)
    .is("archived_at", null)
    .maybeSingle();
  return !result.error && Boolean(result.data);
}

export async function createCarrierAction(
  _previousState: CarrierConfigurationActionState<CarrierFormValues>,
  formData: FormData,
): Promise<CarrierConfigurationActionState<CarrierFormValues>> {
  const access = await requireManageAccess();
  const values = getCarrierValues(formData);
  if (!values.name) return actionError(values, "Enter a carrier name.", "name");
  if (!values.code) return actionError(values, "Enter a carrier code.", "code");
  if (!codePattern.test(values.code)) {
    return actionError(
      values,
      "Use lowercase letters, numbers, underscores or hyphens for the code.",
      "code",
    );
  }
  if (!isLogisticsCarrierProviderType(values.providerType)) {
    return actionError(values, "Choose a valid provider type.", "provider_type");
  }
  if (!validateStatus(values.status)) {
    return actionError(values, "Choose Active or Inactive.", "status");
  }
  if (await carrierCodeExists(access.organisationId, values.code)) {
    return actionError(
      values,
      "An active or inactive carrier already uses that code.",
      "code",
    );
  }

  const supabase = await createClient();
  const result = await supabase
    .from("logistics_carriers")
    .insert({
      organisation_id: access.organisationId,
      name: values.name,
      code: values.code,
      provider_type: values.providerType,
      status: values.status,
      notes: values.notes || null,
      created_by_profile_id: access.profileId,
      updated_by_profile_id: access.profileId,
    })
    .select("id")
    .single();
  if (result.error || !result.data) {
    if (result.error?.code === "23505") {
      return actionError(
        values,
        "An active or inactive carrier already uses that code.",
        "code",
      );
    }
    logConfigurationError("create_carrier", result.error);
    return actionError(
      values,
      "The carrier could not be created. Review the details and try again.",
    );
  }
  revalidateCarrierConfiguration(result.data.id);
  redirectToCarrier(result.data.id, "carrier_created");
}

export async function updateCarrierAction(
  _previousState: CarrierConfigurationActionState<CarrierFormValues>,
  formData: FormData,
): Promise<CarrierConfigurationActionState<CarrierFormValues>> {
  const access = await requireManageAccess();
  const carrierId = getString(formData, "carrier_id");
  const values = getCarrierValues(formData);
  if (!carrierId) return actionError(values, "The carrier could not be found.");
  if (!values.name) return actionError(values, "Enter a carrier name.", "name");
  if (!values.code) return actionError(values, "Enter a carrier code.", "code");
  if (!codePattern.test(values.code)) {
    return actionError(
      values,
      "Use lowercase letters, numbers, underscores or hyphens for the code.",
      "code",
    );
  }
  if (!isLogisticsCarrierProviderType(values.providerType)) {
    return actionError(values, "Choose a valid provider type.", "provider_type");
  }
  if (!validateStatus(values.status)) {
    return actionError(values, "Choose Active or Inactive.", "status");
  }
  if (!(await activeCarrierExists(access.organisationId, carrierId))) {
    return actionError(
      values,
      "This carrier is archived or no longer available for editing.",
    );
  }
  if (await carrierCodeExists(access.organisationId, values.code, carrierId)) {
    return actionError(
      values,
      "An active or inactive carrier already uses that code.",
      "code",
    );
  }

  const supabase = await createClient();
  const result = await supabase
    .from("logistics_carriers")
    .update({
      name: values.name,
      code: values.code,
      provider_type: values.providerType,
      status: values.status,
      notes: values.notes || null,
      updated_by_profile_id: access.profileId,
    })
    .eq("organisation_id", access.organisationId)
    .eq("id", carrierId)
    .is("archived_at", null);
  if (result.error) {
    if (result.error.code === "23505") {
      return actionError(
        values,
        "An active or inactive carrier already uses that code.",
        "code",
      );
    }
    logConfigurationError("update_carrier", result.error, carrierId);
    return actionError(
      values,
      "The carrier details could not be saved. Review the details and try again.",
    );
  }
  revalidateCarrierConfiguration(carrierId);
  redirectToCarrier(carrierId, "carrier_updated");
}

export async function archiveCarrierAction(formData: FormData) {
  const access = await requireManageAccess();
  const carrierId = getString(formData, "carrier_id");
  if (!carrierId) redirectToList("not_found");
  if (!(await activeCarrierExists(access.organisationId, carrierId))) {
    redirectToList("not_found");
  }
  const supabase = await createClient();
  const serviceResult = await supabase
    .from("logistics_carrier_services")
    .select("id")
    .eq("organisation_id", access.organisationId)
    .eq("carrier_id", carrierId)
    .eq("status", "active")
    .is("archived_at", null)
    .limit(1);
  if (serviceResult.error) {
    logConfigurationError(
      "archive_carrier_active_service_check",
      serviceResult.error,
      carrierId,
    );
    redirectToCarrier(carrierId, "error");
  }
  if ((serviceResult.data?.length ?? 0) > 0) {
    redirectToCarrier(carrierId, "active_services");
  }
  const now = new Date().toISOString();
  const result = await supabase
    .from("logistics_carriers")
    .update({
      status: "archived",
      archived_at: now,
      updated_by_profile_id: access.profileId,
    })
    .eq("organisation_id", access.organisationId)
    .eq("id", carrierId)
    .is("archived_at", null)
    .select("id, status, archived_at")
    .maybeSingle();
  if (result.error) {
    logConfigurationError("archive_carrier", result.error, carrierId);
    redirectToCarrier(carrierId, "error");
  }
  if (!result.data) {
    logConfigurationError("archive_carrier_no_updated_row", null, carrierId);
    redirectToCarrier(carrierId, "not_found");
  }
  revalidateCarrierConfiguration(carrierId);
  redirectToCarrier(carrierId, "carrier_archived");
}

export async function createCarrierServiceAction(
  _previousState: CarrierConfigurationActionState<CarrierServiceFormValues>,
  formData: FormData,
): Promise<CarrierConfigurationActionState<CarrierServiceFormValues>> {
  const access = await requireManageAccess();
  const carrierId = getString(formData, "carrier_id");
  const values = getServiceValues(formData);
  if (!carrierId) return actionError(values, "The carrier could not be found.");
  if (!values.name) return actionError(values, "Enter a service name.", "name");
  if (!values.code) return actionError(values, "Enter a service code.", "code");
  if (!codePattern.test(values.code)) {
    return actionError(
      values,
      "Use lowercase letters, numbers, underscores or hyphens for the code.",
      "code",
    );
  }
  if (!isLogisticsCarrierServiceType(values.serviceType)) {
    return actionError(values, "Choose a valid service type.", "service_type");
  }
  if (!validateStatus(values.status)) {
    return actionError(values, "Choose Active or Inactive.", "status");
  }
  if (
    values.temperatureClass &&
    !isDeliveryTemperatureClass(values.temperatureClass)
  ) {
    return actionError(
      values,
      "Choose a valid temperature class or leave it blank.",
      "temperature_class",
    );
  }
  if (!(await activeCarrierExists(access.organisationId, carrierId))) {
    return actionError(
      values,
      "This carrier is archived or no longer available for service configuration.",
    );
  }
  if (await serviceCodeExists(access.organisationId, carrierId, values.code)) {
    return actionError(
      values,
      "An active or inactive service under this carrier already uses that code.",
      "code",
    );
  }

  const supabase = await createClient();
  const result = await supabase.from("logistics_carrier_services").insert({
    organisation_id: access.organisationId,
    carrier_id: carrierId,
    name: values.name,
    code: values.code,
    service_type: values.serviceType,
    status: values.status,
    temperature_class: values.temperatureClass || null,
    notes: values.notes || null,
    created_by_profile_id: access.profileId,
    updated_by_profile_id: access.profileId,
  });
  if (result.error) {
    if (result.error.code === "23505") {
      return actionError(
        values,
        "An active or inactive service under this carrier already uses that code.",
        "code",
      );
    }
    logConfigurationError("create_carrier_service", result.error, carrierId);
    return actionError(
      values,
      "The carrier service could not be created. Review the details and try again.",
    );
  }
  revalidateCarrierConfiguration(carrierId);
  redirectToCarrier(carrierId, "service_created");
}

export async function updateCarrierServiceAction(
  _previousState: CarrierConfigurationActionState<CarrierServiceFormValues>,
  formData: FormData,
): Promise<CarrierConfigurationActionState<CarrierServiceFormValues>> {
  const access = await requireManageAccess();
  const carrierId = getString(formData, "carrier_id");
  const serviceId = getString(formData, "service_id");
  const values = getServiceValues(formData);
  if (!carrierId || !serviceId) {
    return actionError(values, "The carrier service could not be found.");
  }
  if (!values.name) return actionError(values, "Enter a service name.", "name");
  if (!values.code) return actionError(values, "Enter a service code.", "code");
  if (!codePattern.test(values.code)) {
    return actionError(
      values,
      "Use lowercase letters, numbers, underscores or hyphens for the code.",
      "code",
    );
  }
  if (!isLogisticsCarrierServiceType(values.serviceType)) {
    return actionError(values, "Choose a valid service type.", "service_type");
  }
  if (!validateStatus(values.status)) {
    return actionError(values, "Choose Active or Inactive.", "status");
  }
  if (
    values.temperatureClass &&
    !isDeliveryTemperatureClass(values.temperatureClass)
  ) {
    return actionError(
      values,
      "Choose a valid temperature class or leave it blank.",
      "temperature_class",
    );
  }
  if (!(await activeCarrierExists(access.organisationId, carrierId))) {
    return actionError(
      values,
      "This carrier is archived or no longer available for service configuration.",
    );
  }
  if (
    !(await currentServiceExists(
      access.organisationId,
      carrierId,
      serviceId,
    ))
  ) {
    return actionError(values, "The carrier service could not be found.");
  }
  if (
    await serviceCodeExists(
      access.organisationId,
      carrierId,
      values.code,
      serviceId,
    )
  ) {
    return actionError(
      values,
      "An active or inactive service under this carrier already uses that code.",
      "code",
    );
  }

  const supabase = await createClient();
  const result = await supabase
    .from("logistics_carrier_services")
    .update({
      name: values.name,
      code: values.code,
      service_type: values.serviceType,
      status: values.status,
      temperature_class: values.temperatureClass || null,
      notes: values.notes || null,
      updated_by_profile_id: access.profileId,
    })
    .eq("organisation_id", access.organisationId)
    .eq("carrier_id", carrierId)
    .eq("id", serviceId)
    .is("archived_at", null);
  if (result.error) {
    if (result.error.code === "23505") {
      return actionError(
        values,
        "An active or inactive service under this carrier already uses that code.",
        "code",
      );
    }
    logConfigurationError(
      "update_carrier_service",
      result.error,
      serviceId,
    );
    return actionError(
      values,
      "The carrier service details could not be saved. Review the details and try again.",
    );
  }
  revalidateCarrierConfiguration(carrierId);
  redirectToCarrier(carrierId, "service_updated");
}

export async function archiveCarrierServiceAction(formData: FormData) {
  const access = await requireManageAccess();
  const carrierId = getString(formData, "carrier_id");
  const serviceId = getString(formData, "service_id");
  if (!carrierId || !serviceId) redirectToList("not_found");
  if (
    !(await currentServiceExists(
      access.organisationId,
      carrierId,
      serviceId,
    ))
  ) {
    redirectToCarrier(carrierId, "not_found");
  }
  const supabase = await createClient();
  const result = await supabase
    .from("logistics_carrier_services")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      updated_by_profile_id: access.profileId,
    })
    .eq("organisation_id", access.organisationId)
    .eq("carrier_id", carrierId)
    .eq("id", serviceId)
    .is("archived_at", null);
  if (result.error) redirectToCarrier(carrierId, "error");
  revalidateCarrierConfiguration(carrierId);
  redirectToCarrier(carrierId, "service_archived");
}
