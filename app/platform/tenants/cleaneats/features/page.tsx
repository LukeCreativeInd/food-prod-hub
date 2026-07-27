import Link from "next/link";

import { getPlatformTenantModulesAndFeatures } from "@/lib/platform-modules-features";

type BadgeTone = "slate" | "green" | "amber" | "blue";

function PlatformBadge({
  children,
  tone = "slate",
}: {
  children: string;
  tone?: BadgeTone;
}) {
  const tones = {
    slate: "border-slate-600 bg-slate-800 text-slate-100",
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

function formatBoolean(value: boolean) {
  return value ? "Enabled" : "Disabled";
}

function formatOptionalBoolean(value: boolean | null) {
  if (value === null) {
    return "No override";
  }

  return formatBoolean(value);
}

export default async function CleanEatsTenantFeaturesPage() {
  const data = await getPlatformTenantModulesAndFeatures("cleaneats");
  const tenantName = data.tenant?.name ?? "Clean Eats Australia";
  const categoryGroups = Object.entries(
    data.features.reduce<Record<string, typeof data.features>>(
      (groups, feature) => {
        const groupRows = groups[feature.category] ?? [];
        groupRows.push(feature);
        groups[feature.category] = groupRows;

        return groups;
      },
      {},
    ),
  ).sort(([firstCategory], [secondCategory]) =>
    firstCategory.localeCompare(secondCategory),
  );

  return (
    <div className="space-y-6 bg-slate-100/80 px-5 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
        <div className="p-6 md:p-8">
          <Link
            href="/platform/tenants/cleaneats"
            className="inline-flex w-fit items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Back to Clean Eats tenant
          </Link>
          <div className="mt-7 flex flex-wrap gap-2">
            <PlatformBadge tone="green">Read-only v1</PlatformBadge>
            <PlatformBadge>Tenant feature flags</PlatformBadge>
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Platform Admin / feature rollout
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {tenantName} Feature Flags
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Read-only view of global feature flags merged with Clean Eats
            overrides. Effective state uses the tenant override when present,
            otherwise the global default.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Active feature flags
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {data.summary.activeFeatureFlags}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Global active registry rows.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Tenant overrides
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {data.summary.tenantFeatureOverrides}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Clean Eats override rows.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Effective enabled
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {data.summary.effectiveEnabledFeatures}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enabled after override/default resolution.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Enabled overrides
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {data.summary.enabledFeatureOverrides}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Explicit tenant overrides set to enabled.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Rollout stage summary
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Counts from the active global feature flag registry.
            </p>
          </div>
          <PlatformBadge tone="blue">Registry</PlatformBadge>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {data.summary.rolloutStageCounts.map((stage) => (
            <span
              key={stage.rolloutStage}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800"
            >
              {stage.rolloutStage}: {stage.count}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        {categoryGroups.map(([category, features]) => (
          <article
            key={category}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold capitalize text-slate-950">
                    {category}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Feature category from the global registry.
                  </p>
                </div>
                <PlatformBadge tone="blue">
                  {`${features.length} flags`}
                </PlatformBadge>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {features.map((feature) => (
                <div
                  key={feature.featureKey}
                  className="grid min-w-0 gap-4 px-5 py-5 md:px-6 xl:grid-cols-[1.1fr_0.7fr_0.7fr_0.8fr_1fr]"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-950">
                      {feature.label}
                    </h3>
                    <p className="mt-1 break-words text-sm font-mono text-slate-500">
                      {feature.featureKey}
                    </p>
                    <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                      {feature.description ?? "No description set."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Effective
                    </p>
                    <div className="mt-2">
                      <PlatformBadge
                        tone={feature.effectiveEnabled ? "green" : "amber"}
                      >
                        {formatBoolean(feature.effectiveEnabled)}
                      </PlatformBadge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Source
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {feature.source === "tenant_override"
                        ? "Tenant override"
                        : "Global default"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Default / override
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {formatBoolean(feature.defaultEnabled)} /{" "}
                      {formatOptionalBoolean(feature.overrideEnabled)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Rollout / notes
                    </p>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                      {feature.rolloutStage}
                      {feature.notes ? ` - ${feature.notes}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Read-only guardrails
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              This page does not edit feature flags. Future changes should use
              reviewed Platform Admin actions and remain separate from
              permissions, modules and RLS.
            </p>
          </div>
          <PlatformBadge tone="amber">No actions</PlatformBadge>
        </div>
      </section>
    </div>
  );
}
