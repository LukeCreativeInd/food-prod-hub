import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requirePermissionAccess } from "@/lib/auth";

const summaryCards = [
  { label: "Slug", value: "cleaneats", detail: "Stable tenant key" },
  { label: "Vertical", value: "Food Production", detail: "Tenant 1 pilot" },
  { label: "Status", value: "Active / Pilot", detail: "Static v1 state" },
  { label: "Environment", value: "Demo/Foundation", detail: "Phase 1 review" },
  {
    label: "Module pack",
    value: "Phase 1 + planned",
    detail: "Demo modules active",
  },
  { label: "Billing", value: "Manual / none", detail: "Not configured" },
];

const contextItems = [
  "Same codebase",
  "Separate organisation data",
  "Separate branding/settings",
  "Separate users/memberships",
  "Separate enabled modules",
  "Future subdomain: cleaneats.[brand].com.au",
];

const moduleGroups = [
  {
    label: "Default",
    modules: ["Dashboard"],
    note: "Default app area; not a selectable module initially.",
  },
  {
    label: "Phase 1 demo",
    modules: ["Products", "Costings", "Production", "Inventory"],
    note: "Current staff review module set.",
  },
  {
    label: "Planned/full",
    modules: ["QA", "Logistics", "CRM", "Reports", "Admin"],
    note: "Planned full operations model for this tenant.",
  },
];

const memberships = [
  {
    name: "Luke",
    role: "platform_admin",
    access: "Platform admin / support oversight",
    status: "Active",
  },
  {
    name: "Clean Eats Demo User",
    role: "phase_1_demo_user",
    access: "Phase 1 demo modules",
    status: "Active",
  },
  {
    name: "Future staff users",
    role: "pending",
    access: "Production, warehouse, QA and management users",
    status: "Planned",
  },
];

const settingsPreview = [
  ["Display name", "Clean Eats Hub"],
  ["Primary colour", "Tenant-level Clean Eats green"],
  ["Timezone", "Australia/Melbourne"],
  ["Currency", "AUD"],
  ["Units", "Metric"],
  ["Date format", "DD/MM/YYYY"],
];

const billingItems = [
  ["Plan", "Internal/Pilot"],
  ["Status", "Not configured"],
  ["Provider", "None"],
  ["Enforcement", "Manual/soft only"],
];

const integrations = [
  ["Shopify", "Planned", "Future order/customer/product import pathway."],
  ["Xero", "Planned", "Future financial reference export."],
  ["Courier/logistics tools", "Future", "Future manifests and logistics data."],
  ["CSV imports", "Collection", "Current early-stage collection pathway."],
];

const supportItems = [
  ["Support notes", "Future", "Internal support context can be added later."],
  [
    "Audit logs",
    "Protected",
    "RLS-protected audit summaries are planned for platform admins.",
  ],
  ["Tenant health", "Placeholder", "Sample health/status panel only."],
];

const guardrails = [
  "No writes from this page",
  "No tenant creation/editing",
  "No billing actions",
  "No user invites",
  "No support-mode switching yet",
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

function DetailPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 md:px-6">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export default async function CleanEatsTenantDetailPage() {
  await requirePermissionAccess("platform.tenants.view");

  return (
    <AppShell>
      <div className="space-y-6 bg-slate-100/80 px-5 py-6 md:px-8 md:py-8">
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
          <div className="p-6 md:p-8">
            <Link
              href="/platform"
              className="inline-flex w-fit items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Back to Platform
            </Link>
            <div className="mt-7 flex flex-wrap gap-2">
              <PlatformBadge tone="green">Active</PlatformBadge>
              <PlatformBadge>Client 1</PlatformBadge>
              <PlatformBadge tone="amber">Read-only</PlatformBadge>
            </div>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Tenant detail / Food Production / Pilot tenant
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Clean Eats Australia
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Platform Admin preview. Tenant branding and data are
              tenant-scoped; this page uses static read-only placeholders only.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {card.label}
              </p>
              <p className="mt-3 text-xl font-bold text-slate-950">
                {card.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <DetailPanel
          title="Tenant architecture / context"
          description="Tenant boundaries that keep Clean Eats separate from future clients."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {contextItems.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
              >
                {item}
              </div>
            ))}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Modules"
          description="Module state for the Clean Eats pilot, grouped for platform-admin review."
        >
          <div className="grid gap-4 xl:grid-cols-3">
            {moduleGroups.map((group) => (
              <article
                key={group.label}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-bold text-slate-950">
                    {group.label}
                  </h3>
                  <PlatformBadge
                    tone={group.label === "Phase 1 demo" ? "green" : "blue"}
                  >
                    {group.modules.length.toString()}
                  </PlatformBadge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.modules.map((module) => (
                    <span
                      key={module}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
                    >
                      {module}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {group.note}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
            Purchasing sits under Inventory. Wholesale is dormant pending CRM
            planning.
          </div>
        </DetailPanel>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <DetailPanel
            title="Users / memberships preview"
            description="Plain labels only. No auth IDs, passwords or user-management actions."
          >
            <div className="space-y-3">
              {memberships.map((membership) => (
                <article
                  key={membership.name}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-950">
                        {membership.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {membership.role}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {membership.access}
                      </p>
                    </div>
                    <PlatformBadge
                      tone={
                        membership.status === "Active" ? "green" : "amber"
                      }
                    >
                      {membership.status}
                    </PlatformBadge>
                  </div>
                </article>
              ))}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Branding / settings preview"
            description="Tenant branding is separate from Platform Admin styling."
          >
            <div className="space-y-3">
              {settingsPreview.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-semibold text-slate-500">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-slate-950">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </DetailPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <DetailPanel
            title="Billing"
            description="Commercial state remains manual and placeholder-only."
          >
            <div className="space-y-3">
              {billingItems.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Integrations"
            description="Future connection states only. No live API actions."
          >
            <div className="space-y-3">
              {integrations.map(([name, status, detail]) => (
                <article
                  key={name}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-950">
                      {name}
                    </h3>
                    <PlatformBadge
                      tone={status === "Collection" ? "blue" : "amber"}
                    >
                      {status}
                    </PlatformBadge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {detail}
                  </p>
                </article>
              ))}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Support / audit"
            description="Future support context for platform admins."
          >
            <div className="space-y-3">
              {supportItems.map(([name, status, detail]) => (
                <article
                  key={name}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-950">
                      {name}
                    </h3>
                    <PlatformBadge tone="blue">{status}</PlatformBadge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {detail}
                  </p>
                </article>
              ))}
            </div>
          </DetailPanel>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Read-only guardrails
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                This tenant detail page is a platform-admin preview, not a
                tenant management console.
              </p>
            </div>
            <PlatformBadge tone="amber">No actions</PlatformBadge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {guardrails.map((guardrail) => (
              <div
                key={guardrail}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100"
              >
                {guardrail}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
