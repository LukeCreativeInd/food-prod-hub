import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getUomConversionManagementData } from "@/lib/uom-conversion-data";

type PageProps = {
  searchParams: Promise<{
    uom?: string;
    status?: string;
    scope?: string;
    q?: string;
  }>;
};

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<
    string,
    { tone: "success" | "warning" | "danger" | "info"; text: string }
  > = {
    created: { tone: "success", text: "UOM conversion rule created as draft." },
    updated: { tone: "success", text: "UOM conversion rule updated." },
    active: { tone: "success", text: "UOM conversion rule activated." },
    inactive: { tone: "success", text: "UOM conversion rule deactivated." },
    archived: { tone: "success", text: "UOM conversion rule archived." },
    duplicate_active: {
      tone: "warning",
      text: "An active conversion rule already exists for this scope and unit pair.",
    },
    invalid_quantity: {
      tone: "warning",
      text: "Enter source and target quantities greater than zero.",
    },
    missing_units: {
      tone: "warning",
      text: "Enter both source and target units.",
    },
    same_units: {
      tone: "warning",
      text: "Source and target units must be different.",
    },
    invalid_dates: {
      tone: "warning",
      text: "Effective to date cannot be earlier than effective from date.",
    },
    missing_internal_item: {
      tone: "warning",
      text: "Select an internal item for internal item conversion rules.",
    },
    missing_supplier_item: {
      tone: "warning",
      text: "Select a supplier item for supplier item conversion rules.",
    },
    invalid_internal_item: {
      tone: "warning",
      text: "The selected internal item is not available in this workspace.",
    },
    invalid_supplier: {
      tone: "warning",
      text: "The selected supplier is not available in this workspace.",
    },
    invalid_supplier_item: {
      tone: "warning",
      text: "The selected supplier item is not available in this workspace.",
    },
    not_found: {
      tone: "warning",
      text: "The UOM conversion rule could not be found.",
    },
    error: {
      tone: "danger",
      text: "The UOM conversion action could not be completed. Check permissions and data, then try again.",
    },
  };

  return messages[status] ?? { tone: "info" as const, text: "UOM conversion action finished." };
}

function matchesFilter(
  value: string,
  filter: string | undefined,
  allValue = "all",
) {
  return !filter || filter === allValue || value === filter;
}

export default async function UomConversionsPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([
    getUomConversionManagementData(),
    searchParams,
  ]);
  const message = actionMessage(query.uom);
  const search = query.q?.trim().toLowerCase() ?? "";
  const filteredRules = data.rules.filter((rule) => {
    const matchesStatus = matchesFilter(rule.status, query.status);
    const matchesScope = matchesFilter(rule.ruleScope, query.scope);
    const searchable = [
      rule.contextLabel,
      rule.fromUnit,
      rule.toUnit,
      rule.ruleScopeLabel,
      rule.statusLabel,
      rule.sourceLabel,
      rule.notes,
    ]
      .join(" ")
      .toLowerCase();

    return matchesStatus && matchesScope && (!search || searchable.includes(search));
  });

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>{query.uom ?? "status"}</StatusBadge>
          </div>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <StatusBadge tone="info">Products setup</StatusBadge>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Manage reviewed pack and purchase-unit conversions. Metric units
                such as kg/g and l/ml are handled globally; pack units like bunch,
                box and carton need reviewed rules before future costing,
                receiving and production workflows can rely on them.
              </p>
            </div>
            {data.canCreateUomConversions ? (
              <Link
                className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                href="/uom-conversions/new"
              >
                New conversion rule
              </Link>
            ) : (
              <StatusBadge tone="neutral">Read only</StatusBadge>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total rules"
            value={String(data.summary.totalRules)}
            helperText="Real tenant conversion rules."
            badge="Live"
            tone="info"
            icon="U"
          />
          <StatCard
            label="Active"
            value={String(data.summary.activeRules)}
            helperText="Rules available for future workflow integration."
            badge="Ready"
            tone="success"
            icon="A"
          />
          <StatCard
            label="Draft"
            value={String(data.summary.draftRules)}
            helperText="Entered rules waiting for review/activation."
            badge="Review"
            tone="warning"
            icon="D"
          />
          <StatCard
            label="Supplier item"
            value={String(data.summary.supplierItemRules)}
            helperText="Most specific supplier catalogue rules."
            badge="Specific"
            tone="info"
            icon="SI"
          />
          <StatCard
            label="Internal item"
            value={String(data.summary.internalItemRules)}
            helperText="Rules tied to internal catalogue items."
            badge="Item"
            tone="neutral"
            icon="II"
          />
        </section>

        <SectionCard
          title="Conversion Rule Filters"
          description="Filter real UOM conversion rules without changing data."
          action={<StatusBadge tone="info">Read-only filters</StatusBadge>}
        >
          <form className="grid gap-4 lg:grid-cols-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Status
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={query.status ?? "all"}
                name="status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Scope
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={query.scope ?? "all"}
                name="scope"
              >
                <option value="all">All scopes</option>
                <option value="tenant">Tenant</option>
                <option value="internal_item">Internal item</option>
                <option value="supplier_item">Supplier item</option>
              </select>
            </label>
            <label className="block lg:col-span-2">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Search
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                defaultValue={query.q ?? ""}
                name="q"
                placeholder="Unit, item, supplier or note"
              />
            </label>
            <div className="flex flex-wrap gap-2 lg:col-span-4">
              <button
                className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                type="submit"
              >
                Apply filters
              </button>
              <Link
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/uom-conversions"
              >
                Clear
              </Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="UOM Conversion Rules"
          description="Reviewed rules are source-of-truth interpretation records only. They do not rewrite invoices, formulas, snapshots or stock movements."
          action={<StatusBadge tone="success">Real data</StatusBadge>}
        >
          {data.rules.length === 0 ? (
            <EmptyState
              title="No UOM conversion rules yet"
              description="Create reviewed rules for pack units such as 1 bunch Basil = 100 g, 1 carton Eggs = 180 each, or 1 box Chicken = 10 kg."
            />
          ) : filteredRules.length === 0 ? (
            <EmptyState
              title="No rules match the current filters"
              description="Clear filters or search for a different unit, item or supplier."
            />
          ) : (
            <div className="space-y-3">
              {filteredRules.map((rule) => (
                <article
                  key={rule.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <Link
                        className="text-base font-black text-slate-950 hover:text-[var(--tenant-primary)]"
                        href={`/uom-conversions/${rule.id}`}
                      >
                        {rule.fromQuantity} {rule.fromUnit} = {rule.toQuantity}{" "}
                        {rule.toUnit}
                      </Link>
                      <p className="mt-1 text-sm text-slate-600">
                        {rule.ruleScopeLabel} · {rule.contextLabel}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Factor {rule.conversionFactor} · {rule.allowReverseLabel} · updated {rule.updatedAt}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={rule.tone}>{rule.statusLabel}</StatusBadge>
                      <StatusBadge tone="neutral">{rule.confidenceLabel}</StatusBadge>
                      <StatusBadge tone="info">{rule.sourceLabel}</StatusBadge>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
