import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type PlatformTenantSummary = {
  organisationId: string;
  slug: string;
  name: string;
  industry: string | null;
  status: string;
};

export type PlatformTenantModuleState = {
  moduleId: string;
  moduleKey: string;
  label: string;
  description: string | null;
  moduleGroup: string;
  phase: string;
  status: string;
  sortOrder: number;
  enabled: boolean;
  enabledAt: string | null;
  disabledAt: string | null;
  notes: string | null;
};

export type PlatformTenantFeatureState = {
  featureId: string;
  featureKey: string;
  label: string;
  description: string | null;
  category: string;
  rolloutStage: string;
  status: string;
  defaultEnabled: boolean;
  overrideEnabled: boolean | null;
  effectiveEnabled: boolean;
  source: "tenant_override" | "global_default";
  enabledAt: string | null;
  disabledAt: string | null;
  notes: string | null;
};

export type PlatformTenantModulesAndFeatures = {
  tenant: PlatformTenantSummary | null;
  modules: PlatformTenantModuleState[];
  features: PlatformTenantFeatureState[];
  summary: {
    totalModules: number;
    enabledTenantModules: number;
    disabledTenantModules: number;
    activeFeatureFlags: number;
    tenantFeatureOverrides: number;
    enabledFeatureOverrides: number;
    effectiveEnabledFeatures: number;
    rolloutStageCounts: Array<{
      rolloutStage: string;
      count: number;
    }>;
  };
};

type OrganisationRow = {
  id: string;
  slug: string;
  name: string;
  industry: string | null;
  status: string;
};

type ModuleRow = {
  id: string;
  module_key: string;
  label: string;
  description: string | null;
  module_group: string;
  phase: string;
  status: string;
  sort_order: number;
  archived_at: string | null;
};

type OrganisationModuleRow = {
  module_id: string;
  enabled: boolean;
  enabled_at: string | null;
  disabled_at: string | null;
  notes: string | null;
};

type FeatureFlagRow = {
  id: string;
  feature_key: string;
  label: string;
  description: string | null;
  category: string;
  default_enabled: boolean;
  status: string;
  rollout_stage: string;
  archived_at: string | null;
};

type OrganisationFeatureFlagRow = {
  feature_flag_id: string;
  enabled: boolean;
  enabled_at: string | null;
  disabled_at: string | null;
  notes: string | null;
};

function emptyResult(): PlatformTenantModulesAndFeatures {
  return {
    tenant: null,
    modules: [],
    features: [],
    summary: {
      totalModules: 0,
      enabledTenantModules: 0,
      disabledTenantModules: 0,
      activeFeatureFlags: 0,
      tenantFeatureOverrides: 0,
      enabledFeatureOverrides: 0,
      effectiveEnabledFeatures: 0,
      rolloutStageCounts: [],
    },
  };
}

function getRolloutStageCounts(features: PlatformTenantFeatureState[]) {
  const counts = features.reduce((stageCounts, feature) => {
    stageCounts.set(
      feature.rolloutStage,
      (stageCounts.get(feature.rolloutStage) ?? 0) + 1,
    );

    return stageCounts;
  }, new Map<string, number>());

  return Array.from(counts.entries())
    .map(([rolloutStage, count]) => ({ rolloutStage, count }))
    .sort((firstStage, secondStage) =>
      firstStage.rolloutStage.localeCompare(secondStage.rolloutStage),
    );
}

export const getPlatformTenantModulesAndFeatures = cache(
  async function getPlatformTenantModulesAndFeatures(
    tenantSlug = "cleaneats",
  ): Promise<PlatformTenantModulesAndFeatures> {
    const supabase = await createClient();
    const { data: organisationData, error: organisationError } = await supabase
      .from("organisations")
      .select("id, slug, name, industry, status")
      .eq("slug", tenantSlug)
      .is("archived_at", null)
      .maybeSingle();

    if (organisationError || !organisationData) {
      return emptyResult();
    }

    const tenant = organisationData as OrganisationRow;
    const [
      modulesResult,
      organisationModulesResult,
      featureFlagsResult,
      organisationFeatureFlagsResult,
    ] = await Promise.all([
      supabase
        .from("modules")
        .select(
          "id, module_key, label, description, module_group, phase, status, sort_order, archived_at",
        )
        .is("archived_at", null)
        .order("sort_order", { ascending: true })
        .order("label", { ascending: true }),
      supabase
        .from("organisation_modules")
        .select("module_id, enabled, enabled_at, disabled_at, notes")
        .eq("organisation_id", tenant.id),
      supabase
        .from("feature_flags")
        .select(
          "id, feature_key, label, description, category, default_enabled, status, rollout_stage, archived_at",
        )
        .is("archived_at", null)
        .order("category", { ascending: true })
        .order("feature_key", { ascending: true }),
      supabase
        .from("organisation_feature_flags")
        .select("feature_flag_id, enabled, enabled_at, disabled_at, notes")
        .eq("organisation_id", tenant.id),
    ]);

    const moduleRows =
      modulesResult.error ? [] : ((modulesResult.data as ModuleRow[] | null) ?? []);
    const organisationModuleRows =
      organisationModulesResult.error
        ? []
        : ((organisationModulesResult.data as OrganisationModuleRow[] | null) ??
          []);
    const featureRows =
      featureFlagsResult.error
        ? []
        : ((featureFlagsResult.data as FeatureFlagRow[] | null) ?? []);
    const organisationFeatureRows =
      organisationFeatureFlagsResult.error
        ? []
        : ((organisationFeatureFlagsResult.data as OrganisationFeatureFlagRow[] | null) ??
          []);

    const organisationModulesByModuleId = new Map(
      organisationModuleRows.map((row) => [row.module_id, row]),
    );
    const organisationFeaturesByFeatureId = new Map(
      organisationFeatureRows.map((row) => [row.feature_flag_id, row]),
    );

    const modules = moduleRows.map((moduleRow) => {
      const tenantModule = organisationModulesByModuleId.get(moduleRow.id);

      return {
        moduleId: moduleRow.id,
        moduleKey: moduleRow.module_key,
        label: moduleRow.label,
        description: moduleRow.description,
        moduleGroup: moduleRow.module_group,
        phase: moduleRow.phase,
        status: moduleRow.status,
        sortOrder: moduleRow.sort_order,
        enabled: tenantModule?.enabled ?? false,
        enabledAt: tenantModule?.enabled_at ?? null,
        disabledAt: tenantModule?.disabled_at ?? null,
        notes: tenantModule?.notes ?? null,
      };
    });
    const activeFeatureRows = featureRows.filter(
      (feature) => feature.status === "active" && feature.archived_at === null,
    );
    const features = activeFeatureRows.map((feature) => {
      const tenantFeature = organisationFeaturesByFeatureId.get(feature.id);
      const hasOverride = Boolean(tenantFeature);
      const effectiveEnabled = tenantFeature?.enabled ?? feature.default_enabled;

      return {
        featureId: feature.id,
        featureKey: feature.feature_key,
        label: feature.label,
        description: feature.description,
        category: feature.category,
        rolloutStage: feature.rollout_stage,
        status: feature.status,
        defaultEnabled: feature.default_enabled,
        overrideEnabled: tenantFeature?.enabled ?? null,
        effectiveEnabled,
        source: hasOverride ? "tenant_override" : "global_default",
        enabledAt: tenantFeature?.enabled_at ?? null,
        disabledAt: tenantFeature?.disabled_at ?? null,
        notes: tenantFeature?.notes ?? null,
      } satisfies PlatformTenantFeatureState;
    });

    return {
      tenant: {
        organisationId: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        industry: tenant.industry,
        status: tenant.status,
      },
      modules,
      features,
      summary: {
        totalModules: modules.length,
        enabledTenantModules: modules.filter((moduleRow) => moduleRow.enabled)
          .length,
        disabledTenantModules: modules.filter((moduleRow) => !moduleRow.enabled)
          .length,
        activeFeatureFlags: features.length,
        tenantFeatureOverrides: features.filter(
          (feature) => feature.source === "tenant_override",
        ).length,
        enabledFeatureOverrides: features.filter(
          (feature) =>
            feature.source === "tenant_override" && feature.effectiveEnabled,
        ).length,
        effectiveEnabledFeatures: features.filter(
          (feature) => feature.effectiveEnabled,
        ).length,
        rolloutStageCounts: getRolloutStageCounts(features),
      },
    };
  },
);
