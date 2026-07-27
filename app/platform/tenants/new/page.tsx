import type { ReactNode } from "react";

import {
  defaultOrganisationBranding,
  defaultOrganisationSettings,
  featureFlagPackTemplates,
  getDefaultProvisioningConfig,
  onboardingChecklistTemplate,
  tenantProvisioningTemplates,
} from "@/lib/platform-provisioning-templates";

type PreviewFieldProps = {
  label: string;
  value: string;
  helper?: string;
};

function PlatformBadge({
  children,
  tone = "slate",
}: {
  children: string;
  tone?: "slate" | "green" | "amber" | "blue";
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function PreviewField({ label, value, helper }: PreviewFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <input
        value={value}
        readOnly
        disabled
        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
      />
      {helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

function WizardStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Step {number}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
        </div>
        <PlatformBadge tone="amber">Scaffold / no writes</PlatformBadge>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function PlatformNewTenantPage() {
  const selectedPreview = getDefaultProvisioningConfig("foundation_pilot");
  const selectedModulePack = selectedPreview?.modulePack;
  const selectedFeaturePack = selectedPreview?.featureFlagPack;
  const checklistCategories = Array.from(
    new Set(onboardingChecklistTemplate.items.map((item) => item.category)),
  );
  const requiredChecklistCount = onboardingChecklistTemplate.items.filter(
    (item) => item.required,
  ).length;
  const activeFeatureCount =
    selectedFeaturePack?.features.filter((feature) => feature.status === "active").length ?? 0;
  const plannedFeatureCount =
    selectedFeaturePack?.features.filter((feature) => feature.status === "planned").length ?? 0;

  return (
    <div className="space-y-6 bg-slate-100/80 px-5 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <PlatformBadge tone="green">Wizard scaffold</PlatformBadge>
            <PlatformBadge tone="amber">Create disabled</PlatformBadge>
            <PlatformBadge>No Supabase writes</PlatformBadge>
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Platform Admin / new tenant
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            New Tenant Wizard
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Preview the future EveryBatch tenant provisioning flow. The scaffold
            shows planned fields, default templates and review sections only.
            It does not create organisations, invite users, configure domains or
            write to Supabase.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Selected template</p>
          <p className="mt-3 text-xl font-bold text-slate-950">
            {tenantProvisioningTemplates[0]?.label}
          </p>
          <p className="mt-2 text-sm text-slate-600">Foundation preview only.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Modules preview</p>
          <p className="mt-3 text-xl font-bold text-slate-950">
            {selectedModulePack?.moduleKeys.length ?? 0}
          </p>
          <p className="mt-2 text-sm text-slate-600">Platform is excluded.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Feature flags</p>
          <p className="mt-3 text-xl font-bold text-slate-950">
            {activeFeatureCount} active / {plannedFeatureCount} planned
          </p>
          <p className="mt-2 text-sm text-slate-600">Permissions still apply.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Checklist</p>
          <p className="mt-3 text-xl font-bold text-slate-950">
            {onboardingChecklistTemplate.items.length} items
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {requiredChecklistCount} required.
          </p>
        </article>
      </section>

      <WizardStep number={1} title="Tenant Identity">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PreviewField label="Organisation name" value="Example Foods Australia" />
          <PreviewField label="Workspace name" value="Example Foods Hub" />
          <PreviewField label="Tenant slug" value="examplefoods" />
          <PreviewField label="Vertical / industry" value="Food Manufacturing" />
          <PreviewField label="Timezone" value={defaultOrganisationSettings.timezone} />
          <PreviewField label="Currency" value={defaultOrganisationSettings.currency} />
          <PreviewField label="Default units" value={defaultOrganisationSettings.defaultUnits} />
          <PreviewField label="Primary contact name" value="Future tenant contact" />
          <PreviewField label="Primary contact email" value="contact@example.com" />
          <PreviewField label="Tenant status" value="onboarding / future" />
        </div>
      </WizardStep>

      <WizardStep number={2} title="Template / Module Pack">
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {tenantProvisioningTemplates.map((template) => (
              <article
                key={template.key}
                className={`rounded-lg border p-4 ${
                  template.key === "foundation_pilot"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      {template.label}
                    </h3>
                    <p className="mt-1 break-words text-xs font-mono text-slate-500">
                      {template.key}
                    </p>
                  </div>
                  {template.key === "foundation_pilot" ? (
                    <PlatformBadge tone="green">Selected preview</PlatformBadge>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {template.description}
                </p>
              </article>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-950">
              {selectedModulePack?.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedModulePack?.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedModulePack?.defaultWorkspaceAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                >
                  {area}
                </span>
              ))}
              {selectedModulePack?.moduleKeys.map((moduleKey) => (
                <span
                  key={moduleKey}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  {moduleKey}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Platform is never included as a tenant module.
            </p>
          </div>
        </div>
      </WizardStep>

      <WizardStep number={3} title="Feature Flags">
        <div className="grid gap-4 xl:grid-cols-2">
          {featureFlagPackTemplates.map((pack) => (
            <article
              key={pack.key}
              className={`rounded-lg border p-4 ${
                pack.key === selectedFeaturePack?.key
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    {pack.label}
                  </h3>
                  <p className="mt-1 break-words text-xs font-mono text-slate-500">
                    {pack.key}
                  </p>
                </div>
                {pack.key === selectedFeaturePack?.key ? (
                  <PlatformBadge tone="green">Selected preview</PlatformBadge>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {pack.description}
              </p>
              <div className="mt-4 space-y-2">
                {pack.features.slice(0, 4).map((feature) => (
                  <div
                    key={feature.featureKey}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2"
                  >
                    <p className="break-words text-xs font-mono font-semibold text-slate-700">
                      {feature.featureKey}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {feature.status} /{" "}
                      {feature.enabledByDefault ? "enabled" : "disabled"} by
                      default
                    </p>
                  </div>
                ))}
                {pack.features.length > 4 ? (
                  <p className="text-xs font-semibold text-slate-500">
                    + {pack.features.length - 4} more
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Feature flags control rollout readiness. They do not replace modules,
          permissions, memberships or RLS.
        </p>
      </WizardStep>

      <WizardStep number={4} title="Settings / Branding">
        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold text-slate-950">
              Default tenant settings
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(defaultOrganisationSettings).map(([key, value]) => (
                <PreviewField key={key} label={key} value={String(value)} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950">
              Branding placeholder
            </h3>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-xs font-black text-slate-500">
                  Logo
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {defaultOrganisationBranding.displayNamePlaceholder}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Logo upload is a future action.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <PreviewField
                  label="Primary colour"
                  value={defaultOrganisationBranding.primaryColour}
                />
                <PreviewField
                  label="Accent colour"
                  value={defaultOrganisationBranding.accentColour}
                />
                <PreviewField
                  label="Theme"
                  value={defaultOrganisationSettings.themeMode}
                />
                <PreviewField
                  label="Logo state"
                  value={defaultOrganisationBranding.logoState}
                />
              </div>
            </div>
          </div>
        </div>
      </WizardStep>

      <WizardStep number={5} title="First Admin">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PreviewField label="Admin full name" value="Future tenant admin" />
          <PreviewField label="Admin email" value="admin@example.com" />
          <PreviewField label="Role" value="tenant_admin" />
          <PreviewField label="Invitation method" value="Future invite / manual foundation" />
        </div>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          No plaintext password creation. First admin setup must be auditable
          and validated before provisioning actions are introduced.
        </div>
      </WizardStep>

      <WizardStep number={6} title="Onboarding Checklist">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {checklistCategories.map((category) => {
            const items = onboardingChecklistTemplate.items.filter(
              (item) => item.category === category,
            );
            const requiredItems = items.filter((item) => item.required).length;

            return (
              <article
                key={category}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <h3 className="text-sm font-bold capitalize text-slate-950">
                  {category.replace("_", " / ")}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {items.length} items / {requiredItems} required
                </p>
                <div className="mt-3 space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <p key={item.key} className="text-xs font-semibold text-slate-600">
                      {item.required ? "Required" : "Optional"}: {item.label}
                    </p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </WizardStep>

      <WizardStep number={7} title="Review / Provision">
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-950">
              Foundation preview summary
            </h3>
            <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Template</dt>
                <dd className="mt-1 font-bold text-slate-950">
                  Foundation / Pilot
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Module pack</dt>
                <dd className="mt-1 font-bold text-slate-950">
                  {selectedModulePack?.label}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Modules</dt>
                <dd className="mt-1 font-bold text-slate-950">
                  {selectedModulePack?.moduleKeys.length ?? 0}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Feature flags</dt>
                <dd className="mt-1 font-bold text-slate-950">
                  {selectedFeaturePack?.features.length ?? 0}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Checklist items</dt>
                <dd className="mt-1 font-bold text-slate-950">
                  {onboardingChecklistTemplate.items.length}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">First admin</dt>
                <dd className="mt-1 font-bold text-slate-950">
                  Placeholder only
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-bold text-white">Provisioning disabled</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              No tenant records are created from this scaffold.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 w-full cursor-not-allowed rounded-lg bg-slate-700 px-4 py-3 text-sm font-black text-slate-300"
            >
              Provision tenant - coming soon
            </button>
          </div>
        </div>
      </WizardStep>
    </div>
  );
}
