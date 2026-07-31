import { QAWorkspaceScaffold } from "@/components/qa/qa-scaffold-page";

export default function QATemplatesPage() {
  return (
    <QAWorkspaceScaffold
      title="QA Templates"
      statusLabel="Task 215"
      summary="QA Templates will define the shared tenant-owned check engine used by Receiving, Production and Daily Checks."
      emptyTitle="QA templates have not been configured"
      emptyDescription="No template schema, create-template action, sample template or fake version exists in task 214."
      readiness={[
        {
          label: "Template model",
          status: "Planned",
          tone: "info",
          detail: "One shared template/check engine is approved.",
        },
        {
          label: "Version history",
          status: "Required",
          tone: "info",
          detail: "Completed checks must remain linked to the exact template version used.",
        },
        {
          label: "Special result types",
          status: "Planned",
          tone: "neutral",
          detail: "Temperature should start as a specialised result type in the shared engine.",
        },
      ]}
      sourceNotes={[
        "QA will own templates, versions, sections and items.",
        "Completed checks should reference immutable published versions.",
        "Support Help Centre content is separate from tenant QA template records.",
        "Future checks may reference source module records without duplicating them.",
      ]}
      futureScope={[
        "Tenant-owned templates with sections and items.",
        "Immutable published template versions.",
        "Required items, thresholds and review triggers.",
        "Specialised result types such as temperature and numeric measurements.",
      ]}
      outOfScope={[
        "No template forms, writes or seed data.",
        "No fake template versions or sample Clean Eats QA forms.",
        "No evidence storage or document upload.",
        "No historical check rewrite behaviour.",
      ]}
    />
  );
}
