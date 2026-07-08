"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import type { NavigationGroup } from "@/lib/navigation";

type AppSidebarProps = {
  navigationGroups: NavigationGroup[];
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

export function AppSidebar({ navigationGroups }: AppSidebarProps) {
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
  const [expandedGroups, setExpandedGroups] =
    useState<string[]>(activeGroupLabels);

  useEffect(() => {
    setExpandedGroups((current) =>
      Array.from(new Set([...current, ...activeGroupLabels])),
    );
  }, [activeGroupLabels]);

  function toggleGroup(label: string) {
    setExpandedGroups((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  }

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white text-slate-900 md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="border-b border-slate-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-clean-green-700 text-sm font-bold text-white shadow-sm">
            CE
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-clean-green-700">
              Clean Eats
            </p>
            <h1 className="mt-0.5 text-xl font-bold text-slate-950">Hub</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Operations
            </p>
          </div>
        </div>
      </div>

      <nav className="flex gap-3 overflow-x-auto px-4 py-3 md:block md:flex-1 md:space-y-2 md:overflow-y-auto md:px-4 md:py-5">
        {navigationGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label);
          const hasChildren = group.items.length > 0;
          const parentHref = group.isRoot
            ? group.href
            : group.items[0]?.href ?? group.href;
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
                    ? "bg-green-50 text-clean-green-900"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <Link
                  href={parentHref}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-base font-semibold"
                >
                  <span
                    className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition",
                      isParentActive
                        ? "border-green-200 bg-white text-clean-green-700"
                        : "border-slate-200 bg-white text-slate-500 group-hover:border-green-200 group-hover:text-clean-green-700",
                    )}
                  >
                    <SidebarIcon iconKey={group.iconKey} />
                  </span>
                  <span className="truncate">{group.label}</span>
                </Link>

                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="mr-2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-clean-green-800"
                    aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.label}`}
                    aria-expanded={isExpanded}
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
                <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-5">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                          "group flex items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition",
                          isActive
                            ? "bg-clean-green-700 text-white shadow-sm"
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

      <div className="border-t border-slate-100 px-4 py-4 md:px-6">
        <button
          type="button"
          className="flex w-full items-center gap-3 px-1 py-2 text-sm font-semibold text-slate-500 transition hover:text-clean-green-800"
          aria-label="Sidebar collapse placeholder"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            &lt;
          </span>
          <span>Collapse</span>
        </button>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Modular food operations platform
        </p>
      </div>
    </aside>
  );
}
