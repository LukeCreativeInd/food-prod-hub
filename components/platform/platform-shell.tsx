"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { LogoutButton } from "@/components/auth/logout-button";
import { DocumentTitleSync } from "@/components/document-title-sync";
import { PlatformMobileMenu } from "@/components/platform/platform-mobile-menu";
import {
  PLATFORM_ADMIN_DOMAIN,
  PLATFORM_BRAND_NAME,
  PLATFORM_OPERATOR_CONSOLE_LABEL,
  PLATFORM_PRODUCT_LINE,
} from "@/lib/platform-brand";
import { getPageTitleMeta } from "@/lib/page-title";

type PlatformShellProps = {
  children: ReactNode;
};

type PlatformNavItem = {
  label: string;
  href?: string;
  status?: "live" | "soon";
};

type PlatformNavGroup = {
  label: string;
  iconKey: PlatformIconKey;
  items: PlatformNavItem[];
};

type PlatformIconKey =
  | "overview"
  | "tenants"
  | "platform"
  | "operations"
  | "commercial"
  | "users";

const platformNavigation: PlatformNavGroup[] = [
  {
    label: "Overview",
    iconKey: "overview",
    items: [{ label: "Platform Overview", href: "/platform", status: "live" }],
  },
  {
    label: "Tenants",
    iconKey: "tenants",
    items: [
      {
        label: "Clean Eats Detail",
        href: "/platform/tenants/cleaneats",
        status: "live",
      },
      { label: "All Tenants", href: "/platform/tenants", status: "live" },
      { label: "New Tenant", href: "/platform/tenants/new", status: "live" },
      {
        label: "Tenant Provisioning",
        href: "/platform/tenants/provisioning",
        status: "live",
      },
      {
        label: "First Admin / Invites",
        href: "/platform/tenants/first-admin",
        status: "live",
      },
      {
        label: "Tenant Onboarding",
        href: "/platform/tenants/onboarding",
        status: "live",
      },
      {
        label: "Clean Eats Modules",
        href: "/platform/tenants/cleaneats/modules",
        status: "live",
      },
      {
        label: "Clean Eats Feature Flags",
        href: "/platform/tenants/cleaneats/features",
        status: "live",
      },
    ],
  },
  {
    label: "Platform",
    iconKey: "platform",
    items: [
      { label: "Platform Settings", status: "soon" },
      { label: "Platform Branding", status: "soon" },
      { label: "Domains", status: "soon" },
      { label: "Module Registry", status: "soon" },
      { label: "Feature Registry", status: "soon" },
      { label: "Releases / Updates", status: "soon" },
    ],
  },
  {
    label: "Operations",
    iconKey: "operations",
    items: [
      { label: "Support", status: "soon" },
      { label: "Audit Logs", status: "soon" },
      { label: "System Health", status: "soon" },
      { label: "Smoke Tests", status: "soon" },
    ],
  },
  {
    label: "Commercial",
    iconKey: "commercial",
    items: [
      { label: "Plans", status: "soon" },
      { label: "Billing", status: "soon" },
      { label: "Invoices", status: "soon" },
    ],
  },
  {
    label: "Users",
    iconKey: "users",
    items: [
      { label: "Platform Users", status: "soon" },
      { label: "Tenant Admins", status: "soon" },
    ],
  },
];

const platformIconPaths: Record<PlatformIconKey, string[]> = {
  overview: ["M4 13h6V4H4v9Z", "M14 20h6V4h-6v16Z", "M4 20h6v-3H4v3Z"],
  tenants: [
    "M16 11a4 4 0 1 0-8 0",
    "M4 21a8 8 0 0 1 16 0",
    "M18 8h3",
    "M19.5 6.5v3",
  ],
  platform: [
    "M12 3 20 7v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7l8-4Z",
    "M9 12l2 2 4-5",
  ],
  operations: ["M4 17h16", "M6 17V7h4v10", "M14 17V4h4v13"],
  commercial: [
    "M12 2v20",
    "M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6",
  ],
  users: [
    "M16 11a4 4 0 1 0-8 0",
    "M4 21a8 8 0 0 1 16 0",
    "M19 8v4",
    "M21 10h-4",
  ],
};

function PlatformIcon({ iconKey }: { iconKey: PlatformIconKey }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {platformIconPaths[iconKey].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function PlatformMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-200/40 bg-[#8CC63F] text-sm font-black text-[#0F2E23] shadow-lg shadow-black/20">
      EB
    </div>
  );
}

function isRouteMatch(pathname: string, href?: string) {
  if (!href) {
    return false;
  }

  return (
    pathname === href || (href !== "/platform" && pathname.startsWith(`${href}/`))
  );
}

function getActivePlatformHref(pathname: string) {
  return (
    platformNavigation
      .flatMap((group) => group.items)
      .filter((item) => isRouteMatch(pathname, item.href))
      .sort((first, second) => {
        const firstLength = first.href?.length ?? 0;
        const secondLength = second.href?.length ?? 0;

        return secondLength - firstLength;
      })[0]?.href ?? null
  );
}

function PlatformNavItem({
  item,
  group,
  activeHref,
  isCollapsed = false,
  onNavigate,
}: {
  item: PlatformNavItem;
  group: PlatformNavGroup;
  activeHref: string | null;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const isActive = item.href === activeHref;

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={clsx(
          "group flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition",
          isActive
            ? "border-lime-200/35 bg-lime-200/15 text-white shadow-sm"
            : "border-transparent text-emerald-50 hover:border-white/10 hover:bg-white/10 hover:text-white",
          isCollapsed && "justify-center px-2",
        )}
        aria-current={isActive ? "page" : undefined}
        title={item.label}
      >
        <span
          className={clsx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition",
            isActive
              ? "border-lime-200/45 bg-[#8CC63F] text-[#0F2E23]"
              : "border-white/10 bg-white/5 text-lime-100 group-hover:border-lime-200/25 group-hover:bg-white/10",
          )}
        >
          <PlatformIcon iconKey={group.iconKey} />
        </span>
        <span
          className={clsx(
            "min-w-0 flex-1 truncate",
            isCollapsed && "hidden",
          )}
        >
          {item.label}
        </span>
        {item.status === "live" && !isCollapsed ? (
          <span className="rounded-full border border-lime-200/20 bg-lime-200/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-lime-100">
            Live
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div
      className={clsx(
        "flex cursor-not-allowed items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-emerald-100/35",
        isCollapsed && "justify-center px-2",
      )}
      title={item.label}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-emerald-100/35">
        <PlatformIcon iconKey={group.iconKey} />
      </span>
      <span
        className={clsx("min-w-0 flex-1 truncate", isCollapsed && "hidden")}
      >
        {item.label}
      </span>
      {!isCollapsed ? (
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-emerald-100/45">
          Soon
        </span>
      ) : null}
    </div>
  );
}

export function PlatformNavigation({
  isCollapsed = false,
  onExpandSidebar,
  onNavigate,
}: {
  isCollapsed?: boolean;
  onExpandSidebar?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = useMemo(() => getActivePlatformHref(pathname), [pathname]);
  const activeGroupLabel = useMemo(() => {
    const activeGroup = platformNavigation.find((group) =>
      group.items.some((item) => item.href === activeHref),
    );

    return activeGroup?.label === "Overview"
      ? null
      : activeGroup?.label ?? null;
  }, [activeHref]);
  const [expandedGroupLabel, setExpandedGroupLabel] = useState<string | null>(
    activeGroupLabel,
  );

  useEffect(() => {
    setExpandedGroupLabel(activeGroupLabel);
  }, [activeGroupLabel]);

  function toggleGroup(label: string) {
    if (isCollapsed) {
      onExpandSidebar?.();
      setExpandedGroupLabel(label);
      return;
    }

    setExpandedGroupLabel((current) => (current === label ? null : label));
  }

  return (
    <nav
      className={clsx("space-y-4", isCollapsed ? "px-2" : "lg:px-3")}
      aria-label="Platform navigation"
    >
      {platformNavigation.map((section) => {
        const isOverview = section.label === "Overview";
        const isGroupActive = section.items.some((item) =>
          item.href === activeHref,
        );
        const isExpanded = expandedGroupLabel === section.label;

        if (isOverview) {
          const overviewItem = section.items[0];

          if (!overviewItem) {
            return null;
          }

          return (
            <section key={section.label}>
              <PlatformNavItem
                item={overviewItem}
                group={section}
                activeHref={activeHref}
                isCollapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            </section>
          );
        }

        return (
          <section key={section.label}>
            <button
              type="button"
              onClick={() => toggleGroup(section.label)}
              className={clsx(
                "group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-bold transition",
                isGroupActive || isExpanded
                  ? "border-lime-200/25 bg-lime-200/10 text-white"
                  : "border-transparent text-emerald-50 hover:border-white/10 hover:bg-white/10",
                isCollapsed && "justify-center px-2",
              )}
              aria-expanded={isExpanded}
              title={section.label}
            >
              <span
                className={clsx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition",
                  isGroupActive || isExpanded
                    ? "border-lime-200/45 bg-[#8CC63F] text-[#0F2E23]"
                    : "border-white/10 bg-white/5 text-lime-100 group-hover:border-lime-200/25 group-hover:bg-white/10",
                )}
              >
                <PlatformIcon iconKey={section.iconKey} />
              </span>
              <span
                className={clsx(
                  "min-w-0 flex-1 truncate text-left",
                  isCollapsed && "hidden",
                )}
              >
                {section.label}
              </span>
              {!isCollapsed ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={clsx(
                    "h-4 w-4 shrink-0 text-lime-100/70 transition",
                    isExpanded ? "rotate-90" : "",
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              ) : null}
            </button>

            {isExpanded && !isCollapsed ? (
              <div className="mt-1 space-y-1 border-l border-white/10 pl-3">
                {section.items.map((item) => (
                  <PlatformNavItem
                    key={item.label}
                    item={item}
                    group={section}
                    activeHref={activeHref}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </nav>
  );
}

export function PlatformShell({ children }: PlatformShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const pageTitleMeta = getPageTitleMeta(pathname);

  return (
    <div
      className={clsx(
        "min-h-screen bg-[#F2F4F7] text-[#1F2937] lg:grid",
        isCollapsed ? "lg:grid-cols-[5.5rem_1fr]" : "lg:grid-cols-[18rem_1fr]",
      )}
    >
      <DocumentTitleSync />
      <aside className="border-b border-[#174231] bg-[#0F2E23] text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div
          className={clsx(
            "flex items-center justify-between gap-4 px-5 py-4",
            isCollapsed ? "lg:justify-center lg:px-3" : "lg:block",
          )}
        >
          <Link
            href="/platform"
            className={clsx(
              "flex items-center gap-3",
              isCollapsed && "lg:justify-center",
            )}
            title="EveryBatch Platform Admin"
          >
            <PlatformMark />
            <span className={clsx(isCollapsed && "lg:hidden")}>
              <span className="block text-sm font-black tracking-tight">
                {PLATFORM_BRAND_NAME}
              </span>
              <span className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-lime-200">
                {PLATFORM_PRODUCT_LINE}
              </span>
              <span className="mt-1 inline-flex rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-50">
                Platform Admin
              </span>
            </span>
          </Link>
          <Link
            href="/select-workspace"
            className="inline-flex rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-emerald-50 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            Switch
          </Link>
        </div>

        <PlatformMobileMenu>
          {(onNavigate) => <PlatformNavigation onNavigate={onNavigate} />}
        </PlatformMobileMenu>

        <div className="hidden pb-5 lg:flex lg:h-[calc(100vh-5.5rem)] lg:flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <PlatformNavigation
              isCollapsed={isCollapsed}
              onExpandSidebar={() => setIsCollapsed(false)}
            />
          </div>
          <div
            className={clsx(
              "border-t border-white/10 pt-4",
              isCollapsed ? "px-2" : "px-4",
            )}
          >
            <button
              type="button"
              onClick={() => setIsCollapsed((current) => !current)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-emerald-50 transition hover:bg-white/10",
                isCollapsed && "justify-center px-2",
              )}
              aria-label={
                isCollapsed
                  ? "Expand platform sidebar"
                  : "Collapse platform sidebar"
              }
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition",
                  isCollapsed ? "rotate-180" : "",
                )}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </span>
              <span className={clsx(isCollapsed && "hidden")}>
                Collapse sidebar
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#176B3D]">
                {PLATFORM_OPERATOR_CONSOLE_LABEL}
              </p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-[#0F2E23]">
                {pageTitleMeta.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-green-900">
                Transitional /platform
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Future: {PLATFORM_ADMIN_DOMAIN}
              </span>
              <Link
                href="/select-workspace"
                className="inline-flex items-center justify-center rounded-md border border-[#176B3D]/25 bg-white px-3 py-2 text-xs font-bold text-[#176B3D] shadow-sm transition hover:bg-[#E8F5E9]"
              >
                Switch workspace
              </Link>
              <LogoutButton variant="light" />
            </div>
          </div>
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
