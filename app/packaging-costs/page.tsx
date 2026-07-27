import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getPackagingCostsData } from "@/lib/costings-subpage-data";

export default async function PackagingCostsPage() {
  const packagingCosts = await getPackagingCostsData();

  return (
    <CostingsWorkspacePage
      title="Packaging Costs"
      description="Read-only current supplier costs for internal packaging items."
      summaryCards={[
        {
          label: "Packaging items",
          value: String(packagingCosts.summary.totalItems),
          helperText: "Internal packaging records available for costing review.",
          badge: "Live",
          tone: "success",
          icon: "PK",
        },
        {
          label: "Approved prices",
          value: String(packagingCosts.summary.pricedItems),
          helperText: "Packaging records with a current approved supplier price.",
          badge: "Approved",
          tone: "success",
          icon: "$",
        },
        {
          label: "Missing prices",
          value: String(packagingCosts.summary.missingPriceItems),
          helperText: "Packaging records without an approved supplier price yet.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
        {
          label: "Mapped supplier items",
          value: String(packagingCosts.summary.mappedSupplierItems),
          helperText: "Packaging records with at least one supplier mapping.",
          badge: "Mapped",
          tone: "neutral",
          icon: "SU",
        },
      ]}
      tableTitle="Current packaging costs"
      tableDescription="Tenant-scoped packaging records and approved supplier prices where available. No packaging cost rules or finished product calculations are applied here."
      columns={[
        "Packaging item",
        "Type",
        "Supplier",
        "Supplier code",
        "Supplier description",
        "Unit",
        "Current cost",
        "Effective date",
        "Source",
        "Mapping status",
      ]}
      rows={packagingCosts.items.map((item) => ({
        "Packaging item": item.item,
        Type: item.itemType,
        Supplier: item.supplier,
        "Supplier code": item.supplierItemCode,
        "Supplier description": item.supplierDescription,
        Unit: item.unit,
        "Current cost": item.price,
        "Effective date": item.effectiveDate,
        Source: item.source,
        "Mapping status": item.mappingStatus,
      }))}
      badgeColumns={["Current cost", "Mapping status"]}
      dataBadge="Live read-only"
      dataNoticeTitle="Packaging prices from reviewed supplier records"
      dataNoticeDescription="This view reads internal packaging records, supplier mappings and approved supplier prices only. It does not update prices or calculate finished product packaging costs."
      emptyMessage="No packaging prices yet."
      reviewPrompts={[
        "Which packaging costs should roll into finished meal costing?",
        "Should labels, sleeves and cartons be costed separately?",
        "Which packaging price changes should trigger meal margin review?",
      ]}
    />
  );
}
