"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { userHasPermission } from "@/lib/auth";
import {
  getFeatureFlagPack,
  getModulePack,
  getTenantProvisioningTemplate,
  type FeatureFlagPackKey,
  type ModulePackKey,
  type ProvisioningFeatureKey,
  type ProvisioningTemplateKey,
} from "@/lib/platform-provisioning-templates";
import { createClient } from "@/lib/supabase/server";

type ModuleRegistryRow = {
  id: string;
  module_key: string;
};

type FeatureFlagRegistryRow = {
  id: string;
  feature_key: string;
};

type OrganisationInsertRow = {
  id: string;
  slug: string;
};

const reservedTenantSlugs = new Set([
  "admin",
  "api",
  "app",
  "cleaneats",
  "everybatch",
  "platform",
  "support",
  "www",
]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value ? value : null;
}

function redirectWithError(error: string): never {
  redirect(`/platform/tenants/new?error=${encodeURIComponent(error)}`);
}

function isRlsError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42501" ||
    error?.message?.toLowerCase().includes("row-level security")
  );
}

function getProvisioningInput(formData: FormData) {
  return {
    organisationName: getString(formData, "organisation_name"),
    workspaceName: getString(formData, "workspace_name"),
    tenantSlug: getString(formData, "tenant_slug").toLowerCase(),
    industry: getOptionalString(formData, "industry") ?? "Food Manufacturing",
    timezone: getString(formData, "timezone") || "Australia/Melbourne",
    currency: (getString(formData, "currency") || "AUD").toUpperCase(),
    defaultUnits: getString(formData, "default_units") || "metric",
    tenantTemplateKey:
      (getString(formData, "tenant_template_key") as ProvisioningTemplateKey) ||
      "foundation_pilot",
    modulePackKey:
      (getString(formData, "module_pack_key") as ModulePackKey) ||
      "foundation_operations",
    featureFlagPackKey:
      (getString(formData, "feature_flag_pack_key") as FeatureFlagPackKey) ||
      "foundation_features",
    primaryContactName: getOptionalString(formData, "primary_contact_name"),
    primaryContactEmail: getOptionalString(formData, "primary_contact_email"),
    notes: getOptionalString(formData, "notes"),
  };
}

function validateInput(input: ReturnType<typeof getProvisioningInput>) {
  if (!input.organisationName) {
    return "missing_organisation_name";
  }

  if (!input.workspaceName) {
    return "missing_workspace_name";
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.tenantSlug)) {
    return "invalid_slug";
  }

  if (reservedTenantSlugs.has(input.tenantSlug)) {
    return "reserved_slug";
  }

  if (
    input.primaryContactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.primaryContactEmail)
  ) {
    return "invalid_email";
  }

  if (!/^[A-Z]{3}$/.test(input.currency)) {
    return "invalid_currency";
  }

  if (!["metric", "imperial"].includes(input.defaultUnits)) {
    return "invalid_default_units";
  }

  if (!getTenantProvisioningTemplate(input.tenantTemplateKey)) {
    return "invalid_template";
  }

  if (!getModulePack(input.modulePackKey)) {
    return "invalid_module_pack";
  }

  if (!getFeatureFlagPack(input.featureFlagPackKey)) {
    return "invalid_feature_pack";
  }

  return null;
}

function getCreateNotes(input: ReturnType<typeof getProvisioningInput>) {
  return [
    `Provisioned from ${input.tenantTemplateKey}.`,
    `Workspace name preview: ${input.workspaceName}.`,
    input.primaryContactName
      ? `Primary contact: ${input.primaryContactName}.`
      : null,
    input.notes ? `Notes: ${input.notes}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function getTemplateFeatureKeys(featureFlagPackKey: FeatureFlagPackKey) {
  const featurePack = getFeatureFlagPack(featureFlagPackKey);

  return (
    featurePack?.features
      .filter((feature) => feature.status === "active")
      .map((feature) => feature.featureKey) ?? []
  );
}

export async function createTenantFoundationAction(formData: FormData) {
  const hasManagePermission = await userHasPermission("platform.tenants.manage");

  if (!hasManagePermission) {
    redirect("/no-access");
  }

  const input = getProvisioningInput(formData);
  const validationError = validateInput(input);

  if (validationError) {
    redirectWithError(validationError);
  }

  const modulePack = getModulePack(input.modulePackKey);
  const featurePack = getFeatureFlagPack(input.featureFlagPackKey);

  if (!modulePack || !featurePack) {
    redirectWithError("invalid_template");
  }

  const selectedFeaturePack = featurePack;
  const moduleKeys = ((modulePack?.moduleKeys ?? []) as string[]).filter(
    (moduleKey) => moduleKey !== "platform",
  );
  const activeFeatureKeys = getTemplateFeatureKeys(input.featureFlagPackKey);
  const supabase = await createClient();

  const { data: existingOrganisation, error: duplicateError } = await supabase
    .from("organisations")
    .select("id")
    .eq("slug", input.tenantSlug)
    .maybeSingle();

  if (duplicateError) {
    redirectWithError("duplicate_check_failed");
  }

  if (existingOrganisation) {
    redirectWithError("duplicate_slug");
  }

  const { data: moduleRows, error: moduleError } =
    moduleKeys.length > 0
      ? await supabase
          .from("modules")
          .select("id, module_key")
          .in("module_key", moduleKeys)
          .eq("status", "active")
          .is("archived_at", null)
      : { data: [], error: null };

  if (moduleError) {
    redirectWithError("module_registry_error");
  }

  const modulesByKey = new Map(
    ((moduleRows as ModuleRegistryRow[] | null) ?? []).map((moduleRow) => [
      moduleRow.module_key,
      moduleRow,
    ]),
  );
  const missingModule = moduleKeys.find((moduleKey) => !modulesByKey.has(moduleKey));

  if (missingModule) {
    redirectWithError("missing_module_registry");
  }

  const { data: featureRows, error: featureError } =
    activeFeatureKeys.length > 0
      ? await supabase
          .from("feature_flags")
          .select("id, feature_key")
          .in("feature_key", activeFeatureKeys)
          .eq("status", "active")
          .is("archived_at", null)
      : { data: [], error: null };

  if (featureError) {
    redirectWithError("feature_registry_error");
  }

  const featuresByKey = new Map(
    ((featureRows as FeatureFlagRegistryRow[] | null) ?? []).map(
      (featureRow) => [featureRow.feature_key, featureRow],
    ),
  );
  const missingFeature = activeFeatureKeys.find(
    (featureKey) => !featuresByKey.has(featureKey),
  );

  if (missingFeature) {
    redirectWithError("missing_feature_registry");
  }

  const { data: organisation, error: organisationError } = await supabase
    .from("organisations")
    .insert({
      name: input.organisationName,
      slug: input.tenantSlug,
      industry: input.industry,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (organisationError || !organisation) {
    redirectWithError(
      isRlsError(organisationError) ? "rls_policy_required" : "create_failed",
    );
  }

  const createdOrganisation = organisation as OrganisationInsertRow;
  const now = new Date().toISOString();
  const createNotes = getCreateNotes(input);

  const { error: settingsError } = await supabase
    .from("organisation_settings")
    .insert({
      organisation_id: createdOrganisation.id,
      timezone: input.timezone,
      currency: input.currency,
      default_units: input.defaultUnits,
      date_format: "DD/MM/YYYY",
      time_format: "24h",
      updated_at: now,
    });

  if (settingsError) {
    redirectWithError(
      isRlsError(settingsError) ? "rls_policy_required" : "partial_failure",
    );
  }

  const { error: brandingError } = await supabase
    .from("organisation_branding")
    .insert({
      organisation_id: createdOrganisation.id,
      logo_url: null,
      primary_colour: "#176B3A",
      accent_colour: "#A7D129",
      sidebar_style: "clean-operations",
      theme_mode: "light",
      success_colour: "#15803D",
      warning_colour: "#B7791F",
      danger_colour: "#B91C1C",
      info_colour: "#0369A1",
      updated_at: now,
    });

  if (brandingError) {
    redirectWithError(
      isRlsError(brandingError) ? "rls_policy_required" : "partial_failure",
    );
  }

  const organisationModuleRows = moduleKeys
    .map((moduleKey) => modulesByKey.get(moduleKey))
    .filter((moduleRow): moduleRow is ModuleRegistryRow => Boolean(moduleRow))
    .map((moduleRow) => ({
      organisation_id: createdOrganisation.id,
      module_id: moduleRow.id,
      enabled: true,
      enabled_at: now,
      disabled_at: null,
      notes: createNotes,
      updated_at: now,
    }));

  if (organisationModuleRows.length > 0) {
    const { error: modulesInsertError } = await supabase
      .from("organisation_modules")
      .insert(organisationModuleRows);

    if (modulesInsertError) {
      redirectWithError(
        isRlsError(modulesInsertError)
          ? "rls_policy_required"
          : "partial_failure",
      );
    }
  }

  const featureTemplateByKey = new Map(
    selectedFeaturePack.features.map((feature) => [
      feature.featureKey,
      feature,
    ]),
  );
  const featureOverrideRows = activeFeatureKeys
    .map((featureKey) => {
      const featureRow = featuresByKey.get(featureKey);
      const featureTemplate = featureTemplateByKey.get(
        featureKey as ProvisioningFeatureKey,
      );

      if (!featureRow || !featureTemplate) {
        return null;
      }

      return {
        organisation_id: createdOrganisation.id,
        feature_flag_id: featureRow.id,
        enabled: featureTemplate.enabledByDefault,
        notes: createNotes,
        enabled_at: featureTemplate.enabledByDefault ? now : null,
        disabled_at: featureTemplate.enabledByDefault ? null : now,
        updated_at: now,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (featureOverrideRows.length > 0) {
    const { error: featuresInsertError } = await supabase
      .from("organisation_feature_flags")
      .insert(featureOverrideRows);

    if (featuresInsertError) {
      redirectWithError(
        isRlsError(featuresInsertError)
          ? "rls_policy_required"
          : "partial_failure",
      );
    }
  }

  revalidatePath("/platform");
  revalidatePath("/platform/tenants/new");
  redirect(`/platform/tenants/new?created=${createdOrganisation.slug}`);
}
