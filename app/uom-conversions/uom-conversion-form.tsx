import {
  type UomConversionFormInternalItem,
  type UomConversionFormSupplier,
  type UomConversionFormSupplierItem,
  type UomConversionRuleDisplay,
} from "@/lib/uom-conversion-data";
import {
  UOM_CONVERSION_RULE_SCOPE_LABELS,
  UOM_CONVERSION_RULE_SCOPES,
} from "@/lib/uom-conversion-types";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const checkboxClass =
  "h-4 w-4 rounded border-slate-300 text-[var(--tenant-primary)] focus:ring-[var(--tenant-primary-soft)]";

export const uomPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-300";

function FormField({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      {children}
      {helper ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

export function UomConversionRuleForm({
  action,
  buttonLabel,
  rule,
  internalItems,
  suppliers,
  supplierItems,
}: {
  action: (formData: FormData) => void | Promise<void>;
  buttonLabel: string;
  rule?: UomConversionRuleDisplay;
  internalItems: UomConversionFormInternalItem[];
  suppliers: UomConversionFormSupplier[];
  supplierItems: UomConversionFormSupplierItem[];
}) {
  return (
    <form action={action} className="space-y-5">
      {rule ? <input name="rule_id" type="hidden" value={rule.id} /> : null}

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
        Use this for reviewed pack or purchase-unit conversions. Do not create
        rules for kg to g or l to ml; those safe metric conversions are already
        handled globally.
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FormField
          label="Rule scope"
          helper="Tenant-wide is generic. Internal item and supplier item rules are more specific."
        >
          <select
            className={selectClass}
            defaultValue={rule?.ruleScope ?? "tenant"}
            name="rule_scope"
            required
          >
            {UOM_CONVERSION_RULE_SCOPES.map((scope) => (
              <option key={scope} value={scope}>
                {UOM_CONVERSION_RULE_SCOPE_LABELS[scope]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Internal item"
          helper="Required for internal item rules. Optional context for supplier item rules."
        >
          <select
            className={selectClass}
            defaultValue={rule?.internalItemId ?? ""}
            name="internal_item_id"
          >
            <option value="">No internal item</option>
            {internalItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} - {item.itemType} / {item.baseUnit}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Supplier"
          helper="Optional unless you want supplier context recorded."
        >
          <select
            className={selectClass}
            defaultValue={rule?.supplierId ?? ""}
            name="supplier_id"
          >
            <option value="">No supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Supplier item"
          helper="Required for supplier item rules."
        >
          <select
            className={selectClass}
            defaultValue={rule?.supplierItemId ?? ""}
            name="supplier_item_id"
          >
            <option value="">No supplier item</option>
            {supplierItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} - {item.purchaseUnit} to {item.baseUnit}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="From quantity">
          <input
            className={inputClass}
            defaultValue={rule?.fromQuantityValue ?? "1"}
            min="0.000001"
            name="from_quantity"
            required
            step="0.000001"
            type="number"
          />
        </FormField>

        <FormField label="From unit">
          <input
            className={inputClass}
            defaultValue={rule?.fromUnit ?? ""}
            name="from_unit"
            placeholder="box, bunch, carton"
            required
          />
        </FormField>

        <FormField label="To quantity">
          <input
            className={inputClass}
            defaultValue={rule?.toQuantityValue ?? ""}
            min="0.000001"
            name="to_quantity"
            required
            step="0.000001"
            type="number"
          />
        </FormField>

        <FormField label="To unit">
          <input
            className={inputClass}
            defaultValue={rule?.toUnit ?? ""}
            name="to_unit"
            placeholder="g, kg, each, l"
            required
          />
        </FormField>

        <FormField label="Effective from">
          <input
            className={inputClass}
            defaultValue={rule?.effectiveFromValue ?? ""}
            name="effective_from"
            type="date"
          />
        </FormField>

        <FormField label="Effective to">
          <input
            className={inputClass}
            defaultValue={rule?.effectiveToValue ?? ""}
            name="effective_to"
            type="date"
          />
        </FormField>

        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              className={checkboxClass}
              defaultChecked={rule?.allowReverse ?? false}
              name="allow_reverse"
              type="checkbox"
            />
            Allow reverse conversion
          </label>
        </div>
      </div>

      <FormField
        label="Notes"
        helper="Keep notes short and practical, such as the source pack size or review context."
      >
        <textarea
          className={`${inputClass} min-h-24`}
          defaultValue={rule?.notesValue ?? ""}
          name="notes"
          placeholder="Optional review note"
        />
      </FormField>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          Conversion factor is calculated on save as target quantity divided by
          source quantity.
        </p>
        <button className={uomPrimaryButtonClass} type="submit">
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
