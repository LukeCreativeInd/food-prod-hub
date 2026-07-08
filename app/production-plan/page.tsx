import { ProductionWorkspacePage } from "@/components/production/production-workspace-page";

const rows = [
  {
    "Production item": "Chicken Fajita Bowl",
    Type: "Finished product",
    "Required quantity": "820 meals",
    Area: "Packing Room",
    Priority: "High",
    Status: "Ready",
    Notes: "Sample demand from report",
  },
  {
    "Production item": "Naked Chicken Parma",
    Type: "Finished product",
    "Required quantity": "640 meals",
    Area: "Packing Room",
    Priority: "High",
    Status: "Review",
    Notes: "Packaging confirmation needed",
  },
  {
    "Production item": "Rice Batch",
    Type: "Component",
    "Required quantity": "180 kg cooked",
    Area: "Kitchen",
    Priority: "Medium",
    Status: "Planned",
    Notes: "Feeds multiple meals",
  },
  {
    "Production item": "Sweet Potato Mash",
    Type: "Component",
    "Required quantity": "96 kg",
    Area: "Kitchen",
    Priority: "Medium",
    Status: "Planned",
    Notes: "Yield to confirm",
  },
  {
    "Production item": "Napoli Sauce",
    Type: "Component",
    "Required quantity": "75 L",
    Area: "Kitchen",
    Priority: "Low",
    Status: "Risk",
    Notes: "Batch timing review",
  },
];

export default function ProductionPlanPage() {
  return (
    <ProductionWorkspacePage
      title="Production Plan"
      description="Shows how generated report demand could turn into a daily or weekly production plan."
      summaryCards={[
        {
          label: "Meals to produce",
          value: "4,820",
          helperText: "Sample finished product demand.",
          badge: "Demo",
          tone: "info",
          icon: "ML",
        },
        {
          label: "Components to prepare",
          value: "16",
          helperText: "Static component prep examples.",
          badge: "Sample",
          tone: "neutral",
          icon: "CP",
        },
        {
          label: "Areas scheduled",
          value: "5",
          helperText: "Kitchen, prep, packing and finished goods areas.",
          badge: "Ready",
          tone: "success",
          icon: "AR",
        },
        {
          label: "Late/risk items",
          value: "3",
          helperText: "Placeholder production risk prompts.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample production plan"
      tableDescription="Static plan rows only. No generated production report or live demand is connected."
      columns={[
        "Production item",
        "Type",
        "Required quantity",
        "Area",
        "Priority",
        "Status",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Priority", "Status"]}
      reviewPrompts={[
        "Should production planning be daily, weekly, or both?",
        "Which areas need schedule visibility before the day starts?",
        "What makes an item late or risky for production?",
      ]}
    />
  );
}
