import { WorkspaceLoading } from "@/components/workspace-loading";

export default function OrganisationSettingsLoading() {
  return (
    <WorkspaceLoading
      title="Organisation Settings"
      message="Loading organisation settings"
      detail="Loading organisation settings"
      rows={2}
    />
  );
}
