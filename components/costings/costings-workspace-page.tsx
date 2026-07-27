import { AppShell } from "@/components/app-shell";
import {
  type DataTableCell,
  SampleDataTable,
} from "@/components/products/sample-data-table";
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

type CostingsWorkspacePageProps = {
  title: string;
  description: string;
  summaryCards: SummaryCard[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: Record<string, DataTableCell>[];
  badgeColumns?: string[];
  reviewPrompts: string[];
  dataBadge?: string;
  dataNoticeTitle?: string;
  dataNoticeDescription?: string;
  emptyMessage?: string;
};

export async function CostingsWorkspacePage({
  title,
  description,
  summaryCards,
  tableTitle,
  tableDescription,
  columns,
  rows,
  badgeColumns = [],
  reviewPrompts,
  dataBadge = "Read-only",
  dataNoticeTitle = "Read-only costing visibility",
  dataNoticeDescription = "This page is for costing visibility and readiness review only. It does not save changes or perform costing write actions.",
  emptyMessage,
}: CostingsWorkspacePageProps) {
  await requirePermissionAccess("costings.view");

  return (
    <AppShell>
      <div
        className="space-y-6 px-5 py-6 md:px-8"
        aria-label={`${title}: ${description}`}
      >
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <SectionCard
          title={tableTitle}
          description={tableDescription}
          action={<StatusBadge tone="info">{dataBadge}</StatusBadge>}
        >
          <SampleDataTable
            columns={columns}
            rows={rows}
            badgeColumns={badgeColumns}
            emptyMessage={emptyMessage}
          />
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Staff review prompts"
            description="Questions to answer before real cost tables or calculations are designed."
          >
            <div className="space-y-3">
              {reviewPrompts.map((prompt) => (
                <AlertCard
                  key={prompt}
                  title={prompt}
                  description="Review question for costing visibility, missing data and future calculation rules."
                  meta="To confirm"
                  tone="warning"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Data notice"
            description="This page stays read-only and does not perform write actions."
          >
            <div className="rounded-md border border-green-200 bg-green-50/60 px-4 py-4">
              <p className="text-sm font-semibold text-clean-green-900">
                {dataNoticeTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {dataNoticeDescription}
              </p>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
