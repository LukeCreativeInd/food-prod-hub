import { requirePermissionAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type SupplierRow = {
  id: string;
  display_name: string;
};

type PurchaseDocumentRow = {
  id: string;
  organisation_id: string;
  supplier_id: string | null;
  document_type: string;
  status: string;
  original_filename: string;
  storage_path: string | null;
  file_hash: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_total: number | null;
  tax_total: number | null;
  currency: string;
  supplier_legal_name_source: string | null;
  supplier_trading_name_source: string | null;
  supplier_abn_source: string | null;
  supplier_account_number_source: string | null;
  duplicate_of_document_id: string | null;
  uploaded_by_profile_id: string | null;
  reviewed_by_profile_id: string | null;
  committed_by_profile_id: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  committed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseDocumentSummary = PurchaseDocumentRow & {
  supplier_display_name: string | null;
};

export type PurchaseDocumentLine = {
  id: string;
  organisation_id: string;
  purchase_document_id: string;
  line_number: number;
  status: string;
  classification: string;
  supplier_item_id: string | null;
  internal_item_id: string | null;
  mapping_id: string | null;
  source_item_code: string | null;
  source_description: string | null;
  source_quantity: number | null;
  source_unit: string | null;
  source_unit_price: number | null;
  source_tax: number | null;
  source_line_total: number | null;
  normalised_item_code: string | null;
  normalised_description: string | null;
  normalised_quantity: number | null;
  normalised_unit: string | null;
  normalised_unit_price: number | null;
  normalised_tax: number | null;
  normalised_line_total: number | null;
  corrected_item_code: string | null;
  corrected_description: string | null;
  corrected_quantity: number | null;
  corrected_unit: string | null;
  corrected_unit_price: number | null;
  corrected_tax: number | null;
  corrected_line_total: number | null;
  confidence_score: number | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseDocumentReview = {
  document: PurchaseDocumentSummary;
  lines: PurchaseDocumentLine[];
};

export type UpdateReviewInput = {
  documentId: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceTotal: number | null;
  taxTotal: number | null;
  currency: string;
  supplierLegalNameSource: string | null;
  supplierTradingNameSource: string | null;
  supplierAbnSource: string | null;
  supplierAccountNumberSource: string | null;
  status: "needs_review" | "ready_to_commit";
  lines: {
    id: string;
    classification: string;
    correctedItemCode: string | null;
    correctedDescription: string | null;
    correctedQuantity: number | null;
    correctedUnit: string | null;
    correctedUnitPrice: number | null;
    correctedTax: number | null;
    correctedLineTotal: number | null;
    reviewNotes: string | null;
    status: string;
  }[];
};

const CAMMAROTO_SAMPLE = {
  originalFilename: "Cammaroto Poultry SI-00025954.pdf",
  invoiceNumber: "SI-00025954",
  invoiceDate: "2026-07-13",
  invoiceTotal: 548,
  taxTotal: 0,
  currency: "AUD",
  supplierLegalNameSource: "Surefire Solutions Group Unit Trust",
  supplierTradingNameSource: "Cammaroto Poultry",
  supplierAbnSource: "84 870 751 768",
  supplierAccountNumberSource: "555",
};

async function requirePurchaseDocumentPermission(permissionKey: string) {
  const authContext = await requirePermissionAccess(permissionKey);

  if (!authContext.profile || !authContext.organisation) {
    throw new Error("Current profile and organisation are required.");
  }

  return {
    profile: authContext.profile,
    organisation: authContext.organisation,
  };
}

const lineClassifications = new Set([
  "ingredient",
  "packaging",
  "consumable",
  "equipment",
  "non_stock_charge",
  "informational",
  "unknown",
]);

const lineStatuses = new Set([
  "unreviewed",
  "matched",
  "needs_review",
  "ready",
  "deferred",
  "ignored",
  "committed",
  "failed",
]);

function cleanText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normaliseLineClassification(value: string) {
  return lineClassifications.has(value) ? value : "unknown";
}

function normaliseLineStatus(value: string) {
  return lineStatuses.has(value) ? value : "needs_review";
}

function canMoveToReadyToCommit(input: UpdateReviewInput) {
  return Boolean(
    input.invoiceNumber &&
      input.invoiceDate &&
      input.invoiceTotal !== null &&
      input.lines.length > 0 &&
      input.lines.every((line) => line.classification !== "unknown"),
  );
}

async function getSupplierDisplayNames(
  organisationId: string,
  supplierIds: string[],
) {
  const uniqueSupplierIds = Array.from(new Set(supplierIds));

  if (uniqueSupplierIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("id, display_name")
    .eq("organisation_id", organisationId)
    .in("id", uniqueSupplierIds);

  return new Map(
    ((data as SupplierRow[] | null) ?? []).map((supplier) => [
      supplier.id,
      supplier.display_name,
    ]),
  );
}

function attachSupplierDisplayNames(
  documents: PurchaseDocumentRow[],
  suppliersById: Map<string, string>,
): PurchaseDocumentSummary[] {
  return documents.map((document) => ({
    ...document,
    supplier_display_name: document.supplier_id
      ? suppliersById.get(document.supplier_id) ?? null
      : null,
  }));
}

export async function getPurchaseDocumentsForCurrentOrganisation() {
  const authContext = await requirePurchaseDocumentPermission(
    "purchase_documents.view",
  );
  const supabase = await createClient();
  const organisationId = authContext.organisation.id;

  const { data, error } = await supabase
    .from("purchase_documents")
    .select("*")
    .eq("organisation_id", organisationId)
    .order("uploaded_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not load purchase documents.");
  }

  const documents = (data as PurchaseDocumentRow[] | null) ?? [];
  const suppliersById = await getSupplierDisplayNames(
    organisationId,
    documents
      .map((document) => document.supplier_id)
      .filter((supplierId): supplierId is string => Boolean(supplierId)),
  );

  return attachSupplierDisplayNames(documents, suppliersById);
}

export async function getPurchaseDocumentReview(
  documentId: string,
): Promise<PurchaseDocumentReview | null> {
  const authContext = await requirePurchaseDocumentPermission(
    "purchase_documents.view",
  );
  const supabase = await createClient();
  const organisationId = authContext.organisation.id;

  const { data: documentData, error: documentError } = await supabase
    .from("purchase_documents")
    .select("*")
    .eq("organisation_id", organisationId)
    .eq("id", documentId)
    .maybeSingle();

  if (documentError) {
    throw new Error("Could not load purchase document.");
  }

  const document = documentData as PurchaseDocumentRow | null;

  if (!document) {
    return null;
  }

  const { data: lineData, error: lineError } = await supabase
    .from("purchase_document_lines")
    .select("*")
    .eq("organisation_id", organisationId)
    .eq("purchase_document_id", documentId)
    .order("line_number", { ascending: true });

  if (lineError) {
    throw new Error("Could not load purchase document lines.");
  }

  const suppliersById = await getSupplierDisplayNames(
    organisationId,
    document.supplier_id ? [document.supplier_id] : [],
  );

  return {
    document: attachSupplierDisplayNames([document], suppliersById)[0],
    lines: (lineData as PurchaseDocumentLine[] | null) ?? [],
  };
}

export async function createCammarotoSampleReview() {
  const authContext = await requirePurchaseDocumentPermission(
    "purchase_documents.upload",
  );
  const supabase = await createClient();
  const organisationId = authContext.organisation.id;

  const { data: existingDocuments, error: duplicateError } = await supabase
    .from("purchase_documents")
    .select("id, supplier_legal_name_source, supplier_trading_name_source")
    .eq("organisation_id", organisationId)
    .eq("invoice_number", CAMMAROTO_SAMPLE.invoiceNumber)
    .eq("invoice_date", CAMMAROTO_SAMPLE.invoiceDate)
    .eq("invoice_total", CAMMAROTO_SAMPLE.invoiceTotal);

  if (duplicateError) {
    throw new Error("Could not check for an existing Cammaroto sample.");
  }

  const existingDocument = (
    (existingDocuments as
      | {
          id: string;
          supplier_legal_name_source: string | null;
          supplier_trading_name_source: string | null;
        }[]
      | null) ?? []
  ).find(
    (document) =>
      document.supplier_trading_name_source ===
        CAMMAROTO_SAMPLE.supplierTradingNameSource ||
      document.supplier_legal_name_source ===
        CAMMAROTO_SAMPLE.supplierLegalNameSource,
  );

  if (existingDocument) {
    return {
      documentId: existingDocument.id,
      duplicate: true,
      message: "Existing Cammaroto sample review found. No duplicate was created.",
    };
  }

  const { data: insertedDocument, error: insertDocumentError } = await supabase
    .from("purchase_documents")
    .insert({
      organisation_id: organisationId,
      document_type: "invoice",
      status: "needs_review",
      original_filename: CAMMAROTO_SAMPLE.originalFilename,
      invoice_number: CAMMAROTO_SAMPLE.invoiceNumber,
      invoice_date: CAMMAROTO_SAMPLE.invoiceDate,
      invoice_total: CAMMAROTO_SAMPLE.invoiceTotal,
      tax_total: CAMMAROTO_SAMPLE.taxTotal,
      currency: CAMMAROTO_SAMPLE.currency,
      supplier_legal_name_source: CAMMAROTO_SAMPLE.supplierLegalNameSource,
      supplier_trading_name_source: CAMMAROTO_SAMPLE.supplierTradingNameSource,
      supplier_abn_source: CAMMAROTO_SAMPLE.supplierAbnSource,
      supplier_account_number_source:
        CAMMAROTO_SAMPLE.supplierAccountNumberSource,
      uploaded_by_profile_id: authContext.profile.id,
    })
    .select("id")
    .single();

  if (insertDocumentError || !insertedDocument) {
    throw new Error("Could not create Cammaroto sample review.");
  }

  const documentId = (insertedDocument as { id: string }).id;
  const { error: insertLinesError } = await supabase
    .from("purchase_document_lines")
    .insert([
      {
        organisation_id: organisationId,
        purchase_document_id: documentId,
        line_number: 1,
        status: "needs_review",
        classification: "ingredient",
        source_item_code: "T/F-DCE M-VA",
        source_description: "THIGH FILLET NO SKIN DICEDMARINATED VAC PACK",
        source_quantity: 40,
        source_unit: "KG",
        source_unit_price: 13.7,
        source_tax: 0,
        source_line_total: 548,
        normalised_item_code: "T/F-DCE M-VA",
        normalised_description: "Thigh Fillet No Skin Diced Marinated Vac Pack",
        normalised_quantity: 40,
        normalised_unit: "KG",
        normalised_unit_price: 13.7,
        normalised_tax: 0,
        normalised_line_total: 548,
        review_notes: "Suggested internal item: Chicken Thigh.",
      },
      {
        organisation_id: organisationId,
        purchase_document_id: documentId,
        line_number: 2,
        status: "needs_review",
        classification: "informational",
        source_item_code: "CTNS",
        source_description: "CARTONS",
        source_quantity: 3,
        source_unit: "CTNS",
        source_unit_price: 0,
        source_tax: 0,
        source_line_total: 0,
        normalised_item_code: "CTNS",
        normalised_description: "CARTONS",
        normalised_quantity: 3,
        normalised_unit: "CTNS",
        normalised_unit_price: 0,
        normalised_tax: 0,
        normalised_line_total: 0,
        review_notes: "Suggested informational ignored-line rule.",
      },
    ]);

  if (insertLinesError) {
    throw new Error("Could not create Cammaroto sample lines.");
  }

  return {
    documentId,
    duplicate: false,
    message: "Cammaroto sample review created.",
  };
}

export async function updatePurchaseDocumentReview(input: UpdateReviewInput) {
  const authContext = await requirePurchaseDocumentPermission(
    "purchase_documents.review",
  );
  const supabase = await createClient();
  const organisationId = authContext.organisation.id;
  const requestedStatus = input.status;
  const nextStatus =
    requestedStatus === "ready_to_commit" && !canMoveToReadyToCommit(input)
      ? "needs_review"
      : requestedStatus;

  const { data: documentData, error: documentError } = await supabase
    .from("purchase_documents")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("id", input.documentId)
    .maybeSingle();

  if (documentError) {
    throw new Error("Could not verify purchase document access.");
  }

  if (!documentData) {
    return {
      documentId: input.documentId,
      saved: false,
      message: "Purchase document was not found or is not accessible.",
    };
  }

  const { error: updateDocumentError } = await supabase
    .from("purchase_documents")
    .update({
      invoice_number: input.invoiceNumber,
      invoice_date: input.invoiceDate,
      invoice_total: input.invoiceTotal,
      tax_total: input.taxTotal,
      currency: input.currency.toUpperCase(),
      supplier_legal_name_source: input.supplierLegalNameSource,
      supplier_trading_name_source: input.supplierTradingNameSource,
      supplier_abn_source: input.supplierAbnSource,
      supplier_account_number_source: input.supplierAccountNumberSource,
      status: nextStatus,
      reviewed_by_profile_id: authContext.profile.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("organisation_id", organisationId)
    .eq("id", input.documentId);

  if (updateDocumentError) {
    throw new Error("Could not save purchase document review.");
  }

  for (const line of input.lines) {
    const { error: lineError } = await supabase
      .from("purchase_document_lines")
      .update({
        classification: normaliseLineClassification(line.classification),
        corrected_item_code: cleanText(line.correctedItemCode),
        corrected_description: cleanText(line.correctedDescription),
        corrected_quantity: line.correctedQuantity,
        corrected_unit: cleanText(line.correctedUnit),
        corrected_unit_price: line.correctedUnitPrice,
        corrected_tax: line.correctedTax,
        corrected_line_total: line.correctedLineTotal,
        review_notes: cleanText(line.reviewNotes),
        status: normaliseLineStatus(line.status),
        updated_at: new Date().toISOString(),
      })
      .eq("organisation_id", organisationId)
      .eq("purchase_document_id", input.documentId)
      .eq("id", line.id);

    if (lineError) {
      throw new Error("Could not save purchase document line review.");
    }
  }

  return {
    documentId: input.documentId,
    saved: true,
    message:
      nextStatus === "ready_to_commit"
        ? "Review progress saved. Document is ready for the future commit flow."
        : "Review progress saved. Required fields are still needed before ready-to-commit.",
  };
}
