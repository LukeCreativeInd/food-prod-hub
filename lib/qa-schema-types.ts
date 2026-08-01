export const QA_TEMPLATE_CATEGORIES = [
  "receiving",
  "production",
  "daily",
  "cleaning",
  "pre_operational",
  "temperature",
  "haccp_ccp",
  "hold_review",
  "other",
] as const;

export const QA_TEMPLATE_STATUSES = ["draft", "active", "archived"] as const;

export const QA_TEMPLATE_VERSION_STATUSES = [
  "draft",
  "published",
  "superseded",
  "archived",
] as const;

export const QA_RESULT_TYPES = [
  "pass_fail",
  "yes_no",
  "number",
  "temperature",
  "text",
  "selection",
  "date",
  "time",
  "datetime",
  "acknowledgement",
] as const;

export const QA_CHECK_INSTANCE_STATUSES = [
  "draft",
  "in_progress",
  "completed",
  "needs_review",
  "reviewed",
  "approved",
  "cancelled",
] as const;

export const QA_REVIEW_DECISIONS = [
  "pending",
  "accepted",
  "conditional_acceptance",
  "rejected",
  "escalated",
  "cancelled",
] as const;

export const QA_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "superseded",
  "revoked",
] as const;

export const QA_HOLD_STATUSES = [
  "recommended",
  "active",
  "release_requested",
  "released",
  "rejected",
  "disposed",
  "returned",
  "cancelled",
] as const;

export const QA_HOLD_REASON_CATEGORIES = [
  "receiving",
  "temperature",
  "labelling",
  "damage",
  "foreign_matter",
  "expiry",
  "supplier_issue",
  "production",
  "qa_review",
  "other",
] as const;

export const QA_HOLD_EVENT_TYPES = [
  "recommended",
  "placed",
  "review_requested",
  "released",
  "rejected",
  "disposal_recommended",
  "return_to_supplier_recommended",
  "cancelled",
  "corrected",
  "superseded",
] as const;

export const QA_PERMISSIONS = {
  view: "qa.view",
  checksView: "qa.checks.view",
  checksCreate: "qa.checks.create",
  checksComplete: "qa.checks.complete",
  templatesManage: "qa.templates.manage",
  templatesPublish: "qa.templates.publish",
  reviewsManage: "qa.reviews.manage",
  approvalsManage: "qa.approvals.manage",
  resultsOverride: "qa.results.override",
  holdsView: "qa.holds.view",
  holdsPlace: "qa.holds.place",
  holdsRelease: "qa.holds.release",
  holdsDispose: "qa.holds.dispose",
  nonConformancesView: "qa.non_conformances.view",
  nonConformancesManage: "qa.non_conformances.manage",
  nonConformancesClose: "qa.non_conformances.close",
  correctiveActionsView: "qa.corrective_actions.view",
  correctiveActionsManage: "qa.corrective_actions.manage",
  correctiveActionsVerify: "qa.corrective_actions.verify",
  reportsView: "qa.reports.view",
  documentsView: "qa.documents.view",
  documentsManage: "qa.documents.manage",
  recordsArchive: "qa.records.archive",
} as const;

export type QaTemplateCategory = (typeof QA_TEMPLATE_CATEGORIES)[number];
export type QaTemplateStatus = (typeof QA_TEMPLATE_STATUSES)[number];
export type QaTemplateVersionStatus =
  (typeof QA_TEMPLATE_VERSION_STATUSES)[number];
export type QaResultType = (typeof QA_RESULT_TYPES)[number];
export type QaCheckInstanceStatus =
  (typeof QA_CHECK_INSTANCE_STATUSES)[number];
export type QaReviewDecision = (typeof QA_REVIEW_DECISIONS)[number];
export type QaApprovalStatus = (typeof QA_APPROVAL_STATUSES)[number];
export type QaHoldStatus = (typeof QA_HOLD_STATUSES)[number];
export type QaHoldReasonCategory = (typeof QA_HOLD_REASON_CATEGORIES)[number];
export type QaHoldEventType = (typeof QA_HOLD_EVENT_TYPES)[number];
