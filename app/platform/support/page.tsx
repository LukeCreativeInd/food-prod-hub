import type { Metadata } from "next";
import Link from "next/link";

import {
  SupportTicketCategoryBadge,
  SupportTicketPriorityBadge,
  SupportTicketStatusBadge,
} from "@/components/support/support-ticket-badges";
import { PlatformMetricCard, PlatformStatusBadge } from "@/components/platform/platform-ui";
import {
  getPlatformSupportInbox,
  getPlatformSupportInboxSummary,
  getPlatformSupportOrganisations,
} from "@/lib/platform-support-ticket-data";
import { getSupportModuleLabel } from "@/lib/support-ticket-page-context";
import {
  buildSupportTicketQueryString,
  parseSupportTicketFilters,
  parseSupportTicketPage,
  supportTicketPageSize,
} from "@/lib/support-ticket-query";
import {
  formatSupportTicketValue,
  supportTicketCategories,
  supportTicketPriorities,
  supportTicketStatuses,
} from "@/lib/support-ticket-types";

export const metadata: Metadata = {
  title: "Platform Support Inbox - EveryBatch",
};

type PlatformSupportPageProps = {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    category?: string;
    organisationId?: string;
    moduleKey?: string;
    q?: string;
    page?: string;
  }>;
};

const supportModuleFilterOptions = [
  "dashboard",
  "products",
  "components",
  "recipes",
  "finished_products",
  "formulas",
  "costings",
  "component_costs",
  "meal_margins",
  "sell_prices",
  "inventory",
  "purchasing",
  "supplier_invoice_intake",
  "production",
  "qa",
  "logistics",
  "reports",
  "crm",
  "admin",
  "platform_admin",
  "support",
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function personLabel(
  person: { full_name: string | null; email: string | null } | null,
) {
  return person?.full_name || person?.email || "Unassigned";
}

export default async function PlatformSupportPage({
  searchParams,
}: PlatformSupportPageProps) {
  const params = await searchParams;
  const filters = parseSupportTicketFilters(params);
  const pagination = parseSupportTicketPage(params.page, supportTicketPageSize);
  const [inboxPage, summary, organisations] = await Promise.all([
    getPlatformSupportInbox(filters, pagination),
    getPlatformSupportInboxSummary(),
    getPlatformSupportOrganisations(),
  ]);
  const tickets = inboxPage.tickets;
  const totalCount = inboxPage.totalCount ?? 0;
  const showingStart = totalCount > 0 ? pagination.offset + 1 : 0;
  const showingEnd = Math.min(pagination.offset + tickets.length, totalCount);
  const hasPrevious = pagination.page > 1;
  const hasNext = pagination.offset + tickets.length < totalCount;
  const activeFilters = [
    filters.status !== "all"
      ? `Status: ${formatSupportTicketValue(filters.status)}`
      : null,
    filters.priority !== "all"
      ? `Priority: ${formatSupportTicketValue(filters.priority)}`
      : null,
    filters.category !== "all"
      ? `Category: ${formatSupportTicketValue(filters.category)}`
      : null,
    filters.organisationId !== "all"
      ? `Tenant: ${
          organisations.find((organisation) => organisation.id === filters.organisationId)
            ?.name ?? "Selected tenant"
        }`
      : null,
    filters.moduleKey !== "all"
      ? `Module: ${getSupportModuleLabel(filters.moduleKey) ?? filters.moduleKey}`
      : null,
    filters.activeQ ? `Search: ${filters.activeQ}` : null,
  ].filter((filter): filter is string => Boolean(filter));

  return (
    <div className="space-y-6 bg-[#F2F4F7] px-5 py-6 md:px-8 md:py-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <PlatformStatusBadge tone="green">Platform Admin</PlatformStatusBadge>
              <PlatformStatusBadge tone="blue">Customer tickets</PlatformStatusBadge>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Manage EveryBatch support requests across tenants. This inbox
              shows customer-visible replies and internal operator notes for
              platform support workflows.
            </p>
          </div>
          <Link
            href="/support/tickets"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            Customer portal
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlatformMetricCard
          label="Open"
          value={summary.open.toString()}
          detail="Tickets currently open."
        />
        <PlatformMetricCard
          label="Waiting on support"
          value={summary.waitingOnSupport.toString()}
          detail="Customer is waiting for operator action."
        />
        <PlatformMetricCard
          label="Waiting on customer"
          value={summary.waitingOnCustomer.toString()}
          detail="Support has replied or needs customer input."
        />
        <PlatformMetricCard
          label="High / urgent"
          value={summary.highPriority.toString()}
          detail="Tickets marked high or urgent."
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Filters</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Narrow the operator inbox by tenant, status, priority, category,
              module context or title/description search.
            </p>
          </div>
          <PlatformStatusBadge tone="amber">25 per page</PlatformStatusBadge>
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Status
            <select
              name="status"
              defaultValue={filters.status}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
            >
              <option value="all">All statuses</option>
              {supportTicketStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatSupportTicketValue(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Priority
            <select
              name="priority"
              defaultValue={filters.priority}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
            >
              <option value="all">All priorities</option>
              {supportTicketPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {formatSupportTicketValue(priority)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Category
            <select
              name="category"
              defaultValue={filters.category}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
            >
              <option value="all">All categories</option>
              {supportTicketCategories.map((category) => (
                <option key={category} value={category}>
                  {formatSupportTicketValue(category)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Tenant
            <select
              name="organisationId"
              defaultValue={filters.organisationId}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
            >
              <option value="all">All tenants</option>
              {organisations.map((organisation) => (
                <option key={organisation.id} value={organisation.id}>
                  {organisation.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Module
            <select
              name="moduleKey"
              defaultValue={filters.moduleKey}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
            >
              <option value="all">All modules</option>
              {supportModuleFilterOptions.map((moduleKey) => (
                <option key={moduleKey} value={moduleKey}>
                  {getSupportModuleLabel(moduleKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Search
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Title or description"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
            />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[#0F2E23] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#174231]"
            >
              Apply filters
            </button>
            <Link
              href="/platform/support"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Clear
            </Link>
          </div>
        </form>
        {filters.qTooShort ? (
          <p className="mt-3 text-sm font-semibold text-amber-800">
            Search needs at least 2 characters, so it was ignored.
          </p>
        ) : null}
        {activeFilters.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <PlatformStatusBadge key={filter} tone="blue">
                {filter}
              </PlatformStatusBadge>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Ticket list</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Cross-tenant support tickets visible to platform admins.
            </p>
          </div>
          <PlatformStatusBadge tone="blue">
            {totalCount > 0
              ? `Showing ${showingStart}-${showingEnd} of ${totalCount}`
              : "No matches"}
          </PlatformStatusBadge>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <div className="hidden grid-cols-[1.2fr_0.8fr_0.9fr_0.8fr_0.8fr_1fr_0.8fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500 xl:grid">
            <span>Ticket</span>
            <span>Tenant</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Category</span>
            <span>People</span>
            <span>Updated</span>
          </div>
          <div className="divide-y divide-slate-200">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/platform/support/${ticket.id}`}
                  className="grid gap-3 px-4 py-4 text-sm transition hover:bg-slate-50 xl:grid-cols-[1.2fr_0.8fr_0.9fr_0.8fr_0.8fr_1fr_0.8fr]"
                >
                  <div>
                    <p className="font-bold text-slate-950">{ticket.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {ticket.description}
                    </p>
                    {ticket.related_module_key || ticket.related_path ? (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {ticket.related_module_key
                          ? getSupportModuleLabel(ticket.related_module_key)
                          : "Related page"}
                        {ticket.related_path ? ` / ${ticket.related_path}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">
                      {ticket.organisation?.name ?? "Unknown tenant"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {ticket.organisation?.slug ?? ticket.organisation_id}
                    </p>
                  </div>
                  <SupportTicketStatusBadge status={ticket.status} />
                  <SupportTicketPriorityBadge priority={ticket.priority} />
                  <SupportTicketCategoryBadge category={ticket.category} />
                  <div className="text-xs leading-5 text-slate-500">
                    <p>Created by {personLabel(ticket.createdBy)}</p>
                    <p>Assigned to {personLabel(ticket.assignedTo)}</p>
                  </div>
                  <div className="text-xs leading-5 text-slate-500">
                    <p>{formatDateTime(ticket.updated_at)}</p>
                    <p>Created {formatDateTime(ticket.created_at)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-bold text-slate-950">
                  No support tickets match these filters.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Clear filters or wait for customer tickets from the
                  authenticated support portal.
                </p>
                <Link
                  href="/platform/support"
                  className="mt-4 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {totalCount > 0
              ? `Showing ${showingStart}-${showingEnd} of ${totalCount} tickets`
              : "No tickets to show"}
          </p>
          <div className="flex gap-2">
            {hasPrevious ? (
              <Link
                href={`/platform/support${buildSupportTicketQueryString(
                  filters,
                  pagination.page - 1,
                )}`}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400">
                Previous
              </span>
            )}
            {hasNext ? (
              <Link
                href={`/platform/support${buildSupportTicketQueryString(
                  filters,
                  pagination.page + 1,
                )}`}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400">
                Next
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
