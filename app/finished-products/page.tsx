import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";

const rows = [
  {
    "Finished product": "Chicken Fajita Bowl",
    Category: "Bowl",
    "Recipe status": "Review",
    Packaging: "Meal Tray, Meal Sleeve",
    "Costing status": "Sample",
    "Production status": "Active",
    "Sales/channel status": "Placeholder",
    Notes: "Static demo product",
  },
  {
    "Finished product": "Naked Chicken Parma",
    Category: "Protein meal",
    "Recipe status": "Missing packaging",
    Packaging: "Meal Tray, Label",
    "Costing status": "Missing packaging",
    "Production status": "Review",
    "Sales/channel status": "Placeholder",
    Notes: "Packaging review required",
  },
  {
    "Finished product": "Spaghetti Bolognese",
    Category: "Pasta",
    "Recipe status": "Sample",
    Packaging: "Meal Tray, Meal Sleeve",
    "Costing status": "Review",
    "Production status": "Active",
    "Sales/channel status": "Placeholder",
    Notes: "Sample finished product",
  },
  {
    "Finished product": "Burrito Bowl",
    Category: "Bowl",
    "Recipe status": "Missing components",
    Packaging: "Meal Tray",
    "Costing status": "Missing costing",
    "Production status": "Draft",
    "Sales/channel status": "Placeholder",
    Notes: "Component links to confirm",
  },
  {
    "Finished product": "Shepherd's Pie",
    Category: "Classic meal",
    "Recipe status": "Review",
    Packaging: "Meal Tray, Label",
    "Costing status": "Review",
    "Production status": "Active",
    "Sales/channel status": "Placeholder",
    Notes: "Finished product terminology review",
  },
];

export default function FinishedProductsPage() {
  return (
    <ProductsWorkspacePage
      title="Finished Products"
      description="Finished products are the sellable/output items that production makes and the business sells."
      summaryCards={[
        {
          label: "Finished products",
          value: "28",
          helperText: "Sample sellable/output item count.",
          badge: "Sample",
          tone: "info",
          icon: "FP",
        },
        {
          label: "Active products",
          value: "21",
          helperText: "Placeholder active finished product total.",
          badge: "Active",
          tone: "success",
          icon: "OK",
        },
        {
          label: "Missing recipe",
          value: "5",
          helperText: "Finished products needing recipe structure review.",
          badge: "Review",
          tone: "warning",
          icon: "RC",
        },
        {
          label: "Missing costing",
          value: "7",
          helperText: "Static costing readiness prompts.",
          badge: "Review",
          tone: "warning",
          icon: "$",
        },
        {
          label: "Packaging review",
          value: "3",
          helperText: "Packaging links to confirm before real data import.",
          badge: "To confirm",
          tone: "warning",
          icon: "PK",
        },
      ]}
      tableTitle="Sample finished products"
      tableDescription="Clean Eats-style placeholder finished products for internal screen review only."
      columns={[
        "Finished product",
        "Category",
        "Recipe status",
        "Packaging",
        "Costing status",
        "Production status",
        "Sales/channel status",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={[
        "Recipe status",
        "Costing status",
        "Production status",
        "Sales/channel status",
      ]}
      reviewPrompts={[
        "What exactly should Finished Product include?",
        "Should family meals be handled differently from standard meals?",
        "Which sales/channel status fields are useful before CRM or Shopify integrations?",
      ]}
    />
  );
}
