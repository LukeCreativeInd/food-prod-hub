import { WorkspaceLoading } from "@/components/workspace-loading";

export default function SupplierDetailLoading() {
  return (
    <WorkspaceLoading
      title="Supplier"
      message="Loading supplier detail"
      detail="Loading supplier detail"
      rows={3}
    />
  );
}
