"use client";

import { useState, type FormEvent } from "react";

import { updateOrganisationBrandingAction } from "@/app/organisation-settings/actions";
import { StatusBadge } from "@/components/ui";

export type BrandingFormValues = {
  logoUrl: string;
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
  primaryColour: "primary_colour",
  accentColour: "accent_colour",
  successColour: "success_colour",
  warningColour: "warning_colour",
  dangerColour: "danger_colour",
  infoColour: "info_colour",
  themeMode: "theme_mode",
};

function cleanLogoUrl(value: string) {
  return value.trim();
}

export function BrandingForm({
  values,
  canManageBranding,
}: BrandingFormProps) {
  const [preview, setPreview] = useState(values);

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

  return (
    <form
      action={updateOrganisationBrandingAction}
      onSubmit={preventReadOnlySubmit}
      className="space-y-6"
    >
      <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div
            className="flex h-32 items-center justify-center rounded-lg border border-slate-200 bg-white p-4"
            style={{
              borderColor: preview.primaryColour,
            }}
          >
            {cleanLogoUrl(preview.logoUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cleanLogoUrl(preview.logoUrl)}
                alt="Tenant logo preview"
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
          <p className="mt-3 text-xs leading-5 text-slate-500">
            URL preview only. Proper upload/storage management is deferred to a
            later reviewed task.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Logo URL
            </span>
            <input
              name={fieldNames.logoUrl}
              type="url"
              defaultValue={values.logoUrl}
              disabled={!canManageBranding}
              onChange={(event) => updateField("logoUrl", event.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
            />
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
                    defaultValue={String(values[field])}
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
              defaultValue={values.themeMode}
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

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-950">Theme preview</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge tone="success">Success</StatusBadge>
          <StatusBadge tone="warning">Warning</StatusBadge>
          <StatusBadge tone="danger">Danger</StatusBadge>
          <StatusBadge tone="info">Info</StatusBadge>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <span
            className="inline-flex rounded-md px-3.5 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: preview.primaryColour }}
          >
            Primary action
          </span>
          <span
            className="inline-flex rounded-md border px-3.5 py-2 text-sm font-semibold"
            style={{
              borderColor: preview.primaryColour,
              color: preview.primaryColour,
            }}
          >
            Secondary action
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge tone={canManageBranding ? "success" : "warning"}>
          {canManageBranding ? "Editing enabled" : "Read only"}
        </StatusBadge>
        <button
          type="submit"
          disabled={!canManageBranding}
          className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Save branding
        </button>
      </div>
    </form>
  );
}
