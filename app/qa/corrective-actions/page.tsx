import { QAWorkspaceScaffold } from "@/components/qa/qa-scaffold-page";

export default function CorrectiveActionsPage() {
  return (
    <QAWorkspaceScaffold
      title="Corrective Actions"
      statusLabel="Deferred"
      statusTone="neutral"
      summary="Corrective Actions will later track responses to non-conformances and preventive improvement work."
      emptyTitle="No corrective actions are open"
      emptyDescription="No operational Corrective Action schema, assignments, due dates or fake tasks exist in task 214."
      readiness={[
        {
          label: "Schema timing",
          status: "Deferred",
          tone: "neutral",
          detail: "Full operational CA schema is deferred beyond tasks 215-217.",
        },
        {
          label: "NC relationship",
          status: "Future link",
          tone: "info",
          detail: "Corrective actions will usually link to non-conformances.",
        },
        {
          label: "Preventive actions",
          status: "Later",
          tone: "neutral",
          detail: "Standalone preventive actions may be supported after NC basics.",
        },
      ]}
      sourceNotes={[
        "QA will own future corrective-action records.",
        "Future actions should reference NCs and source operational context.",
        "Support tickets remain support records, not tenant QA action records.",
        "Audit Logs may later record business events for CA workflow changes.",
      ]}
      futureScope={[
        "Immediate correction and longer-term action tracking.",
        "Owner, priority, due date and verification states.",
        "Closure approval and overdue visibility.",
        "Links to future NC records and audit events.",
      ]}
      outOfScope={[
        "No corrective-action records, assignments or due dates.",
        "No full CAPA workflow in tasks 215-217.",
        "No fake open tasks or completion percentages.",
        "No notification or escalation engine.",
      ]}
    />
  );
}
