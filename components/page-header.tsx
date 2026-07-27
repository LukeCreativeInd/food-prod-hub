type PageHeaderProps = {
  title: string;
  description: string;
  variant?: "hero" | "compact";
};

export function PageHeader({
  title,
  description,
  variant = "hero",
}: PageHeaderProps) {
  if (variant === "compact") {
    return (
      <div className="px-5 pt-5 md:px-8 md:pt-6">
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-surface)] px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className="max-w-4xl text-sm leading-6 text-[var(--tenant-muted)]">
            {description}
          </p>
          <div className="inline-flex w-fit shrink-0 items-center rounded-full border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--tenant-primary)]">
            {title}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8">
      <div className="rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-surface)] px-5 py-5 shadow-sm ring-1 ring-white/70 backdrop-blur md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--tenant-primary)]">
              Clean Eats Hub
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--tenant-text)]">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--tenant-muted)]">
              {description}
            </p>
          </div>
          <div className="inline-flex w-fit items-center rounded-full border border-[color:var(--tenant-primary-border)] bg-[var(--tenant-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--tenant-primary)]">
            Platform foundation
          </div>
        </div>
      </div>
    </div>
  );
}
