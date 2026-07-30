import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getMealMarginsData } from "@/lib/costings-subpage-data";

export default async function MealMarginsPage() {
  const mealMargins = await getMealMarginsData();

  return (
    <CostingsWorkspacePage
      title="Meal Margins"
      description="Read-only gross margin previews using cost-ready finished product formulas and active sell prices."
      summaryCards={[
        {
          label: "Finished products",
          value: String(mealMargins.summary.totalFinishedProducts),
          helperText: "Tenant finished products included in margin readiness.",
          badge: "Live",
          tone: "success",
          icon: "FP",
        },
        {
          label: "Cost ready",
          value: String(mealMargins.summary.productsWithCompleteCostingInputs),
          helperText: "Finished product formulas with safe input costs and units.",
          badge: "Inputs",
          tone: "success",
          icon: "$",
        },
        {
          label: "Active sell price",
          value: String(mealMargins.summary.productsWithActiveSellPrice),
          helperText: "Finished products with at least one active open-ended channel price.",
          badge: "Sell price",
          tone: "info",
          icon: "%",
        },
        {
          label: "Margin ready",
          value: String(mealMargins.summary.productsReadyForMarginCalculation),
          helperText: "Products with safe formula cost, active price and known tax mode.",
          badge: "Preview",
          tone: "success",
          icon: "MR",
        },
        {
          label: "Blocked",
          value: String(mealMargins.summary.blockedProducts),
          helperText: "Products missing formula, safe cost, active price or tax mode.",
          badge: "Needs data",
          tone: mealMargins.summary.blockedProducts > 0 ? "warning" : "success",
          icon: "BL",
        },
      ]}
      tableTitle="Current channel margin preview"
      tableDescription="Gross profit, margin and markup are calculated only when formula cost and active sell price data are safe for v1."
      columns={[
        "Finished product",
        "Formula",
        "Product cost",
        "Sell price",
        "Channel",
        "Tax mode",
        "Gross profit",
        "Gross margin",
        "Markup",
        "Readiness",
        "Blockers",
        "Action",
      ]}
      rows={mealMargins.products.map((product) => ({
        "Finished product": product.finishedProduct,
        Formula: product.formula,
        "Product cost": product.productCost,
        "Sell price": product.sellPrice,
        Channel: product.channel,
        "Tax mode": product.taxMode,
        "Gross profit": product.grossProfit,
        "Gross margin": product.grossMarginPercent,
        Markup: product.markupPercent,
        Readiness: product.readiness,
        Blockers: product.blockers,
        Action: product.action,
      }))}
      badgeColumns={[
        "Formula",
        "Product cost",
        "Sell price",
        "Tax mode",
        "Gross profit",
        "Readiness",
        "Blockers",
      ]}
      dataBadge="Live calculation"
      dataNoticeTitle="Margin calculation v1 is conservative"
      dataNoticeDescription="This page calculates gross profit, gross margin and markup only from active sell prices and cost-ready formulas. It remains a live preview; create locked cost or margin snapshots from the relevant finished product detail page when a review point needs to be preserved."
      emptyMessage="No finished products available for margin review yet."
      reviewPrompts={[
        "Should GST-inclusive prices be normalised before final margin reporting?",
        "Which channel should be the default margin review channel?",
        "What margin thresholds should trigger warning states?",
      ]}
    />
  );
}
