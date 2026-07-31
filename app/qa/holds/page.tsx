import { QAWorkspaceScaffold } from "@/components/qa/qa-scaffold-page";

export default function HoldReleasePage() {
  return (
    <QAWorkspaceScaffold
      title="Hold & Release"
      statusLabel="Task 217"
      summary="Hold & Release is prepared for the approved lot-first inventory control boundary."
      emptyTitle="No active inventory holds"
      emptyDescription="No QA hold schema, hold actions, release actions or fake held lots exist in task 214."
      readiness={[
        {
          label: "Hold target",
          status: "Full lot first",
          tone: "info",
          detail: "Formal holds will initially target full inventory lots only.",
        },
        {
          label: "Hold events",
          status: "Task 215",
          tone: "info",
          detail: "QA hold and append-only hold-event foundation is planned before actions.",
        },
        {
          label: "Availability control",
          status: "Task 217",
          tone: "warning",
          detail: "Task 217 introduces formal availability integration.",
        },
      ]}
      sourceNotes={[
        "QA will own hold records and append-only hold events.",
        "Inventory owns inventory lots and stock movements.",
        "Stock On Hand remains derived.",
        "Historical receipt movements will not be rewritten.",
      ]}
      futureScope={[
        "Full inventory-lot hold placement.",
        "Full inventory-lot release with stronger permission than placement.",
        "Stock On Hand and Inventory Traceability visibility.",
        "Goods Inwards and lot visibility for hold context.",
      ]}
      outOfScope={[
        "No active hold or release buttons.",
        "No receipt-header, partial-quantity, production-batch or finished-output holds.",
        "No `qa_status`, Stock On Hand or stock movement changes.",
        "Stock Adjustment/Reversal implementation remains parked.",
      ]}
    />
  );
}
