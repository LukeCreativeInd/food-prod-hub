import { Suspense } from "react";
import Link from "next/link";

import {
  PlatformMetricCard,
  PlatformSectionCard,
  PlatformStatusBadge as PlatformBadge,
} from "@/components/platform/platform-ui";
import {
  PLATFORM_ADMIN_DOMAIN,
  PLATFORM_BRAND_NAME,
  PLATFORM_BRAND_TAGLINE,
  PLATFORM_OPERATOR_CONSOLE_LABEL,
  PLATFORM_PRODUCT_LINE,
} from "@/lib/platform-brand";
import { getPlatformTenantOverview } from "@/lib/platform-tenant-overview";

const architectureLayers = [
  {
    label: "Public website",
    detail: "Marketing, modules, pricing later, enquiry and demo request.",
    status: "Future",
  },
  {
    label: "Tenant HUBs",
    detail: "Branded operational environments with tenant-scoped data.",
    status: "Planned",
  },
  {
    label: "Platform Admin",
    detail: `${PLATFORM_BRAND_NAME} operator console for tenants and support oversight.`,
    status: "Current skeleton",
  },
];

const verticals = [
  {
    label: "Food Production",
    status: "Active pilot",
    detail: "Clean Eats demo and Phase 1 module validation.",
  },
  {
    label: "Automotive Workshops",
    status: "Research",
    detail: "Potential future vertical for jobs, vehicles, parts and bookings.",
  },
  {
    label: "General Operations",
    status: "Future",
    detail: "Broader operations-heavy businesses after core platform proves out.",
  },
  {
    label: "Custom Vertical",
    status: "Future",
    detail: "Tenant-specific module packs without code forks.",
  },
];

const guardrails = [
  "Read-only v1",
  "No tenant writes",
  "No billing actions",
  "No live tenant switching",
  "RLS/security foundations stay protected",
];

const platformSignals = [
  {
    label: "Support inbox",
    value: "Future",
    detail: "Tickets from support.everybatchmrp.com and app Help menu later.",
  },
  {
    label: "System health",
    value: "Manual",
    detail: "Vercel, Supabase, storage and route checks remain manual links later.",
  },
  {
    label: "Feature flags",
    value: "Drafted",
    detail: "Registry foundation exists; no editor or live gating here yet.",
  },
  {
    label: "Release notes",
    value: "Planned",
    detail: "Deployment metadata, migration status and smoke test records later.",
  },
];

const nextSetupSteps = [
  "Platform Shell Separation v1",
  "Tenant Overview v1",
  "Tenant Module / Feature Flag Overview",
  "Tenant Provisioning Plan",
];

function PlatformPanelFallback({ label }: { label: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="h-4 w-48 rounded bg-slate-100" />
      <div className="mt-3 h-3 w-full max-w-xl rounded bg-slate-100" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-24 rounded-lg border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
    </section>
  );
}

async function PlatformMetricsSection() {
  const overview = await getPlatformTenantOverview();
  const metrics = [
    {
      label: "Tenants",
      value: overview.totalTenantCount.toString(),
      detail: "Real count from organisations.",
    },
    {
      label: "Active / pilot",
      value: `${overview.activeTenantCount} / ${overview.pilotTenantCount}`,
      detail: "Pilot is currently derived from Clean Eats.",
    },
    {
      label: "Module registry",
      value: overview.platformSummary.activeModules.toString(),
      detail: `${overview.platformSummary.totalModules} total module records.`,
    },
    {
      label: "Feature flags",
      value: overview.platformSummary.featureFlagCount.toString(),
      detail: `${overview.platformSummary.enabledFeatureOverrideCount} enabled tenant overrides.`,
    },
    {
      label: "Billing mode",
      value: "Manual",
      detail: "Provider billing is not configured yet.",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => (
        <PlatformMetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          detail={metric.detail}
        />
      ))}
    </section>
  );
}

async function PlatformDeferredSections() {
  const overview = await getPlatformTenantOverview();

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PlatformSectionCard className="p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F2E23]">
                Operator console signals
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Platform Admin v1 separates the shell and prepares the
                operating areas without adding management actions.
              </p>
            </div>
            <PlatformBadge tone="amber">Scaffold</PlatformBadge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {platformSignals.map((signal) => (
              <article
                key={signal.label}
                className="rounded-lg border border-slate-200 bg-[#F7FAF8] p-4"
              >
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {signal.label}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {signal.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {signal.detail}
                </p>
              </article>
            ))}
          </div>
        </PlatformSectionCard>

        <div className="rounded-xl border border-[#174231] bg-[#0F2E23] p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Next setup steps
              </h2>
              <p className="mt-1 text-sm leading-6 text-emerald-50/80">
                Planned sequence from the Platform Admin IA.
              </p>
            </div>
            <PlatformBadge tone="amber">Planned</PlatformBadge>
          </div>
          <div className="mt-5 space-y-3">
            {nextSetupSteps.map((step) => (
              <div
                key={step}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-emerald-50"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PlatformSectionCard className="p-5 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F2E23]">
              Platform architecture
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Future commercial model: public website, tenant HUBs and{" "}
              {PLATFORM_BRAND_NAME} operator console.
            </p>
          </div>
          <PlatformBadge tone="blue">Three-layer model</PlatformBadge>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {architectureLayers.map((layer, index) => (
            <article
              key={layer.label}
              className="relative rounded-lg border border-slate-200 bg-[#F7FAF8] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#176B3D] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <PlatformBadge tone={index === 2 ? "green" : "blue"}>
                  {layer.status}
                </PlatformBadge>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-950">
                {layer.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {layer.detail}
              </p>
            </article>
          ))}
        </div>
      </PlatformSectionCard>

      <PlatformSectionCard>
        <div className="border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F2E23]">
                Tenant overview
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Real platform metadata from tenant/config tables. No tenant
                creation or edit flows are active.
              </p>
            </div>
            <PlatformBadge tone="green">
              {`${overview.totalTenantCount} tenants`}
            </PlatformBadge>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {overview.tenantRows.map((tenant) => (
            <article key={tenant.slug} className="px-5 py-5 md:px-6">
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.75fr_0.75fr_0.75fr_0.75fr_0.85fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {tenant.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    slug: {tenant.slug}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Industry
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {tenant.industry ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {tenant.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Modules
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {tenant.enabledModuleCount} enabled
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Features
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {tenant.featureOverrideCount} overrides
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Members
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {tenant.activeMemberCount} active /{" "}
                    {tenant.tenantAdminCount} admins
                  </p>
                </div>
                {tenant.viewHref ? (
                  <Link
                    href={tenant.viewHref}
                    className="inline-flex w-fit items-center justify-center rounded-md border border-[#176B3D] bg-[#176B3D] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0F2E23]"
                  >
                    View
                  </Link>
                ) : (
                  <span className="inline-flex w-fit cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-400">
                    Future
                  </span>
                )}
              </div>
              <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 lg:grid-cols-[1fr_1fr_1fr_auto]">
                <p>
                  Branding:{" "}
                  <span className="font-semibold">
                    {tenant.logoUrl ? "Logo uploaded" : "Placeholder logo"}
                  </span>
                </p>
                <p>
                  Defaults:{" "}
                  <span className="font-semibold">
                    {[tenant.timezone, tenant.currency, tenant.defaultUnits]
                      .filter(Boolean)
                      .join(" / ") || "Not set"}
                  </span>
                </p>
                <p>
                  Billing/support:{" "}
                  <span className="font-semibold">
                    Manual / placeholder
                  </span>
                </p>
                {tenant.slug === "cleaneats" ? (
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href="/platform/tenants/cleaneats/modules"
                      className="rounded-md border border-[#176B3D]/25 bg-white px-3 py-2 text-xs font-bold text-[#176B3D] transition hover:bg-[#E8F5E9]"
                    >
                      Modules
                    </Link>
                    <Link
                      href="/platform/tenants/cleaneats/features"
                      className="rounded-md border border-[#176B3D]/25 bg-white px-3 py-2 text-xs font-bold text-[#176B3D] transition hover:bg-[#E8F5E9]"
                    >
                      Features
                    </Link>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </PlatformSectionCard>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <PlatformSectionCard className="p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F2E23]">
                Future verticals / product lines
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Platform Admin should stay broad enough for multiple
                operations-heavy industries.
              </p>
            </div>
            <PlatformBadge tone="amber">Planning</PlatformBadge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {verticals.map((vertical) => (
              <article
                key={vertical.label}
                className="rounded-lg border border-slate-200 bg-[#F7FAF8] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-950">
                    {vertical.label}
                  </h3>
                  <PlatformBadge
                    tone={
                      vertical.status === "Active pilot" ? "green" : "amber"
                    }
                  >
                    {vertical.status}
                  </PlatformBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {vertical.detail}
                </p>
              </article>
            ))}
          </div>
        </PlatformSectionCard>

        <PlatformSectionCard className="p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F2E23]">
                Admin notes / guardrails
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                V1 keeps Platform Admin safe while the tenant foundations
                mature.
              </p>
            </div>
            <PlatformBadge tone="blue">Protected</PlatformBadge>
          </div>
          <div className="mt-5 space-y-3">
            {guardrails.map((guardrail) => (
              <div
                key={guardrail}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
              >
                {guardrail}
              </div>
            ))}
          </div>
        </PlatformSectionCard>
      </section>
    </>
  );
}

export default function PlatformPage() {
  return (
    <div className="space-y-6 bg-[#F2F4F7] px-5 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-xl border border-[#174231] bg-[#0F2E23] shadow-sm">
        <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <PlatformBadge>Internal / Platform owner only</PlatformBadge>
              <PlatformBadge tone="lime">{PLATFORM_PRODUCT_LINE}</PlatformBadge>
              <PlatformBadge tone="amber">Temporary build route</PlatformBadge>
            </div>
            <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-lime-200">
              {PLATFORM_OPERATOR_CONSOLE_LABEL}
            </p>
            <p className="mt-3 text-xl font-black tracking-tight text-white md:text-2xl">
              Platform owner workspace
            </p>
            <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-lime-100">
              {PLATFORM_BRAND_TAGLINE}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-50/80">
              Platform-owner console for tenants, module access, feature
              flags, provisioning readiness and support oversight. This area
              is deliberately separate from tenant workspaces.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold text-white">Domain readiness</p>
            <p className="mt-3 text-sm leading-6 text-emerald-50/80">
              Current route: <span className="font-semibold">/platform</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-50/80">
              Future direction: {PLATFORM_ADMIN_DOMAIN} as the dedicated
              platform-owner environment.
            </p>
          </div>
        </div>
      </section>

      <Suspense
        fallback={<PlatformPanelFallback label="Loading platform metrics" />}
      >
        <PlatformMetricsSection />
      </Suspense>

      <Suspense
        fallback={<PlatformPanelFallback label="Loading platform details" />}
      >
        <PlatformDeferredSections />
      </Suspense>
    </div>
  );
}
