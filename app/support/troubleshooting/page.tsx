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
      "Look for missing approved prices, missing formula lines, unit mismatch messages or draft sell prices.",
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
        <Link
          href="/support/guides/sign-in-and-access-troubleshooting"
          className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
        >
          Open sign-in and access troubleshooting
        </Link>
      </SectionCard>
    </div>
  );
}
