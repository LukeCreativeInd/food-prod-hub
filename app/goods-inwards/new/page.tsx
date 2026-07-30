import Link from "next/link";

import { createInventoryReceiptAction } from "@/app/goods-inwards/actions";
import { AppShell } from "@/components/app-shell";
import { AlertCard, PageActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { fetchGoodsInwardsFormOptions } from "@/lib/goods-inwards-data";

type PageProps = {
  searchParams: Promise<{
    receipt?: string;
  }>;
};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-300";

function nowForDateTimeInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<string, string> = {
    invalid_received_at: "Enter a valid received date and time.",
    invalid_supplier: "The selected supplier could not be found for this workspace.",
    error: "The receipt could not be created. Check permissions and try again.",
  };

  return messages[status] ?? "Receipt action could not be completed.";
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

export default async function NewGoodsInwardsReceiptPage({
  searchParams,
}: PageProps) {
  const [options, query] = await Promise.all([
    fetchGoodsInwardsFormOptions("inventory_receipts.create"),
    searchParams,
  ]);
  const message = actionMessage(query.receipt);

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
            <span>{message}</span>
            <StatusBadge tone="warning">{query.receipt ?? "review"}</StatusBadge>
          </div>
        ) : null}

        <SectionCard
          title="New receipt"
          description="Create a draft receiving document for a supplier delivery. Stock is not received until the receipt is reviewed and posted."
          action={<StatusBadge tone="warning">Draft first</StatusBadge>}
        >
          <form action={createInventoryReceiptAction} className="grid gap-4 xl:grid-cols-2">
            <FormField label="Supplier">
              <select className={selectClass} name="supplier_id" defaultValue="">
                <option value="">No supplier selected</option>
                {options.suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.displayName}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Received date/time">
              <input
                className={inputClass}
                defaultValue={nowForDateTimeInput()}
                name="received_at"
                required
                type="datetime-local"
              />
            </FormField>
            <FormField label="Supplier reference">
              <input
                className={inputClass}
                name="supplier_reference"
                placeholder="Delivery docket, invoice ref or supplier note"
              />
            </FormField>
            <FormField label="Notes">
              <input
                className={inputClass}
                name="notes"
                placeholder="Optional receiving notes"
              />
            </FormField>
            <div className="flex flex-wrap gap-2 xl:col-span-2">
              <button className={primaryButtonClass} type="submit">
                Create draft receipt
              </button>
              <PageActionButton href="/goods-inwards" variant="secondary">
                Back to Goods Inwards
              </PageActionButton>
            </div>
          </form>
        </SectionCard>

        <AlertCard
          title="Manual receiving only"
          description="Supplier Invoice Intake is not connected to receiving yet. Create receipt lines manually for now."
          meta="Task 195"
          tone="info"
        />

        {options.suppliers.length === 0 || options.internalItems.length === 0 || options.locations.length === 0 ? (
          <SectionCard
            title="Setup needed"
            description="Goods Inwards needs suppliers, receivable internal items and active stock locations."
          >
            <div className="grid gap-3 md:grid-cols-3">
              <Link
                href="/suppliers"
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-900 hover:border-[color:var(--tenant-primary-border)]"
              >
                Suppliers: {options.suppliers.length}
              </Link>
              <Link
                href="/products"
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-900 hover:border-[color:var(--tenant-primary-border)]"
              >
                Receivable items: {options.internalItems.length}
              </Link>
              <Link
                href="/stock-locations"
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-900 hover:border-[color:var(--tenant-primary-border)]"
              >
                Stock locations: {options.locations.length}
              </Link>
            </div>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
