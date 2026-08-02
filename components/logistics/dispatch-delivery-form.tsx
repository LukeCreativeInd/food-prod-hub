import {
  addDispatchDeliveryAction,
  updateDispatchDeliveryAction,
} from "@/app/logistics/actions";
import type {
  DispatchDeliveryDetail,
  LogisticsFormOptions,
} from "@/lib/logistics-data";
import {
  deliveryTemperatureClasses,
  temperatureClassLabels,
} from "@/lib/logistics-types";

type DispatchDeliveryFormProps = {
  mode: "create" | "edit";
  runId: string;
  defaultDeliveryDate: string;
  options: LogisticsFormOptions;
  delivery?: DispatchDeliveryDetail;
};

const fieldClassName =
  "mt-1 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const labelClassName = "text-xs font-semibold uppercase text-slate-500";

export function DispatchDeliveryForm({
  mode,
  runId,
  defaultDeliveryDate,
  options,
  delivery,
}: DispatchDeliveryFormProps) {
  return (
    <form action={mode === "create" ? addDispatchDeliveryAction : updateDispatchDeliveryAction} className="space-y-5">
      <input name="dispatch_run_id" type="hidden" value={runId} />
      {delivery ? <input name="delivery_id" type="hidden" value={delivery.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block xl:col-span-2">
          <span className={labelClassName}>Recipient name</span>
          <input className={fieldClassName} defaultValue={delivery?.recipientName} name="recipient_name" required />
        </label>
        <label className="block xl:col-span-2">
          <span className={labelClassName}>Company or store</span>
          <input className={fieldClassName} defaultValue={delivery?.companyName} name="company_name" />
        </label>
        <label className="block md:col-span-2 xl:col-span-3">
          <span className={labelClassName}>Address line 1</span>
          <input className={fieldClassName} defaultValue={delivery?.addressLine1} name="address_line_1" required />
        </label>
        <label className="block">
          <span className={labelClassName}>Address line 2</span>
          <input className={fieldClassName} defaultValue={delivery?.addressLine2} name="address_line_2" />
        </label>
        <label className="block">
          <span className={labelClassName}>Suburb / city</span>
          <input className={fieldClassName} defaultValue={delivery?.suburbCity} name="suburb_city" required />
        </label>
        <label className="block">
          <span className={labelClassName}>State / region</span>
          <input className={fieldClassName} defaultValue={delivery?.stateRegion} name="state_region" required />
        </label>
        <label className="block">
          <span className={labelClassName}>Postcode</span>
          <input className={fieldClassName} defaultValue={delivery?.postcode} name="postcode" required />
        </label>
        <label className="block">
          <span className={labelClassName}>Country code</span>
          <input className={fieldClassName} defaultValue={delivery?.countryCode ?? "AU"} maxLength={2} name="country_code" required />
        </label>
        <label className="block">
          <span className={labelClassName}>Delivery date</span>
          <input className={fieldClassName} defaultValue={delivery?.deliveryDateValue ?? defaultDeliveryDate} name="delivery_date" required type="date" />
        </label>
        <label className="block">
          <span className={labelClassName}>Carton count</span>
          <input className={fieldClassName} defaultValue={delivery?.cartonCount ?? 0} min="0" name="carton_count" required step="1" type="number" />
        </label>
        <label className="block">
          <span className={labelClassName}>Sequence</span>
          <input className={fieldClassName} defaultValue={delivery?.sequenceNumber ?? ""} min="1" name="sequence_number" step="1" type="number" />
        </label>
        <label className="block">
          <span className={labelClassName}>Total weight kg</span>
          <input className={fieldClassName} defaultValue={delivery?.totalWeightKgValue} min="0" name="total_weight_kg" step="0.001" type="number" />
        </label>
        <label className="block">
          <span className={labelClassName}>Temperature class</span>
          <select className={fieldClassName} defaultValue={delivery?.temperatureClassValue ?? ""} name="temperature_class">
            <option value="">Not set</option>
            {deliveryTemperatureClasses.map((value) => (
              <option key={value} value={value}>{temperatureClassLabels[value]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClassName}>Phone</span>
          <input className={fieldClassName} defaultValue={delivery?.phone} name="phone" type="tel" />
        </label>
        <label className="block">
          <span className={labelClassName}>Email</span>
          <input className={fieldClassName} defaultValue={delivery?.email} name="email" type="email" />
        </label>
        <label className="block">
          <span className={labelClassName}>External order reference</span>
          <input className={fieldClassName} defaultValue={delivery?.externalOrderReference} name="external_order_reference" />
        </label>
        <label className="block">
          <span className={labelClassName}>Source type</span>
          <input className={fieldClassName} defaultValue={delivery?.sourceType} name="source_type" placeholder="manual" />
        </label>
        <label className="block">
          <span className={labelClassName}>Source reference</span>
          <input className={fieldClassName} defaultValue={delivery?.sourceReference} name="source_reference" />
        </label>
        <label className="block">
          <span className={labelClassName}>Carrier override</span>
          <select className={fieldClassName} defaultValue={delivery?.carrierId ?? ""} name="carrier_id">
            <option value="">Use run default</option>
            {options.carriers.map((carrier) => (
              <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClassName}>Service override</span>
          <select className={fieldClassName} defaultValue={delivery?.carrierServiceId ?? ""} name="carrier_service_id">
            <option value="">Use run default</option>
            {options.services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className={labelClassName}>Delivery notes</span>
        <textarea className={`${fieldClassName} min-h-24`} defaultValue={delivery?.deliveryNotes} name="delivery_notes" />
      </label>
      <button className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 sm:w-auto" type="submit">
        {mode === "create" ? "Add delivery" : "Save delivery"}
      </button>
    </form>
  );
}
