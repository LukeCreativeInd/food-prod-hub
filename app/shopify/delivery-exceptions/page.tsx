import { AppShell } from "@/components/app-shell";
import { DeliveryFoundationState, LifecycleBadge } from "@/components/shopify/delivery-config-ui";
import { ShopifyWorkspaceNav } from "@/components/shopify/shopify-workspace-nav";
import { EmptyState, SectionCard } from "@/components/ui";
import { getDeliveryConfigurationData } from "@/lib/delivery-configuration-data";

export default async function DeliveryExceptionsPage() {
  const data = await getDeliveryConfigurationData();
  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        <ShopifyWorkspaceNav />
        <SectionCard title="Exact-date exceptions" description="Public holidays, closures and date shifts are explicit reviewed calendar-version inputs. Nothing shifts automatically.">
          <DeliveryFoundationState status={data.status} message={data.statusMessage} />
          {data.status === "ready" && data.exceptions.length === 0 ? <EmptyState title="No exact-date exceptions" description="No public holidays, closures, blackouts or shifted dates are seeded." /> : data.status === "ready" ? <div className="space-y-3">{data.exceptions.map((exception) => <article key={exception.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">{exception.exception_date} · {exception.category.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-500">{exception.reason}</p></div><LifecycleBadge status={exception.effect} /></div></article>)}</div> : null}
        </SectionCard>
        <SectionCard title="Order overrides" description="Approved order-specific decisions and reversals are append-only and never rewrite Shopify source evidence.">
          {data.status === "ready" && data.overrides.length === 0 ? <EmptyState title="No order overrides" description="No source orders exist, so no override history exists." /> : data.status === "ready" ? <div className="space-y-3">{data.overrides.map((override) => <article key={override.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-slate-950">{override.reason_category.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-500">Safe order reference {override.source_order_id}</p></div><LifecycleBadge status={override.status} /></div></article>)}</div> : null}
        </SectionCard>
        <SectionCard title="Interpretation history" description="Each re-resolution appends a revision with parser, calendar, rule and safe error evidence.">
          {data.status === "ready" && data.interpretations.length === 0 ? <EmptyState title="No delivery interpretations" description="No source orders or production-date interpretations have been created." /> : data.status === "ready" ? <div className="grid gap-3 md:grid-cols-2">{data.interpretations.map((interpretation) => <article key={interpretation.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">{interpretation.resolved_delivery_date ?? "Delivery date unresolved"}</p><p className="mt-1 text-sm text-slate-500">Production {interpretation.resolved_production_date ?? "unresolved"}</p></div><LifecycleBadge status={interpretation.status} /></div>{interpretation.safe_error_category ? <p className="mt-3 text-xs text-amber-700">{interpretation.safe_error_category.replaceAll("_", " ")}</p> : null}</article>)}</div> : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
