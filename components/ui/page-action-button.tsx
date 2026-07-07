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
    "bg-clean-green-700 text-white shadow-sm hover:bg-clean-green-900 focus-visible:outline-clean-green-700",
  secondary:
    "border border-green-200 bg-white text-clean-green-900 hover:bg-green-50 focus-visible:outline-clean-green-700",
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
