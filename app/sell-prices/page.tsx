import Link from "next/link";

import {
  archiveSellPriceAction,
  createSellPriceAction,
  updateSellPriceAction,
} from "@/app/sell-prices/actions";
import { AppShell } from "@/components/app-shell";
import { AlertCard, EmptyState, SectionCard, StatCard, StatusBadge } from "@/components/ui";
import {
  type SellPriceDisplayRow,
  getSellPriceManagementData,
} from "@/lib/sell-price-data";
import {
  sellPriceChannels,
  sellPriceSources,
  sellPriceStatuses,
  sellPriceTaxModes,
} from "@/lib/sell-price-margin-plan";

type PageProps = {
  searchParams: Promise<{
    sell_price?: string;
  }>;
};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const selectClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-soft)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[var(--tenant-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:bg-slate-300";
const dangerButtonClass =
  "inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
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

function actionMessage(status?: string) {
  if (!status) {
    return null;
  }

  const messages: Record<
    string,
    { tone: "success" | "warning" | "danger" | "info"; text: string }
  > = {
    created: {
      tone: "success",
      text: "Sell price created.",
    },
    updated: {
      tone: "success",
      text: "Sell price updated.",
    },
    archived: {
      tone: "success",
      text: "Sell price archived.",
    },
    duplicate_active: {
      tone: "warning",
      text: "An active open-ended sell price already exists for this finished product and channel. Archive or end-date the current active price before creating another.",
    },
    missing_finished_product: {
      tone: "warning",
      text: "Select a finished product before saving a sell price.",
    },
    invalid_finished_product: {
      tone: "warning",
      text: "The selected item is not a valid finished product for this tenant.",
    },
    invalid_channel: {
      tone: "warning",
      text: "Select a valid sell price channel.",
    },
    invalid_price: {
      tone: "warning",
      text: "Enter a sell price amount of zero or greater.",
    },
    invalid_currency: {
      tone: "warning",
      text: "Currency must be an uppercase three-letter code.",
    },
    invalid_tax_mode: {
      tone: "warning",
      text: "Select a valid tax mode.",
    },
    invalid_gst_rate: {
      tone: "warning",
      text: "GST rate must be zero or greater when entered.",
    },
    invalid_dates: {
      tone: "warning",
      text: "Effective to date cannot be earlier than effective from date.",
    },
    invalid_source: {
      tone: "warning",
      text: "Select a valid price source.",
    },
    not_found: {
      tone: "warning",
      text: "The sell price record could not be found.",
    },
    error: {
      tone: "danger",
      text: "The sell price action could not be completed. Check permissions and data, then try again.",
    },
  };

  return messages[status] ?? { tone: "info" as const, text: "Sell price action finished." };
}

function StatusPill({ row }: { row: SellPriceDisplayRow }) {
  return <StatusBadge tone={row.tone}>{row.statusLabel}</StatusBadge>;
}

function sellPriceRecordClass(price: SellPriceDisplayRow) {
  if (price.statusLabel === "Archived") {
    return "rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-500 shadow-sm";
  }

  if (price.isCurrentActive) {
    return "rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm";
  }

  if (price.hasActiveCurrentForSameProductChannel) {
    return "rounded-lg border border-amber-200 bg-amber-50/70 p-4 shadow-sm";
  }

  return "rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
}

function ProductSelect({
  products,
  defaultValue,
  disabled,
}: {
  products: { id: string; displayName: string }[];
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <select
      className={selectClass}
      defaultValue={defaultValue ?? ""}
      disabled={disabled}
      name="finished_product_internal_item_id"
      required
    >
      <option value="">Select finished product</option>
      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.displayName}
        </option>
      ))}
    </select>
  );
}

function ChannelSelect({
  defaultValue,
  disabled,
}: {
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <select
      className={selectClass}
      defaultValue={defaultValue ?? "direct_consumer"}
      disabled={disabled}
      name="channel_key"
      required
    >
      {sellPriceChannels.map((channel) => (
        <option key={channel.key} value={channel.key}>
          {channel.label}
        </option>
      ))}
    </select>
  );
}

function TaxModeSelect({
  defaultValue,
  disabled,
}: {
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <select
      className={selectClass}
      defaultValue={defaultValue ?? "unknown"}
      disabled={disabled}
      name="tax_mode"
      required
    >
      {sellPriceTaxModes.map((mode) => (
        <option key={mode.key} value={mode.key}>
          {mode.label}
        </option>
      ))}
    </select>
  );
}

function StatusSelect({
  defaultValue,
  disabled,
}: {
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <select
      className={selectClass}
      defaultValue={defaultValue ?? "draft"}
      disabled={disabled}
      name="status"
      required
    >
      {sellPriceStatuses.map((status) => (
        <option key={status.key} value={status.key}>
          {status.label}
        </option>
      ))}
    </select>
  );
}

function SourceSelect({
  defaultValue,
  disabled,
}: {
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <select
      className={selectClass}
      defaultValue={defaultValue ?? "manual"}
      disabled={disabled}
      name="source"
      required
    >
      {sellPriceSources.map((source) => (
        <option key={source.key} value={source.key}>
          {source.label}
        </option>
      ))}
    </select>
  );
}

export default async function SellPricesPage({ searchParams }: PageProps) {
  const [data, query] = await Promise.all([
    getSellPriceManagementData(),
    searchParams,
  ]);
  const message = actionMessage(query.sell_price);
  const canManage = data.canManageSellPrices;

  return (
    <AppShell>
      <div className="space-y-6 px-5 py-6 md:px-8">
        {message ? (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            <span>{message.text}</span>
            <StatusBadge tone={message.tone}>
              {query.sell_price ?? "status"}
            </StatusBadge>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Finished products"
            value={String(data.summary.finishedProducts)}
            helperText="Tenant finished products available for channel pricing."
            badge="Products"
            tone="info"
            icon="FP"
          />
          <StatCard
            label="Active prices"
            value={String(data.summary.activeSellPrices)}
            helperText="Open-ended active channel prices."
            badge="Current"
            tone="success"
            icon="$"
          />
          <StatCard
            label="Draft prices"
            value={String(data.summary.draftSellPrices)}
            helperText="Prices entered but not current yet."
            badge="Review"
            tone="warning"
            icon="DR"
          />
          <StatCard
            label="Missing prices"
            value={String(data.summary.missingSellPrices)}
            helperText="Finished products without an active sell price."
            badge="Readiness"
            tone={data.summary.missingSellPrices > 0 ? "warning" : "success"}
            icon="%"
          />
          <StatCard
            label="Archived prices"
            value={String(data.summary.archivedSellPrices)}
            helperText="Soft-archived history retained."
            badge="History"
            tone="neutral"
            icon="AR"
          />
        </section>

        <SectionCard
          title="Create Sell Price"
          description="Capture a tenant-scoped finished product channel price. Margin calculation remains a later reviewed task."
          action={
            canManage ? (
              <StatusBadge tone="success">sell_prices.manage</StatusBadge>
            ) : (
              <StatusBadge tone="info">Read only</StatusBadge>
            )
          }
        >
          {canManage ? (
            <form action={createSellPriceAction} className="grid gap-4 xl:grid-cols-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 xl:col-span-4">
                Only one active open-ended price is allowed per finished product/channel.
                Drafts can be saved for review, but they do not count as current prices.
              </div>
              <FormField label="Finished product">
                <ProductSelect products={data.finishedProducts} />
              </FormField>
              <FormField label="Channel">
                <ChannelSelect />
              </FormField>
              <FormField label="Channel label">
                <input
                  className={inputClass}
                  name="channel_label"
                  placeholder="Optional display label"
                />
              </FormField>
              <FormField label="Price amount">
                <input
                  className={inputClass}
                  min="0"
                  name="price_amount"
                  required
                  step="0.0001"
                  type="number"
                />
              </FormField>
              <FormField label="Currency">
                <input
                  className={inputClass}
                  defaultValue="AUD"
                  maxLength={3}
                  name="currency_code"
                  required
                />
              </FormField>
              <FormField label="Tax mode">
                <TaxModeSelect />
              </FormField>
              <FormField label="GST rate">
                <input
                  className={inputClass}
                  min="0"
                  name="gst_rate"
                  placeholder="Optional"
                  step="0.0001"
                  type="number"
                />
              </FormField>
              <FormField label="Effective from">
                <input
                  className={inputClass}
                  defaultValue={todayIsoDate()}
                  name="effective_from"
                  required
                  type="date"
                />
              </FormField>
              <FormField label="Effective to">
                <input className={inputClass} name="effective_to" type="date" />
              </FormField>
              <FormField label="Status">
                <StatusSelect />
              </FormField>
              <FormField label="Source">
                <SourceSelect />
              </FormField>
              <FormField label="Notes">
                <input
                  className={inputClass}
                  name="notes"
                  placeholder="Optional review note"
                />
              </FormField>
              <div className="xl:col-span-4">
                <button
                  className={primaryButtonClass}
                  disabled={data.finishedProducts.length === 0}
                  type="submit"
                >
                  Create sell price
                </button>
              </div>
            </form>
          ) : (
            <EmptyState
              title="Read-only sell price access"
              description="You can view sell prices, but creating or editing prices requires sell_prices.manage."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Finished Product Price Readiness"
          description="Shows which finished products have active sell prices before margin calculation rules are added."
          action={<StatusBadge tone="info">Readiness only</StatusBadge>}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.productReadiness.map((product) => (
              <article
                key={product.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      className="text-sm font-black text-slate-950 hover:text-[var(--tenant-primary)]"
                      href={`/finished-products/${product.id}`}
                    >
                      {product.displayName}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {product.activePriceCount} active / {product.draftPriceCount} draft
                    </p>
                  </div>
                  <StatusBadge tone={product.tone}>{product.readiness}</StatusBadge>
                </div>
              </article>
            ))}
            {data.productReadiness.length === 0 ? (
              <EmptyState
                title="No finished products yet"
                description="Create finished product internal items before sell prices can be managed."
              />
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Sell Price Records"
          description="Create, edit and soft-archive finished product channel prices. Archived prices are retained for history."
          action={<StatusBadge tone="success">Live data</StatusBadge>}
        >
          {data.sellPrices.length === 0 ? (
            <EmptyState
              title="No sell prices yet"
              description="Add a sell price to unlock margin readiness. Full margin calculation remains a later task."
            />
          ) : (
            <div className="space-y-4">
              {data.sellPrices.map((price) => (
                <details
                  key={price.id}
                  className={sellPriceRecordClass(price)}
                >
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <Link
                          className="text-base font-black text-slate-950 hover:text-[var(--tenant-primary)]"
                          href={`/finished-products/${price.finishedProductId}`}
                        >
                          {price.finishedProductName}
                        </Link>
                        <p className="mt-1 text-sm text-slate-600">
                          {price.channelLabel} · {price.priceAmount} · {price.taxModeLabel}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Effective {price.effectiveFrom} to {price.effectiveTo} · updated {price.updatedAt}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-slate-700">
                          {price.readinessUseLabel}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill row={price} />
                        <StatusBadge tone="neutral">{price.sourceLabel}</StatusBadge>
                      </div>
                    </div>
                  </summary>

	                  <div className="mt-4 border-t border-slate-100 pt-4">
	                    {canManage && price.statusLabel !== "Archived" ? (
	                      <div className="space-y-4">
	                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
	                          Only one active open-ended price is allowed per finished
	                          product/channel. End-date or archive the current active price
	                          before making another one current.
	                        </div>
	                        <form
                          action={updateSellPriceAction}
                          className="grid gap-4 xl:grid-cols-4"
                        >
                          <input name="sell_price_id" type="hidden" value={price.id} />
                          <FormField label="Finished product">
                            <ProductSelect
                              products={data.finishedProducts}
                              defaultValue={price.finishedProductId}
                            />
                          </FormField>
                          <FormField label="Channel">
                            <ChannelSelect defaultValue={price.channelKey} />
                          </FormField>
                          <FormField label="Channel label">
                            <input
                              className={inputClass}
                              defaultValue={price.channelLabel}
                              name="channel_label"
                            />
                          </FormField>
                          <FormField label="Price amount">
                            <input
                              className={inputClass}
                              defaultValue={price.priceAmountValue}
                              min="0"
                              name="price_amount"
                              required
                              step="0.0001"
                              type="number"
                            />
                          </FormField>
                          <FormField label="Currency">
                            <input
                              className={inputClass}
                              defaultValue={price.currencyCode}
                              maxLength={3}
                              name="currency_code"
                              required
                            />
                          </FormField>
                          <FormField label="Tax mode">
                            <TaxModeSelect defaultValue={price.taxMode} />
                          </FormField>
                          <FormField label="GST rate">
                            <input
                              className={inputClass}
                              defaultValue={price.gstRateValue}
                              min="0"
                              name="gst_rate"
                              step="0.0001"
                              type="number"
                            />
                          </FormField>
                          <FormField label="Effective from">
                            <input
                              className={inputClass}
                              defaultValue={price.effectiveFromValue}
                              name="effective_from"
                              required
                              type="date"
                            />
                          </FormField>
                          <FormField label="Effective to">
                            <input
                              className={inputClass}
                              defaultValue={price.effectiveToValue}
                              name="effective_to"
                              type="date"
                            />
                          </FormField>
                          <FormField label="Status">
                            <StatusSelect defaultValue={price.status} />
                          </FormField>
                          <FormField label="Source">
                            <SourceSelect defaultValue={price.source} />
                          </FormField>
                          <FormField label="Notes">
                            <input
                              className={inputClass}
                              defaultValue={price.notesValue}
                              name="notes"
                            />
                          </FormField>
                          <div className="flex flex-wrap gap-2 xl:col-span-4">
                            <button className={primaryButtonClass} type="submit">
                              Save changes
                            </button>
                          </div>
                        </form>
                        <form action={archiveSellPriceAction}>
                          <input name="sell_price_id" type="hidden" value={price.id} />
                          <button className={dangerButtonClass} type="submit">
                            Archive price
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                          ["Channel", price.channelLabel],
                          ["Price", price.priceAmount],
                          ["Currency", price.currencyCode],
                          ["Tax mode", price.taxModeLabel],
                          ["GST rate", price.gstRate],
                          ["Source", price.sourceLabel],
                          ["Notes", price.notes],
                          ["Updated", price.updatedAt],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              {label}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </SectionCard>

        <AlertCard
          title="Margin calculation remains blocked"
          description="Sell prices are now stored and managed, but final margin percentage/dollar calculations still need agreed tax, channel and costing rules."
          meta="Task 171"
          tone="warning"
        />
      </div>
    </AppShell>
  );
}
