import { StatusBadge } from "@/components/ui/status-badge";

type StatCardTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatCardProps = {
  label: string;
  value: string;
  helperText: string;
  badge?: string;
  tone?: StatCardTone;
  icon?: string;
};

export function StatCard({
  label,
  value,
  helperText,
  badge,
  tone = "neutral",
  icon,
}: StatCardProps) {
  return (
    <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-white/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-lg">
              {icon}
            </span>
          ) : null}
          <p className="text-sm font-medium text-slate-500">{label}</p>
        </div>
        {badge ? <StatusBadge tone={tone}>{badge}</StatusBadge> : null}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helperText}</p>
    </article>
  );
}
