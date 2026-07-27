import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getPriceHistoryData } from "@/lib/costings-subpage-data";

export default async function PriceHistoryPage() {
  const priceHistory = await getPriceHistoryData();

  return (
    <CostingsWorkspacePage
      title="Price History"
      description="Read-only supplier price observations and approved current price context from Purchase Document Intake."
      summaryCards={[
        {
          label: "Observations",
          value: String(priceHistory.summary.totalObservations),
          helperText: "Invoice-sourced price observations retained for traceability.",
          badge: "Invoice",
          tone: "info",
          icon: "OB",
        },
        {
          label: "Suppliers",
          value: String(priceHistory.summary.suppliersWithPriceData),
          helperText: "Distinct suppliers with observed price data.",
          badge: "Tenant",
          tone: "neutral",
          icon: "SU",
        },
        {
          label: "Latest observation",
          value: priceHistory.summary.latestObservationDate,
          helperText: "Most recent observed invoice price date.",
          badge: "Recent",
          tone: "neutral",
          icon: "DT",
        },
        {
          label: "Price changes",
          value: String(priceHistory.summary.priceChangesDetected),
          helperText: "Observed price changes compared with the previous visible observation for the same supplier item.",
          badge: "Trace",
          tone: "warning",
          icon: "CH",
        },
      ]}
      tableTitle="Recent supplier price observations"
      tableDescription="Live invoice observations with current approved price context where available. This is traceability only, not pricing automation."
      columns={[
        "Item",
        "Supplier",
        "Supplier code",
        "Supplier description",
        "Observed price",
        "Approved price",
        "Unit",
        "Date",
        "Source",
        "Change",
        "Status",
      ]}
      rows={priceHistory.records.map((record) => ({
        Item: record.itemName,
        Supplier: record.supplierName,
        "Supplier code": record.supplierItemCode,
        "Supplier description": record.supplierDescription,
        "Observed price": record.observedPrice,
        "Approved price": record.approvedPrice,
        Unit: record.unit,
        Date: record.date,
        Source: record.source,
        Change: record.change,
        Status: record.status,
      }))}
      badgeColumns={["Approved price", "Change", "Status"]}
      dataBadge="Live read-only"
      dataNoticeTitle="Price traceability from reviewed invoices"
      dataNoticeDescription="Observed invoice prices and current approved prices are shown for review. No automatic price updates, purchase orders, formulas or stock movements are created from this page."
      emptyMessage="No supplier price observations or approved prices have been committed from Purchase Document Intake yet."
      reviewPrompts={[
        "Which price changes should require manager approval before costing use?",
        "Should older invoice observations be filtered by supplier, item or date range first?",
        "What price-change threshold should trigger staff review later?",
      ]}
    />
  );
}
