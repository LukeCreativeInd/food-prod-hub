import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui";
import { resolveAppModeFromHeaders } from "@/lib/app-mode-routing";
import { isShopifyRuntimeConfigured } from "@/lib/shopify/config";

export const dynamic = "force-dynamic";

export default async function ShopifyMerchantEntryPage() {
  const requestHeaders = await headers();
  const mode = resolveAppModeFromHeaders(requestHeaders);

  if (mode.mode !== "central_app" && mode.mode !== "local_dev") {
    redirect(mode.mode === "tenant_app" ? "/dashboard" : "/login");
  }

  const configured = isShopifyRuntimeConfigured();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold text-[var(--tenant-primary)]">EveryBatch</p>
            <h1 className="mt-1 text-2xl font-semibold">Shopify connection</h1>
          </div>
          <StatusBadge tone={configured ? "info" : "warning"}>
            {configured ? "Development-ready" : "Setup required"}
          </StatusBadge>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Verified merchant session required</h2>
          <p className="text-sm leading-6 text-slate-600">
            This surface is completed by Shopify Admin using a signed session token. It does not grant membership in a manufacturer workspace and it does not expose formulas, inventory, costs or other storefronts.
          </p>
          <p className="text-sm leading-6 text-slate-600">
            App registration and development-store installation have not been performed. The embedded frontend that obtains the Shopify session token remains blocked until those external prerequisites are approved.
          </p>
        </section>
      </div>
    </main>
  );
}
