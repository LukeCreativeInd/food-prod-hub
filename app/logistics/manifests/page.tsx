import { LogisticsWorkspaceScaffold } from "@/components/logistics/logistics-scaffold-page";

export default function ManifestsPage() {
  return (
    <LogisticsWorkspaceScaffold
      title="Manifests"
      statusLabel="Schema pending"
      summary="Manifests will later preserve reviewed delivery, address, carton and carrier handoff snapshots for dispatch history."
      emptyTitle="No manifest records exist yet"
      emptyDescription="Task 219 does not create manifest schema, generated files, download actions, export history or editable historical records."
      readiness={[
        {
          label: "Manifest schema",
          status: "Task 220",
          tone: "neutral",
          detail: "Manifest headers and lines need reviewed tables before any records exist.",
        },
        {
          label: "Historical snapshots",
          status: "Planned",
          tone: "info",
          detail: "Manifest lines may snapshot address and carton details later for auditability.",
        },
        {
          label: "Generation workflow",
          status: "Task 221",
          tone: "neutral",
          detail: "Manifest creation should remain review-first after schema approval.",
        },
      ]}
      plannedScope={[
        "Generate reviewed manifest records from dispatch runs later.",
        "Snapshot delivery address, instructions, carton count and carrier fields at export time.",
        "Preserve immutable or append-like history where practical.",
        "Feed future dispatch traceability and reports.",
      ]}
      outOfScope={[
        "No fake manifest rows are shown.",
        "No download, export or generate button is enabled.",
        "No Detrack file is created.",
        "No manifest record can be edited because none exists yet.",
      ]}
    />
  );
}
