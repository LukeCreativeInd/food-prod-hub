export const supportTicketStatuses = [
  "open",
  "waiting_on_support",
  "waiting_on_customer",
  "planned",
  "resolved",
  "closed",
] as const;

export const supportTicketPriorities = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

export const supportTicketCategories = [
  "access",
  "products",
  "costings",
  "formulas",
  "supplier_invoice_intake",
  "inventory",
  "production",
  "platform_admin",
  "bug",
  "feature_request",
  "other",
] as const;

export const supportTicketSources = [
  "support_portal",
  "platform_admin",
  "internal",
] as const;

export const supportTicketVisibilities = ["customer", "internal"] as const;

export const supportTicketEventTypes = [
  "created",
  "status_changed",
  "priority_changed",
  "category_changed",
  "assigned",
  "comment_added",
  "internal_note_added",
  "archived",
  "restored",
] as const;

export type SupportTicketStatus = (typeof supportTicketStatuses)[number];
export type SupportTicketPriority = (typeof supportTicketPriorities)[number];
export type SupportTicketCategory = (typeof supportTicketCategories)[number];
export type SupportTicketSource = (typeof supportTicketSources)[number];
export type SupportTicketVisibility =
  (typeof supportTicketVisibilities)[number];
export type SupportTicketEventType = (typeof supportTicketEventTypes)[number];

export type SupportTicketStatusMetadata = {
  label: string;
  description: string;
  customerMeaning: string;
  platformMeaning: string;
  canCustomerComment: boolean;
  canPlatformReply: boolean;
  canAddInternalNote: boolean;
  isActive: boolean;
  isTerminal: boolean;
};

export const supportTicketStatusMetadata: Record<
  SupportTicketStatus,
  SupportTicketStatusMetadata
> = {
  open: {
    label: "Open",
    description: "Active ticket that has not yet been assigned a clearer waiting state.",
    customerMeaning: "The request is active.",
    platformMeaning: "The ticket is active and can be triaged.",
    canCustomerComment: true,
    canPlatformReply: true,
    canAddInternalNote: true,
    isActive: true,
    isTerminal: false,
  },
  waiting_on_support: {
    label: "Waiting on support",
    description: "EveryBatch support needs to review or respond.",
    customerMeaning: "EveryBatch support needs to respond.",
    platformMeaning: "The customer is waiting for EveryBatch support.",
    canCustomerComment: true,
    canPlatformReply: true,
    canAddInternalNote: true,
    isActive: true,
    isTerminal: false,
  },
  waiting_on_customer: {
    label: "Waiting on customer",
    description: "EveryBatch has replied and is waiting for customer input or review.",
    customerMeaning: "EveryBatch has replied and may be waiting for your input.",
    platformMeaning: "Support has replied and is waiting for the customer.",
    canCustomerComment: true,
    canPlatformReply: true,
    canAddInternalNote: true,
    isActive: true,
    isTerminal: false,
  },
  planned: {
    label: "Planned",
    description: "The request has been accepted for future work.",
    customerMeaning: "This has been accepted as planned future work.",
    platformMeaning: "The request is planned; replies do not change status automatically.",
    canCustomerComment: true,
    canPlatformReply: true,
    canAddInternalNote: true,
    isActive: true,
    isTerminal: false,
  },
  resolved: {
    label: "Resolved",
    description: "The issue is resolved but can be reopened by a customer comment.",
    customerMeaning: "This has been resolved. Reply if you still need help.",
    platformMeaning: "The issue is resolved; replies do not change status automatically.",
    canCustomerComment: true,
    canPlatformReply: true,
    canAddInternalNote: true,
    isActive: false,
    isTerminal: false,
  },
  closed: {
    label: "Closed",
    description: "The ticket is closed. New replies are blocked in v1.",
    customerMeaning: "This ticket is closed. Create a new ticket if you need more help.",
    platformMeaning: "The ticket is closed. Change status before sending a customer reply.",
    canCustomerComment: false,
    canPlatformReply: false,
    canAddInternalNote: true,
    isActive: false,
    isTerminal: true,
  },
};

export function formatSupportTicketValue(value: string) {
  if (isSupportTicketStatus(value)) {
    return supportTicketStatusMetadata[value].label;
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isSupportTicketCategory(
  value: string,
): value is SupportTicketCategory {
  return supportTicketCategories.includes(value as SupportTicketCategory);
}

export function isSupportTicketPriority(
  value: string,
): value is SupportTicketPriority {
  return supportTicketPriorities.includes(value as SupportTicketPriority);
}

export function isSupportTicketStatus(
  value: string,
): value is SupportTicketStatus {
  return supportTicketStatuses.includes(value as SupportTicketStatus);
}

export function getSupportTicketStatusMetadata(status: string) {
  return isSupportTicketStatus(status)
    ? supportTicketStatusMetadata[status]
    : null;
}

export function getNextStatusAfterCustomerComment(
  currentStatus: SupportTicketStatus,
): SupportTicketStatus {
  if (currentStatus === "closed") {
    return "closed";
  }

  return "waiting_on_support";
}

export function getNextStatusAfterPlatformReply(
  currentStatus: SupportTicketStatus,
): SupportTicketStatus {
  if (currentStatus === "open" || currentStatus === "waiting_on_support") {
    return "waiting_on_customer";
  }

  return currentStatus;
}

export function canCustomerCommentOnStatus(status: string) {
  return getSupportTicketStatusMetadata(status)?.canCustomerComment ?? false;
}

export function canPlatformReplyOnStatus(status: string) {
  return getSupportTicketStatusMetadata(status)?.canPlatformReply ?? false;
}

export function canAddInternalNoteOnStatus(status: string) {
  return getSupportTicketStatusMetadata(status)?.canAddInternalNote ?? false;
}

export function isTerminalTicketStatus(status: string) {
  return getSupportTicketStatusMetadata(status)?.isTerminal ?? false;
}

export function shouldSetResolvedAt(status: string) {
  return status === "resolved";
}

export function shouldSetClosedAt(status: string) {
  return status === "closed";
}
