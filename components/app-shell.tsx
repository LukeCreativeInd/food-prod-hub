import type { CSSProperties, ReactNode } from "react";
import { headers } from "next/headers";

import { AppHeaderTitle } from "@/components/app-header-title";
import { AppSidebar, type SidebarWorkspaceLink } from "@/components/app-sidebar";
import { DocumentTitleSync } from "@/components/document-title-sync";
import { GlobalSearch } from "@/components/global-search";
import { HelpSupportMenu } from "@/components/help-support-menu";
import { getAppShellContext } from "@/lib/app-shell-context";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { navigationGroups } from "@/lib/navigation";
import {
  getCurrentUserWorkspaceOptions,
  getWorkspaceDestinationHref,
} from "@/lib/workspace-options";

type AppShellProps = {
  children: ReactNode;
};

function hexToRgba(hex: string, alpha: number) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);

  if (!match) {
    return `rgba(23, 107, 58, ${alpha})`;
  }

  const value = match[1];
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export async function AppShell({ children }: AppShellProps) {
  const navigationTimingStartedAt = Date.now();
  const [
    { permissionKeys, enabledModuleKeys, tenantPresentation },
    workspaceOptions,
    requestHeaders,
  ] = await Promise.all([
    getAppShellContext(),
    getCurrentUserWorkspaceOptions(),
    headers(),
  ]);
  const currentHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
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
  const workspaceLinks: SidebarWorkspaceLink[] = [
    ...workspaceOptions.workspaces.map((workspace) => ({
      label: workspace.workspaceName,
      detail:
        workspace.slug === tenantPresentation.tenantSlug
          ? "Current tenant workspace"
          : "Tenant workspace",
      href: getWorkspaceDestinationHref(
        {
          type: "tenant" as const,
          href: "/dashboard",
          tenantSlug: workspace.slug,
        },
        { currentHost },
      ),
      isCurrent: workspace.slug === tenantPresentation.tenantSlug,
    })),
    ...(workspaceOptions.isPlatformAdmin
      ? [
          {
            label: "EveryBatch Platform Admin",
            detail: "Operator console",
            href: getWorkspaceDestinationHref(
              {
                type: "platform" as const,
                href: "/platform",
              },
              { currentHost },
            ),
            isCurrent: false,
          },
        ]
      : []),
  ];

  const tenantStyle = {
    "--tenant-primary": tenantPresentation.primaryColour,
    "--tenant-accent": tenantPresentation.accentColour,
    "--tenant-success": tenantPresentation.successColour,
    "--tenant-warning": tenantPresentation.warningColour,
    "--tenant-danger": tenantPresentation.dangerColour,
    "--tenant-info": tenantPresentation.infoColour,
    "--tenant-primary-soft": hexToRgba(tenantPresentation.primaryColour, 0.1),
    "--tenant-primary-border": hexToRgba(tenantPresentation.primaryColour, 0.28),
    "--tenant-accent-soft": hexToRgba(tenantPresentation.accentColour, 0.16),
    "--tenant-accent-border": hexToRgba(tenantPresentation.accentColour, 0.34),
    "--tenant-success-bg": hexToRgba(tenantPresentation.successColour, 0.12),
    "--tenant-success-border": hexToRgba(tenantPresentation.successColour, 0.3),
    "--tenant-warning-bg": hexToRgba(tenantPresentation.warningColour, 0.12),
    "--tenant-warning-border": hexToRgba(tenantPresentation.warningColour, 0.3),
    "--tenant-danger-bg": hexToRgba(tenantPresentation.dangerColour, 0.12),
    "--tenant-danger-border": hexToRgba(tenantPresentation.dangerColour, 0.3),
    "--tenant-info-bg": hexToRgba(tenantPresentation.infoColour, 0.12),
    "--tenant-info-border": hexToRgba(tenantPresentation.infoColour, 0.3),
    "--tenant-bg":
      tenantPresentation.themeMode === "dark" ? "#0f1713" : "#f5f7f4",
    "--tenant-surface":
      tenantPresentation.themeMode === "dark" ? "#17211c" : "#ffffff",
    "--tenant-surface-muted":
      tenantPresentation.themeMode === "dark" ? "#111a16" : "#f8fafc",
    "--tenant-border":
      tenantPresentation.themeMode === "dark" ? "#26352d" : "#e2e8f0",
    "--tenant-text":
      tenantPresentation.themeMode === "dark" ? "#f8fafc" : "#0f172a",
    "--tenant-muted":
      tenantPresentation.themeMode === "dark" ? "#a7b3ad" : "#64748b",
  } as CSSProperties;

  return (
    <div
      className="flex min-h-screen flex-col bg-[var(--tenant-bg)] text-[var(--tenant-text)] md:flex-row"
      style={tenantStyle}
      data-tenant-theme={tenantPresentation.themeMode}
    >
      <DocumentTitleSync />
      <AppSidebar
        navigationGroups={visibleNavigationGroups}
        tenant={tenantPresentation}
        workspaceLinks={workspaceLinks}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-[var(--tenant-border)] bg-[var(--tenant-surface)]/95 px-5 py-3 shadow-sm backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <AppHeaderTitle
              organisationName={tenantPresentation.organisationName}
              tenantSlug={tenantPresentation.tenantSlug}
            />

            <div className="flex flex-row items-center gap-2">
              <GlobalSearch />

              <button
                type="button"
                disabled
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--tenant-border)] bg-[var(--tenant-surface)] text-[var(--tenant-muted)] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-80"
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

              <HelpSupportMenu />
            </div>
          </div>
        </header>
        <main className="min-w-0 bg-[var(--tenant-bg)]">{children}</main>
      </div>
    </div>
  );
}
