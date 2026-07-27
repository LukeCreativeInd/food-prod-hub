import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function InventoryLoading() {
  return (
    <RouteLoadingSkeleton
      title="Inventory"
      description="Loading inventory workspace"
      badge="Loading inventory workspace"
      compactRows={3}
    />
  );
}
