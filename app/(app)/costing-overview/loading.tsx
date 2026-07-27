import { WorkspaceLoading } from "@/components/workspace-loading";

export default function CostingOverviewLoading() {
  return (
    <WorkspaceLoading
      title="Costings"
      message="Loading costing summary"
      detail="Loading costing summary"
      rows={3}
    />
  );
}
