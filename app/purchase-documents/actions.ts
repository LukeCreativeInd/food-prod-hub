"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  commitCammarotoPurchaseDocumentReview,
  createCammarotoSampleReview,
  updatePurchaseDocumentReview,
  type UpdateReviewInput,
} from "@/lib/purchase-document-intake";

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

export async function createCammarotoSampleReviewAction() {
  const result = await createCammarotoSampleReview();

  revalidatePath("/purchase-documents");
  redirect(
    `/purchase-documents/${result.documentId}?sample=${
      result.duplicate ? "existing" : "created"
    }`,
  );
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
  const result = await commitCammarotoPurchaseDocumentReview(documentId);

  revalidatePath("/purchase-documents");
  revalidatePath(`/purchase-documents/${documentId}`);
  redirect(`/purchase-documents/${result.documentId}?commit=${result.status}`);
}
