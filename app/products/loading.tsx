import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function ProductsLoading() {
  return (
    <RouteLoadingSkeleton
      title="Products"
      description="Preparing supplier, catalogue, internal item and formula dashboard data."
      badge="Loading products"
      stats={5}
      sections={3}
      compactRows={4}
    />
  );
}
