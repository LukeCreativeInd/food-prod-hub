import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function DashboardLoading() {
  return (
    <RouteLoadingSkeleton
      title="Clean Eats Hub"
      description="Preparing dashboard"
      badge="Preparing dashboard"
      compactRows={2}
    />
  );
}
