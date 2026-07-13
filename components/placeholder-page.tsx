import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  AlertCard,
  EmptyState,
  PageActionButton,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { requireAppAccess, requirePermissionAccess } from "@/lib/auth";

type PlaceholderPageProps = {
  title: string;
  description: string;
  requiredPermission?: string;
};

export async function PlaceholderPage({
  title,
  description,
  requiredPermission,
}: PlaceholderPageProps) {
  if (requiredPermission) {
    await requirePermissionAccess(requiredPermission);
  } else {
    await requireAppAccess();
  }

  const plannedWorkflows = [
    `${title} overview dashboard`,
    `${title} list and detail views`,
    `${title} review and reporting prompts`,
  ];

  return (
    <AppShell>
      <PageHeader title={title} description={description} />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Screen status"
            value="UI"
            helperText="Placeholder screen for staff review and future workflow planning."
            badge="Sample"
            tone="info"
            icon="UI"
          />
          <StatCard
            label="Data source"
            value="0"
            helperText="No real business data is connected to this page yet."
            badge="No query"
            tone="neutral"
            icon="DB"
          />
          <StatCard
            label="Next action"
            value="Review"
            helperText="Confirm layout, terminology and fields before database work."
            badge="Planned"
            tone="success"
            icon="OK"
          />
        </section>

        <SectionCard
          title={`${title} workspace`}
          description={description}
          action={
            <PageActionButton href="/dashboard" variant="secondary">
              Back to dashboard
            </PageActionButton>
          }
        >
          <EmptyState
            title={`${title} is ready for a future workflow`}
            description="This module is currently a design-system placeholder. No real data, business logic, authentication, database schema, or calculations have been added."
          />
        </SectionCard>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Coming next"
            description="Planned screen patterns for this module when it moves beyond placeholder state."
            action={<StatusBadge tone="info">Future workflow</StatusBadge>}
          >
            <div className="space-y-3">
              {plannedWorkflows.map((workflow) => (
                <AlertCard
                  key={workflow}
                  title={workflow}
                  description="This is a visual planning item only. Final fields and workflow rules will be confirmed before real data is connected."
                  meta="Planned"
                  tone="neutral"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Review prompts"
            description="Questions to answer before this module receives real tables or data."
          >
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Question</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {[
                    "Which fields matter every day?",
                    "Who should be able to edit this?",
                    "What should staff see on tablet screens?",
                  ].map((question) => (
                    <tr key={question}>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {question}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone="warning">To confirm</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
