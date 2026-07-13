import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getIngredientCostData } from "@/lib/products-data";

export default async function IngredientCostsPage() {
  const ingredientCosts = await getIngredientCostData();
  const currentCosts = ingredientCosts.filter(
    (item) => item.costStatus === "Current",
  ).length;

  return (
    <CostingsWorkspacePage
      title="Ingredient Costs"
      description="Read-only current supplier costs for internal ingredient items."
      summaryCards={[
        {
          label: "Ingredients",
          value: String(ingredientCosts.length),
          helperText: "Internal ingredient records available for costing review.",
          badge: "Live",
          tone: "success",
          icon: "IN",
        },
        {
          label: "Current costs",
          value: String(currentCosts),
          helperText: "Approved current supplier prices linked to ingredients.",
          badge: "Approved",
          tone: "success",
          icon: "$",
        },
        {
          label: "Missing costs",
          value: String(ingredientCosts.length - currentCosts),
          helperText: "Ingredient records without an approved supplier price yet.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
        {
          label: "Mode",
          value: "Read only",
          helperText: "No costing formulas or meal costing calculations are added.",
          badge: "Scoped",
          tone: "neutral",
          icon: "RO",
        },
      ]}
      tableTitle="Current ingredient costs"
      tableDescription="Approved supplier prices created through reviewed Purchase Document Intake commits. No costing formulas are calculated here."
      columns={[
        "Ingredient",
        "Supplier",
        "Supplier code",
        "Unit",
        "Current cost",
        "Effective date",
        "Supplier options",
        "Cost status",
      ]}
      rows={ingredientCosts.map((item) => ({
        Ingredient: item.displayName,
        Supplier: item.supplierName,
        "Supplier code": item.supplierItemCode ?? "Not recorded",
        Unit: item.unit,
        "Current cost": item.currentCost,
        "Effective date": item.effectiveDate,
        "Supplier options": String(item.mappedSupplierCount),
        "Cost status": item.costStatus,
      }))}
      badgeColumns={["Current cost", "Cost status"]}
      dataBadge="Live read-only"
      dataNoticeTitle="Current supplier prices only"
      dataNoticeDescription="This view exposes approved supplier prices for ingredient review. It does not create recipes, meal costings, formulas, margin calculations or stock movements."
      emptyMessage="No ingredient cost records have been committed from Purchase Document Intake yet."
      reviewPrompts={[
        "Which approved supplier prices should be eligible for meal costing later?",
        "Should ingredient costs prefer invoice date, effective date or approval date?",
        "Who should approve a supplier price before it flows into costing formulas?",
      ]}
    />
  );
}
