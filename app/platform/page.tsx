import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

const platformStats = [
  {
    label: "Tenants",
    value: "1",
    helperText: "Clean Eats Australia is Tenant 1 / pilot.",
    badge: "Preview",
    tone: "info" as const,
    icon: "TN",
  },
  {
    label: "Active tenants",
    value: "1",
    helperText: "Static skeleton value; no tenant management actions yet.",
    badge: "Active",
    tone: "success" as const,
    icon: "OK",
  },
  {
    label: "Enabled modules",
    value: "9",
    helperText: "Current cleaned top-level module model for future tenants.",
    badge: "Model",
    tone: "neutral" as const,
    icon: "MD",
  },
  {
    label: "Support notes",
    value: "0",
    helperText: "Support/audit tools are planned later.",
    badge: "Future",
    tone: "warning" as const,
    icon: "SP",
  },
];

const tenants = [
  {
    name: "Clean Eats Australia",
    slug: "cleaneats",
    industry: "Food Manufacturing",
    status: "active",
    modules:
      "Products, Costings, Production, Inventory, QA, Logistics, CRM, Reports, Admin",
    notes: "Tenant 1 / pilot",
  },
];

const topLevelModules = [
  "Products",
  "Costings",
  "Production",
  "Inventory",
  "QA",
  "Logistics",
  "CRM",
  "Reports",
  "Admin",
];

const roadmapItems = [
  {
    title: "Tenant creation",
    description:
      "Future flow for creating organisations, slugs, module packs and first tenant admins.",
  },
  {
    title: "Module packs/templates",
    description:
      "Future starter templates such as Food Manufacturing Starter or Full Operations.",
  },
  {
    title: "Tenant branding",
    description:
      "Future platform owner setup for logo, colours, sidebar style and login branding.",
  },
  {
    title: "First admin invite",
    description:
      "Future Supabase Auth invite/password reset flow for tenant admin onboarding.",
  },
  {
    title: "Billing/subscriptions later",
    description:
      "Deferred until product value is proven with Clean Eats and future client needs are clear.",
  },
  {
    title: "Support/audit tools later",
    description:
      "Future platform-admin support view for tenant health, notes and audit activity.",
  },
];

export default async function PlatformPage() {
  await requirePermissionAccess("platform.tenants.view");

  return (
    <AppShell>
      <PageHeader
        title="Platform Admin"
        description="Manage Food Prod Hub tenants, modules and platform support."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Platform admin skeleton"
          description="Read-only platform admin preview. No tenant creation, module toggles, user invites, billing or support tools are implemented yet."
          action={<StatusBadge tone="info">Read-only skeleton</StatusBadge>}
        >
          <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800">
            This page uses static foundation placeholders for the first
            platform-admin preview. It does not use service-role access, bypass
            RLS or save changes.
          </div>
        </SectionCard>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {platformStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <SectionCard
          title="Tenant list"
          description="Read-only tenant preview for platform admin planning."
          action={<StatusBadge tone="success">Tenant 1</StatusBadge>}
        >
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid-cols-[1.1fr_0.7fr_0.9fr_0.6fr_1.4fr_0.8fr]">
              <span>Organisation</span>
              <span>Slug</span>
              <span>Industry</span>
              <span>Status</span>
              <span>Modules</span>
              <span>Notes</span>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {tenants.map((tenant) => (
                <div
                  key={tenant.slug}
                  className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.1fr_0.7fr_0.9fr_0.6fr_1.4fr_0.8fr] lg:items-start"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {tenant.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Static preview row
                    </p>
                  </div>
                  <p className="font-medium text-slate-700">{tenant.slug}</p>
                  <p className="text-slate-600">{tenant.industry}</p>
                  <div>
                    <StatusBadge tone="success">{tenant.status}</StatusBadge>
                  </div>
                  <p className="leading-6 text-slate-600">{tenant.modules}</p>
                  <p className="font-medium text-slate-700">{tenant.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Module model summary"
            description="Cleaned top-level tenant module model for future platform admin controls."
            action={<StatusBadge tone="neutral">Planning model</StatusBadge>}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {topLevelModules.map((module) => (
                <div
                  key={module}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  {module}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <p>Dashboard is a default app area, not toggleable initially.</p>
              <p>Purchasing is an Inventory workspace.</p>
              <p>Wholesale is dormant pending CRM planning.</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Future platform admin roadmap"
            description="Planned capabilities for later platform/global admin work."
            action={<StatusBadge tone="warning">Future</StatusBadge>}
          >
            <div className="space-y-3">
              {roadmapItems.map((item) => (
                <AlertCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  meta="Planned"
                  tone="neutral"
                />
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
