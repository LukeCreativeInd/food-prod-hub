import type { Metadata } from "next";
import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getSupportGuideStatusLabel,
  getSupportGuideStatusTone,
  popularSupportGuides,
  supportGuideCategories,
  supportQuickLinks,
} from "@/lib/support-guides";

export const metadata: Metadata = {
  title: "Support - EveryBatch",
};

const featuredCategories = supportGuideCategories.filter(
  (category) => category.guides.length > 0,
);

export default function SupportHomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">Authenticated</StatusBadge>
          <StatusBadge tone="info">Guides scaffold</StatusBadge>
          <StatusBadge tone="warning">Tickets coming soon</StatusBadge>
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
          EveryBatch Help Centre
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Guides, troubleshooting and support for your food manufacturing hub.
          Support stays authenticated, with static user-facing guides available
          now and ticket workflows planned for a later release.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {supportQuickLinks.map((link) => (
          <Link
            key={link.href}
            href={`/support${link.href}`}
            className="rounded-lg border border-green-950/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
          >
            <h2 className="text-sm font-black text-slate-950">{link.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {link.description}
            </p>
          </Link>
        ))}
      </div>

      <SectionCard title="Popular guides" description="Quick routes into the guide content most users need first.">
        <div className="grid gap-3 sm:grid-cols-2">
          {popularSupportGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/support/guides/${guide.slug}`}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-950">
                  {guide.title}
                </h3>
                <StatusBadge tone={getSupportGuideStatusTone(guide.status)}>
                  {getSupportGuideStatusLabel(guide.status)}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {guide.summary}
              </p>
              <p className="mt-3 text-xs font-bold text-green-800">
                {guide.estimatedRead}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/support/guides"
            className="text-sm font-bold text-green-900 transition hover:text-green-700"
          >
            Browse all guides
          </Link>
        </div>
      </SectionCard>

      <SectionCard
        title="Help topics"
        description="Available static guides and planned guide areas for authenticated EveryBatch users."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {featuredCategories.map((category) => (
            <Link
              key={category.key}
              href="/support/guides"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50"
            >
              <h3 className="text-sm font-bold text-slate-950">
                {category.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {category.description}
              </p>
              <p className="mt-3 text-xs font-bold uppercase text-slate-400">
                {category.guides.length} topics
              </p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Need help?" description="Support intake is scaffolded while ticket persistence is planned.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/support/contact"
            className="inline-flex items-center justify-center rounded-md bg-green-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Contact support
          </Link>
          <Link
            href="/support/tickets"
            className="inline-flex items-center justify-center rounded-md border border-green-200 bg-white px-4 py-2 text-sm font-bold text-green-900 transition hover:bg-green-50"
          >
            View ticket scaffold
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
