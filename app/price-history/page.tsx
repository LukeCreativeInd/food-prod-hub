import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getSupplierPriceHistoryData } from "@/lib/products-data";

export default async function PriceHistoryPage() {
  const priceHistory = await getSupplierPriceHistoryData();
  const rows = [
    ...priceHistory.currentApprovedPrices.map((price) => ({
      Item: price.itemName,
      Supplier: price.supplierName,
      "Supplier code": price.supplierItemCode ?? "Not recorded",
      "Supplier description": price.supplierDescription,
      Price: price.price,
      Unit: price.unit,
      Date: price.effectiveDate,
      Source: price.sourceInvoice,
      Type: "Current approved price",
      Status: price.status,
    })),
    ...priceHistory.priceObservations.map((observation) => ({
      Item: observation.itemName,
      Supplier: observation.supplierName,
      "Supplier code": observation.supplierItemCode ?? "Not recorded",
      "Supplier description": "Invoice observation",
      Price: observation.price,
      Unit: observation.unit,
      Date: observation.observedDate,
      Source: observation.sourceInvoice,
      Type: "Invoice observation",
      Status: observation.decision,
    })),
  ];

  return (
    <CostingsWorkspacePage
      title="Price History"
      description="Read-only supplier price observations and approved current prices from Purchase Document Intake."
      summaryCards={[
        {
          label: "Current prices",
          value: String(priceHistory.currentApprovedPrices.length),
          helperText: "Approved supplier prices currently available to costing review.",
          badge: "Approved",
          tone: "success",
          icon: "$",
        },
        {
          label: "Observations",
          value: String(priceHistory.priceObservations.length),
          helperText: "Invoice-sourced price observations retained for traceability.",
          badge: "Invoice",
          tone: "info",
          icon: "OB",
        },
        {
          label: "Supplier items",
          value: String(priceHistory.observedSupplierItemCount),
          helperText: "Distinct supplier items with observed invoice prices.",
          badge: "Source",
          tone: "neutral",
          icon: "SI",
        },
        {
          label: "Suppliers",
          value: String(priceHistory.supplierCount),
          helperText: "Suppliers visible through current tenant price permissions.",
          badge: "Tenant",
          tone: "neutral",
          icon: "SU",
        },
      ]}
      tableTitle="Supplier price records"
      tableDescription="Live current prices and recent invoice observations. This is traceability only, not a pricing automation workflow."
      columns={[
        "Item",
        "Supplier",
        "Supplier code",
        "Supplier description",
        "Price",
        "Unit",
        "Date",
        "Source",
        "Type",
        "Status",
      ]}
      rows={rows}
      badgeColumns={["Type", "Status"]}
      dataBadge="Live read-only"
      dataNoticeTitle="Price traceability from reviewed invoices"
      dataNoticeDescription="Approved prices and invoice observations are shown for review. No automatic price updates, purchase orders, meal formulas or stock movements are created from this page."
      emptyMessage="No supplier price observations or approved prices have been committed from Purchase Document Intake yet."
      reviewPrompts={[
        "Which price changes should require manager approval before costing use?",
        "Should older invoice observations be filtered by supplier, item or date range first?",
        "What price-change threshold should trigger staff review later?",
      ]}
    />
  );
}
