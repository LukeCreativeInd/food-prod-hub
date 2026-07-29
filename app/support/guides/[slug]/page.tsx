import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getSupportGuideBySlug,
  getSupportGuideStatusLabel,
  getSupportGuideStatusTone,
  supportGuides,
} from "@/lib/support-guides";

type SupportGuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return supportGuides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: SupportGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSupportGuideBySlug(slug);

  return {
    title: guide ? `${guide.title} - EveryBatch` : "Guide - EveryBatch",
  };
}

export default async function SupportGuidePage({
  params,
}: SupportGuidePageProps) {
  const { slug } = await params;
  const guide = getSupportGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const isAvailable = guide.status === "available";

  return (
    <article className="space-y-6">
      <Link
        href="/support/guides"
        className="inline-flex text-sm font-bold text-green-900 transition hover:text-green-700"
      >
        Back to guides
      </Link>

      <section className="rounded-xl border border-green-950/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={getSupportGuideStatusTone(guide.status)}>
            {getSupportGuideStatusLabel(guide.status)}
          </StatusBadge>
          <StatusBadge tone="info">{guide.categoryTitle}</StatusBadge>
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
          {guide.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {guide.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
          <span>{guide.audience}</span>
          <span aria-hidden="true">/</span>
          <span>{guide.estimatedRead}</span>
        </div>
      </section>

      {isAvailable ? (
        <div className="space-y-4">
          {guide.sections.map((section) => (
            <SectionCard key={section.heading} title={section.heading}>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <SectionCard
          title="Guide coming soon"
          description="This topic is planned for a later support content pass."
        >
          <p className="text-sm leading-6 text-slate-600">
            This card is included so users can see the planned support map, but
            no detailed article content is published for this topic yet.
          </p>
        </SectionCard>
      )}

      {guide.relatedLinks.length > 0 ? (
        <SectionCard title="Related links">
          <div className="grid gap-3 sm:grid-cols-2">
            {guide.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-950 transition hover:border-green-200 hover:bg-green-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </article>
  );
}
