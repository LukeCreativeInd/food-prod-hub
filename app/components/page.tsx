import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";

const rows = [
  {
    Component: "Sweet Potato Mash",
    Type: "Prepared component",
    "Base unit/yield": "kg batch",
    "Linked meals": "4 meals",
    "Cost status": "Review",
    "Production relevance": "Prep area",
    Status: "Sample",
  },
  {
    Component: "Chunky Salsa",
    Type: "Mix",
    "Base unit/yield": "kg batch",
    "Linked meals": "3 meals",
    "Cost status": "Missing yield",
    "Production relevance": "Cold prep",
    Status: "Review",
  },
  {
    Component: "Napoli Sauce",
    Type: "Batch recipe",
    "Base unit/yield": "L batch",
    "Linked meals": "5 meals",
    "Cost status": "Review",
    "Production relevance": "Sauce prep",
    Status: "Sample",
  },
  {
    Component: "Chicken Mix",
    Type: "Prepared mix",
    "Base unit/yield": "kg batch",
    "Linked meals": "6 meals",
    "Cost status": "Linked",
    "Production relevance": "Hot kitchen",
    Status: "Active",
  },
  {
    Component: "Rice Batch",
    Type: "Batch recipe",
    "Base unit/yield": "kg cooked",
    "Linked meals": "8 meals",
    "Cost status": "Missing cost",
    "Production relevance": "Cook line",
    Status: "Draft",
  },
];

export default function ComponentsPage() {
  return (
    <ProductsWorkspacePage
      title="Components"
      description="Batch recipes, mixes and prepared components that later feed into meals."
      summaryCards={[
        {
          label: "Components",
          value: "14",
          helperText: "Sample prepared component count.",
          badge: "Sample",
          tone: "info",
          icon: "CP",
        },
        {
          label: "Linked ingredients",
          value: "38",
          helperText: "Placeholder ingredient relationships.",
          badge: "Future",
          tone: "neutral",
          icon: "IN",
        },
        {
          label: "Used in meals",
          value: "22",
          helperText: "Sample meal relationship prompts.",
          badge: "Linked",
          tone: "success",
          icon: "ML",
        },
        {
          label: "Missing yield/cost",
          value: "6",
          helperText: "Setup prompts before real costing work.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample components"
      tableDescription="Placeholder batch recipes, mixes and prepared components for terminology review."
      columns={[
        "Component",
        "Type",
        "Base unit/yield",
        "Linked meals",
        "Cost status",
        "Production relevance",
        "Status",
      ]}
      rows={rows}
      badgeColumns={["Cost status", "Status"]}
      reviewPrompts={[
        "Should the team call these Components, Batch Recipes, Mixes or something else?",
        "Which yield fields are needed before costing can be trusted?",
        "Which components should link to production areas or task logging?",
      ]}
    />
  );
}
