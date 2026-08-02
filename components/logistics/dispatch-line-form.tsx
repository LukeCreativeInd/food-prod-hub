import {
  addDispatchLineAction,
  updateDispatchLineAction,
} from "@/app/logistics/actions";
import type {
  DispatchLineDetail,
  LogisticsItemOption,
} from "@/lib/logistics-data";

type DispatchLineFormProps = {
  mode: "create" | "edit";
  runId: string;
  deliveryId: string;
  items: LogisticsItemOption[];
  nextLineNumber?: number;
  line?: DispatchLineDetail;
};

const fieldClassName =
  "mt-1 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const labelClassName = "text-xs font-semibold uppercase text-slate-500";

export function DispatchLineForm({
  mode,
  runId,
  deliveryId,
  items,
  nextLineNumber = 1,
  line,
}: DispatchLineFormProps) {
  return (
    <form action={mode === "create" ? addDispatchLineAction : updateDispatchLineAction} className="space-y-4">
      <input name="dispatch_run_id" type="hidden" value={runId} />
      <input name="delivery_id" type="hidden" value={deliveryId} />
      {line ? <input name="line_id" type="hidden" value={line.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="block xl:col-span-2">
          <span className={labelClassName}>Internal item reference</span>
          <select className={fieldClassName} defaultValue={line?.internalItemId ?? ""} name="internal_item_id">
            <option value="">No product master reference</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.label} ({item.itemType})</option>
            ))}
          </select>
        </label>
        <label className="block xl:col-span-2">
          <span className={labelClassName}>Item name snapshot</span>
          <input className={fieldClassName} defaultValue={line?.itemName} name="item_name_snapshot" required />
        </label>
        <label className="block">
          <span className={labelClassName}>Item code snapshot</span>
          <input className={fieldClassName} defaultValue={line?.itemCode} name="item_code_snapshot" />
        </label>
        <label className="block">
          <span className={labelClassName}>Line number</span>
          <input className={fieldClassName} defaultValue={line?.lineNumber ?? nextLineNumber} min="1" name="line_number" required step="1" type="number" />
        </label>
        <label className="block">
          <span className={labelClassName}>Quantity</span>
          <input className={fieldClassName} defaultValue={line?.quantityValue} min="0.001" name="quantity" required step="0.001" type="number" />
        </label>
        <label className="block">
          <span className={labelClassName}>Unit</span>
          <input className={fieldClassName} defaultValue={line?.unit} name="unit" placeholder="meals, cartons, kg" required />
        </label>
        <label className="block md:col-span-2 xl:col-span-2">
          <span className={labelClassName}>External line reference</span>
          <input className={fieldClassName} defaultValue={line?.externalLineReference} name="external_line_reference" />
        </label>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Snapshot fields preserve what was dispatched. Selecting an internal item does not edit the Products catalogue or allocate inventory.
      </p>
      <button className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 sm:w-auto" type="submit">
        {mode === "create" ? "Add item line" : "Save item line"}
      </button>
    </form>
  );
}
