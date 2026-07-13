import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

const summaryCards = [
  {
    label: "Orders waiting for report",
    value: "184",
    helperText: "Sample Shopify demand waiting for production report preview.",
    badge: "Demo",
    tone: "info" as const,
    icon: "OR",
  },
  {
    label: "Reports generated",
    value: "2",
    helperText: "Static examples only; no report generation exists yet.",
    badge: "Sample",
    tone: "neutral" as const,
    icon: "RP",
  },
  {
    label: "Tasks ready",
    value: "24",
    helperText: "Placeholder task count for production area review.",
    badge: "Ready",
    tone: "success" as const,
    icon: "TK",
  },
  {
    label: "Areas active",
    value: "5",
    helperText: "Kitchen, prep, packing and finished goods sample areas.",
    badge: "Sample",
    tone: "info" as const,
    icon: "AR",
  },
  {
    label: "Issues/waste logged",
    value: "3",
    helperText: "Static issue and waste prompts for facility review.",
    badge: "Review",
    tone: "warning" as const,
    icon: "!",
  },
];

const productionFlow = [
  {
    title: "Shopify/order demand",
    description: "Future order data source for production requirements.",
    meta: "Future API",
    tone: "info" as const,
  },
  {
    title: "Production report",
    description: "Future HUB version of the Streamlit report workflow.",
    meta: "Sample",
    tone: "neutral" as const,
  },
  {
    title: "Production plan",
    description: "Turns report demand into daily/weekly production work.",
    meta: "Planned",
    tone: "success" as const,
  },
  {
    title: "Production tasks",
    description: "Area-based tasks with quantities, checks and status.",
    meta: "Demo",
    tone: "info" as const,
  },
  {
    title: "Facility/iPad execution",
    description: "Future floor-staff screen for starting and completing work.",
    meta: "Preview",
    tone: "warning" as const,
  },
  {
    title: "Inventory usage later",
    description: "Future link into batches, consumption and traceability.",
    meta: "Future",
    tone: "neutral" as const,
  },
];

const quickActions = [
  { label: "Generate production report", href: "/production-report" },
  { label: "Review production plan", href: "/production-plan" },
  { label: "Open task board", href: "/production-tasks" },
  { label: "Open facility view", href: "/facility-tasks" },
];

const productionAreas = [
  {
    title: "Production Report",
    description: "Preview the future HUB report generated from order demand.",
    href: "/production-report",
    eyebrow: "Production",
  },
  {
    title: "Production Plan",
    description: "Review how demand becomes scheduled production work.",
    href: "/production-plan",
    eyebrow: "Production",
  },
  {
    title: "Production Areas",
    description: "Review area grouping for kitchen, prep and packing work.",
    href: "/production-areas",
    eyebrow: "Production",
  },
  {
    title: "Production Tasks",
    description: "Review task rows for quantities, checks and assignment.",
    href: "/production-tasks",
    eyebrow: "Production",
  },
  {
    title: "Facility / iPad View",
    description: "Preview future floor-staff task execution screens.",
    href: "/facility-tasks",
    eyebrow: "Production",
  },
];

export default async function ProductionPage() {
  await requirePermissionAccess("production.view");

  return (
    <AppShell>
      <PageHeader
        title="Production"
        description="Turns order demand into production reports, production plans, tasks and facility/iPad workflows."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Production flow preview"
            description="Sample flow only. No Shopify, report generation or live production data is connected."
            action={<StatusBadge tone="info">Sample layout only</StatusBadge>}
          >
            <div className="space-y-3">
              {productionFlow.map((item) => (
                <AlertCard key={item.title} {...item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Quick actions"
            description="Visual placeholders for the future production workflow."
          >
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <PageActionButton
                  key={action.label}
                  href={action.href}
                  variant="secondary"
                >
                  {action.label}
                </PageActionButton>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Sample data notice"
            description="This module is not connected to Shopify or live production reports."
          >
            <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
              <p className="text-sm font-semibold text-clean-green-900">
                Placeholder layout only
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This is a static production demo. No CSV upload, Shopify API,
                Streamlit report logic, production report generation or
                database writes have been added.
              </p>
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Production areas"
          description="Demo workspaces for reviewing the Phase 1 production flow."
          action={<StatusBadge tone="info">Demo navigation</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productionAreas.map((area) => (
              <ModuleCard key={area.href} {...area} />
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
