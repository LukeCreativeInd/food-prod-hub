"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

const hexColourPattern = /^#[0-9A-Fa-f]{6}$/;
const themeModes = new Set(["light", "dark"]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalUrl(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}

function getHexColour(formData: FormData, key: string) {
  const value = getString(formData, key);
  return hexColourPattern.test(value) ? value.toUpperCase() : null;
}

export async function updateOrganisationBrandingAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("admin.organisation.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const logoUrlInput = getString(formData, "logo_url");
  const logoUrl = getOptionalUrl(formData, "logo_url");
  const primaryColour = getHexColour(formData, "primary_colour");
  const accentColour = getHexColour(formData, "accent_colour");
  const successColour = getHexColour(formData, "success_colour");
  const warningColour = getHexColour(formData, "warning_colour");
  const dangerColour = getHexColour(formData, "danger_colour");
  const infoColour = getHexColour(formData, "info_colour");
  const themeModeInput = getString(formData, "theme_mode");
  const themeMode = themeModes.has(themeModeInput) ? themeModeInput : null;

  if (logoUrlInput && !logoUrl) {
    redirect("/organisation-settings?branding=invalid_logo");
  }

  if (
    !primaryColour ||
    !accentColour ||
    !successColour ||
    !warningColour ||
    !dangerColour ||
    !infoColour ||
    !themeMode
  ) {
    redirect("/organisation-settings?branding=invalid_theme");
  }

  const organisationId = authContext.organisation.id;
  const supabase = await createClient();
  const { error } = await supabase.from("organisation_branding").upsert(
    {
      organisation_id: organisationId,
      logo_url: logoUrl,
      primary_colour: primaryColour,
      accent_colour: accentColour,
      success_colour: successColour,
      warning_colour: warningColour,
      danger_colour: dangerColour,
      info_colour: infoColour,
      theme_mode: themeMode,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "organisation_id",
    },
  );

  logDevRouteTiming("organisation.branding-update", timingStartedAt, {
    status: error ? "error" : "updated",
  });

  if (error) {
    redirect("/organisation-settings?branding=error");
  }

  revalidatePath("/", "layout");
  revalidatePath("/organisation-settings");
  redirect("/organisation-settings?branding=updated");
}
