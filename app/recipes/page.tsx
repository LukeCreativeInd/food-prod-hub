import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";

const recipeReadinessItems = [
  {
    title: "Finished product formulas",
    description:
      "Meal and SKU structures are currently managed through finished product formula records.",
    href: "/finished-products",
    cta: "Open finished products",
  },
  {
    title: "Component formulas",
    description:
      "Reusable prep batches and sub-recipes are represented as component internal items with formula lines.",
    href: "/components",
    cta: "Open components",
  },
  {
    title: "Costing readiness",
    description:
      "Recipe costs stay blocked until formula inputs have approved supplier prices and compatible units.",
    href: "/component-costs",
    cta: "Review costs",
  },
];

export default function RecipesPage() {
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Recipe records"
            value="0"
            helperText="No separate recipe table is connected yet."
            badge="Not live"
            tone="neutral"
            icon="RC"
          />
          <StatCard
            label="Formula source"
            value="Formulas"
            helperText="Use component and finished product formula builders for current real data."
            badge="Live path"
            tone="info"
            icon="FM"
          />
          <StatCard
            label="Operational risk"
            value="Medium"
            helperText="Recipe terminology still needs to settle before inventory and production depend on it."
            badge="Review"
            tone="warning"
            icon="!"
          />
        </section>

        <SectionCard
          title="Recipes data model"
          description="Recipes are not a separate saved record type yet. Current recipe-like data lives in formulas."
          action={<StatusBadge tone="warning">Scaffold only</StatusBadge>}
        >
          <EmptyState
            title="No separate recipe records are connected"
            description="This page now avoids sample recipe rows. Use Finished Products for meal/SKU formulas and Components for reusable prep formulas until a dedicated recipe model is reviewed."
            action={
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                  href="/finished-products"
                >
                  Finished products
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  href="/components"
                >
                  Components
                </Link>
              </div>
            }
          />
        </SectionCard>

        <SectionCard
          title="Current direction"
          description="Use this page as a signpost until recipe terminology and production links are reviewed."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {recipeReadinessItems.map((item) => (
              <article
                className="rounded-md border border-slate-200 bg-slate-50/70 p-4"
                key={item.title}
              >
                <h4 className="text-sm font-semibold text-slate-950">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
                <Link
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--tenant-primary)] hover:underline"
                  href={item.href}
                >
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
