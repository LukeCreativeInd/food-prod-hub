import { Suspense } from "react";
import Link from "next/link";

import { AuthContextStatus } from "@/components/auth/auth-context-status";
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
import { getCostingsDashboardData } from "@/lib/costings-dashboard-data";
import { getDashboardSummaryData } from "@/lib/dashboard-summary-data";
import { getInventoryLocationsPageData } from "@/lib/inventory-locations-data";
import {
  getPurchaseDocumentsForCurrentOrganisation,
  type PurchaseDocumentSummary,
} from "@/lib/purchase-document-intake";
import { getProductsDashboardData } from "@/lib/products-dashboard-data";
import { getProductionDashboardData } from "@/lib/production-dashboard-data";

function countLabel(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Hidden";
  }

  return new Intl.NumberFormat("en-AU").format(value);
}

function attentionTone(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "neutral" as const;
  }

  return value > 0 ? ("warning" as const) : ("success" as const);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function documentTone(status: string) {
  if (status === "committed" || status === "ready_to_commit") {
    return "success" as const;
  }

  if (status === "failed" || status === "rejected") {
    return "danger" as const;
  }

  if (status === "uploaded" || status === "processing") {
    return "info" as const;
  }

  return "warning" as const;
}

function recentPurchaseDocuments(documents: PurchaseDocumentSummary[]) {
  return documents.slice(0, 4).map((document) => ({
    id: document.id,
    title: document.invoice_number ?? document.original_filename,
    supplier:
      document.supplier_display_name ??
      document.supplier_trading_name_source ??
      document.supplier_legal_name_source ??
      "Supplier not linked",
    status: document.status,
  }));
}

function DeferredSectionFallback({ label }: { label: string }) {
  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="h-4 w-44 rounded bg-slate-100" />
      <div className="mt-3 h-3 w-full max-w-xl rounded bg-slate-100" />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 rounded-md border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
    </section>
  );
}

async function DashboardDeferredSections({
  permissionKeys,
}: {
  permissionKeys: string[];
}) {
  const hasPermission = (permission: string) => permissionKeys.includes(permission);

  const [
    productsData,
    costingsData,
    productionData,
    inventoryData,
    purchaseDocuments,
  ] = await Promise.all([
    hasPermission("products.view") ? getProductsDashboardData() : null,
    hasPermission("costings.view") ? getCostingsDashboardData() : null,
    hasPermission("production.view") ? getProductionDashboardData() : null,
    hasPermission("inventory.view") ? getInventoryLocationsPageData() : null,
    hasPermission("purchase_documents.view")
      ? getPurchaseDocumentsForCurrentOrganisation()
      : Promise.resolve([]),
  ]);

  const productsCounts = productsData?.counts;
  const costingsCounts = costingsData?.counts;
  const productionCounts = productionData?.counts;
  const inventoryCounts = inventoryData?.counts;
  const pendingPurchaseDocuments = purchaseDocuments.filter(
    (document) => document.status !== "committed",
  );
  const committedPurchaseDocuments = purchaseDocuments.filter(
    (document) => document.status === "committed",
  );

  const moduleCards = [
    {
      title: "Products",
      description:
        productsCounts
          ? `${countLabel(productsCounts.suppliers)} suppliers, ${countLabel(
              productsCounts.internalItems,
            )} internal items and ${countLabel(
              productsCounts.supplierItems,
            )} supplier catalogue items are visible.`
          : "Products visibility is restricted for this role.",
      href: "/products",
      eyebrow: productsCounts ? "Real setup data" : "Restricted",
    },
    {
      title: "Costings",
      description:
        costingsCounts
          ? `${countLabel(
              costingsCounts.approvedSupplierPriceCount,
            )} approved prices and ${countLabel(
              costingsCounts.internalItemsWithoutApprovedPriceCount,
            )} missing price gaps are visible.`
          : "Costings visibility is restricted for this role.",
      href: "/costing-overview",
      eyebrow: costingsCounts ? "Readiness" : "Restricted",
    },
    {
      title: "Inventory",
      description:
        inventoryCounts
          ? `${countLabel(inventoryCounts.active)} active locations, including ${countLabel(
              inventoryCounts.storage,
            )} storage and ${countLabel(
              inventoryCounts.production,
            )} production locations.`
          : "Inventory visibility is restricted for this role.",
      href: "/inventory",
      eyebrow: inventoryCounts ? "Location setup" : "Restricted",
    },
    {
      title: "Production",
      description:
        productionCounts
          ? `${countLabel(
              productionCounts.productionLocationCount,
            )} production locations, ${countLabel(
              productionCounts.componentFormulaCount,
            )} component formulas and ${countLabel(
              productionCounts.finishedProductFormulaCount,
            )} finished formulas are visible.`
          : "Production visibility is restricted for this role.",
      href: "/production",
      eyebrow: productionCounts ? "Planning readiness" : "Restricted",
    },
    ...(hasPermission("purchase_documents.view")
      ? [
          {
            title: "Tools",
            description: `${countLabel(
              pendingPurchaseDocuments.length,
            )} supplier invoice document(s) currently need review. Intake is an onboarding/import pathway only.`,
            href: "/purchase-documents",
            eyebrow: "Supplier Invoice Intake",
          },
        ]
      : []),
  ];

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <SectionCard
          title="Readiness and attention"
          description="Setup gaps based on current tenant records only. No stock, QA, delivery or production metrics are invented here."
          action={<StatusBadge tone="info">Real setup signals</StatusBadge>}
        >
          <div className="space-y-3">
            <AlertCard
              title="Internal items missing approved prices"
              description="Priceable internal items without a current approved supplier price."
              meta={countLabel(
                costingsCounts?.internalItemsWithoutApprovedPriceCount,
              )}
              tone={attentionTone(
                costingsCounts?.internalItemsWithoutApprovedPriceCount,
              )}
            />
            <AlertCard
              title="Missing component formulas"
              description="Component formula count available for future production and costing readiness."
              meta={countLabel(productsCounts?.componentFormulas)}
              tone={
                productsCounts
                  ? productsCounts.componentFormulas > 0
                    ? "success"
                    : "warning"
                  : "neutral"
              }
            />
            <AlertCard
              title="Missing finished product formulas"
              description="Finished product formula count available for future meal planning readiness."
              meta={countLabel(productsCounts?.finishedProductFormulas)}
              tone={
                productsCounts
                  ? productsCounts.finishedProductFormulas > 0
                    ? "success"
                    : "warning"
                  : "neutral"
              }
            />
            <AlertCard
              title="Inventory location setup"
              description="Active stock locations exist before stock movements or goods receiving are introduced."
              meta={countLabel(inventoryCounts?.active)}
              tone={
                inventoryCounts
                  ? inventoryCounts.active > 0
                    ? "success"
                    : "warning"
                  : "neutral"
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Module overview"
          description="Open the current Phase 1 real-data dashboards and setup areas."
          action={<StatusBadge tone="success">Phase 1 foundation</StatusBadge>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {moduleCards.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Supplier Invoice Intake"
          description="An onboarding and bulk import route for reviewed supplier documents, not the permanent source of truth."
          action={
            <StatusBadge
              tone={hasPermission("purchase_documents.view") ? "info" : "warning"}
            >
              {hasPermission("purchase_documents.view")
                ? "Tools access"
                : "Restricted"}
            </StatusBadge>
          }
        >
          {hasPermission("purchase_documents.view") ? (
            <div className="space-y-3">
              <AlertCard
                title="Documents needing review"
                description="Uploaded or extracted documents that have not yet been committed."
                meta={countLabel(pendingPurchaseDocuments.length)}
                tone={pendingPurchaseDocuments.length > 0 ? "warning" : "success"}
              />
              <AlertCard
                title="Committed import documents"
                description="Reviewed documents that created or reused supplier, item, mapping and price records."
                meta={countLabel(committedPurchaseDocuments.length)}
                tone="info"
              />
              <PageActionButton href="/purchase-documents" variant="secondary">
                Open Supplier Invoice Intake
              </PageActionButton>
            </div>
          ) : (
            <EmptyState
              title="Supplier Invoice Intake is restricted"
              description="This role can use the dashboard without viewing uploaded supplier invoice documents."
            />
          )}
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Recent supplier catalogue items"
          description="Latest supplier-facing items visible through Products."
        >
          {productsData?.recentSupplierItems.length ? (
            <div className="space-y-3">
              {productsData.recentSupplierItems.slice(0, 4).map((item) => (
                <article
                  key={item.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="break-words text-sm font-semibold text-slate-950">
                    {item.description}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.supplierName} · {item.code} · {item.purchaseUnit}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No supplier items visible"
              description="Supplier catalogue activity will appear here once records exist and this role can read Products."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Recent approved prices"
          description="Current prices visible through Costings."
        >
          {costingsData?.recentApprovedPrices.length ? (
            <div className="space-y-3">
              {costingsData.recentApprovedPrices.slice(0, 4).map((price) => (
                <article
                  key={price.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-950">
                        {price.itemName}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {price.supplierName} · {price.unit}
                      </p>
                    </div>
                    <StatusBadge tone="success">{price.price}</StatusBadge>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No approved prices visible"
              description="Approved price activity will appear here once current prices exist and this role can read Costings."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Recent intake documents"
          description="Recent supplier invoice review documents where Tools access is available."
        >
          {hasPermission("purchase_documents.view") &&
          purchaseDocuments.length > 0 ? (
            <div className="space-y-3">
              {recentPurchaseDocuments(purchaseDocuments).map((document) => (
                <Link
                  key={document.id}
                  href={`/purchase-documents/${document.id}`}
                  className="block rounded-md border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-green-200 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-clean-green-700">
                        {document.title}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {document.supplier}
                      </p>
                    </div>
                    <StatusBadge tone={documentTone(document.status)}>
                      {formatStatus(document.status)}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No intake documents visible"
              description="Recent supplier invoice review documents will appear here for roles with Tools access."
            />
          )}
        </SectionCard>
      </section>
    </>
  );
}

async function DashboardAuthStatusSection() {
  return (
    <div className="pt-2">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">
            Development/admin status
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Temporary technical status kept lower on the dashboard while auth
            and access setup is reviewed.
          </p>
        </div>
        <StatusBadge tone="info">Admin check</StatusBadge>
      </div>
      <AuthContextStatus />
    </div>
  );
}

export default async function DashboardPage() {
  const summary = await getDashboardSummaryData();

  return (
    <>
      <PageHeader
        variant="compact"
        title="Dashboard"
        description="A real Phase 1 setup overview for Products, Costings, Inventory, Production and controlled supplier invoice intake."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Suppliers"
            value={countLabel(summary.counts.suppliers)}
            helperText="Tenant supplier master records currently visible."
            badge={summary.counts.suppliers !== null ? "Live" : "Restricted"}
            tone={summary.counts.suppliers !== null ? "success" : "neutral"}
            icon="SU"
          />
          <StatCard
            label="Internal items"
            value={countLabel(summary.counts.internalItems)}
            helperText="Canonical ingredient, packaging, component and finished product records."
            badge={summary.counts.internalItems !== null ? "Catalogue" : "Restricted"}
            tone={summary.counts.internalItems !== null ? "success" : "neutral"}
            icon="II"
          />
          <StatCard
            label="Approved prices"
            value={countLabel(summary.counts.approvedPrices)}
            helperText="Current approved supplier prices available for costing review."
            badge={summary.counts.approvedPrices !== null ? "Current" : "Restricted"}
            tone={summary.counts.approvedPrices !== null ? "success" : "neutral"}
            icon="$"
          />
          <StatCard
            label="Stock locations"
            value={countLabel(summary.counts.stockLocations)}
            helperText="Active inventory locations available for future stock workflows."
            badge={summary.counts.stockLocations !== null ? "Setup" : "Restricted"}
            tone={summary.counts.stockLocations !== null ? "info" : "neutral"}
            icon="LO"
          />
        </section>

        <Suspense fallback={<DeferredSectionFallback label="Loading setup signals" />}>
          <DashboardDeferredSections permissionKeys={summary.permissionKeys} />
        </Suspense>

        <Suspense fallback={<DeferredSectionFallback label="Loading admin status" />}>
          <DashboardAuthStatusSection />
        </Suspense>
      </div>
    </>
  );
}
