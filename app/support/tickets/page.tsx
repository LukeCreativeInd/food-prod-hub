import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  supportTicketCategories,
  supportTicketPriorities,
  supportTicketStatuses,
} from "@/lib/support-ticket-types";

export const metadata: Metadata = {
  title: "Support Tickets - EveryBatch",
};

function formatSupportValue(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="warning">Coming soon</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Support Tickets
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Ticket submission and tracking are coming next. The ticket foundation
          is prepared, but this page does not submit, update or store tickets
          yet. For now, use your existing support channel.
        </p>
      </section>

      <EmptyState
        title="Ticket submission coming soon"
        description="No ticket form, inbox, email workflow or file attachment flow is active on this page yet."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Planned statuses"
          description="Future ticket workflow states for support triage."
        >
          <div className="flex flex-wrap gap-2">
            {supportTicketStatuses.map((status) => (
              <StatusBadge key={status}>{formatSupportValue(status)}</StatusBadge>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Planned categories"
          description="Likely first-pass support ticket categories."
        >
          <div className="flex flex-wrap gap-2">
            {supportTicketCategories.map((category) => (
              <StatusBadge key={category} tone="info">
                {formatSupportValue(category)}
              </StatusBadge>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Planned priorities"
          description="Priority labels prepared for the future ticket flow."
        >
          <div className="flex flex-wrap gap-2">
            {supportTicketPriorities.map((priority) => (
              <StatusBadge key={priority} tone="warning">
                {formatSupportValue(priority)}
              </StatusBadge>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
