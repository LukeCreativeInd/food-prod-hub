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
