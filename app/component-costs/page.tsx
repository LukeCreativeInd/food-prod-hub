import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";

const rows = [
  {
    Component: "Sweet Potato Mash",
    Type: "Prepared component",
    "Linked ingredients": "Sweet Potato, Seasoning",
    "Batch/yield": "12 kg batch",
    "Estimated cost": "$3.40/kg",
    "Cost status": "Review",
    "Used in meals": "4 meals",
    Notes: "Yield needs confirmation",
  },
  {
    Component: "Chunky Salsa",
    Type: "Mix",
    "Linked ingredients": "Tomato, Onion, Herbs",
    "Batch/yield": "8 kg batch",
    "Estimated cost": "Missing",
    "Cost status": "Missing yield",
    "Used in meals": "3 meals",
    Notes: "Needs batch/yield data",
  },
  {
    Component: "Napoli Sauce",
    Type: "Batch recipe",
    "Linked ingredients": "Tomato, Onion, Garlic",
    "Batch/yield": "20 L batch",
    "Estimated cost": "$2.85/L",
    "Cost status": "Review",
    "Used in meals": "5 meals",
    Notes: "Sample sauce cost",
  },
  {
    Component: "Chicken Mix",
    Type: "Prepared mix",
    "Linked ingredients": "Chicken Thigh, Roast Chicken Mix",
    "Batch/yield": "15 kg batch",
    "Estimated cost": "$7.95/kg",
    "Cost status": "Ready",
    "Used in meals": "6 meals",
    Notes: "Static demo cost",
  },
  {
    Component: "Rice Batch",
    Type: "Batch recipe",
    "Linked ingredients": "Basmati Rice, Water, Seasoning",
    "Batch/yield": "18 kg cooked",
    "Estimated cost": "Missing",
    "Cost status": "Missing ingredient cost",
    "Used in meals": "8 meals",
    Notes: "Needs cooked yield rule",
  },
];

export default function ComponentCostsPage() {
  return (
    <CostingsWorkspacePage
      title="Component Costs"
      description="Estimates costs for batch recipes, mixes and prepared components once real data exists."
      summaryCards={[
        {
          label: "Components tracked",
          value: "14",
          helperText: "Sample components included in costing review.",
          badge: "Sample",
          tone: "info",
          icon: "CP",
        },
        {
          label: "Missing yield",
          value: "4",
          helperText: "Static prompts for missing batch/yield data.",
          badge: "Review",
          tone: "warning",
          icon: "Y",
        },
        {
          label: "Missing ingredient cost",
          value: "3",
          helperText: "Placeholder upstream ingredient cost gaps.",
          badge: "Review",
          tone: "warning",
          icon: "$",
        },
        {
          label: "Ready for meal costing",
          value: "8",
          helperText: "Sample count of components ready for margin review.",
          badge: "Ready",
          tone: "success",
          icon: "OK",
        },
      ]}
      tableTitle="Sample component costs"
      tableDescription="Placeholder component costing records for staff review. No real calculations are being performed."
      columns={[
        "Component",
        "Type",
        "Linked ingredients",
        "Batch/yield",
        "Estimated cost",
        "Cost status",
        "Used in meals",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Cost status"]}
      reviewPrompts={[
        "Which component yields need to be captured before costing works?",
        "Should components be costed by raw input, cooked yield or usable output?",
        "Which component costs should block meal margin review?",
      ]}
    />
  );
}
