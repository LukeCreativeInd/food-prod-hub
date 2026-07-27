import Link from "next/link";
import clsx from "clsx";

type PageActionButtonVariant = "primary" | "secondary";

type PageActionButtonProps = {
  children: string;
  href?: string;
  variant?: PageActionButtonVariant;
};

const variantStyles: Record<PageActionButtonVariant, string> = {
  primary:
    "bg-[var(--tenant-primary)] text-white shadow-sm hover:brightness-90 focus-visible:outline-[var(--tenant-primary)]",
  secondary:
    "border border-[color:var(--tenant-primary-border)] bg-white text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary-soft)] focus-visible:outline-[var(--tenant-primary)]",
};

export function PageActionButton({
  children,
  href,
  variant = "primary",
}: PageActionButtonProps) {
  const className = clsx(
    "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variantStyles[variant],
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {children}
    </button>
  );
}
