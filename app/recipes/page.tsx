import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";

const rows = [
  {
    Recipe: "Chicken Fajita Bowl Recipe",
    "Finished product": "Chicken Fajita Bowl",
    Components: "Chicken Mix, Rice Batch",
    "Direct ingredients": "Capsicum, Onion",
    Packaging: "Meal Tray, Meal Sleeve",
    Status: "Review",
    Notes: "Sample recipe structure",
  },
  {
    Recipe: "Naked Chicken Parma Recipe",
    "Finished product": "Naked Chicken Parma",
    Components: "Napoli Sauce, Chicken Mix",
    "Direct ingredients": "Cheese, Herbs",
    Packaging: "Meal Tray, Label",
    Status: "Missing packaging",
    Notes: "Packaging link to confirm",
  },
  {
    Recipe: "Spaghetti Bolognese Recipe",
    "Finished product": "Spaghetti Bolognese",
    Components: "Napoli Sauce",
    "Direct ingredients": "Pasta, Parmesan",
    Packaging: "Meal Tray, Meal Sleeve",
    Status: "Sample",
    Notes: "Static demo recipe",
  },
  {
    Recipe: "Burrito Bowl Recipe",
    "Finished product": "Burrito Bowl",
    Components: "Rice Batch, Chunky Salsa",
    "Direct ingredients": "Beans, Corn",
    Packaging: "Meal Tray",
    Status: "Missing components",
    Notes: "Component list to review",
  },
  {
    Recipe: "Shepherd's Pie Recipe",
    "Finished product": "Shepherd's Pie",
    Components: "Sweet Potato Mash",
    "Direct ingredients": "Beef Mix, Peas",
    Packaging: "Meal Tray, Label",
    Status: "Review",
    Notes: "Finished product recipe placeholder",
  },
];

export default function RecipesPage() {
  return (
    <ProductsWorkspacePage
      title="Recipes"
      description="Recipe structures define what goes into a finished product and how components, ingredients and packaging link together."
      summaryCards={[
        {
          label: "Recipes drafted",
          value: "18",
          helperText: "Sample recipe structures for staff review.",
          badge: "Sample",
          tone: "info",
          icon: "RC",
        },
        {
          label: "Missing components",
          value: "4",
          helperText: "Placeholder prompts for missing component links.",
          badge: "Review",
          tone: "warning",
          icon: "CP",
        },
        {
          label: "Missing packaging",
          value: "3",
          helperText: "Packaging relationships to confirm before costing.",
          badge: "To confirm",
          tone: "warning",
          icon: "PK",
        },
        {
          label: "Review required",
          value: "7",
          helperText: "Recipes needing terminology and structure review.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample recipes"
      tableDescription="Placeholder recipe structures for staff review. No real recipes or BOM logic are connected."
      columns={[
        "Recipe",
        "Finished product",
        "Components",
        "Direct ingredients",
        "Packaging",
        "Status",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Status"]}
      reviewPrompts={[
        "Should recipe structures include both components and direct ingredients?",
        "Should packaging be part of the recipe or only the finished product?",
        "What is the right terminology: Recipes, Items, BOMs or something else?",
      ]}
    />
  );
}
