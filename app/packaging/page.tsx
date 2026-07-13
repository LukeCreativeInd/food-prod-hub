import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";
import { getInternalItemData } from "@/lib/products-data";

export default async function PackagingPage() {
  const packagingItems = await getInternalItemData("packaging");
  const rows = packagingItems.flatMap((item) => {
    if (item.supplierOptions.length === 0) {
      return [
        {
          "Packaging item": {
            label: item.displayName,
            href: `/internal-items/${item.id}`,
          },
          Unit: item.baseUnit ?? "Not recorded",
          Supplier: "No supplier mapping",
          "Supplier code": "Not recorded",
          "Supplier description": "Not recorded",
          "Current price": "Missing",
          "Price date": "Not reviewed",
          Status: item.status,
        },
      ];
    }

    return item.supplierOptions.map((option) => ({
      "Packaging item": {
        label: item.displayName,
        href: `/internal-items/${item.id}`,
      },
      Unit: item.baseUnit ?? option.purchaseUnit ?? "Not recorded",
      Supplier: option.supplierName,
      "Supplier code": option.supplierItemCode ?? "Not recorded",
      "Supplier description": option.supplierDescription,
      "Current price": option.currentPrice ?? "Missing",
      "Price date": option.effectiveDate ?? "Not reviewed",
      Status: item.status,
    }));
  });

  return (
    <ProductsWorkspacePage
      title="Packaging"
      description="Read-only packaging items created or mapped from reviewed supplier invoice lines."
      summaryCards={[
        {
          label: "Packaging items",
          value: String(packagingItems.length),
          helperText: "Canonical internal packaging records for this tenant.",
          badge: "Live",
          tone: packagingItems.length > 0 ? "success" : "neutral",
          icon: "PK",
        },
        {
          label: "Supplier options",
          value: String(rows.length),
          helperText: "Packaging supplier mappings created through reviewed intake.",
          badge: "Linked",
          tone: rows.length > 0 ? "info" : "neutral",
          icon: "SU",
        },
        {
          label: "Informational lines",
          value: "Excluded",
          helperText: "CTNS/CARTONS remains informational and is not packaging.",
          badge: "Protected",
          tone: "success",
          icon: "CT",
        },
        {
          label: "Edit mode",
          value: "Read only",
          helperText: "Packaging editing and stock rules remain future work.",
          badge: "Future",
          tone: "neutral",
          icon: "RO",
        },
      ]}
      tableTitle="Packaging supplier options"
      tableDescription="Live packaging records from Purchase Document Intake where internal_items.item_type is packaging."
      columns={[
        "Packaging item",
        "Unit",
        "Supplier",
        "Supplier code",
        "Supplier description",
        "Current price",
        "Price date",
        "Status",
      ]}
      rows={rows}
      badgeColumns={["Current price", "Status"]}
      dataBadge="Live read-only"
      dataNoticeTitle="Packaging excludes informational carton lines"
      dataNoticeDescription="This view only shows internal packaging records. Supplier invoice lines classified as informational, including CTNS/CARTONS from Cammaroto, remain out of Products and Costings catalogues."
      emptyMessage="No packaging items have been committed from Purchase Document Intake yet. Informational CTNS/CARTONS lines are intentionally excluded."
      reviewPrompts={[
        "Which packaging items should be tracked in inventory first?",
        "Should cartons ever become packaging records, or stay informational by default?",
        "Which packaging prices should flow into finished meal costing later?",
      ]}
    />
  );
}
