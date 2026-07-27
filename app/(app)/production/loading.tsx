import { WorkspaceLoading } from "@/components/workspace-loading";

export default function ProductionLoading() {
  return (
    <WorkspaceLoading
      title="Production"
      message="Preparing production workspace"
      detail="Preparing production workspace"
      rows={3}
    />
  );
}
