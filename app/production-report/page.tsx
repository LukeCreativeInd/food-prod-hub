import { ProductionWorkspacePage } from "@/components/production/production-workspace-page";

const rows = [
  {
    "Report section": "Meal Summary",
    Status: "Ready",
    Items: "28 meals",
    "Assigned area": "Production office",
    Notes: "Sample meal demand summary",
  },
  {
    "Report section": "Bulk Raw Ingredients",
    Status: "Review",
    Items: "42 ingredients",
    "Assigned area": "Kitchen",
    Notes: "Future ingredient roll-up",
  },
  {
    "Report section": "Meal Raw Ingredients",
    Status: "Sample",
    Items: "18 meal groups",
    "Assigned area": "Kitchen",
    Notes: "Static demo section",
  },
  {
    "Report section": "Pre-Pack Room",
    Status: "Ready",
    Items: "9 packaging items",
    "Assigned area": "Pre-Pack Room",
    Notes: "Packaging prep preview",
  },
  {
    "Report section": "Meat & Veg Prep",
    Status: "Review",
    Items: "12 prep tasks",
    "Assigned area": "Meat & Veg Prep",
    Notes: "Future prep breakdown",
  },
  {
    "Report section": "Sauces / Mixes",
    Status: "Sample",
    Items: "5 components",
    "Assigned area": "Kitchen",
    Notes: "Component prep preview",
  },
  {
    "Report section": "Production Checks",
    Status: "Future",
    Items: "6 checks",
    "Assigned area": "QA / Supervisor",
    Notes: "QA sign-off preview",
  },
];

export default function ProductionReportPage() {
  return (
    <ProductionWorkspacePage
      title="Production Report"
      description="Preview of the future HUB production report generator that will absorb the current Streamlit CSV workflow over time."
      summaryCards={[
        {
          label: "Shopify orders imported",
          value: "184",
          helperText: "Static order demand example only.",
          badge: "Sample",
          tone: "info",
          icon: "SO",
        },
        {
          label: "Meals required",
          value: "4,820",
          helperText: "Sample meal requirement count.",
          badge: "Demo",
          tone: "neutral",
          icon: "ML",
        },
        {
          label: "Components required",
          value: "16",
          helperText: "Placeholder component prep count.",
          badge: "Review",
          tone: "warning",
          icon: "CP",
        },
        {
          label: "Report sections ready",
          value: "7",
          helperText: "Static sections for production review.",
          badge: "Ready",
          tone: "success",
          icon: "RP",
        },
      ]}
      tableTitle="Sample report sections"
      tableDescription="Current workflow: upload Shopify CSV into Streamlit. Future workflow: Shopify API imports order demand and the HUB generates this report."
      columns={["Report section", "Status", "Items", "Assigned area", "Notes"]}
      rows={rows}
      badgeColumns={["Status"]}
      reviewPrompts={[
        "Which Streamlit report sections must be preserved in the HUB?",
        "Which report sections should feed production tasks automatically?",
        "What must remain printable/exportable for the production floor?",
      ]}
    />
  );
}
