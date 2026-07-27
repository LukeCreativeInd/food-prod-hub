import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";
import { getComponentCostsData } from "@/lib/costings-subpage-data";

export default async function ComponentCostsPage() {
  const componentCosts = await getComponentCostsData();

  return (
    <CostingsWorkspacePage
      title="Component Costs"
      description="Read-only formula readiness and safe component cost visibility from real component formula data."
      summaryCards={[
        {
          label: "Component formulas",
          value: String(componentCosts.summary.totalFormulas),
          helperText: "Real component formula versions visible for this tenant.",
          badge: "Live",
          tone: "success",
          icon: "CP",
        },
        {
          label: "With lines",
          value: String(componentCosts.summary.formulasWithLines),
          helperText: "Formulas with at least one input line.",
          badge: "Formula",
          tone: "neutral",
          icon: "LN",
        },
        {
          label: "All inputs priced",
          value: String(componentCosts.summary.formulasWithAllPricedInputs),
          helperText: "Formulas where every input has an approved supplier price.",
          badge: "Ready",
          tone: "success",
          icon: "$",
        },
        {
          label: "Missing inputs",
          value: String(componentCosts.summary.formulasMissingPricedInputs),
          helperText: "Formula records still missing lines or approved input prices.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Component formula readiness"
      tableDescription="Real component formulas are shown where available. Costs are only estimated when every line has a matching approved price in the same unit."
      columns={[
        "Component",
        "Formula",
        "Status",
        "Output",
        "Line count",
        "Priced lines",
        "Missing inputs",
        "Estimated cost",
        "Readiness",
      ]}
      rows={componentCosts.formulas.map((formula) => ({
        Component: formula.outputItem,
        Formula: formula.formulaName,
        Status: formula.status,
        Output: formula.output,
        "Line count": formula.lineCount,
        "Priced lines": formula.pricedLineCount,
        "Missing inputs": formula.missingInputs,
        "Estimated cost": formula.estimatedCost,
        Readiness: formula.readiness,
      }))}
      badgeColumns={["Status", "Missing inputs", "Estimated cost", "Readiness"]}
      dataBadge="Live readiness"
      dataNoticeTitle="Formula pricing rules are still conservative"
      dataNoticeDescription="This page reads real formula versions and formula lines. It only estimates a cost when quantities and approved price units are directly aligned; broader yield, loss and conversion rules remain future work."
      emptyMessage="Formula data required before component costs can be calculated."
      reviewPrompts={[
        "Which component yields need to be captured before costing works?",
        "Should components be costed by raw input, cooked yield or usable output?",
        "Which component costs should block meal margin review?",
      ]}
    />
  );
}
