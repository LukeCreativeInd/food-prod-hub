import type { ReactNode } from "react";

type PlatformStatusBadgeTone =
  | "slate"
  | "green"
  | "lime"
  | "amber"
  | "blue";

const badgeTones: Record<PlatformStatusBadgeTone, string> = {
  slate: "border-white/15 bg-white/10 text-slate-100",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  lime: "border-lime-200 bg-lime-50 text-green-900",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
};

export function PlatformStatusBadge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: PlatformStatusBadgeTone;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PlatformSectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function PlatformMetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#0F2E23]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}
