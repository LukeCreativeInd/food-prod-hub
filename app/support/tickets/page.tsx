import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Support Tickets - EveryBatch",
};

const plannedTicketStatuses = [
  "New",
  "Triaged",
  "In progress",
  "Waiting on customer",
  "Resolved",
];

const plannedTicketCategories = [
  "Access",
  "Supplier Invoice Intake",
  "Products",
  "Costings",
  "Formula Builder",
  "Production",
  "Inventory",
  "Platform Admin",
];

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="warning">Coming soon</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Support Tickets
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Ticket submission and tracking are planned for a later build. This
          page confirms the authenticated support route and outlines the future
          ticket structure without saving data.
        </p>
      </section>

      <EmptyState
        title="Ticket submission coming soon"
        description="No support ticket records, forms, actions or attachments are created in this scaffold."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Planned statuses"
          description="Future ticket workflow states for support triage."
        >
          <div className="flex flex-wrap gap-2">
            {plannedTicketStatuses.map((status) => (
              <StatusBadge key={status}>{status}</StatusBadge>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Planned categories"
          description="Likely first-pass support ticket categories."
        >
          <div className="flex flex-wrap gap-2">
            {plannedTicketCategories.map((category) => (
              <StatusBadge key={category} tone="info">
                {category}
              </StatusBadge>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
