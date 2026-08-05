"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalUuid(value: string) {
  return value && uuidPattern.test(value) ? value : null;
}

function resultHref(path: string, result: string) {
  return `${path}?delivery=${encodeURIComponent(result)}`;
}

async function organisationId() {
  const authContext = await requirePermissionAccess("admin.integrations.manage");
  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }
  return authContext.organisation.id;
}

function revalidateDeliveryWorkspace() {
  revalidatePath("/integrations");
  revalidatePath("/shopify");
  revalidatePath("/shopify/delivery-zones");
  revalidatePath("/shopify/delivery-services");
  revalidatePath("/shopify/delivery-calendars");
  revalidatePath("/shopify/delivery-parser");
  revalidatePath("/shopify/delivery-exceptions");
}

export async function createDeliveryZoneAction(formData: FormData) {
  const path = "/shopify/delivery-zones";
  const targetOrganisationId = await organisationId();
  const code = field(formData, "code");
  const name = field(formData, "name");
  const timezone = field(formData, "timezone");

  if (!code || !name || !timezone) {
    redirect(resultHref(path, "invalid_request"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_delivery_zone", {
    target_organisation_id: targetOrganisationId,
    requested_code: code,
    requested_name: name,
    requested_timezone: timezone,
    requested_country_code: field(formData, "country_code") || null,
    requested_state_region: field(formData, "state_region") || null,
    requested_region_reference: field(formData, "region_reference") || null,
    requested_description: field(formData, "description") || null,
  });

  if (error) {
    console.error("Delivery zone creation failed", {
      code: error.code,
      message: error.message,
    });
    redirect(resultHref(path, "create_failed"));
  }

  revalidateDeliveryWorkspace();
  redirect(resultHref(path, "created"));
}

export async function createDeliveryServiceAction(formData: FormData) {
  const path = "/shopify/delivery-services";
  const targetOrganisationId = await organisationId();
  const code = field(formData, "code");
  const name = field(formData, "name");
  const timezone = field(formData, "timezone");
  const serviceType = field(formData, "service_type");

  if (!code || !name || !timezone || !serviceType) {
    redirect(resultHref(path, "invalid_request"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_delivery_service", {
    target_organisation_id: targetOrganisationId,
    requested_code: code,
    requested_name: name,
    requested_timezone: timezone,
    requested_service_type: serviceType,
    target_facility_id: optionalUuid(field(formData, "facility_id")),
    target_carrier_id: null,
    target_carrier_service_id: null,
    requested_description: field(formData, "description") || null,
  });

  if (error) {
    console.error("Delivery service creation failed", {
      code: error.code,
      message: error.message,
    });
    redirect(resultHref(path, "create_failed"));
  }

  revalidateDeliveryWorkspace();
  redirect(resultHref(path, "created"));
}

export async function createDeliveryCalendarDraftAction(formData: FormData) {
  const path = "/shopify/delivery-calendars";
  const targetOrganisationId = await organisationId();
  const code = field(formData, "code");
  const name = field(formData, "name");
  const timezone = field(formData, "timezone");
  const effectiveFrom = field(formData, "effective_from");

  if (!code || !name || !timezone || !effectiveFrom) {
    redirect(resultHref(path, "invalid_request"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_delivery_calendar_draft", {
    target_organisation_id: targetOrganisationId,
    requested_code: code,
    requested_name: name,
    requested_timezone: timezone,
    requested_effective_from: effectiveFrom,
    requested_effective_to: field(formData, "effective_to") || null,
    target_calendar_id: null,
    target_connection_id: optionalUuid(field(formData, "connection_id")),
    target_facility_id: optionalUuid(field(formData, "facility_id")),
    target_supersedes_version_id: null,
    requested_description: field(formData, "description") || null,
  });

  if (error) {
    console.error("Delivery calendar draft creation failed", {
      code: error.code,
      message: error.message,
    });
    redirect(resultHref(path, "create_failed"));
  }

  revalidateDeliveryWorkspace();
  redirect(resultHref(path, "draft_created"));
}

export async function createDeliveryParserDraftAction(formData: FormData) {
  const path = "/shopify/delivery-parser";
  const targetOrganisationId = await organisationId();
  const connectionId = field(formData, "connection_id");
  const timezone = field(formData, "timezone");
  const effectiveFrom = field(formData, "effective_from");

  if (!uuidPattern.test(connectionId) || !timezone || !effectiveFrom) {
    redirect(resultHref(path, "invalid_request"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_delivery_parser_profile_draft", {
    target_organisation_id: targetOrganisationId,
    target_connection_id: connectionId,
    requested_timezone: timezone,
    requested_effective_from: effectiveFrom,
    requested_effective_to: field(formData, "effective_to") || null,
    target_supersedes_profile_id: null,
  });

  if (error) {
    console.error("Delivery parser draft creation failed", {
      code: error.code,
      message: error.message,
    });
    redirect(resultHref(path, "create_failed"));
  }

  revalidateDeliveryWorkspace();
  redirect(resultHref(path, "draft_created"));
}
