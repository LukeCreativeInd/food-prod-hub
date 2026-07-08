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
import { requireAppAccess } from "@/lib/auth";

const summaryCards = [
  {
    label: "Ingredients with cost",
    value: "37",
    helperText: "Sample ingredient cost readiness count.",
    badge: "Sample",
    tone: "info" as const,
    icon: "IN",
  },
  {
    label: "Packaging with cost",
    value: "7",
    helperText: "Placeholder packaging cost coverage.",
    badge: "Linked",
    tone: "success" as const,
    icon: "PK",
  },
  {
    label: "Components costed",
    value: "8",
    helperText: "Static component costing readiness example.",
    badge: "Review",
    tone: "warning" as const,
    icon: "CP",
  },
  {
    label: "Meals needing review",
    value: "6",
    helperText: "Sample meals with missing inputs or margin prompts.",
    badge: "Action",
    tone: "warning" as const,
    icon: "ML",
  },
  {
    label: "Margin alerts",
    value: "4",
    helperText: "Static examples only; no live margin logic yet.",
    badge: "Demo",
    tone: "neutral" as const,
    icon: "%",
  },
];

const readinessItems = [
  {
    title: "Ingredients ready",
    description: "Most sample ingredient costs are linked for review.",
    meta: "37 / 42",
    tone: "success" as const,
  },
  {
    title: "Packaging ready",
    description: "Packaging cost status is visible but not calculated live.",
    meta: "7 / 9",
    tone: "success" as const,
  },
  {
    title: "Components waiting",
    description: "Yield and batch-size data needs staff confirmation.",
    meta: "6 prompts",
    tone: "warning" as const,
  },
  {
    title: "Finished product costing pending",
    description: "Meal costing depends on upstream ingredient and packaging data.",
    meta: "Future",
    tone: "neutral" as const,
  },
];

const costingPrompts = [
  {
    title: "Missing ingredient costs",
    description: "Placeholder prompt for ingredients that need current supplier cost.",
    meta: "Review",
    tone: "warning" as const,
  },
  {
    title: "Packaging cost review",
    description: "Sample alert for sleeves, trays and labels needing confirmation.",
    meta: "Sample",
    tone: "info" as const,
  },
  {
    title: "Component yield missing",
    description: "Batch yield needs to be confirmed before component costs are useful.",
    meta: "Missing",
    tone: "warning" as const,
  },
  {
    title: "Meal margin below target",
    description: "Static demo alert only; no real margin calculation has been added.",
    meta: "Demo",
    tone: "danger" as const,
  },
];

const quickActions = [
  {
    label: "Review missing costs",
    href: "/ingredient-costs",
  },
  {
    label: "Open meal margins",
    href: "/meal-margins",
  },
  {
    label: "Review price history",
    href: "/price-history",
  },
  {
    label: "Export costing review",
  },
];

const costingAreas = [
  {
    title: "Ingredient Costs",
    description: "Review supplier, pack size and current cost placeholders.",
    href: "/ingredient-costs",
    eyebrow: "Costings",
  },
  {
    title: "Packaging Costs",
    description: "Review tray, sleeve, label and dispatch packaging costs.",
    href: "/packaging-costs",
    eyebrow: "Costings",
  },
  {
    title: "Component Costs",
    description: "Review batch recipe, yield and prepared component costs.",
    href: "/component-costs",
    eyebrow: "Costings",
  },
  {
    title: "Meal Margins",
    description: "Review sample finished product cost and margin layouts.",
    href: "/meal-margins",
    eyebrow: "Costings",
  },
  {
    title: "Price History",
    description: "Review sample price movement and impact tracking.",
    href: "/price-history",
    eyebrow: "Costings",
  },
];

export default async function CostingOverviewPage() {
  await requireAppAccess();

  return (
    <AppShell>
      <PageHeader
        title="Costings"
        description="Costing workspace for ingredients, packaging, components, recipes and finished products."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Cost readiness"
            description="Static readiness indicators for staff review."
            action={<StatusBadge tone="info">Sample layout only</StatusBadge>}
          >
            <div className="space-y-3">
              {readinessItems.map((item) => (
                <AlertCard key={item.title} {...item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Alerts and prompts"
            description="Example missing-data and margin prompts."
            action={<StatusBadge tone="warning">No live calculations</StatusBadge>}
          >
            <div className="space-y-3">
              {costingPrompts.map((item) => (
                <AlertCard key={item.title} {...item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Quick actions"
            description="Visual placeholders only. These actions do not save or calculate data yet."
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
        </section>

        <SectionCard
          title="Costing areas"
          description="Demo workspaces for reviewing how costs flow from inputs to finished meals."
          action={<StatusBadge tone="info">Demo navigation</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {costingAreas.map((area) => (
              <ModuleCard key={area.href} {...area} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Sample data notice"
          description="This module is not connected to live costing data."
        >
          <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
            <p className="text-sm font-semibold text-clean-green-900">
              Placeholder layout only
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These cards and prompts are static examples for staff review. No
              real Clean Eats cost data, margin calculations, price history or
              Supabase costing queries have been added.
            </p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
