import { InventoryWorkspacePage } from "@/components/inventory/inventory-workspace-page";

const columns = [
  "Item",
  "Supplier",
  "Current stock",
  "Suggested reorder",
  "Lead time",
  "Priority",
  "Status",
  "Notes",
];

const rows = [
  {
    Item: "Chicken Thigh",
    Supplier: "Poultry Supplier",
    "Current stock": "42 kg",
    "Suggested reorder": "80 kg",
    "Lead time": "1 day",
    Priority: "High",
    Status: "Review",
    Notes: "Placeholder low-stock prompt only.",
  },
  {
    Item: "Basmati Rice",
    Supplier: "Dry Goods Supplier",
    "Current stock": "120 kg",
    "Suggested reorder": "150 kg",
    "Lead time": "3 days",
    Priority: "Medium",
    Status: "Planned",
    Notes: "Static reorder example.",
  },
  {
    Item: "Meal Trays",
    Supplier: "Packaging Supplier",
    "Current stock": "6,000 units",
    "Suggested reorder": "10,000 units",
    "Lead time": "5 days",
    Priority: "Medium",
    Status: "Review",
    Notes: "Sample packaging purchasing row.",
  },
  {
    Item: "Meal Sleeves",
    Supplier: "Packaging Supplier",
    "Current stock": "1,200 units",
    "Suggested reorder": "8,000 units",
    "Lead time": "5 days",
    Priority: "High",
    Status: "Below reorder",
    Notes: "Demo status only; no reorder logic.",
  },
  {
    Item: "Sauce Containers",
    Supplier: "Packaging Supplier",
    "Current stock": "2,400 units",
    "Suggested reorder": "5,000 units",
    "Lead time": "4 days",
    Priority: "Low",
    Status: "Missing cost",
    Notes: "Sample supplier/cost prompt.",
  },
];

export default function PurchasingPage() {
  return (
    <InventoryWorkspacePage
      title="Purchasing"
      description="Review low stock, supplier ordering needs and upcoming purchase prompts before purchase orders or supplier integrations exist."
      requiredPermission="purchasing.view"
      summaryCards={[
        {
          label: "Items to review",
          value: "9",
          helperText: "Sample stock and supplier review prompts.",
          badge: "Sample",
          tone: "info",
          icon: "RV",
        },
        {
          label: "Below reorder point",
          value: "4",
          helperText: "Placeholder reorder thresholds only.",
          badge: "Review",
          tone: "warning",
          icon: "LO",
        },
        {
          label: "Supplier orders pending",
          value: "3",
          helperText: "Static future purchasing queue example.",
          badge: "Pending",
          tone: "neutral",
          icon: "PO",
        },
        {
          label: "Missing supplier/cost",
          value: "2",
          helperText: "Sample missing supplier or current cost prompts.",
          badge: "Missing",
          tone: "warning",
          icon: "$",
        },
      ]}
      tableTitle="Sample purchase prompts"
      tableDescription="Placeholder purchasing rows for reviewing reorder, lead time and supplier fields. No purchase orders are created."
      columns={columns}
      rows={rows}
      badgeColumns={["Priority", "Status"]}
      reviewPrompts={[
        "Which items should create reorder prompts first: ingredients, packaging or both?",
        "Should purchasing prompts come from stock on hand, production plan demand or both?",
        "What supplier details are needed before purchase orders are designed?",
      ]}
    />
  );
}
