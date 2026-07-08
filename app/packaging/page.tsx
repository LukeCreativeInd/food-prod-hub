import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";

const rows = [
  {
    "Packaging item": "Meal Sleeve",
    Type: "Sleeve",
    Unit: "each",
    Supplier: "Packaging Supplier",
    "Cost status": "Linked",
    "Used by": "Finished meals",
    Status: "Active",
  },
  {
    "Packaging item": "Meal Tray",
    Type: "Tray",
    Unit: "each",
    Supplier: "Packaging Supplier",
    "Cost status": "Linked",
    "Used by": "Finished meals",
    Status: "Active",
  },
  {
    "Packaging item": "Carton",
    Type: "Outer carton",
    Unit: "each",
    Supplier: "Packaging Supplier",
    "Cost status": "Review",
    "Used by": "Dispatch",
    Status: "Review",
  },
  {
    "Packaging item": "Label",
    Type: "Label",
    Unit: "roll",
    Supplier: "Placeholder Supplier",
    "Cost status": "Missing cost",
    "Used by": "QA/pack-out",
    Status: "Draft",
  },
  {
    "Packaging item": "Sauce Container",
    Type: "Container",
    Unit: "each",
    Supplier: "Packaging Supplier",
    "Cost status": "Linked",
    "Used by": "Components",
    Status: "Active",
  },
];

export default function PackagingPage() {
  return (
    <ProductsWorkspacePage
      title="Packaging"
      description="Packaging materials used across finished meals, components and dispatch."
      summaryCards={[
        {
          label: "Packaging items",
          value: "9",
          helperText: "Sample packaging item count.",
          badge: "Sample",
          tone: "info",
          icon: "PK",
        },
        {
          label: "Missing cost",
          value: "2",
          helperText: "Placeholder costing prompts.",
          badge: "Review",
          tone: "warning",
          icon: "$",
        },
        {
          label: "Supplier linked",
          value: "7",
          helperText: "Sample supplier-linked packaging records.",
          badge: "Linked",
          tone: "success",
          icon: "SU",
        },
        {
          label: "Stock relevance",
          value: "5",
          helperText: "Future inventory relevance placeholders.",
          badge: "Future",
          tone: "neutral",
          icon: "ST",
        },
      ]}
      tableTitle="Sample packaging items"
      tableDescription="Placeholder packaging records for layout and field review."
      columns={[
        "Packaging item",
        "Type",
        "Unit",
        "Supplier",
        "Cost status",
        "Used by",
        "Status",
      ]}
      rows={rows}
      badgeColumns={["Cost status", "Status"]}
      reviewPrompts={[
        "Which packaging items need stock tracking first?",
        "Should labels and sleeves have separate QA/compliance fields?",
        "What packaging links are required for meal setup?",
      ]}
    />
  );
}
