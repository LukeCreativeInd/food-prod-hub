import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";

const rows = [
  {
    Ingredient: "Chicken Thigh",
    Category: "Protein",
    Unit: "kg",
    Supplier: "Poultry Supplier",
    "Cost status": "Linked",
    "QA/allergen status": "Review",
    Status: "Active",
  },
  {
    Ingredient: "Basmati Rice",
    Category: "Dry goods",
    Unit: "kg",
    Supplier: "Dry Goods Supplier",
    "Cost status": "Linked",
    "QA/allergen status": "Ready",
    Status: "Active",
  },
  {
    Ingredient: "Sweet Potato",
    Category: "Produce",
    Unit: "kg",
    Supplier: "Fresh Produce Supplier",
    "Cost status": "Missing cost",
    "QA/allergen status": "Ready",
    Status: "Review",
  },
  {
    Ingredient: "Napoli Sauce",
    Category: "Prepared sauce",
    Unit: "kg",
    Supplier: "Placeholder Supplier",
    "Cost status": "Review",
    "QA/allergen status": "Flagged",
    Status: "Sample",
  },
  {
    Ingredient: "Roast Chicken Mix",
    Category: "Seasoning",
    Unit: "kg",
    Supplier: "Dry Goods Supplier",
    "Cost status": "Missing supplier",
    "QA/allergen status": "Review",
    Status: "Draft",
  },
];

export default function IngredientsPage() {
  return (
    <ProductsWorkspacePage
      title="Ingredients"
      description="Raw materials used across meals, components and production."
      summaryCards={[
        {
          label: "Total ingredients",
          value: "42",
          helperText: "Sample ingredient count for screen review.",
          badge: "Sample",
          tone: "info",
          icon: "IN",
        },
        {
          label: "Missing supplier",
          value: "3",
          helperText: "Placeholder prompts for supplier linking.",
          badge: "Review",
          tone: "warning",
          icon: "SU",
        },
        {
          label: "Missing cost",
          value: "5",
          helperText: "Costing readiness prompts for future setup.",
          badge: "To confirm",
          tone: "warning",
          icon: "$",
        },
        {
          label: "QA/allergen flagged",
          value: "4",
          helperText: "Future QA and allergen review prompts.",
          badge: "Future",
          tone: "neutral",
          icon: "QA",
        },
      ]}
      tableTitle="Sample ingredients"
      tableDescription="Placeholder ingredient records for staff terminology and field review."
      columns={[
        "Ingredient",
        "Category",
        "Unit",
        "Supplier",
        "Cost status",
        "QA/allergen status",
        "Status",
      ]}
      rows={rows}
      badgeColumns={["Cost status", "QA/allergen status", "Status"]}
      reviewPrompts={[
        "Which ingredient categories should Tony/team use every day?",
        "Which allergen or QA flags must appear before production planning?",
        "What supplier and cost fields are required before importing data?",
      ]}
    />
  );
}
