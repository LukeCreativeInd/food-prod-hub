export const supportTicketAttachmentBucket = "support-ticket-attachments";

export const supportTicketAttachmentStorageArea = "support-tickets";

export const supportTicketAttachmentMaxFileSizeBytes = 10 * 1024 * 1024;

export const supportTicketAttachmentMaxFilesPerAction = 5;

export const supportTicketAttachmentVisibilities = [
  "customer",
  "internal",
] as const;

export const supportTicketAttachmentSources = [
  "support_portal",
  "platform_admin",
  "internal",
] as const;

export const supportTicketAttachmentScanStatuses = [
  "not_scanned",
  "pending",
  "clean",
  "blocked",
  "failed",
] as const;

export const supportTicketAttachmentStatuses = [
  "active",
  "blocked",
  "archived",
] as const;

export const supportTicketAttachmentAllowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const supportTicketAttachmentBlockedExtensions = [
  "app",
  "bat",
  "cmd",
  "com",
  "dmg",
  "exe",
  "html",
  "htm",
  "js",
  "msi",
  "scr",
  "sh",
  "svg",
  "zip",
] as const;

export type SupportTicketAttachmentVisibility =
  (typeof supportTicketAttachmentVisibilities)[number];
export type SupportTicketAttachmentSource =
  (typeof supportTicketAttachmentSources)[number];
export type SupportTicketAttachmentScanStatus =
  (typeof supportTicketAttachmentScanStatuses)[number];
export type SupportTicketAttachmentStatus =
  (typeof supportTicketAttachmentStatuses)[number];
export type SupportTicketAttachmentAllowedMimeType =
  (typeof supportTicketAttachmentAllowedMimeTypes)[number];

export function formatSupportTicketAttachmentValue(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isSupportTicketAttachmentVisibility(
  value: string,
): value is SupportTicketAttachmentVisibility {
  return supportTicketAttachmentVisibilities.includes(
    value as SupportTicketAttachmentVisibility,
  );
}

export function isSupportTicketAttachmentSource(
  value: string,
): value is SupportTicketAttachmentSource {
  return supportTicketAttachmentSources.includes(
    value as SupportTicketAttachmentSource,
  );
}

export function isSupportTicketAttachmentScanStatus(
  value: string,
): value is SupportTicketAttachmentScanStatus {
  return supportTicketAttachmentScanStatuses.includes(
    value as SupportTicketAttachmentScanStatus,
  );
}

export function isSupportTicketAttachmentStatus(
  value: string,
): value is SupportTicketAttachmentStatus {
  return supportTicketAttachmentStatuses.includes(
    value as SupportTicketAttachmentStatus,
  );
}

export function isSupportTicketAttachmentAllowedMimeType(
  value: string,
): value is SupportTicketAttachmentAllowedMimeType {
  return supportTicketAttachmentAllowedMimeTypes.includes(
    value as SupportTicketAttachmentAllowedMimeType,
  );
}
