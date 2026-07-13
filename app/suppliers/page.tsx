import { ProductsWorkspacePage } from "@/components/products/products-workspace-page";
import { getSupplierDirectoryData } from "@/lib/products-data";

export default async function SuppliersPage() {
  const suppliers = await getSupplierDirectoryData();
  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "active",
  ).length;
  const linkedItems = suppliers.reduce(
    (total, supplier) => total + supplier.supplierItemCount,
    0,
  );
  const currentPrices = suppliers.reduce(
    (total, supplier) => total + supplier.currentPriceCount,
    0,
  );

  return (
    <ProductsWorkspacePage
      title="Suppliers"
      description="Read-only supplier records created through reviewed Purchase Document Intake commits."
      summaryCards={[
        {
          label: "Active suppliers",
          value: String(activeSuppliers),
          helperText: "Live tenant suppliers visible to users with supplier price access.",
          badge: "Live",
          tone: "success",
          icon: "SU",
        },
        {
          label: "Supplier items",
          value: String(linkedItems),
          helperText: "Supplier-facing catalogue items created from reviewed invoices.",
          badge: "Read only",
          tone: "info",
          icon: "IT",
        },
        {
          label: "Current prices",
          value: String(currentPrices),
          helperText: "Approved current supplier prices linked to supplier items.",
          badge: "Approved",
          tone: "success",
          icon: "$",
        },
        {
          label: "Documents",
          value: String(
            suppliers.reduce(
              (total, supplier) => total + supplier.documentCount,
              0,
            ),
          ),
          helperText: "Committed or uploaded purchase documents linked to suppliers.",
          badge: "Source",
          tone: "neutral",
          icon: "PD",
        },
      ]}
      tableTitle="Supplier directory"
      tableDescription="Tenant-scoped suppliers from Purchase Document Intake. This view does not edit supplier master data."
      columns={[
        "Supplier",
        "Legal name",
        "ABN",
        "Type",
        "Aliases",
        "Items",
        "Current prices",
        "Documents",
        "Status",
      ]}
      rows={suppliers.map((supplier) => ({
        Supplier: supplier.displayName,
        "Legal name": supplier.legalName ?? "Not recorded",
        ABN: supplier.abn ?? "Not recorded",
        Type: supplier.supplierType ?? "Not recorded",
        Aliases: String(supplier.aliasCount),
        Items: String(supplier.supplierItemCount),
        "Current prices": String(supplier.currentPriceCount),
        Documents: String(supplier.documentCount),
        Status: supplier.status,
      }))}
      badgeColumns={["Status"]}
      dataBadge="Live read-only"
      dataNoticeTitle="Read-only supplier intake data"
      dataNoticeDescription="These records come from reviewed Purchase Document Intake commits. Supplier editing, purchasing workflows and supplier contact management remain future work."
      emptyMessage="No suppliers have been committed from Purchase Document Intake yet."
      reviewPrompts={[
        "Which supplier fields are required before supplier editing is added?",
        "Should aliases and ABNs be visible to operations users or admin users only?",
        "Which supplier records should be reviewed before purchasing workflows begin?",
      ]}
    />
  );
}
