import { QAWorkspaceScaffold } from "@/components/qa/qa-scaffold-page";

export default function ReceivingChecksPage() {
  return (
    <QAWorkspaceScaffold
      title="Receiving Checks"
      statusLabel="Task 216"
      summary="Receiving Checks will become the first operational QA workflow after task 215 creates the template/check foundation."
      emptyTitle="No Receiving Checks have been created"
      emptyDescription="No Receiving Check schema exists yet, and no operational checks can be created from this scaffold."
      readiness={[
        {
          label: "Goods Inwards link",
          status: "Planned",
          tone: "info",
          detail: "Future checks may start from a receipt or receipt line.",
        },
        {
          label: "Review decisions",
          status: "Planned",
          tone: "info",
          detail: "Task 216 may capture accept, conditional accept, reject or hold recommendation decisions.",
        },
        {
          label: "Availability control",
          status: "Not active",
          tone: "warning",
          detail: "Formal inventory availability control begins only in task 217.",
        },
      ]}
      sourceNotes={[
        "Goods Inwards owns receipts and receipt-line records.",
        "Supplier Invoice Intake owns invoice and commercial evidence.",
        "Inventory owns lots and stock movements.",
        "QA will own future check instances, results, reviews and recommendations.",
      ]}
      futureScope={[
        "Display supplier, item, lot, expiry and receiving context.",
        "Capture observations, measurements and draft/completed checks.",
        "Support QA review decisions and hold recommendations.",
        "Keep completed checks linked to receiving source evidence.",
      ]}
      outOfScope={[
        "No create button, check form or review action is included.",
        "No availability changes occur here.",
        "No formal inventory hold exists before task 217.",
        "No Goods Inwards posting or RPC behaviour changes.",
      ]}
    />
  );
}
