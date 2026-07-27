import { WorkspaceLoading } from "@/components/workspace-loading";

type RouteLoadingSkeletonProps = {
  title: string;
  description: string;
  badge?: string;
  compactRows?: number;
  sections?: number;
  stats?: number;
};

export function RouteLoadingSkeleton({
  title,
  description,
  badge = "Preparing workspace",
  compactRows = 3,
}: RouteLoadingSkeletonProps) {
  return (
    <WorkspaceLoading
      title={title}
      message={badge}
      detail={description}
      rows={compactRows}
    />
  );
}
