import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requirePermissionAccess } from "@/lib/auth";

const metrics = [
  {
    label: "Tenants",
    value: "1",
    detail: "Clean Eats Australia is Tenant 1.",
  },
  {
    label: "Active/Pilot tenants",
    value: "1",
    detail: "Static v1 placeholder.",
  },
  {
    label: "Verticals",
    value: "1",
    detail: "Food Production active; more planned.",
  },
  {
    label: "Billing mode",
    value: "Manual",
    detail: "Not configured for provider billing.",
  },
  {
    label: "Integrations",
    value: "Planned",
    detail: "No live integration actions.",
  },
];

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
    detail: "Platform-owner control centre for tenants and support oversight.",
    status: "Current skeleton",
  },
];

const tenants = [
  {
    name: "Clean Eats Australia",
    slug: "cleaneats",
    vertical: "Food Production",
    status: "Active / Pilot",
    type: "Client 1",
    modules: "9 planned",
    billing: "Manual / none",
    integrations: "Planned",
    href: "/platform/tenants/cleaneats",
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

function PlatformBadge({
  children,
  tone = "slate",
}: {
  children: string;
  tone?: "slate" | "blue" | "amber" | "green";
}) {
  const tones = {
    slate: "border-slate-600 bg-slate-800 text-slate-100",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default async function PlatformPage() {
  await requirePermissionAccess("platform.tenants.view");

  return (
    <AppShell>
      <div className="space-y-6 bg-slate-100/80 px-5 py-6 md:px-8 md:py-8">
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
          <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1.4fr_0.6fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <PlatformBadge>Internal / Platform owner only</PlatformBadge>
                <PlatformBadge tone="amber">Temporary build route</PlatformBadge>
              </div>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Platform control centre
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Platform Admin
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Control centre for tenants, modules, billing status and support
                oversight. This page is separate in tone from tenant HUBs and
                uses static read-only placeholders.
              </p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-5">
              <p className="text-sm font-semibold text-slate-100">
                Architecture note
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Current route: <span className="font-semibold">/platform</span>
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Future direction: admin subdomain / dedicated platform-owner
                environment.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {metric.label}
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {metric.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Platform architecture
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Future commercial model: public website, tenant HUBs and
                platform owner control centre.
              </p>
            </div>
            <PlatformBadge tone="blue">Three-layer model</PlatformBadge>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {architectureLayers.map((layer, index) => (
              <article
                key={layer.label}
                className="relative rounded-lg border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
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
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 md:px-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Tenant overview
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Static v1 tenant list preview. No tenant creation or edit
                  flows are active.
                </p>
              </div>
              <PlatformBadge tone="green">1 tenant</PlatformBadge>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {tenants.map((tenant) => (
              <article key={tenant.slug} className="px-5 py-5 md:px-6">
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] lg:items-center">
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
                      Vertical
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {tenant.vertical}
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
                      Type
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {tenant.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Modules
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {tenant.modules}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Billing
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {tenant.billing}
                    </p>
                  </div>
                  <Link
                    href={tenant.href}
                    className="inline-flex w-fit items-center justify-center rounded-md border border-slate-300 bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View
                  </Link>
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-700">
                    Integrations:{" "}
                    <span className="font-semibold">
                      {tenant.integrations}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
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
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
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
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
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
          </div>
        </section>
      </div>
    </AppShell>
  );
}
