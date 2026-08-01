import type { Metadata } from "next";
import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "Support Troubleshooting - EveryBatch",
};

const troubleshootingTopics = [
  {
    title: "I can't access my workspace",
    description:
      "Confirm the user is signed in from app.everybatchmrp.com and has an active membership for the expected workspace.",
  },
  {
    title: "I'm on the wrong domain",
    description:
      "Use the central app for workspace selection, the Clean Eats tenant domain for Clean Eats Hub, and the support domain for help content.",
  },
  {
    title: "Margins are blocked",
    description:
      "Look for missing approved prices, missing formula lines, component-cost blockers, purchase-unit conversion messages or draft sell prices. Metric kg/g and l/ml conversions should not block.",
  },
  {
    title: "Costing is blocked by unit conversion",
    description:
      "Check whether the item uses a pack unit such as bunch, box, carton, bottle or tray. Create and activate a reviewed UOM conversion rule before future costing workflows rely on that pack size.",
  },
  {
    title: "A costing snapshot is blocked",
    description:
      "Open the snapshot detail page and review the blocked reason on the header or line. Blocked snapshots intentionally preserve missing prices, unit mismatches or sell price blockers at the time they were created.",
  },
  {
    title: "I can't post a Goods Inwards receipt",
    description:
      "Open the receipt detail page and review the posting preflight. The receipt needs at least one active ready line, no rejected lines, no conversion-required lines and no missing item, location, quantity or unit fields. Posting is transaction-safe, so retrying a failed or already-posted receipt should not create duplicate stock.",
  },
  {
    title: "Goods Inwards cannot post because conversion is required",
    description:
      "Confirm the receipt line unit is not a guessed pack unit. Add a reviewed UOM conversion rule in Products when a known supplier or internal item pack size is needed.",
  },
  {
    title: "A Goods Inwards line is rejected",
    description:
      "Rejected receipt lines block posting in v1. Change the QA status if the stock is acceptable, or cancel the draft line so it does not create stock.",
  },
  {
    title: "I can't start a Receiving QA check",
    description:
      "Receiving QA needs a published active Receiving template and a real Goods Inwards receipt. Users also need QA check create permission.",
  },
  {
    title: "A Receiving QA check needs review",
    description:
      "Failed, warning or review-triggering checklist results can mark a check for QA review. A reviewer can record a decision, and a separate formal hold action is available when a posted inventory lot exists.",
  },
  {
    title: "A failed Receiving QA check did not automatically hold stock",
    description:
      "That is expected. Receiving QA can recommend a hold, but a user with QA hold permission must place the formal full-lot hold before Stock On Hand treats the lot as held.",
  },
  {
    title: "I can't place a QA hold",
    description:
      "Formal holds need a posted inventory lot, no existing open hold on that lot and qa.holds.place permission. Draft receipt lines cannot be formally held until posting creates the inventory lot.",
  },
  {
    title: "Released stock is not visible as available",
    description:
      "Open the QA hold detail and confirm the hold status is Released. Stock On Hand derives availability from posted movements minus active/release-requested formal holds, so released holds should restore availability without a new movement.",
  },
  {
    title: "A posted Goods Inwards receipt is locked",
    description:
      "Posted receipts created lot and stock movement ledger records. They are read-only; future corrections should use adjustment or reversal workflows.",
  },
  {
    title: "Stock quantity looks wrong",
    description:
      "Open Stock On Hand and compare the row to Stock Movements. Current stock is calculated from posted, non-archived stock movement ledger rows, not from supplier invoices or manual edits.",
  },
  {
    title: "Item shows mixed units",
    description:
      "Mixed units are intentionally flagged and not silently converted. Review the item, supplier pack size and UOM conversion rules before relying on a single total.",
  },
  {
    title: "Held stock is not counted as available",
    description:
      "Stock tied to on-hold or QA hold lots is shown separately. Held stock is physical stock, but it should not be treated as available for production or dispatch.",
  },
  {
    title: "I can't find a lot in Inventory Traceability",
    description:
      "Inventory Traceability is built from inventory lots. Confirm the Goods Inwards receipt has been posted and created an inventory lot and stock movement ledger row.",
  },
  {
    title: "Traceability stops at receiving",
    description:
      "That is expected in v1. The current trace map covers inbound supplier evidence, receiving, lots, movements and Stock On Hand. Production usage, dispatch and recall paths are future workflows.",
  },
  {
    title: "Invoice evidence is missing from a trace card",
    description:
      "The stock may have been received manually, or your role may not expose Purchase Document details. Open the Goods Inwards receipt to confirm whether the receipt was linked to a supplier invoice.",
  },
  {
    title: "Stock On Hand and Traceability show different context",
    description:
      "Stock On Hand groups posted movement balances by item, location, lot and unit. Inventory Traceability starts from the lot and shows source evidence, receiving and movement context around that same stock.",
  },
  {
    title: "Duplicate active conversion rule",
    description:
      "Only one active open-ended UOM conversion rule is allowed for the same scope and unit pair. Deactivate, archive or end-date the current active rule before activating a replacement.",
  },
  {
    title: "I can't create a Goods Inwards draft from an invoice",
    description:
      "Check that invoice lines are committed or mapped to internal stock items, have positive quantities and units, and that you selected an active stock location. Informational, non-stock and already-sent lines are skipped.",
  },
  {
    title: "A Production Plan line is blocked",
    description:
      "Check whether the selected finished product or component has an active formula. Production Plan v1 can capture the line, but it marks missing formula setup as blocked for review.",
  },
  {
    title: "No Production Areas are available",
    description:
      "Production areas are optional in Production Plan v1. You can leave the area blank until the workspace has active production area records.",
  },
  {
    title: "Invoice upload has unknown lines",
    description:
      "Review the line source text, supplier item, classification and internal item mapping before committing.",
  },
  {
    title: "Support page redirects to login",
    description:
      "Support is authenticated. Sign in from the central app, then return to support.everybatchmrp.com.",
  },
  {
    title: "I can't create a support ticket",
    description:
      "Check that you are signed in and have an active workspace membership. Tickets must be linked to a valid workspace.",
  },
  {
    title: "Support needs more page context",
    description:
      "Use Report an issue on this page from the app Help menu so the ticket includes safe page and module context.",
  },
  {
    title: "I can't see a ticket",
    description:
      "Confirm the ticket belongs to the selected workspace. Customer users only see customer-visible support tickets for their own workspace.",
  },
  {
    title: "Ticket filters hide a request",
    description:
      "Clear status, category or search filters on the ticket list, then check the selected workspace again.",
  },
  {
    title: "A support reply is missing",
    description:
      "Customer pages show customer-visible replies and timeline events only. Internal operator notes are kept in Platform Admin and are not shown to customer users.",
  },
  {
    title: "What does waiting on support mean?",
    description:
      "EveryBatch support needs to review or respond. New tickets and customer replies usually move into this state.",
  },
  {
    title: "What does waiting on customer mean?",
    description:
      "EveryBatch has replied and may be waiting for your input or confirmation.",
  },
  {
    title: "I need to reply to a closed ticket",
    description:
      "Closed tickets do not accept new customer comments in v1. Create a new ticket if you need more help.",
  },
  {
    title: "The wrong workspace is selected",
    description:
      "Use Change workspace on the tickets page, or return to the central workspace selector if you need a different EveryBatch area.",
  },
  {
    title: "Changes are not visible after login",
    description:
      "Sign out and sign in again after membership, role or domain-session changes are made.",
  },
];

export default function SupportTroubleshootingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <StatusBadge tone="info">Common checks</StatusBadge>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          Support Troubleshooting
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Practical first checks for access, upload, costing and routing issues.
          This page keeps guidance user-facing and does not expose internal
          developer notes.
        </p>
      </section>

      <SectionCard
        title="Common issue checks"
        description="Use these before raising a support request."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {troubleshootingTopics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <h2 className="text-sm font-bold text-slate-950">
                {topic.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Access guide"
        description="For login, workspace and permissions issues, start with the dedicated access guide."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/support/guides/sign-in-and-access-troubleshooting"
            className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Open sign-in and access troubleshooting
          </Link>
          <Link
            href="/support/tickets/new"
            className="inline-flex items-center justify-center rounded-md border border-green-200 bg-white px-4 py-2 text-sm font-bold text-green-900 transition hover:bg-green-50"
          >
            Open a support ticket
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
