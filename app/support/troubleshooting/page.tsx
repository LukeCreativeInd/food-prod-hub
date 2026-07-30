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
    title: "A costing snapshot is blocked",
    description:
      "Open the snapshot detail page and review the blocked reason on the header or line. Blocked snapshots intentionally preserve missing prices, unit mismatches or sell price blockers at the time they were created.",
  },
  {
    title: "I can't post a Goods Inwards receipt",
    description:
      "Check that the receipt has at least one active line, no rejected lines and no lines marked conversion required or blocked. Unknown pack conversions such as bunch to grams need future UOM rules before posting.",
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
