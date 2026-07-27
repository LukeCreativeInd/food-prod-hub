import { cache } from "react";

import { getCurrentOrganisation } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type FeatureFlagKey =
  | "global_search_v1"
  | "tenant_branding_v1"
  | "supplier_invoice_intake_v1"
  | "inventory_locations_v1"
  | "products_manual_management_v1"
  | "costings_dashboard_v1"
  | "production_readiness_dashboard_v1"
  | "loading_transition_v1"
  | "help_support_menu_v1"
  | "everybatch_branding_v1"
  | "login_branding_v1";

export type OrganisationFeatureFlag = {
  key: string;
  label: string;
  description: string | null;
  category: string;
  rolloutStage: string;
  defaultEnabled: boolean;
  enabled: boolean;
  hasOverride: boolean;
  notes: string | null;
};

type FeatureFlagRow = {
  id: string;
  feature_key: string;
  label: string;
  description: string | null;
  category: string;
  default_enabled: boolean;
  rollout_stage: string;
};

type OrganisationFeatureFlagRow = {
  feature_flag_id: string;
  enabled: boolean;
  notes: string | null;
};

export const getOrganisationFeatureFlags = cache(
  async function getOrganisationFeatureFlags(
    organisationId: string,
  ): Promise<OrganisationFeatureFlag[]> {
    const supabase = await createClient();
    const [featureFlagsResult, overridesResult] = await Promise.all([
      supabase
        .from("feature_flags")
        .select(
          "id, feature_key, label, description, category, default_enabled, rollout_stage",
        )
        .eq("status", "active")
        .is("archived_at", null)
        .order("category", { ascending: true })
        .order("feature_key", { ascending: true }),
      supabase
        .from("organisation_feature_flags")
        .select("feature_flag_id, enabled, notes")
        .eq("organisation_id", organisationId),
    ]);

    if (featureFlagsResult.error || overridesResult.error) {
      return [];
    }

    const overridesByFlagId = new Map(
      ((overridesResult.data ?? []) as OrganisationFeatureFlagRow[]).map(
        (override) => [override.feature_flag_id, override],
      ),
    );

    return ((featureFlagsResult.data ?? []) as FeatureFlagRow[]).map((flag) => {
      const override = overridesByFlagId.get(flag.id);

      return {
        key: flag.feature_key,
        label: flag.label,
        description: flag.description,
        category: flag.category,
        rolloutStage: flag.rollout_stage,
        defaultEnabled: flag.default_enabled,
        enabled: override?.enabled ?? flag.default_enabled,
        hasOverride: Boolean(override),
        notes: override?.notes ?? null,
      };
    });
  },
);

export async function getFeatureFlagMap(organisationId: string) {
  const flags = await getOrganisationFeatureFlags(organisationId);

  return new Map(flags.map((flag) => [flag.key, flag.enabled]));
}

export async function isFeatureEnabled(
  organisationId: string,
  featureKey: string,
) {
  const flags = await getFeatureFlagMap(organisationId);

  return flags.get(featureKey) ?? false;
}

export async function getCurrentOrganisationFeatureFlags() {
  const organisation = await getCurrentOrganisation();

  if (!organisation) {
    return [];
  }

  return getOrganisationFeatureFlags(organisation.id);
}

export async function getCurrentFeatureFlagMap() {
  const organisation = await getCurrentOrganisation();

  if (!organisation) {
    return new Map<string, boolean>();
  }

  return getFeatureFlagMap(organisation.id);
}

export async function isCurrentFeatureEnabled(featureKey: string) {
  const organisation = await getCurrentOrganisation();

  if (!organisation) {
    return false;
  }

  return isFeatureEnabled(organisation.id, featureKey);
}
