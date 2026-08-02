import {
  createDispatchRunAction,
  updateDispatchRunAction,
} from "@/app/logistics/actions";
import type { LogisticsFormOptions } from "@/lib/logistics-data";
import { dispatchTypeLabels, dispatchTypes } from "@/lib/logistics-types";

type DispatchRunFormValues = {
  id: string;
  name: string;
  dispatchType: string;
  dispatchDate: string;
  deliveryDate: string;
  defaultCarrierId: string;
  defaultCarrierServiceId: string;
  notes: string;
};

type DispatchRunFormProps = {
  mode: "create" | "edit";
  options: LogisticsFormOptions;
  values?: DispatchRunFormValues;
};

const fieldClassName =
  "mt-1 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const labelClassName = "text-xs font-semibold uppercase text-slate-500";

export function DispatchRunForm({ mode, options, values }: DispatchRunFormProps) {
  const action = mode === "create" ? createDispatchRunAction : updateDispatchRunAction;
  return (
    <form action={action} className="space-y-5">
      {values ? <input name="dispatch_run_id" type="hidden" value={values.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className={labelClassName}>Dispatch type</span>
          <select className={fieldClassName} defaultValue={values?.dispatchType ?? "other"} name="dispatch_type" required>
            {dispatchTypes.map((type) => (
              <option key={type} value={type}>{dispatchTypeLabels[type]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClassName}>Dispatch date</span>
          <input className={fieldClassName} defaultValue={values?.dispatchDate} name="dispatch_date" required type="date" />
        </label>
        <label className="block">
          <span className={labelClassName}>Delivery date</span>
          <input className={fieldClassName} defaultValue={values?.deliveryDate} name="delivery_date" required type="date" />
        </label>
        <label className="block md:col-span-2 xl:col-span-1">
          <span className={labelClassName}>Name</span>
          <input className={fieldClassName} defaultValue={values?.name} name="name" placeholder="Optional operational name" />
        </label>
        <label className="block">
          <span className={labelClassName}>Default carrier</span>
          <select className={fieldClassName} defaultValue={values?.defaultCarrierId ?? ""} name="default_carrier_id">
            <option value="">No default carrier</option>
            {options.carriers.map((carrier) => (
              <option key={carrier.id} value={carrier.id}>{carrier.name} ({carrier.code})</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClassName}>Default service</span>
          <select className={fieldClassName} defaultValue={values?.defaultCarrierServiceId ?? ""} name="default_carrier_service_id">
            <option value="">No default service</option>
            {options.services.map((service) => (
              <option key={service.id} value={service.id}>{service.name} ({service.code})</option>
            ))}
          </select>
          <span className="mt-1 block text-xs leading-5 text-slate-500">Services must belong to the selected carrier.</span>
        </label>
      </div>
      <label className="block">
        <span className={labelClassName}>Notes</span>
        <textarea className={`${fieldClassName} min-h-24`} defaultValue={values?.notes} name="notes" placeholder="Dispatch context or handling notes" />
      </label>
      {options.carriers.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          No carrier configuration exists yet. Carrier assignment is optional, so the run can still be created and reviewed manually.
        </p>
      ) : null}
      <button className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 sm:w-auto" type="submit">
        {mode === "create" ? "Create draft dispatch run" : "Save dispatch run"}
      </button>
    </form>
  );
}
