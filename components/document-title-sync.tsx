"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getPageTitleMeta } from "@/lib/page-title";
import { PLATFORM_BRAND_NAME } from "@/lib/platform-brand";

export function DocumentTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const pageTitle = getPageTitleMeta(pathname).title;
    document.title =
      pathname === "/" ? PLATFORM_BRAND_NAME : `${pageTitle} - ${PLATFORM_BRAND_NAME}`;
  }, [pathname]);

  return null;
}
