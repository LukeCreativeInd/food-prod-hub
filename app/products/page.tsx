import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  ActivityItem,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

const summaryCards = [
  {
    label: "Suppliers",
    value: "6",
    helperText: "Supplier placeholders collected before product data import.",
    badge: "Sample",
    tone: "info" as const,
    icon: "SU",
  },
  {
    label: "Ingredients",
    value: "42",
    helperText: "Sample raw material records for screen review.",
    badge: "Sample",
    tone: "info" as const,
    icon: "IN",
  },
  {
    label: "Packaging",
    value: "9",
    helperText: "Packaging records for sleeves, trays, cartons and labels.",
    badge: "Review",
    tone: "warning" as const,
    icon: "PK",
  },
  {
    label: "Components",
    value: "14",
    helperText: "Batch recipes, mixes and prepared component placeholders.",
    badge: "Draft",
    tone: "neutral" as const,
    icon: "CP",
  },
  {
    label: "Recipes",
    value: "18",
    helperText: "Recipe structure placeholders linking inputs to outputs.",
    badge: "New",
    tone: "info" as const,
    icon: "RC",
  },
  {
    label: "Finished Products",
    value: "28",
    helperText: "Sellable/output item placeholders for production and sales.",
    badge: "Sample",
    tone: "success" as const,
    icon: "FP",
  },
  {
    label: "Setup prompts",
    value: "5",
    helperText: "Missing data prompts for staff review before real imports.",
    badge: "To confirm",
    tone: "warning" as const,
    icon: "!",
  },
];

const moduleAreas = [
  {
    title: "Suppliers",
    description: "Supplier records collected before ingredients and packaging.",
    href: "/suppliers",
    eyebrow: "Products",
  },
  {
    title: "Ingredients",
    description: "Raw materials used across meals, components and production.",
    href: "/ingredients",
    eyebrow: "Products",
  },
  {
    title: "Packaging",
    description: "Trays, sleeves, labels, cartons and related materials.",
    href: "/packaging",
    eyebrow: "Products",
  },
  {
    title: "Components",
    description: "Batch recipes, mixes and prepared components.",
    href: "/components",
    eyebrow: "Products",
  },
  {
    title: "Recipes",
    description: "Recipe definitions linking components, ingredients and packaging.",
    href: "/recipes",
    eyebrow: "Products",
  },
  {
    title: "Finished Products",
    description: "Sellable/output items produced from recipes.",
    href: "/finished-products",
    eyebrow: "Products",
  },
];

const recentUpdates = [
  {
    title: "Products skeleton created",
    description:
      "Overview, suppliers, ingredients, packaging, components, recipes and finished products are ready for staff review.",
    meta: "Step 042",
  },
  {
    title: "Terminology review needed",
    description:
      "Components, batch recipes, recipes and finished products need Tony/team confirmation.",
    meta: "Review",
  },
  {
    title: "No live data connected",
    description:
      "All Products module records are sample placeholders until database tables are planned.",
    meta: "Safe",
  },
];

export default async function ProductsPage() {
  await requirePermissionAccess("products.view");

  return (
    <AppShell>
      <PageHeader
        title="Products"
        description="Product data foundation for suppliers, ingredients, packaging, components, recipes and finished products."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Quick actions"
            description="Visual placeholders only. These actions do not save data yet."
            action={<StatusBadge tone="info">Placeholder</StatusBadge>}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Add Supplier",
                "Add Ingredient",
                "Add Packaging",
                "Add Component",
                "Add Recipe",
                "Add Finished Product",
              ].map((action) => (
                <PageActionButton key={action} variant="secondary">
                  {action}
                </PageActionButton>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Recent updates"
            description="Sample activity for the Products module foundation."
          >
            <div className="space-y-4">
              {recentUpdates.map((item) => (
                <ActivityItem key={item.title} {...item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Setup prompts"
            description="Questions to answer before real Products data is modelled."
          >
            <div className="space-y-3">
              {[
                "Confirm whether Components means batch recipes, mixes or both.",
                "Confirm how Recipes differ from Components and Finished Products.",
                "Confirm required supplier and packaging fields.",
                "Confirm which missing data warnings matter first.",
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                  {prompt}
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Module areas"
          description="Products module workspaces for staff terminology and layout review."
          action={<StatusBadge tone="info">Sample layout only</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {moduleAreas.map((area) => (
              <ModuleCard key={area.href} {...area} />
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
