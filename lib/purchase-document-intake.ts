import { requirePermissionAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createHash, randomUUID } from "crypto";

type SupplierRow = {
  id: string;
  display_name: string;
  legal_name?: string | null;
  abn?: string | null;
};

type SupplierAliasRow = {
  id: string;
  supplier_id: string;
};

type SupplierItemRow = {
  id: string;
  supplier_description: string;
  normalised_supplier_description: string | null;
};

type InternalItemRow = {
  id: string;
  display_name: string;
};

type SupplierItemMappingRow = {
  id: string;
};

type PriceObservationRow = {
  id: string;
};

type ApprovedSupplierPriceRow = {
  id: string;
  unit_price: number;
  effective_date: string;
  source_price_observation_id: string | null;
};

type IgnoredLineRuleRow = {
  id: string;
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
  sourceFile: {
    signedUrl: string | null;
    error: string | null;
  };
};

export type CommitPurchaseDocumentResult = {
  documentId: string;
  status: "committed" | "already_committed" | "validation_failed";
  message: string;
  summary?: {
    supplier: string;
    supplierAliases: string[];
    supplierItem: string;
    internalItem: string;
    mapping: string;
    priceObservation: string;
    approvedSupplierPrice: string;
    informationalRule: string;
    stockMovements: "none";
  };
  errors?: string[];
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
    internalItemName: string | null;
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

const PURCHASE_DOCUMENT_BUCKET = "purchase-documents";
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const supportedUploadMimeTypes = new Map([
  ["application/pdf", "PDF"],
  ["image/jpeg", "JPEG image"],
  ["image/png", "PNG image"],
  ["image/webp", "WebP image"],
  ["image/heic", "HEIC image"],
]);
const INTERNAL_ITEM_NAME_PREFIX = "Internal item name:";
const stockLineClassifications = new Set([
  "ingredient",
  "packaging",
  "consumable",
  "equipment",
]);

type SupabaseStorageError = {
  statusCode?: string | number;
  error?: string;
  message?: string;
  code?: string;
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

function sanitiseFilename(filename: string) {
  const cleanFilename = filename
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 140);

  return cleanFilename || "purchase-document";
}

function formatBytes(bytes: number | null) {
  if (bytes === null) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function isSupportedUploadMimeType(mimeType: string) {
  return supportedUploadMimeTypes.has(mimeType);
}

function getSupportedUploadLabel() {
  return Array.from(supportedUploadMimeTypes.values()).join(", ");
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function getStorageUploadErrorMessage(error: SupabaseStorageError) {
  const statusCode = String(error.statusCode ?? "");
  const rawMessage = `${error.error ?? ""} ${error.message ?? ""} ${
    error.code ?? ""
  }`.toLowerCase();

  if (statusCode === "404" || rawMessage.includes("bucket not found")) {
    return "Storage bucket missing. Ask an admin to apply migration 019 for the private purchase-documents bucket.";
  }

  if (
    statusCode === "403" ||
    rawMessage.includes("row-level security") ||
    rawMessage.includes("violates row-level security") ||
    rawMessage.includes("not authorized") ||
    rawMessage.includes("unauthorized") ||
    rawMessage.includes("permission")
  ) {
    return "Storage policy rejected the upload. Confirm your role has purchase_documents.upload and the path is tenant-scoped.";
  }

  if (
    statusCode === "400" &&
    (rawMessage.includes("mime") ||
      rawMessage.includes("content type") ||
      rawMessage.includes("file type"))
  ) {
    return `Invalid MIME type for storage bucket. Accepted types: ${getSupportedUploadLabel()}.`;
  }

  if (
    statusCode === "400" &&
    (rawMessage.includes("size") || rawMessage.includes("too large"))
  ) {
    return `File is too large for storage. Maximum upload size is ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  }

  if (statusCode === "409" || rawMessage.includes("already exists")) {
    return "A storage object already exists for this upload path. Try uploading again or open the existing document if it was already created.";
  }

  return "Could not upload the source file. Check the server logs for the Supabase storage error details.";
}

function logUploadDebug(
  stage: "attempt" | "storage_error" | "insert_error",
  details: {
    organisationId: string;
    storagePath: string;
    mimeType: string;
    fileSize: number;
    error?: unknown;
  },
) {
  if (!isDevelopment()) {
    return;
  }

  console.error("[purchase-document-upload]", {
    stage,
    organisationId: details.organisationId,
    storagePath: details.storagePath,
    mimeType: details.mimeType,
    fileSize: details.fileSize,
    error: details.error,
  });
}

async function findDuplicatePurchaseDocument({
  organisationId,
  fileHash,
  originalFilename,
  fileSizeBytes,
}: {
  organisationId: string;
  fileHash: string;
  originalFilename: string;
  fileSizeBytes: number;
}) {
  const supabase = await createClient();

  const { data: hashDuplicate, error: hashError } = await supabase
    .from("purchase_documents")
    .select("id, original_filename, status")
    .eq("organisation_id", organisationId)
    .eq("file_hash", fileHash)
    .order("uploaded_at", { ascending: false })
    .limit(1);

  if (hashError) {
    throw new Error("Could not check for duplicate purchase documents.");
  }

  const hashDuplicateRow = (
    (hashDuplicate as
      | Pick<PurchaseDocumentRow, "id" | "original_filename" | "status">[]
      | null) ?? []
  )[0];

  if (hashDuplicateRow) {
    return hashDuplicateRow as Pick<
      PurchaseDocumentRow,
      "id" | "original_filename" | "status"
    >;
  }

  const { data: filenameDuplicate, error: filenameError } = await supabase
    .from("purchase_documents")
    .select("id, original_filename, status")
    .eq("organisation_id", organisationId)
    .eq("original_filename", originalFilename)
    .eq("file_size_bytes", fileSizeBytes)
    .order("uploaded_at", { ascending: false })
    .limit(1);

  if (filenameError) {
    throw new Error("Could not check filename duplicate purchase documents.");
  }

  return (
    (filenameDuplicate as
      | Pick<PurchaseDocumentRow, "id" | "original_filename" | "status">[]
      | null) ?? []
  )[0] ?? null;
}

export const purchaseDocumentUploadConfig = {
  bucket: PURCHASE_DOCUMENT_BUCKET,
  maxUploadBytes: MAX_UPLOAD_BYTES,
  maxUploadLabel: formatBytes(MAX_UPLOAD_BYTES),
  supportedMimeTypes: Array.from(supportedUploadMimeTypes.keys()),
  supportedUploadLabel: getSupportedUploadLabel(),
};

export function getReviewedInternalItemName(line: Pick<PurchaseDocumentLine, "review_notes">) {
  const markerLine = line.review_notes
    ?.split("\n")
    .find((noteLine) => noteLine.startsWith(INTERNAL_ITEM_NAME_PREFIX));

  return cleanText(markerLine?.slice(INTERNAL_ITEM_NAME_PREFIX.length));
}

export function getReviewNotesWithoutInternalItemName(
  reviewNotes: string | null,
) {
  return cleanText(
    reviewNotes
      ?.split("\n")
      .filter((noteLine) => !noteLine.startsWith(INTERNAL_ITEM_NAME_PREFIX))
      .join("\n"),
  );
}

function buildReviewNotesWithInternalItemName({
  internalItemName,
  reviewNotes,
}: {
  internalItemName: string | null;
  reviewNotes: string | null;
}) {
  const cleanInternalItemName = cleanText(internalItemName);
  const cleanReviewNotes = getReviewNotesWithoutInternalItemName(reviewNotes);
  const notes = [
    cleanInternalItemName
      ? `${INTERNAL_ITEM_NAME_PREFIX} ${cleanInternalItemName}`
      : null,
    cleanReviewNotes,
  ].filter((note): note is string => Boolean(note));

  return notes.length > 0 ? notes.join("\n") : null;
}

function normaliseAliasValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normaliseCompactAliasValue(value: string) {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}

function sourceValue(
  corrected: string | number | null,
  normalised: string | number | null,
  source: string | number | null,
) {
  return corrected ?? normalised ?? source ?? null;
}

function numericSourceValue(
  corrected: number | null,
  normalised: number | null,
  source: number | null,
) {
  return corrected ?? normalised ?? source ?? null;
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

function validateCammarotoCommit(
  document: PurchaseDocumentRow,
  lines: PurchaseDocumentLine[],
) {
  const errors: string[] = [];
  const stockLine = lines.find(
    (line) =>
      line.line_number === 1 ||
      line.source_item_code === "T/F-DCE M-VA" ||
      line.classification === "ingredient",
  );
  const informationalLine = lines.find(
    (line) =>
      line.line_number === 2 ||
      line.source_item_code === "CTNS" ||
      line.classification === "informational",
  );
  const internalItemName = stockLine
    ? getReviewedInternalItemName(stockLine)
    : null;

  if (["duplicate", "rejected", "failed"].includes(document.status)) {
    errors.push("Duplicate, rejected or failed documents cannot be committed.");
  }

  if (!document.invoice_number) {
    errors.push("Invoice number is required.");
  }

  if (!document.invoice_date) {
    errors.push("Invoice date is required.");
  }

  if (document.invoice_total === null) {
    errors.push("Invoice total is required.");
  }

  if (!document.supplier_trading_name_source) {
    errors.push("Supplier trading/display name is required.");
  }

  if (!document.supplier_legal_name_source) {
    errors.push("Supplier legal/invoice name is required.");
  }

  if (!document.supplier_abn_source) {
    errors.push("Supplier ABN is required.");
  }

  if (!stockLine) {
    errors.push("The ingredient line is required for the Cammaroto commit.");
  } else {
    if (stockLine.classification !== "ingredient") {
      errors.push("Line 1 must be classified as ingredient.");
    }

    if (!sourceValue(stockLine.corrected_item_code, stockLine.normalised_item_code, stockLine.source_item_code)) {
      errors.push("Line 1 item code is required.");
    }

    if (!sourceValue(stockLine.corrected_description, stockLine.normalised_description, stockLine.source_description)) {
      errors.push("Line 1 description is required.");
    }

    if (numericSourceValue(stockLine.corrected_quantity, stockLine.normalised_quantity, stockLine.source_quantity) === null) {
      errors.push("Line 1 quantity is required.");
    }

    if (!sourceValue(stockLine.corrected_unit, stockLine.normalised_unit, stockLine.source_unit)) {
      errors.push("Line 1 unit is required.");
    }

    if (numericSourceValue(stockLine.corrected_unit_price, stockLine.normalised_unit_price, stockLine.source_unit_price) === null) {
      errors.push("Line 1 unit price is required.");
    }

    if (
      stockLineClassifications.has(stockLine.classification) &&
      !internalItemName
    ) {
      errors.push("Internal item name is required for stock/catalogue lines.");
    }
  }

  if (informationalLine && informationalLine.classification !== "informational") {
    errors.push("Line 2 should be informational for the Cammaroto sample.");
  }

  return {
    errors,
    stockLine,
    informationalLine,
    internalItemName,
  };
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
  let signedUrl: string | null = null;
  let signedUrlError: string | null = null;

  if (document.storage_path) {
    const { data: signedUrlData, error: signedUrlCreateError } =
      await supabase.storage
        .from(PURCHASE_DOCUMENT_BUCKET)
        .createSignedUrl(document.storage_path, 60 * 10);

    if (signedUrlCreateError) {
      signedUrlError =
        "Could not create a secure source document link. Check the private storage bucket and policies.";
    } else {
      signedUrl = signedUrlData.signedUrl;
    }
  }

  return {
    document: attachSupplierDisplayNames([document], suppliersById)[0],
    lines: (lineData as PurchaseDocumentLine[] | null) ?? [],
    sourceFile: {
      signedUrl,
      error: signedUrlError,
    },
  };
}

export async function uploadPurchaseDocument(file: File) {
  const authContext = await requirePurchaseDocumentPermission(
    "purchase_documents.upload",
  );
  const supabase = await createClient();
  const organisationId = authContext.organisation.id;
  const originalFilename = sanitiseFilename(file.name);
  const mimeType = file.type;

  if (!file || file.size === 0) {
    throw new Error("Choose a PDF or image file before uploading.");
  }

  if (!isSupportedUploadMimeType(mimeType)) {
    throw new Error(
      `Unsupported file type. Accepted types: ${getSupportedUploadLabel()}.`,
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is too large. Maximum upload size is ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    );
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileHash = createHash("sha256").update(fileBuffer).digest("hex");
  const duplicate = await findDuplicatePurchaseDocument({
    organisationId,
    fileHash,
    originalFilename,
    fileSizeBytes: file.size,
  });

  if (duplicate) {
    return {
      documentId: duplicate.id,
      duplicate: true,
      message: "This document appears to have already been uploaded.",
    };
  }

  const documentId = randomUUID();
  const storagePath = `${organisationId}/purchase-documents/${documentId}/${originalFilename}`;
  logUploadDebug("attempt", {
    organisationId,
    storagePath,
    mimeType,
    fileSize: file.size,
  });
  const { error: uploadError } = await supabase.storage
    .from(PURCHASE_DOCUMENT_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    logUploadDebug("storage_error", {
      organisationId,
      storagePath,
      mimeType,
      fileSize: file.size,
      error: uploadError,
    });

    throw new Error(getStorageUploadErrorMessage(uploadError));
  }

  const { error: insertError } = await supabase.from("purchase_documents").insert({
    id: documentId,
    organisation_id: organisationId,
    document_type: "invoice",
    status: "uploaded",
    original_filename: originalFilename,
    storage_path: storagePath,
    file_hash: fileHash,
    mime_type: mimeType,
    file_size_bytes: file.size,
    uploaded_by_profile_id: authContext.profile.id,
  });

  if (insertError) {
    logUploadDebug("insert_error", {
      organisationId,
      storagePath,
      mimeType,
      fileSize: file.size,
      error: insertError,
    });

    throw new Error(
      "The file uploaded, but the purchase document record could not be created. Ask an admin to review storage for an orphaned upload.",
    );
  }

  return {
    documentId,
    duplicate: false,
    message:
      "Document uploaded. Extraction is not connected yet, so review fields remain empty.",
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
        review_notes: buildReviewNotesWithInternalItemName({
          internalItemName: "Chicken Thigh",
          reviewNotes: "Suggested internal item can be edited before commit.",
        }),
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
    .select("id, status")
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

  if ((documentData as { status: string }).status === "committed") {
    return {
      documentId: input.documentId,
      saved: false,
      message: "Committed purchase documents cannot be edited.",
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
        review_notes: buildReviewNotesWithInternalItemName({
          internalItemName: line.internalItemName,
          reviewNotes: line.reviewNotes,
        }),
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

async function findOrCreateSupplier({
  organisationId,
  document,
}: {
  organisationId: string;
  document: PurchaseDocumentRow;
}) {
  const supabase = await createClient();
  const displayName = document.supplier_trading_name_source ?? "Cammaroto Poultry";
  const legalName =
    document.supplier_legal_name_source ?? "Surefire Solutions Group Unit Trust";
  const abn = document.supplier_abn_source ?? "84 870 751 768";
  const aliasValues = [
    normaliseAliasValue(displayName),
    normaliseAliasValue(legalName),
    normaliseCompactAliasValue(abn),
  ];

  const { data: aliasData, error: aliasError } = await supabase
    .from("supplier_aliases")
    .select("id, supplier_id")
    .eq("organisation_id", organisationId)
    .eq("is_active", true)
    .in("normalised_alias_value", aliasValues);

  if (aliasError) {
    throw new Error("Could not check existing supplier aliases.");
  }

  const matchedAlias = (aliasData as SupplierAliasRow[] | null)?.[0];

  if (matchedAlias) {
    const { data: supplierData, error: supplierError } = await supabase
      .from("suppliers")
      .select("id, display_name, legal_name, abn")
      .eq("organisation_id", organisationId)
      .eq("id", matchedAlias.supplier_id)
      .maybeSingle();

    if (supplierError) {
      throw new Error("Could not load supplier matched by alias.");
    }

    if (supplierData) {
      return supplierData as SupplierRow;
    }
  }

  const { data: displayMatch, error: displayMatchError } = await supabase
    .from("suppliers")
    .select("id, display_name, legal_name, abn")
    .eq("organisation_id", organisationId)
    .ilike("display_name", displayName)
    .is("archived_at", null)
    .maybeSingle();

  if (displayMatchError) {
    throw new Error("Could not check existing supplier.");
  }

  if (displayMatch) {
    return displayMatch as SupplierRow;
  }

  const { data: insertedSupplier, error: insertSupplierError } = await supabase
    .from("suppliers")
    .insert({
      organisation_id: organisationId,
      display_name: displayName,
      legal_name: legalName,
      abn,
      supplier_type: "food_supplier",
      status: "active",
      notes: `Created from purchase document ${document.invoice_number ?? document.id}.`,
    })
    .select("id, display_name, legal_name, abn")
    .single();

  if (insertSupplierError || !insertedSupplier) {
    throw new Error("Could not create supplier.");
  }

  return insertedSupplier as SupplierRow;
}

async function ensureSupplierAlias({
  organisationId,
  supplierId,
  aliasType,
  aliasValue,
  normalisedAliasValue,
  sourceDocumentId,
}: {
  organisationId: string;
  supplierId: string;
  aliasType: string;
  aliasValue: string;
  normalisedAliasValue: string;
  sourceDocumentId: string;
}) {
  const supabase = await createClient();
  const { data: existingAlias, error: aliasLookupError } = await supabase
    .from("supplier_aliases")
    .select("id, supplier_id")
    .eq("organisation_id", organisationId)
    .eq("supplier_id", supplierId)
    .eq("alias_type", aliasType)
    .eq("normalised_alias_value", normalisedAliasValue)
    .eq("is_active", true)
    .maybeSingle();

  if (aliasLookupError) {
    throw new Error("Could not check supplier alias.");
  }

  if (existingAlias) {
    return existingAlias as SupplierAliasRow;
  }

  const { data: insertedAlias, error: insertAliasError } = await supabase
    .from("supplier_aliases")
    .insert({
      organisation_id: organisationId,
      supplier_id: supplierId,
      alias_type: aliasType,
      alias_value: aliasValue,
      normalised_alias_value: normalisedAliasValue,
      source_document_id: sourceDocumentId,
      is_active: true,
    })
    .select("id, supplier_id")
    .single();

  if (insertAliasError || !insertedAlias) {
    throw new Error("Could not create supplier alias.");
  }

  return insertedAlias as SupplierAliasRow;
}

async function ensureSupplierAliases({
  organisationId,
  supplierId,
  document,
}: {
  organisationId: string;
  supplierId: string;
  document: PurchaseDocumentRow;
}) {
  const legalName =
    document.supplier_legal_name_source ?? "Surefire Solutions Group Unit Trust";
  const tradingName = document.supplier_trading_name_source ?? "Cammaroto Poultry";
  const abn = document.supplier_abn_source ?? "84 870 751 768";
  const accountNumber = document.supplier_account_number_source ?? "555";
  const aliasInputs = [
    {
      aliasType: "legal_name",
      aliasValue: legalName,
      normalisedAliasValue: normaliseAliasValue(legalName),
    },
    {
      aliasType: "trading_name",
      aliasValue: tradingName,
      normalisedAliasValue: normaliseAliasValue(tradingName),
    },
    {
      aliasType: "invoice_name",
      aliasValue: legalName,
      normalisedAliasValue: normaliseAliasValue(legalName),
    },
    {
      aliasType: "abn",
      aliasValue: abn,
      normalisedAliasValue: normaliseCompactAliasValue(abn),
    },
    {
      aliasType: "account_number",
      aliasValue: accountNumber,
      normalisedAliasValue: normaliseCompactAliasValue(accountNumber),
    },
  ];

  for (const aliasInput of aliasInputs) {
    await ensureSupplierAlias({
      organisationId,
      supplierId,
      aliasType: aliasInput.aliasType,
      aliasValue: aliasInput.aliasValue,
      normalisedAliasValue: aliasInput.normalisedAliasValue,
      sourceDocumentId: document.id,
    });
  }

  return aliasInputs.map((aliasInput) => aliasInput.aliasValue);
}

async function findOrCreateSupplierItem({
  organisationId,
  supplierId,
  line,
}: {
  organisationId: string;
  supplierId: string;
  line: PurchaseDocumentLine;
}) {
  const supabase = await createClient();
  const supplierItemCode = String(
    sourceValue(
      line.corrected_item_code,
      line.normalised_item_code,
      line.source_item_code,
    ),
  );
  const supplierDescription = String(
    line.source_description ??
      sourceValue(
        line.corrected_description,
        line.normalised_description,
        line.source_description,
      ),
  );
  const normalisedDescription = String(
    sourceValue(
      line.corrected_description,
      line.normalised_description,
      line.source_description,
    ),
  );
  const purchaseUnit = String(
    sourceValue(line.corrected_unit, line.normalised_unit, line.source_unit),
  );

  const { data: existingItem, error: itemLookupError } = await supabase
    .from("supplier_items")
    .select("id, supplier_description, normalised_supplier_description")
    .eq("organisation_id", organisationId)
    .eq("supplier_id", supplierId)
    .eq("supplier_item_code", supplierItemCode)
    .is("archived_at", null)
    .maybeSingle();

  if (itemLookupError) {
    throw new Error("Could not check supplier item.");
  }

  if (existingItem) {
    const supplierItem = existingItem as SupplierItemRow;

    if (!supplierItem.normalised_supplier_description) {
      await supabase
        .from("supplier_items")
        .update({
          normalised_supplier_description: normalisedDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("organisation_id", organisationId)
        .eq("id", supplierItem.id);
    }

    return supplierItem;
  }

  const { data: insertedItem, error: insertItemError } = await supabase
    .from("supplier_items")
    .insert({
      organisation_id: organisationId,
      supplier_id: supplierId,
      supplier_item_code: supplierItemCode,
      supplier_description: supplierDescription,
      normalised_supplier_description: normalisedDescription,
      purchase_unit: purchaseUnit,
      base_unit: purchaseUnit,
      status: "active",
      created_from_document_id: line.purchase_document_id,
      created_from_line_id: line.id,
    })
    .select("id, supplier_description, normalised_supplier_description")
    .single();

  if (insertItemError || !insertedItem) {
    throw new Error("Could not create supplier item.");
  }

  return insertedItem as SupplierItemRow;
}

async function findOrCreateInternalItem({
  organisationId,
  documentId,
  internalItemName,
}: {
  organisationId: string;
  documentId: string;
  internalItemName: string;
}) {
  const supabase = await createClient();
  const { data: existingItem, error: itemLookupError } = await supabase
    .from("internal_items")
    .select("id, display_name")
    .eq("organisation_id", organisationId)
    .eq("item_type", "ingredient")
    .ilike("display_name", internalItemName)
    .is("archived_at", null)
    .maybeSingle();

  if (itemLookupError) {
    throw new Error("Could not check internal item.");
  }

  if (existingItem) {
    return existingItem as InternalItemRow;
  }

  const { data: insertedItem, error: insertItemError } = await supabase
    .from("internal_items")
    .insert({
      organisation_id: organisationId,
      item_type: "ingredient",
      display_name: internalItemName,
      base_unit: "KG",
      status: "active",
      notes: `Created/mapped from Cammaroto sample purchase document ${documentId}.`,
    })
    .select("id, display_name")
    .single();

  if (insertItemError || !insertedItem) {
    throw new Error("Could not create internal item.");
  }

  return insertedItem as InternalItemRow;
}

async function findOrCreateSupplierItemMapping({
  organisationId,
  supplierItemId,
  internalItemId,
  line,
  profileId,
}: {
  organisationId: string;
  supplierItemId: string;
  internalItemId: string;
  line: PurchaseDocumentLine;
  profileId: string;
}) {
  const supabase = await createClient();
  const { data: existingMapping, error: mappingLookupError } = await supabase
    .from("supplier_item_mappings")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("supplier_item_id", supplierItemId)
    .eq("mapping_status", "confirmed")
    .is("archived_at", null)
    .maybeSingle();

  if (mappingLookupError) {
    throw new Error("Could not check supplier item mapping.");
  }

  if (existingMapping) {
    return existingMapping as SupplierItemMappingRow;
  }

  const { data: insertedMapping, error: insertMappingError } = await supabase
    .from("supplier_item_mappings")
    .insert({
      organisation_id: organisationId,
      supplier_item_id: supplierItemId,
      internal_item_id: internalItemId,
      mapping_status: "confirmed",
      created_from_document_id: line.purchase_document_id,
      created_from_line_id: line.id,
      confirmed_by_profile_id: profileId,
      confirmed_at: new Date().toISOString(),
      notes: "Confirmed from Cammaroto sample purchase document.",
    })
    .select("id")
    .single();

  if (insertMappingError || !insertedMapping) {
    throw new Error("Could not create supplier item mapping.");
  }

  return insertedMapping as SupplierItemMappingRow;
}

async function findOrCreatePriceObservation({
  organisationId,
  supplierId,
  supplierItemId,
  internalItemId,
  document,
  line,
  profileId,
}: {
  organisationId: string;
  supplierId: string;
  supplierItemId: string;
  internalItemId: string;
  document: PurchaseDocumentRow;
  line: PurchaseDocumentLine;
  profileId: string;
}) {
  const supabase = await createClient();
  const { data: existingObservation, error: observationLookupError } =
    await supabase
      .from("price_observations")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("purchase_document_id", document.id)
      .eq("purchase_document_line_id", line.id)
      .eq("supplier_item_id", supplierItemId)
      .maybeSingle();

  if (observationLookupError) {
    throw new Error("Could not check price observation.");
  }

  if (existingObservation) {
    return existingObservation as PriceObservationRow;
  }

  const { data: insertedObservation, error: insertObservationError } =
    await supabase
      .from("price_observations")
      .insert({
        organisation_id: organisationId,
        supplier_id: supplierId,
        supplier_item_id: supplierItemId,
        internal_item_id: internalItemId,
        purchase_document_id: document.id,
        purchase_document_line_id: line.id,
        observed_date: document.invoice_date,
        unit_price: numericSourceValue(
          line.corrected_unit_price,
          line.normalised_unit_price,
          line.source_unit_price,
        ),
        purchase_unit: sourceValue(
          line.corrected_unit,
          line.normalised_unit,
          line.source_unit,
        ),
        quantity: numericSourceValue(
          line.corrected_quantity,
          line.normalised_quantity,
          line.source_quantity,
        ),
        line_total: numericSourceValue(
          line.corrected_line_total,
          line.normalised_line_total,
          line.source_line_total,
        ),
        tax_amount: numericSourceValue(
          line.corrected_tax,
          line.normalised_tax,
          line.source_tax,
        ),
        currency: document.currency,
        base_unit: sourceValue(
          line.corrected_unit,
          line.normalised_unit,
          line.source_unit,
        ),
        base_unit_price: numericSourceValue(
          line.corrected_unit_price,
          line.normalised_unit_price,
          line.source_unit_price,
        ),
        observation_type: "invoice",
        approval_decision: "update_current_price",
        reviewed_by_profile_id: profileId,
        reviewed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

  if (insertObservationError || !insertedObservation) {
    throw new Error("Could not create price observation.");
  }

  return insertedObservation as PriceObservationRow;
}

async function ensureApprovedSupplierPrice({
  organisationId,
  supplierItemId,
  internalItemId,
  document,
  line,
  sourcePriceObservationId,
  profileId,
}: {
  organisationId: string;
  supplierItemId: string;
  internalItemId: string;
  document: PurchaseDocumentRow;
  line: PurchaseDocumentLine;
  sourcePriceObservationId: string;
  profileId: string;
}) {
  const supabase = await createClient();
  const unitPrice = numericSourceValue(
    line.corrected_unit_price,
    line.normalised_unit_price,
    line.source_unit_price,
  );
  const purchaseUnit = String(
    sourceValue(line.corrected_unit, line.normalised_unit, line.source_unit),
  );

  const { data: currentPrice, error: currentPriceError } = await supabase
    .from("approved_supplier_prices")
    .select("id, unit_price, effective_date, source_price_observation_id")
    .eq("organisation_id", organisationId)
    .eq("supplier_item_id", supplierItemId)
    .eq("status", "current")
    .maybeSingle();

  if (currentPriceError) {
    throw new Error("Could not check approved supplier price.");
  }

  if (currentPrice) {
    const price = currentPrice as ApprovedSupplierPriceRow;
    const isSamePrice =
      Number(price.unit_price) === Number(unitPrice) &&
      price.effective_date === document.invoice_date;

    if (isSamePrice) {
      if (price.source_price_observation_id !== sourcePriceObservationId) {
        await supabase
          .from("approved_supplier_prices")
          .update({
            source_price_observation_id: sourcePriceObservationId,
            approved_by_profile_id: profileId,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("organisation_id", organisationId)
          .eq("id", price.id);
      }

      return price;
    }

    await supabase
      .from("approved_supplier_prices")
      .update({
        status: "superseded",
        updated_at: new Date().toISOString(),
      })
      .eq("organisation_id", organisationId)
      .eq("id", price.id);
  }

  const { data: insertedPrice, error: insertPriceError } = await supabase
    .from("approved_supplier_prices")
    .insert({
      organisation_id: organisationId,
      supplier_item_id: supplierItemId,
      internal_item_id: internalItemId,
      effective_date: document.invoice_date,
      unit_price: unitPrice,
      purchase_unit: purchaseUnit,
      base_unit_price: unitPrice,
      currency: document.currency,
      source_price_observation_id: sourcePriceObservationId,
      approved_by_profile_id: profileId,
      approved_at: new Date().toISOString(),
      status: "current",
    })
    .select("id, unit_price, effective_date, source_price_observation_id")
    .single();

  if (insertPriceError || !insertedPrice) {
    throw new Error("Could not create approved supplier price.");
  }

  return insertedPrice as ApprovedSupplierPriceRow;
}

async function findOrCreateIgnoredLineRule({
  organisationId,
  supplierId,
  document,
  line,
  profileId,
}: {
  organisationId: string;
  supplierId: string;
  document: PurchaseDocumentRow;
  line: PurchaseDocumentLine;
  profileId: string;
}) {
  const supabase = await createClient();
  const supplierItemCode = String(line.source_item_code ?? "CTNS");
  const descriptionPattern = String(line.source_description ?? "CARTONS");

  const { data: existingRule, error: ruleLookupError } = await supabase
    .from("ignored_line_rules")
    .select("id")
    .eq("organisation_id", organisationId)
    .eq("supplier_id", supplierId)
    .eq("match_type", "code_and_description")
    .eq("supplier_item_code", supplierItemCode)
    .eq("description_pattern", descriptionPattern)
    .maybeSingle();

  if (ruleLookupError) {
    throw new Error("Could not check ignored line rule.");
  }

  if (existingRule) {
    return existingRule as IgnoredLineRuleRow;
  }

  const { data: insertedRule, error: insertRuleError } = await supabase
    .from("ignored_line_rules")
    .insert({
      organisation_id: organisationId,
      supplier_id: supplierId,
      match_type: "code_and_description",
      supplier_item_code: supplierItemCode,
      description_pattern: descriptionPattern,
      classification: "informational",
      default_action: "show_as_informational",
      created_from_document_id: document.id,
      created_from_line_id: line.id,
      created_by_profile_id: profileId,
    })
    .select("id")
    .single();

  if (insertRuleError || !insertedRule) {
    throw new Error("Could not create ignored line rule.");
  }

  return insertedRule as IgnoredLineRuleRow;
}

export async function commitCammarotoPurchaseDocumentReview(
  documentId: string,
): Promise<CommitPurchaseDocumentResult> {
  const authContext = await requirePurchaseDocumentPermission(
    "purchase_documents.commit",
  );
  const supabase = await createClient();
  const organisationId = authContext.organisation.id;
  const profileId = authContext.profile.id;
  const review = await getPurchaseDocumentReview(documentId);

  if (!review) {
    return {
      documentId,
      status: "validation_failed",
      message: "Purchase document was not found or is not accessible.",
      errors: ["Purchase document was not found or is not accessible."],
    };
  }

  const { document, lines } = review;

  if (document.status === "committed") {
    const committedStockLine = lines.find(
      (line) =>
        line.line_number === 1 ||
        line.source_item_code === "T/F-DCE M-VA" ||
        line.classification === "ingredient",
    );
    const committedInternalItemName = committedStockLine
      ? getReviewedInternalItemName(committedStockLine) ?? "Reviewed internal item"
      : "Reviewed internal item";

    return {
      documentId,
      status: "already_committed",
      message: "Purchase document is already committed. No duplicate records were created.",
      summary: {
        supplier: document.supplier_display_name ?? "Cammaroto Poultry",
        supplierAliases: [
          "Surefire Solutions Group Unit Trust",
          "Cammaroto Poultry",
          "84 870 751 768",
          "555",
        ],
        supplierItem: "T/F-DCE M-VA",
        internalItem: committedInternalItemName,
        mapping: "Confirmed",
        priceObservation: "$13.70/KG",
        approvedSupplierPrice: "$13.70/KG current",
        informationalRule: "CTNS / CARTONS",
        stockMovements: "none",
      },
    };
  }

  const validation = validateCammarotoCommit(document, lines);

  if (validation.errors.length > 0 || !validation.stockLine) {
    return {
      documentId,
      status: "validation_failed",
      message: "Purchase document needs review before it can be committed.",
      errors: validation.errors,
    };
  }

  const committedAt = new Date().toISOString();
  const reviewedInternalItemName = validation.internalItemName;

  if (!reviewedInternalItemName) {
    return {
      documentId,
      status: "validation_failed",
      message: "Purchase document needs review before it can be committed.",
      errors: ["Internal item name is required for stock/catalogue lines."],
    };
  }

  const supplier = await findOrCreateSupplier({
    organisationId,
    document,
  });
  const supplierAliases = await ensureSupplierAliases({
    organisationId,
    supplierId: supplier.id,
    document,
  });
  const supplierItem = await findOrCreateSupplierItem({
    organisationId,
    supplierId: supplier.id,
    line: validation.stockLine,
  });
  const internalItem = await findOrCreateInternalItem({
    organisationId,
    documentId: document.id,
    internalItemName: reviewedInternalItemName,
  });
  const mapping = await findOrCreateSupplierItemMapping({
    organisationId,
    supplierItemId: supplierItem.id,
    internalItemId: internalItem.id,
    line: validation.stockLine,
    profileId,
  });
  const priceObservation = await findOrCreatePriceObservation({
    organisationId,
    supplierId: supplier.id,
    supplierItemId: supplierItem.id,
    internalItemId: internalItem.id,
    document,
    line: validation.stockLine,
    profileId,
  });
  await ensureApprovedSupplierPrice({
    organisationId,
    supplierItemId: supplierItem.id,
    internalItemId: internalItem.id,
    document,
    line: validation.stockLine,
    sourcePriceObservationId: priceObservation.id,
    profileId,
  });

  await supabase
    .from("purchase_document_lines")
    .update({
      supplier_item_id: supplierItem.id,
      internal_item_id: internalItem.id,
      mapping_id: mapping.id,
      status: "committed",
      updated_at: committedAt,
    })
    .eq("organisation_id", organisationId)
    .eq("purchase_document_id", document.id)
    .eq("id", validation.stockLine.id);

  if (validation.informationalLine) {
    await findOrCreateIgnoredLineRule({
      organisationId,
      supplierId: supplier.id,
      document,
      line: validation.informationalLine,
      profileId,
    });

    await supabase
      .from("purchase_document_lines")
      .update({
        classification: "informational",
        status: "ignored",
        updated_at: committedAt,
      })
      .eq("organisation_id", organisationId)
      .eq("purchase_document_id", document.id)
      .eq("id", validation.informationalLine.id);
  }

  const { error: documentUpdateError } = await supabase
    .from("purchase_documents")
    .update({
      supplier_id: supplier.id,
      status: "committed",
      reviewed_by_profile_id: document.reviewed_by_profile_id ?? profileId,
      reviewed_at: document.reviewed_at ?? committedAt,
      committed_by_profile_id: profileId,
      committed_at: committedAt,
      updated_at: committedAt,
    })
    .eq("organisation_id", organisationId)
    .eq("id", document.id);

  if (documentUpdateError) {
    throw new Error("Could not mark purchase document as committed.");
  }

  return {
    documentId,
    status: "committed",
    message: "Purchase document committed.",
    summary: {
      supplier: supplier.display_name,
      supplierAliases,
      supplierItem: "T/F-DCE M-VA",
      internalItem: internalItem.display_name,
      mapping: "Confirmed",
      priceObservation: "$13.70/KG",
      approvedSupplierPrice: "$13.70/KG current",
      informationalRule: "CTNS / CARTONS",
      stockMovements: "none",
    },
  };
}
