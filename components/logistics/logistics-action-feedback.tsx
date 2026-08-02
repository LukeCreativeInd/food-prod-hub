import type { LogisticsActionFeedback as LogisticsActionFeedbackValue } from "@/lib/logistics-action-messages";

const toneClassNames: Record<LogisticsActionFeedbackValue["tone"], string> = {
  success:
    "border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] text-[var(--tenant-primary)]",
  warning:
    "border-[color:var(--tenant-warning-border)] bg-[var(--tenant-warning-bg)] text-slate-700",
  error:
    "border-[color:var(--tenant-danger-border)] bg-[var(--tenant-danger-bg)] text-[var(--tenant-danger)]",
};

export function LogisticsActionFeedback({
  feedback,
}: {
  feedback: LogisticsActionFeedbackValue | null;
}) {
  if (!feedback) return null;

  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm font-semibold ${toneClassNames[feedback.tone]}`}
      role={feedback.tone === "error" ? "alert" : "status"}
    >
      {feedback.message}
    </div>
  );
}
