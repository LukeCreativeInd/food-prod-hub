import type { Metadata } from "next";
import Link from "next/link";

import {
  SupportTicketCategoryBadge,
  SupportTicketPriorityBadge,
  SupportTicketStatusBadge,
} from "@/components/support/support-ticket-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSupportTicketOrganisationContext } from "@/lib/support-ticket-context";
import { getSupportTicketsForOrganisation } from "@/lib/support-ticket-data";

export const metadata: Metadata = {
  title: "Support Tickets - EveryBatch",
};

type SupportTicketsPageProps = {
  searchParams: Promise<{
    organisationId?: string;
    ticket?: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusMessage(status?: string) {
  switch (status) {
    case "invalid_title":
      return "Ticket title needs at least 3 characters.";
    case "invalid_description":
      return "Ticket description needs at least 10 characters.";
    case "invalid_category":
      return "Choose a valid support category.";
    case "invalid_priority":
      return "Choose a valid priority.";
    case "create_error":
      return "Could not create the support ticket. Please try again.";
    case "invalid_organisation":
      return "Choose a valid workspace before creating a ticket.";
    default:
      return null;
  }
}

export default async function SupportTicketsPage({
  searchParams,
}: SupportTicketsPageProps) {
  const params = await searchParams;
  const context = await getSupportTicketOrganisationContext(
    params.organisationId,
  );
  const selectedOrganisation = context.selectedOrganisation;
  const tickets = selectedOrganisation
    ? await getSupportTicketsForOrganisation(selectedOrganisation.id)
    : [];
  const statusMessage = getStatusMessage(params.ticket);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Customer portal</StatusBadge>
          <StatusBadge tone="info">Support tickets</StatusBadge>
        </div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Support Tickets
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Track questions, bugs and requests for your EveryBatch workspace.
              This customer portal shows customer-visible tickets, comments and
              timeline events.
            </p>
          </div>
          {selectedOrganisation ? (
            <Link
              href={`/support/tickets/new?organisationId=${selectedOrganisation.id}`}
              className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
            >
              New ticket
            </Link>
          ) : null}
        </div>
      </section>

      {statusMessage ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {statusMessage}
        </div>
      ) : null}

      {context.selectionReason === "no_membership" ? (
        <EmptyState
          title="No workspace available"
          description="Support tickets are linked to a workspace. Ask an admin to confirm your profile and organisation membership."
          action={
            <Link
              href="/support/contact"
              className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Contact support
            </Link>
          }
        />
      ) : null}

      {!selectedOrganisation && context.organisations.length > 1 ? (
        <SectionCard
          title="Choose a workspace"
          description="Select the workspace whose tickets you want to view."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {context.organisations.map((organisation) => (
              <Link
                key={organisation.id}
                href={`/support/tickets?organisationId=${organisation.id}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50"
              >
                <h2 className="text-sm font-bold text-slate-950">
                  {organisation.workspaceName}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {organisation.name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge tone={organisation.isMember ? "success" : "info"}>
                    {organisation.isMember ? "Member" : "Platform access"}
                  </StatusBadge>
                </div>
              </Link>
            ))}
          </div>
          {context.isPlatformAdmin ? (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Platform Admin Support Inbox is planned next. This page is the
              customer-facing ticket view for a selected workspace.
            </p>
          ) : null}
        </SectionCard>
      ) : null}

      {selectedOrganisation ? (
        <SectionCard
          title={`${selectedOrganisation.workspaceName} tickets`}
          description="Customer-visible support records for this workspace."
          action={
            context.organisations.length > 1 ? (
              <Link
                href="/support/tickets"
                className="text-sm font-bold text-green-900 transition hover:text-green-700"
              >
                Change workspace
              </Link>
            ) : null
          }
        >
          {tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/support/tickets/${ticket.id}`}
                  className="block rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-950">
                        {ticket.title}
                      </h2>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Updated {formatDateTime(ticket.updated_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SupportTicketStatusBadge status={ticket.status} />
                      <SupportTicketPriorityBadge priority={ticket.priority} />
                      <SupportTicketCategoryBadge category={ticket.category} />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Created {formatDateTime(ticket.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No support tickets yet"
              description="Create a ticket when you need help with access, product data, costings, invoice intake or another EveryBatch workflow."
              action={
                <Link
                  href={`/support/tickets/new?organisationId=${selectedOrganisation.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
                >
                  New ticket
                </Link>
              }
            />
          )}
        </SectionCard>
      ) : null}
    </div>
  );
}
