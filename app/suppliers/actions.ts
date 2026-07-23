"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermissionAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type SupplierActionResult =
  | {
      status: "created" | "updated";
      supplierId: string;
    }
  | {
      status: "missing_name" | "duplicate" | "not_found" | "error";
      supplierId?: string;
    };

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function getSupplierInput(formData: FormData) {
  const status = getString(formData, "status");

  return {
    displayName: getString(formData, "display_name"),
    legalName: getOptionalString(formData, "legal_name"),
    abn: getOptionalString(formData, "abn"),
    supplierType: getOptionalString(formData, "supplier_type"),
    notes: getOptionalString(formData, "notes"),
    status: status === "inactive" ? "inactive" : "active",
  };
}

async function createManualSupplier(
  formData: FormData,
): Promise<SupplierActionResult> {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("supplier_items.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const input = getSupplierInput(formData);

  if (!input.displayName) {
    return { status: "missing_name" };
  }

  const supabase = await createClient();
  const { data: existingSupplier, error: duplicateCheckError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("organisation_id", organisationId)
    .ilike("display_name", input.displayName)
    .is("archived_at", null)
    .maybeSingle();

  if (duplicateCheckError) {
    return { status: "error" };
  }

  if (existingSupplier) {
    return { status: "duplicate", supplierId: existingSupplier.id as string };
  }

  const { data: createdSupplier, error } = await supabase
    .from("suppliers")
    .insert({
      organisation_id: organisationId,
      display_name: input.displayName,
      legal_name: input.legalName,
      abn: input.abn,
      supplier_type: input.supplierType,
      notes: input.notes,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  logDevRouteTiming("suppliers.create", timingStartedAt, {
    status: error ? "error" : "created",
  });

  if (error || !createdSupplier) {
    return { status: "error" };
  }

  return {
    status: "created",
    supplierId: createdSupplier.id as string,
  };
}

async function updateManualSupplier(
  formData: FormData,
): Promise<SupplierActionResult> {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("supplier_items.manage");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const supplierId = getString(formData, "supplier_id");
  const input = getSupplierInput(formData);

  if (!supplierId) {
    return { status: "not_found" };
  }

  if (!input.displayName) {
    return { status: "missing_name", supplierId };
  }

  const supabase = await createClient();
  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", supplierId)
    .is("archived_at", null)
    .maybeSingle();

  if (supplierError) {
    return { status: "error", supplierId };
  }

  if (!supplier) {
    return { status: "not_found", supplierId };
  }

  const { data: duplicateSupplier, error: duplicateCheckError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("organisation_id", organisationId)
    .ilike("display_name", input.displayName)
    .neq("id", supplierId)
    .is("archived_at", null)
    .maybeSingle();

  if (duplicateCheckError) {
    return { status: "error", supplierId };
  }

  if (duplicateSupplier) {
    return { status: "duplicate", supplierId };
  }

  const { error } = await supabase
    .from("suppliers")
    .update({
      display_name: input.displayName,
      legal_name: input.legalName,
      abn: input.abn,
      supplier_type: input.supplierType,
      notes: input.notes,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", supplierId);

  logDevRouteTiming("suppliers.update", timingStartedAt, {
    status: error ? "error" : "updated",
  });

  if (error) {
    return { status: "error", supplierId };
  }

  return {
    status: "updated",
    supplierId,
  };
}

export async function createSupplierAction(formData: FormData) {
  const result = await createManualSupplier(formData);

  revalidatePath("/products");
  revalidatePath("/suppliers");

  if (result.status === "created") {
    redirect(`/suppliers/${result.supplierId}?supplier=created`);
  }

  if (result.status === "duplicate" && result.supplierId) {
    redirect(`/suppliers/${result.supplierId}?supplier=duplicate`);
  }

  redirect(`/suppliers?create=${result.status}`);
}

export async function updateSupplierAction(formData: FormData) {
  const result = await updateManualSupplier(formData);
  const supplierId = result.supplierId ?? getString(formData, "supplier_id");

  revalidatePath("/products");
  revalidatePath("/suppliers");

  if (supplierId) {
    revalidatePath(`/suppliers/${supplierId}`);
  }

  if (result.status === "updated" && supplierId) {
    redirect(`/suppliers/${supplierId}?supplier=updated`);
  }

  if (supplierId) {
    redirect(`/suppliers/${supplierId}?supplier=${result.status}`);
  }

  redirect(`/suppliers?create=${result.status}`);
}
