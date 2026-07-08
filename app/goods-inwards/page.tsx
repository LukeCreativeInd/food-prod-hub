import { InventoryWorkspacePage } from "@/components/inventory/inventory-workspace-page";

const columns = [
  "Supplier",
  "Delivery/ref",
  "Items expected",
  "Arrival date",
  "Status",
  "Receiving check",
  "Notes",
];

const rows = [
  {
    Supplier: "Poultry Supplier",
    "Delivery/ref": "POUL-10084",
    "Items expected": "Chicken thigh, diced chicken",
    "Arrival date": "Today 7:30am",
    Status: "Awaiting check",
    "Receiving check": "Temperature required",
    Notes: "Sample chilled delivery for review.",
  },
  {
    Supplier: "Fresh Produce Supplier",
    "Delivery/ref": "PROD-4421",
    "Items expected": "Sweet potato, capsicum, onion",
    "Arrival date": "Today 8:15am",
    Status: "Received",
    "Receiving check": "Visual check complete",
    Notes: "Placeholder produce receiving row.",
  },
  {
    Supplier: "Dry Goods Supplier",
    "Delivery/ref": "DRY-7782",
    "Items expected": "Basmati rice, spices",
    "Arrival date": "Tomorrow",
    Status: "Due",
    "Receiving check": "Count on arrival",
    Notes: "Static expected delivery example.",
  },
  {
    Supplier: "Packaging Supplier",
    "Delivery/ref": "PACK-2190",
    "Items expected": "Meal trays, sleeves, sauce cups",
    "Arrival date": "Today 11:00am",
    Status: "Issue flagged",
    "Receiving check": "Quantity mismatch",
    Notes: "Demo issue only; no real supplier data.",
  },
];

export default function GoodsInwardsPage() {
  return (
    <InventoryWorkspacePage
      title="Goods Inwards"
      description="Manage incoming supplier deliveries and receiving checks before stock is batched, located and made available to production."
      summaryCards={[
        {
          label: "Deliveries due",
          value: "6",
          helperText: "Sample supplier deliveries expected today/tomorrow.",
          badge: "Sample",
          tone: "info",
          icon: "DU",
        },
        {
          label: "Awaiting check",
          value: "3",
          helperText: "Placeholder deliveries needing receiving checks.",
          badge: "Check",
          tone: "warning",
          icon: "CK",
        },
        {
          label: "Received today",
          value: "4",
          helperText: "Static count only; no live receiving data.",
          badge: "Received",
          tone: "success",
          icon: "RC",
        },
        {
          label: "Issues flagged",
          value: "1",
          helperText: "Sample mismatch or quality issue prompt.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample supplier deliveries"
      tableDescription="Placeholder delivery rows for staff review. No real receiving logic or database queries are connected."
      columns={columns}
      rows={rows}
      badgeColumns={["Status", "Receiving check"]}
      reviewPrompts={[
        "Which receiving checks are mandatory for chilled, frozen, dry and packaging deliveries?",
        "What supplier reference fields matter most: invoice, delivery note, purchase order or all three?",
        "When should a received delivery become a batch/lot record?",
      ]}
    />
  );
}
