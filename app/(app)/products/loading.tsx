import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function ProductsLoading() {
  return (
    <RouteLoadingSkeleton
      title="Products"
      description="Loading product workspace"
      badge="Loading product workspace"
      compactRows={3}
    />
  );
}
