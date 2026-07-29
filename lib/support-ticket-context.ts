import { cache } from "react";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWorkspaceOptions } from "@/lib/workspace-options";

export type SupportTicketOrganisationOption = {
  id: string;
  name: string;
  slug: string;
  workspaceName: string;
  roleKey: string | null;
  isMember: boolean;
};

export type SupportTicketOrganisationContext = {
  profileId: string | null;
  profileName: string | null;
  isPlatformAdmin: boolean;
  organisations: SupportTicketOrganisationOption[];
  selectedOrganisation: SupportTicketOrganisationOption | null;
  selectionReason:
    | "selected"
    | "single_membership"
    | "multiple_options"
    | "no_membership"
    | "not_authenticated";
};

type OrganisationRow = {
  id: string;
  name: string;
  slug: string;
};

function getWorkspaceName(name: string, slug: string) {
  return slug === "cleaneats" ? "Clean Eats Hub" : `${name} Hub`;
}

function uniqueByOrganisationId(
  options: SupportTicketOrganisationOption[],
): SupportTicketOrganisationOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (seen.has(option.id)) {
      return false;
    }

    seen.add(option.id);
    return true;
  });
}

async function getPlatformOrganisationOptions(
  existingOptions: SupportTicketOrganisationOption[],
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug")
    .eq("status", "active")
    .is("archived_at", null)
    .order("name", { ascending: true });

  if (error || !data) {
    return existingOptions;
  }

  const existingById = new Map(
    existingOptions.map((option) => [option.id, option]),
  );
  const platformOptions = (data as OrganisationRow[]).map((organisation) => {
    const existing = existingById.get(organisation.id);

    return {
      id: organisation.id,
      name: organisation.name,
      slug: organisation.slug,
      workspaceName: getWorkspaceName(organisation.name, organisation.slug),
      roleKey: existing?.roleKey ?? null,
      isMember: Boolean(existing),
    };
  });

  return uniqueByOrganisationId([...existingOptions, ...platformOptions]);
}

export const getSupportTicketOrganisationContext = cache(
  async function getSupportTicketOrganisationContext(
    selectedOrganisationId?: string | null,
  ): Promise<SupportTicketOrganisationContext> {
    const [profile, workspaceOptions] = await Promise.all([
      getCurrentProfile(),
      getCurrentUserWorkspaceOptions(),
    ]);

    if (!workspaceOptions.isAuthenticated) {
      return {
        profileId: null,
        profileName: null,
        isPlatformAdmin: false,
        organisations: [],
        selectedOrganisation: null,
        selectionReason: "not_authenticated",
      };
    }

    const memberOptions: SupportTicketOrganisationOption[] =
      workspaceOptions.workspaces.map((workspace) => ({
        id: workspace.organisationId,
        name: workspace.displayName,
        slug: workspace.slug,
        workspaceName: workspace.workspaceName,
        roleKey: workspace.roleKey,
        isMember: true,
      }));
    const organisations = workspaceOptions.isPlatformAdmin
      ? await getPlatformOrganisationOptions(memberOptions)
      : memberOptions;
    const selectedOrganisation =
      organisations.find(
        (organisation) => organisation.id === selectedOrganisationId,
      ) ?? null;

    if (selectedOrganisation) {
      return {
        profileId: profile?.id ?? null,
        profileName: profile?.full_name ?? profile?.email ?? null,
        isPlatformAdmin: workspaceOptions.isPlatformAdmin,
        organisations,
        selectedOrganisation,
        selectionReason: "selected",
      };
    }

    if (organisations.length === 1) {
      return {
        profileId: profile?.id ?? null,
        profileName: profile?.full_name ?? profile?.email ?? null,
        isPlatformAdmin: workspaceOptions.isPlatformAdmin,
        organisations,
        selectedOrganisation: organisations[0],
        selectionReason: "single_membership",
      };
    }

    return {
      profileId: profile?.id ?? null,
      profileName: profile?.full_name ?? profile?.email ?? null,
      isPlatformAdmin: workspaceOptions.isPlatformAdmin,
      organisations,
      selectedOrganisation: null,
      selectionReason:
        organisations.length > 1 ? "multiple_options" : "no_membership",
    };
  },
);
