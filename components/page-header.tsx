type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8">
      <div className="rounded-lg border border-white bg-white/85 px-5 py-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-clean-green-700">
              Clean Eats Hub
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
          <div className="inline-flex w-fit items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-clean-green-900">
            Platform foundation
          </div>
        </div>
      </div>
    </div>
  );
}
