import { RouteLoadingSkeleton } from "@/components/route-loading-skeleton";

export default function DashboardLoading() {
  return (
    <RouteLoadingSkeleton
      title="Clean Eats Hub"
      description="Preparing the Phase 1 Demo Workspace."
      badge="Loading dashboard"
      stats={4}
      sections={2}
      compactRows={3}
    />
  );
}
