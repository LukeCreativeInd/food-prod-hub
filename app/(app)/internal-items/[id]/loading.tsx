import { WorkspaceLoading } from "@/components/workspace-loading";

export default function InternalItemDetailLoading() {
  return (
    <WorkspaceLoading
      title="Internal Item"
      message="Loading internal item"
      detail="Loading internal item"
      rows={3}
    />
  );
}
