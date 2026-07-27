import { WorkspaceLoading } from "@/components/workspace-loading";

export default function StockLocationsLoading() {
  return (
    <WorkspaceLoading
      title="Stock Locations"
      message="Loading stock locations"
      detail="Loading stock locations"
      rows={3}
    />
  );
}
