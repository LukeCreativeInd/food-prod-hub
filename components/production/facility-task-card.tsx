import { PageActionButton, StatusBadge } from "@/components/ui";

type FacilityTaskCardProps = {
  task: string;
  area: string;
  material: string;
  required: string;
  actual: string;
  checks: string;
  status: string;
};

export function FacilityTaskCard({
  task,
  area,
  material,
  required,
  actual,
  checks,
  status,
}: FacilityTaskCardProps) {
  return (
    <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-white/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-clean-green-700">
            {area}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{task}</h3>
        </div>
        <StatusBadge tone={status === "Ready" ? "success" : "warning"}>
          {status}
        </StatusBadge>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-slate-500">Batch/material</dt>
          <dd className="mt-1 font-semibold text-slate-900">{material}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Required</dt>
          <dd className="mt-1 font-semibold text-slate-900">{required}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Actual placeholder</dt>
          <dd className="mt-1 font-semibold text-slate-900">{actual}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Checks required</dt>
          <dd className="mt-1 font-semibold text-slate-900">{checks}</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <PageActionButton variant="secondary">Start task</PageActionButton>
        <PageActionButton variant="secondary">Complete task</PageActionButton>
      </div>
    </article>
  );
}
