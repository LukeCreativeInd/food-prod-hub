import Link from "next/link";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  eyebrow?: string;
};

export function ModuleCard({
  title,
  description,
  href,
  eyebrow,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-white/60 transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase text-clean-green-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-2 flex items-start justify-between gap-3">
        <h4 className="text-base font-semibold text-slate-950">{title}</h4>
        <span className="text-sm font-semibold text-clean-green-700 transition group-hover:translate-x-0.5">
          -&gt;
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}
