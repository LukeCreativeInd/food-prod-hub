import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  getCurrentEnabledModuleKeys,
  getCurrentPermissionKeys,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { navigationGroups } from "@/lib/navigation";
import { getTenantPresentation } from "@/lib/tenant-presentation";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const navigationTimingStartedAt = Date.now();
  const [permissionKeys, enabledModuleKeys, tenantPresentation] =
    await Promise.all([
      getCurrentPermissionKeys(),
      getCurrentEnabledModuleKeys(),
      getTenantPresentation(),
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

  const tenantStyle = {
    "--tenant-primary": tenantPresentation.primaryColour,
    "--tenant-accent": tenantPresentation.accentColour,
  } as CSSProperties;

  return (
    <div
      className="flex min-h-screen flex-col bg-[#f5f7f4] md:flex-row"
      style={tenantStyle}
    >
      <AppSidebar
        navigationGroups={visibleNavigationGroups}
        tenant={tenantPresentation}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--tenant-primary)]">
                {tenantPresentation.organisationName}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Food manufacturing operations hub ·{" "}
                {tenantPresentation.tenantSlug}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-80">
                <span className="sr-only">Search placeholder</span>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  /
                </span>
                <input
                  type="search"
                  disabled
                  placeholder="Search placeholder"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-500 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
              </label>

              <button
                type="button"
                disabled
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-80"
                aria-label="Notifications placeholder"
                title="Notifications placeholder"
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

              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-green-200 hover:bg-green-50 [&::-webkit-details-marker]:hidden">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white"
                    style={{
                      backgroundColor: tenantPresentation.primaryColour,
                    }}
                  >
                    {tenantPresentation.userInitials}
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate text-sm font-semibold text-slate-950">
                      {tenantPresentation.userName}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {tenantPresentation.userDetail}
                    </span>
                  </span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-slate-400 transition group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Account
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                    {tenantPresentation.userName}
                  </p>
                  <p className="mb-3 truncate text-xs text-slate-500">
                    {tenantPresentation.userDetail}
                  </p>
                  <LogoutButton variant="light" />
                </div>
              </details>
            </div>
          </div>
        </header>
        <main className="min-w-0 bg-[#f5f7f4]">{children}</main>
      </div>
    </div>
  );
}
