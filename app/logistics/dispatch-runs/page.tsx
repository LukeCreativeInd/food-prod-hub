import { LogisticsWorkspaceScaffold } from "@/components/logistics/logistics-scaffold-page";

export default function DispatchRunsPage() {
  return (
    <LogisticsWorkspaceScaffold
      title="Dispatch Runs"
      statusLabel="Planned"
      summary="Dispatch Runs will later group outbound work by delivery date, dispatch type, carrier, service and route planning context."
      emptyTitle="No dispatch run records exist yet"
      emptyDescription="Task 219 does not create dispatch data, filters, run tables, status counts or run creation actions."
      readiness={[
        {
          label: "Dispatch run schema",
          status: "Task 220",
          tone: "neutral",
          detail: "Run headers and lines still need reviewed tenant-owned tables.",
        },
        {
          label: "Residential and wholesale",
          status: "Future filters",
          tone: "info",
          detail: "Residential and wholesale are planned run types or filters, not separate navigation roots.",
        },
        {
          label: "Carrier assignment",
          status: "Future field",
          tone: "neutral",
          detail: "Carrier and service assignment should wait for reviewed dispatch records.",
        },
      ]}
      plannedScope={[
        "Create reviewed dispatch runs by delivery date.",
        "Support dispatch type, carrier, service and zone grouping later.",
        "Reference finished product demand or future order records without duplicating them.",
        "Check future readiness against stock availability, QA holds and production output.",
      ]}
      outOfScope={[
        "No New Dispatch Run action is enabled.",
        "No fake run table or status filters are shown.",
        "No dispatch stock movements are created.",
        "No residential, wholesale or carrier-specific workflow is implemented yet.",
      ]}
    />
  );
}
