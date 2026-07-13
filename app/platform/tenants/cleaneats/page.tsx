import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

const tenantProfile = [
  { label: "Organisation name", value: "Clean Eats Australia" },
  { label: "Slug", value: "cleaneats" },
  { label: "Industry", value: "Food Manufacturing" },
  { label: "Status", value: "active" },
  { label: "Tenant type", value: "Client 1 / Pilot" },
  { label: "Environment", value: "Demo/Foundation" },
  { label: "Notes", value: "Phase 1 demo modules active" },
];

const settingsPreview = [
  { label: "Display name", value: "Clean Eats Hub" },
  { label: "Primary colour", value: "Clean Eats green" },
  { label: "Timezone", value: "Australia/Melbourne" },
  { label: "Currency", value: "AUD" },
  { label: "Units", value: "Metric" },
  { label: "Date format", value: "DD/MM/YYYY" },
];

const enabledModules = [
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

const phaseOneModules = ["Products", "Costings", "Production", "Inventory"];

const memberships = [
  {
    name: "Luke",
    role: "platform_admin",
    access: "Platform admin",
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

const integrations = [
  {
    name: "Shopify",
    status: "Planned",
    description: "Future order, customer and product import pathway.",
  },
  {
    name: "Xero",
    status: "Planned",
    description: "Future purchase order, bill or financial reference export.",
  },
  {
    name: "Courier/logistics tools",
    status: "Future",
    description: "Future delivery manifests and logistics support.",
  },
  {
    name: "CSV imports",
    status: "Collection",
    description: "Current early-stage collection path for structured data.",
  },
];

const supportItems = [
  {
    title: "Support notes",
    description:
      "Future platform-admin support notes can sit here once the support model is designed.",
    meta: "Future",
  },
  {
    title: "Audit logs",
    description:
      "Audit logs are protected by RLS and currently planned for platform_admin-readable traceability.",
    meta: "Protected",
  },
  {
    title: "Tenant health",
    description:
      "Sample placeholder for future health checks, setup completion and operational status.",
    meta: "Placeholder",
  },
];

export default async function CleanEatsTenantDetailPage() {
  await requirePermissionAccess("platform.tenants.view");

  return (
    <AppShell>
      <PageHeader
        title="Clean Eats Australia"
        description="Tenant detail preview for cleaneats. Read-only Platform Admin skeleton."
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <SectionCard
          title="Tenant detail"
          description="Static platform-admin preview for Tenant 1. No tenant editing, billing, module toggles or integration actions are implemented."
          action={<StatusBadge tone="success">active</StatusBadge>}
        >
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800">
              This page uses static read-only placeholders. It does not use
              service-role access, bypass RLS, query business module data or
              save changes.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Slug"
                value="cleaneats"
                helperText="Tenant URL/key placeholder for Clean Eats."
                badge="Tenant"
                tone="info"
                icon="CE"
              />
              <StatCard
                label="Phase 1 demo"
                value="4"
                helperText="Products, Costings, Production and Inventory."
                badge="Active"
                tone="success"
                icon="P1"
              />
            </div>
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Tenant profile"
            description="Foundation profile details for the first tenant preview."
            action={<StatusBadge tone="neutral">Static</StatusBadge>}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {tenantProfile.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Branding and settings preview"
            description="Future tenant-level display and operational defaults."
            action={<StatusBadge tone="info">Preview</StatusBadge>}
          >
            <div className="space-y-3">
              {settingsPreview.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-500">
                    {item.label}
                  </span>
                  <span className="text-right font-semibold text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Enabled modules summary"
          description="Current intended module state for Clean Eats tenant planning."
          action={<StatusBadge tone="success">9 core modules</StatusBadge>}
        >
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Enabled/core
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {enabledModules.map((module) => (
                  <div
                    key={module}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    {module}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-900">
                  Phase 1 demo modules
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  {phaseOneModules.join(", ")}
                </p>
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-600">
                <p>Dashboard is the default app area.</p>
                <p>Purchasing sits under Inventory.</p>
                <p>Wholesale is dormant pending CRM planning.</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Users and memberships preview"
            description="Read-only labels only. No passwords or auth IDs are shown."
            action={<StatusBadge tone="warning">No invites</StatusBadge>}
          >
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 md:grid-cols-[1fr_0.8fr_1.2fr_0.6fr]">
                <span>User</span>
                <span>Role</span>
                <span>Access</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-slate-200 bg-white">
                {memberships.map((membership) => (
                  <div
                    key={membership.name}
                    className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_0.8fr_1.2fr_0.6fr] md:items-center"
                  >
                    <p className="font-semibold text-slate-950">
                      {membership.name}
                    </p>
                    <p className="font-medium text-slate-700">
                      {membership.role}
                    </p>
                    <p className="text-slate-600">{membership.access}</p>
                    <StatusBadge
                      tone={
                        membership.status === "Active" ? "success" : "warning"
                      }
                    >
                      {membership.status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Integration placeholders"
            description="Future external system setup status for this tenant."
            action={<StatusBadge tone="neutral">No live APIs</StatusBadge>}
          >
            <div className="space-y-3">
              {integrations.map((integration) => (
                <AlertCard
                  key={integration.name}
                  title={integration.name}
                  description={integration.description}
                  meta={integration.status}
                  tone={
                    integration.status === "Collection" ? "info" : "warning"
                  }
                />
              ))}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Billing and subscription placeholder"
            description="Billing is intentionally not configured for the pilot/internal phase."
            action={<StatusBadge tone="neutral">Placeholder</StatusBadge>}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Billing", "Not configured"],
                ["Plan", "Pilot/internal"],
                ["Subscription", "Future"],
                ["Payment status", "Not applicable yet"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Support and audit placeholder"
            description="Future support context for platform admins."
            action={<StatusBadge tone="info">Read-only</StatusBadge>}
          >
            <div className="space-y-3">
              {supportItems.map((item) => (
                <AlertCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  meta={item.meta}
                  tone="info"
                />
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
