"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createCarrierAction,
  type CarrierConfigurationActionState,
  type CarrierFormValues,
  updateCarrierAction,
} from "@/app/logistics/carriers/actions";
import type { LogisticsCarrierListItem } from "@/lib/logistics-configuration-data";
import {
  logisticsCarrierProviderTypeLabels,
  logisticsCarrierProviderTypes,
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
      {pending ? "Saving..." : editing ? "Save carrier" : "Create carrier"}
    </button>
  );
}

export function CarrierForm({ carrier }: { carrier?: LogisticsCarrierListItem }) {
  const initialValues: CarrierFormValues = {
    name: carrier?.name ?? "",
    code: carrier?.code ?? "",
    providerType: carrier?.providerType ?? "carrier",
    status: carrier?.status === "inactive" ? "inactive" : "active",
    notes: carrier?.notesValue ?? "",
  };
  const initialState: CarrierConfigurationActionState<CarrierFormValues> = {
    status: "idle",
    message: "",
    values: initialValues,
  };
  const [state, formAction] = useActionState(
    carrier ? updateCarrierAction : createCarrierAction,
    initialState,
  );
  const values = state.values;
  const codeHasError = state.status === "error" && state.field === "code";

  return (
    <form
      action={formAction}
      className="space-y-5"
      key={`${state.message}:${values.code}:${values.name}`}
    >
      {carrier ? <input name="carrier_id" type="hidden" value={carrier.id} /> : null}
      {state.status === "error" && !state.field ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900" role="alert">
          {state.message}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block min-w-0">
          <span className={labelClassName}>Carrier name</span>
          <input className={fieldClassName} defaultValue={values.name} name="name" required />
        </label>
        <label className="block min-w-0">
          <span className={labelClassName}>Code</span>
          <input aria-describedby={codeHasError ? "carrier-code-error carrier-code-help" : "carrier-code-help"} aria-invalid={codeHasError} className={`${fieldClassName} ${codeHasError ? "border-amber-400 ring-2 ring-amber-100" : ""}`} defaultValue={values.code} name="code" pattern="[a-z0-9][a-z0-9_-]*" required />
          {codeHasError ? <span className="mt-1 block text-xs font-semibold leading-5 text-amber-800" id="carrier-code-error" role="alert">{state.message}</span> : null}
          <span className="mt-1 block text-xs leading-5 text-slate-500" id="carrier-code-help">Lowercase letters, numbers, underscores and hyphens.</span>
        </label>
        <label className="block min-w-0">
          <span className={labelClassName}>Provider type</span>
          <select className={fieldClassName} defaultValue={values.providerType} name="provider_type" required>
            {logisticsCarrierProviderTypes.map((value) => (
              <option key={value} value={value}>{logisticsCarrierProviderTypeLabels[value]}</option>
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
      </div>
      <label className="block min-w-0">
        <span className={labelClassName}>Notes</span>
        <textarea className={`${fieldClassName} min-h-24`} defaultValue={values.notes} name="notes" />
      </label>
      <SubmitButton editing={Boolean(carrier)} />
    </form>
  );
}
