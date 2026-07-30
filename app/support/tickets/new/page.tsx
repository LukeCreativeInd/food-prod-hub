import type { Metadata } from "next";
import Link from "next/link";

import { createSupportTicketAction } from "@/app/support/tickets/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSupportTicketOrganisationContext } from "@/lib/support-ticket-context";
import { getSupportTicketContextFromParams } from "@/lib/support-ticket-page-context";
import {
  formatSupportTicketValue,
  isSupportTicketPriority,
  supportTicketCategories,
  supportTicketPriorities,
} from "@/lib/support-ticket-types";

export const metadata: Metadata = {
  title: "New Support Ticket - EveryBatch",
};

type NewSupportTicketPageProps = {
  searchParams: Promise<{
    organisationId?: string;
    relatedPath?: string;
    moduleKey?: string;
    category?: string;
    priority?: string;
    title?: string;
  }>;
};

export default async function NewSupportTicketPage({
  searchParams,
}: NewSupportTicketPageProps) {
  const params = await searchParams;
  const context = await getSupportTicketOrganisationContext(
    params.organisationId,
  );
  const selectedOrganisation = context.selectedOrganisation;
  const pageContext = getSupportTicketContextFromParams({
    relatedPath: params.relatedPath,
    moduleKey: params.moduleKey,
    category: params.category,
  });
  const defaultPriority =
    params.priority && isSupportTicketPriority(params.priority)
      ? params.priority
      : "normal";
  const defaultTitle = params.title?.trim().slice(0, 160) ?? "";
  const titlePlaceholder = pageContext.moduleLabel
    ? `Issue with ${pageContext.moduleLabel}`
    : "Short summary";

  return (
    <div className="space-y-6">
      <Link
        href={
          selectedOrganisation
            ? `/support/tickets?organisationId=${selectedOrganisation.id}`
            : "/support/tickets"
        }
        className="inline-flex text-sm font-bold text-green-900 transition hover:text-green-700"
      >
        Back to tickets
      </Link>

      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Customer portal</StatusBadge>
          <StatusBadge tone="info">New request</StatusBadge>
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          New Support Ticket
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Tell us what you need help with. Ticket submission creates a
          customer-visible request for the selected workspace and marks it as
          waiting on EveryBatch support.
        </p>
      </section>

      {context.selectionReason === "no_membership" ? (
        <EmptyState
          title="No workspace available"
          description="Support tickets need a workspace. Ask an admin to confirm your profile and organisation membership."
        />
      ) : null}

      {pageContext.relatedPath || pageContext.moduleKey ? (
        <SectionCard
          title="Linked page context"
          description="This ticket will include safe page/module context to help EveryBatch support understand where the issue was reported."
        >
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Module
              </p>
              <p className="mt-2 font-semibold text-slate-950">
                {pageContext.moduleLabel ?? "Not detected"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Page
              </p>
              <p className="mt-2 break-words font-mono text-xs text-slate-600">
                {pageContext.relatedPath ?? "Not provided"}
              </p>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Ticket details"
        description="Keep the description practical: what happened, what you expected and which page or workflow was involved."
      >
        <form action={createSupportTicketAction} className="space-y-5">
          {pageContext.relatedPath ? (
            <input
              type="hidden"
              name="related_path"
              value={pageContext.relatedPath}
            />
          ) : null}
          {pageContext.moduleKey ? (
            <input
              type="hidden"
              name="related_module_key"
              value={pageContext.moduleKey}
            />
          ) : null}
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Workspace
              {context.organisations.length > 1 ? (
                <select
                  name="organisation_id"
                  defaultValue={selectedOrganisation?.id ?? ""}
                  required
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Choose workspace</option>
                  {context.organisations.map((organisation) => (
                    <option key={organisation.id} value={organisation.id}>
                      {organisation.workspaceName}
                    </option>
                  ))}
                </select>
              ) : selectedOrganisation ? (
                <>
                  <input
                    type="hidden"
                    name="organisation_id"
                    value={selectedOrganisation.id}
                  />
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {selectedOrganisation.workspaceName}
                  </span>
                </>
              ) : (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  No workspace available
                </span>
              )}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Category
              <select
                name="category"
                defaultValue={pageContext.category}
                required
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                {supportTicketCategories.map((category) => (
                  <option key={category} value={category}>
                    {formatSupportTicketValue(category)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Priority
              <select
                name="priority"
                defaultValue={defaultPriority}
                required
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                {supportTicketPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {formatSupportTicketValue(priority)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Title
            <input
              name="title"
              required
              minLength={3}
              defaultValue={defaultTitle}
              placeholder={titlePlaceholder}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Description
            <textarea
              name="description"
              required
              minLength={10}
              rows={7}
              placeholder="What happened? What did you expect? What page or workflow were you using?"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </label>

          {!pageContext.relatedPath ? (
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Page or area this relates to
              <input
                name="related_path"
                placeholder="/products, /support/guides or a short area name"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </label>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!selectedOrganisation && context.organisations.length === 0}
              className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Create ticket
            </button>
            <Link
              href="/support/tickets"
              className="inline-flex items-center justify-center rounded-md border border-green-200 bg-white px-4 py-2 text-sm font-bold text-green-900 transition hover:bg-green-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
