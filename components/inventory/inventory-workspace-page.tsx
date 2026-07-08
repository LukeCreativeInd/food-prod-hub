import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SampleDataTable } from "@/components/products/sample-data-table";
import { AlertCard, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { requireAppAccess } from "@/lib/auth";

type SummaryCard = {
  label: string;
  value: string;
  helperText: string;
  badge: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  icon: string;
};

type InventoryWorkspacePageProps = {
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

export async function InventoryWorkspacePage({
  title,
  description,
  summaryCards,
  tableTitle,
  tableDescription,
  columns,
  rows,
  badgeColumns = [],
  reviewPrompts,
}: InventoryWorkspacePageProps) {
  await requireAppAccess();

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
          action={<StatusBadge tone="info">Sample inventory data</StatusBadge>}
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
            description="Questions to confirm before stock, batch, purchasing or traceability tables are designed."
          >
            <div className="space-y-3">
              {reviewPrompts.map((prompt) => (
                <AlertCard
                  key={prompt}
                  title={prompt}
                  description="Placeholder prompt for inventory workflow review before live stock data or database tables exist."
                  meta="To confirm"
                  tone="warning"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Sample data notice"
            description="This page is intentionally not connected to live inventory or purchasing data."
          >
            <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
              <p className="text-sm font-semibold text-clean-green-900">
                Placeholder inventory data for staff review
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These rows are static examples only. They preview receiving,
                storage, stock movement, purchasing and traceability concepts
                before real inventory tables, stock logic or database queries
                are created.
              </p>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
