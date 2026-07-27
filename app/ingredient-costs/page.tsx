import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getIngredientCostsData } from "@/lib/costings-subpage-data";

export default async function IngredientCostsPage() {
  const ingredientCosts = await getIngredientCostsData();

  return (
    <CostingsWorkspacePage
      title="Ingredient Costs"
      description="Read-only current supplier costs for internal ingredient items."
      summaryCards={[
        {
          label: "Ingredients",
          value: String(ingredientCosts.summary.totalItems),
          helperText: "Internal ingredient records available for costing review.",
          badge: "Live",
          tone: "success",
          icon: "IN",
        },
        {
          label: "Approved prices",
          value: String(ingredientCosts.summary.pricedItems),
          helperText: "Ingredients with a current approved supplier price.",
          badge: "Approved",
          tone: "success",
          icon: "$",
        },
        {
          label: "Missing prices",
          value: String(ingredientCosts.summary.missingPriceItems),
          helperText: "Ingredient records without an approved supplier price yet.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
        {
          label: "Latest update",
          value: ingredientCosts.summary.latestPriceUpdate,
          helperText: "Most recent approved price effective date for ingredients.",
          badge: "Traceable",
          tone: "neutral",
          icon: "DT",
        },
      ]}
      tableTitle="Current ingredient costs"
      tableDescription="Approved supplier prices created through reviewed Purchase Document Intake commits. Missing rows show where mappings or approved prices are still required."
      columns={[
        "Ingredient",
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
      rows={ingredientCosts.items.map((item) => ({
        Ingredient: item.item,
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
      dataNoticeTitle="Current supplier prices only"
      dataNoticeDescription="This view exposes tenant-scoped approved supplier prices for ingredient review. It does not create recipes, formulas, margin calculations, stock movements or price edits."
      emptyMessage="No approved ingredient prices yet."
      reviewPrompts={[
        "Which approved supplier prices should be eligible for meal costing later?",
        "Should ingredient costs prefer invoice date, effective date or approval date?",
        "Who should approve a supplier price before it flows into costing formulas?",
      ]}
    />
  );
}
