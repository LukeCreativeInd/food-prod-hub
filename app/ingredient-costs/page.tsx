import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";

const rows = [
  {
    Ingredient: "Chicken Thigh",
    Supplier: "Poultry Supplier",
    Unit: "kg",
    "Pack size": "10 kg carton",
    "Current cost": "$8.75/kg",
    "Cost status": "Review",
    "Last reviewed": "15 Jul 2026",
    Notes: "Static sample cost only",
  },
  {
    Ingredient: "Basmati Rice",
    Supplier: "Dry Goods Supplier",
    Unit: "kg",
    "Pack size": "20 kg bag",
    "Current cost": "$2.55/kg",
    "Cost status": "Ready",
    "Last reviewed": "12 Jul 2026",
    Notes: "Supplier price to confirm",
  },
  {
    Ingredient: "Sweet Potato",
    Supplier: "Fresh Produce Supplier",
    Unit: "kg",
    "Pack size": "15 kg crate",
    "Current cost": "Missing",
    "Cost status": "Missing cost",
    "Last reviewed": "Not reviewed",
    Notes: "Needs current produce price",
  },
  {
    Ingredient: "Napoli Sauce",
    Supplier: "Placeholder Supplier",
    Unit: "kg",
    "Pack size": "5 kg tub",
    "Current cost": "$3.10/kg",
    "Cost status": "Review",
    "Last reviewed": "08 Jul 2026",
    Notes: "May become component later",
  },
  {
    Ingredient: "Roast Chicken Mix",
    Supplier: "Dry Goods Supplier",
    Unit: "kg",
    "Pack size": "2 kg bag",
    "Current cost": "$6.20/kg",
    "Cost status": "Supplier review",
    "Last reviewed": "10 Jul 2026",
    Notes: "Sample seasoning record",
  },
];

export default function IngredientCostsPage() {
  return (
    <CostingsWorkspacePage
      title="Ingredient Costs"
      description="Tracks ingredient cost status once real supplier and ingredient data exists."
      summaryCards={[
        {
          label: "Ingredients costed",
          value: "37",
          helperText: "Sample ingredient records with current cost placeholders.",
          badge: "Sample",
          tone: "info",
          icon: "IN",
        },
        {
          label: "Missing cost",
          value: "5",
          helperText: "Static prompts for missing supplier prices.",
          badge: "Review",
          tone: "warning",
          icon: "$",
        },
        {
          label: "Supplier review",
          value: "8",
          helperText: "Sample items needing supplier confirmation.",
          badge: "To confirm",
          tone: "warning",
          icon: "SU",
        },
        {
          label: "Recent changes",
          value: "4",
          helperText: "Placeholder recent ingredient price movements.",
          badge: "Demo",
          tone: "neutral",
          icon: "UP",
        },
      ]}
      tableTitle="Sample ingredient costs"
      tableDescription="Placeholder ingredient cost records for staff review. No live supplier data is connected."
      columns={[
        "Ingredient",
        "Supplier",
        "Unit",
        "Pack size",
        "Current cost",
        "Cost status",
        "Last reviewed",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Cost status"]}
      reviewPrompts={[
        "Which ingredient cost fields are needed before meal costing can start?",
        "Should costs be stored by pack, unit, supplier price list or invoice?",
        "Who should approve an updated ingredient cost?",
      ]}
    />
  );
}
