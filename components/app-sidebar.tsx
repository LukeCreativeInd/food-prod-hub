"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { LogoutButton } from "@/components/auth/logout-button";
import type { NavigationGroup } from "@/lib/navigation";
import {
  PLATFORM_BRAND_NAME,
  PLATFORM_BRAND_TAGLINE,
  PLATFORM_PRODUCT_LINE,
} from "@/lib/platform-brand";
import type { TenantPresentation } from "@/lib/tenant-presentation";

export type SidebarWorkspaceLink = {
  label: string;
  detail: string;
  href: string;
  isCurrent: boolean;
};

type AppSidebarProps = {
  navigationGroups: NavigationGroup[];
  tenant: TenantPresentation;
  workspaceLinks: SidebarWorkspaceLink[];
};

type SidebarIconProps = {
  iconKey: NavigationGroup["iconKey"];
};

const iconPaths: Record<NavigationGroup["iconKey"], string[]> = {
  dashboard: ["M4 13h6V4H4v9Z", "M14 20h6V4h-6v16Z", "M4 20h6v-3H4v3Z"],
  products: ["M4 7h16", "M6 7v13h12V7", "M9 7V5h6v2", "M9 11h6"],
  costings: ["M12 2v20", "M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"],
  production: ["M4 17h16", "M6 17V7h4v10", "M14 17V4h4v13"],
  inventory: ["M4 7h16", "M4 12h16", "M4 17h16", "M7 7v10", "M17 7v10"],
  tools: ["M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5", "M15 5l4 4", "M7 17l-1 1"],
  qa: ["M12 3 20 7v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7l8-4Z", "m9 12 2 2 4-5"],
  logistics: ["M3 7h11v10H3V7Z", "M14 11h4l3 3v3h-7v-6Z", "M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  crm: ["M16 11a4 4 0 1 0-8 0", "M4 21a8 8 0 0 1 16 0", "M19 8v4", "M21 10h-4"],
  reports: ["M5 3h10l4 4v14H5V3Z", "M14 3v5h5", "M8 17h8", "M8 13h8", "M8 9h3"],
  admin: ["M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z", "M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.06-1.8 3.12-.07-.02a1.8 1.8 0 0 0-1.9.48l-.05.05a1.8 1.8 0 0 0-.48 1.9l.02.07h-3.6l.02-.07a1.8 1.8 0 0 0-.48-1.9l-.05-.05a1.8 1.8 0 0 0-1.9-.48l-.07.02-1.8-3.12.04-.06A1.8 1.8 0 0 0 4.6 15H4.5v-3.6h.1a1.8 1.8 0 0 0 1.5-2.74l-.04-.06 1.8-3.12.07.02a1.8 1.8 0 0 0 1.9-.48l.05-.05a1.8 1.8 0 0 0 .48-1.9l-.02-.07h3.6l-.02.07a1.8 1.8 0 0 0 .48 1.9l.05.05a1.8 1.8 0 0 0 1.9.48l.07-.02 1.8 3.12-.04.06A1.8 1.8 0 0 0 19.4 11.4h.1V15h-.1Z"],
};

function SidebarIcon({ iconKey }: SidebarIconProps) {
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
      {iconPaths[iconKey].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function LogoPlaceholderMark() {
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
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="m9 14 2-2 2 2 2-3 2 3" />
      <path d="M9 9h.01" />
    </svg>
  );
}

function EveryBatchMark() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-300 text-sm font-black text-green-950 shadow-sm">
      EB
    </span>
  );
}

function TenantInitialsMark({ tenant }: { tenant: TenantPresentation }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm"
      style={{ backgroundColor: tenant.primaryColour }}
      aria-hidden="true"
    >
      {tenant.initials}
    </span>
  );
}

const sidebarCollapsedStorageKey = "food-prod-hub.sidebar-collapsed";

export function AppSidebar({
  navigationGroups,
  tenant,
  workspaceLinks,
}: AppSidebarProps) {
  const pathname = usePathname();
  const activeGroupLabels = useMemo(
    () =>
      navigationGroups
        .filter(
          (group) =>
            pathname === group.href ||
            pathname.startsWith(`${group.href}/`) ||
            group.items.some(
              (item) =>
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`),
            ),
        )
        .map((group) => group.label),
    [navigationGroups, pathname],
  );
  const activeExpandableGroupLabels = useMemo(
    () =>
      navigationGroups
        .filter((group) => group.items.length > 0)
        .filter((group) => activeGroupLabels.includes(group.label))
        .map((group) => group.label),
    [activeGroupLabels, navigationGroups],
  );
  const [expandedGroups, setExpandedGroups] =
    useState<string[]>(activeExpandableGroupLabels);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(
      window.localStorage.getItem(sidebarCollapsedStorageKey) === "true",
    );
  }, []);

  useEffect(() => {
    setExpandedGroups(activeExpandableGroupLabels);
  }, [activeExpandableGroupLabels]);

  function toggleGroup(label: string) {
    setExpandedGroups((current) =>
      current.includes(label) ? [] : [label],
    );
  }

  function toggleSidebar() {
    setIsCollapsed((current) => {
      const nextValue = !current;
      window.localStorage.setItem(
        sidebarCollapsedStorageKey,
        String(nextValue),
      );
      return nextValue;
    });
  }

  return (
    <aside
      className={clsx(
        "flex w-full shrink-0 flex-col border-b border-slate-200 bg-white text-slate-900 transition-[width] duration-200 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r",
        isCollapsed ? "md:w-20" : "md:w-72",
      )}
    >
      <div
        className={clsx(
          "border-b border-slate-100 px-5 py-5 md:py-6",
          isCollapsed ? "md:px-4" : "md:px-6",
        )}
      >
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 rounded-xl text-slate-950 transition hover:text-[var(--tenant-primary)]",
            isCollapsed && "md:justify-center",
          )}
          title={PLATFORM_BRAND_NAME}
        >
          <EveryBatchMark />
          <span className={clsx("min-w-0", isCollapsed && "md:hidden")}>
            <span className="block text-sm font-black tracking-tight">
              {PLATFORM_BRAND_NAME}
            </span>
            <span className="block truncate text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">
              {PLATFORM_PRODUCT_LINE}
            </span>
          </span>
        </Link>
        <p
          className={clsx(
            "mt-3 text-xs leading-5 text-slate-500",
            isCollapsed && "md:hidden",
          )}
        >
          {PLATFORM_BRAND_TAGLINE}
        </p>

        <div className={clsx("mt-5", isCollapsed ? "md:flex md:justify-center" : "")}>
          {isCollapsed && tenant.iconUrl ? (
            <div
              className="hidden h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white md:flex"
              title={`${tenant.organisationName} icon`}
              aria-label={`${tenant.organisationName} icon`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tenant.iconUrl}
                alt={`${tenant.organisationName} icon`}
                className="max-h-10 max-w-10 object-contain"
              />
            </div>
          ) : isCollapsed ? (
            <div
              className="hidden h-11 w-11 items-center justify-center md:flex"
              title={tenant.organisationName}
              aria-label={tenant.organisationName}
            >
              <TenantInitialsMark tenant={tenant} />
            </div>
          ) : tenant.logoUrl ? (
            <div
              className={clsx(
                "flex items-center",
              )}
              title={`${tenant.organisationName} logo`}
              aria-label={`${tenant.organisationName} logo`}
            >
              <div
                className="flex h-14 w-full shrink-0 items-center justify-start overflow-hidden bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tenant.logoUrl}
                  alt={`${tenant.organisationName} logo`}
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                "flex min-w-0 items-center",
                isCollapsed
                  ? "h-11 w-11 justify-center md:w-11"
                  : "h-11 w-full gap-3",
              )}
              title={tenant.organisationName}
              aria-label={tenant.organisationName}
            >
              {isCollapsed ? (
                <TenantInitialsMark tenant={tenant} />
              ) : (
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[var(--tenant-primary)] ring-1 ring-slate-200"
                  aria-hidden="true"
                >
                  <LogoPlaceholderMark />
                </span>
              )}
              <span
                className={clsx(
                  "min-w-0 text-left",
                  isCollapsed && "md:hidden",
                )}
              >
                <span className="block truncate text-sm font-bold text-slate-950">
                  {tenant.organisationName}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  Tenant workspace
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      <nav
        className={clsx(
          "flex gap-3 overflow-x-auto px-4 py-3 md:block md:flex-1 md:space-y-2 md:overflow-y-auto md:py-5",
          isCollapsed ? "md:px-3" : "md:px-4",
        )}
        aria-label="Primary navigation"
      >
        {navigationGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label);
          const hasChildren = group.items.length > 0;
          const parentHref = group.href;
          const isParentActive =
            pathname === parentHref ||
            pathname.startsWith(`${parentHref}/`) ||
            group.items.some(
              (item) =>
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`),
            );

          return (
            <section key={group.label} className="min-w-max md:min-w-0">
              <div
                className={clsx(
                  "group flex items-center rounded-lg transition",
                  isParentActive
                    ? "bg-[var(--tenant-primary-soft)] text-[var(--tenant-primary)]"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                  isCollapsed && "md:justify-center",
                )}
              >
                <Link
                  href={parentHref}
                  className={clsx(
                    "flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-base font-semibold",
                    isCollapsed && "md:justify-center md:px-2",
                  )}
                  aria-label={group.label}
                  title={group.label}
                >
                  <span
                    className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition",
                      isParentActive
                        ? "border-[color:var(--tenant-primary-border)] bg-white text-[var(--tenant-primary)] shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 group-hover:border-green-200 group-hover:text-clean-green-700",
                    )}
                  >
                    <SidebarIcon iconKey={group.iconKey} />
                  </span>
                  <span className={clsx("truncate", isCollapsed && "md:hidden")}>
                    {group.label}
                  </span>
                </Link>

                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className={clsx(
                      "mr-2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-clean-green-800",
                      isCollapsed && "md:hidden",
                    )}
                    aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.label}`}
                    aria-expanded={isExpanded}
                    title={`${isExpanded ? "Collapse" : "Expand"} ${group.label}`}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className={clsx(
                        "h-4 w-4 transition",
                        isExpanded ? "rotate-90" : "",
                      )}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                ) : null}
              </div>

              {hasChildren && isExpanded ? (
                <div
                  className={clsx(
                    "ml-6 mt-1 space-y-1 border-l border-slate-200 pl-5",
                    isCollapsed && "md:hidden",
                  )}
                >
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-label={item.label}
                        title={item.label}
                        className={clsx(
                          "group flex items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition",
                          isActive
                            ? "bg-[var(--tenant-primary)] text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
                        )}
                      >
                        <span>{item.label}</span>
                        <span
                          className={clsx(
                            "hidden h-1.5 w-1.5 rounded-full md:block",
                            isActive
                              ? "bg-white"
                              : "bg-transparent group-hover:bg-clean-green-600",
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </nav>

      <div
        className={clsx(
          "border-t border-slate-100 px-4 py-4",
          isCollapsed ? "md:px-3" : "md:px-6",
        )}
      >
        <details className="group relative">
          <summary
            className={clsx(
              "flex cursor-pointer list-none items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2.5 shadow-sm transition hover:border-[color:var(--tenant-primary-border)] hover:bg-[var(--tenant-primary-soft)] [&::-webkit-details-marker]:hidden",
              isCollapsed && "md:justify-center md:px-2",
            )}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
              style={{ backgroundColor: tenant.primaryColour }}
            >
              {tenant.userInitials}
            </span>
            <span className={clsx("min-w-0 flex-1", isCollapsed && "md:hidden")}>
              <span className="block truncate text-sm font-bold text-slate-950">
                {tenant.userName}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {tenant.userDetail}
              </span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={clsx(
                "h-4 w-4 text-slate-400 transition group-open:rotate-180",
                isCollapsed && "md:hidden",
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div
            className={clsx(
              "absolute bottom-full left-0 z-40 mb-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15",
              isCollapsed && "md:left-2 md:w-72",
            )}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Account
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-950">
              {tenant.userName}
            </p>
            <p className="truncate text-xs text-slate-500">{tenant.userDetail}</p>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Workspaces
              </p>
              <div className="mt-2 space-y-1">
                {workspaceLinks.map((workspace) => (
                  <Link
                    key={`${workspace.href}-${workspace.label}`}
                    href={workspace.href}
                    className={clsx(
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition",
                      workspace.isCurrent
                        ? "bg-[var(--tenant-primary-soft)] text-[var(--tenant-primary)]"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold">
                        {workspace.label}
                      </span>
                      <span className="block truncate text-xs opacity-75">
                        {workspace.detail}
                      </span>
                    </span>
                    {workspace.isCurrent ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.12em]">
                        Current
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <LogoutButton variant="light" />
            </div>
          </div>
        </details>

        <button
          type="button"
          onClick={toggleSidebar}
          className={clsx(
            "mt-3 flex w-full items-center gap-3 rounded-md px-2 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-50 hover:text-[var(--tenant-primary)]",
            isCollapsed && "md:justify-center",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={clsx("h-4 w-4 transition", isCollapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className={clsx(isCollapsed && "md:hidden")}>
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
      </div>
    </aside>
  );
}
