import { WorkspaceLoading } from "@/components/workspace-loading";

export default function IngredientsLoading() {
  return (
    <WorkspaceLoading
      title="Ingredients"
      message="Loading ingredient records"
      detail="Loading ingredient records"
      rows={3}
    />
  );
}
