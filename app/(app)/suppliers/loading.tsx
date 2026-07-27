import { WorkspaceLoading } from "@/components/workspace-loading";

export default function SuppliersLoading() {
  return (
    <WorkspaceLoading
      title="Suppliers"
      message="Loading supplier records"
      detail="Loading supplier records"
      rows={3}
    />
  );
}
