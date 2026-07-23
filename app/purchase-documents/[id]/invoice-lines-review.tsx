"use client";

import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/ui";
import type { PurchaseDocumentLine } from "@/lib/purchase-document-intake";

const classificationOptions = [
  ["ingredient", "Ingredient"],
  ["packaging", "Packaging"],
  ["consumable", "Consumable"],
  ["equipment", "Equipment"],
  ["non_stock_charge", "Non-stock charge"],
  ["informational", "Informational"],
  ["unknown", "Unknown"],
];

const lineStatusOptions = [
  ["needs_review", "Needs review"],
  ["ready", "Ready"],
  ["deferred", "Deferred"],
  ["ignored", "Ignored"],
  ["committed", "Committed"],
];

const stockLineClassifications = [
  "ingredient",
  "packaging",
  "consumable",
  "equipment",
];

const internalItemNamePrefix = "Internal item name:";
const repeatMatchPrefix = "Repeat match:";

function cleanText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function defaultCorrectedValue(
  corrected: string | number | null,
  normalised: string | number | null,
  source: string | number | null,
) {
  return corrected ?? normalised ?? source ?? "";
}

function formatCurrency(value: number | null, currency: string) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(value);
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: string) {
  if (status === "ready" || status === "committed" || status === "ignored") {
    return "success" as const;
  }

  if (status === "failed" || status === "deferred") {
    return "danger" as const;
  }

  if (status === "unreviewed") {
    return "info" as const;
  }

  return "warning" as const;
}

function getReviewedInternalItemName(line: Pick<PurchaseDocumentLine, "review_notes">) {
  const markerLine = line.review_notes
    ?.split("\n")
    .find((noteLine) => noteLine.startsWith(internalItemNamePrefix));

  return cleanText(markerLine?.slice(internalItemNamePrefix.length));
}

function getReviewNotesWithoutStructuredMarkers(reviewNotes: string | null) {
  return cleanText(
    reviewNotes
      ?.split("\n")
      .filter(
        (noteLine) =>
          !noteLine.startsWith(internalItemNamePrefix) &&
          !noteLine.startsWith(repeatMatchPrefix),
      )
      .join("\n"),
  );
}

function getRepeatMatchNotes(line: Pick<PurchaseDocumentLine, "review_notes">) {
  return (
    line.review_notes
      ?.split("\n")
      .filter((noteLine) => noteLine.startsWith(repeatMatchPrefix))
      .map((noteLine) => noteLine.slice(repeatMatchPrefix.length).trim())
      .filter(Boolean) ?? []
  );
}

function repeatNoteTone(note: string) {
  if (
    note.includes("Price change detected") ||
    note.includes("required") ||
    note.includes("New ")
  ) {
    return "warning" as const;
  }

  if (note.includes("not found")) {
    return "warning" as const;
  }

  if (
    note.includes("Matched") ||
    note.includes("Known") ||
    note.includes("found") ||
    note.includes("unchanged") ||
    note.includes("current")
  ) {
    return "success" as const;
  }

  return "info" as const;
}

function priceComparisonNotes(notes: string[]) {
  return notes.filter(
    (note) =>
      note.includes("Price unchanged") ||
      note.includes("Price change detected") ||
      note.includes("Price change amount") ||
      note.includes("Price decision"),
  );
}

function sourceValue(
  corrected: string | number | null,
  normalised: string | number | null,
  source: string | number | null,
) {
  return corrected ?? normalised ?? source ?? null;
}

function numericSourceValue(
  corrected: number | null,
  normalised: number | null,
  source: number | null,
) {
  return corrected ?? normalised ?? source ?? null;
}

function lineReviewDefaults(line: PurchaseDocumentLine) {
  return {
    itemCode: defaultCorrectedValue(
      line.corrected_item_code,
      line.normalised_item_code,
      line.source_item_code,
    ),
    description: defaultCorrectedValue(
      line.corrected_description,
      line.normalised_description,
      line.source_description,
    ),
    quantity: defaultCorrectedValue(
      line.corrected_quantity,
      line.normalised_quantity,
      line.source_quantity,
    ),
    unit: defaultCorrectedValue(
      line.corrected_unit,
      line.normalised_unit,
      line.source_unit,
    ),
    unitPrice: defaultCorrectedValue(
      line.corrected_unit_price,
      line.normalised_unit_price,
      line.source_unit_price,
    ),
    tax: defaultCorrectedValue(
      line.corrected_tax,
      line.normalised_tax,
      line.source_tax,
    ),
    lineTotal: defaultCorrectedValue(
      line.corrected_line_total,
      line.normalised_line_total,
      line.source_line_total,
    ),
    internalItemName: getReviewedInternalItemName(line) ?? "",
    reviewNotes: getReviewNotesWithoutStructuredMarkers(line.review_notes) ?? "",
  };
}

function isStockLine(line: PurchaseDocumentLine) {
  return stockLineClassifications.includes(line.classification);
}

function priceDecisionLabel(line: PurchaseDocumentLine) {
  const priceNotes = priceComparisonNotes(getRepeatMatchNotes(line));

  if (priceNotes.some((note) => note.includes("Price unchanged"))) {
    return "Observation only";
  }

  if (priceNotes.some((note) => note.includes("Price change detected"))) {
    return "Review price decision";
  }

  if (line.classification === "informational") {
    return "Informational / ignored";
  }

  return "Update current price";
}

function lineIssues(line: PurchaseDocumentLine) {
  const issues: string[] = [];

  if (line.classification === "unknown") {
    issues.push("Classification");
  }

  if (line.status === "deferred") {
    issues.push("Deferred");
  }

  if (isStockLine(line)) {
    if (
      !sourceValue(
        line.corrected_item_code,
        line.normalised_item_code,
        line.source_item_code,
      ) &&
      !sourceValue(
        line.corrected_description,
        line.normalised_description,
        line.source_description,
      )
    ) {
      issues.push("Code/description");
    }

    if (
      numericSourceValue(
        line.corrected_quantity,
        line.normalised_quantity,
        line.source_quantity,
      ) === null
    ) {
      issues.push("Quantity");
    }

    if (!sourceValue(line.corrected_unit, line.normalised_unit, line.source_unit)) {
      issues.push("Unit");
    }

    if (
      numericSourceValue(
        line.corrected_unit_price,
        line.normalised_unit_price,
        line.source_unit_price,
      ) === null
    ) {
      issues.push("Unit price");
    }

    if (!getReviewedInternalItemName(line)) {
      issues.push("Internal item");
    }
  }

  if (priceDecisionLabel(line) === "Review price decision") {
    issues.push("Price decision");
  }

  return issues;
}

function lineIsReady(line: PurchaseDocumentLine) {
  if (line.status === "committed" || line.status === "ignored") {
    return true;
  }

  return lineIssues(line).length === 0;
}

function TextInput({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string | number | null;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
      />
    </label>
  );
}

function SelectInput({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[][] | readonly string[][];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
      >
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function RowValue({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[0.68rem] font-semibold uppercase text-slate-500 lg:hidden">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800 lg:mt-0">
        {value}
      </p>
    </div>
  );
}

type InvoiceLinesReviewProps = {
  lines: PurchaseDocumentLine[];
  currency: string;
  isCommitted: boolean;
};

export function InvoiceLinesReview({
  lines,
  currency,
  isCommitted,
}: InvoiceLinesReviewProps) {
  const lineSummaries = useMemo(
    () =>
      lines.map((line) => ({
        line,
        issues: lineIssues(line),
        isReady: lineIsReady(line),
        defaults: lineReviewDefaults(line),
        repeatNotes: getRepeatMatchNotes(line),
        priceNotes: priceComparisonNotes(getRepeatMatchNotes(line)),
        priceDecision: priceDecisionLabel(line),
      })),
    [lines],
  );
  const [expandedLineIds, setExpandedLineIds] = useState<Set<string>>(
    () =>
      new Set(
        lineSummaries
          .filter((summary) => summary.issues.length > 0)
          .map((summary) => summary.line.id),
      ),
  );
  const [issuesOnly, setIssuesOnly] = useState(false);
  const totalLines = lineSummaries.length;
  const readyLines = lineSummaries.filter((summary) => summary.isReady).length;
  const needsReviewLines = totalLines - readyLines;
  const informationalLines = lineSummaries.filter(
    (summary) =>
      summary.line.classification === "informational" ||
      summary.line.status === "ignored",
  ).length;
  const missingInternalNames = lineSummaries.filter((summary) =>
    summary.issues.includes("Internal item"),
  ).length;
  const priceChangesDetected = lineSummaries.filter((summary) =>
    summary.priceNotes.some((note) => note.includes("Price change detected")),
  ).length;

  function expandAll() {
    setExpandedLineIds(new Set(lines.map((line) => line.id)));
    setIssuesOnly(false);
  }

  function collapseAll() {
    setExpandedLineIds(new Set());
  }

  function expandIssues() {
    setExpandedLineIds(
      new Set(
        lineSummaries
          .filter((summary) => summary.issues.length > 0)
          .map((summary) => summary.line.id),
      ),
    );
    setIssuesOnly(true);
  }

  function toggleLine(lineId: string) {
    setExpandedLineIds((current) => {
      const next = new Set(current);

      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }

      return next;
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Invoice lines</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Compact review rows keep larger invoices scannable. Expand a row
              to edit corrected values, classification and notes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase text-slate-700 transition hover:bg-slate-50"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase text-slate-700 transition hover:bg-slate-50"
            >
              Collapse all
            </button>
            <button
              type="button"
              onClick={expandIssues}
              className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold uppercase text-amber-900 transition hover:bg-amber-100"
            >
              Show issues only
            </button>
            {issuesOnly ? (
              <button
                type="button"
                onClick={() => setIssuesOnly(false)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase text-slate-700 transition hover:bg-slate-50"
              >
                Show all
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {(
            [
            ["Total lines", String(totalLines), "info" as const],
            ["Ready", String(readyLines), "success" as const],
            ["Needs review", String(needsReviewLines), needsReviewLines === 0 ? "success" as const : "warning" as const],
            ["Info/ignored", String(informationalLines), "neutral" as const],
            ["Missing internal", String(missingInternalNames), missingInternalNames === 0 ? "success" as const : "warning" as const],
            ["Price changes", String(priceChangesDetected), priceChangesDetected === 0 ? "neutral" as const : "warning" as const],
          ] satisfies Array<
            [
              string,
              string,
              "neutral" | "success" | "warning" | "danger" | "info",
            ]
          >).map(([label, value, tone]) => (
            <div
              key={label}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <p className="text-xs font-semibold uppercase text-slate-500">
                {label}
              </p>
              <div className="mt-2">
                <StatusBadge tone={tone}>{value}</StatusBadge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          Bulk mark-ready and dedicated per-line price decision controls are
          planned follow-ups. This pass keeps save/commit behaviour unchanged.
        </div>
      </div>

      {lineSummaries.length > 0 ? (
        <div className="divide-y divide-slate-200">
          <div className="hidden grid-cols-[0.72fr_0.85fr_2fr_0.72fr_0.72fr_0.72fr_0.9fr_1.15fr_0.95fr_1fr_0.72fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500 lg:grid">
            <span>Status</span>
            <span>Supplier code</span>
            <span>Supplier description</span>
            <span>Qty/unit</span>
            <span>Unit price</span>
            <span>Line total</span>
            <span>Classification</span>
            <span>Internal item</span>
            <span>Price decision</span>
            <span>Issues</span>
            <span>Action</span>
          </div>
          {lineSummaries.map((summary) => {
            const { line, defaults, repeatNotes, priceNotes } = summary;
            const expanded = expandedLineIds.has(line.id);
            const hiddenByFilter = issuesOnly && summary.issues.length === 0;

            return (
              <details
                key={line.id}
                open={expanded}
                className={hiddenByFilter ? "hidden" : "group"}
                onToggle={(event) => {
                  if ((event.target as HTMLDetailsElement).open !== expanded) {
                    toggleLine(line.id);
                  }
                }}
              >
                <summary className="grid cursor-pointer list-none gap-3 px-4 py-4 transition hover:bg-slate-50 lg:grid-cols-[0.72fr_0.85fr_2fr_0.72fr_0.72fr_0.72fr_0.9fr_1.15fr_0.95fr_1fr_0.72fr] lg:items-center">
                  <input type="hidden" name="line_ids" value={line.id} />
                  <div>
                    <StatusBadge
                      tone={
                        summary.isReady ? "success" : statusTone(line.status)
                      }
                    >
                      {summary.isReady ? "Ready" : formatStatus(line.status)}
                    </StatusBadge>
                  </div>
                  <RowValue
                    label="Supplier code"
                    value={line.source_item_code ?? "No code"}
                  />
                  <RowValue
                    label="Supplier description"
                    value={line.source_description ?? "No description"}
                  />
                  <RowValue
                    label="Qty/unit"
                    value={`${line.source_quantity ?? ""} ${
                      line.source_unit ?? ""
                    }`.trim()}
                  />
                  <RowValue
                    label="Unit price"
                    value={formatCurrency(line.source_unit_price, currency)}
                  />
                  <RowValue
                    label="Line total"
                    value={formatCurrency(line.source_line_total, currency)}
                  />
                  <RowValue
                    label="Classification"
                    value={formatStatus(line.classification)}
                  />
                  <RowValue
                    label="Internal item"
                    value={
                      getReviewedInternalItemName(line) ??
                      (isStockLine(line) ? "Missing" : "Not required")
                    }
                  />
                  <RowValue label="Price decision" value={summary.priceDecision} />
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase text-slate-500 lg:hidden">
                      Issues
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1 lg:mt-0">
                      {summary.issues.length > 0 ? (
                        summary.issues.map((issue) => (
                          <StatusBadge key={issue} tone="warning">
                            {issue}
                          </StatusBadge>
                        ))
                      ) : (
                        <StatusBadge tone="success">None</StatusBadge>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      toggleLine(line.id);
                    }}
                    className="w-fit rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase text-slate-700 transition hover:bg-slate-50"
                  >
                    {expanded ? "Collapse" : "Review"}
                  </button>
                </summary>

                <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                  {repeatNotes.length > 0 ? (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {repeatNotes.map((note) => (
                        <StatusBadge key={note} tone={repeatNoteTone(note)}>
                          {note}
                        </StatusBadge>
                      ))}
                    </div>
                  ) : null}
                  {priceNotes.length > 0 ? (
                    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase text-amber-800">
                        Price comparison
                      </p>
                      <div className="mt-2 space-y-1">
                        {priceNotes.map((note) => (
                          <p
                            key={note}
                            className="text-sm font-semibold text-amber-950"
                          >
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SelectInput
                      label="Classification"
                      name={`line_${line.id}_classification`}
                      defaultValue={line.classification}
                      options={classificationOptions}
                    />
                    <SelectInput
                      label="Line status"
                      name={`line_${line.id}_status`}
                      defaultValue={
                        lineStatusOptions.some(([value]) => value === line.status)
                          ? line.status
                          : "needs_review"
                      }
                      options={lineStatusOptions}
                    />
                    <TextInput
                      label="Corrected supplier code"
                      name={`line_${line.id}_corrected_item_code`}
                      defaultValue={defaults.itemCode}
                    />
                    <TextInput
                      label="Corrected supplier description"
                      name={`line_${line.id}_corrected_description`}
                      defaultValue={defaults.description}
                    />
                    <TextInput
                      label="Corrected qty"
                      name={`line_${line.id}_corrected_quantity`}
                      type="number"
                      defaultValue={defaults.quantity}
                    />
                    <TextInput
                      label="Corrected unit"
                      name={`line_${line.id}_corrected_unit`}
                      defaultValue={defaults.unit}
                    />
                    <TextInput
                      label="Corrected unit price"
                      name={`line_${line.id}_corrected_unit_price`}
                      type="number"
                      defaultValue={defaults.unitPrice}
                    />
                    <TextInput
                      label="Corrected line total"
                      name={`line_${line.id}_corrected_line_total`}
                      type="number"
                      defaultValue={defaults.lineTotal}
                    />
                    <TextInput
                      label="Corrected tax"
                      name={`line_${line.id}_corrected_tax`}
                      type="number"
                      defaultValue={defaults.tax}
                    />
                    {isStockLine(line) ? (
                      <TextInput
                        label="Internal item name"
                        name={`line_${line.id}_internal_item_name`}
                        defaultValue={defaults.internalItemName}
                      />
                    ) : (
                      <label className="block">
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          Internal item name
                        </span>
                        <input
                          type="text"
                          disabled
                          value="Internal item not required"
                          className="mt-2 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500"
                        />
                      </label>
                    )}
                    <FieldPreview label="Price decision" value={summary.priceDecision} />
                    <label className="block md:col-span-2 xl:col-span-2">
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        Review notes
                      </span>
                      <textarea
                        name={`line_${line.id}_review_notes`}
                        defaultValue={defaults.reviewNotes}
                        rows={3}
                        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-clean-green-700 focus:ring-2 focus:ring-clean-green-100"
                      />
                    </label>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="p-5">
          <p className="text-sm leading-6 text-slate-600">
            No extracted invoice lines yet.
          </p>
        </div>
      )}
      {isCommitted ? (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600">
          This document is committed. Line details remain visible for review, but
          save and commit actions are locked.
        </div>
      ) : null}
    </section>
  );
}
