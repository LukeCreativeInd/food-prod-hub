import Link from "next/link";

import { getPlatformTenantOverview } from "@/lib/platform-tenant-overview";

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

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PlatformTenantsPage() {
  const overview = await getPlatformTenantOverview();

  return (
    <div className="space-y-6 bg-[#F2F4F7] px-5 py-6 md:px-8 md:py-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap gap-2">
              <PlatformBadge tone="green">Read-only</PlatformBadge>
              <PlatformBadge>No tenant writes</PlatformBadge>
              <PlatformBadge tone="amber">
                Dynamic detail pages later
              </PlatformBadge>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Read-only tenant overview for EveryBatch operators. This page
              lists current tenant foundation records and links to Clean Eats
              detail pages while generic tenant detail routing is still planned.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Tenant count
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {overview.totalTenantCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {overview.activeTenantCount} active tenants /{" "}
              {overview.pilotTenantCount} pilot tenants.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Tenants</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {overview.totalTenantCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">Organisation records.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Active</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {overview.activeTenantCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">Currently active.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Pilot</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {overview.pilotTenantCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">Clean Eats pilot count.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Billing</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">Manual</p>
          <p className="mt-2 text-sm text-slate-600">Provider not connected.</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Tenant list</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Live tenant foundation records with read-only module and feature
              counts. Detail links are only enabled where pages exist.
            </p>
          </div>
          <PlatformBadge tone="blue">Read-only overview</PlatformBadge>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.7fr_0.8fr_0.8fr_1.4fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500 md:grid">
            <span>Tenant</span>
            <span>Status</span>
            <span>Created</span>
            <span>Modules</span>
            <span>Feature flags</span>
            <span>Links</span>
          </div>
          <div className="divide-y divide-slate-200">
            {overview.tenantRows.map((tenant) => (
              <article
                key={tenant.organisationId}
                className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.4fr_0.8fr_0.7fr_0.8fr_0.8fr_1.4fr]"
              >
                <div>
                  <p className="font-bold text-slate-950">{tenant.name}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {tenant.slug}
                  </p>
                </div>
                <div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                    {tenant.status}
                  </span>
                </div>
                <p className="text-slate-600">{formatDate(tenant.createdAt)}</p>
                <p className="font-semibold text-slate-700">
                  {tenant.enabledModuleCount}
                </p>
                <p className="font-semibold text-slate-700">
                  {tenant.featureOverrideCount}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tenant.viewHref ? (
                    <Link
                      href={tenant.viewHref}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50"
                    >
                      Clean Eats Detail
                    </Link>
                  ) : (
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                      Detail page coming soon
                    </span>
                  )}
                  {tenant.slug === "cleaneats" ? (
                    <>
                      <Link
                        href="/platform/tenants/cleaneats/modules"
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50"
                      >
                        Clean Eats Modules
                      </Link>
                      <Link
                        href="/platform/tenants/cleaneats/features"
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50"
                      >
                        Clean Eats Feature Flags
                      </Link>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
