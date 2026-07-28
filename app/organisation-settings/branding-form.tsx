"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useFormStatus } from "react-dom";

import { updateOrganisationBrandingAction } from "@/app/organisation-settings/actions";
import { StatusBadge } from "@/components/ui";

export type BrandingFormValues = {
  logoUrl: string;
  logoStoragePath: string;
  logoPreviewUrl: string;
  iconUrl: string;
  iconStoragePath: string;
  iconPreviewUrl: string;
  primaryColour: string;
  accentColour: string;
  successColour: string;
  warningColour: string;
  dangerColour: string;
  infoColour: string;
  themeMode: "light" | "dark";
};

type BrandingFormProps = {
  values: BrandingFormValues;
  canManageBranding: boolean;
};

const colourFields = [
  ["primaryColour", "Primary colour", "Main buttons, sidebar and focus accents"],
  ["accentColour", "Accent colour", "Secondary highlights and soft accents"],
  ["successColour", "Success / good", "Ready, active and positive statuses"],
  ["warningColour", "Warning / medium", "Review and setup-gap statuses"],
  ["dangerColour", "Danger / critical", "Failed, rejected and critical statuses"],
  ["infoColour", "Info", "Informational badges and neutral guidance"],
] satisfies Array<[keyof BrandingFormValues, string, string]>;

const fieldNames: Record<keyof BrandingFormValues, string> = {
  logoUrl: "logo_url",
  logoStoragePath: "logo_storage_path",
  logoPreviewUrl: "logo_preview_url",
  iconUrl: "icon_url",
  iconStoragePath: "icon_storage_path",
  iconPreviewUrl: "icon_preview_url",
  primaryColour: "primary_colour",
  accentColour: "accent_colour",
  successColour: "success_colour",
  warningColour: "warning_colour",
  dangerColour: "danger_colour",
  infoColour: "info_colour",
  themeMode: "theme_mode",
};

const defaultBrandingValues = {
  primaryColour: "#176B3A",
  accentColour: "#A7D129",
  successColour: "#15803D",
  warningColour: "#B7791F",
  dangerColour: "#B91C1C",
  infoColour: "#0369A1",
  themeMode: "light" as const,
};

function SubmitButton({ canManageBranding }: { canManageBranding: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!canManageBranding || pending}
      className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {pending ? "Saving..." : "Save branding"}
    </button>
  );
}

export function BrandingForm({
  values,
  canManageBranding,
}: BrandingFormProps) {
  const [preview, setPreview] = useState(values);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(null);
  const [selectedIconUrl, setSelectedIconUrl] = useState<string | null>(null);
  const hasSavedLogo = Boolean(values.logoStoragePath || values.logoUrl);
  const hasSavedIcon = Boolean(values.iconStoragePath || values.iconUrl);
  const logoPreviewUrl = selectedLogoUrl ?? values.logoPreviewUrl;
  const iconPreviewUrl = selectedIconUrl ?? values.iconPreviewUrl;

  useEffect(() => {
    return () => {
      if (selectedLogoUrl) {
        URL.revokeObjectURL(selectedLogoUrl);
      }

      if (selectedIconUrl) {
        URL.revokeObjectURL(selectedIconUrl);
      }
    };
  }, [selectedIconUrl, selectedLogoUrl]);

  const previewStyle = useMemo(
    () =>
      ({
        "--preview-primary": preview.primaryColour,
        "--preview-accent": preview.accentColour,
        "--preview-success": preview.successColour,
        "--preview-warning": preview.warningColour,
        "--preview-danger": preview.dangerColour,
        "--preview-info": preview.infoColour,
      }) as CSSProperties,
    [preview],
  );

  function updateField(
    field: keyof BrandingFormValues,
    value: BrandingFormValues[keyof BrandingFormValues],
  ) {
    setPreview((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function preventReadOnlySubmit(event: FormEvent<HTMLFormElement>) {
    if (!canManageBranding) {
      event.preventDefault();
    }
  }

  function handleLogoSelection(fileList: FileList | null) {
    const file = fileList?.item(0);

    if (selectedLogoUrl) {
      URL.revokeObjectURL(selectedLogoUrl);
    }

    setSelectedLogoUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleIconSelection(fileList: FileList | null) {
    const file = fileList?.item(0);

    if (selectedIconUrl) {
      URL.revokeObjectURL(selectedIconUrl);
    }

    setSelectedIconUrl(file ? URL.createObjectURL(file) : null);
  }

  function resetThemeDefaults() {
    setPreview((current) => ({
      ...current,
      ...defaultBrandingValues,
    }));
  }

  return (
    <form
      action={updateOrganisationBrandingAction}
      onSubmit={preventReadOnlySubmit}
      className="space-y-6"
    >
      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Expanded sidebar logo
            </p>
            <div
              className="mt-3 flex h-32 items-center justify-center rounded-lg border border-slate-200 bg-white p-4"
              style={{
                borderColor: preview.primaryColour,
              }}
            >
              {logoPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreviewUrl}
                  alt="Tenant full logo preview"
                  className="max-h-24 max-w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: preview.primaryColour }}
                  >
                    Logo
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    Client Logo
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Placeholder</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Collapsed sidebar icon
            </p>
            <div
              className="mt-3 flex h-28 items-center justify-center rounded-lg border border-slate-200 bg-white p-4"
              style={{
                borderColor: preview.primaryColour,
              }}
            >
              {iconPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconPreviewUrl}
                  alt="Tenant icon preview"
                  className="max-h-16 max-w-16 object-contain"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-xs font-black text-white"
                  style={{ backgroundColor: preview.primaryColour }}
                >
                  Icon
                </div>
              )}
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            PNG, JPG/JPEG or WebP up to 5MB. Transparent backgrounds are
            recommended. Full logos are for expanded surfaces; square icons are
            for collapsed and compact surfaces.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Upload full logo
            </span>
            <input
              name="logo_file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={!canManageBranding}
              onChange={(event) => handleLogoSelection(event.target.files)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-[var(--tenant-primary-soft)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--tenant-primary)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
            />
            <span className="mt-2 block break-all text-xs leading-5 text-slate-500">
              {values.logoStoragePath || values.logoUrl
                ? `Saved logo path: ${values.logoStoragePath || values.logoUrl}`
                : "No saved logo yet. The sidebar will use the placeholder until one is uploaded."}
            </span>
          </label>

          <label className="block rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Upload icon
            </span>
            <input
              name="icon_file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={!canManageBranding}
              onChange={(event) => handleIconSelection(event.target.files)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-[var(--tenant-primary-soft)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--tenant-primary)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
            />
            <span className="mt-2 block break-all text-xs leading-5 text-slate-500">
              {values.iconStoragePath || values.iconUrl
                ? `Saved icon path: ${values.iconStoragePath || values.iconUrl}`
                : "No saved icon yet. Collapsed navigation will use initials until one is uploaded."}
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            {colourFields.map(([field, label, description]) => (
              <label
                key={field}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {label}
                </span>
                <span className="mt-2 flex items-center gap-3">
                  <input
                    name={fieldNames[field]}
                    type="color"
                    value={String(preview[field])}
                    disabled={!canManageBranding}
                    onChange={(event) =>
                      updateField(field, event.target.value.toUpperCase())
                    }
                    className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1 disabled:cursor-not-allowed"
                  />
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {String(preview[field])}
                  </span>
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  {description}
                </span>
              </label>
            ))}
          </div>

          <label className="block rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Theme mode
            </span>
            <select
              name={fieldNames.themeMode}
              value={preview.themeMode}
              disabled={!canManageBranding}
              onChange={(event) =>
                updateField(
                  "themeMode",
                  event.target.value === "dark" ? "dark" : "light",
                )
              }
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </div>

      <div
        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        style={previewStyle}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Live theme preview
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              This preview uses the selected colours before they are saved.
            </p>
          </div>
          <button
            type="button"
            disabled={!canManageBranding}
            onClick={resetThemeDefaults}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Reset theme defaults
          </button>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[220px_1fr]">
          <div className="flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
            {logoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreviewUrl}
                alt="Logo preview"
                className="max-h-16 max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-xs font-semibold text-slate-500">
                Client Logo
              </div>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Sample card</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Buttons, badges and cards will inherit these tenant tokens.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["Success", "var(--preview-success)"],
                ["Warning", "var(--preview-warning)"],
                ["Danger", "var(--preview-danger)"],
                ["Info", "var(--preview-info)"],
              ].map(([label, colour]) => (
                <span
                  key={label}
                  className="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold text-white"
                  style={{
                    backgroundColor: colour,
                    borderColor: colour,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span
                className="inline-flex rounded-md px-3.5 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--preview-primary)" }}
              >
                Primary action
              </span>
              <span
                className="inline-flex rounded-md border px-3.5 py-2 text-sm font-semibold"
                style={{
                  borderColor: "var(--preview-primary)",
                  color: "var(--preview-primary)",
                  backgroundColor: "var(--preview-accent)",
                }}
              >
                Accent action
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge tone={canManageBranding ? "success" : "warning"}>
          {canManageBranding ? "Editing enabled" : "Read only"}
        </StatusBadge>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="clear_logo"
            value="1"
            disabled={!canManageBranding || !hasSavedLogo}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Remove logo
          </button>
          <button
            type="submit"
            name="clear_icon"
            value="1"
            disabled={!canManageBranding || !hasSavedIcon}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Remove icon
          </button>
          <SubmitButton canManageBranding={canManageBranding} />
        </div>
      </div>
    </form>
  );
}
