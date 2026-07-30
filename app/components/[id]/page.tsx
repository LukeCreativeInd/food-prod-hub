import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addComponentFormulaLineAction,
  deleteComponentFormulaLineAction,
  updateComponentFormulaHeaderAction,
  updateComponentFormulaLineAction,
} from "@/app/components/actions";
import { createCostingSnapshotAction } from "@/app/costing-snapshots/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getComponentFormulaDetailData } from "@/lib/component-formula-builder-data";
import { getCostingSnapshotPanelData } from "@/lib/costing-snapshot-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    formula?: string;
    snapshot?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Component - EveryBatch",
};

function statusTone(value: string) {
  const normalisedValue = value.toLowerCase();

  if (
    normalisedValue.includes("missing") ||
    normalisedValue.includes("draft") ||
    normalisedValue.includes("review") ||
    normalisedValue.includes("needed") ||
    normalisedValue.includes("invalid") ||
    normalisedValue.includes("conflict")
  ) {
    return "warning" as const;
  }

  if (
    normalisedValue.includes("active") ||
    normalisedValue.includes("ready") ||
    normalisedValue.includes("created") ||
    normalisedValue.includes("updated") ||
    normalisedValue.includes("added") ||
    normalisedValue.includes("removed")
  ) {
    return "success" as const;
  }

  if (normalisedValue.includes("component") || normalisedValue.includes("read only")) {
    return "info" as const;
  }

  return "neutral" as const;
}

function getActionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    created: "Component formula created.",
    updated: "Formula header updated.",
    line_added: "Formula line added.",
    line_updated: "Formula line updated.",
    line_removed: "Formula line removed.",
    missing_name: "Enter a component name.",
    missing_formula: "Formula version was not found.",
    missing_item: "Choose a valid internal item.",
    invalid_quantity: "Enter a positive quantity.",
    invalid_unit: "Enter a unit.",
    invalid_order: "Enter a positive line order.",
    self_reference: "A component formula cannot use itself as an input.",
    active_conflict: "This component already has an active formula.",
    duplicate: "Another component already uses that name.",
    not_found: "The requested formula record was not found.",
    snapshot_error: "The costing snapshot could not be created.",
    snapshot_invalid: "The costing snapshot action was missing required details.",
    error: "The formula action could not be completed.",
  };

  return messages[status] ?? "The formula action finished.";
}

function inputClassName() {
  return "mt-1 w-full min-w-0 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
}

function labelClassName() {
  return "text-xs font-semibold uppercase text-slate-500";
}

function SelectableItemOptions({
  items,
  selectedItemId,
}: {
  items: {
    id: string;
    displayName: string;
    itemType: string;
    baseUnit: string;
  }[];
  selectedItemId?: string;
}) {
  return (
    <>
      <option value="">Choose internal item</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.displayName} - {item.itemType}
          {item.baseUnit ? ` (${item.baseUnit})` : ""}
        </option>
      ))}
      {selectedItemId &&
      !items.some((item) => item.id === selectedItemId) ? (
        <option value={selectedItemId}>Current item unavailable</option>
      ) : null}
    </>
  );
}

export default async function ComponentFormulaDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const detail = await getComponentFormulaDetailData(id);

  if (!detail) {
    notFound();
  }

  const snapshotPanel = await getCostingSnapshotPanelData(detail.component.id);
  const actionMessage = getActionMessage(
    resolvedSearchParams.formula ?? resolvedSearchParams.snapshot,
  );
  const selectedVersion = detail.selectedVersion;
  const ingredientCount = detail.lines.filter(
    (line) => line.inputItemType === "ingredient",
  ).length;
  const packagingCount = detail.lines.filter(
    (line) => line.inputItemType === "packaging",
  ).length;
  const componentCount = detail.lines.filter(
    (line) => line.inputItemType === "component",
  ).length;
  const supportTicketHref = `/support/tickets/new?${new URLSearchParams({
    relatedPath: `/components/${detail.component.id}`,
    moduleKey: "components",
    category: "formulas",
  }).toString()}`;
  const formulaActionHref = selectedVersion ? "#formula-header" : "/components";

  return (
    <AppShell>
      <PageHeader
        title={detail.component.displayName}
        description="Manual component formula builder for batch output, input lines and safe costing readiness."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/components" variant="secondary">
            Back to components
          </PageActionButton>
          <StatusBadge tone={statusTone(detail.selectedVersion?.status ?? "Formula missing")}>
            {detail.selectedVersion?.status ?? "Formula missing"}
          </StatusBadge>
          <StatusBadge tone="info">component</StatusBadge>
          {detail.canManageFormulas ? (
            <StatusBadge tone="success">Builder enabled</StatusBadge>
          ) : (
            <StatusBadge tone="info">Read only</StatusBadge>
          )}
        </div>

        {actionMessage ? (
          <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">
            {actionMessage}
          </div>
        ) : null}

        <SectionCard
          title="Component details"
          description="Canonical prepared/intermediate item. Formula inputs and costing readiness are reviewed from this item."
          action={
            <PageActionButton href={supportTicketHref} variant="secondary">
              Get help
            </PageActionButton>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Name", detail.component.displayName],
              ["Item type", detail.component.itemType],
              ["Base unit", detail.component.baseUnit],
              ["Item status", detail.component.status],
              ["Formula version", selectedVersion?.versionName ?? "Not captured"],
              ["Batch output", selectedVersion?.outputQuantity ?? "Not captured"],
              ["Updated", detail.component.updatedAt],
              ["Notes", detail.component.notes || "No notes recorded"],
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
        </SectionCard>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Formula lines"
            value={String(detail.lines.length)}
            helperText="Active ingredient, packaging, component and other input lines."
            badge="BOM"
            tone={detail.lines.length > 0 ? "info" : "warning"}
            icon="LN"
          />
          <StatCard
            label="Ingredients"
            value={String(ingredientCount)}
            helperText="Purchased ingredient inputs used by this component."
            badge="Inputs"
            tone={ingredientCount > 0 ? "info" : "neutral"}
            icon="IN"
          />
          <StatCard
            label="Packaging"
            value={String(packagingCount)}
            helperText="Packaging inputs captured in this component formula."
            badge="Inputs"
            tone={packagingCount > 0 ? "info" : "neutral"}
            icon="PK"
          />
          <StatCard
            label="Sub-components"
            value={String(componentCount)}
            helperText="Reusable component inputs nested into this formula."
            badge="Inputs"
            tone={componentCount > 0 ? "info" : "neutral"}
            icon="CP"
          />
          <StatCard
            label="Input costs"
            value={detail.costReadiness.status}
            helperText={detail.costReadiness.estimatedCost}
            badge="Costing"
            tone={detail.costReadiness.tone}
            icon="$"
          />
          <StatCard
            label="Production"
            value="Future"
            helperText="Inventory availability and batch production are not live yet."
            badge="Later"
            tone="neutral"
            icon="PR"
          />
        </section>

        <SectionCard
          title="Review actions"
          description="Move between component setup and costing review without changing formula calculation rules."
        >
          <div className="flex flex-wrap gap-3">
            <PageActionButton href={formulaActionHref} variant="secondary">
              Manage formula
            </PageActionButton>
            <PageActionButton href="/component-costs" variant="secondary">
              View component costs
            </PageActionButton>
            <PageActionButton href="/ingredient-costs" variant="secondary">
              View ingredient costs
            </PageActionButton>
            <PageActionButton href="/packaging-costs" variant="secondary">
              View packaging costs
            </PageActionButton>
            <PageActionButton href="/finished-products" variant="secondary">
              View finished products
            </PageActionButton>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Where-used counts are not live yet. Finished product formulas can use
            components, but this page does not currently calculate downstream usage.
          </p>
        </SectionCard>

        {snapshotPanel.canView ? (
          <SectionCard
            title="Costing snapshots"
            description="Create a locked manual snapshot of the current component formula cost state, or review recent frozen records."
            action={<StatusBadge tone="info">costing_snapshots.view</StatusBadge>}
          >
            <div className="flex flex-wrap gap-3">
              {snapshotPanel.canCreate ? (
                <form action={createCostingSnapshotAction}>
                  <input
                    name="internal_item_id"
                    type="hidden"
                    value={detail.component.id}
                  />
                  <input name="snapshot_type" type="hidden" value="component_cost" />
                  <input
                    name="return_path"
                    type="hidden"
                    value={`/components/${detail.component.id}`}
                  />
                  <button
                    className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
                    type="submit"
                  >
                    Create component cost snapshot
                  </button>
                </form>
              ) : (
                <StatusBadge tone="info">Read only</StatusBadge>
              )}
              <PageActionButton href="/component-costs" variant="secondary">
                Compare live component costs
              </PageActionButton>
            </div>

            {snapshotPanel.snapshots.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No snapshots yet"
                  description="Create a manual snapshot when this component cost needs a frozen review record."
                />
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Snapshot</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {snapshotPanel.snapshots.map((snapshot) => (
                      <tr key={snapshot.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {snapshot.typeLabel}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={snapshot.statusTone}>
                            {snapshot.statusLabel}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {snapshot.costLabel}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {snapshot.createdAt}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            className="font-semibold text-clean-green-700 hover:text-clean-green-900"
                            href={snapshot.href}
                          >
                            View snapshot
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div id="formula-header" className="scroll-mt-24">
            <SectionCard
              title="Formula header"
              description="Basic component formula fields supported by the current formula schema."
              action={
                detail.selectedVersion ? (
                  <StatusBadge tone={statusTone(detail.selectedVersion.status)}>
                    {detail.selectedVersion.status}
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="warning">Formula missing</StatusBadge>
                )
              }
            >
              {detail.selectedVersion ? (
                detail.canManageFormulas ? (
                  <form action={updateComponentFormulaHeaderAction} className="space-y-4">
                    <input name="component_id" type="hidden" value={detail.component.id} />
                    <input
                      name="formula_version_id"
                      type="hidden"
                      value={detail.selectedVersion.id}
                    />
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="block">
                        <span className={labelClassName()}>Component name</span>
                        <input
                          className={inputClassName()}
                          defaultValue={detail.component.displayName}
                          name="display_name"
                          required
                        />
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          This remains a canonical internal item with item type component.
                        </span>
                      </label>
                      <label className="block">
                        <span className={labelClassName()}>Version name</span>
                        <input
                          className={inputClassName()}
                          defaultValue={detail.selectedVersion.versionNameValue}
                          name="version_name"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className={labelClassName()}>Batch yield</span>
                        <input
                          className={inputClassName()}
                          defaultValue={detail.selectedVersion.outputQuantityValue}
                          min="0.001"
                          name="output_quantity"
                          required
                          step="0.001"
                          type="number"
                        />
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          Input quantities are reviewed against this component output.
                        </span>
                      </label>
                      <label className="block">
                        <span className={labelClassName()}>Yield unit</span>
                        <input
                          className={inputClassName()}
                          defaultValue={detail.selectedVersion.outputUnit}
                          name="output_unit"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className={labelClassName()}>Expected yield</span>
                        <input
                          className={inputClassName()}
                          defaultValue={detail.selectedVersion.expectedYieldQuantityValue}
                          min="0.001"
                          name="expected_yield_quantity"
                          step="0.001"
                          type="number"
                        />
                      </label>
                      <label className="block">
                        <span className={labelClassName()}>Expected yield unit</span>
                        <input
                          className={inputClassName()}
                          defaultValue={detail.selectedVersion.expectedYieldUnit}
                          name="expected_yield_unit"
                        />
                      </label>
                      <label className="block">
                        <span className={labelClassName()}>Status</span>
                        <select
                          className={inputClassName()}
                          defaultValue={detail.selectedVersion.status}
                          name="status"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span className={labelClassName()}>Notes</span>
                      <textarea
                        className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]"
                        defaultValue={detail.selectedVersion.notes || detail.component.notes}
                        name="notes"
                      />
                    </label>
                    <button
                      className="inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tenant-primary)]"
                      type="submit"
                    >
                      Save formula header
                    </button>
                  </form>
                ) : (
                  <dl className="grid gap-4 md:grid-cols-2">
                    {[
                      ["Component name", detail.component.displayName],
                      ["Version", detail.selectedVersion.versionName],
                      ["Status", detail.selectedVersion.status],
                      ["Batch yield", detail.selectedVersion.outputQuantity],
                      ["Expected yield", detail.selectedVersion.expectedYield],
                      ["Notes", detail.selectedVersion.notes || "No notes recorded"],
                    ].map(([label, value]) => (
                      <div
                        className="rounded-md border border-slate-200 bg-slate-50/60 px-4 py-3"
                        key={label}
                      >
                        <dt className={labelClassName()}>{label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-900">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )
              ) : (
                <EmptyState
                  title="Formula missing"
                  description="Component cost can be previewed only after this component has formula lines with reviewed prices and compatible units."
                  action={
                    <PageActionButton href="/components" variant="secondary">
                      Back to components
                    </PageActionButton>
                  }
                />
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Cost readiness"
            description="Estimated cost is shown when each line has an approved price and either matching units or safe kg/g and l/ml conversion."
            action={
              <StatusBadge tone={detail.costReadiness.tone}>
                {detail.costReadiness.status}
              </StatusBadge>
            }
          >
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Safe estimate
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {detail.costReadiness.estimatedCost}
              </p>
            </div>
            <div className="mt-4 space-y-2">
              {detail.costReadiness.issues.map((issue) => (
                <p
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                  key={issue}
                >
                  {issue}
                </p>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[var(--tenant-primary)]">
              <Link href="/ingredient-costs">Review Ingredient Costs</Link>
              <Link href="/packaging-costs">Review Packaging Costs</Link>
              <Link href="/component-costs">Open Component Costs</Link>
            </div>
          </SectionCard>
        </div>

        {selectedVersion ? (
          <SectionCard
            title="Formula lines"
            description="Add the ingredients, packaging, consumables or sub-components used to make this batch output. Supplier descriptions stay outside formula lines."
            action={
              detail.canManageFormulas ? (
                <StatusBadge tone="success">Editable</StatusBadge>
              ) : (
                <StatusBadge tone="info">Read only</StatusBadge>
              )
            }
          >
            {detail.lines.length === 0 ? (
              <EmptyState
                title="No input lines yet"
                description="Add one row per ingredient, packaging item or reusable component needed to make this component. Cost stays blocked until lines have reviewed prices and compatible units."
              />
            ) : (
              <div className="space-y-4">
                {detail.lines.map((line) => (
                  <div
                    className="rounded-md border border-slate-200 bg-slate-50/60 p-4"
                    key={line.id}
                  >
                    {detail.canManageFormulas ? (
                      <form
                        action={updateComponentFormulaLineAction}
                        className="grid gap-4 md:grid-cols-2 xl:grid-cols-12"
                      >
                        <input
                          name="component_id"
                          type="hidden"
                          value={detail.component.id}
                        />
                        <input
                          name="formula_version_id"
                          type="hidden"
                          value={selectedVersion.id}
                        />
                        <input name="line_id" type="hidden" value={line.id} />
                        <label className="block xl:col-span-1">
                          <span className={labelClassName()}>Order</span>
                          <input
                            className={inputClassName()}
                            defaultValue={line.lineOrderValue}
                            min="1"
                            name="line_order"
                            required
                            step="1"
                            type="number"
                          />
                        </label>
                        <label className="block xl:col-span-4">
                          <span className={labelClassName()}>Input item</span>
                          <select
                            className={inputClassName()}
                            defaultValue={line.inputItemId}
                            name="input_internal_item_id"
                            required
                          >
                            <SelectableItemOptions
                              items={detail.selectableItems}
                              selectedItemId={line.inputItemId}
                            />
                          </select>
                        </label>
                        <label className="block xl:col-span-2">
                          <span className={labelClassName()}>Quantity</span>
                          <input
                            className={inputClassName()}
                            defaultValue={line.quantityValue}
                            min="0.001"
                            name="quantity"
                            required
                            step="0.001"
                            type="number"
                          />
                        </label>
                        <label className="block xl:col-span-1">
                          <span className={labelClassName()}>Unit</span>
                          <input
                            className={inputClassName()}
                            defaultValue={line.unit}
                            name="unit"
                            required
                          />
                        </label>
                        <label className="block xl:col-span-2">
                          <span className={labelClassName()}>Prep state</span>
                          <input
                            className={inputClassName()}
                            defaultValue={line.preparationStateValue}
                            name="preparation_state"
                            placeholder="diced, cooked..."
                          />
                        </label>
                        <label className="block xl:col-span-2">
                          <span className={labelClassName()}>Notes</span>
                          <input
                            className={inputClassName()}
                            defaultValue={line.notesValue}
                            name="notes"
                          />
                        </label>
                        <div className="flex items-end md:col-span-2 xl:col-span-12">
                          <button
                            className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 sm:w-auto"
                            type="submit"
                          >
                            Save line
                          </button>
                        </div>
                        <label className="block md:col-span-2 xl:col-span-10">
                          <span className={labelClassName()}>Loss / yield note</span>
                          <input
                            className={inputClassName()}
                            defaultValue={line.lossNoteValue}
                            name="loss_note"
                            placeholder="Optional loss, trim, shrink or yield note"
                          />
                        </label>
                        <div className="flex items-end md:col-span-2 xl:col-span-2">
                          <StatusBadge tone={line.costStatusTone}>
                            {line.costStatus}
                          </StatusBadge>
                        </div>
                      </form>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                        <div className="lg:col-span-2">
                          <p className={labelClassName()}>Input item</p>
                          <Link
                            className="mt-1 block text-sm font-semibold text-clean-green-700 hover:text-clean-green-900"
                            href={line.inputItemHref}
                          >
                            {line.inputItemName}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">{line.inputItemType}</p>
                        </div>
                        <div>
                          <p className={labelClassName()}>Quantity</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {line.quantity}
                          </p>
                        </div>
                        <div>
                          <p className={labelClassName()}>Order</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {line.lineOrder}
                          </p>
                        </div>
                        <div>
                          <p className={labelClassName()}>Unit</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {line.unit}
                          </p>
                        </div>
                        <div>
                          <p className={labelClassName()}>Cost</p>
                          <StatusBadge tone={line.costStatusTone}>
                            {line.costStatus}
                          </StatusBadge>
                        </div>
                        <div>
                          <p className={labelClassName()}>Price hint</p>
                          <p className="mt-1 text-sm text-slate-600">{line.costHint}</p>
                        </div>
                      </div>
                    )}
                    {detail.canManageFormulas ? (
                      <form action={deleteComponentFormulaLineAction} className="mt-4">
                        <input
                          name="component_id"
                          type="hidden"
                          value={detail.component.id}
                        />
                        <input
                          name="formula_version_id"
                          type="hidden"
                          value={selectedVersion.id}
                        />
                        <input name="line_id" type="hidden" value={line.id} />
                        <button
                          className="inline-flex w-full items-center justify-center rounded-md border border-[color:var(--tenant-danger-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--tenant-danger)] transition hover:bg-[var(--tenant-danger-bg)] sm:w-auto"
                          type="submit"
                        >
                          Remove line
                        </button>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        ) : null}

        {selectedVersion && detail.canManageFormulas ? (
          <SectionCard
            title="Add input line"
            description="Select an existing tenant internal item. Unknown items should be created and reviewed before they become formula inputs."
          >
            <form
              action={addComponentFormulaLineAction}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-12"
            >
              <input name="component_id" type="hidden" value={detail.component.id} />
              <input
                name="formula_version_id"
                type="hidden"
                value={selectedVersion.id}
              />
              <label className="block xl:col-span-1">
                <span className={labelClassName()}>Order</span>
                <input
                  className={inputClassName()}
                  min="1"
                  name="line_order"
                  placeholder="Next"
                  step="1"
                  type="number"
                />
              </label>
              <label className="block xl:col-span-4">
                <span className={labelClassName()}>Input item</span>
                <select
                  className={inputClassName()}
                  name="input_internal_item_id"
                  required
                >
                  <SelectableItemOptions items={detail.selectableItems} />
                </select>
              </label>
              <label className="block xl:col-span-2">
                  <span className={labelClassName()}>Quantity</span>
                <input
                  className={inputClassName()}
                  min="0.001"
                  name="quantity"
                  required
                  step="0.001"
                  type="number"
                />
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Quantity is per component batch/output defined in the header.
                </span>
              </label>
              <label className="block xl:col-span-1">
                  <span className={labelClassName()}>Unit</span>
                <input className={inputClassName()} name="unit" placeholder="kg" required />
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Unit should match the approved price unit until conversions are designed.
                  Metric kg/g and l/ml conversions are handled safely; pack units still need review.
                </span>
              </label>
              <label className="block xl:col-span-2">
                <span className={labelClassName()}>Prep state</span>
                <input
                  className={inputClassName()}
                  name="preparation_state"
                  placeholder="diced, cooked..."
                />
              </label>
              <label className="block xl:col-span-2">
                <span className={labelClassName()}>Notes</span>
                <input className={inputClassName()} name="notes" />
              </label>
              <div className="flex items-end md:col-span-2 xl:col-span-12">
                <button
                  className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tenant-primary)] sm:w-auto"
                  type="submit"
                >
                  Add input line
                </button>
              </div>
              <label className="block md:col-span-2 xl:col-span-12">
                <span className={labelClassName()}>Loss / yield note</span>
                <input
                  className={inputClassName()}
                  name="loss_note"
                  placeholder="Optional loss, trim, shrink or yield note"
                />
              </label>
            </form>
          </SectionCard>
        ) : null}

        <SectionCard
          title="Formula versions"
          description="The builder edits the selected active or draft version. Full version-management workflows remain future work."
        >
          {detail.versions.length === 0 ? (
            <EmptyState
              title="No formula versions yet"
              description="Create the first draft formula from the Components page."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Output</th>
                    <th className="px-4 py-3">Expected yield</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {detail.versions.map((version) => (
                    <tr key={version.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {version.versionName}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={statusTone(version.status)}>
                          {version.status}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {version.outputQuantity}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {version.expectedYield}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{version.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Production readiness"
          description="Production instructions and inventory availability remain separate from the formula/BOM layer."
        >
          <EmptyState
            title="Production readiness comes later"
            description="Steps, work areas, tablet task logging, inventory availability, actual production quantities and waste reporting will be designed in later production-specific work."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
