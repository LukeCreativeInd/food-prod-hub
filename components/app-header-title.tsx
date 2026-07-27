"use client";

import { usePathname } from "next/navigation";

import { getPageTitleMeta } from "@/lib/page-title";

type AppHeaderTitleProps = {
  organisationName: string;
  tenantSlug: string;
};

export function AppHeaderTitle({
  organisationName,
  tenantSlug,
}: AppHeaderTitleProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitleMeta(pathname);
  const contextText = pageTitle.context
    ? `${pageTitle.context} · ${organisationName} · ${tenantSlug}`
    : `${organisationName} · ${tenantSlug}`;

  return (
    <div className="min-w-0">
      <h1 className="truncate text-xl font-bold tracking-tight text-[var(--tenant-text)] md:text-2xl">
        {pageTitle.title}
      </h1>
      <p className="mt-1 truncate text-xs font-medium text-[var(--tenant-muted)] md:text-sm">
        {contextText}
      </p>
    </div>
  );
}
