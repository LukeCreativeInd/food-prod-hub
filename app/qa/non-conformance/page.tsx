import { QAWorkspaceScaffold } from "@/components/qa/qa-scaffold-page";

export default function NonConformancePage() {
  return (
    <QAWorkspaceScaffold
      title="Non-Conformance"
      statusLabel="Deferred"
      statusTone="neutral"
      summary="Non-Conformance will become the future workspace for escalated QA issues after the check/review foundation is in place."
      emptyTitle="No non-conformances have been recorded"
      emptyDescription="No operational Non-Conformance schema, lifecycle, actions or fake issue rows exist in task 214."
      readiness={[
        {
          label: "Schema timing",
          status: "Deferred",
          tone: "neutral",
          detail: "Full operational NC schema is deferred beyond tasks 215-217.",
        },
        {
          label: "Escalation rules",
          status: "Future review",
          tone: "info",
          detail: "Not every failed QA result should become a non-conformance.",
        },
        {
          label: "Source links",
          status: "Planned",
          tone: "info",
          detail: "Future NC records should reference existing source records.",
        },
      ]}
      sourceNotes={[
        "QA will own future non-conformance records.",
        "Goods Inwards, Inventory and Production remain source owners for operational records.",
        "Supplier Invoice Intake owns commercial invoice evidence.",
        "Reports will read NC records later; they do not own them.",
      ]}
      futureScope={[
        "Escalation from failed checks after template rules and review decisions.",
        "Supplier, inventory, production, dispatch and customer complaint source references.",
        "Open, review, contained and closed lifecycle states.",
        "Future links to corrective actions.",
      ]}
      outOfScope={[
        "No NC records, create actions or fake incidents.",
        "No automatic NC creation from failed checks.",
        "No operational NC lifecycle in tasks 215-217.",
        "No support-ticket or supplier master changes.",
      ]}
    />
  );
}
