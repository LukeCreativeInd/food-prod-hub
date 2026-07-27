type WorkspaceLoadingProps = {
  title: string;
  message: string;
  detail?: string;
  rows?: number;
};

function LoadingMark() {
  return (
    <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tenant-primary-soft)] ring-1 ring-[color:var(--tenant-primary-border)]">
      <span className="absolute h-14 w-14 animate-ping rounded-full bg-[var(--tenant-primary-soft)]" />
      <span className="absolute h-10 w-10 animate-pulse rounded-full border-2 border-[color:var(--tenant-primary-border)]" />
      <span className="relative h-4 w-4 rounded-full bg-[var(--tenant-primary)] shadow-sm" />
    </span>
  );
}

export function WorkspaceLoading({
  title,
  message,
  detail = "Preparing workspace",
}: WorkspaceLoadingProps) {
  return (
    <div
      className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-10 text-center md:px-8"
      aria-busy="true"
      aria-live="polite"
      aria-label={`${title}: ${message}`}
    >
      <div className="flex max-w-sm flex-col items-center">
        <LoadingMark />
        <p className="mt-5 text-sm font-semibold text-slate-950">{message}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
      </div>
    </div>
  );
}
