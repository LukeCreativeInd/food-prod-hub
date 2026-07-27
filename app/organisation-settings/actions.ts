"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { organisationBrandingBucket } from "@/lib/organisation-branding-storage";
import { createClient } from "@/lib/supabase/server";

const hexColourPattern = /^#[0-9A-Fa-f]{6}$/;
const themeModes = new Set(["light", "dark"]);
const maxLogoBytes = 5 * 1024 * 1024;
const allowedLogoMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getHexColour(formData: FormData, key: string) {
  const value = getString(formData, key);
  return hexColourPattern.test(value) ? value.toUpperCase() : null;
}

function getLogoFile(formData: FormData) {
  const value = formData.get("logo_file");

  return value instanceof File && value.size > 0 ? value : null;
}

function safeFilename(value: string) {
  const extension = value.split(".").pop()?.toLowerCase() ?? "logo";
  const baseName = value
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  const safeBaseName = baseName || "tenant-logo";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "").slice(0, 8) || "png";

  return `${safeBaseName}.${safeExtension}`;
}

export async function updateOrganisationBrandingAction(formData: FormData) {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("admin.organisation.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const primaryColour = getHexColour(formData, "primary_colour");
  const accentColour = getHexColour(formData, "accent_colour");
  const successColour = getHexColour(formData, "success_colour");
  const warningColour = getHexColour(formData, "warning_colour");
  const dangerColour = getHexColour(formData, "danger_colour");
  const infoColour = getHexColour(formData, "info_colour");
  const themeModeInput = getString(formData, "theme_mode");
  const themeMode = themeModes.has(themeModeInput) ? themeModeInput : null;
  const logoFile = getLogoFile(formData);
  const shouldClearLogo = getString(formData, "clear_logo") === "1";

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
  const { data: currentBranding } = await supabase
    .from("organisation_branding")
    .select("logo_url")
    .eq("organisation_id", organisationId)
    .maybeSingle();
  let logoUrl = (currentBranding as { logo_url: string | null } | null)
    ?.logo_url ?? null;

  if (shouldClearLogo) {
    logoUrl = null;
  } else if (logoFile) {
    if (!allowedLogoMimeTypes.has(logoFile.type)) {
      redirect("/organisation-settings?branding=invalid_logo_file");
    }

    if (logoFile.size > maxLogoBytes) {
      redirect("/organisation-settings?branding=logo_too_large");
    }

    const storagePath = `${organisationId}/logo/${Date.now()}-${safeFilename(
      logoFile.name,
    )}`;
    const { error: uploadError } = await supabase.storage
      .from(organisationBrandingBucket)
      .upload(storagePath, logoFile, {
        cacheControl: "3600",
        contentType: logoFile.type,
        upsert: false,
      });

    logDevRouteTiming("organisation.branding-logo-upload", timingStartedAt, {
      status: uploadError ? "error" : "uploaded",
      logoBytes: logoFile.size,
      logoMimeType: logoFile.type,
      storagePath,
    });

    if (uploadError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Organisation branding logo upload failed", {
          organisationId,
          storagePath,
          code: uploadError.name,
          message: uploadError.message,
        });
      }

      redirect("/organisation-settings?branding=logo_upload_error");
    }

    logoUrl = storagePath;
  }

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
