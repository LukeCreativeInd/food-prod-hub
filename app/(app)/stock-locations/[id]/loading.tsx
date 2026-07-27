import { WorkspaceLoading } from "@/components/workspace-loading";

export default function StockLocationDetailLoading() {
  return (
    <WorkspaceLoading
      title="Stock Location"
      message="Loading stock location"
      detail="Loading stock location"
      rows={3}
    />
  );
}
