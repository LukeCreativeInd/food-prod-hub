"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function stringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function detailHref(catalogueItemId: string, result: string) {
  return `/integrations/shopify/mappings/${catalogueItemId}?mapping=${encodeURIComponent(result)}`;
}

function revalidateMappingPaths(catalogueItemId: string) {
  revalidatePath("/integrations");
  revalidatePath("/integrations/shopify/mappings");
  revalidatePath(`/integrations/shopify/mappings/${catalogueItemId}`);
}

async function requireMappingManager() {
  const authContext = await requirePermissionAccess("admin.integrations.manage");
  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }
  return authContext;
}

export async function createCommerceMappingDraftAction(formData: FormData) {
  await requireMappingManager();
  const catalogueItemId = stringField(formData, "catalogue_item_id");
  const mappingKind = stringField(formData, "mapping_kind");
  const supersedesMappingId = stringField(formData, "supersedes_mapping_id");
  const safeNote = stringField(formData, "safe_note");

  if (
    !uuidPattern.test(catalogueItemId) ||
    (supersedesMappingId && !uuidPattern.test(supersedesMappingId)) ||
    !["direct", "bundle", "exclusion"].includes(mappingKind)
  ) {
    redirect(detailHref(catalogueItemId, "invalid_request"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_commerce_catalogue_mapping_draft", {
    target_external_catalogue_item_id: catalogueItemId,
    requested_mapping_kind: mappingKind,
    target_supersedes_mapping_id: supersedesMappingId || null,
    requested_safe_note: safeNote || null,
  });

  if (error) {
    console.error("Commerce mapping draft creation failed", {
      code: error.code,
      message: error.message,
    });
    redirect(detailHref(catalogueItemId, "draft_failed"));
  }

  revalidateMappingPaths(catalogueItemId);
  redirect(detailHref(catalogueItemId, "draft_created"));
}

export async function replaceCommerceMappingOutputsAction(formData: FormData) {
  await requireMappingManager();
  const catalogueItemId = stringField(formData, "catalogue_item_id");
  const mappingId = stringField(formData, "mapping_id");
  const itemIds = formData.getAll("output_internal_item_id");
  const quantities = formData.getAll("output_quantity_multiplier");
  const outputUoms = formData.getAll("output_uom");
  const outputRoles = formData.getAll("output_role");

  if (!uuidPattern.test(catalogueItemId) || !uuidPattern.test(mappingId)) {
    redirect(detailHref(catalogueItemId, "invalid_request"));
  }

  if (
    itemIds.length !== quantities.length ||
    itemIds.length !== outputUoms.length ||
    itemIds.length !== outputRoles.length ||
    itemIds.length > 100
  ) {
    redirect(detailHref(catalogueItemId, "invalid_outputs"));
  }

  const requestedOutputs = itemIds.flatMap((itemId, index) => {
    if (typeof itemId !== "string" || itemId.trim() === "") {
      return [];
    }

    return [
      {
        internal_item_id: itemId.trim(),
        quantity_multiplier:
          typeof quantities[index] === "string" ? quantities[index].trim() : "",
        output_uom:
          typeof outputUoms[index] === "string" ? outputUoms[index].trim() : "",
        output_role:
          typeof outputRoles[index] === "string" ? outputRoles[index].trim() : "primary",
      },
    ];
  });

  const supabase = await createClient();
  const { error } = await supabase.rpc("replace_commerce_catalogue_mapping_outputs", {
    target_mapping_id: mappingId,
    requested_outputs: requestedOutputs,
  });

  if (error) {
    console.error("Commerce mapping output replacement failed", {
      code: error.code,
      message: error.message,
    });
    redirect(detailHref(catalogueItemId, "outputs_failed"));
  }

  revalidateMappingPaths(catalogueItemId);
  redirect(detailHref(catalogueItemId, "outputs_saved"));
}

async function runMappingLifecycleAction(
  formData: FormData,
  rpcName:
    | "submit_commerce_catalogue_mapping"
    | "approve_commerce_catalogue_mapping"
    | "archive_commerce_catalogue_mapping",
  successResult: string,
  failureResult: string,
) {
  await requireMappingManager();
  const catalogueItemId = stringField(formData, "catalogue_item_id");
  const mappingId = stringField(formData, "mapping_id");

  if (!uuidPattern.test(catalogueItemId) || !uuidPattern.test(mappingId)) {
    redirect(detailHref(catalogueItemId, "invalid_request"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc(rpcName, { target_mapping_id: mappingId });

  if (error) {
    console.error(`Commerce mapping ${rpcName} failed`, {
      code: error.code,
      message: error.message,
    });
    redirect(detailHref(catalogueItemId, failureResult));
  }

  revalidateMappingPaths(catalogueItemId);
  redirect(detailHref(catalogueItemId, successResult));
}

export async function submitCommerceMappingAction(formData: FormData) {
  return runMappingLifecycleAction(
    formData,
    "submit_commerce_catalogue_mapping",
    "submitted",
    "submit_failed",
  );
}

export async function approveCommerceMappingAction(formData: FormData) {
  return runMappingLifecycleAction(
    formData,
    "approve_commerce_catalogue_mapping",
    "approved",
    "approve_failed",
  );
}

export async function archiveCommerceMappingAction(formData: FormData) {
  return runMappingLifecycleAction(
    formData,
    "archive_commerce_catalogue_mapping",
    "archived",
    "archive_failed",
  );
}

export async function rejectCommerceMappingAction(formData: FormData) {
  await requireMappingManager();
  const catalogueItemId = stringField(formData, "catalogue_item_id");
  const mappingId = stringField(formData, "mapping_id");
  const reasonCategory = stringField(formData, "reason_category");

  if (
    !uuidPattern.test(catalogueItemId) ||
    !uuidPattern.test(mappingId) ||
    ![
      "invalid_target",
      "invalid_quantity",
      "invalid_source_identity",
      "duplicate_mapping",
      "business_decision",
      "other",
    ].includes(reasonCategory)
  ) {
    redirect(detailHref(catalogueItemId, "invalid_request"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_commerce_catalogue_mapping", {
    target_mapping_id: mappingId,
    requested_reason_category: reasonCategory,
  });

  if (error) {
    console.error("Commerce mapping rejection failed", {
      code: error.code,
      message: error.message,
    });
    redirect(detailHref(catalogueItemId, "reject_failed"));
  }

  revalidateMappingPaths(catalogueItemId);
  redirect(detailHref(catalogueItemId, "rejected"));
}
