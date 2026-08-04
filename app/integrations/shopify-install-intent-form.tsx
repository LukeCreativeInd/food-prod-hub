"use client";

import { useActionState } from "react";

import {
  createShopifyInstallIntentAction,
  type ShopifyIntentActionState,
} from "./actions";

type Props = {
  facilities: Array<{ id: string; facility_name: string; facility_code: string }>;
  runtimeConfigured: boolean;
};

const initialShopifyIntentState: ShopifyIntentActionState = {
  status: "idle",
  message: "",
  claimToken: null,
  expiresAt: null,
};

export function ShopifyInstallIntentForm({ facilities, runtimeConfigured }: Props) {
  const [state, action, pending] = useActionState(
    createShopifyInstallIntentAction,
    initialShopifyIntentState,
  );

  return (
    <form action={action} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-semibold text-slate-700">
          <span>Connection name</span>
          <input
            name="storefront_display_name"
            maxLength={160}
            required
            placeholder="Storefront name"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
          />
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-slate-700">
          <span>Permanent Shopify domain</span>
          <input
            name="shop_domain"
            placeholder="store-name.myshopify.com"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
          />
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
          <span>Target facility</span>
          <select
            name="facility_id"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
            defaultValue=""
          >
            <option value="">Resolve later</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.facility_name} ({facility.facility_code})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!runtimeConfigured || pending}
          className="rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Preparing..." : "Prepare install claim"}
        </button>
        <p className="text-xs text-slate-500">
          {runtimeConfigured
            ? "For organisation-owned stores. External-owner relationship setup remains separate."
            : "Shopify app registration and server environment configuration are required first."}
        </p>
      </div>

      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-emerald-700"}>
          {state.message}
        </p>
      ) : null}

      {state.claimToken ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase text-amber-800">One-time claim token</p>
          <code className="mt-2 block break-all text-sm text-amber-950">{state.claimToken}</code>
          <p className="mt-2 text-xs text-amber-800">
            This value is not stored in plaintext and is not shown again. It expires at {state.expiresAt}.
          </p>
        </div>
      ) : null}
    </form>
  );
}
