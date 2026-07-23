import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function PurchaseDocumentReviewLoading() {
  return (
    <RouteLoadingSkeleton
      title="Review Import"
      description="Preparing source metadata, invoice fields and review lines."
      badge="Loading review"
      stats={3}
      sections={2}
      compactRows={5}
    />
  );
}
