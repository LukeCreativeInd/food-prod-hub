type ActivityItemProps = {
  title: string;
  description: string;
  meta: string;
};

export function ActivityItem({ title, description, meta }: ActivityItemProps) {
  return (
    <article className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-clean-green-600" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="text-xs font-medium text-slate-400">{meta}</p>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </article>
  );
}
