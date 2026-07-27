import { WorkspaceLoading } from "@/components/workspace-loading";

export default function PackagingLoading() {
  return (
    <WorkspaceLoading
      title="Packaging"
      message="Loading packaging records"
      detail="Loading packaging records"
      rows={3}
    />
  );
}
