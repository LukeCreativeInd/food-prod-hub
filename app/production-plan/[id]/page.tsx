import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addProductionPlanLineAction,
  createProductionBatchFromLineAction,
  updateProductionPlanStatusAction,
} from "@/app/production-plan/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { fetchProductionPlanDetail } from "@/lib/production-plan-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    plan?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Production Plan Detail - EveryBatch",
};

function getActionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    created: "Production plan created.",
    line_added: "Planned output line added.",
    batch_created: "Planned batch created.",
    status_updated: "Production plan status updated.",
    missing_plan: "Production plan was missing.",
    missing_item: "Choose a finished product or component output item.",
    invalid_item: "Production Plan v1 only allows finished products and components as planned outputs.",
    invalid_quantity: "Enter a positive planned quantity.",
    invalid_unit: "Enter a planned unit.",
    invalid_status: "Choose a valid status.",
    line_blocked:
      "This output line is blocked. Resolve the formula/readiness issue before creating a planned batch.",
    plan_locked: "This plan status is read-only for that action.",
    not_found: "The requested production plan record was not found.",
    no_permission: "You do not have permission to change this production plan.",
    error: "The production plan action could not be completed.",
  };

  return messages[status] ?? "The production plan action finished.";
}

function fieldClassName() {
  return "mt-1 w-full min-w-0 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
}

function labelClassName() {
  return "text-xs font-semibold uppercase text-slate-500";
}

function canEditPlan(statusKey: string) {
  return ["draft", "planned"].includes(statusKey);
}

function nextStatusOptions(statusKey: string) {
  if (statusKey === "draft") {
    return [
      ["planned", "Mark planned"],
      ["cancelled", "Cancel"],
      ["archived", "Archive"],
    ] as const;
  }

  if (statusKey === "planned") {
    return [
      ["approved", "Approve"],
      ["draft", "Move back to draft"],
      ["cancelled", "Cancel"],
      ["archived", "Archive"],
    ] as const;
  }

  if (statusKey === "approved") {
    return [
      ["cancelled", "Cancel"],
      ["archived", "Archive"],
    ] as const;
  }

  if (statusKey === "cancelled") {
    return [["archived", "Archive"]] as const;
  }

  return [] as const;
}

export default async function ProductionPlanDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const detail = await fetchProductionPlanDetail(id);

  if (!detail) {
    notFound();
  }

  const actionMessage = getActionMessage(resolvedSearchParams.plan);
  const editable = canEditPlan(detail.plan.statusKey);
  const statusOptions = nextStatusOptions(detail.plan.statusKey);
  const supportTicketHref = `/support/tickets/new?${new URLSearchParams({
    relatedPath: `/production-plan/${detail.plan.id}`,
    moduleKey: "production_plan",
    category: "production",
  }).toString()}`;

  return (
    <AppShell>
      <PageHeader
        title={detail.plan.name}
        description="Real production planning detail. Planned outputs and batches do not reserve or consume stock yet."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/production-plan" variant="secondary">
            Back to production plans
          </PageActionButton>
          <PageActionButton href={supportTicketHref} variant="secondary">
            Get help
          </PageActionButton>
          <StatusBadge tone={detail.plan.statusTone}>
            {detail.plan.status}
          </StatusBadge>
          <StatusBadge tone="info">Planning only</StatusBadge>
        </div>

        {actionMessage ? (
          <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">
            {actionMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Plan date"
            value={detail.plan.planDate}
            helperText="Business date for this planning window."
            badge="Date"
            tone="info"
            icon="DT"
          />
          <StatCard
            label="Lines"
            value={String(detail.summary.linesCount)}
            helperText="Finished products and components planned as output."
            badge="Outputs"
            tone="info"
            icon="OL"
          />
          <StatCard
            label="Batches"
            value={String(detail.summary.batchesCount)}
            helperText="Planned batch headers only."
            badge="Runs"
            tone="neutral"
            icon="BT"
          />
          <StatCard
            label="Blocked"
            value={String(detail.summary.blockedLines)}
            helperText="Usually missing formula setup."
            badge="Review"
            tone={detail.summary.blockedLines > 0 ? "warning" : "success"}
            icon="BL"
          />
          <StatCard
            label="Planned qty"
            value={detail.summary.plannedQuantity}
            helperText="Mixed units may be present; no UOM conversion is applied."
            badge="Raw"
            tone="neutral"
            icon="QY"
          />
        </section>

        <SectionCard
          title="Plan metadata"
          description="Approval and locking metadata is captured for planning visibility only."
          action={
            detail.canManagePlans && statusOptions.length > 0 ? (
              <StatusBadge tone="success">Manage enabled</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Read only</StatusBadge>
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Status", detail.plan.status],
              ["Created", detail.plan.createdAt],
              ["Updated", detail.plan.updatedAt],
              ["Approved", detail.plan.approvedAt],
              ["Locked", detail.plan.lockedAt],
              ["Notes", detail.plan.notes],
            ].map(([label, value]) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50/70 px-4 py-3"
                key={label}
              >
                <p className={labelClassName()}>{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
          {detail.canManagePlans && statusOptions.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {statusOptions.map(([status, label]) => (
                <form action={updateProductionPlanStatusAction} key={status}>
                  <input
                    name="production_plan_id"
                    type="hidden"
                    value={detail.plan.id}
                  />
                  <input name="status" type="hidden" value={status} />
                  <button
                    className="inline-flex items-center justify-center rounded-md border border-[color:var(--tenant-primary-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--tenant-primary)] transition hover:bg-[var(--tenant-primary-soft)]"
                    type="submit"
                  >
                    {label}
                  </button>
                </form>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <SectionCard
            title="Planned output lines"
            description="Outputs can be finished products or components. Missing formulas are allowed but marked blocked for review."
            action={
              editable && detail.canCreatePlans ? (
                <StatusBadge tone="success">Add lines enabled</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Read only</StatusBadge>
              )
            }
          >
            {detail.lines.length === 0 ? (
              <EmptyState
                title="No planned output lines yet"
                description="Add a finished product or component output line to start shaping this production plan."
              />
            ) : (
              <div className="space-y-3">
                {detail.lines.map((line) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-white p-4"
                    key={line.id}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <Link
                          className="text-sm font-bold text-clean-green-800 hover:text-clean-green-950"
                          href={line.outputItemHref}
                        >
                          {line.outputItemName}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusBadge tone="info">{line.itemType}</StatusBadge>
                          <StatusBadge tone={line.statusTone}>
                            {line.status}
                          </StatusBadge>
                          <StatusBadge tone="neutral">
                            {line.plannedQuantity}
                          </StatusBadge>
                        </div>
                      </div>
                      {line.canCreateBatch ? (
                        <form
                          action={createProductionBatchFromLineAction}
                          className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-72"
                        >
                          <input
                            name="production_plan_id"
                            type="hidden"
                            value={detail.plan.id}
                          />
                          <input
                            name="production_plan_line_id"
                            type="hidden"
                            value={line.id}
                          />
                          <input
                            className={fieldClassName()}
                            name="batch_number"
                            placeholder="Optional batch number"
                          />
                          <button
                            className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                            type="submit"
                          >
                            Create planned batch
                          </button>
                        </form>
                      ) : (
                        <div className="w-full rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-500 sm:w-72">
                          {line.batchCreationHint}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Formula", line.formula],
                        ["Costing snapshot", line.costingSnapshot],
                        ["Area", line.productionArea],
                        ["Notes", line.notes],
                      ].map(([label, value]) => (
                        <div
                          className="rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2"
                          key={label}
                        >
                          <p className={labelClassName()}>{label}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Add planned output"
            description="Choose a finished product or component. The server attaches the active formula and latest costing snapshot when available."
          >
            {editable && detail.canCreatePlans ? (
              <form action={addProductionPlanLineAction} className="space-y-4">
                <input
                  name="production_plan_id"
                  type="hidden"
                  value={detail.plan.id}
                />
                <label className="block">
                  <span className={labelClassName()}>Output item</span>
                  <select
                    className={fieldClassName()}
                    name="output_internal_item_id"
                    required
                  >
                    <option value="">Choose finished product or component</option>
                    {detail.outputOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                        {item.hasFormula ? " - formula ready" : " - formula missing"}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Ingredients and packaging are not valid production outputs in v1.
                  </span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelClassName()}>Planned quantity</span>
                    <input
                      className={fieldClassName()}
                      min="0.001"
                      name="planned_quantity"
                      required
                      step="0.001"
                      type="number"
                    />
                  </label>
                  <label className="block">
                    <span className={labelClassName()}>Unit</span>
                    <input
                      className={fieldClassName()}
                      name="planned_unit"
                      placeholder="meals, kg, trays"
                      required
                    />
                  </label>
                </div>
                <label className="block">
                  <span className={labelClassName()}>Production area</span>
                  <select className={fieldClassName()} name="production_area_id">
                    <option value="">No area selected</option>
                    {detail.productionAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.label}
                      </option>
                    ))}
                  </select>
                  {detail.productionAreas.length === 0 ? (
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      No active production areas exist yet. Add areas later from
                      the Production Areas page.
                    </span>
                  ) : null}
                </label>
                <label className="block">
                  <span className={labelClassName()}>Notes</span>
                  <textarea
                    className="mt-1 min-h-24 w-full min-w-0 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                    name="notes"
                    placeholder="Demand source, prep note or setup blocker"
                  />
                </label>
                <button
                  className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                  type="submit"
                >
                  Add planned output
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  This plan is read-only for line creation because of its status
                  or your permissions.
                </p>
                <p>
                  Draft and planned plans can accept output lines when
                  `production_plans.create` or manage access is available.
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Planned batches"
          description="Batches are planned runs only. They do not create production tasks, stock consumption or output stock."
        >
          {detail.batches.length === 0 ? (
            <EmptyState
              title="No planned batches yet"
              description="Create a planned batch from an output line when you are ready to break the plan into runs."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Output</th>
                    <th className="px-4 py-3">Planned quantity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {detail.batches.map((batch) => (
                    <tr key={batch.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {batch.batchNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {batch.outputItemName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {batch.plannedQuantity}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={batch.statusTone}>
                          {batch.status}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {batch.productionArea}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {batch.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Future workflows"
          description="Production planning is intentionally separated from execution until stock, QA and facility task rules are reviewed."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Input requirements and stock issue will come later.",
              "QA release, hold and corrective action workflows are future work.",
              "Facility/tablet task execution and production reporting are not created here.",
            ].map((note) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                key={note}
              >
                {note}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
