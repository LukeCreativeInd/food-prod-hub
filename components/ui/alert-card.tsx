import { StatusBadge } from "@/components/ui/status-badge";

type AlertCardTone = "neutral" | "success" | "warning" | "danger" | "info";

type AlertCardProps = {
  title: string;
  description: string;
  meta?: string;
  tone?: AlertCardTone;
};

export function AlertCard({
  title,
  description,
  meta,
  tone = "neutral",
}: AlertCardProps) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {meta ? <StatusBadge tone={tone}>{meta}</StatusBadge> : null}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}
