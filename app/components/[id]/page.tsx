import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addComponentFormulaLineAction,
  deleteComponentFormulaLineAction,
  updateComponentFormulaHeaderAction,
  updateComponentFormulaLineAction,
} from "@/app/components/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { getComponentFormulaDetailData } from "@/lib/component-formula-builder-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    formula?: string;
  }>;
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

  const actionMessage = getActionMessage(resolvedSearchParams.formula);
  const selectedVersion = detail.selectedVersion;

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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                title="No formula version captured"
                description="Create or reuse this component from the Components page to add the first draft formula version."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Cost readiness"
            description="Estimated cost is shown only when each line has an exact approved price/unit match."
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
          </SectionCard>
        </div>

        {selectedVersion ? (
          <SectionCard
            title="Formula lines"
            description="Inputs can be ingredients, packaging, consumables, equipment or other components. Supplier descriptions stay outside formula lines."
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
                description="Add one row per ingredient, packaging item or reusable component needed to make this batch formula."
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
                            Save
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
            title="Add formula line"
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
              </label>
              <label className="block xl:col-span-1">
                <span className={labelClassName()}>Unit</span>
                <input className={inputClassName()} name="unit" placeholder="kg" required />
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
                  Add line
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
          title="Production method placeholder"
          description="Production instructions remain separate from the formula/BOM layer."
        >
          <EmptyState
            title="Method and route layer comes later"
            description="Steps, work areas, tablet task logging, actual production quantities and waste reporting will be designed in later production-specific work."
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
