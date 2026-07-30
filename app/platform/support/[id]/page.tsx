import type { Metadata } from "next";
import Link from "next/link";

import {
  addPlatformInternalNoteAction,
  addPlatformSupportReplyAction,
  assignSupportTicketToMeAction,
  clearSupportTicketAssignmentAction,
  updateSupportTicketCategoryAction,
  updateSupportTicketPriorityAction,
  updateSupportTicketStatusAction,
} from "@/app/platform/support/actions";
import {
  SupportTicketCategoryBadge,
  SupportTicketPriorityBadge,
  SupportTicketStatusBadge,
} from "@/components/support/support-ticket-badges";
import { PlatformStatusBadge } from "@/components/platform/platform-ui";
import {
  getPlatformSupportTicketComments,
  getPlatformSupportTicketDetail,
  getPlatformSupportTicketEvents,
  type PlatformSupportTicketComment,
  type PlatformSupportTicketEvent,
} from "@/lib/platform-support-ticket-data";
import { getSupportModuleLabel } from "@/lib/support-ticket-page-context";
import {
  canPlatformReplyOnStatus,
  formatSupportTicketValue,
  getSupportTicketStatusMetadata,
  supportTicketCategories,
  supportTicketPriorities,
  supportTicketStatuses,
} from "@/lib/support-ticket-types";

export const metadata: Metadata = {
  title: "Platform Support Ticket - EveryBatch",
};

type PlatformSupportTicketPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    support?: string;
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function personLabel(
  person:
    | { full_name: string | null; email: string | null }
    | null
    | undefined,
) {
  return person?.full_name || person?.email || "Not assigned";
}

function getActorName(
  person:
    | PlatformSupportTicketComment["author"]
    | PlatformSupportTicketEvent["actor"],
) {
  return person?.full_name || person?.email || "EveryBatch operator";
}

function getFeedbackMessage(status?: string) {
  switch (status) {
    case "status_updated":
      return { tone: "success", message: "Status updated." };
    case "priority_updated":
      return { tone: "success", message: "Priority updated." };
    case "category_updated":
      return { tone: "success", message: "Category updated." };
    case "assigned":
      return { tone: "success", message: "Ticket assigned to you." };
    case "assignment_cleared":
      return { tone: "success", message: "Ticket assignment cleared." };
    case "reply_added":
      return { tone: "success", message: "Customer-visible reply added." };
    case "internal_note_added":
      return { tone: "success", message: "Internal note added." };
    case "unchanged":
      return { tone: "neutral", message: "No change was needed." };
    case "invalid_reply":
      return { tone: "error", message: "Reply needs at least 2 characters." };
    case "invalid_internal_note":
      return {
        tone: "error",
        message: "Internal note needs at least 2 characters.",
      };
    case "reply_error":
      return {
        tone: "error",
        message:
          "Customer-visible reply could not be saved. Check the server log for the exact Supabase error.",
      };
    case "reply_event_error":
      return {
        tone: "error",
        message:
          "Reply was saved, but the customer-visible timeline event could not be saved. Check the server log before retrying.",
      };
    case "reply_ticket_update_error":
      return {
        tone: "error",
        message:
          "Reply was saved, but ticket activity/status could not be updated. Check the server log before retrying.",
      };
    case "reply_status_event_error":
      return {
        tone: "error",
        message:
          "Reply was saved, but the status change timeline event could not be saved. Check the server log before retrying.",
      };
    case "closed_reply_blocked":
      return {
        tone: "error",
        message:
          "This ticket is closed. Change the status before sending a customer-visible reply.",
      };
    case "internal_note_error":
      return {
        tone: "error",
        message:
          "Internal note could not be saved. Check the server log for the exact Supabase error.",
      };
    case "internal_note_event_error":
      return {
        tone: "error",
        message:
          "Internal note was saved, but the internal timeline event could not be saved. Check the server log before retrying.",
      };
    case "internal_note_ticket_update_error":
      return {
        tone: "error",
        message:
          "Internal note was saved, but ticket activity could not be updated. Check the server log before retrying.",
      };
    case "status_error":
    case "priority_error":
    case "category_error":
    case "assignment_error":
      return {
        tone: "error",
        message:
          "Ticket update failed. Check the server log for the exact Supabase error.",
      };
    case "status_event_error":
    case "priority_event_error":
    case "category_event_error":
    case "assignment_event_error":
      return {
        tone: "error",
        message:
          "Ticket field was updated, but the timeline event could not be saved. Check the server log before retrying.",
      };
    case undefined:
      return null;
    default:
      return {
        tone: "error",
        message:
          "The support action could not be completed cleanly. Please review and try again.",
      };
  }
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  return visibility === "internal" ? (
    <PlatformStatusBadge tone="amber">Internal</PlatformStatusBadge>
  ) : (
    <PlatformStatusBadge tone="green">Customer-visible</PlatformStatusBadge>
  );
}

export default async function PlatformSupportTicketPage({
  params,
  searchParams,
}: PlatformSupportTicketPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const ticket = await getPlatformSupportTicketDetail(id);
  const [comments, events] = ticket
    ? await Promise.all([
        getPlatformSupportTicketComments(ticket.id),
        getPlatformSupportTicketEvents(ticket.id),
      ])
    : [[], []];
  const feedbackMessage = getFeedbackMessage(query.support);
  const statusMetadata = ticket
    ? getSupportTicketStatusMetadata(ticket.status)
    : null;
  const canReply = ticket ? canPlatformReplyOnStatus(ticket.status) : false;
  const relatedModuleLabel = ticket?.related_module_key
    ? getSupportModuleLabel(ticket.related_module_key)
    : null;

  if (!ticket) {
    return (
      <div className="space-y-6 bg-[#F2F4F7] px-5 py-6 md:px-8 md:py-8">
        <Link
          href="/platform/support"
          className="inline-flex text-sm font-bold text-green-900 transition hover:text-green-700"
        >
          Back to Support Inbox
        </Link>
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-950">Ticket not found</p>
          <p className="mt-2 text-sm text-slate-500">
            This ticket may not exist, may be archived or may not be visible to
            the current operator.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#F2F4F7] px-5 py-6 md:px-8 md:py-8">
      <Link
        href="/platform/support"
        className="inline-flex text-sm font-bold text-green-900 transition hover:text-green-700"
      >
        Back to Support Inbox
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <SupportTicketStatusBadge status={ticket.status} />
              <SupportTicketPriorityBadge priority={ticket.priority} />
              <SupportTicketCategoryBadge category={ticket.category} />
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
              {ticket.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {ticket.organisation?.name ?? "Unknown tenant"} /{" "}
              <span className="font-mono">
                {ticket.organisation?.slug ?? ticket.organisation_id}
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p>
              <span className="font-bold text-slate-950">Created by:</span>{" "}
              {personLabel(ticket.createdBy)}
            </p>
            <p>
              <span className="font-bold text-slate-950">Assigned to:</span>{" "}
              {personLabel(ticket.assignedTo)}
            </p>
          </div>
        </div>
      </section>

      {feedbackMessage ? (
        <div
          className={
            feedbackMessage.tone === "error"
              ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900"
              : feedbackMessage.tone === "neutral"
                ? "rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                : "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
          }
        >
          {feedbackMessage.message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Source</p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {formatSupportTicketValue(ticket.source)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Created</p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {formatDateTime(ticket.created_at)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Updated</p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {formatDateTime(ticket.updated_at)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Support activity
          </p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {formatDateTime(ticket.support_last_activity_at)}
          </p>
        </article>
      </section>

      {statusMetadata ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Status workflow
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {statusMetadata.platformMeaning}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PlatformStatusBadge tone={statusMetadata.isTerminal ? "amber" : "green"}>
                {statusMetadata.isTerminal ? "Terminal" : "Active workflow"}
              </PlatformStatusBadge>
              <PlatformStatusBadge tone={canReply ? "green" : "amber"}>
                {canReply ? "Reply allowed" : "Reply blocked"}
              </PlatformStatusBadge>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-slate-950">Description</h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {ticket.description}
            </p>
            {ticket.related_path || ticket.related_module_key ? (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  Related context
                </p>
                {ticket.related_path ? (
                  <p>
                    <span className="font-bold text-slate-950">
                      Related path:
                    </span>{" "}
                    {ticket.related_path}
                  </p>
                ) : null}
                {ticket.related_module_key ? (
                  <p>
                    <span className="font-bold text-slate-950">
                      Related module:
                    </span>{" "}
                    {relatedModuleLabel ?? ticket.related_module_key}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-slate-950">Manage ticket</h3>
            <div className="mt-5 grid gap-4">
              <form action={updateSupportTicketStatusAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="ticket_id" value={ticket.id} />
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Status
                  <select
                    name="status"
                    defaultValue={ticket.status}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                  >
                    {supportTicketStatuses.map((status) => (
                      <option key={status} value={status}>
                        {formatSupportTicketValue(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="self-end rounded-md bg-[#0F2E23] px-4 py-2 text-sm font-bold text-white">
                  Update
                </button>
              </form>

              <form action={updateSupportTicketPriorityAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="ticket_id" value={ticket.id} />
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Priority
                  <select
                    name="priority"
                    defaultValue={ticket.priority}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                  >
                    {supportTicketPriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {formatSupportTicketValue(priority)}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="self-end rounded-md bg-[#0F2E23] px-4 py-2 text-sm font-bold text-white">
                  Update
                </button>
              </form>

              <form action={updateSupportTicketCategoryAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="ticket_id" value={ticket.id} />
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Category
                  <select
                    name="category"
                    defaultValue={ticket.category}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                  >
                    {supportTicketCategories.map((category) => (
                      <option key={category} value={category}>
                        {formatSupportTicketValue(category)}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="self-end rounded-md bg-[#0F2E23] px-4 py-2 text-sm font-bold text-white">
                  Update
                </button>
              </form>

              <div className="flex flex-col gap-3 sm:flex-row">
                <form action={assignSupportTicketToMeAction}>
                  <input type="hidden" name="ticket_id" value={ticket.id} />
                  <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50">
                    Assign to me
                  </button>
                </form>
                <form action={clearSupportTicketAssignmentAction}>
                  <input type="hidden" name="ticket_id" value={ticket.id} />
                  <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50">
                    Clear assignment
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-slate-950">
              Add customer-visible reply
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This reply is visible in the customer support portal.
            </p>
            {canReply ? (
              <form
                action={addPlatformSupportReplyAction}
                className="mt-4 space-y-3"
              >
                <input type="hidden" name="ticket_id" value={ticket.id} />
                <textarea
                  name="body"
                  required
                  minLength={2}
                  rows={4}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                  placeholder="Reply to the customer..."
                />
                <p className="text-xs font-semibold text-slate-500">
                  Replies move open or waiting-on-support tickets to waiting on
                  customer. Planned and resolved tickets keep their status.
                </p>
                <button className="rounded-md bg-[#0F2E23] px-4 py-2 text-sm font-bold text-white">
                  Add customer reply
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-950">
                  Customer replies are blocked
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This ticket is closed. Change the status before sending a
                  customer-visible reply.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-amber-950">
              Add internal note
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Internal notes are visible to Platform Admin only.
            </p>
            <form action={addPlatformInternalNoteAction} className="mt-4 space-y-3">
              <input type="hidden" name="ticket_id" value={ticket.id} />
              <textarea
                name="body"
                required
                minLength={2}
                rows={4}
                className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-slate-950"
                placeholder="Add an internal operator note..."
              />
              <button className="rounded-md bg-amber-900 px-4 py-2 text-sm font-bold text-white">
                Add internal note
              </button>
            </form>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-slate-950">
            Comments and notes
          </h3>
          <div className="mt-5 space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-950">
                      {getActorName(comment.author)}
                    </p>
                    <VisibilityBadge visibility={comment.visibility} />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {formatSupportTicketValue(comment.source)} /{" "}
                    {formatDateTime(comment.created_at)}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {comment.body}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No comments yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-slate-950">Ticket timeline</h3>
          <div className="mt-5 space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <VisibilityBadge visibility={event.visibility} />
                      <PlatformStatusBadge tone="slate">
                        {formatSupportTicketValue(event.event_type)}
                      </PlatformStatusBadge>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      {formatDateTime(event.created_at)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-950">
                    {event.event_summary}
                  </p>
                  {(event.from_value || event.to_value) ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {event.from_value ?? "empty"} {"->"}{" "}
                      {event.to_value ?? "empty"}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {getActorName(event.actor)}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No timeline events yet.</p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
