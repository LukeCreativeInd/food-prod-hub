import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function InventoryLoading() {
  return (
    <RouteLoadingSkeleton
      title="Inventory"
      description="Preparing inventory workspaces and review cards."
      badge="Loading inventory"
      stats={5}
      sections={3}
      compactRows={4}
    />
  );
}
