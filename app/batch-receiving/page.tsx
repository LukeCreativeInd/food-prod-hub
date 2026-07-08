import { InventoryWorkspacePage } from "@/components/inventory/inventory-workspace-page";

const columns = [
  "Item",
  "Supplier",
  "Batch/Lot",
  "Received date",
  "Expiry/use-by",
  "Quantity received",
  "Storage location",
  "Status",
];

const rows = [
  {
    Item: "Chicken Thigh",
    Supplier: "Poultry Supplier",
    "Batch/Lot": "CHK-2407-A",
    "Received date": "Today",
    "Expiry/use-by": "Use by 12 Jul",
    "Quantity received": "42 kg",
    "Storage location": "Cool Room",
    Status: "Ready",
  },
  {
    Item: "Basmati Rice",
    Supplier: "Dry Goods Supplier",
    "Batch/Lot": "RICE-7782",
    "Received date": "Yesterday",
    "Expiry/use-by": "Best before 2027",
    "Quantity received": "120 kg",
    "Storage location": "Dry Store",
    Status: "Ready",
  },
  {
    Item: "Sweet Potato",
    Supplier: "Fresh Produce Supplier",
    "Batch/Lot": "SP-4421",
    "Received date": "Today",
    "Expiry/use-by": "Review date needed",
    "Quantity received": "85 kg",
    "Storage location": "Cool Room",
    Status: "Review",
  },
  {
    Item: "Meal Tray",
    Supplier: "Packaging Supplier",
    "Batch/Lot": "TRAY-2190",
    "Received date": "Today",
    "Expiry/use-by": "Not applicable",
    "Quantity received": "6,000 units",
    "Storage location": "Dry Store",
    Status: "Ready",
  },
  {
    Item: "Napoli Sauce",
    Supplier: "Internal Prep",
    "Batch/Lot": "SAUCE-0710",
    "Received date": "Today",
    "Expiry/use-by": "Use by 10 Jul",
    "Quantity received": "38 kg",
    "Storage location": "Pre-Pack Room",
    Status: "QA hold",
  },
];

export default function BatchReceivingPage() {
  return (
    <InventoryWorkspacePage
      title="Batch Receiving"
      description="Preview how supplier batches, received dates, expiry/use-by dates and storage locations could be captured before stock is used."
      summaryCards={[
        {
          label: "Batches logged",
          value: "18",
          helperText: "Static batch/lot examples for staff review.",
          badge: "Sample",
          tone: "info",
          icon: "BT",
        },
        {
          label: "Expiry required",
          value: "5",
          helperText: "Placeholder rows needing expiry/use-by capture.",
          badge: "Review",
          tone: "warning",
          icon: "EX",
        },
        {
          label: "Missing location",
          value: "2",
          helperText: "Sample location assignment prompts.",
          badge: "Missing",
          tone: "warning",
          icon: "LC",
        },
        {
          label: "QA hold",
          value: "1",
          helperText: "Static example only; no QA hold logic exists.",
          badge: "Hold",
          tone: "danger",
          icon: "QA",
        },
      ]}
      tableTitle="Sample received batches"
      tableDescription="Placeholder batch rows for reviewing lot, date, quantity and storage fields."
      columns={columns}
      rows={rows}
      badgeColumns={["Status", "Expiry/use-by"]}
      reviewPrompts={[
        "Which inventory items require expiry/use-by dates and which do not?",
        "Should internal prepped components also create batch records?",
        "What happens when a supplier batch is put on QA hold?",
      ]}
    />
  );
}
