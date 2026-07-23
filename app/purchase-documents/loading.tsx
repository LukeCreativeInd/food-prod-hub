import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function PurchaseDocumentsLoading() {
  return (
    <RouteLoadingSkeleton
      title="Supplier Invoice Intake"
      description="Preparing supplier invoice upload, review and committed document lists."
      badge="Loading intake"
      stats={5}
      sections={2}
      compactRows={4}
    />
  );
}
