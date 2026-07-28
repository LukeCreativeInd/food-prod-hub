import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addFinishedProductFormulaLineAction,
  deleteFinishedProductFormulaLineAction,
  updateFinishedProductFormulaHeaderAction,
  updateFinishedProductFormulaLineAction,
} from "@/app/finished-products/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState, PageActionButton, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import { getFinishedProductFormulaDetailData } from "@/lib/finished-product-formula-builder-data";

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
    normalisedValue.includes("pending") ||
    normalisedValue.includes("blocked") ||
    normalisedValue.includes("not recorded")
  ) {
    return "warning" as const;
  }

  if (normalisedValue.includes("active") || normalisedValue.includes("ready")) {
    return "success" as const;
  }

  if (
    normalisedValue.includes("finished") ||
    normalisedValue.includes("component") ||
    normalisedValue.includes("ingredient") ||
    normalisedValue.includes("packaging")
  ) {
    return "info" as const;
  }

  return "neutral" as const;
}

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    created: "Finished product formula created.",
    updated: "Finished product formula updated.",
    line_added: "Formula line added.",
    line_updated: "Formula line updated.",
    line_removed: "Formula line removed.",
    missing_name: "Finished product name is required.",
    missing_formula: "Formula version was not found.",
    missing_item: "Select a valid component, ingredient or packaging input.",
    invalid_quantity: "Enter a positive quantity.",
    invalid_unit: "Enter a unit.",
    invalid_order: "Line order must be a positive whole number.",
    self_reference: "A finished product cannot reference itself.",
    unsupported_item: "Finished product inputs are blocked in v1. Use components, ingredients or packaging only.",
    active_conflict: "This finished product already has another active formula.",
    duplicate: "Another finished product already uses that name.",
    not_found: "The formula record could not be found.",
    error: "The formula action could not be completed.",
  };

  return messages[status] ?? "The finished product formula action finished.";
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
const dangerButtonClass =
  "inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100";

export default async function FinishedProductFormulaDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getFinishedProductFormulaDetailData(id);

  if (!detail) {
    notFound();
  }

  const message = actionMessage(query.formula);
  const selectedVersion = detail.selectedVersion;
  const ingredientCount = detail.lines.filter(
    (line) => line.inputItemType === "ingredient",
  ).length;
  const componentCount = detail.lines.filter(
    (line) => line.inputItemType === "component",
  ).length;
  const packagingCount = detail.lines.filter(
    (line) => line.inputItemType === "packaging",
  ).length;
  const otherCount = detail.lines.length - ingredientCount - componentCount - packagingCount;

  return (
    <AppShell>
      <PageHeader
        title={detail.finishedProduct.displayName}
        description="Manual finished product formula builder for per-selling-unit inputs, costing readiness and margin readiness."
      />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <PageActionButton href="/finished-products" variant="secondary">
            Back to finished products
          </PageActionButton>
          <StatusBadge tone={statusTone(selectedVersion?.status ?? "Formula missing")}>
            {selectedVersion?.status ?? "Formula missing"}
          </StatusBadge>
          <StatusBadge tone="info">finished_product</StatusBadge>
          {detail.canManageFormulas ? (
            <StatusBadge tone="success">Builder enabled</StatusBadge>
          ) : (
            <StatusBadge tone="info">Read only</StatusBadge>
          )}
        </div>

        {message ? (
          <div className="rounded-md border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--tenant-primary)]">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Formula lines"
            value={String(detail.lines.length)}
            helperText="Active component, ingredient and packaging lines."
            badge="BOM"
            tone={detail.lines.length > 0 ? "info" : "warning"}
            icon="LN"
          />
          <StatCard
            label="Components"
            value={String(componentCount)}
            helperText="Made/batch inputs reused by this product."
            badge="Inputs"
            tone={componentCount > 0 ? "info" : "neutral"}
            icon="CP"
          />
          <StatCard
            label="Cost readiness"
            value={detail.costReadiness.status}
            helperText={detail.costReadiness.estimatedCost}
            badge="Costing"
            tone={detail.costReadiness.tone}
            icon="$"
          />
          <StatCard
            label="Margin readiness"
            value={detail.marginReadiness.status}
            helperText="Sell price storage is not implemented yet."
            badge="Pending"
            tone={detail.marginReadiness.tone}
            icon="%"
          />
        </section>

        {selectedVersion ? (
          <SectionCard
            title="Formula header"
            description="Edit the finished product output and selected formula version. Activating a formula remains explicit."
            action={
              detail.canManageFormulas ? (
                <StatusBadge tone="success">formulas.manage</StatusBadge>
              ) : (
                <StatusBadge tone="info">Read only</StatusBadge>
              )
            }
          >
            {detail.canManageFormulas ? (
              <form
                action={updateFinishedProductFormulaHeaderAction}
                className="grid gap-4 lg:grid-cols-2"
              >
                <input
                  name="finished_product_id"
                  type="hidden"
                  value={detail.finishedProduct.id}
                />
                <input
                  name="formula_version_id"
                  type="hidden"
                  value={selectedVersion.id}
                />
                <FormField label="Finished product name">
                  <input
                    className={inputClass}
                    defaultValue={detail.finishedProduct.displayName}
                    name="display_name"
                    required
                  />
                </FormField>
                <FormField label="Version name">
                  <input
                    className={inputClass}
                    defaultValue={selectedVersion.versionNameValue}
                    name="version_name"
                    required
                  />
                </FormField>
                <FormField label="Output quantity">
                  <input
                    className={inputClass}
                    defaultValue={selectedVersion.outputQuantityValue}
                    min="0.001"
                    name="output_quantity"
                    required
                    step="0.001"
                    type="number"
                  />
                </FormField>
                <FormField label="Output unit">
                  <input
                    className={inputClass}
                    defaultValue={selectedVersion.outputUnit}
                    name="output_unit"
                    required
                  />
                </FormField>
                <FormField label="Expected yield quantity">
                  <input
                    className={inputClass}
                    defaultValue={selectedVersion.expectedYieldQuantityValue}
                    min="0.001"
                    name="expected_yield_quantity"
                    step="0.001"
                    type="number"
                  />
                </FormField>
                <FormField label="Expected yield unit">
                  <input
                    className={inputClass}
                    defaultValue={selectedVersion.expectedYieldUnit}
                    name="expected_yield_unit"
                  />
                </FormField>
                <FormField label="Status">
                  <select
                    className={selectClass}
                    defaultValue={selectedVersion.status}
                    name="status"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </FormField>
                <FormField label="Notes">
                  <textarea
                    className={`${inputClass} min-h-24`}
                    defaultValue={selectedVersion.notes}
                    name="notes"
                  />
                </FormField>
                <div className="lg:col-span-2">
                  <button className={primaryButtonClass} type="submit">
                    Save formula header
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Finished product", detail.finishedProduct.displayName],
                  ["Version", selectedVersion.versionName],
                  ["Output", selectedVersion.outputQuantity],
                  ["Expected yield", selectedVersion.expectedYield],
                  ["Status", selectedVersion.status],
                  ["Notes", selectedVersion.notes || "No notes recorded"],
                ].map(([label, value]) => (
                  <div
                    className="rounded-md border border-slate-200 bg-slate-50/70 px-4 py-3"
                    key={label}
                  >
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        ) : (
          <SectionCard
            title="Formula not captured"
            description="This finished product internal item exists, but no formula version has been captured yet."
          >
            <EmptyState
              title="Create a finished product formula from the list page"
              description="This v1 builder creates new formula headers from /finished-products. Existing finished product records without formulas can be connected in a later follow-up."
            />
          </SectionCard>
        )}

        {selectedVersion ? (
          <SectionCard
            title="Formula lines"
            description="Lines can reference tenant-scoped components, ingredients and packaging. Finished product inputs are blocked in v1."
            action={<StatusBadge tone={detail.costReadiness.tone}>{detail.costReadiness.status}</StatusBadge>}
          >
            {detail.lines.length === 0 ? (
              <EmptyState
                title="No formula lines yet"
                description="Add component, ingredient or packaging lines to make this product cost-ready."
              />
            ) : (
              <div className="space-y-4">
                {detail.lines.map((line) => (
                  <article
                    className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
                    key={line.id}
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          className="text-sm font-bold text-clean-green-700 hover:text-clean-green-900"
                          href={line.inputItemHref}
                        >
                          {line.inputItemName}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusBadge tone={statusTone(line.inputItemType)}>
                            {line.inputItemType}
                          </StatusBadge>
                          <StatusBadge tone={line.costStatusTone}>
                            {line.costStatus}
                          </StatusBadge>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {line.quantity} {line.unit}
                      </p>
                    </div>

                    {detail.canManageFormulas ? (
                      <form
                        action={updateFinishedProductFormulaLineAction}
                        className="grid gap-3 lg:grid-cols-[80px_minmax(180px,1.4fr)_120px_100px_minmax(140px,1fr)_minmax(140px,1fr)]"
                      >
                        <input
                          name="finished_product_id"
                          type="hidden"
                          value={detail.finishedProduct.id}
                        />
                        <input
                          name="formula_version_id"
                          type="hidden"
                          value={selectedVersion.id}
                        />
                        <input name="line_id" type="hidden" value={line.id} />
                        <FormField label="Order">
                          <input
                            className={inputClass}
                            defaultValue={line.lineOrderValue}
                            min="1"
                            name="line_order"
                            required
                            step="1"
                            type="number"
                          />
                        </FormField>
                        <FormField label="Input item">
                          <select
                            className={selectClass}
                            defaultValue={line.inputItemId}
                            name="input_internal_item_id"
                            required
                          >
                            {detail.selectableItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.displayName} ({item.itemType})
                              </option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="Quantity">
                          <input
                            className={inputClass}
                            defaultValue={line.quantityValue}
                            min="0.001"
                            name="quantity"
                            required
                            step="0.001"
                            type="number"
                          />
                        </FormField>
                        <FormField label="Unit">
                          <input
                            className={inputClass}
                            defaultValue={line.unit}
                            name="unit"
                            required
                          />
                        </FormField>
                        <FormField label="Preparation">
                          <input
                            className={inputClass}
                            defaultValue={line.preparationStateValue}
                            name="preparation_state"
                            placeholder="cooked, diced, chilled"
                          />
                        </FormField>
                        <FormField label="Notes">
                          <input
                            className={inputClass}
                            defaultValue={line.notesValue}
                            name="notes"
                          />
                        </FormField>
                        <div className="flex flex-wrap gap-2 lg:col-span-6">
                          <button className={secondaryButtonClass} type="submit">
                            Save line
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        {line.costHint}. {line.notes}
                      </p>
                    )}

                    {detail.canManageFormulas ? (
                      <form
                        action={deleteFinishedProductFormulaLineAction}
                        className="mt-3"
                      >
                        <input
                          name="finished_product_id"
                          type="hidden"
                          value={detail.finishedProduct.id}
                        />
                        <input
                          name="formula_version_id"
                          type="hidden"
                          value={selectedVersion.id}
                        />
                        <input name="line_id" type="hidden" value={line.id} />
                        <button className={dangerButtonClass} type="submit">
                          Remove line
                        </button>
                      </form>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        ) : null}

        {selectedVersion && detail.canManageFormulas ? (
          <SectionCard
            title="Add formula line"
            description="Use current tenant internal items only. Component, ingredient and packaging inputs are supported in v1."
          >
            <form
              action={addFinishedProductFormulaLineAction}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_120px_100px_minmax(140px,1fr)_minmax(140px,1fr)_minmax(160px,1fr)]"
            >
              <input
                name="finished_product_id"
                type="hidden"
                value={detail.finishedProduct.id}
              />
              <input
                name="formula_version_id"
                type="hidden"
                value={selectedVersion.id}
              />
              <FormField label="Input item">
                <select
                  className={selectClass}
                  name="input_internal_item_id"
                  required
                >
                  <option value="">Select input</option>
                  {detail.selectableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.displayName} ({item.itemType}
                      {item.baseUnit ? `, ${item.baseUnit}` : ""})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Quantity">
                <input
                  className={inputClass}
                  min="0.001"
                  name="quantity"
                  placeholder="100"
                  required
                  step="0.001"
                  type="number"
                />
              </FormField>
              <FormField label="Unit">
                <input
                  className={inputClass}
                  name="unit"
                  placeholder="g"
                  required
                />
              </FormField>
              <FormField label="Preparation">
                <input
                  className={inputClass}
                  name="preparation_state"
                  placeholder="cooked"
                />
              </FormField>
              <FormField label="Loss note">
                <input
                  className={inputClass}
                  name="loss_note"
                  placeholder="optional"
                />
              </FormField>
              <FormField label="Notes">
                <input
                  className={inputClass}
                  name="notes"
                  placeholder="tray, garnish, staff note"
                />
              </FormField>
              <div className="md:col-span-2 xl:col-span-6">
                <button className={primaryButtonClass} type="submit">
                  Add formula line
                </button>
              </div>
            </form>
          </SectionCard>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Cost readiness"
            description="Estimated cost appears only when all lines have safe cost sources and exact units."
            action={
              <StatusBadge tone={detail.costReadiness.tone}>
                {detail.costReadiness.status}
              </StatusBadge>
            }
          >
            <p className="text-lg font-bold text-slate-950">
              {detail.costReadiness.estimatedCost}
            </p>
            <ul className="mt-4 space-y-2">
              {detail.costReadiness.issues.map((issue) => (
                <li
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                  key={issue}
                >
                  {issue}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Margin readiness"
            description="Margin remains separate from formula cost and is blocked until sell price storage exists."
            action={
              <StatusBadge tone={detail.marginReadiness.tone}>
                {detail.marginReadiness.status}
              </StatusBadge>
            }
          >
            <ul className="space-y-2">
              {detail.marginReadiness.issues.map((issue) => (
                <li
                  className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                  key={issue}
                >
                  {issue}
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>

        <SectionCard
          title="Formula composition"
          description="Breakdown of currently visible active lines."
        >
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Components", componentCount],
              ["Ingredients", ingredientCount],
              ["Packaging", packagingCount],
              ["Other", otherCount],
            ].map(([label, value]) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50/70 px-4 py-3"
                key={label}
              >
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
