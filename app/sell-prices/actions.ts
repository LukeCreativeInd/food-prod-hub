"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import {
  sellPriceChannels,
  sellPriceSources,
  sellPriceStatuses,
  sellPriceTaxModes,
} from "@/lib/sell-price-margin-plan";
import { createClient } from "@/lib/supabase/server";

const channelKeys = new Set(sellPriceChannels.map((channel) => channel.key));
const taxModes = new Set(sellPriceTaxModes.map((mode) => mode.key));
const statuses = new Set(sellPriceStatuses.map((status) => status.key));
const sources = new Set(sellPriceSources.map((source) => source.key));
const channelKeyPattern = /^[a-z0-9_][a-z0-9_.-]*$/;
const currencyPattern = /^[A-Z]{3}$/;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function normaliseCurrency(value: string) {
  return value.toUpperCase();
}

function normaliseStatus(value: string) {
  return statuses.has(value as never) ? value : "draft";
}

function channelLabelForKey(channelKey: string, explicitLabel: string | null) {
  return (
    explicitLabel ||
    sellPriceChannels.find((channel) => channel.key === channelKey)?.label ||
    channelKey
  );
}

function redirectWithStatus(status: string) {
  redirect(`/sell-prices?sell_price=${status}`);
}

async function requireSellPriceManageContext() {
  const authContext = await requirePermissionAccess("sell_prices.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile?.id ?? null,
  };
}

async function validateFinishedProduct(
  organisationId: string,
  finishedProductId: string,
) {
  if (!finishedProductId) {
    redirectWithStatus("missing_finished_product");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_items")
    .select("id, item_type, display_name, status, archived_at")
    .eq("organisation_id", organisationId)
    .eq("id", finishedProductId)
    .maybeSingle();

  if (error || !data) {
    redirectWithStatus("invalid_finished_product");
  }

  const product = data as {
    id: string;
    item_type: string;
    archived_at: string | null;
  };

  if (product.item_type !== "finished_product" || product.archived_at) {
    redirectWithStatus("invalid_finished_product");
  }

  return product;
}

function validateSellPriceForm(formData: FormData) {
  const finishedProductId = getString(formData, "finished_product_internal_item_id");
  const channelKey = getString(formData, "channel_key");
  const channelLabel = getOptionalString(formData, "channel_label");
  const priceAmount = getNumber(formData, "price_amount");
  const currencyCode = normaliseCurrency(getString(formData, "currency_code") || "AUD");
  const taxMode = getString(formData, "tax_mode") || "unknown";
  const gstRate = getNumber(formData, "gst_rate");
  const effectiveFrom = getString(formData, "effective_from") || todayIsoDate();
  const effectiveTo = getOptionalString(formData, "effective_to");
  const status = normaliseStatus(getString(formData, "status"));
  const source = getString(formData, "source") || "manual";
  const notes = getOptionalString(formData, "notes");

  if (!channelKeys.has(channelKey as never) || !channelKeyPattern.test(channelKey)) {
    redirectWithStatus("invalid_channel");
  }

  if (priceAmount === null || priceAmount < 0) {
    redirectWithStatus("invalid_price");
  }

  if (!currencyPattern.test(currencyCode)) {
    redirectWithStatus("invalid_currency");
  }

  if (!taxModes.has(taxMode as never)) {
    redirectWithStatus("invalid_tax_mode");
  }

  if (gstRate !== null && gstRate < 0) {
    redirectWithStatus("invalid_gst_rate");
  }

  if (effectiveTo && effectiveTo < effectiveFrom) {
    redirectWithStatus("invalid_dates");
  }

  if (!sources.has(source as never)) {
    redirectWithStatus("invalid_source");
  }

  return {
    finishedProductId,
    channelKey,
    channelLabel: channelLabelForKey(channelKey, channelLabel),
    priceAmount,
    currencyCode,
    taxMode,
    gstRate,
    effectiveFrom,
    effectiveTo,
    status,
    source,
    notes,
  };
}

async function assertNoDuplicateActiveCurrentPrice({
  organisationId,
  finishedProductId,
  channelKey,
  excludeSellPriceId,
  status,
  effectiveTo,
}: {
  organisationId: string;
  finishedProductId: string;
  channelKey: string;
  excludeSellPriceId?: string;
  status: string;
  effectiveTo: string | null;
}) {
  if (status !== "active" || effectiveTo) {
    return;
  }

  const supabase = await createClient();
  let query = supabase
    .from("finished_product_sell_prices")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("finished_product_internal_item_id", finishedProductId)
    .eq("channel_key", channelKey)
    .eq("status", "active")
    .is("archived_at", null)
    .is("effective_to", null)
    .limit(1);

  if (excludeSellPriceId) {
    query = query.neq("id", excludeSellPriceId);
  }

  const { data, error } = await query;

  if (error) {
    redirectWithStatus("error");
  }

  if ((data ?? []).length > 0) {
    redirectWithStatus("duplicate_active");
  }
}

function isDuplicateActivePriceError(error: { code?: string; message?: string }) {
  return (
    error.code === "23505" ||
    error.message?.includes("finished_product_sell_prices_active_open_current_uidx")
  );
}

export async function createSellPriceAction(formData: FormData) {
  const { organisationId, profileId } = await requireSellPriceManageContext();
  const values = validateSellPriceForm(formData);

  await validateFinishedProduct(organisationId, values.finishedProductId);
  await assertNoDuplicateActiveCurrentPrice({
    organisationId,
    finishedProductId: values.finishedProductId,
    channelKey: values.channelKey,
    status: values.status,
    effectiveTo: values.effectiveTo,
  });

  const supabase = await createClient();
  const { error } = await supabase.from("finished_product_sell_prices").insert({
    organisation_id: organisationId,
    finished_product_internal_item_id: values.finishedProductId,
    channel_key: values.channelKey,
    channel_label: values.channelLabel,
    price_amount: values.priceAmount,
    currency_code: values.currencyCode,
    tax_mode: values.taxMode,
    gst_rate: values.gstRate,
    effective_from: values.effectiveFrom,
    effective_to: values.effectiveTo,
    status: values.status,
    source: values.source,
    notes: values.notes,
    created_by: profileId,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirectWithStatus(isDuplicateActivePriceError(error) ? "duplicate_active" : "error");
  }

  revalidatePath("/", "layout");
  revalidatePath("/sell-prices");
  revalidatePath("/meal-margins");
  redirectWithStatus("created");
}

export async function updateSellPriceAction(formData: FormData) {
  const { organisationId } = await requireSellPriceManageContext();
  const sellPriceId = getString(formData, "sell_price_id");

  if (!sellPriceId) {
    redirectWithStatus("not_found");
  }

  const values = validateSellPriceForm(formData);
  await validateFinishedProduct(organisationId, values.finishedProductId);
  await assertNoDuplicateActiveCurrentPrice({
    organisationId,
    finishedProductId: values.finishedProductId,
    channelKey: values.channelKey,
    excludeSellPriceId: sellPriceId,
    status: values.status,
    effectiveTo: values.effectiveTo,
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("finished_product_sell_prices")
    .update({
      finished_product_internal_item_id: values.finishedProductId,
      channel_key: values.channelKey,
      channel_label: values.channelLabel,
      price_amount: values.priceAmount,
      currency_code: values.currencyCode,
      tax_mode: values.taxMode,
      gst_rate: values.gstRate,
      effective_from: values.effectiveFrom,
      effective_to: values.effectiveTo,
      status: values.status,
      source: values.source,
      notes: values.notes,
      updated_at: new Date().toISOString(),
      archived_at: values.status === "archived" ? new Date().toISOString() : null,
    })
    .eq("organisation_id", organisationId)
    .eq("id", sellPriceId);

  if (error) {
    redirectWithStatus(isDuplicateActivePriceError(error) ? "duplicate_active" : "error");
  }

  revalidatePath("/", "layout");
  revalidatePath("/sell-prices");
  revalidatePath("/meal-margins");
  redirectWithStatus("updated");
}

export async function archiveSellPriceAction(formData: FormData) {
  const { organisationId } = await requireSellPriceManageContext();
  const sellPriceId = getString(formData, "sell_price_id");

  if (!sellPriceId) {
    redirectWithStatus("not_found");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("finished_product_sell_prices")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", sellPriceId);

  if (error) {
    redirectWithStatus("error");
  }

  revalidatePath("/", "layout");
  revalidatePath("/sell-prices");
  revalidatePath("/meal-margins");
  redirectWithStatus("archived");
}
