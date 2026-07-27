import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function PurchaseDocumentsLoading() {
  return (
    <RouteLoadingSkeleton
      title="Supplier Invoice Intake"
      description="Loading supplier invoice intake"
      badge="Loading supplier invoice intake"
      compactRows={3}
    />
  );
}
