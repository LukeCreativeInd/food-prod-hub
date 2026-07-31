import Link from "next/link";
import { notFound } from "next/navigation";

import {
  activateUomConversionRuleAction,
  archiveUomConversionRuleAction,
  deactivateUomConversionRuleAction,
  updateUomConversionRuleAction,
} from "@/app/uom-conversions/actions";
import {
  UomConversionRuleForm,
  uomPrimaryButtonClass,
} from "@/app/uom-conversions/uom-conversion-form";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/ui";
import { fetchUomConversionRule } from "@/lib/uom-conversion-data";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    uom?: string;
  }>;
};

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";
const dangerButtonClass =
  "inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function RuleStatusActions({
  ruleId,
  status,
  isArchived,
}: {
  ruleId: string;
  status: string;
  isArchived: boolean;
}) {
  if (isArchived) {
    return (
      <EmptyState
        title="Archived conversion rule"
        description="Archived UOM conversion rules are retained for history and are not deleted."
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "active" ? (
        <form action={activateUomConversionRuleAction}>
          <input name="rule_id" type="hidden" value={ruleId} />
          <button className={uomPrimaryButtonClass} type="submit">
            Activate
          </button>
        </form>
      ) : null}
      {status === "active" ? (
        <form action={deactivateUomConversionRuleAction}>
          <input name="rule_id" type="hidden" value={ruleId} />
          <button className={secondaryButtonClass} type="submit">
            Deactivate
          </button>
        </form>
      ) : null}
      <form action={archiveUomConversionRuleAction}>
        <input name="rule_id" type="hidden" value={ruleId} />
        <button className={dangerButtonClass} type="submit">
          Archive
        </button>
      </form>
    </div>
  );
}

export default async function UomConversionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await fetchUomConversionRule(id);

  if (!detail) {
    notFound();
  }

  const message = actionMessage(query.uom);
  const rule = detail.rule;

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
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={rule.tone}>{rule.statusLabel}</StatusBadge>
                <StatusBadge tone="neutral">{rule.ruleScopeLabel}</StatusBadge>
                <StatusBadge tone="info">{rule.confidenceLabel}</StatusBadge>
              </div>
              <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                {rule.fromQuantity} {rule.fromUnit} = {rule.toQuantity} {rule.toUnit}
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {rule.contextLabel}. This rule is a reviewed interpretation
                between units only; it does not change historical invoices,
                stock movements, formulas or costing snapshots.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href="/uom-conversions"
            >
              Back to UOM Conversions
            </Link>
          </div>
        </section>

        <SectionCard
          title="Rule Details"
          description="Stored conversion metadata and source-of-truth boundaries."
          action={<StatusBadge tone="success">Real data</StatusBadge>}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Scope" value={rule.ruleScopeLabel} />
            <DetailItem label="Context" value={rule.contextLabel} />
            <DetailItem label="Factor" value={rule.conversionFactor} />
            <DetailItem label="Direction" value={rule.allowReverseLabel} />
            <DetailItem label="Source" value={rule.sourceLabel} />
            <DetailItem label="Effective from" value={rule.effectiveFrom} />
            <DetailItem label="Effective to" value={rule.effectiveTo} />
            <DetailItem label="Reviewed at" value={rule.reviewedAt} />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{rule.notes}</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Source Of Truth"
          description="These rules prepare future workflows without mutating existing records."
          action={<StatusBadge tone="warning">Interpretation only</StatusBadge>}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Does not replace supplier invoices",
              "Does not replace approved prices",
              "Does not alter formula quantities",
              "Does not alter historical snapshots",
              "Does not alter stock movements",
              "Does not create or consume stock",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Status Actions"
          description="Activate, deactivate or archive without deleting conversion history."
          action={
            detail.canManageUomConversions ? (
              <StatusBadge tone="success">uom_conversions.manage</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Read only</StatusBadge>
            )
          }
        >
          {detail.canManageUomConversions ? (
            <RuleStatusActions
              ruleId={rule.id}
              status={rule.status}
              isArchived={rule.isArchived}
            />
          ) : (
            <EmptyState
              title="Read-only status access"
              description="Activating, deactivating or archiving UOM conversion rules requires uom_conversions.manage."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Edit Conversion Rule"
          description="Manage users can update the reviewed conversion details. Duplicate active open-ended rules are blocked."
          action={
            detail.canManageUomConversions ? (
              <StatusBadge tone="success">uom_conversions.manage</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Read only</StatusBadge>
            )
          }
        >
          {detail.canManageUomConversions && !rule.isArchived ? (
            <UomConversionRuleForm
              action={updateUomConversionRuleAction}
              buttonLabel="Save changes"
              internalItems={detail.internalItems}
              suppliers={detail.suppliers}
              supplierItems={detail.supplierItems}
              rule={rule}
            />
          ) : (
            <EmptyState
              title={rule.isArchived ? "Archived rule" : "Read-only UOM conversion access"}
              description={
                rule.isArchived
                  ? "Archived rules are retained for history and are not edited in v1."
                  : "Editing UOM conversion rules requires uom_conversions.manage."
              }
            />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
