import { ProductionWorkspacePage } from "@/components/production/production-workspace-page";

const rows = [
  {
    Area: "Kitchen",
    "Current tasks": "8 tasks",
    "Assigned staff": "Kitchen team",
    Status: "Active",
    Notes: "Batch/component prep focus",
  },
  {
    Area: "Pre-Pack Room",
    "Current tasks": "5 tasks",
    "Assigned staff": "Pre-pack team",
    Status: "Ready",
    Notes: "Packaging and label prep",
  },
  {
    Area: "Packing Room",
    "Current tasks": "9 tasks",
    "Assigned staff": "Packing team",
    Status: "Active",
    Notes: "Finished meal pack-out",
  },
  {
    Area: "Meat & Veg Prep",
    "Current tasks": "6 tasks",
    "Assigned staff": "Prep team",
    Status: "Review",
    Notes: "Raw prep and batching",
  },
  {
    Area: "Fridge / Finished Goods",
    "Current tasks": "3 tasks",
    "Assigned staff": "Warehouse",
    Status: "Planned",
    Notes: "Finished product movement preview",
  },
];

export default function ProductionAreasPage() {
  return (
    <ProductionWorkspacePage
      title="Production Areas"
      description="Groups production work by facility area so teams can review where tasks should sit."
      summaryCards={[
        {
          label: "Areas configured",
          value: "5",
          helperText: "Sample production area list.",
          badge: "Sample",
          tone: "info",
          icon: "AR",
        },
        {
          label: "Active areas",
          value: "2",
          helperText: "Static area status examples.",
          badge: "Active",
          tone: "success",
          icon: "OK",
        },
        {
          label: "Tasks allocated",
          value: "31",
          helperText: "Placeholder area task allocation.",
          badge: "Demo",
          tone: "neutral",
          icon: "TK",
        },
        {
          label: "Review needed",
          value: "1",
          helperText: "Sample area needing staff review.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample production areas"
      tableDescription="Area groupings for staff review. No live area configuration is connected."
      columns={["Area", "Current tasks", "Assigned staff", "Status", "Notes"]}
      rows={rows}
      badgeColumns={["Status"]}
      reviewPrompts={[
        "Are these the right production areas for Clean Eats?",
        "Which tasks belong in each area?",
        "Should area visibility differ for managers and floor staff?",
      ]}
    />
  );
}
