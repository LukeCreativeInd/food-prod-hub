"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import {
  brandAssetMaxFileBytes,
  buildTenantIconStoragePath,
  buildTenantLogoStoragePath,
  isAcceptedBrandAssetMimeType,
} from "@/lib/brand-assets";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { organisationBrandingBucket } from "@/lib/organisation-branding-storage";
import { createClient } from "@/lib/supabase/server";

const hexColourPattern = /^#[0-9A-Fa-f]{6}$/;
const themeModes = new Set(["light", "dark"]);
function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getHexColour(formData: FormData, key: string) {
  const value = getString(formData, key);
  return hexColourPattern.test(value) ? value.toUpperCase() : null;
}

function getAssetFile(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
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
  const logoFile = getAssetFile(formData, "logo_file");
  const iconFile = getAssetFile(formData, "icon_file");
  const shouldClearLogo = getString(formData, "clear_logo") === "1";
  const shouldClearIcon = getString(formData, "clear_icon") === "1";

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
    .select("*")
    .eq("organisation_id", organisationId)
    .maybeSingle();
  const currentBrandingRow =
    currentBranding as {
      logo_url: string | null;
      logo_storage_path: string | null;
      icon_url: string | null;
      icon_storage_path: string | null;
    } | null;
  let logoUrl = currentBrandingRow?.logo_url ?? null;
  let logoStoragePath = currentBrandingRow?.logo_storage_path ?? null;
  let iconUrl = currentBrandingRow?.icon_url ?? null;
  let iconStoragePath = currentBrandingRow?.icon_storage_path ?? null;

  if (shouldClearLogo) {
    logoUrl = null;
    logoStoragePath = null;
  } else if (logoFile) {
    if (!isAcceptedBrandAssetMimeType(logoFile.type)) {
      redirect("/organisation-settings?branding=invalid_logo_file");
    }

    if (logoFile.size > brandAssetMaxFileBytes) {
      redirect("/organisation-settings?branding=logo_too_large");
    }

    const storagePath = buildTenantLogoStoragePath(
      organisationId,
      logoFile.name,
      logoFile.type,
    );
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
    logoStoragePath = storagePath;
  }

  if (shouldClearIcon) {
    iconUrl = null;
    iconStoragePath = null;
  } else if (iconFile) {
    if (!isAcceptedBrandAssetMimeType(iconFile.type)) {
      redirect("/organisation-settings?branding=invalid_icon_file");
    }

    if (iconFile.size > brandAssetMaxFileBytes) {
      redirect("/organisation-settings?branding=icon_too_large");
    }

    const storagePath = buildTenantIconStoragePath(
      organisationId,
      iconFile.name,
      iconFile.type,
    );
    const { error: uploadError } = await supabase.storage
      .from(organisationBrandingBucket)
      .upload(storagePath, iconFile, {
        cacheControl: "3600",
        contentType: iconFile.type,
        upsert: false,
      });

    logDevRouteTiming("organisation.branding-icon-upload", timingStartedAt, {
      status: uploadError ? "error" : "uploaded",
      iconBytes: iconFile.size,
      iconMimeType: iconFile.type,
      storagePath,
    });

    if (uploadError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Organisation branding icon upload failed", {
          organisationId,
          storagePath,
          code: uploadError.name,
          message: uploadError.message,
        });
      }

      redirect("/organisation-settings?branding=icon_upload_error");
    }

    iconUrl = storagePath;
    iconStoragePath = storagePath;
  }

  const { error } = await supabase.from("organisation_branding").upsert(
    {
      organisation_id: organisationId,
      logo_url: logoUrl,
      logo_storage_path: logoStoragePath,
      icon_url: iconUrl,
      icon_storage_path: iconStoragePath,
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
