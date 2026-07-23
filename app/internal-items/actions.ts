"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type InternalItemActionResult =
  | {
      status: "created" | "updated";
      itemId: string;
      itemType: string;
    }
  | {
      status: "missing_name" | "duplicate" | "not_found" | "error";
      itemId?: string;
      itemType?: string;
    };

const allowedItemTypes = new Set([
  "ingredient",
  "packaging",
  "consumable",
  "equipment",
  "non_stock_charge",
  "component",
  "finished_product",
  "unknown",
]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function normaliseItemType(value: string) {
  return allowedItemTypes.has(value) ? value : "ingredient";
}

function getListPath(itemType: string) {
  if (itemType === "packaging") {
    return "/packaging";
  }

  if (itemType === "component") {
    return "/components";
  }

  if (itemType === "finished_product") {
    return "/finished-products";
  }

  return "/ingredients";
}

function getInternalItemInput(formData: FormData) {
  const status = getString(formData, "status");
  const itemType = normaliseItemType(getString(formData, "item_type"));

  return {
    displayName: getString(formData, "display_name"),
    itemType,
    baseUnit: getOptionalString(formData, "base_unit"),
    notes: getOptionalString(formData, "notes"),
    status: status === "inactive" ? "inactive" : "active",
  };
}

async function createManualInternalItem(
  formData: FormData,
): Promise<InternalItemActionResult> {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("supplier_items.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const input = getInternalItemInput(formData);

  if (!input.displayName) {
    return { status: "missing_name", itemType: input.itemType };
  }

  const supabase = await createClient();
  const { data: existingItem, error: duplicateCheckError } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("item_type", input.itemType)
    .ilike("display_name", input.displayName)
    .is("archived_at", null)
    .maybeSingle();

  if (duplicateCheckError) {
    return { status: "error", itemType: input.itemType };
  }

  if (existingItem) {
    return {
      status: "duplicate",
      itemId: existingItem.id as string,
      itemType: input.itemType,
    };
  }

  const { data: createdItem, error } = await supabase
    .from("internal_items")
    .insert({
      organisation_id: organisationId,
      display_name: input.displayName,
      item_type: input.itemType,
      base_unit: input.baseUnit,
      notes: input.notes,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  logDevRouteTiming("internal-items.create", timingStartedAt, {
    itemType: input.itemType,
    status: error ? "error" : "created",
  });

  if (error || !createdItem) {
    return { status: "error", itemType: input.itemType };
  }

  return {
    status: "created",
    itemId: createdItem.id as string,
    itemType: input.itemType,
  };
}

async function updateManualInternalItem(
  formData: FormData,
): Promise<InternalItemActionResult> {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("supplier_items.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const itemId = getString(formData, "item_id");
  const input = getInternalItemInput(formData);

  if (!itemId) {
    return { status: "not_found", itemType: input.itemType };
  }

  if (!input.displayName) {
    return {
      status: "missing_name",
      itemId,
      itemType: input.itemType,
    };
  }

  const supabase = await createClient();
  const { data: item, error: itemError } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", itemId)
    .is("archived_at", null)
    .maybeSingle();

  if (itemError) {
    return { status: "error", itemId, itemType: input.itemType };
  }

  if (!item) {
    return { status: "not_found", itemId, itemType: input.itemType };
  }

  const { data: duplicateItem, error: duplicateCheckError } = await supabase
    .from("internal_items")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("item_type", input.itemType)
    .ilike("display_name", input.displayName)
    .neq("id", itemId)
    .is("archived_at", null)
    .maybeSingle();

  if (duplicateCheckError) {
    return { status: "error", itemId, itemType: input.itemType };
  }

  if (duplicateItem) {
    return { status: "duplicate", itemId, itemType: input.itemType };
  }

  const { error } = await supabase
    .from("internal_items")
    .update({
      display_name: input.displayName,
      item_type: input.itemType,
      base_unit: input.baseUnit,
      notes: input.notes,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", itemId);

  logDevRouteTiming("internal-items.update", timingStartedAt, {
    itemType: input.itemType,
    status: error ? "error" : "updated",
  });

  if (error) {
    return { status: "error", itemId, itemType: input.itemType };
  }

  return {
    status: "updated",
    itemId,
    itemType: input.itemType,
  };
}

export async function createInternalItemAction(formData: FormData) {
  const result = await createManualInternalItem(formData);
  const itemType = result.itemType ?? normaliseItemType(getString(formData, "item_type"));
  const listPath = getListPath(itemType);

  revalidatePath("/products");
  revalidatePath("/ingredients");
  revalidatePath("/packaging");
  revalidatePath("/components");
  revalidatePath("/finished-products");

  if (result.status === "created") {
    redirect(`/internal-items/${result.itemId}?item=created`);
  }

  if (result.status === "duplicate" && result.itemId) {
    redirect(`/internal-items/${result.itemId}?item=duplicate`);
  }

  redirect(`${listPath}?create=${result.status}`);
}

export async function updateInternalItemAction(formData: FormData) {
  const result = await updateManualInternalItem(formData);
  const itemId = result.itemId ?? getString(formData, "item_id");

  revalidatePath("/products");
  revalidatePath("/ingredients");
  revalidatePath("/packaging");
  revalidatePath("/components");
  revalidatePath("/finished-products");

  if (itemId) {
    revalidatePath(`/internal-items/${itemId}`);
  }

  if (result.status === "updated" && itemId) {
    redirect(`/internal-items/${itemId}?item=updated`);
  }

  if (itemId) {
    redirect(`/internal-items/${itemId}?item=${result.status}`);
  }

  redirect(`${getListPath(result.itemType ?? "ingredient")}?create=${result.status}`);
}
