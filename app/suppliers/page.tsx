import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";

const rows = [
  {
    Supplier: "Fresh Produce Supplier",
    Type: "Produce",
    "Primary contact": "Placeholder contact",
    "Linked items": "12 ingredients",
    Status: "Active",
    Notes: "Sample supplier only",
  },
  {
    Supplier: "Poultry Supplier",
    Type: "Protein",
    "Primary contact": "Placeholder contact",
    "Linked items": "4 ingredients",
    Status: "Active",
    Notes: "Review ordering fields",
  },
  {
    Supplier: "Packaging Supplier",
    Type: "Packaging",
    "Primary contact": "Missing contact",
    "Linked items": "5 packaging items",
    Status: "Review",
    Notes: "Placeholder supplier only",
  },
  {
    Supplier: "Dry Goods Supplier",
    Type: "Dry goods",
    "Primary contact": "Placeholder contact",
    "Linked items": "18 ingredients",
    Status: "Active",
    Notes: "Sample supplier only",
  },
];

export default function SuppliersPage() {
  return (
    <ProductsWorkspacePage
      title="Suppliers"
      description="Supplier records that will later link to ingredients, packaging and purchasing workflows."
      summaryCards={[
        {
          label: "Active suppliers",
          value: "6",
          helperText: "Sample supplier count for review.",
          badge: "Sample",
          tone: "info",
          icon: "SU",
        },
        {
          label: "Ingredients linked",
          value: "34",
          helperText: "Placeholder linked ingredient total.",
          badge: "Linked",
          tone: "success",
          icon: "IN",
        },
        {
          label: "Packaging linked",
          value: "5",
          helperText: "Placeholder packaging supplier links.",
          badge: "Linked",
          tone: "success",
          icon: "PK",
        },
        {
          label: "Missing contacts",
          value: "2",
          helperText: "Sample contact setup prompts.",
          badge: "Review",
          tone: "warning",
          icon: "!",
        },
      ]}
      tableTitle="Sample suppliers"
      tableDescription="Generic supplier records for screen review. These are not real Clean Eats suppliers."
      columns={[
        "Supplier",
        "Type",
        "Primary contact",
        "Linked items",
        "Status",
        "Notes",
      ]}
      rows={rows}
      badgeColumns={["Status"]}
      reviewPrompts={[
        "Which supplier contact fields matter for daily operations?",
        "Should ingredient and packaging suppliers share the same structure?",
        "What supplier notes should be manager-only?",
      ]}
    />
  );
}
