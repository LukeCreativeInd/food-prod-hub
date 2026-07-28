import { cache } from "react";

import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import {
  PLATFORM_ADMIN_DOMAIN,
  PLATFORM_PRIMARY_DOMAIN,
} from "@/lib/platform-brand";
import { parseEveryBatchHost } from "@/lib/tenant-resolver";
import { resolveTenantFromSlug } from "@/lib/tenant-lookup";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceDestinationType =
  | "tenant"
  | "platform"
  | "no_access"
  | "selector";

export type WorkspaceDestination = {
  type: WorkspaceDestinationType;
  href: string;
  tenantSlug?: string;
  futureHref?: string;
};

export type WorkspaceOption = {
  organisationId: string;
  slug: string;
  displayName: string;
  workspaceName: string;
  roleKey: string;
  accessLevel: string | null;
  status: string;
  membershipStatus: string;
  logoUrl: string | null;
  themeMode: string | null;
};

export type WorkspaceOptionsResult = {
  userId: string | null;
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  workspaces: WorkspaceOption[];
  defaultDestination: WorkspaceDestination;
};

export type WorkspaceSelectionValidationResult =
  | {
      isValid: true;
      workspace: WorkspaceOption;
      destination: WorkspaceDestination;
    }
  | {
      isValid: false;
      reason:
        | "not_authenticated"
        | "missing_selection"
        | "workspace_not_found"
        | "no_access";
      destination: WorkspaceDestination;
    };

type MembershipWorkspaceRow = {
  organisation_id: string;
  role_key: string;
  access_level: string | null;
  status: string;
  archived_at: string | null;
  organisation:
    | {
        id: string;
        name: string;
        slug: string;
        status: string;
        archived_at: string | null;
      }
    | {
        id: string;
        name: string;
        slug: string;
        status: string;
        archived_at: string | null;
      }[]
    | null;
};

type BrandingRow = {
  organisation_id: string;
  logo_url: string | null;
  theme_mode: string | null;
};

function getOrganisation(row: MembershipWorkspaceRow) {
  return Array.isArray(row.organisation) ? row.organisation[0] : row.organisation;
}

function getWorkspaceName(name: string, slug: string) {
  if (slug === "cleaneats") {
    return "Clean Eats Hub";
  }

  return `${name} Hub`;
}

function getTenantDashboardDestination(slug: string): WorkspaceDestination {
  return {
    type: "tenant",
    href: "/dashboard",
    tenantSlug: slug,
    futureHref: `https://${slug}.${PLATFORM_PRIMARY_DOMAIN}/dashboard`,
  };
}

function normaliseDestinationPath(path: string | null | undefined) {
  if (!path) {
    return "/dashboard";
  }

  if (!path.startsWith("/")) {
    return `/${path}`;
  }

  return path;
}

export function getTenantSubdomainUrl(slug: string, path = "/dashboard") {
  return `https://${slug}.${PLATFORM_PRIMARY_DOMAIN}${normaliseDestinationPath(path)}`;
}

export function getPlatformAdminUrl(path = "/platform") {
  return `https://${PLATFORM_ADMIN_DOMAIN}${normaliseDestinationPath(path)}`;
}

export function getWorkspaceDestinationHref(
  destination: WorkspaceDestination,
  options?: {
    currentHost?: string | null;
    nextPath?: string | null;
  },
) {
  const currentMode = options?.currentHost
    ? parseEveryBatchHost(options.currentHost).mode
    : "unknown";
  const isLocalLike = currentMode === "local_dev";

  if (destination.type === "platform") {
    return isLocalLike ? destination.href : getPlatformAdminUrl(destination.href);
  }

  if (destination.type === "tenant" && destination.tenantSlug) {
    const path = normaliseDestinationPath(options?.nextPath ?? destination.href);

    return isLocalLike
      ? path
      : getTenantSubdomainUrl(destination.tenantSlug, path);
  }

  return destination.href;
}

async function resolveTenantFromOrganisationId(organisationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisations")
    .select("id, slug, name, status")
    .eq("id", organisationId)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as {
    id: string;
    slug: string;
    name: string;
    status: string;
  };
}

export function getDefaultPostLoginDestination(
  workspaceOptions: Pick<
    WorkspaceOptionsResult,
    "isAuthenticated" | "isPlatformAdmin" | "workspaces"
  >,
): WorkspaceDestination {
  if (!workspaceOptions.isAuthenticated) {
    return {
      type: "no_access",
      href: "/login",
    };
  }

  if (
    workspaceOptions.isPlatformAdmin &&
    workspaceOptions.workspaces.length === 0
  ) {
    return {
      type: "platform",
      href: "/platform",
      futureHref: getPlatformAdminUrl("/platform"),
    };
  }

  if (
    workspaceOptions.isPlatformAdmin ||
    workspaceOptions.workspaces.length > 1
  ) {
    return {
      type: "selector",
      href: "/select-workspace",
    };
  }

  if (workspaceOptions.workspaces.length === 1) {
    return getTenantDashboardDestination(workspaceOptions.workspaces[0].slug);
  }

  return {
    type: "no_access",
    href: "/no-access",
  };
}

export const getWorkspaceOptionsForProfile = cache(
  async function getWorkspaceOptionsForProfile(
    profileId: string,
  ): Promise<Omit<WorkspaceOptionsResult, "userId" | "isAuthenticated">> {
    const supabase = await createClient();
    const { data: membershipData, error: membershipError } = await supabase
      .from("organisation_memberships")
      .select(
        `
        organisation_id,
        role_key,
        access_level,
        status,
        archived_at,
        organisation:organisations!inner (
          id,
          name,
          slug,
          status,
          archived_at
        )
      `,
      )
      .eq("profile_id", profileId)
      .eq("status", "active")
      .is("archived_at", null);

    if (membershipError) {
      const emptyResult = {
        isPlatformAdmin: false,
        workspaces: [],
      };

      return {
        ...emptyResult,
        defaultDestination: getDefaultPostLoginDestination({
          isAuthenticated: true,
          ...emptyResult,
        }),
      };
    }

    const membershipRows =
      (membershipData as unknown as MembershipWorkspaceRow[] | null) ?? [];
    const activeRows = membershipRows.filter((row) => {
      const organisation = getOrganisation(row);

      return (
        organisation?.status === "active" &&
        organisation.archived_at === null &&
        row.archived_at === null
      );
    });
    const organisationIds = activeRows
      .map((row) => getOrganisation(row)?.id)
      .filter((organisationId): organisationId is string =>
        Boolean(organisationId),
      );
    const { data: brandingData } =
      organisationIds.length > 0
        ? await supabase
            .from("organisation_branding")
            .select("organisation_id, logo_url, theme_mode")
            .in("organisation_id", organisationIds)
        : { data: [] };
    const brandingByOrganisationId = new Map(
      ((brandingData as BrandingRow[] | null) ?? []).map((branding) => [
        branding.organisation_id,
        branding,
      ]),
    );
    const workspaces = activeRows.flatMap((row) => {
      const organisation = getOrganisation(row);

      if (!organisation) {
        return [];
      }

      const branding = brandingByOrganisationId.get(organisation.id);

      return [
        {
          organisationId: organisation.id,
          slug: organisation.slug,
          displayName: organisation.name,
          workspaceName: getWorkspaceName(organisation.name, organisation.slug),
          roleKey: row.role_key,
          accessLevel: row.access_level,
          status: organisation.status,
          membershipStatus: row.status,
          logoUrl: branding?.logo_url ?? null,
          themeMode: branding?.theme_mode ?? null,
        },
      ];
    });
    const isPlatformAdmin = membershipRows.some(
      (row) =>
        row.role_key === "platform_admin" &&
        row.status === "active" &&
        row.archived_at === null,
    );
    const defaultDestination = getDefaultPostLoginDestination({
      isAuthenticated: true,
      isPlatformAdmin,
      workspaces,
    });

    return {
      isPlatformAdmin,
      workspaces,
      defaultDestination,
    };
  },
);

export const getCurrentUserWorkspaceOptions = cache(
  async function getCurrentUserWorkspaceOptions(): Promise<WorkspaceOptionsResult> {
    const user = await getCurrentUser();

    if (!user) {
      const signedOutResult = {
        userId: null,
        isAuthenticated: false,
        isPlatformAdmin: false,
        workspaces: [],
      };

      return {
        ...signedOutResult,
        defaultDestination: getDefaultPostLoginDestination(signedOutResult),
      };
    }

    const profile = await getCurrentProfile();

    if (!profile) {
      const noProfileResult = {
        userId: user.id,
        isAuthenticated: true,
        isPlatformAdmin: false,
        workspaces: [],
      };

      return {
        ...noProfileResult,
        defaultDestination: getDefaultPostLoginDestination(noProfileResult),
      };
    }

    const workspaceOptions = await getWorkspaceOptionsForProfile(profile.id);

    return {
      userId: user.id,
      isAuthenticated: true,
      ...workspaceOptions,
    };
  },
);

export const validateWorkspaceSelection = cache(
  async function validateWorkspaceSelection(
    selection:
      | string
      | {
          slug?: string | null;
          organisationId?: string | null;
        },
  ): Promise<WorkspaceSelectionValidationResult> {
    const workspaceOptions = await getCurrentUserWorkspaceOptions();

    if (!workspaceOptions.isAuthenticated) {
      return {
        isValid: false,
        reason: "not_authenticated",
        destination: workspaceOptions.defaultDestination,
      };
    }

    const requestedSlug =
      typeof selection === "string" ? selection : selection.slug;
    const requestedOrganisationId =
      typeof selection === "string" ? null : selection.organisationId;

    if (!requestedSlug && !requestedOrganisationId) {
      return {
        isValid: false,
        reason: "missing_selection",
        destination: {
          type: "selector",
          href: "/select-workspace",
        },
      };
    }

    const matchingWorkspace = workspaceOptions.workspaces.find(
      (workspace) =>
        workspace.slug === requestedSlug ||
        workspace.organisationId === requestedOrganisationId,
    );

    if (matchingWorkspace) {
      return {
        isValid: true,
        workspace: matchingWorkspace,
        destination: getTenantDashboardDestination(matchingWorkspace.slug),
      };
    }

    if (
      workspaceOptions.isPlatformAdmin &&
      (requestedSlug || requestedOrganisationId)
    ) {
      const tenant = requestedSlug
        ? await resolveTenantFromSlug(requestedSlug)
        : await resolveTenantFromOrganisationId(requestedOrganisationId ?? "");

      if (!tenant) {
        return {
          isValid: false,
          reason: "workspace_not_found",
          destination: {
            type: "selector",
            href: "/select-workspace",
          },
        };
      }

      const platformWorkspace: WorkspaceOption = {
        organisationId: tenant.id,
        slug: tenant.slug,
        displayName: tenant.name,
        workspaceName: getWorkspaceName(tenant.name, tenant.slug),
        roleKey: "platform_admin",
        accessLevel: "platform",
        status: tenant.status,
        membershipStatus: "platform_admin",
        logoUrl: null,
        themeMode: null,
      };

      return {
        isValid: true,
        workspace: platformWorkspace,
        destination: getTenantDashboardDestination(tenant.slug),
      };
    }

    return {
      isValid: false,
      reason: "no_access",
      destination: {
        type: "selector",
        href: "/select-workspace",
      },
    };
  },
);
