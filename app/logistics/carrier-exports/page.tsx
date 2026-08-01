import { LogisticsWorkspaceScaffold } from "@/components/logistics/logistics-scaffold-page";

export default function CarrierExportsPage() {
  return (
    <LogisticsWorkspaceScaffold
      title="Carrier Exports"
      statusLabel="Not connected"
      summary="Carrier Exports will later track reviewed handoffs to generic carrier files and provider-specific destinations such as Detrack."
      emptyTitle="No carrier export records exist yet"
      emptyDescription="Task 219 does not connect Detrack, create carrier files, show export history or display provider connection status."
      readiness={[
        {
          label: "Carrier configuration",
          status: "Future",
          tone: "neutral",
          detail: "Carrier profiles and export settings need reviewed schema and secure handling.",
        },
        {
          label: "Detrack",
          status: "Planned only",
          tone: "info",
          detail: "Detrack is documented as a future export destination, not an active integration.",
        },
        {
          label: "Export history",
          status: "Not available",
          tone: "neutral",
          detail: "Export records should be created only after manifest data exists.",
        },
      ]}
      plannedScope={[
        "Support generic CSV-style carrier exports later.",
        "Support carrier-specific fields and Detrack-oriented export mapping later.",
        "Record export attempts, failures and accepted handoffs after schema review.",
        "Keep provider payloads diagnostic rather than canonical dispatch truth.",
      ]}
      outOfScope={[
        "No connected carrier status is shown.",
        "No carrier logos or provider branding are displayed.",
        "No export files or downloadable artifacts are created.",
        "No service credentials or provider API calls are introduced.",
      ]}
    />
  );
}
