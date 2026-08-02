"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  type CarrierConfigurationActionState,
  type CarrierServiceFormValues,
  createCarrierServiceAction,
  updateCarrierServiceAction,
} from "@/app/logistics/carriers/actions";
import type { LogisticsCarrierServiceItem } from "@/lib/logistics-configuration-data";
import {
  deliveryTemperatureClasses,
  logisticsCarrierServiceTypeLabels,
  logisticsCarrierServiceTypes,
  temperatureClassLabels,
} from "@/lib/logistics-types";

const fieldClassName =
  "mt-1 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)]";
const labelClassName = "text-xs font-semibold uppercase text-slate-500";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-busy={pending}
      className="inline-flex w-full items-center justify-center rounded-md bg-[var(--tenant-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving..." : editing ? "Save service" : "Add service"}
    </button>
  );
}

export function CarrierServiceForm({ carrierId, service }: { carrierId: string; service?: LogisticsCarrierServiceItem }) {
  const initialValues: CarrierServiceFormValues = {
    name: service?.name ?? "",
    code: service?.code ?? "",
    serviceType: service?.serviceType ?? "standard",
    status: service?.status === "inactive" ? "inactive" : "active",
    temperatureClass: service?.temperatureClass ?? "",
    notes: service?.notesValue ?? "",
  };
  const initialState: CarrierConfigurationActionState<CarrierServiceFormValues> = {
    status: "idle",
    message: "",
    values: initialValues,
  };
  const [state, formAction] = useActionState(
    service ? updateCarrierServiceAction : createCarrierServiceAction,
    initialState,
  );
  const values = state.values;
  const codeHasError = state.status === "error" && state.field === "code";

  return (
    <form action={formAction} className="space-y-4" key={`${state.message}:${values.code}:${values.name}`}>
      <input name="carrier_id" type="hidden" value={carrierId} />
      {service ? <input name="service_id" type="hidden" value={service.id} /> : null}
      {state.status === "error" && !state.field ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900" role="alert">
          {state.message}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="block min-w-0">
          <span className={labelClassName}>Service name</span>
          <input className={fieldClassName} defaultValue={values.name} name="name" required />
        </label>
        <label className="block min-w-0">
          <span className={labelClassName}>Code</span>
          <input aria-describedby={codeHasError ? `carrier-service-code-error-${service?.id ?? "new"}` : undefined} aria-invalid={codeHasError} className={`${fieldClassName} ${codeHasError ? "border-amber-400 ring-2 ring-amber-100" : ""}`} defaultValue={values.code} name="code" pattern="[a-z0-9][a-z0-9_-]*" required />
          {codeHasError ? <span className="mt-1 block text-xs font-semibold leading-5 text-amber-800" id={`carrier-service-code-error-${service?.id ?? "new"}`} role="alert">{state.message}</span> : null}
        </label>
        <label className="block min-w-0">
          <span className={labelClassName}>Service type</span>
          <select className={fieldClassName} defaultValue={values.serviceType} name="service_type" required>
            {logisticsCarrierServiceTypes.map((value) => (
              <option key={value} value={value}>{logisticsCarrierServiceTypeLabels[value]}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className={labelClassName}>Temperature class</span>
          <select className={fieldClassName} defaultValue={values.temperatureClass} name="temperature_class">
            <option value="">Not set</option>
            {deliveryTemperatureClasses.map((value) => (
              <option key={value} value={value}>{temperatureClassLabels[value]}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className={labelClassName}>Status</span>
          <select className={fieldClassName} defaultValue={values.status} name="status" required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="block min-w-0 md:col-span-2 xl:col-span-1">
          <span className={labelClassName}>Notes</span>
          <input className={fieldClassName} defaultValue={values.notes} name="notes" />
        </label>
      </div>
      <SubmitButton editing={Boolean(service)} />
    </form>
  );
}
