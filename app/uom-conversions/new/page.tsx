import Link from "next/link";

import { createUomConversionRuleAction } from "@/app/uom-conversions/actions";
import { UomConversionRuleForm } from "@/app/uom-conversions/uom-conversion-form";
import { AppShell } from "@/components/app-shell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/ui";
import { fetchUomConversionFormOptions } from "@/lib/uom-conversion-data";

type PageProps = {
  searchParams: Promise<{
    uom?: string;
  }>;
};

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    invalid_quantity: "Enter source and target quantities greater than zero.",
    missing_units: "Enter both source and target units.",
    same_units: "Source and target units must be different.",
    invalid_dates: "Effective to date cannot be earlier than effective from date.",
    missing_internal_item: "Select an internal item for internal item conversion rules.",
    missing_supplier_item: "Select a supplier item for supplier item conversion rules.",
    invalid_internal_item: "The selected internal item is not available in this workspace.",
    invalid_supplier: "The selected supplier is not available in this workspace.",
    invalid_supplier_item: "The selected supplier item is not available in this workspace.",
    duplicate_active: "An active conversion rule already exists for this scope and unit pair.",
    error: "The UOM conversion rule could not be created. Check permissions and data, then try again.",
  };

  return messages[status] ?? "Review the conversion rule details and try again.";
}

export default async function NewUomConversionPage({ searchParams }: PageProps) {
  const [options, query] = await Promise.all([
    fetchUomConversionFormOptions(),
    searchParams,
  ]);
  const message = actionMessage(query.uom);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <StatusBadge tone="info">Draft first</StatusBadge>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Create a reviewed draft conversion rule for a known pack size.
                Activation is a separate manage action so rules can be checked
                before future costing, receiving or production workflows rely on
                them.
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

        {message ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {message}
          </div>
        ) : null}

        <SectionCard
          title="New Conversion Rule"
          description="Create real tenant conversion rules only. No sample conversion data is seeded."
          action={
            options.canCreateUomConversions ? (
              <StatusBadge tone="success">uom_conversions.create</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Read only</StatusBadge>
            )
          }
        >
          {options.canCreateUomConversions ? (
            <UomConversionRuleForm
              action={createUomConversionRuleAction}
              buttonLabel="Create draft rule"
              internalItems={options.internalItems}
              suppliers={options.suppliers}
              supplierItems={options.supplierItems}
            />
          ) : (
            <EmptyState
              title="Read-only UOM conversion access"
              description="Creating UOM conversion rules requires uom_conversions.create."
            />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
