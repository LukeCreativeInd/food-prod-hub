import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";

const rows = [
  {
    "Packaging item": "Meal Sleeve",
    Type: "Sleeve",
    Supplier: "Packaging Supplier",
    Unit: "each",
    "Current cost": "$0.31",
    "Cost status": "Review",
    "Used by": "Finished meals",
    Notes: "Sample packaging cost",
  },
  {
    "Packaging item": "Meal Tray",
    Type: "Tray",
    Supplier: "Packaging Supplier",
    Unit: "each",
    "Current cost": "$0.42",
    "Cost status": "Ready",
    "Used by": "Finished meals",
    Notes: "Static demo cost",
  },
  {
    "Packaging item": "Carton",
    Type: "Outer carton",
    Supplier: "Packaging Supplier",
    Unit: "each",
    "Current cost": "$1.15",
    "Cost status": "Review",
    "Used by": "Dispatch",
    Notes: "May affect logistics cost later",
  },
  {
    "Packaging item": "Label",
    Type: "Label",
    Supplier: "Placeholder Supplier",
    Unit: "roll",
    "Current cost": "Missing",
    "Cost status": "Missing cost",
    "Used by": "Pack-out",
    Notes: "Needs label cost approach",
  },
  {
    "Packaging item": "Sauce Container",
    Type: "Container",
    Supplier: "Packaging Supplier",
    Unit: "each",
    "Current cost": "$0.18",
    "Cost status": "Ready",
    "Used by": "Components",
    Notes: "Sample component packaging",
  },
];

export default function PackagingCostsPage() {
  return (
    <CostingsWorkspacePage
      title="Packaging Costs"
      description="Tracks packaging cost status for finished products, components and dispatch."
      summaryCards={[
        {
          label: "Packaging items costed",
          value: "7",
          helperText: "Sample packaging records with cost placeholders.",
          badge: "Sample",
          tone: "info",
          icon: "PK",
        },
        {
          label: "Missing cost",
          value: "2",
          helperText: "Static packaging cost gaps for review.",
          badge: "Review",
          tone: "warning",
          icon: "$",
        },
        {
          label: "Supplier linked",
          value: "8",
          helperText: "Placeholder supplier-linked packaging items.",
          badge: "Linked",
          tone: "success",
          icon: "SU",
        },
        {
          label: "Review required",
          value: "3",
          helperText: "Sample packaging costs needing confirmation.",
          badge: "To confirm",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample packaging costs"
      tableDescription="Placeholder packaging cost records for staff review. No live costing data is connected."
      columns={[
        "Packaging item",
        "Type",
        "Supplier",
        "Unit",
        "Current cost",
        "Cost status",
        "Used by",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Cost status"]}
      reviewPrompts={[
        "Which packaging costs should roll into finished meal costing?",
        "Should labels, sleeves and cartons be costed separately?",
        "Which packaging price changes should trigger meal margin review?",
      ]}
    />
  );
}
