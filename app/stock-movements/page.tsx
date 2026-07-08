import { InventoryWorkspacePage } from "@/components/inventory/inventory-workspace-page";

const columns = [
  "Item",
  "Batch/Lot",
  "From",
  "To",
  "Quantity",
  "Reason",
  "Status",
  "Notes",
];

const rows = [
  {
    Item: "Chicken Thigh",
    "Batch/Lot": "CHK-2407-A",
    From: "Cool Room",
    To: "Kitchen Prep",
    Quantity: "18 kg",
    Reason: "Production issue",
    Status: "Ready",
    Notes: "Static movement example.",
  },
  {
    Item: "Basmati Rice",
    "Batch/Lot": "RICE-7782",
    From: "Dry Store",
    To: "Kitchen Prep",
    Quantity: "25 kg",
    Reason: "Batch recipe prep",
    Status: "Awaiting confirmation",
    Notes: "Placeholder confirmation state.",
  },
  {
    Item: "Meal Sleeves",
    "Batch/Lot": "SLEEVE-2190",
    From: "Dry Store",
    To: "Packing Room",
    Quantity: "1,200 units",
    Reason: "Packing issue",
    Status: "Ready",
    Notes: "Sample packaging movement.",
  },
  {
    Item: "Napoli Sauce",
    "Batch/Lot": "SAUCE-0710",
    From: "Pre-Pack Room",
    To: "Packing Room",
    Quantity: "14 kg",
    Reason: "Meal assembly",
    Status: "Review",
    Notes: "Demo issue/waste prompt only.",
  },
];

export default function StockMovementsPage() {
  return (
    <InventoryWorkspacePage
      title="Stock Movements"
      description="Preview how stock could move from receiving and storage into kitchen, packing and production areas."
      summaryCards={[
        {
          label: "Movements today",
          value: "12",
          helperText: "Sample stock movements for staff review.",
          badge: "Sample",
          tone: "info",
          icon: "MV",
        },
        {
          label: "To production",
          value: "8",
          helperText: "Placeholder issues into kitchen and packing areas.",
          badge: "Production",
          tone: "success",
          icon: "PR",
        },
        {
          label: "Awaiting confirmation",
          value: "3",
          helperText: "Static confirmation prompts only.",
          badge: "Check",
          tone: "warning",
          icon: "CK",
        },
        {
          label: "Issues/waste",
          value: "1",
          helperText: "Sample issue and waste movement prompt.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample stock movements"
      tableDescription="Placeholder movement rows for reviewing source, destination, quantity, reason and confirmation fields."
      columns={columns}
      rows={rows}
      badgeColumns={["Reason", "Status"]}
      reviewPrompts={[
        "Which movement types should staff log manually versus automatically from production tasks?",
        "When should movements require supervisor confirmation?",
        "How should waste or issue movements be captured later?",
      ]}
    />
  );
}
