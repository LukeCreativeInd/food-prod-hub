import { ProductionWorkspacePage } from "@/components/production/production-workspace-page";

const rows = [
  {
    Task: "Mix Chicken Fajita chicken",
    Area: "Kitchen",
    "Linked report section": "Sauces / Mixes",
    "Required quantity": "145 kg",
    "Assigned to": "Kitchen team",
    Status: "Ready",
    "Check required": "Supervisor",
    Notes: "Sample task only",
  },
  {
    Task: "Prepare Sweet Potato Mash",
    Area: "Kitchen",
    "Linked report section": "Bulk Raw Ingredients",
    "Required quantity": "96 kg",
    "Assigned to": "Prep team",
    Status: "In progress",
    "Check required": "Weight check",
    Notes: "Yield review required",
  },
  {
    Task: "Portion Napoli Sauce",
    Area: "Pre-Pack Room",
    "Linked report section": "Meal Raw Ingredients",
    "Required quantity": "75 L",
    "Assigned to": "Pre-pack team",
    Status: "Waiting check",
    "Check required": "QA",
    Notes: "Temperature/check preview",
  },
  {
    Task: "Cook Rice Batch",
    Area: "Kitchen",
    "Linked report section": "Bulk Raw Ingredients",
    "Required quantity": "180 kg cooked",
    "Assigned to": "Kitchen team",
    Status: "Ready",
    "Check required": "Supervisor",
    Notes: "Batch traceability later",
  },
  {
    Task: "Pack Burrito Bowls",
    Area: "Packing Room",
    "Linked report section": "Meal Summary",
    "Required quantity": "620 meals",
    "Assigned to": "Packing team",
    Status: "Planned",
    "Check required": "Label check",
    Notes: "Finished product output later",
  },
];

export default function ProductionTasksPage() {
  return (
    <ProductionWorkspacePage
      title="Production Tasks"
      description="Area-based production tasks previewing quantities, assignments, checks and completion status."
      summaryCards={[
        {
          label: "Open tasks",
          value: "24",
          helperText: "Sample open task count.",
          badge: "Demo",
          tone: "info",
          icon: "TK",
        },
        {
          label: "In progress",
          value: "6",
          helperText: "Static in-progress examples.",
          badge: "Active",
          tone: "success",
          icon: "GO",
        },
        {
          label: "Waiting check",
          value: "4",
          helperText: "Placeholder QA/supervisor checks.",
          badge: "Review",
          tone: "warning",
          icon: "QA",
        },
        {
          label: "Completed today",
          value: "18",
          helperText: "Sample completed task count.",
          badge: "Sample",
          tone: "neutral",
          icon: "OK",
        },
      ]}
      tableTitle="Sample production tasks"
      tableDescription="Static task rows only. No task engine, status updates or database writes exist yet."
      columns={[
        "Task",
        "Area",
        "Linked report section",
        "Required quantity",
        "Assigned to",
        "Status",
        "Check required",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Status", "Check required"]}
      reviewPrompts={[
        "Which tasks should be generated from the production report?",
        "What checks are required before a task can be completed?",
        "Which task fields must be simple enough for iPad use?",
      ]}
    />
  );
}
