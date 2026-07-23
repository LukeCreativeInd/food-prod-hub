import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  EmptyState,
  ModuleCard,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { userHasPermission } from "@/lib/auth";
import { getProductsDashboardData } from "@/lib/products-dashboard-data";

const moduleAreas = [
  {
    title: "Suppliers",
    description: "Review supplier master records imported from approved invoices.",
    href: "/suppliers",
    eyebrow: "Products",
  },
  {
    title: "Ingredients",
    description: "Review ingredient internal items, supplier options and approved prices.",
    href: "/ingredients",
    eyebrow: "Products",
  },
  {
    title: "Packaging",
    description: "Review packaging internal items and supplier price coverage.",
    href: "/packaging",
    eyebrow: "Products",
  },
  {
    title: "Components",
    description: "Review component internal items and formula readiness.",
    href: "/components",
    eyebrow: "Products",
  },
  {
    title: "Recipes",
    description: "Review future recipe workspace structure.",
    href: "/recipes",
    eyebrow: "Products",
  },
  {
    title: "Finished Products",
    description: "Review finished product formula records and gaps.",
    href: "/finished-products",
    eyebrow: "Products",
  },
];

function countLabel(value: number) {
  return new Intl.NumberFormat("en-AU").format(value);
}

function attentionTone(value: number) {
  return value > 0 ? ("warning" as const) : ("success" as const);
}

export default async function ProductsPage() {
  const [dashboard, canViewPurchaseDocuments] = await Promise.all([
    getProductsDashboardData(),
    userHasPermission("purchase_documents.view"),
  ]);
  const { counts } = dashboard;

  const summaryCards = [
    {
      label: "Suppliers",
      value: countLabel(counts.suppliers),
      helperText: "Tenant supplier master records available to Products.",
      badge: counts.suppliers > 0 ? "Live data" : "Empty",
      tone: counts.suppliers > 0 ? ("success" as const) : ("neutral" as const),
      icon: "SU",
    },
    {
      label: "Supplier Items",
      value: countLabel(counts.supplierItems),
      helperText: "Supplier catalogue lines committed from reviewed invoice intake.",
      badge: counts.supplierItems > 0 ? "Catalogue" : "Empty",
      tone:
        counts.supplierItems > 0 ? ("success" as const) : ("neutral" as const),
      icon: "SI",
    },
    {
      label: "Internal Items",
      value: countLabel(counts.internalItems),
      helperText: `${countLabel(
        counts.ingredientInternalItems,
      )} ingredients and ${countLabel(counts.packagingInternalItems)} packaging items.`,
      badge: counts.internalItems > 0 ? "Canonical" : "Empty",
      tone:
        counts.internalItems > 0 ? ("success" as const) : ("neutral" as const),
      icon: "II",
    },
    {
      label: "Components",
      value: countLabel(counts.componentFormulas),
      helperText: "Component formula versions currently visible for this tenant.",
      badge: counts.componentFormulas > 0 ? "Formulas" : "No formulas",
      tone:
        counts.componentFormulas > 0
          ? ("info" as const)
          : ("neutral" as const),
      icon: "CP",
    },
    {
      label: "Finished Products",
      value: countLabel(counts.finishedProductFormulas),
      helperText: "Finished product formula versions currently visible.",
      badge: counts.finishedProductFormulas > 0 ? "Formulas" : "No formulas",
      tone:
        counts.finishedProductFormulas > 0
          ? ("info" as const)
          : ("neutral" as const),
      icon: "FP",
    },
  ];

  const attentionCards = [
    {
      title: "Unmapped supplier items",
      description:
        counts.unmappedSupplierItems > 0
          ? "Supplier catalogue lines exist without a confirmed internal item mapping."
          : "Every visible supplier catalogue line has a confirmed internal item mapping.",
      meta: countLabel(counts.unmappedSupplierItems),
      tone: attentionTone(counts.unmappedSupplierItems),
    },
    {
      title: "Items without approved prices",
      description:
        counts.internalItemsWithoutApprovedPrice > 0
          ? "Stock/catalogue internal items exist without a current approved supplier price."
          : "Every visible stock/catalogue internal item has a current approved supplier price.",
      meta: countLabel(counts.internalItemsWithoutApprovedPrice),
      tone: attentionTone(counts.internalItemsWithoutApprovedPrice),
    },
    {
      title: "Formula outputs missing formulas",
      description:
        counts.itemsMissingFormula > 0
          ? "Component or finished product internal items exist without any visible formula version."
          : "Visible component and finished product internal items have formula coverage.",
      meta: countLabel(counts.itemsMissingFormula),
      tone: attentionTone(counts.itemsMissingFormula),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Products"
        description="Manage supplier catalogue items, internal ingredients, packaging, components, recipes and finished products."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
          <SectionCard
            title="Operational health"
            description="Read-only checks from supplier catalogue, mappings, prices and formula records."
            action={<StatusBadge tone="info">Real tenant data</StatusBadge>}
          >
            <div className="space-y-3">
              {attentionCards.map((card) => (
                <AlertCard key={card.title} {...card} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Workspace quick links"
            description="Open the existing Products workspaces. No create/edit flows are added yet."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {moduleAreas.map((area) => (
                <PageActionButton
                  key={area.href}
                  href={area.href}
                  variant="secondary"
                >
                  {area.title}
                </PageActionButton>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Data source"
            description="This dashboard is populated from committed, tenant-scoped records."
          >
            <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
              <p className="text-sm font-semibold text-clean-green-900">
                Supplier Invoice Intake feeds Products
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use Tools to review supplier invoices before committing supplier
                items, internal items, mappings and approved prices. This page
                reads those records only; it does not save changes.
              </p>
              {canViewPurchaseDocuments ? (
                <Link
                  href="/purchase-documents"
                  className="mt-4 inline-flex items-center rounded-md border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-clean-green-800 transition hover:bg-green-50"
                >
                  Open Supplier Invoice Intake
                </Link>
              ) : (
                <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                  Supplier Invoice Intake access is restricted.
                </p>
              )}
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Products workspaces"
          description="Read-only entry points for the current Products module areas."
          action={<StatusBadge tone="success">Existing routes</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {moduleAreas.map((area) => (
              <ModuleCard key={area.href} {...area} />
            ))}
          </div>
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Recent supplier catalogue items"
            description="Latest supplier-facing items committed into the tenant catalogue."
          >
            {dashboard.recentSupplierItems.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentSupplierItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {item.description}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {item.supplierName} · {item.code} · {item.purchaseUnit}
                        </p>
                      </div>
                      <StatusBadge tone="neutral">{item.status}</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Added {item.createdAt}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No supplier items yet"
                description="Use Tools -> Supplier Invoice Intake to import supplier catalogue lines, or add items manually once CRUD is available."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Recent internal items"
            description="Latest canonical items created from reviewed intake or formula preparation."
          >
            {dashboard.recentInternalItems.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentInternalItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {item.displayName}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {item.itemType} · {item.baseUnit}
                        </p>
                      </div>
                      <StatusBadge tone="neutral">{item.status}</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Added {item.createdAt}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No internal items yet"
                description="Reviewed supplier invoice commits can create internal items. Manual internal item maintenance will come later with controlled CRUD."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Recent formulas"
            description="Latest component or finished product formula versions."
          >
            {dashboard.recentFormulaVersions.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentFormulaVersions.map((formula) => (
                  <article
                    key={formula.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {formula.outputItemName}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {formula.formulaType} · {formula.versionName}
                        </p>
                      </div>
                      <StatusBadge tone="neutral">{formula.status}</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Updated {formula.updatedAt}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No formulas yet"
                description="Component and finished product formula records will appear here once reviewed formula data is added."
              />
            )}
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
