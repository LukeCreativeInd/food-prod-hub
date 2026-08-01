import { LogisticsWorkspaceScaffold } from "@/components/logistics/logistics-scaffold-page";

export default function DeliveryIssuesPage() {
  return (
    <LogisticsWorkspaceScaffold
      title="Delivery Issues"
      statusLabel="Planned"
      summary="Delivery Issues will later capture outbound exceptions such as failed delivery, damage, missing items, temperature concerns and carrier issues."
      emptyTitle="No delivery issue records exist yet"
      emptyDescription="Task 219 does not create delivery issue schema, issue counts, fake incidents or issue creation workflows."
      readiness={[
        {
          label: "Issue schema",
          status: "Future",
          tone: "neutral",
          detail: "Delivery issue records need reviewed ownership and lifecycle decisions.",
        },
        {
          label: "Support links",
          status: "Future",
          tone: "info",
          detail: "Support tickets remain the customer conversation source and may link to logistics issues later.",
        },
        {
          label: "QA and CRM links",
          status: "Future",
          tone: "neutral",
          detail: "Temperature concerns, customer accounts and orders need explicit source boundaries.",
        },
      ]}
      plannedScope={[
        "Track failed delivery, damage, missing item and carrier exception workflows later.",
        "Link operational delivery issues to Support where customer communication is required.",
        "Connect temperature concerns to QA context when that workflow is reviewed.",
        "Support future delivery issue reporting without duplicating support ticket history.",
      ]}
      outOfScope={[
        "No issue counts or fake incident rows are shown.",
        "No Create Issue action is enabled.",
        "No Support, QA or CRM records are written.",
        "No delivery status import or provider sync is implemented.",
      ]}
    />
  );
}
