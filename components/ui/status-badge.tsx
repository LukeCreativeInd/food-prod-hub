import clsx from "clsx";

type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  children: string;
  tone?: StatusBadgeTone;
};

const toneStyles: Record<StatusBadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  success:
    "border-[color:var(--tenant-success-border)] bg-[var(--tenant-success-bg)] text-[var(--tenant-success)]",
  warning:
    "border-[color:var(--tenant-warning-border)] bg-[var(--tenant-warning-bg)] text-[var(--tenant-warning)]",
  danger:
    "border-[color:var(--tenant-danger-border)] bg-[var(--tenant-danger-bg)] text-[var(--tenant-danger)]",
  info:
    "border-[color:var(--tenant-info-border)] bg-[var(--tenant-info-bg)] text-[var(--tenant-info)]",
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneStyles[tone],
      )}
    >
      {children}
    </span>
  );
}
