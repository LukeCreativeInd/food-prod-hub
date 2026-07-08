import { CostingsWorkspacePage } from "@/components/costings/costings-workspace-page";

const rows = [
  {
    Meal: "Chicken Fajita Bowl",
    Category: "Bowl",
    "Estimated cost": "$5.80",
    "Sell price": "$13.50",
    "Estimated margin": "57%",
    Status: "Sample",
    Notes: "Static demo numbers only",
  },
  {
    Meal: "Naked Chicken Parma",
    Category: "Protein meal",
    "Estimated cost": "$6.90",
    "Sell price": "$14.00",
    "Estimated margin": "51%",
    Status: "Review",
    Notes: "Packaging cost missing",
  },
  {
    Meal: "Spaghetti Bolognese",
    Category: "Pasta",
    "Estimated cost": "$4.95",
    "Sell price": "$12.50",
    "Estimated margin": "60%",
    Status: "Ready",
    Notes: "Sample margin layout",
  },
  {
    Meal: "Burrito Bowl",
    Category: "Bowl",
    "Estimated cost": "$6.40",
    "Sell price": "$13.00",
    "Estimated margin": "51%",
    Status: "Missing inputs",
    Notes: "Component yield required",
  },
  {
    Meal: "Shepherd's Pie",
    Category: "Classic meal",
    "Estimated cost": "$5.75",
    "Sell price": "$12.00",
    "Estimated margin": "52%",
    Status: "Review",
    Notes: "Cost target to confirm",
  },
];

export default function MealMarginsPage() {
  return (
    <CostingsWorkspacePage
      title="Meal Margins"
      description="Estimated meal cost, sell price and margin review once live data exists."
      summaryCards={[
        {
          label: "Meals tracked",
          value: "28",
          helperText: "Sample meals included in demo margin view.",
          badge: "Sample",
          tone: "info",
          icon: "ML",
        },
        {
          label: "Below target margin",
          value: "4",
          helperText: "Static margin alerts for layout review only.",
          badge: "Demo",
          tone: "warning",
          icon: "%",
        },
        {
          label: "Missing cost inputs",
          value: "7",
          helperText: "Placeholder prompts for missing upstream costs.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
        {
          label: "Ready for review",
          value: "17",
          helperText: "Sample count of meals with enough data to review.",
          badge: "Ready",
          tone: "success",
          icon: "OK",
        },
      ]}
      tableTitle="Sample meal margin review"
      tableDescription="Static example numbers only. No real margin calculations are being performed."
      columns={[
        "Meal",
        "Category",
        "Estimated cost",
        "Sell price",
        "Estimated margin",
        "Status",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Status"]}
      reviewPrompts={[
        "What target margin should be shown for review?",
        "Should margin warnings appear by meal, category or customer channel?",
        "Which missing inputs should block a meal from costing review?",
      ]}
    />
  );
}
