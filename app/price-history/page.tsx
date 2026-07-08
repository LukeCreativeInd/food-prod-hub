import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";

const rows = [
  {
    Item: "Chicken Thigh",
    Type: "Ingredient",
    "Previous price": "$8.20/kg",
    "New price": "$8.75/kg",
    Change: "+6.7%",
    "Effective date": "15 Jul 2026",
    Impact: "Meal margin review",
    Status: "Review",
  },
  {
    Item: "Basmati Rice",
    Type: "Ingredient",
    "Previous price": "$2.40/kg",
    "New price": "$2.55/kg",
    Change: "+6.3%",
    "Effective date": "12 Jul 2026",
    Impact: "Low impact",
    Status: "Sample",
  },
  {
    Item: "Meal Sleeve",
    Type: "Packaging",
    "Previous price": "$0.28/each",
    "New price": "$0.31/each",
    Change: "+10.7%",
    "Effective date": "10 Jul 2026",
    Impact: "Packaging review",
    Status: "Review",
  },
  {
    Item: "Napoli Sauce",
    Type: "Component",
    "Previous price": "$3.10/kg",
    "New price": "$3.10/kg",
    Change: "0%",
    "Effective date": "08 Jul 2026",
    Impact: "No change",
    Status: "Ready",
  },
  {
    Item: "Chicken Fajita Bowl",
    Type: "Finished product",
    "Previous price": "$13.00",
    "New price": "$13.50",
    Change: "+3.8%",
    "Effective date": "01 Jul 2026",
    Impact: "Margin review",
    Status: "Sample",
  },
];

export default function PriceHistoryPage() {
  return (
    <CostingsWorkspacePage
      title="Price History"
      description="Cost and price movement history for future supplier, ingredient, packaging and finished product review."
      summaryCards={[
        {
          label: "Recent supplier changes",
          value: "9",
          helperText: "Sample recent supplier price movement count.",
          badge: "Sample",
          tone: "info",
          icon: "SU",
        },
        {
          label: "Ingredient increases",
          value: "5",
          helperText: "Static ingredient increase examples.",
          badge: "Review",
          tone: "warning",
          icon: "IN",
        },
        {
          label: "Packaging increases",
          value: "2",
          helperText: "Sample packaging price changes.",
          badge: "Review",
          tone: "warning",
          icon: "PK",
        },
        {
          label: "Meals needing review",
          value: "4",
          helperText: "Placeholder downstream margin prompts.",
          badge: "Future",
          tone: "neutral",
          icon: "ML",
        },
      ]}
      tableTitle="Sample price movements"
      tableDescription="Static price history examples for staff review. These are not real supplier or costing records."
      columns={[
        "Item",
        "Type",
        "Previous price",
        "New price",
        "Change",
        "Effective date",
        "Impact",
        "Status",
      ]}
      rows={rows}
      badgeColumns={["Status"]}
      reviewPrompts={[
        "Which price changes should trigger a meal costing review?",
        "Should supplier price updates be tracked by effective date or invoice date?",
        "Which users should be able to approve a new cost?",
      ]}
    />
  );
}
