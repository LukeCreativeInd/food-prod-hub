import { BrandingForm, type BrandingFormValues } from "@/app/organisation-settings/branding-form";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  EmptyState,
  ModuleCard,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import {
  requirePermissionAccessWithPermissions,
} from "@/lib/auth";
import { availableModules } from "@/lib/module-registry";
import { getOrganisationLogoDisplayUrl } from "@/lib/organisation-branding-storage";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{
    branding?: string;
  }>;
};

type SettingsRow = {
  timezone: string;
  currency: string;
  default_units: string;
};

type BrandingRow = {
  logo_url: string | null;
  primary_colour: string | null;
  accent_colour: string | null;
  success_colour: string | null;
  warning_colour: string | null;
  danger_colour: string | null;
  info_colour: string | null;
  sidebar_style: string | null;
  theme_mode: string | null;
};

const fallbackBranding: BrandingFormValues = {
  logoUrl: "",
  logoPreviewUrl: "",
  primaryColour: "#176B3A",
  accentColour: "#A7D129",
  successColour: "#15803D",
  warningColour: "#B7791F",
  dangerColour: "#B91C1C",
  infoColour: "#0369A1",
  themeMode: "light",
};

function titleCase(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanHex(value: string | null | undefined, fallback: string) {
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toUpperCase() : fallback;
}

function cleanThemeMode(value: string | null | undefined): "light" | "dark" {
  return value === "dark" ? "dark" : "light";
}

function brandingMessage(status?: string) {
  if (status === "updated") {
    return {
      tone: "success" as const,
      text: "Organisation branding has been updated.",
    };
  }

  if (status === "invalid_logo") {
    return {
      tone: "warning" as const,
      text: "Logo must be uploaded as a supported image file.",
    };
  }

  if (status === "invalid_logo_file") {
    return {
      tone: "warning" as const,
      text: "Logo file must be PNG, JPG/JPEG or WebP.",
    };
  }

  if (status === "logo_too_large") {
    return {
      tone: "warning" as const,
      text: "Logo file is too large. Use an image up to 5MB.",
    };
  }

  if (status === "logo_upload_error") {
    return {
      tone: "danger" as const,
      text: "Logo could not be uploaded. Check the private branding storage bucket and policies.",
    };
  }

  if (status === "invalid_theme") {
    return {
      tone: "warning" as const,
      text: "Theme colours must be valid hex colours and theme mode must be light or dark.",
    };
  }

  if (status === "error") {
    return {
      tone: "danger" as const,
      text: "Organisation branding could not be saved. Check permissions and try again.",
    };
  }

  return null;
}

function DetailGrid({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <dt className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function OrganisationSettingsPage({
  searchParams,
}: PageProps) {
  const [{ authContext, permissionKeys }, query] = await Promise.all([
    requirePermissionAccessWithPermissions("admin.organisation.view"),
    searchParams,
  ]);

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const canManageBranding =
    permissionKeys.includes("admin.organisation.manage") ||
    authContext.membership?.role_key === "platform_admin";
  const supabase = await createClient();
  const organisationId = authContext.organisation.id;
  const [{ data: settingsData }, { data: brandingData }] = await Promise.all([
    supabase
      .from("organisation_settings")
      .select("timezone, currency, default_units")
      .eq("organisation_id", organisationId)
      .maybeSingle(),
    supabase
      .from("organisation_branding")
      .select(
        "logo_url, primary_colour, accent_colour, success_colour, warning_colour, danger_colour, info_colour, sidebar_style, theme_mode",
      )
      .eq("organisation_id", organisationId)
      .maybeSingle(),
  ]);
  const settings = settingsData as SettingsRow | null;
  const branding = brandingData as BrandingRow | null;
  const message = brandingMessage(query.branding);
  const logoPreviewUrl = await getOrganisationLogoDisplayUrl(
    supabase,
    branding?.logo_url,
  );
  const brandingValues: BrandingFormValues = {
    logoUrl: branding?.logo_url ?? "",
    logoPreviewUrl,
    primaryColour: cleanHex(
      branding?.primary_colour,
      fallbackBranding.primaryColour,
    ),
    accentColour: cleanHex(branding?.accent_colour, fallbackBranding.accentColour),
    successColour: cleanHex(
      branding?.success_colour,
      fallbackBranding.successColour,
    ),
    warningColour: cleanHex(
      branding?.warning_colour,
      fallbackBranding.warningColour,
    ),
    dangerColour: cleanHex(branding?.danger_colour, fallbackBranding.dangerColour),
    infoColour: cleanHex(branding?.info_colour, fallbackBranding.infoColour),
    themeMode: cleanThemeMode(branding?.theme_mode),
  };

  const profileFields = [
    ["Organisation name", authContext.organisation.name],
    ["Tenant slug", authContext.organisation.slug],
    ["Industry", "Food Manufacturing"],
    ["Timezone", settings?.timezone ?? "Australia/Melbourne"],
    ["Currency", settings?.currency ?? "AUD"],
    ["Default units", titleCase(settings?.default_units ?? "metric")],
  ];

  const brandingFields = [
    ["Logo", brandingValues.logoUrl ? "Uploaded" : "No logo uploaded"],
    ["Primary colour", brandingValues.primaryColour],
    ["Accent colour", brandingValues.accentColour],
    ["Success colour", brandingValues.successColour],
    ["Warning colour", brandingValues.warningColour],
    ["Danger colour", brandingValues.dangerColour],
    ["Info colour", brandingValues.infoColour],
    ["Sidebar style", titleCase(branding?.sidebar_style ?? "clean-operations")],
    ["Theme mode", titleCase(brandingValues.themeMode)],
  ];

  return (
    <AppShell>
      <PageHeader
        title="Organisation Settings"
        description="Tenant profile, branding, theme colours and future organisation administration controls."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>{titleCase(query.branding)}</StatusBadge>
          </div>
        ) : null}

        <SectionCard
          title="Organisation Profile"
          description="Current tenant profile and operational defaults for the active organisation."
          action={<StatusBadge tone="info">Tenant context</StatusBadge>}
        >
          <DetailGrid items={profileFields} />
        </SectionCard>

        <SectionCard
          title="Branding and Theme"
          description="Manage tenant logo upload, brand colours, status colours and light/dark mode foundation."
          action={
            <StatusBadge tone={canManageBranding ? "success" : "warning"}>
              {canManageBranding ? "Manage enabled" : "Read only"}
            </StatusBadge>
          }
        >
          <div className="mb-5">
            <DetailGrid items={brandingFields} />
          </div>
          <BrandingForm
            values={brandingValues}
            canManageBranding={canManageBranding}
          />
        </SectionCard>

        <SectionCard
          title="Enabled Modules"
          description="Future per-organisation module access, currently shown from the static module registry."
          action={<StatusBadge tone="success">Enabled for Clean Eats</StatusBadge>}
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {availableModules.map((module) => (
              <ModuleCard
                key={module.key}
                title={module.label}
                description={module.description}
                eyebrow={`${module.group} / ${module.phase}`}
                href="/modules"
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Platform Notes"
          description="Architecture preparation for tenant-aware settings."
        >
          <EmptyState
            title="Branding controls are tenant scoped"
            description="Logo uploads are stored in private tenant storage. Removing a logo clears the branding record so the sidebar falls back to the placeholder; physical object cleanup can be reviewed later."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
