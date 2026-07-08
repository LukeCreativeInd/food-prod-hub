import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";

const rows = [
  {
    Meal: "Chicken Fajita Bowl",
    Category: "Bowl",
    Components: "Chicken Mix, Rice Batch",
    Packaging: "Meal Tray, Meal Sleeve",
    "Costing status": "Review",
    "Production status": "Sample",
    Status: "Active",
  },
  {
    Meal: "Naked Chicken Parma",
    Category: "Protein meal",
    Components: "Napoli Sauce, Chicken Mix",
    Packaging: "Meal Tray, Label",
    "Costing status": "Missing packaging",
    "Production status": "Draft",
    Status: "Review",
  },
  {
    Meal: "Spaghetti Bolognese",
    Category: "Pasta",
    Components: "Napoli Sauce",
    Packaging: "Meal Tray, Meal Sleeve",
    "Costing status": "Review",
    "Production status": "Sample",
    Status: "Active",
  },
  {
    Meal: "Burrito Bowl",
    Category: "Bowl",
    Components: "Rice Batch, Chunky Salsa",
    Packaging: "Meal Tray",
    "Costing status": "Missing costing",
    "Production status": "Review",
    Status: "Draft",
  },
  {
    Meal: "Shepherd's Pie",
    Category: "Classic meal",
    Components: "Sweet Potato Mash",
    Packaging: "Meal Tray, Label",
    "Costing status": "Review",
    "Production status": "Sample",
    Status: "Active",
  },
];

export default function MealsPage() {
  return (
    <ProductsWorkspacePage
      title="Meals"
      description="Meals and finished products built from ingredients, components and packaging."
      summaryCards={[
        {
          label: "Meals",
          value: "28",
          helperText: "Sample finished product count.",
          badge: "Sample",
          tone: "info",
          icon: "ML",
        },
        {
          label: "Active meals",
          value: "21",
          helperText: "Placeholder active meal total.",
          badge: "Active",
          tone: "success",
          icon: "OK",
        },
        {
          label: "Missing costing",
          value: "7",
          helperText: "Costing prompts before real data import.",
          badge: "Review",
          tone: "warning",
          icon: "$",
        },
        {
          label: "Missing packaging",
          value: "3",
          helperText: "Packaging relationship prompts.",
          badge: "To confirm",
          tone: "warning",
          icon: "PK",
        },
      ]}
      tableTitle="Sample meals"
      tableDescription="Clean Eats-style placeholder meal names for internal screen review only."
      columns={[
        "Meal",
        "Category",
        "Components",
        "Packaging",
        "Costing status",
        "Production status",
        "Status",
      ]}
      rows={rows}
      badgeColumns={["Costing status", "Production status", "Status"]}
      reviewPrompts={[
        "Should the team call these Meals, Products or Finished Meals?",
        "Which meal category fields matter for production and reporting?",
        "Which packaging and costing warnings should appear first?",
      ]}
    />
  );
}
