import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { AlertCard, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { requirePermissionAccess } from "@/lib/auth";

type SummaryCard = {
  label: string;
  value: string;
  helperText: string;
  badge: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  icon: string;
};

type ProductsWorkspacePageProps = {
  title: string;
  description: string;
  summaryCards: SummaryCard[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: Record<string, string>[];
  badgeColumns?: string[];
  reviewPrompts: string[];
};

export async function ProductsWorkspacePage({
  title,
  description,
  summaryCards,
  tableTitle,
  tableDescription,
  columns,
  rows,
  badgeColumns = [],
  reviewPrompts,
}: ProductsWorkspacePageProps) {
  await requirePermissionAccess("products.view");

  return (
    <AppShell>
      <PageHeader title={title} description={description} />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <SectionCard
          title={tableTitle}
          description={tableDescription}
          action={<StatusBadge tone="info">Sample layout only</StatusBadge>}
        >
          <SampleDataTable
            columns={columns}
            rows={rows}
            badgeColumns={badgeColumns}
          />
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Staff review prompts"
            description="Questions for Tony/team before the database model is locked in."
          >
            <div className="space-y-3">
              {reviewPrompts.map((prompt) => (
                <AlertCard
                  key={prompt}
                  title={prompt}
                  description="Placeholder prompt for terminology, field and workflow review before real product data is imported."
                  meta="To confirm"
                  tone="warning"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Sample data notice"
            description="This page is intentionally not connected to live Products data yet."
          >
            <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
              <p className="text-sm font-semibold text-clean-green-900">
                Placeholder data for staff review
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These records are safe sample rows only. They are here to test
                layout, terminology and required fields before real Clean Eats
                product tables or imports are created.
              </p>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
