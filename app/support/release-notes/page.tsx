import type { Metadata } from "next";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Release Notes - EveryBatch",
};

const releaseNotes = [
  {
    label: "Production",
    title: "Production Plan UI v1",
    description:
      "Production Plan now uses real planning records. Users can create draft plans, add planned finished product or component output lines and create planned batch headers without reserving or consuming stock.",
  },
  {
    label: "Inventory",
    title: "Supplier invoice to Goods Inwards draft",
    description:
      "Reviewed Supplier Invoice Intake lines can now create draft Goods Inwards receipts. Stock is still updated only after the receipt is reviewed and posted.",
  },
  {
    label: "Inventory",
    title: "Goods Inwards receiving",
    description:
      "Goods Inwards now supports manual draft receipts, receiving lines, receipt posting, inventory lot creation and receipt stock movement ledger rows.",
  },
  {
    label: "Costings",
    title: "Costing snapshots",
    description:
      "Component and finished product detail pages can now create locked manual cost and margin snapshots, with frozen detail pages for later review.",
  },
  {
    label: "Products",
    title: "Finished Product Formula Builder polish",
    description:
      "Finished product formula detail pages now have clearer input-line labels, grouped component/ingredient/packaging inputs, stronger cost and margin blocker guidance, and direct links to sell prices, meal margins and cost review pages.",
  },
  {
    label: "Products",
    title: "Component Formula Builder polish",
    description:
      "Component setup now has clearer real-data readiness, component detail fields, costing links and line-level guidance for missing prices or unit review.",
  },
  {
    label: "Products",
    title: "Finished Product setup polish",
    description:
      "Finished Products now shows clearer real-data readiness for formula, cost, sell price and margin setup, with links into formula, sell price and margin review areas.",
  },
  {
    label: "Support",
    title: "Support inbox search and pagination",
    description:
      "Platform Admin support now has safer pagination, clearer filters and module-context search controls. Customer ticket lists also have lightweight search and filter controls.",
  },
  {
    label: "Support",
    title: "Context-aware support tickets",
    description:
      "The app Help menu can now create support tickets with safe page and module context, helping EveryBatch support understand where an issue was reported.",
  },
  {
    label: "Support",
    title: "Support ticket status workflow",
    description:
      "Support tickets now use clearer waiting-on-support, waiting-on-customer, resolved and closed behaviour across the customer portal and Platform Admin inbox.",
  },
  {
    label: "Support",
    title: "Support tickets and Platform inbox",
    description:
      "Authenticated users can create and review workspace support tickets, while Platform Admin can manage replies, internal notes, assignment and ticket status from the support inbox.",
  },
  {
    label: "Access",
    title: "Login and workspace selector cleanup",
    description:
      "The central login and workspace selector have clearer EveryBatch branding, workspace actions and domain-aware routing.",
  },
  {
    label: "Costings",
    title: "Meal Margins real calculation preview",
    description:
      "Meal margin views now focus on active formula cost readiness and active current sell prices.",
  },
  {
    label: "Costings",
    title: "Sell Price Management",
    description:
      "Finished product sell prices can be managed with clearer draft, active current and archived states.",
  },
  {
    label: "Branding",
    title: "Tenant branding and logo/icon upload",
    description:
      "Workspace branding foundations now support tenant logo and icon presentation in the app shell.",
  },
];

export default function SupportReleaseNotesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="info">User-facing updates</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Release Notes
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          A lightweight summary of recent user-facing EveryBatch changes. This
          page does not publish internal implementation notes or developer
          runbooks.
        </p>
      </section>

      <SectionCard
        title="Recent updates"
        description="Static notes for the current foundation release."
      >
        <div className="space-y-3">
          {releaseNotes.map((note) => (
            <div
              key={note.title}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-950">
                  {note.title}
                </h2>
                <StatusBadge tone="neutral">{note.label}</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {note.description}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
