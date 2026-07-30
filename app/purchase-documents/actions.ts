"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  commitPurchaseDocumentReview,
  createCammarotoSampleReview,
  extractPurchaseDocument,
  uploadPurchaseDocument,
  updatePurchaseDocumentReview,
  type UpdateReviewInput,
} from "@/lib/purchase-document-intake";
import { requirePermissionAccessWithPermissions } from "@/lib/auth";
import { getInvoiceToReceivingSummary } from "@/lib/invoice-to-receiving-data";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export type UploadPurchaseDocumentActionState = {
  status: "idle" | "error";
  message: string;
};

export async function uploadPurchaseDocumentAction(
  _previousState: UploadPurchaseDocumentActionState,
  formData: FormData,
): Promise<UploadPurchaseDocumentActionState> {
  const fileValue = formData.get("purchase_document");

  if (!(fileValue instanceof File)) {
    return {
      status: "error",
      message: "Choose a PDF or image file before uploading.",
    };
  }

  let result: Awaited<ReturnType<typeof uploadPurchaseDocument>>;

  try {
    result = await uploadPurchaseDocument(fileValue);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not upload purchase document.",
    };
  }

  revalidatePath("/purchase-documents");
  redirect(
    `/purchase-documents/${result.documentId}?upload=${
      result.duplicate ? "duplicate" : "created"
    }`,
  );
}

export async function createCammarotoSampleReviewAction() {
  const result = await createCammarotoSampleReview();

  revalidatePath("/purchase-documents");
  redirect(
    `/purchase-documents/${result.documentId}?sample=${
      result.duplicate ? "existing" : "created"
    }`,
  );
}

export async function extractPurchaseDocumentAction(formData: FormData) {
  const documentId = getString(formData, "document_id");
  const result = await extractPurchaseDocument(documentId);

  revalidatePath("/purchase-documents");
  revalidatePath(`/purchase-documents/${documentId}`);
  redirect(`/purchase-documents/${result.documentId}?extract=${result.status}`);
}

export async function savePurchaseDocumentReviewAction(formData: FormData) {
  const documentId = getString(formData, "document_id");
  const lineIds = formData.getAll("line_ids").filter((lineId): lineId is string =>
    typeof lineId === "string",
  );

  const status = getString(formData, "status");
  const input: UpdateReviewInput = {
    documentId,
    invoiceNumber: getOptionalString(formData, "invoice_number"),
    invoiceDate: getOptionalString(formData, "invoice_date"),
    invoiceTotal: getOptionalNumber(formData, "invoice_total"),
    taxTotal: getOptionalNumber(formData, "tax_total"),
    currency: getString(formData, "currency") || "AUD",
    supplierLegalNameSource: getOptionalString(
      formData,
      "supplier_legal_name_source",
    ),
    supplierTradingNameSource: getOptionalString(
      formData,
      "supplier_trading_name_source",
    ),
    supplierAbnSource: getOptionalString(formData, "supplier_abn_source"),
    supplierAccountNumberSource: getOptionalString(
      formData,
      "supplier_account_number_source",
    ),
    status: status === "ready_to_commit" ? "ready_to_commit" : "needs_review",
    lines: lineIds.map((lineId) => ({
      id: lineId,
      classification: getString(formData, `line_${lineId}_classification`),
      correctedItemCode: getOptionalString(
        formData,
        `line_${lineId}_corrected_item_code`,
      ),
      correctedDescription: getOptionalString(
        formData,
        `line_${lineId}_corrected_description`,
      ),
      correctedQuantity: getOptionalNumber(
        formData,
        `line_${lineId}_corrected_quantity`,
      ),
      correctedUnit: getOptionalString(
        formData,
        `line_${lineId}_corrected_unit`,
      ),
      correctedUnitPrice: getOptionalNumber(
        formData,
        `line_${lineId}_corrected_unit_price`,
      ),
      correctedTax: getOptionalNumber(
        formData,
        `line_${lineId}_corrected_tax`,
      ),
      correctedLineTotal: getOptionalNumber(
        formData,
        `line_${lineId}_corrected_line_total`,
      ),
      internalItemName: getOptionalString(
        formData,
        `line_${lineId}_internal_item_name`,
      ),
      reviewNotes: getOptionalString(formData, `line_${lineId}_review_notes`),
      status: getString(formData, `line_${lineId}_status`),
    })),
  };

  const result = await updatePurchaseDocumentReview(input);

  revalidatePath("/purchase-documents");
  revalidatePath(`/purchase-documents/${documentId}`);
  redirect(
    `/purchase-documents/${result.documentId}?saved=${
      result.saved ? "true" : "not-found"
    }`,
  );
}

export async function commitPurchaseDocumentReviewAction(formData: FormData) {
  const documentId = getString(formData, "document_id");
  let result: Awaited<ReturnType<typeof commitPurchaseDocumentReview>>;

  try {
    result = await commitPurchaseDocumentReview(documentId);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[purchase-document-commit-action]", {
        documentId,
        error,
      });
    }

    revalidatePath("/purchase-documents");
    revalidatePath(`/purchase-documents/${documentId}`);
    redirect(`/purchase-documents/${documentId}?commit=error`);
  }

  revalidatePath("/purchase-documents");
  revalidatePath(`/purchase-documents/${documentId}`);
  redirect(
    `/purchase-documents/${result.documentId}?commit=${result.status}${
      result.durationMs ? `&durationMs=${result.durationMs}` : ""
    }`,
  );
}

export async function createGoodsInwardsDraftFromInvoiceAction(formData: FormData) {
  const documentId = getString(formData, "document_id");
  const defaultStockLocationId = getString(formData, "stock_location_id");

  if (!documentId) {
    redirect("/purchase-documents?receiving=invalid_document");
  }

  if (!defaultStockLocationId) {
    redirect(`/purchase-documents/${documentId}?receiving=missing_location`);
  }

  const { authContext, permissionKeys } =
    await requirePermissionAccessWithPermissions("inventory_receipts.create");

  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }

  if (!permissionKeys.includes("purchase_documents.view")) {
    redirect(`/purchase-documents/${documentId}?receiving=permission_required`);
  }

  const organisationId = authContext.organisation.id;
  const profileId = authContext.profile.id;
  const supabase = await createClient();

  const { data: location, error: locationError } = await supabase
    .from("inventory_locations")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", defaultStockLocationId)
    .eq("status", "active")
    .is("archived_at", null)
    .maybeSingle();

  if (locationError || !location) {
    redirect(`/purchase-documents/${documentId}?receiving=missing_location`);
  }

  const summary = await getInvoiceToReceivingSummary(documentId);

  if (!summary) {
    redirect(`/purchase-documents/${documentId}?receiving=invalid_document`);
  }

  if (summary.eligibleLines.length === 0) {
    redirect(`/purchase-documents/${documentId}?receiving=no_eligible_lines`);
  }

  const sourceReference =
    summary.document.invoice_number ??
    summary.document.original_filename ??
    `Purchase document ${summary.document.id}`;
  const receivedAt = summary.document.invoice_date
    ? new Date(`${summary.document.invoice_date}T00:00:00.000Z`).toISOString()
    : new Date().toISOString();

  const { data: receipt, error: receiptError } = await supabase
    .from("inventory_receipts")
    .insert({
      organisation_id: organisationId,
      supplier_id: summary.document.supplier_id,
      purchase_document_id: summary.document.id,
      supplier_reference: sourceReference,
      received_at: receivedAt,
      status: "draft",
      notes:
        "Created as a draft from Supplier Invoice Intake. Stock is not updated until this Goods Inwards receipt is reviewed and posted.",
      created_by_profile_id: profileId,
    })
    .select("id")
    .single();

  if (receiptError || !receipt) {
    redirect(`/purchase-documents/${documentId}?receiving=error`);
  }

  const now = new Date().toISOString();
  const linesToInsert = summary.eligibleLines.map((line) => ({
    organisation_id: organisationId,
    receipt_id: receipt.id,
    internal_item_id: line.internalItemId,
    supplier_item_id: line.supplierItemId,
    purchase_document_line_id: line.id,
    stock_location_id: defaultStockLocationId,
    received_quantity: line.receivedQuantity,
    received_unit: line.receivedUnit,
    inventory_quantity: line.inventoryQuantity,
    inventory_unit: line.inventoryUnit,
    unit_conversion_factor: line.unitConversionFactor,
    conversion_status: line.conversionStatus,
    lot_number: null,
    expiry_date: null,
    use_by_date: null,
    manufacture_date: null,
    qa_status: "not_checked",
    status: "draft",
    notes: `Created from invoice line ${line.lineNumber}. ${line.conversionNote}`,
  }));

  const { error: linesError } = await supabase
    .from("inventory_receipt_lines")
    .insert(linesToInsert);

  if (linesError) {
    await supabase
      .from("inventory_receipts")
      .update({
        status: "cancelled",
        cancelled_at: now,
        updated_at: now,
        notes:
          "Cancelled automatically because invoice-to-receiving draft line creation failed. Review the source invoice before retrying.",
      })
      .eq("organisation_id", organisationId)
      .eq("id", receipt.id)
      .eq("status", "draft");

    if (process.env.NODE_ENV !== "production") {
      console.error("[invoice-to-receiving-create]", {
        documentId,
        receiptId: receipt.id,
        error: linesError,
      });
    }

    redirect(`/purchase-documents/${documentId}?receiving=line_error`);
  }

  revalidatePath("/purchase-documents");
  revalidatePath(`/purchase-documents/${documentId}`);
  revalidatePath("/goods-inwards");
  revalidatePath(`/goods-inwards/${receipt.id}`);
  redirect(`/goods-inwards/${receipt.id}?receipt=created_from_invoice`);
}
