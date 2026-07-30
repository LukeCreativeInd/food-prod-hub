export const inventoryReceiptStatuses = [
  "draft",
  "posted",
  "cancelled",
  "archived",
] as const;

export const inventoryReceiptLineStatuses = [
  "draft",
  "received",
  "held",
  "rejected",
  "cancelled",
  "archived",
] as const;

export const inventoryLotStatuses = [
  "available",
  "on_hold",
  "rejected",
  "consumed",
  "adjusted",
  "transferred",
  "archived",
] as const;

export const inventoryQaStatuses = [
  "not_checked",
  "passed",
  "hold",
  "rejected",
] as const;

export const inventoryConversionStatuses = [
  "not_required",
  "converted",
  "needs_conversion",
  "blocked",
] as const;

export const stockSourceTypes = [
  "manual",
  "receipt",
  "transfer",
  "adjustment",
  "production",
  "qa",
  "dispatch",
  "return",
  "system",
] as const;

export const stockMovementTypes = [
  "receipt",
  "transfer_in",
  "transfer_out",
  "adjustment_in",
  "adjustment_out",
  "production_issue",
  "production_output",
  "waste",
  "qa_hold",
  "qa_release",
  "dispatch",
  "return",
] as const;

export const stockMovementDirections = [
  "in",
  "out",
  "hold",
  "release",
  "neutral",
] as const;

export const stockMovementStatuses = [
  "draft",
  "posted",
  "reversed",
  "cancelled",
  "archived",
] as const;

export type InventoryReceiptStatus = (typeof inventoryReceiptStatuses)[number];
export type InventoryReceiptLineStatus = (typeof inventoryReceiptLineStatuses)[number];
export type InventoryLotStatus = (typeof inventoryLotStatuses)[number];
export type InventoryQaStatus = (typeof inventoryQaStatuses)[number];
export type InventoryConversionStatus = (typeof inventoryConversionStatuses)[number];
export type StockSourceType = (typeof stockSourceTypes)[number];
export type StockMovementType = (typeof stockMovementTypes)[number];
export type StockMovementDirection = (typeof stockMovementDirections)[number];
export type StockMovementStatus = (typeof stockMovementStatuses)[number];

export const inventoryReceiptStatusLabels: Record<InventoryReceiptStatus, string> = {
  draft: "Draft",
  posted: "Posted",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const inventoryReceiptLineStatusLabels: Record<InventoryReceiptLineStatus, string> = {
  draft: "Draft",
  received: "Received",
  held: "Held",
  rejected: "Rejected",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const inventoryLotStatusLabels: Record<InventoryLotStatus, string> = {
  available: "Available",
  on_hold: "On hold",
  rejected: "Rejected",
  consumed: "Consumed",
  adjusted: "Adjusted",
  transferred: "Transferred",
  archived: "Archived",
};

export const inventoryQaStatusLabels: Record<InventoryQaStatus, string> = {
  not_checked: "Not checked",
  passed: "Passed",
  hold: "Hold",
  rejected: "Rejected",
};

export const inventoryConversionStatusLabels: Record<InventoryConversionStatus, string> = {
  not_required: "Not required",
  converted: "Converted",
  needs_conversion: "Needs conversion",
  blocked: "Blocked",
};

export const stockSourceTypeLabels: Record<StockSourceType, string> = {
  manual: "Manual",
  receipt: "Receipt",
  transfer: "Transfer",
  adjustment: "Adjustment",
  production: "Production",
  qa: "QA",
  dispatch: "Dispatch",
  return: "Return",
  system: "System",
};

export const stockMovementTypeLabels: Record<StockMovementType, string> = {
  receipt: "Receipt",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
  adjustment_in: "Adjustment in",
  adjustment_out: "Adjustment out",
  production_issue: "Production issue",
  production_output: "Production output",
  waste: "Waste",
  qa_hold: "QA hold",
  qa_release: "QA release",
  dispatch: "Dispatch",
  return: "Return",
};

export const stockMovementDirectionLabels: Record<StockMovementDirection, string> = {
  in: "In",
  out: "Out",
  hold: "Hold",
  release: "Release",
  neutral: "Neutral",
};

export const stockMovementStatusLabels: Record<StockMovementStatus, string> = {
  draft: "Draft",
  posted: "Posted",
  reversed: "Reversed",
  cancelled: "Cancelled",
  archived: "Archived",
};

function isValueInList<TValue extends string>(
  value: string,
  allowedValues: readonly TValue[],
): value is TValue {
  return (allowedValues as readonly string[]).includes(value);
}

export function isInventoryReceiptStatus(value: string): value is InventoryReceiptStatus {
  return isValueInList(value, inventoryReceiptStatuses);
}

export function isInventoryReceiptLineStatus(value: string): value is InventoryReceiptLineStatus {
  return isValueInList(value, inventoryReceiptLineStatuses);
}

export function isInventoryLotStatus(value: string): value is InventoryLotStatus {
  return isValueInList(value, inventoryLotStatuses);
}

export function isInventoryQaStatus(value: string): value is InventoryQaStatus {
  return isValueInList(value, inventoryQaStatuses);
}

export function isInventoryConversionStatus(value: string): value is InventoryConversionStatus {
  return isValueInList(value, inventoryConversionStatuses);
}

export function isStockSourceType(value: string): value is StockSourceType {
  return isValueInList(value, stockSourceTypes);
}

export function isStockMovementType(value: string): value is StockMovementType {
  return isValueInList(value, stockMovementTypes);
}

export function isStockMovementDirection(value: string): value is StockMovementDirection {
  return isValueInList(value, stockMovementDirections);
}

export function isStockMovementStatus(value: string): value is StockMovementStatus {
  return isValueInList(value, stockMovementStatuses);
}
