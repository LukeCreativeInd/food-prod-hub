import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

type OrganisationRow = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  archived_at: string | null;
};

type SettingsRow = {
  organisation_id: string;
  timezone: string;
  currency: string;
  default_units: string;
};

type BrandingRow = {
  organisation_id: string;
  logo_url: string | null;
  primary_colour: string | null;
  accent_colour: string | null;
  sidebar_style: string | null;
  theme_mode: string | null;
};

type OrganisationModuleRow = {
  organisation_id: string;
  enabled: boolean;
  modules:
    | {
        module_key: string;
        label: string;
        status: string;
        archived_at: string | null;
      }
    | {
        module_key: string;
        label: string;
        status: string;
        archived_at: string | null;
      }[]
    | null;
};

type OrganisationFeatureFlagRow = {
  organisation_id: string;
  enabled: boolean;
  feature_flags:
    | {
        feature_key: string;
        label: string;
        status: string;
        archived_at: string | null;
      }
    | {
        feature_key: string;
        label: string;
        status: string;
        archived_at: string | null;
      }[]
    | null;
};

type MembershipRow = {
  organisation_id: string;
  role_key: string;
  access_level: string | null;
  status: string;
  archived_at: string | null;
};

type ModuleRow = {
  id: string;
  module_key: string;
  status: string;
  archived_at: string | null;
};

type FeatureFlagRow = {
  id: string;
  feature_key: string;
  status: string;
  archived_at: string | null;
};

export type PlatformTenantOverviewRow = {
  organisationId: string;
  slug: string;
  name: string;
  industry: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  timezone: string | null;
  currency: string | null;
  defaultUnits: string | null;
  logoUrl: string | null;
  primaryColour: string | null;
  accentColour: string | null;
  sidebarStyle: string | null;
  themeMode: string | null;
  enabledModuleCount: number;
  enabledModules: Array<{
    key: string;
    label: string;
  }>;
  featureOverrideCount: number;
  enabledFeatureOverrideCount: number;
  featureOverrides: Array<{
    key: string;
    label: string;
    enabled: boolean;
  }>;
  activeMemberCount: number;
  tenantAdminCount: number;
  activeRoleBreakdown: Array<{
    roleKey: string;
    count: number;
  }>;
  viewHref: string | null;
  billingMode: "manual";
  supportStatus: "placeholder";
};

export type PlatformTenantOverview = {
  totalTenantCount: number;
  activeTenantCount: number;
  onboardingTenantCount: number;
  pilotTenantCount: number;
  tenantRows: PlatformTenantOverviewRow[];
  platformSummary: {
    totalModules: number;
    activeModules: number;
    featureFlagCount: number;
    enabledFeatureOverrideCount: number;
    supportTicketCount: number | null;
    billingStatus: "manual_not_configured";
  };
};

function asSingle<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] : value;
}

function getViewHref(slug: string) {
  if (slug === "cleaneats") {
    return "/platform/tenants/cleaneats";
  }

  return null;
}

function groupByOrganisationId<T extends { organisation_id: string }>(
  rows: T[],
) {
  return rows.reduce((grouped, row) => {
    const existingRows = grouped.get(row.organisation_id) ?? [];
    existingRows.push(row);
    grouped.set(row.organisation_id, existingRows);

    return grouped;
  }, new Map<string, T[]>());
}

function emptyOverview(): PlatformTenantOverview {
  return {
    totalTenantCount: 0,
    activeTenantCount: 0,
    onboardingTenantCount: 0,
    pilotTenantCount: 0,
    tenantRows: [],
    platformSummary: {
      totalModules: 0,
      activeModules: 0,
      featureFlagCount: 0,
      enabledFeatureOverrideCount: 0,
      supportTicketCount: null,
      billingStatus: "manual_not_configured",
    },
  };
}

export const getPlatformTenantOverview = cache(
  async function getPlatformTenantOverview(): Promise<PlatformTenantOverview> {
    const supabase = await createClient();

    const [
      organisationsResult,
      settingsResult,
      brandingResult,
      organisationModulesResult,
      organisationFeatureFlagsResult,
      membershipsResult,
      modulesResult,
      featureFlagsResult,
    ] = await Promise.all([
      supabase
        .from("organisations")
        .select(
          "id, name, slug, industry, status, created_at, updated_at, archived_at",
        )
        .is("archived_at", null)
        .order("name", { ascending: true }),
      supabase
        .from("organisation_settings")
        .select("organisation_id, timezone, currency, default_units"),
      supabase
        .from("organisation_branding")
        .select(
          "organisation_id, logo_url, primary_colour, accent_colour, sidebar_style, theme_mode",
        ),
      supabase
        .from("organisation_modules")
        .select(
          `
          organisation_id,
          enabled,
          modules!inner (
            module_key,
            label,
            status,
            archived_at
          )
        `,
        ),
      supabase
        .from("organisation_feature_flags")
        .select(
          `
          organisation_id,
          enabled,
          feature_flags!inner (
            feature_key,
            label,
            status,
            archived_at
          )
        `,
        ),
      supabase
        .from("organisation_memberships")
        .select("organisation_id, role_key, access_level, status, archived_at"),
      supabase.from("modules").select("id, module_key, status, archived_at"),
      supabase
        .from("feature_flags")
        .select("id, feature_key, status, archived_at"),
    ]);

    if (organisationsResult.error) {
      return emptyOverview();
    }

    const organisations =
      (organisationsResult.data as OrganisationRow[] | null) ?? [];
    const settingsRows =
      settingsResult.error
        ? []
        : ((settingsResult.data as SettingsRow[] | null) ?? []);
    const brandingRows =
      brandingResult.error
        ? []
        : ((brandingResult.data as BrandingRow[] | null) ?? []);
    const organisationModuleRows =
      organisationModulesResult.error
        ? []
        : ((organisationModulesResult.data as unknown as OrganisationModuleRow[] | null) ??
          []);
    const organisationFeatureFlagRows =
      organisationFeatureFlagsResult.error
        ? []
        : ((organisationFeatureFlagsResult.data as unknown as OrganisationFeatureFlagRow[] | null) ??
          []);
    const membershipRows =
      membershipsResult.error
        ? []
        : ((membershipsResult.data as MembershipRow[] | null) ?? []);
    const moduleRows =
      modulesResult.error
        ? []
        : ((modulesResult.data as ModuleRow[] | null) ?? []);
    const featureFlagRows =
      featureFlagsResult.error
        ? []
        : ((featureFlagsResult.data as FeatureFlagRow[] | null) ?? []);

    const settingsByOrganisation = new Map(
      settingsRows.map((settings) => [settings.organisation_id, settings]),
    );
    const brandingByOrganisation = new Map(
      brandingRows.map((branding) => [branding.organisation_id, branding]),
    );
    const modulesByOrganisation = groupByOrganisationId(
      organisationModuleRows.filter((row) => {
        const moduleRow = asSingle(row.modules);

        return (
          row.enabled &&
          moduleRow?.status === "active" &&
          moduleRow.archived_at === null
        );
      }),
    );
    const featureOverridesByOrganisation = groupByOrganisationId(
      organisationFeatureFlagRows.filter((row) => {
        const featureFlag = asSingle(row.feature_flags);

        return (
          featureFlag?.status === "active" && featureFlag.archived_at === null
        );
      }),
    );
    const activeMembershipsByOrganisation = groupByOrganisationId(
      membershipRows.filter(
        (membership) =>
          membership.status === "active" && membership.archived_at === null,
      ),
    );

    const tenantRows = organisations.map((organisation) => {
      const settings = settingsByOrganisation.get(organisation.id);
      const branding = brandingByOrganisation.get(organisation.id);
      const enabledModules = (modulesByOrganisation.get(organisation.id) ?? [])
        .map((row) => asSingle(row.modules))
        .filter((moduleRow): moduleRow is NonNullable<typeof moduleRow> =>
          Boolean(moduleRow),
        )
        .map((moduleRow) => ({
          key: moduleRow.module_key,
          label: moduleRow.label,
        }));
      const featureOverrides =
        featureOverridesByOrganisation.get(organisation.id) ?? [];
      const activeMemberships =
        activeMembershipsByOrganisation.get(organisation.id) ?? [];
      const roleCounts = activeMemberships.reduce((counts, membership) => {
        counts.set(
          membership.role_key,
          (counts.get(membership.role_key) ?? 0) + 1,
        );

        return counts;
      }, new Map<string, number>());

      return {
        organisationId: organisation.id,
        slug: organisation.slug,
        name: organisation.name,
        industry: organisation.industry,
        status: organisation.status,
        createdAt: organisation.created_at,
        updatedAt: organisation.updated_at,
        timezone: settings?.timezone ?? null,
        currency: settings?.currency ?? null,
        defaultUnits: settings?.default_units ?? null,
        logoUrl: branding?.logo_url ?? null,
        primaryColour: branding?.primary_colour ?? null,
        accentColour: branding?.accent_colour ?? null,
        sidebarStyle: branding?.sidebar_style ?? null,
        themeMode: branding?.theme_mode ?? null,
        enabledModuleCount: enabledModules.length,
        enabledModules,
        featureOverrideCount: featureOverrides.length,
        enabledFeatureOverrideCount: featureOverrides.filter(
          (row) => row.enabled,
        ).length,
        featureOverrides: featureOverrides
          .map((row) => {
            const featureFlag = asSingle(row.feature_flags);

            if (!featureFlag) {
              return null;
            }

            return {
              key: featureFlag.feature_key,
              label: featureFlag.label,
              enabled: row.enabled,
            };
          })
          .filter((flag): flag is NonNullable<typeof flag> => Boolean(flag)),
        activeMemberCount: activeMemberships.length,
        tenantAdminCount: activeMemberships.filter((membership) =>
          ["organisation_admin", "platform_admin"].includes(
            membership.role_key,
          ),
        ).length,
        activeRoleBreakdown: Array.from(roleCounts.entries())
          .map(([roleKey, count]) => ({ roleKey, count }))
          .sort((firstRole, secondRole) =>
            firstRole.roleKey.localeCompare(secondRole.roleKey),
          ),
        viewHref: getViewHref(organisation.slug),
        billingMode: "manual" as const,
        supportStatus: "placeholder" as const,
      };
    });

    const activeModuleCount = moduleRows.filter(
      (module) => module.status === "active" && module.archived_at === null,
    ).length;
    const activeFeatureFlags = featureFlagRows.filter(
      (featureFlag) =>
        featureFlag.status === "active" && featureFlag.archived_at === null,
    );

    return {
      totalTenantCount: tenantRows.length,
      activeTenantCount: tenantRows.filter((tenant) => tenant.status === "active")
        .length,
      onboardingTenantCount: 0,
      pilotTenantCount: tenantRows.filter(
        (tenant) => tenant.slug === "cleaneats" && tenant.status === "active",
      ).length,
      tenantRows,
      platformSummary: {
        totalModules: moduleRows.length,
        activeModules: activeModuleCount,
        featureFlagCount: activeFeatureFlags.length,
        enabledFeatureOverrideCount: tenantRows.reduce(
          (total, tenant) => total + tenant.enabledFeatureOverrideCount,
          0,
        ),
        supportTicketCount: null,
        billingStatus: "manual_not_configured",
      },
    };
  },
);
