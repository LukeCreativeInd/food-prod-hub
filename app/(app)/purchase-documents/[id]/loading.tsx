import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function PurchaseDocumentReviewLoading() {
  return (
    <RouteLoadingSkeleton
      title="Review Import"
      description="Loading invoice review"
      badge="Loading invoice review"
      compactRows={3}
    />
  );
}
