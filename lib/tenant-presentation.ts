import { cache } from "react";

import { getAuthContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type BrandingRow = {
  logo_url: string | null;
  primary_colour: string | null;
  accent_colour: string | null;
  success_colour: string | null;
  warning_colour: string | null;
  danger_colour: string | null;
  info_colour: string | null;
  theme_mode: string | null;
};

export type TenantPresentation = {
  organisationName: string;
  tenantSlug: string;
  logoUrl: string | null;
  initials: string;
  primaryColour: string;
  accentColour: string;
  successColour: string;
  warningColour: string;
  dangerColour: string;
  infoColour: string;
  themeMode: "light" | "dark";
  userName: string;
  userDetail: string;
  userInitials: string;
};

const fallbackPresentation: TenantPresentation = {
  organisationName: "Clean Eats Australia",
  tenantSlug: "cleaneats",
  logoUrl: null,
  initials: "CE",
  primaryColour: "#176B3A",
  accentColour: "#A7D129",
  successColour: "#15803D",
  warningColour: "#B7791F",
  dangerColour: "#B91C1C",
  infoColour: "#0369A1",
  themeMode: "light",
  userName: "Signed in",
  userDetail: "Clean Eats Hub",
  userInitials: "CE",
};

function cleanHexColour(value: string | null | undefined, fallback: string) {
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function initialsFromName(value: string) {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return fallbackPresentation.initials;
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export const getTenantPresentation = cache(
  async function getTenantPresentation(): Promise<TenantPresentation> {
    const authContext = await getAuthContext();
    const organisation = authContext.organisation;

    if (!organisation) {
      return fallbackPresentation;
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from("organisation_branding")
      .select(
        "logo_url, primary_colour, accent_colour, success_colour, warning_colour, danger_colour, info_colour, theme_mode",
      )
      .eq("organisation_id", organisation.id)
      .maybeSingle();
    const branding = (data as BrandingRow | null) ?? null;
    const fullName = authContext.profile?.full_name?.trim();
    const email = authContext.profile?.email?.trim();
    const userName = fullName ?? email ?? fallbackPresentation.userName;

    return {
      organisationName: organisation.name,
      tenantSlug: organisation.slug,
      logoUrl: branding?.logo_url ?? null,
      initials: initialsFromName(organisation.name),
      primaryColour: cleanHexColour(
        branding?.primary_colour,
        fallbackPresentation.primaryColour,
      ),
      accentColour: cleanHexColour(
        branding?.accent_colour,
        fallbackPresentation.accentColour,
      ),
      successColour: cleanHexColour(
        branding?.success_colour,
        fallbackPresentation.successColour,
      ),
      warningColour: cleanHexColour(
        branding?.warning_colour,
        fallbackPresentation.warningColour,
      ),
      dangerColour: cleanHexColour(
        branding?.danger_colour,
        fallbackPresentation.dangerColour,
      ),
      infoColour: cleanHexColour(
        branding?.info_colour,
        fallbackPresentation.infoColour,
      ),
      themeMode: branding?.theme_mode === "dark" ? "dark" : "light",
      userName,
      userDetail: email && fullName ? email : `${organisation.name} Hub`,
      userInitials: initialsFromName(userName),
    };
  },
);
