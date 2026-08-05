import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type DeliveryConfigurationStatus =
  | "ready"
  | "schema_missing"
  | "permission_denied"
  | "query_error";

export const DELIVERY_PARSER_SOURCE_LOCATIONS = [
  "order_attribute",
  "source_tag",
] as const;

export type DeliveryParserSourceLocation =
  (typeof DELIVERY_PARSER_SOURCE_LOCATIONS)[number];

type QueryError = { code?: string | null } | null;

function classify(errors: QueryError[]): DeliveryConfigurationStatus {
  const codes = errors.flatMap((error) => (error?.code ? [error.code] : []));
  if (codes.some((code) => code === "42501" || code === "PGRST301")) {
    return "permission_denied";
  }
  if (
    codes.some((code) =>
      ["42P01", "42703", "PGRST200", "PGRST204", "PGRST205"].includes(code),
    )
  ) {
    return "schema_missing";
  }
  return codes.length > 0 ? "query_error" : "ready";
}

export function deliveryConfigurationMessage(status: DeliveryConfigurationStatus) {
  switch (status) {
    case "schema_missing":
      return "Migration 050 has not been applied to this environment. No delivery configuration state has been assumed.";
    case "permission_denied":
      return "Delivery configuration is unavailable for this account. No tenant state has been assumed.";
    case "query_error":
      return "Delivery configuration could not be loaded. No readiness or records have been assumed.";
    default:
      return "Delivery configuration is available.";
  }
}

export async function getDeliveryConfigurationData() {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("admin.integrations.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();
  const [
    connectionsResult,
    facilitiesResult,
    zonesResult,
    servicesResult,
    assignmentsResult,
    calendarsResult,
    versionsResult,
    rulesResult,
    exceptionsResult,
    parserProfilesResult,
    parserFieldsResult,
    interpretationsResult,
    overridesResult,
  ] = await Promise.all([
    supabase
      .from("commerce_connections")
      .select("id,storefront_display_name,business_status,delivery_parser_readiness,delivery_calendar_readiness,mapping_readiness,demand_readiness")
      .eq("organisation_id", organisationId)
      .eq("provider_key", "shopify")
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("facilities")
      .select("id,code,name,timezone,status")
      .eq("organisation_id", organisationId)
      .eq("status", "active")
      .is("archived_at", null)
      .order("name"),
    supabase
      .from("delivery_zones")
      .select("id,code,name,description,status,timezone,country_code,state_region,region_reference,created_at,updated_at,archived_at")
      .eq("organisation_id", organisationId)
      .order("name"),
    supabase
      .from("delivery_services")
      .select("id,code,name,description,service_type,status,timezone,facility_id,carrier_id,carrier_service_id,created_at,updated_at,archived_at")
      .eq("organisation_id", organisationId)
      .order("name"),
    supabase
      .from("delivery_service_zone_assignments")
      .select("id,service_id,zone_id,connection_id,source_zone_reference,source_service_reference,effective_from,effective_to,status,archived_at")
      .eq("organisation_id", organisationId)
      .order("effective_from", { ascending: false }),
    supabase
      .from("delivery_calendars")
      .select("id,code,name,description,timezone,connection_id,default_facility_id,status,created_at,updated_at,archived_at")
      .eq("organisation_id", organisationId)
      .order("name"),
    supabase
      .from("delivery_calendar_versions")
      .select("id,calendar_id,version_number,status,effective_from,effective_to,supersedes_version_id,submitted_at,published_at,rejected_at,rejection_reason_category,created_at,archived_at")
      .eq("organisation_id", organisationId)
      .order("version_number", { ascending: false }),
    supabase
      .from("delivery_calendar_rules")
      .select("id,calendar_version_id,rule_scope,connection_id,zone_id,service_id,facility_id,delivery_weekday,production_weekday,production_weeks_before,timezone,safe_note")
      .eq("organisation_id", organisationId),
    supabase
      .from("delivery_calendar_exceptions")
      .select("id,calendar_version_id,exception_date,category,effect,connection_id,zone_id,service_id,facility_id,replacement_delivery_date,replacement_production_date,reason,created_at")
      .eq("organisation_id", organisationId)
      .order("exception_date", { ascending: false }),
    supabase
      .from("delivery_parser_profiles")
      .select("id,connection_id,version_number,status,timezone,effective_from,effective_to,supersedes_profile_id,submitted_at,published_at,rejected_at,rejection_reason_category,created_at,archived_at")
      .eq("organisation_id", organisationId)
      .order("version_number", { ascending: false }),
    supabase
      .from("delivery_parser_profile_fields")
      .select("id,parser_profile_id,source_location,source_key,target_field,date_format,required,sequence,created_at")
      .eq("organisation_id", organisationId)
      .order("sequence"),
    supabase
      .from("commerce_order_delivery_interpretations")
      .select("id,source_order_id,status,resolved_delivery_date,resolved_production_date,safe_error_category,created_at")
      .eq("organisation_id", organisationId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("commerce_order_delivery_overrides")
      .select("id,source_order_id,status,reason_category,approved_at,reversal_of_override_id")
      .eq("organisation_id", organisationId)
      .order("approved_at", { ascending: false })
      .limit(50),
  ]);

  const migrationResults = [
    zonesResult,
    servicesResult,
    assignmentsResult,
    calendarsResult,
    versionsResult,
    rulesResult,
    exceptionsResult,
    parserProfilesResult,
    parserFieldsResult,
    interpretationsResult,
    overridesResult,
  ];
  const status = classify(migrationResults.map((result) => result.error));

  if (status !== "ready") {
    console.error("[delivery-configuration] data unavailable", {
      category: status,
      codes: migrationResults.flatMap((result) =>
        result.error?.code ? [result.error.code] : [],
      ),
    });
  }

  return {
    organisation: {
      id: organisationId,
      name: authContext.organisation.name,
    },
    canManage: permissionKeys.includes("admin.integrations.manage"),
    status,
    statusMessage: deliveryConfigurationMessage(status),
    connections: connectionsResult.error ? [] : connectionsResult.data ?? [],
    facilities: facilitiesResult.error ? [] : facilitiesResult.data ?? [],
    zones: status === "ready" ? zonesResult.data ?? [] : [],
    services: status === "ready" ? servicesResult.data ?? [] : [],
    assignments: status === "ready" ? assignmentsResult.data ?? [] : [],
    calendars: status === "ready" ? calendarsResult.data ?? [] : [],
    versions: status === "ready" ? versionsResult.data ?? [] : [],
    rules: status === "ready" ? rulesResult.data ?? [] : [],
    exceptions: status === "ready" ? exceptionsResult.data ?? [] : [],
    parserProfiles: status === "ready" ? parserProfilesResult.data ?? [] : [],
    parserFields: status === "ready" ? parserFieldsResult.data ?? [] : [],
    interpretations:
      status === "ready" ? interpretationsResult.data ?? [] : [],
    overrides: status === "ready" ? overridesResult.data ?? [] : [],
  };
}
