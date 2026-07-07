import { PageHeader } from "@/components/page-header";
import {
  ActivityItem,
  AlertCard,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";

const productionStats = [
  {
    label: "Meals scheduled",
    value: "4,820",
    helperText: "Across morning prep, assembly, and pack-out windows.",
    badge: "Draft",
    tone: "info" as const,
  },
  {
    label: "Production tasks",
    value: "36",
    helperText: "Open task placeholders for area leads and supervisors.",
    badge: "Planned",
    tone: "success" as const,
  },
];

const costingAlerts = [
  {
    title: "Chicken breast supplier price review",
    description:
      "Placeholder alert for a recent supplier price movement that may need costing review.",
    meta: "Review",
    tone: "warning" as const,
  },
  {
    title: "Packaging carton variance",
    description:
      "Placeholder alert for packaging cost movement awaiting confirmation.",
    meta: "Pending",
    tone: "neutral" as const,
  },
];

const inventoryWarnings = [
  {
    title: "Brown rice approaching reorder point",
    description:
      "Placeholder warning for stock visibility once inventory workflows exist.",
    meta: "Low",
    tone: "warning" as const,
  },
  {
    title: "Meal sleeve stock requires count",
    description:
      "Placeholder warning for packaging inventory and warehouse follow-up.",
    meta: "Count",
    tone: "info" as const,
  },
];

const qaChecks = [
  {
    title: "Cooling log review",
    description:
      "Placeholder for QA checks that will support production sign-off.",
    meta: "Today",
    tone: "success" as const,
  },
  {
    title: "Label verification queue",
    description:
      "Placeholder for label, allergen, and compliance review workflows.",
    meta: "Open",
    tone: "neutral" as const,
  },
];

const purchasingActions = [
  {
    title: "Confirm produce order",
    description:
      "Placeholder action for supplier purchasing once ordering is added.",
    meta: "Due",
    tone: "warning" as const,
  },
  {
    title: "Review approved supplier list",
    description:
      "Placeholder action for supplier records and purchasing governance.",
    meta: "Draft",
    tone: "info" as const,
  },
];

const recentActivity = [
  {
    title: "Production plan placeholder refreshed",
    description: "Morning production view prepared for future scheduling data.",
    meta: "8:15 AM",
  },
  {
    title: "Inventory module placeholder opened",
    description: "Warehouse warning tiles are ready for future stock signals.",
    meta: "Yesterday",
  },
  {
    title: "Costing workspace grouped",
    description: "Costing overview, margins, and price history are now grouped.",
    meta: "Mon",
  },
];

const moduleShortcuts = [
  {
    title: "Production",
    description: "Daily production planning, areas, and task visibility.",
    href: "/production",
    eyebrow: "Operations",
  },
  {
    title: "Inventory",
    description: "Stock warnings, counts, and warehouse readiness.",
    href: "/inventory",
    eyebrow: "Operations",
  },
  {
    title: "Costing Overview",
    description: "Future costing alerts, margin movements, and price changes.",
    href: "/costing-overview",
    eyebrow: "Costings",
  },
  {
    title: "Purchasing",
    description: "Supplier orders, follow-ups, and purchase actions.",
    href: "/purchasing",
    eyebrow: "Operations",
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Command centre for the Clean Eats Hub platform foundation."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 lg:grid-cols-2">
          {productionStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <SectionCard
              title="Today's Production"
              description="High-level production readiness placeholders for the day."
              action={<StatusBadge tone="info">Placeholder</StatusBadge>}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <AlertCard
                  title="Assembly line plan"
                  description="Morning meals, chilled components, and pack-out timing will surface here."
                  meta="Planned"
                  tone="success"
                />
                <AlertCard
                  title="Production area capacity"
                  description="Future area utilisation and handover status will appear in this section."
                  meta="Draft"
                  tone="info"
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Module shortcuts"
              description="Quick entry points for the core operational workspaces."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {moduleShortcuts.map((module) => (
                  <ModuleCard key={module.href} {...module} />
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Recent Activity"
            description="Static activity examples for the Hub shell."
            action={
              <PageActionButton href="/reports" variant="secondary">
                View reports
              </PageActionButton>
            }
          >
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <ActivityItem key={item.title} {...item} />
              ))}
            </div>
          </SectionCard>
        </div>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Costing Alerts"
            description="Future costing exceptions and price movement prompts."
          >
            <div className="space-y-3">
              {costingAlerts.map((alert) => (
                <AlertCard key={alert.title} {...alert} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Inventory Warnings"
            description="Future low stock, count, and replenishment signals."
          >
            <div className="space-y-3">
              {inventoryWarnings.map((alert) => (
                <AlertCard key={alert.title} {...alert} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="QA Checks"
            description="Future quality and compliance review prompts."
          >
            <div className="space-y-3">
              {qaChecks.map((alert) => (
                <AlertCard key={alert.title} {...alert} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Purchasing Actions"
            description="Future purchasing follow-ups and supplier actions."
          >
            <div className="space-y-3">
              {purchasingActions.map((alert) => (
                <AlertCard key={alert.title} {...alert} />
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </>
  );
}
