import { QAWorkspaceScaffold } from "@/components/qa/qa-scaffold-page";

export default function DailyChecksPage() {
  return (
    <QAWorkspaceScaffold
      title="Daily Checks"
      statusLabel="Not configured"
      statusTone="neutral"
      summary="Daily Checks will use the shared QA template/check engine planned for task 215."
      emptyTitle="No Daily Check templates have been configured"
      emptyDescription="No recurring schedules, cleaning checks, pre-operational records or tablet flows exist in task 214."
      readiness={[
        {
          label: "Template engine",
          status: "Task 215",
          tone: "info",
          detail: "Daily checks should be categories under the shared QA engine.",
        },
        {
          label: "Recurring schedules",
          status: "Deferred",
          tone: "neutral",
          detail: "Automatic generation is not part of this scaffold.",
        },
        {
          label: "Tablet flow",
          status: "Deferred",
          tone: "neutral",
          detail: "Shared-device completion needs a later identity and workflow design.",
        },
      ]}
      sourceNotes={[
        "QA will own future daily check templates, instances and results.",
        "Production areas may provide context for area readiness checks.",
        "Inventory and Goods Inwards are not changed by daily scaffolds.",
        "Support Help Centre content remains separate from tenant QA records.",
      ]}
      futureScope={[
        "Opening checks and end-of-day checks.",
        "Pre-operational and production-area readiness checks.",
        "Cleaning verification, equipment checks and pest checks.",
        "Future facility/tablet completion after workflow review.",
      ]}
      outOfScope={[
        "No recurrence logic or automatic check generation.",
        "No cleaning records or pre-operational records.",
        "No schedule tables or tablet workflow.",
        "No fake temperature, pest or facility check data.",
      ]}
    />
  );
}
