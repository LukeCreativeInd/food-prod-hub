import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getMealMarginsData } from "@/lib/costings-subpage-data";

export default async function MealMarginsPage() {
  const mealMargins = await getMealMarginsData();

  return (
    <CostingsWorkspacePage
      title="Meal Margins"
      description="Read-only finished product formula readiness before true margin calculations exist."
      summaryCards={[
        {
          label: "Finished products",
          value: String(mealMargins.summary.totalFinishedProducts),
          helperText: "Finished product formula versions visible for this tenant.",
          badge: "Live",
          tone: "success",
          icon: "FP",
        },
        {
          label: "Formula data",
          value: String(mealMargins.summary.productsWithFormulaData),
          helperText: "Finished products with a formula record available.",
          badge: "Formula",
          tone: "neutral",
          icon: "FM",
        },
        {
          label: "Cost inputs ready",
          value: String(mealMargins.summary.productsWithCompleteCostingInputs),
          helperText: "Finished product formulas where every input has a current approved price.",
          badge: "Inputs",
          tone: "success",
          icon: "$",
        },
        {
          label: "Missing sell price",
          value: String(mealMargins.summary.productsMissingSellPrice),
          helperText: "Sell prices are not stored in the current schema yet.",
          badge: "Future",
          tone: "warning",
          icon: "%",
        },
      ]}
      tableTitle="Finished product margin readiness"
      tableDescription="Real finished product formula records are shown where available. Margins are not calculated because sell prices are not stored yet."
      columns={[
        "Finished product",
        "Formula",
        "Status",
        "Line count",
        "Priced lines",
        "Missing inputs",
        "Estimated cost",
        "Sell price",
        "Estimated margin",
        "Readiness",
      ]}
      rows={mealMargins.products.map((product) => ({
        "Finished product": product.outputItem,
        Formula: product.formulaName,
        Status: product.status,
        "Line count": product.lineCount,
        "Priced lines": product.pricedLineCount,
        "Missing inputs": product.missingInputs,
        "Estimated cost": product.estimatedCost,
        "Sell price": product.sellPrice,
        "Estimated margin": product.estimatedMargin,
        Readiness: product.readiness,
      }))}
      badgeColumns={[
        "Status",
        "Missing inputs",
        "Sell price",
        "Estimated margin",
        "Readiness",
      ]}
      dataBadge="Live readiness"
      dataNoticeTitle="Sell price not stored yet"
      dataNoticeDescription="This page reads real finished product formulas and input price readiness. It does not fake sell prices or margins; margin calculation needs explicit sell price and costing rules in a later task."
      emptyMessage="Sell prices are not stored yet."
      reviewPrompts={[
        "What sell price source should be used for margin review?",
        "Should margin warnings appear by meal, category or customer channel?",
        "Which missing inputs should block a meal from costing review?",
      ]}
    />
  );
}
