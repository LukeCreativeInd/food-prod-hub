import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import {
  sellPriceChannels,
  sellPriceSources,
  sellPriceStatuses,
  sellPriceTaxModes,
} from "@/lib/sell-price-margin-plan";
import { createClient } from "@/lib/supabase/server";

type Tone = "success" | "warning" | "neutral" | "info" | "danger";

type FinishedProductRow = {
  id: string;
  display_name: string;
  item_type: string;
  base_unit: string | null;
  status: string;
  updated_at: string | null;
};

type SellPriceRow = {
  id: string;
  organisation_id: string;
  finished_product_internal_item_id: string;
  channel_key: string;
  channel_label: string | null;
  price_amount: number | string;
  currency_code: string;
  tax_mode: string;
  gst_rate: number | string | null;
  effective_from: string;
  effective_to: string | null;
  status: string;
  source: string;
  source_reference: string | null;
  notes: string | null;
  approved_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SellPriceSelectableFinishedProduct = {
  id: string;
  displayName: string;
  status: string;
  baseUnit: string;
};

export type SellPriceDisplayRow = {
  id: string;
  finishedProductId: string;
  finishedProductName: string;
  channelKey: string;
  channelLabel: string;
  priceAmount: string;
  priceAmountValue: string;
  currencyCode: string;
  taxMode: string;
  taxModeLabel: string;
  gstRate: string;
  gstRateValue: string;
  effectiveFrom: string;
  effectiveFromValue: string;
  effectiveTo: string;
  effectiveToValue: string;
  status: string;
  statusLabel: string;
  source: string;
  sourceLabel: string;
  notes: string;
  notesValue: string;
  updatedAt: string;
  isCurrentActive: boolean;
  hasActiveCurrentForSameProductChannel: boolean;
  readinessUseLabel: string;
  tone: Tone;
};

export type SellPriceProductReadinessRow = {
  id: string;
  displayName: string;
  status: string;
  activePriceCount: number;
  draftPriceCount: number;
  readiness: string;
  tone: Tone;
};

export type SellPriceManagementData = {
  canManageSellPrices: boolean;
  finishedProducts: SellPriceSelectableFinishedProduct[];
  sellPrices: SellPriceDisplayRow[];
  productReadiness: SellPriceProductReadinessRow[];
  summary: {
    finishedProducts: number;
    activeSellPrices: number;
    draftSellPrices: number;
    missingSellPrices: number;
    archivedSellPrices: number;
  };
};

function labelFromKey(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split(/[-_.]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSellPriceCurrency(
  value: number | string | null | undefined,
  currencyCode = "AUD",
) {
  if (value === null || value === undefined || value === "") {
    return "Not recorded";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currencyCode} ${numericValue.toFixed(2)}`;
  }
}

export function formatSellPriceDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function stringValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function isCurrentActiveSellPrice(price: SellPriceRow) {
  return (
    price.status === "active" &&
    !price.archived_at &&
    !price.effective_to
  );
}

function channelLabel(channelKey: string, explicitLabel?: string | null) {
  return (
    explicitLabel?.trim() ||
    sellPriceChannels.find((channel) => channel.key === channelKey)?.label ||
    labelFromKey(channelKey)
  );
}

function taxModeLabel(taxMode: string) {
  return (
    sellPriceTaxModes.find((mode) => mode.key === taxMode)?.label ??
    labelFromKey(taxMode)
  );
}

function sourceLabel(source: string) {
  return (
    sellPriceSources.find((option) => option.key === source)?.label ??
    labelFromKey(source)
  );
}

function statusLabel(status: string) {
  return (
    sellPriceStatuses.find((option) => option.key === status)?.label ??
    labelFromKey(status)
  );
}

function sellPriceScopeKey(price: SellPriceRow) {
  return `${price.finished_product_internal_item_id}:${price.channel_key}`;
}

function statusTone(price: SellPriceRow, hasActiveCurrentConflict: boolean): Tone {
  if (price.archived_at || price.status === "archived") {
    return "neutral";
  }

  if (isCurrentActiveSellPrice(price)) {
    return price.tax_mode === "unknown" ? "warning" : "success";
  }

  if (price.status === "active") {
    return "info";
  }

  if (hasActiveCurrentConflict) {
    return "warning";
  }

  return "warning";
}

function mapSellPriceRow(
  price: SellPriceRow,
  productName: string,
  activeCurrentScopeKeys = new Set<string>(),
): SellPriceDisplayRow {
  const currentActive = isCurrentActiveSellPrice(price);
  const hasActiveCurrentForSameProductChannel =
    !currentActive &&
    price.status === "draft" &&
    !price.archived_at &&
    activeCurrentScopeKeys.has(sellPriceScopeKey(price));
  const statusDisplayLabel = currentActive
    ? "Active current"
    : price.archived_at || price.status === "archived"
      ? "Archived"
      : hasActiveCurrentForSameProductChannel
        ? "Draft candidate"
        : statusLabel(price.status);

  return {
    id: price.id,
    finishedProductId: price.finished_product_internal_item_id,
    finishedProductName: productName,
    channelKey: price.channel_key,
    channelLabel: channelLabel(price.channel_key, price.channel_label),
    priceAmount: formatSellPriceCurrency(price.price_amount, price.currency_code),
    priceAmountValue: stringValue(price.price_amount),
    currencyCode: price.currency_code,
    taxMode: price.tax_mode,
    taxModeLabel: taxModeLabel(price.tax_mode),
    gstRate:
      price.gst_rate === null || price.gst_rate === undefined
        ? "Not recorded"
        : String(price.gst_rate),
    gstRateValue: stringValue(price.gst_rate),
    effectiveFrom: formatSellPriceDate(price.effective_from),
    effectiveFromValue: price.effective_from,
    effectiveTo: price.effective_to
      ? formatSellPriceDate(price.effective_to)
      : "Open-ended",
    effectiveToValue: price.effective_to ?? "",
    status: price.status,
    statusLabel: statusDisplayLabel,
    source: price.source,
    sourceLabel: sourceLabel(price.source),
    notes: price.notes?.trim() || "No notes",
    notesValue: price.notes ?? "",
    updatedAt: formatDateTime(price.updated_at),
    isCurrentActive: currentActive,
    hasActiveCurrentForSameProductChannel,
    readinessUseLabel: currentActive
      ? "Used for readiness"
      : price.archived_at || price.status === "archived"
        ? "Archived history; not used for readiness"
        : hasActiveCurrentForSameProductChannel
          ? "Draft candidate - active price already exists"
          : "Not used for readiness until active and open-ended",
    tone: statusTone(price, hasActiveCurrentForSameProductChannel),
  };
}

async function requireSellPriceViewAccess() {
  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("sell_prices.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return {
    organisationId: authContext.organisation.id,
    canManageSellPrices: permissionKeys.includes("sell_prices.manage"),
  };
}

export async function getSellPriceSelectableFinishedProducts(): Promise<
  SellPriceSelectableFinishedProduct[]
> {
  const { organisationId } = await requireSellPriceViewAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, display_name, item_type, base_unit, status, updated_at")
    .eq("organisation_id", organisationId)
    .eq("item_type", "finished_product")
    .is("archived_at", null)
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error("Could not load finished products for sell pricing.");
  }

  return ((data ?? []) as FinishedProductRow[]).map((product) => ({
    id: product.id,
    displayName: product.display_name,
    status: product.status,
    baseUnit: product.base_unit ?? "Not recorded",
  }));
}

export async function getSellPriceManagementData(): Promise<SellPriceManagementData> {
  const timingStartedAt = Date.now();
  const { organisationId, canManageSellPrices } =
    await requireSellPriceViewAccess();
  const supabase = await createClient();
  const [productsResult, pricesResult] = await Promise.all([
    supabase
      .from("internal_items")
      .select("id, display_name, item_type, base_unit, status, updated_at")
      .eq("organisation_id", organisationId)
      .eq("item_type", "finished_product")
      .is("archived_at", null)
      .order("display_name", { ascending: true }),
    supabase
      .from("finished_product_sell_prices")
      .select(
        "id, organisation_id, finished_product_internal_item_id, channel_key, channel_label, price_amount, currency_code, tax_mode, gst_rate, effective_from, effective_to, status, source, source_reference, notes, approved_at, archived_at, created_at, updated_at",
      )
      .eq("organisation_id", organisationId)
      .order("updated_at", { ascending: false }),
  ]);

  if (productsResult.error) {
    throw new Error("Could not load finished products for sell prices.");
  }

  if (pricesResult.error) {
    throw new Error("Could not load finished product sell prices.");
  }

  const products = (productsResult.data ?? []) as FinishedProductRow[];
  const prices = (pricesResult.data ?? []) as SellPriceRow[];
  const productById = new Map(
    products.map((product) => [product.id, product]),
  );
  const activeCurrentScopeKeys = new Set(
    prices.filter(isCurrentActiveSellPrice).map(sellPriceScopeKey),
  );
  const sellPrices = prices.map((price) =>
    mapSellPriceRow(
      price,
      productById.get(price.finished_product_internal_item_id)?.display_name ??
        "Unknown finished product",
      activeCurrentScopeKeys,
    ),
  );
  const activeSellPrices = sellPrices.filter(
    (price) => price.isCurrentActive,
  );
  const draftSellPrices = sellPrices.filter(
    (price) => price.status === "draft" && price.statusLabel !== "Archived",
  );
  const archivedSellPrices = sellPrices.filter(
    (price) => price.statusLabel === "Archived",
  );
  const activePriceCountsByProduct = activeSellPrices.reduce((counts, price) => {
    counts.set(
      price.finishedProductId,
      (counts.get(price.finishedProductId) ?? 0) + 1,
    );
    return counts;
  }, new Map<string, number>());
  const draftPriceCountsByProduct = draftSellPrices.reduce((counts, price) => {
    counts.set(
      price.finishedProductId,
      (counts.get(price.finishedProductId) ?? 0) + 1,
    );
    return counts;
  }, new Map<string, number>());
  const productReadiness = products.map((product) => {
    const activePriceCount = activePriceCountsByProduct.get(product.id) ?? 0;
    const draftPriceCount = draftPriceCountsByProduct.get(product.id) ?? 0;

    return {
      id: product.id,
      displayName: product.display_name,
      status: product.status,
      activePriceCount,
      draftPriceCount,
      readiness:
        activePriceCount > 0
          ? "Has active sell price"
          : draftPriceCount > 0
            ? "Draft price needs review"
            : "Missing sell price",
      tone:
        activePriceCount > 0
          ? ("success" as const)
          : draftPriceCount > 0
            ? ("warning" as const)
            : ("danger" as const),
    };
  });
  const missingSellPrices = productReadiness.filter(
    (product) => product.activePriceCount === 0,
  ).length;

  const result = {
    canManageSellPrices,
    finishedProducts: products.map((product) => ({
      id: product.id,
      displayName: product.display_name,
      status: product.status,
      baseUnit: product.base_unit ?? "Not recorded",
    })),
    sellPrices,
    productReadiness,
    summary: {
      finishedProducts: products.length,
      activeSellPrices: activeSellPrices.length,
      draftSellPrices: draftSellPrices.length,
      missingSellPrices,
      archivedSellPrices: archivedSellPrices.length,
    },
  };

  logDevRouteTiming("sell-prices.management-data", timingStartedAt, {
    finishedProductCount: result.summary.finishedProducts,
    sellPriceCount: sellPrices.length,
    activeSellPrices: result.summary.activeSellPrices,
  });

  return result;
}

export async function getFinishedProductSellPriceDetailData(
  finishedProductId: string,
) {
  const { organisationId, canManageSellPrices } =
    await requireSellPriceViewAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finished_product_sell_prices")
    .select(
      "id, organisation_id, finished_product_internal_item_id, channel_key, channel_label, price_amount, currency_code, tax_mode, gst_rate, effective_from, effective_to, status, source, source_reference, notes, approved_at, archived_at, created_at, updated_at",
    )
    .eq("organisation_id", organisationId)
    .eq("finished_product_internal_item_id", finishedProductId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Could not load finished product sell prices.");
  }

  const prices = (data ?? []) as SellPriceRow[];
  const activePrices = prices.filter(isCurrentActiveSellPrice);
  const activeCurrentScopeKeys = new Set(activePrices.map(sellPriceScopeKey));

  return {
    canManageSellPrices,
    activePrices: activePrices.map((price) =>
      mapSellPriceRow(price, "This finished product", activeCurrentScopeKeys),
    ),
    allPrices: prices.map((price) =>
      mapSellPriceRow(price, "This finished product", activeCurrentScopeKeys),
    ),
  };
}

export async function getSellPriceReadinessSummary() {
  const data = await getSellPriceManagementData();

  return data.summary;
}
