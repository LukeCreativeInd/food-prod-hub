import { StatusBadge } from "@/components/ui/status-badge";

type StatCardTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatCardProps = {
  label: string;
  value: string;
  helperText: string;
  badge?: string;
  tone?: StatCardTone;
};

export function StatCard({
  label,
  value,
  helperText,
  badge,
  tone = "neutral",
}: StatCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {badge ? <StatusBadge tone={tone}>{badge}</StatusBadge> : null}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helperText}</p>
    </article>
  );
}
