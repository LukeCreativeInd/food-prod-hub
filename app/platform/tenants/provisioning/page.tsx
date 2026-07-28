import {
  defaultOrganisationBranding,
  defaultOrganisationSettings,
  featureFlagPackTemplates,
  getDefaultProvisioningConfig,
  modulePackTemplates,
  onboardingChecklistTemplate,
  tenantProvisioningTemplates,
} from "@/lib/platform-provisioning-templates";

type BadgeTone = "slate" | "green" | "amber" | "blue";

function PlatformBadge({
  children,
  tone = "slate",
}: {
  children: string;
  tone?: BadgeTone;
}) {
  const tones = {
    slate: "border-slate-600 bg-slate-800 text-slate-700",
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

export default function PlatformTenantProvisioningPage() {
  const foundationPreview = getDefaultProvisioningConfig("foundation_pilot");
  const checklistCategories = Array.from(
    new Set(onboardingChecklistTemplate.items.map((item) => item.category)),
  );

  return (
    <div className="space-y-6 bg-[#F2F4F7] px-5 py-6 md:px-8 md:py-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <PlatformBadge tone="green">Read-only planning template v1</PlatformBadge>
            <PlatformBadge>No tenant writes</PlatformBadge>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Static reusable tenant templates for future Platform Admin
            provisioning. This page previews definitions only; it does not
            create tenants, write to Supabase or send invites.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Tenant templates</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {tenantProvisioningTemplates.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Static provisioning profiles.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Module packs</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {modulePackTemplates.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Platform is not included as a tenant module.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Feature packs</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {featureFlagPackTemplates.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Active and planned feature references.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Checklist items</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {onboardingChecklistTemplate.items.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Grouped onboarding tasks.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Tenant templates
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Each template points to a default module pack and feature flag
              pack for future provisioning.
            </p>
          </div>
          <PlatformBadge tone="blue">Static config</PlatformBadge>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {tenantProvisioningTemplates.map((template) => (
            <article
              key={template.key}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="text-sm font-bold text-slate-950">
                {template.label}
              </h3>
              <p className="mt-1 break-words text-sm font-mono text-slate-500">
                {template.key}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {template.description}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  Target: <span className="font-semibold">{template.target}</span>
                </p>
                <p>
                  Module pack:{" "}
                  <span className="font-semibold">
                    {template.defaultModulePackKey ?? "None"}
                  </span>
                </p>
                <p className="sm:col-span-2">
                  Feature pack:{" "}
                  <span className="font-semibold">
                    {template.defaultFeatureFlagPackKey ?? "None"}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">Module packs</h2>
          <div className="mt-5 space-y-4">
            {modulePackTemplates.map((pack) => (
              <article
                key={pack.key}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      {pack.label}
                    </h3>
                    <p className="mt-1 break-words text-sm font-mono text-slate-500">
                      {pack.key}
                    </p>
                  </div>
                  <PlatformBadge tone={pack.moduleKeys.length > 0 ? "green" : "amber"}>
                    {`${pack.moduleKeys.length} modules`}
                  </PlatformBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {pack.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pack.moduleKeys.map((moduleKey) => (
                    <span
                      key={moduleKey}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {moduleKey}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">Feature packs</h2>
          <div className="mt-5 space-y-4">
            {featureFlagPackTemplates.map((pack) => (
              <article
                key={pack.key}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      {pack.label}
                    </h3>
                    <p className="mt-1 break-words text-sm font-mono text-slate-500">
                      {pack.key}
                    </p>
                  </div>
                  <PlatformBadge tone={pack.features.length > 0 ? "green" : "amber"}>
                    {`${pack.features.length} flags`}
                  </PlatformBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {pack.description}
                </p>
                <div className="mt-4 space-y-2">
                  {pack.features.slice(0, 5).map((feature) => (
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
                  {pack.features.length > 5 ? (
                    <p className="text-xs font-semibold text-slate-500">
                      + {pack.features.length - 5} more
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Default settings and branding
          </h2>
          <div className="mt-5 space-y-3">
            {Object.entries(defaultOrganisationSettings).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-slate-500">{key}</span>
                <span className="font-bold text-slate-950">{value}</span>
              </div>
            ))}
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-semibold text-slate-500">Brand colours</p>
              <p className="mt-2 font-bold text-slate-950">
                {defaultOrganisationBranding.primaryColour} /{" "}
                {defaultOrganisationBranding.accentColour}
              </p>
              <p className="mt-1 text-slate-600">
                Logo state: {defaultOrganisationBranding.logoState}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Onboarding checklist categories
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Preview of grouped checklist templates for future tenant launch.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {checklistCategories.map((category) => {
              const items = onboardingChecklistTemplate.items.filter(
                (item) => item.category === category,
              );

              return (
                <article
                  key={category}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="text-sm font-bold text-slate-950">
                    {category}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {items.length} checklist items
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {items.filter((item) => item.required).length} required
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Read-only guardrails
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              No tenants are created from this page. No Supabase writes,
              migrations, auth invites, billing actions or domain changes are
              included.
            </p>
          </div>
          <PlatformBadge tone="amber">No actions</PlatformBadge>
        </div>
        {foundationPreview ? (
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Foundation preview resolves to{" "}
            {foundationPreview.modulePack?.moduleKeys.length ?? 0} module rows
            and {foundationPreview.featureFlagPack?.features.length ?? 0} feature
            flag template rows.
          </p>
        ) : null}
      </section>
    </div>
  );
}
