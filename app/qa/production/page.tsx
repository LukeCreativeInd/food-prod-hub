import { QAWorkspaceScaffold } from "@/components/qa/qa-scaffold-page";

export default function ProductionChecksPage() {
  return (
    <QAWorkspaceScaffold
      title="Production Checks"
      statusLabel="Not connected"
      statusTone="neutral"
      summary="Production QA will connect to manufacturing records later. This page is an honest future workspace only."
      emptyTitle="Production QA checks are not connected yet"
      emptyDescription="No production QA records, production check actions or finished-product release controls exist in task 214."
      readiness={[
        {
          label: "Production plans",
          status: "Future link",
          tone: "info",
          detail: "Future checks may reference production plans and plan lines.",
        },
        {
          label: "Production batches",
          status: "Future link",
          tone: "info",
          detail: "Future checks may reference batches, areas and tasks.",
        },
        {
          label: "Output lots",
          status: "Not available",
          tone: "warning",
          detail: "Production output inventory is not implemented yet.",
        },
      ]}
      sourceNotes={[
        "Production owns plans, batches, areas and tasks.",
        "Formulas own formula versions and product structure.",
        "Inventory will own future production stock movements and output lots.",
        "QA will own future production check records and review decisions.",
      ]}
      futureScope={[
        "Production plan and batch checks.",
        "Area readiness and equipment checks.",
        "Formula-version and label verification context.",
        "Future output-lot release once production inventory exists.",
      ]}
      outOfScope={[
        "No production stock consumption is implemented.",
        "No production output inventory is implemented.",
        "No finished-product lot traceability is connected.",
        "No production QA actions or fake production check rows are added.",
      ]}
    />
  );
}
