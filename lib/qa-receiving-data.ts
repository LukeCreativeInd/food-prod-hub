import { redirect } from "next/navigation";

import { getCurrentPermissionKeys, requireAppAccess } from "@/lib/auth";
import {
  QA_CHECK_INSTANCE_STATUSES,
  QA_PERMISSIONS,
  type QaCheckInstanceStatus,
  type QaResultType,
  type QaReviewDecision,
} from "@/lib/qa-schema-types";
import { createClient } from "@/lib/supabase/server";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export type ReceivingQaListFilters = {
  status?: string;
  outcome?: string;
  needsReview?: string;
  supplierId?: string;
  receiptId?: string;
};

export type ReceivingQaCheckListItem = {
  id: string;
  reference: string;
  receiptId: string | null;
  receiptReference: string;
  supplierName: string;
  lineContext: string;
  templateName: string;
  templateVersion: string;
  status: QaCheckInstanceStatus;
  statusLabel: string;
  statusTone: BadgeTone;
  outcome: string;
  outcomeTone: BadgeTone;
  requiresReview: boolean;
  startedAt: string;
  completedAt: string;
  completedBy: string;
  reviewStatus: string;
  createdAt: string;
};

export type ReceivingQaTemplateOption = {
  id: string;
  currentTemplateVersionId: string;
  name: string;
  description: string;
  versionLabel: string;
  instructions: string;
};

export type ReceivingQaReceiptOption = {
  id: string;
  receiptNumber: string;
  supplierName: string;
  supplierId: string | null;
  supplierReference: string;
  purchaseDocumentLabel: string;
  receivedAt: string;
  status: string;
  statusLabel: string;
  lineCount: number;
};

export type ReceivingQaReceiptLineOption = {
  id: string;
  internalItemId: string;
  stockLocationId: string;
  inventoryLotId: string | null;
  itemName: string;
  locationName: string;
  quantity: string;
  unit: string;
  lotNumber: string;
  expiryDate: string;
  qaStatus: string;
  lineStatus: string;
};

export type ReceivingQaStartData = {
  templates: ReceivingQaTemplateOption[];
  receipts: ReceivingQaReceiptOption[];
  selectedReceipt: ReceivingQaReceiptOption | null;
  selectedReceiptLines: ReceivingQaReceiptLineOption[];
  canCreate: boolean;
};

export type ReceivingQaTemplateSection = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  displayOrder: number;
  items: ReceivingQaTemplateItem[];
};

export type ReceivingQaTemplateItem = {
  id: string;
  sectionId: string | null;
  prompt: string;
  helpText: string;
  resultType: QaResultType;
  displayOrder: number;
  isRequired: boolean;
  allowNotApplicable: boolean;
  requiresCommentOnFail: boolean;
  triggersReview: boolean;
  recommendsHold: boolean;
  requiresApproval: boolean;
  warningMin: number | null;
  warningMax: number | null;
  criticalMin: number | null;
  criticalMax: number | null;
  unit: string;
  optionValues: string[];
};

export type ReceivingQaResult = {
  id: string;
  templateItemId: string;
  status: string;
  outcome: string;
  valueBoolean: boolean | null;
  valueNumber: string;
  valueText: string;
  valueDate: string;
  valueTime: string;
  valueTimestamp: string;
  comment: string;
  exceptionFlag: boolean;
  requiresReview: boolean;
  requiresHoldReview: boolean;
  recordedAt: string;
  recordedBy: string;
};

export type ReceivingQaReview = {
  id: string;
  decision: QaReviewDecision;
  decisionLabel: string;
  notes: string;
  reviewedAt: string;
  reviewer: string;
};

export type ReceivingQaDetail = {
  check: {
    id: string;
    reference: string;
    status: QaCheckInstanceStatus;
    statusLabel: string;
    statusTone: BadgeTone;
    overallOutcome: string;
    outcomeTone: BadgeTone;
    requiresReview: boolean;
    requiresApproval: boolean;
    sourceType: string;
    startedAt: string;
    completedAt: string;
    completedBy: string;
    notes: string;
    isEditable: boolean;
    canEdit: boolean;
    canReview: boolean;
  };
  receipt: {
    id: string;
    receiptNumber: string;
    supplierName: string;
    supplierReference: string;
    purchaseDocumentLabel: string;
    receivedAt: string;
    status: string;
  };
  line: ReceivingQaReceiptLineOption | null;
  template: {
    id: string;
    versionId: string;
    name: string;
    versionLabel: string;
    instructions: string;
  };
  sections: ReceivingQaTemplateSection[];
  results: ReceivingQaResult[];
  reviews: ReceivingQaReview[];
  formalHold: {
    id: string;
    status: string;
    reason: string;
    placedAt: string;
  } | null;
  holdRecommendation: {
    resultId: string | null;
    canPlace: boolean;
    reason: string;
  };
};

export type ReceivingQaListData = {
  checks: ReceivingQaCheckListItem[];
  filters: ReceivingQaListFilters;
  supplierOptions: Array<{ id: string; name: string }>;
  receiptOptions: Array<{ id: string; label: string }>;
  canCreate: boolean;
  canReview: boolean;
  summary: {
    total: number;
    inProgress: number;
    needsReview: number;
    completed: number;
  };
};

type QaAccess = {
  organisationId: string;
  profileId: string;
  permissionKeys: string[];
  canRead: boolean;
  canCreate: boolean;
  canComplete: boolean;
  canReview: boolean;
  canPlaceHold: boolean;
};

type CheckRow = {
  id: string;
  template_id: string;
  template_version_id: string;
  status: QaCheckInstanceStatus;
  source_type: string | null;
  inventory_receipt_id: string | null;
  inventory_receipt_line_id: string | null;
  supplier_id: string | null;
  internal_item_id: string | null;
  stock_location_id: string | null;
  inventory_lot_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  completed_by_profile_id: string | null;
  overall_outcome: string | null;
  requires_review: boolean;
  requires_approval: boolean;
  notes: string | null;
  created_at: string;
};

type QaHoldRow = {
  id: string;
  status: string;
  reason: string;
  placed_at: string | null;
};

type TemplateRow = {
  id: string;
  name: string;
  description: string | null;
  current_template_version_id: string | null;
};

type TemplateVersionRow = {
  id: string;
  template_id: string;
  version_number: number;
  instructions: string | null;
  status: string;
};

type TemplateSectionRow = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  display_order: number;
};

type TemplateItemRow = {
  id: string;
  section_id: string | null;
  prompt: string;
  help_text: string | null;
  result_type: QaResultType;
  display_order: number;
  is_required: boolean;
  allow_not_applicable: boolean;
  requires_comment_on_fail: boolean;
  triggers_review: boolean;
  recommends_hold: boolean;
  requires_approval: boolean;
  warning_min: number | null;
  warning_max: number | null;
  critical_min: number | null;
  critical_max: number | null;
  unit: string | null;
  option_values: unknown;
};

type ReceiptRow = {
  id: string;
  supplier_id: string | null;
  purchase_document_id: string | null;
  receipt_number: string | null;
  supplier_reference: string | null;
  received_at: string;
  status: string;
};

type ReceiptLineRow = {
  id: string;
  receipt_id: string;
  internal_item_id: string;
  stock_location_id: string;
  inventory_lot_id: string | null;
  received_quantity: number;
  received_unit: string;
  lot_number: string | null;
  expiry_date: string | null;
  qa_status: string;
  status: string;
};

type SupplierRow = {
  id: string;
  display_name: string;
};

type PurchaseDocumentRow = {
  id: string;
  invoice_number: string | null;
  original_filename: string;
};

type InternalItemRow = {
  id: string;
  display_name: string;
};

type LocationRow = {
  id: string;
  location_code: string;
  name: string;
};

type LotRow = {
  id: string;
  lot_number: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type ResultRow = {
  id: string;
  template_item_id: string;
  status: string;
  outcome: string | null;
  value_boolean: boolean | null;
  value_number: number | null;
  value_text: string | null;
  value_date: string | null;
  value_time: string | null;
  value_timestamp: string | null;
  comment: string | null;
  exception_flag: boolean;
  requires_review: boolean;
  requires_hold_review: boolean;
  recorded_at: string | null;
  recorded_by_profile_id: string | null;
};

type ReviewRow = {
  id: string;
  reviewer_profile_id: string | null;
  decision: QaReviewDecision;
  notes: string | null;
  reviewed_at: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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

function formatDateTimeInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Not recorded";
  }

  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 4,
  }).format(value);
}

function mapById<TRow extends { id: string }>(rows: TRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function hasAnyPermission(permissionKeys: string[], permissions: string[]) {
  return permissions.some((permission) => permissionKeys.includes(permission));
}

async function getQaAccess(): Promise<QaAccess> {
  const authContext = await requireAppAccess();
  const permissionKeys = await getCurrentPermissionKeys();
  const canRead = hasAnyPermission(permissionKeys, [
    QA_PERMISSIONS.view,
    QA_PERMISSIONS.checksView,
  ]);

  if (!canRead) {
    redirect("/no-access");
  }

  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
    permissionKeys,
    canRead,
    canCreate: permissionKeys.includes(QA_PERMISSIONS.checksCreate),
    canComplete: permissionKeys.includes(QA_PERMISSIONS.checksComplete),
    canReview: permissionKeys.includes(QA_PERMISSIONS.reviewsManage),
    canPlaceHold: permissionKeys.includes(QA_PERMISSIONS.holdsPlace),
  };
}

export async function getReceivingQaActionContext(requiredPermission: string) {
  const authContext = await requireAppAccess();
  const permissionKeys = await getCurrentPermissionKeys();

  if (!permissionKeys.includes(requiredPermission)) {
    redirect("/no-access");
  }

  if (!authContext.organisation || !authContext.profile) {
    throw new Error("Current organisation and profile are required.");
  }

  return {
    organisationId: authContext.organisation.id,
    profileId: authContext.profile.id,
    permissionKeys,
  };
}

function checkStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function checkStatusTone(status: string): BadgeTone {
  if (status === "completed" || status === "reviewed" || status === "approved") {
    return "success";
  }

  if (status === "needs_review" || status === "in_progress") {
    return "warning";
  }

  if (status === "cancelled") {
    return "neutral";
  }

  return "info";
}

export function outcomeTone(outcome: string | null | undefined): BadgeTone {
  if (outcome === "pass") {
    return "success";
  }

  if (outcome === "fail" || outcome === "needs_review") {
    return "danger";
  }

  if (outcome === "warning") {
    return "warning";
  }

  if (outcome === "not_applicable") {
    return "neutral";
  }

  return "info";
}

function decisionLabel(decision: string) {
  if (decision === "conditional_acceptance") {
    return "Conditional acceptance";
  }

  return checkStatusLabel(decision);
}

function getProfileLabel(profile: ProfileRow | undefined) {
  return profile?.full_name ?? profile?.email ?? "Not recorded";
}

function receiptLabel(receipt: ReceiptRow | undefined) {
  return receipt?.receipt_number ?? "Receipt";
}

function getPurchaseDocumentLabel(document: PurchaseDocumentRow | undefined) {
  if (!document) {
    return "Not linked";
  }

  return document.invoice_number ?? document.original_filename;
}

function optionValuesFromJson(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((option) => (typeof option === "string" ? option : null))
    .filter((option): option is string => Boolean(option));
}

function mapLineOption({
  line,
  item,
  location,
  lot,
}: {
  line: ReceiptLineRow;
  item: InternalItemRow | undefined;
  location: LocationRow | undefined;
  lot: LotRow | undefined;
}): ReceivingQaReceiptLineOption {
  return {
    id: line.id,
    internalItemId: line.internal_item_id,
    stockLocationId: line.stock_location_id,
    inventoryLotId: line.inventory_lot_id,
    itemName: item?.display_name ?? "Unknown item",
    locationName: location ? `${location.location_code} - ${location.name}` : "Unknown location",
    quantity: formatQuantity(line.received_quantity),
    unit: line.received_unit,
    lotNumber: line.lot_number ?? lot?.lot_number ?? "Not recorded",
    expiryDate: formatDate(line.expiry_date),
    qaStatus: checkStatusLabel(line.qa_status),
    lineStatus: checkStatusLabel(line.status),
  };
}

async function fetchReceiptContext(
  organisationId: string,
  receiptIds: string[],
  lineIds: string[] = [],
) {
  const supabase = await createClient();
  const uniqueReceiptIds = [...new Set(receiptIds.filter(Boolean))];
  const uniqueLineIds = [...new Set(lineIds.filter(Boolean))];

  const [receiptsResult, linesResult] = await Promise.all([
    uniqueReceiptIds.length > 0
      ? supabase
          .from("inventory_receipts")
          .select(
            "id, supplier_id, purchase_document_id, receipt_number, supplier_reference, received_at, status",
          )
          .eq("organisation_id", organisationId)
          .in("id", uniqueReceiptIds)
      : Promise.resolve({ data: [], error: null }),
    uniqueLineIds.length > 0
      ? supabase
          .from("inventory_receipt_lines")
          .select(
            "id, receipt_id, internal_item_id, stock_location_id, inventory_lot_id, received_quantity, received_unit, lot_number, expiry_date, qa_status, status",
          )
          .eq("organisation_id", organisationId)
          .in("id", uniqueLineIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (receiptsResult.error || linesResult.error) {
    throw new Error("Could not load Receiving QA source context.");
  }

  const receipts = (receiptsResult.data ?? []) as ReceiptRow[];
  const lines = (linesResult.data ?? []) as ReceiptLineRow[];
  const supplierIds = [...new Set(receipts.map((receipt) => receipt.supplier_id).filter(Boolean))];
  const documentIds = [
    ...new Set(receipts.map((receipt) => receipt.purchase_document_id).filter(Boolean)),
  ];
  const itemIds = [...new Set(lines.map((line) => line.internal_item_id).filter(Boolean))];
  const locationIds = [...new Set(lines.map((line) => line.stock_location_id).filter(Boolean))];
  const lotIds = [...new Set(lines.map((line) => line.inventory_lot_id).filter(Boolean))];

  const [suppliersResult, documentsResult, itemsResult, locationsResult, lotsResult] =
    await Promise.all([
      supplierIds.length > 0
        ? supabase
            .from("suppliers")
            .select("id, display_name")
            .eq("organisation_id", organisationId)
            .in("id", supplierIds)
        : Promise.resolve({ data: [], error: null }),
      documentIds.length > 0
        ? supabase
            .from("purchase_documents")
            .select("id, invoice_number, original_filename")
            .eq("organisation_id", organisationId)
            .in("id", documentIds)
        : Promise.resolve({ data: [], error: null }),
      itemIds.length > 0
        ? supabase
            .from("internal_items")
            .select("id, display_name")
            .eq("organisation_id", organisationId)
            .in("id", itemIds)
        : Promise.resolve({ data: [], error: null }),
      locationIds.length > 0
        ? supabase
            .from("inventory_locations")
            .select("id, location_code, name")
            .eq("organisation_id", organisationId)
            .in("id", locationIds)
        : Promise.resolve({ data: [], error: null }),
      lotIds.length > 0
        ? supabase
            .from("inventory_lots")
            .select("id, lot_number")
            .eq("organisation_id", organisationId)
            .in("id", lotIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (
    suppliersResult.error ||
    documentsResult.error ||
    itemsResult.error ||
    locationsResult.error ||
    lotsResult.error
  ) {
    throw new Error("Could not load Receiving QA related records.");
  }

  return {
    receiptMap: mapById(receipts),
    lineMap: mapById(lines),
    supplierMap: mapById((suppliersResult.data ?? []) as SupplierRow[]),
    documentMap: mapById((documentsResult.data ?? []) as PurchaseDocumentRow[]),
    itemMap: mapById((itemsResult.data ?? []) as InternalItemRow[]),
    locationMap: mapById((locationsResult.data ?? []) as LocationRow[]),
    lotMap: mapById((lotsResult.data ?? []) as LotRow[]),
  };
}

export async function fetchReceivingQaChecks(
  filters: ReceivingQaListFilters,
): Promise<ReceivingQaListData> {
  const access = await getQaAccess();
  const supabase = await createClient();
  let query = supabase
    .from("qa_check_instances")
    .select(
      "id, template_id, template_version_id, status, source_type, inventory_receipt_id, inventory_receipt_line_id, supplier_id, internal_item_id, stock_location_id, inventory_lot_id, started_at, completed_at, completed_by_profile_id, overall_outcome, requires_review, requires_approval, notes, created_at",
    )
    .eq("organisation_id", access.organisationId)
    .eq("category", "receiving")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (filters.status && QA_CHECK_INSTANCE_STATUSES.includes(filters.status as QaCheckInstanceStatus)) {
    query = query.eq("status", filters.status);
  }

  if (filters.outcome) {
    query = query.eq("overall_outcome", filters.outcome);
  }

  if (filters.needsReview === "yes") {
    query = query.eq("requires_review", true);
  }

  if (filters.supplierId) {
    query = query.eq("supplier_id", filters.supplierId);
  }

  if (filters.receiptId) {
    query = query.eq("inventory_receipt_id", filters.receiptId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Could not load Receiving QA checks.");
  }

  const checks = (data ?? []) as CheckRow[];
  const templateIds = [...new Set(checks.map((check) => check.template_id))];
  const versionIds = [...new Set(checks.map((check) => check.template_version_id))];
  const receiptIds = [
    ...new Set(
      checks
        .map((check) => check.inventory_receipt_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const lineIds = [
    ...new Set(
      checks
        .map((check) => check.inventory_receipt_line_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const profileIds = [
    ...new Set(checks.map((check) => check.completed_by_profile_id).filter(Boolean)),
  ];

  const [templatesResult, versionsResult, profileResult, reviewsResult, receiptContext] =
    await Promise.all([
      templateIds.length > 0
        ? supabase
            .from("qa_templates")
            .select("id, name, description, current_template_version_id")
            .eq("organisation_id", access.organisationId)
            .in("id", templateIds)
        : Promise.resolve({ data: [], error: null }),
      versionIds.length > 0
        ? supabase
            .from("qa_template_versions")
            .select("id, template_id, version_number, instructions, status")
            .eq("organisation_id", access.organisationId)
            .in("id", versionIds)
        : Promise.resolve({ data: [], error: null }),
      profileIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", profileIds)
        : Promise.resolve({ data: [], error: null }),
      checks.length > 0
        ? supabase
            .from("qa_reviews")
            .select("id, check_instance_id, decision, reviewed_at")
            .eq("organisation_id", access.organisationId)
            .in("check_instance_id", checks.map((check) => check.id))
            .is("archived_at", null)
            .order("reviewed_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      fetchReceiptContext(access.organisationId, receiptIds, lineIds),
    ]);

  if (
    templatesResult.error ||
    versionsResult.error ||
    profileResult.error ||
    reviewsResult.error
  ) {
    throw new Error("Could not load Receiving QA summary records.");
  }

  const templateMap = mapById((templatesResult.data ?? []) as TemplateRow[]);
  const versionMap = mapById((versionsResult.data ?? []) as TemplateVersionRow[]);
  const profileMap = mapById((profileResult.data ?? []) as ProfileRow[]);
  const reviewMap = new Map<string, ReviewRow>();

  ((reviewsResult.data ?? []) as Array<ReviewRow & { check_instance_id: string }>).forEach(
    (review) => {
      if (!reviewMap.has(review.check_instance_id)) {
        reviewMap.set(review.check_instance_id, review);
      }
    },
  );

  const mappedChecks = checks.map((check) => {
    const receipt = check.inventory_receipt_id
      ? receiptContext.receiptMap.get(check.inventory_receipt_id)
      : undefined;
    const line = check.inventory_receipt_line_id
      ? receiptContext.lineMap.get(check.inventory_receipt_line_id)
      : undefined;
    const supplier = check.supplier_id
      ? receiptContext.supplierMap.get(check.supplier_id)
      : undefined;
    const item = line ? receiptContext.itemMap.get(line.internal_item_id) : undefined;
    const template = templateMap.get(check.template_id);
    const version = versionMap.get(check.template_version_id);
    const review = reviewMap.get(check.id);

    return {
      id: check.id,
      reference: `QA-${check.id.slice(0, 8)}`,
      receiptId: check.inventory_receipt_id,
      receiptReference: receiptLabel(receipt),
      supplierName: supplier?.display_name ?? "Unknown supplier",
      lineContext: line ? item?.display_name ?? "Receipt line" : "Whole receipt",
      templateName: template?.name ?? "Unknown template",
      templateVersion: version ? `v${version.version_number}` : "Unknown version",
      status: check.status,
      statusLabel: checkStatusLabel(check.status),
      statusTone: checkStatusTone(check.status),
      outcome: check.overall_outcome ? checkStatusLabel(check.overall_outcome) : "Pending",
      outcomeTone: outcomeTone(check.overall_outcome),
      requiresReview: check.requires_review,
      startedAt: formatDateTime(check.started_at),
      completedAt: formatDateTime(check.completed_at),
      completedBy: getProfileLabel(
        check.completed_by_profile_id ? profileMap.get(check.completed_by_profile_id) : undefined,
      ),
      reviewStatus: review ? decisionLabel(review.decision) : "Not reviewed",
      createdAt: formatDateTime(check.created_at),
    };
  });

  const supplierOptions = [...receiptContext.supplierMap.values()]
    .map((supplier) => ({ id: supplier.id, name: supplier.display_name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const receiptOptions = [...receiptContext.receiptMap.values()]
    .map((receipt) => ({ id: receipt.id, label: receiptLabel(receipt) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    checks: mappedChecks,
    filters,
    supplierOptions,
    receiptOptions,
    canCreate: access.canCreate,
    canReview: access.canReview,
    summary: {
      total: mappedChecks.length,
      inProgress: mappedChecks.filter((check) =>
        ["draft", "in_progress"].includes(check.status),
      ).length,
      needsReview: mappedChecks.filter((check) => check.status === "needs_review").length,
      completed: mappedChecks.filter((check) =>
        ["completed", "reviewed", "approved"].includes(check.status),
      ).length,
    },
  };
}

export async function fetchReceivingQaStartData(
  selectedReceiptId?: string,
): Promise<ReceivingQaStartData> {
  const access = await getQaAccess();
  const supabase = await createClient();

  const [templatesResult, receiptsResult] = await Promise.all([
    supabase
      .from("qa_templates")
      .select("id, name, description, current_template_version_id")
      .eq("organisation_id", access.organisationId)
      .eq("category", "receiving")
      .eq("status", "active")
      .is("archived_at", null)
      .not("current_template_version_id", "is", null)
      .order("name", { ascending: true }),
    supabase
      .from("inventory_receipts")
      .select(
        "id, supplier_id, purchase_document_id, receipt_number, supplier_reference, received_at, status",
      )
      .eq("organisation_id", access.organisationId)
      .in("status", ["draft", "posted"])
      .is("archived_at", null)
      .order("received_at", { ascending: false })
      .limit(100),
  ]);

  if (templatesResult.error || receiptsResult.error) {
    throw new Error("Could not load Receiving QA start data.");
  }

  const templates = (templatesResult.data ?? []) as TemplateRow[];
  const receipts = (receiptsResult.data ?? []) as ReceiptRow[];
  const versionIds = templates
    .map((template) => template.current_template_version_id)
    .filter(Boolean);
  const receiptIds = receipts.map((receipt) => receipt.id);
  const supplierIds = [...new Set(receipts.map((receipt) => receipt.supplier_id).filter(Boolean))];
  const documentIds = [
    ...new Set(receipts.map((receipt) => receipt.purchase_document_id).filter(Boolean)),
  ];

  const [versionsResult, linesResult, suppliersResult, documentsResult] = await Promise.all([
    versionIds.length > 0
      ? supabase
          .from("qa_template_versions")
          .select("id, template_id, version_number, instructions, status")
          .eq("organisation_id", access.organisationId)
          .in("id", versionIds)
          .eq("status", "published")
          .is("archived_at", null)
      : Promise.resolve({ data: [], error: null }),
    receiptIds.length > 0
      ? supabase
          .from("inventory_receipt_lines")
          .select(
            "id, receipt_id, internal_item_id, stock_location_id, inventory_lot_id, received_quantity, received_unit, lot_number, expiry_date, qa_status, status",
          )
          .eq("organisation_id", access.organisationId)
          .in("receipt_id", receiptIds)
          .not("status", "in", "(cancelled,archived)")
      : Promise.resolve({ data: [], error: null }),
    supplierIds.length > 0
      ? supabase
          .from("suppliers")
          .select("id, display_name")
          .eq("organisation_id", access.organisationId)
          .in("id", supplierIds)
      : Promise.resolve({ data: [], error: null }),
    documentIds.length > 0
      ? supabase
          .from("purchase_documents")
          .select("id, invoice_number, original_filename")
          .eq("organisation_id", access.organisationId)
          .in("id", documentIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (
    versionsResult.error ||
    linesResult.error ||
    suppliersResult.error ||
    documentsResult.error
  ) {
    throw new Error("Could not load Receiving QA source options.");
  }

  const lines = (linesResult.data ?? []) as ReceiptLineRow[];
  const selectedLines = selectedReceiptId
    ? lines.filter((line) => line.receipt_id === selectedReceiptId)
    : [];
  const lineContext = await fetchReceiptContext(
    access.organisationId,
    selectedReceiptId ? [selectedReceiptId] : [],
    selectedLines.map((line) => line.id),
  );
  const supplierMap = mapById((suppliersResult.data ?? []) as SupplierRow[]);
  const documentMap = mapById((documentsResult.data ?? []) as PurchaseDocumentRow[]);
  const versionMap = mapById((versionsResult.data ?? []) as TemplateVersionRow[]);
  const lineCounts = new Map<string, number>();

  lines.forEach((line) => {
    lineCounts.set(line.receipt_id, (lineCounts.get(line.receipt_id) ?? 0) + 1);
  });

  const receiptOptions = receipts.map((receipt) => ({
    id: receipt.id,
    receiptNumber: receiptLabel(receipt),
    supplierName: receipt.supplier_id
      ? supplierMap.get(receipt.supplier_id)?.display_name ?? "Unknown supplier"
      : "No supplier selected",
    supplierId: receipt.supplier_id,
    supplierReference: receipt.supplier_reference ?? "Not recorded",
    purchaseDocumentLabel: getPurchaseDocumentLabel(
      receipt.purchase_document_id ? documentMap.get(receipt.purchase_document_id) : undefined,
    ),
    receivedAt: formatDateTime(receipt.received_at),
    status: receipt.status,
    statusLabel: checkStatusLabel(receipt.status),
    lineCount: lineCounts.get(receipt.id) ?? 0,
  }));

  return {
    templates: templates
      .map((template) => {
        const versionId = template.current_template_version_id;
        const version = versionId ? versionMap.get(versionId) : undefined;

        if (!versionId || !version) {
          return null;
        }

        return {
          id: template.id,
          currentTemplateVersionId: versionId,
          name: template.name,
          description: template.description ?? "No description recorded",
          versionLabel: `v${version.version_number}`,
          instructions: version.instructions ?? "No instructions recorded",
        };
      })
      .filter((template): template is ReceivingQaTemplateOption => Boolean(template)),
    receipts: receiptOptions,
    selectedReceipt:
      receiptOptions.find((receipt) => receipt.id === selectedReceiptId) ?? null,
    selectedReceiptLines: selectedLines.map((line) =>
      mapLineOption({
        line,
        item: lineContext.itemMap.get(line.internal_item_id),
        location: lineContext.locationMap.get(line.stock_location_id),
        lot: line.inventory_lot_id ? lineContext.lotMap.get(line.inventory_lot_id) : undefined,
      }),
    ),
    canCreate: access.canCreate,
  };
}

export async function fetchReceivingQaDetail(
  checkId: string,
): Promise<ReceivingQaDetail | null> {
  const access = await getQaAccess();
  const supabase = await createClient();
  const { data: checkData, error: checkError } = await supabase
    .from("qa_check_instances")
    .select(
      "id, template_id, template_version_id, status, source_type, inventory_receipt_id, inventory_receipt_line_id, supplier_id, internal_item_id, stock_location_id, inventory_lot_id, started_at, completed_at, completed_by_profile_id, overall_outcome, requires_review, requires_approval, notes, created_at",
    )
    .eq("organisation_id", access.organisationId)
    .eq("id", checkId)
    .eq("category", "receiving")
    .is("archived_at", null)
    .maybeSingle();

  if (checkError) {
    throw new Error("Could not load Receiving QA check.");
  }

  if (!checkData) {
    return null;
  }

  const check = checkData as CheckRow;
  const receiptContext = await fetchReceiptContext(
    access.organisationId,
    check.inventory_receipt_id ? [check.inventory_receipt_id] : [],
    check.inventory_receipt_line_id ? [check.inventory_receipt_line_id] : [],
  );
  const completedProfileIds = [
    check.completed_by_profile_id,
  ].filter((id): id is string => Boolean(id));

  const [
    templateResult,
    versionResult,
    sectionsResult,
    itemsResult,
    resultsResult,
    reviewsResult,
    holdsResult,
    profilesResult,
  ] = await Promise.all([
    supabase
      .from("qa_templates")
      .select("id, name, description, current_template_version_id")
      .eq("organisation_id", access.organisationId)
      .eq("id", check.template_id)
      .maybeSingle(),
    supabase
      .from("qa_template_versions")
      .select("id, template_id, version_number, instructions, status")
      .eq("organisation_id", access.organisationId)
      .eq("id", check.template_version_id)
      .maybeSingle(),
    supabase
      .from("qa_template_sections")
      .select("id, title, description, instructions, display_order")
      .eq("organisation_id", access.organisationId)
      .eq("template_version_id", check.template_version_id)
      .is("archived_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("qa_template_items")
      .select(
        "id, section_id, prompt, help_text, result_type, display_order, is_required, allow_not_applicable, requires_comment_on_fail, triggers_review, recommends_hold, requires_approval, warning_min, warning_max, critical_min, critical_max, unit, option_values",
      )
      .eq("organisation_id", access.organisationId)
      .eq("template_version_id", check.template_version_id)
      .is("archived_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("qa_check_results")
      .select(
        "id, template_item_id, status, outcome, value_boolean, value_number, value_text, value_date, value_time, value_timestamp, comment, exception_flag, requires_review, requires_hold_review, recorded_at, recorded_by_profile_id",
      )
      .eq("organisation_id", access.organisationId)
      .eq("check_instance_id", check.id)
      .is("archived_at", null),
    supabase
      .from("qa_reviews")
      .select("id, reviewer_profile_id, decision, notes, reviewed_at")
      .eq("organisation_id", access.organisationId)
      .eq("check_instance_id", check.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    check.inventory_lot_id
      ? supabase
          .from("qa_holds")
          .select("id, status, reason, placed_at")
          .eq("organisation_id", access.organisationId)
          .eq("inventory_lot_id", check.inventory_lot_id)
          .in("status", ["recommended", "active", "release_requested"])
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [], error: null }),
    completedProfileIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", completedProfileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (
    templateResult.error ||
    versionResult.error ||
    sectionsResult.error ||
    itemsResult.error ||
    resultsResult.error ||
    reviewsResult.error ||
    holdsResult.error ||
    profilesResult.error
  ) {
    throw new Error("Could not load Receiving QA detail.");
  }

  const template = templateResult.data as TemplateRow | null;
  const version = versionResult.data as TemplateVersionRow | null;
  const sections = (sectionsResult.data ?? []) as TemplateSectionRow[];
  const items = (itemsResult.data ?? []) as TemplateItemRow[];
  const results = (resultsResult.data ?? []) as ResultRow[];
  const reviews = (reviewsResult.data ?? []) as ReviewRow[];
  const formalHold = ((holdsResult.data ?? []) as QaHoldRow[])[0] ?? null;
  const profileMap = mapById((profilesResult.data ?? []) as ProfileRow[]);
  const receipt = check.inventory_receipt_id
    ? receiptContext.receiptMap.get(check.inventory_receipt_id)
    : undefined;
  const line = check.inventory_receipt_line_id
    ? receiptContext.lineMap.get(check.inventory_receipt_line_id)
    : undefined;
  const supplier = check.supplier_id
    ? receiptContext.supplierMap.get(check.supplier_id)
    : undefined;
  const itemMap = receiptContext.itemMap;
  const locationMap = receiptContext.locationMap;
  const lotMap = receiptContext.lotMap;
  const resultProfileIds = results
    .map((result) => result.recorded_by_profile_id)
    .filter((id): id is string => Boolean(id));
  const reviewProfileIds = reviews
    .map((review) => review.reviewer_profile_id)
    .filter((id): id is string => Boolean(id));
  const extraProfileIds = [...new Set([...resultProfileIds, ...reviewProfileIds])].filter(
    (id) => !profileMap.has(id),
  );

  if (extraProfileIds.length > 0) {
    const { data: extraProfiles, error: extraProfilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", extraProfileIds);

    if (extraProfilesError) {
      throw new Error("Could not load QA reviewer profiles.");
    }

    (extraProfiles as ProfileRow[] | null)?.forEach((profile) => {
      profileMap.set(profile.id, profile);
    });
  }

  const mappedItems = items.map((item) => ({
    id: item.id,
    sectionId: item.section_id,
    prompt: item.prompt,
    helpText: item.help_text ?? "",
    resultType: item.result_type,
    displayOrder: item.display_order,
    isRequired: item.is_required,
    allowNotApplicable: item.allow_not_applicable,
    requiresCommentOnFail: item.requires_comment_on_fail,
    triggersReview: item.triggers_review,
    recommendsHold: item.recommends_hold,
    requiresApproval: item.requires_approval,
    warningMin: item.warning_min,
    warningMax: item.warning_max,
    criticalMin: item.critical_min,
    criticalMax: item.critical_max,
    unit: item.unit ?? "",
    optionValues: optionValuesFromJson(item.option_values),
  }));

  const itemsWithoutSection = mappedItems.filter((item) => !item.sectionId);
  const mappedSections = sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description ?? "",
    instructions: section.instructions ?? "",
    displayOrder: section.display_order,
    items: mappedItems.filter((item) => item.sectionId === section.id),
  }));

  if (itemsWithoutSection.length > 0) {
    mappedSections.push({
      id: "unsectioned",
      title: "Checklist",
      description: "",
      instructions: "",
      displayOrder: 999999,
      items: itemsWithoutSection,
    });
  }

  const holdRecommendationResult =
    results.find((result) => result.requires_hold_review) ?? null;

  return {
    check: {
      id: check.id,
      reference: `QA-${check.id.slice(0, 8)}`,
      status: check.status,
      statusLabel: checkStatusLabel(check.status),
      statusTone: checkStatusTone(check.status),
      overallOutcome: check.overall_outcome ? checkStatusLabel(check.overall_outcome) : "Pending",
      outcomeTone: outcomeTone(check.overall_outcome),
      requiresReview: check.requires_review,
      requiresApproval: check.requires_approval,
      sourceType: check.source_type ?? "receiving",
      startedAt: formatDateTime(check.started_at),
      completedAt: formatDateTime(check.completed_at),
      completedBy: getProfileLabel(
        check.completed_by_profile_id ? profileMap.get(check.completed_by_profile_id) : undefined,
      ),
      notes: check.notes ?? "",
      isEditable: ["draft", "in_progress"].includes(check.status),
      canEdit: access.canComplete,
      canReview: access.canReview,
    },
    receipt: {
      id: receipt?.id ?? "",
      receiptNumber: receiptLabel(receipt),
      supplierName: supplier?.display_name ?? "Unknown supplier",
      supplierReference: receipt?.supplier_reference ?? "Not recorded",
      purchaseDocumentLabel: getPurchaseDocumentLabel(
        receipt?.purchase_document_id
          ? receiptContext.documentMap.get(receipt.purchase_document_id)
          : undefined,
      ),
      receivedAt: formatDateTime(receipt?.received_at),
      status: receipt?.status ? checkStatusLabel(receipt.status) : "Unknown",
    },
    line: line
      ? mapLineOption({
          line,
          item: itemMap.get(line.internal_item_id),
          location: locationMap.get(line.stock_location_id),
          lot: line.inventory_lot_id ? lotMap.get(line.inventory_lot_id) : undefined,
        })
      : null,
    template: {
      id: template?.id ?? check.template_id,
      versionId: version?.id ?? check.template_version_id,
      name: template?.name ?? "Unknown template",
      versionLabel: version ? `v${version.version_number}` : "Unknown version",
      instructions: version?.instructions ?? "No instructions recorded",
    },
    sections: mappedSections,
    results: results.map((result) => ({
      id: result.id,
      templateItemId: result.template_item_id,
      status: result.status,
      outcome: result.outcome ? checkStatusLabel(result.outcome) : "Draft",
      valueBoolean: result.value_boolean,
      valueNumber: result.value_number === null ? "" : String(result.value_number),
      valueText: result.value_text ?? "",
      valueDate: result.value_date ?? "",
      valueTime: result.value_time?.slice(0, 5) ?? "",
      valueTimestamp: formatDateTimeInput(result.value_timestamp),
      comment: result.comment ?? "",
      exceptionFlag: result.exception_flag,
      requiresReview: result.requires_review,
      requiresHoldReview: result.requires_hold_review,
      recordedAt: formatDateTime(result.recorded_at),
      recordedBy: getProfileLabel(
        result.recorded_by_profile_id ? profileMap.get(result.recorded_by_profile_id) : undefined,
      ),
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      decision: review.decision,
      decisionLabel: decisionLabel(review.decision),
      notes: review.notes ?? "No notes recorded",
      reviewedAt: formatDateTime(review.reviewed_at),
      reviewer: getProfileLabel(
        review.reviewer_profile_id ? profileMap.get(review.reviewer_profile_id) : undefined,
      ),
    })),
    formalHold: formalHold
      ? {
          id: formalHold.id,
          status: checkStatusLabel(formalHold.status),
          reason: formalHold.reason,
          placedAt: formatDateTime(formalHold.placed_at),
        }
      : null,
    holdRecommendation: {
      resultId: holdRecommendationResult?.id ?? null,
      canPlace:
        access.canPlaceHold &&
        Boolean(check.inventory_lot_id) &&
        Boolean(holdRecommendationResult) &&
        !formalHold,
      reason: holdRecommendationResult
        ? `Receiving QA hold recommendation from ${`QA-${check.id.slice(0, 8)}`}`
        : "Receiving QA did not recommend a hold.",
    },
  };
}
