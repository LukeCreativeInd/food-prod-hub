import { InventoryWorkspacePage } from "@/components/inventory/inventory-workspace-page";

const columns = [
  "Location",
  "Type",
  "Area",
  "Items held",
  "Capacity/status",
  "Notes",
];

const rows = [
  {
    Location: "Dry Store",
    Type: "Dry",
    Area: "Warehouse",
    "Items held": "Rice, spices, packaging",
    "Capacity/status": "Review",
    Notes: "Sample dry storage location.",
  },
  {
    Location: "Cool Room",
    Type: "Chilled",
    Area: "Receiving",
    "Items held": "Chicken, fresh produce",
    "Capacity/status": "Active",
    Notes: "Placeholder chilled storage row.",
  },
  {
    Location: "Freezer",
    Type: "Frozen",
    Area: "Warehouse",
    "Items held": "Frozen proteins, backup stock",
    "Capacity/status": "Active",
    Notes: "Static freezer location example.",
  },
  {
    Location: "Kitchen Prep",
    Type: "Production",
    Area: "Kitchen",
    "Items held": "Issued ingredients",
    "Capacity/status": "In use",
    Notes: "Future production issue destination.",
  },
  {
    Location: "Pre-Pack Room",
    Type: "Production",
    Area: "Packing",
    "Items held": "Sauces, mixes, components",
    "Capacity/status": "Review",
    Notes: "Sample component staging area.",
  },
  {
    Location: "Finished Goods Fridge",
    Type: "Chilled",
    Area: "Dispatch",
    "Items held": "Finished meals",
    "Capacity/status": "Active",
    Notes: "Future finished product storage location.",
  },
];

export default function StockLocationsPage() {
  return (
    <InventoryWorkspacePage
      title="Stock Locations"
      description="Preview where stock is stored across the facility, from receiving and warehouse storage through to production and finished goods."
      summaryCards={[
        {
          label: "Locations",
          value: "6",
          helperText: "Sample storage and production locations.",
          badge: "Sample",
          tone: "info",
          icon: "LC",
        },
        {
          label: "Chilled locations",
          value: "2",
          helperText: "Cool Room and Finished Goods Fridge examples.",
          badge: "Chilled",
          tone: "success",
          icon: "CH",
        },
        {
          label: "Dry locations",
          value: "1",
          helperText: "Dry Store sample location.",
          badge: "Dry",
          tone: "neutral",
          icon: "DR",
        },
        {
          label: "Production areas",
          value: "2",
          helperText: "Kitchen Prep and Pre-Pack Room examples.",
          badge: "Area",
          tone: "warning",
          icon: "PR",
        },
      ]}
      tableTitle="Sample facility locations"
      tableDescription="Static location rows for reviewing how storage, production and dispatch areas should be represented."
      columns={columns}
      rows={rows}
      badgeColumns={["Type", "Capacity/status"]}
      reviewPrompts={[
        "Which locations should be selectable during receiving?",
        "Which locations are storage-only and which are production-use areas?",
        "Do finished products need separate location tracking from raw materials?",
      ]}
    />
  );
}
