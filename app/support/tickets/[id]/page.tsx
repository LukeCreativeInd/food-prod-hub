import type { Metadata } from "next";
import Link from "next/link";

import { addSupportTicketCommentAction } from "@/app/support/tickets/actions";
import {
  SupportTicketCategoryBadge,
  SupportTicketPriorityBadge,
  SupportTicketStatusBadge,
} from "@/components/support/support-ticket-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSupportTicketOrganisationContext } from "@/lib/support-ticket-context";
import {
  getSupportTicketComments,
  getSupportTicketDetail,
  getSupportTicketEvents,
  type SupportTicketComment,
  type SupportTicketEvent,
} from "@/lib/support-ticket-data";
import { formatSupportTicketValue } from "@/lib/support-ticket-types";

export const metadata: Metadata = {
  title: "Support Ticket - EveryBatch",
};

type SupportTicketDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    ticket?: string;
    comment?: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getAuthorName(
  person: SupportTicketComment["author"] | SupportTicketEvent["actor"],
) {
  const author = Array.isArray(person) ? person[0] : person;

  return author?.full_name || author?.email || "EveryBatch user";
}

function getFeedbackMessage({
  ticket,
  comment,
}: {
  ticket?: string;
  comment?: string;
}) {
  if (ticket === "created") {
    return { tone: "success", message: "Ticket created." };
  }

  if (ticket === "created_event_error") {
    return {
      tone: "warning",
      message: "Ticket created, but the timeline event could not be recorded.",
    };
  }

  if (comment === "added") {
    return { tone: "success", message: "Comment added." };
  }

  if (comment === "added_event_error") {
    return {
      tone: "warning",
      message: "Comment added, but the timeline event could not be recorded.",
    };
  }

  if (comment === "ticket_update_error") {
    return {
      tone: "warning",
      message:
        "Comment added, but the ticket activity status could not be updated.",
    };
  }

  if (comment === "invalid_body") {
    return { tone: "error", message: "Comment needs at least 2 characters." };
  }

  if (comment === "error") {
    return {
      tone: "error",
      message: "Could not add the comment. Please try again.",
    };
  }

  return null;
}

export default async function SupportTicketDetailPage({
  params,
  searchParams,
}: SupportTicketDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const ticket = await getSupportTicketDetail(id);
  const [comments, events] = ticket
    ? await Promise.all([
        getSupportTicketComments(ticket.id),
        getSupportTicketEvents(ticket.id),
      ])
    : [[], []];
  const context = ticket
    ? await getSupportTicketOrganisationContext(ticket.organisation_id)
    : null;
  const workspaceName =
    context?.selectedOrganisation?.workspaceName ?? "Current workspace";
  const feedbackMessage = getFeedbackMessage(query);

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/support/tickets"
          className="inline-flex text-sm font-bold text-green-900 transition hover:text-green-700"
        >
          Back to tickets
        </Link>
        <EmptyState
          title="Ticket not found"
          description="This ticket may not exist, may be archived or may not be visible for your workspace."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/support/tickets?organisationId=${ticket.organisation_id}`}
        className="inline-flex text-sm font-bold text-green-900 transition hover:text-green-700"
      >
        Back to tickets
      </Link>

      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <SupportTicketStatusBadge status={ticket.status} />
          <SupportTicketPriorityBadge priority={ticket.priority} />
          <SupportTicketCategoryBadge category={ticket.category} />
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          {ticket.title}
        </h1>
        <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="block text-xs font-bold uppercase text-slate-400">
              Created
            </span>
            {formatDateTime(ticket.created_at)}
          </div>
          <div>
            <span className="block text-xs font-bold uppercase text-slate-400">
              Updated
            </span>
            {formatDateTime(ticket.updated_at)}
          </div>
          {ticket.related_path ? (
            <div className="lg:col-span-2">
              <span className="block text-xs font-bold uppercase text-slate-400">
                Related page or area
              </span>
              {ticket.related_path}
            </div>
          ) : null}
        </div>
      </section>

      {feedbackMessage ? (
        <div
          className={
            feedbackMessage.tone === "error"
              ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900"
              : feedbackMessage.tone === "warning"
                ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
                : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900"
          }
        >
          {feedbackMessage.message}
        </div>
      ) : null}

      <SectionCard title="Workspace">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="info">{workspaceName}</StatusBadge>
          <p className="text-sm leading-6 text-slate-500">
            This ticket is linked to the selected EveryBatch workspace. Only
            customer-visible replies and timeline events are shown here.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Description">
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {ticket.description}
        </p>
      </SectionCard>

      <SectionCard
        title="Comments"
        description="Customer-visible conversation for this support ticket."
      >
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-950">
                    {getAuthorName(comment.author)}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {formatDateTime(comment.created_at)}
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {comment.body}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              No customer-visible comments yet.
            </p>
          )}

          <form action={addSupportTicketCommentAction} className="space-y-3">
            <input type="hidden" name="ticket_id" value={ticket.id} />
            <input
              type="hidden"
              name="organisation_id"
              value={ticket.organisation_id}
            />
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Add a comment
              <textarea
                name="body"
                required
                minLength={2}
                rows={4}
                placeholder="Add an update or reply for support."
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Add comment
            </button>
          </form>
        </div>
      </SectionCard>

      <SectionCard
        title="Timeline"
        description="Customer-visible ticket events. Internal support notes are not shown here."
      >
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone="neutral">
                      {formatSupportTicketValue(event.event_type)}
                    </StatusBadge>
                    <p className="text-sm font-bold text-slate-950">
                      {event.event_summary}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    {formatDateTime(event.created_at)}
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {getAuthorName(event.actor)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-500">
            No customer-visible timeline events yet.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
