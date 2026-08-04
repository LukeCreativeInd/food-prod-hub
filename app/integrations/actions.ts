"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const shopDomainPattern =
  /^[a-z0-9][a-z0-9-]*[a-z0-9]\.myshopify\.com$/;

export type ShopifyIntentActionState = {
  status: "idle" | "success" | "error";
  message: string;
  claimToken: string | null;
  expiresAt: string | null;
};

const initialShopifyIntentState: ShopifyIntentActionState = {
  status: "idle",
  message: "",
  claimToken: null,
  expiresAt: null,
};

function stringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createShopifyInstallIntentAction(
  _previousState: ShopifyIntentActionState,
  formData: FormData,
): Promise<ShopifyIntentActionState> {
  const authContext = await requirePermissionAccess("admin.integrations.manage");

  if (!authContext.organisation) {
    return { ...initialShopifyIntentState, status: "error", message: "Organisation unavailable." };
  }

  const displayName = stringField(formData, "storefront_display_name");
  const shopDomain = stringField(formData, "shop_domain").toLowerCase();
  const facilityId = stringField(formData, "facility_id");

  if (!displayName || displayName.length > 160) {
    return { ...initialShopifyIntentState, status: "error", message: "Enter a storefront display name." };
  }

  if (shopDomain && !shopDomainPattern.test(shopDomain)) {
    return { ...initialShopifyIntentState, status: "error", message: "Use the permanent shop-name.myshopify.com domain." };
  }

  if (facilityId && !uuidPattern.test(facilityId)) {
    return { ...initialShopifyIntentState, status: "error", message: "Select a valid facility." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_shopify_install_intent", {
    target_organisation_id: authContext.organisation.id,
    target_facility_id: facilityId || null,
    requested_storefront_display_name: displayName,
    requested_shop_domain: shopDomain || null,
    target_owner_external_business_id: null,
    target_manufacturing_relationship_id: null,
  });

  if (error || !data) {
    console.error("Shopify install intent failed", { message: error?.message });
    return {
      ...initialShopifyIntentState,
      status: "error",
      message: "Could not prepare the Shopify installation claim.",
    };
  }

  const result = data as {
    claim_token: string;
    expires_at: string;
  };

  return {
    status: "success",
    message: "Claim prepared. Use it once from the verified Shopify app session within 30 minutes.",
    claimToken: result.claim_token,
    expiresAt: result.expires_at,
  };
}

export async function acceptShopifyManufacturingConnectionAction(formData: FormData) {
  await requirePermissionAccess("admin.integrations.manage");
  const connectionId = stringField(formData, "connection_id");
  const facilityId = stringField(formData, "facility_id");

  if (!uuidPattern.test(connectionId) || (facilityId && !uuidPattern.test(facilityId))) {
    redirect("/integrations?shopify=invalid_request");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_shopify_manufacturing_connection", {
    target_connection_id: connectionId,
    target_facility_id: facilityId || null,
  });

  if (error) {
    console.error("Shopify manufacturer acceptance failed", { message: error.message });
    redirect("/integrations?shopify=acceptance_failed");
  }

  revalidatePath("/integrations");
  redirect("/integrations?shopify=accepted");
}
