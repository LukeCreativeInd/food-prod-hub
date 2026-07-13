import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";
import { getInternalItemData } from "@/lib/products-data";

export default async function IngredientsPage() {
  const ingredients = await getInternalItemData("ingredient");
  const rows = ingredients.flatMap((ingredient) => {
    if (ingredient.supplierOptions.length === 0) {
      return [
        {
          Ingredient: {
            label: ingredient.displayName,
            href: `/internal-items/${ingredient.id}`,
          },
          Unit: ingredient.baseUnit ?? "Not recorded",
          Supplier: "No supplier mapping",
          "Supplier code": "Not recorded",
          "Supplier description": "Not recorded",
          "Current price": "Missing",
          "Price date": "Not reviewed",
          Status: ingredient.status,
        },
      ];
    }

    return ingredient.supplierOptions.map((option) => ({
      Ingredient: {
        label: ingredient.displayName,
        href: `/internal-items/${ingredient.id}`,
      },
      Unit: ingredient.baseUnit ?? option.purchaseUnit ?? "Not recorded",
      Supplier: option.supplierName,
      "Supplier code": option.supplierItemCode ?? "Not recorded",
      "Supplier description": option.supplierDescription,
      "Current price": option.currentPrice ?? "Missing",
      "Price date": option.effectiveDate ?? "Not reviewed",
      Status: ingredient.status,
    }));
  });
  const withCurrentPrice = rows.filter(
    (row) => row["Current price"] !== "Missing",
  ).length;

  return (
    <ProductsWorkspacePage
      title="Ingredients"
      description="Read-only internal ingredient items created or mapped from reviewed supplier invoice lines."
      summaryCards={[
        {
          label: "Ingredients",
          value: String(ingredients.length),
          helperText: "Canonical internal ingredient records for this tenant.",
          badge: "Live",
          tone: "success",
          icon: "IN",
        },
        {
          label: "Supplier options",
          value: String(rows.length),
          helperText: "Supplier item mappings available for ingredient purchasing.",
          badge: "Linked",
          tone: "info",
          icon: "SU",
        },
        {
          label: "Current prices",
          value: String(withCurrentPrice),
          helperText: "Supplier options with approved current pricing.",
          badge: "Approved",
          tone: "success",
          icon: "$",
        },
        {
          label: "Missing prices",
          value: String(rows.length - withCurrentPrice),
          helperText: "Mappings still missing an approved current supplier price.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Ingredient supplier options"
      tableDescription="Live ingredient records from Purchase Document Intake. Supplier source descriptions remain separate from internal item names."
      columns={[
        "Ingredient",
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
      dataNoticeTitle="Supplier-derived ingredient view"
      dataNoticeDescription="This page reads canonical internal ingredients and their reviewed supplier mappings. Informational invoice lines such as CTNS/CARTONS are excluded because they are not internal ingredients."
      emptyMessage="No ingredient items have been committed from Purchase Document Intake yet."
      reviewPrompts={[
        "Which ingredient fields should become editable first?",
        "Should supplier descriptions be visible beside internal item names on production screens?",
        "Which users should approve a changed ingredient supplier price?",
      ]}
    />
  );
}
