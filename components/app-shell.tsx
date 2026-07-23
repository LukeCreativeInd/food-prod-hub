import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  getCurrentEnabledModuleKeys,
  getCurrentPermissionKeys,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { navigationGroups } from "@/lib/navigation";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const navigationTimingStartedAt = Date.now();
  const [permissionKeys, enabledModuleKeys] = await Promise.all([
    getCurrentPermissionKeys(),
    getCurrentEnabledModuleKeys(),
  ]);
  const permissionSet = new Set(permissionKeys);
  const enabledModuleSet = new Set(enabledModuleKeys);
  const visibleNavigationGroups = navigationGroups
    .filter(
      (group) =>
        (!group.requiredPermission ||
          permissionSet.has(group.requiredPermission)) &&
        (!group.requiredModuleKey ||
          enabledModuleSet.has(group.requiredModuleKey)),
    )
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (!item.requiredPermission ||
            permissionSet.has(item.requiredPermission)) &&
          (!item.requiredModuleKey ||
            enabledModuleSet.has(item.requiredModuleKey)),
      ),
    }))
    .filter((group) => group.isRoot || group.items.length > 0);

  logDevRouteTiming("app-shell.navigation-context", navigationTimingStartedAt, {
    permissionCount: permissionKeys.length,
    enabledModuleCount: enabledModuleKeys.length,
    visibleGroupCount: visibleNavigationGroups.length,
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f4] md:flex-row">
      <AppSidebar navigationGroups={visibleNavigationGroups} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-5 py-3 shadow-sm md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-clean-green-700">
                Clean Eats Australia
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Food manufacturing operations hub
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-80">
                <span className="sr-only">Search</span>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  /
                </span>
                <input
                  type="search"
                  placeholder="Search modules, tasks, products..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-clean-green-600 focus:bg-white focus:ring-2 focus:ring-clean-green-100"
                />
              </label>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-clean-green-800"
                aria-label="Notifications"
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
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-clean-green-700 text-xs font-bold text-white">
                  LM
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    Platform Admin
                  </p>
                  <p className="text-xs text-slate-500">Clean Eats Hub</p>
                </div>
                <div className="block">
                  <LogoutButton variant="light" />
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 bg-[#f5f7f4]">{children}</main>
      </div>
    </div>
  );
}
