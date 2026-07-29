import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  PLATFORM_APP_DOMAIN,
  PLATFORM_BRAND_CATEGORY,
  PLATFORM_BRAND_NAME,
  PLATFORM_BRAND_TAGLINE,
  PLATFORM_PRIMARY_DOMAIN,
  PLATFORM_SUPPORT_DOMAIN,
} from "@/lib/platform-brand";
import { parseEveryBatchHost } from "@/lib/tenant-resolver";
import {
  getWorkspaceDestinationHref,
  type WorkspaceOptionsResult,
} from "@/lib/workspace-options";

type SupportShellProps = {
  children: ReactNode;
  currentHost: string | null;
  workspaceOptions: WorkspaceOptionsResult;
};

const supportNavItems = [
  { label: "Home", href: "/" },
  { label: "Guides", href: "/guides" },
  { label: "Tickets", href: "/tickets" },
  { label: "Contact", href: "/contact" },
];

function getSupportHref(path: string, isSupportHost: boolean) {
  if (isSupportHost) {
    return path;
  }

  return path === "/" ? "/support" : `/support${path}`;
}

function getCentralSelectorHref(currentHost: string | null) {
  const mode = currentHost ? parseEveryBatchHost(currentHost).mode : "unknown";

  if (mode === "local_dev") {
    return "/select-workspace";
  }

  return `https://${PLATFORM_APP_DOMAIN}/select-workspace`;
}

function getWorkspaceLinks({
  currentHost,
  workspaceOptions,
}: Pick<SupportShellProps, "currentHost" | "workspaceOptions">) {
  const tenantLinks = workspaceOptions.workspaces.map((workspace) => ({
    label: workspace.workspaceName,
    description:
      workspace.slug === "cleaneats"
        ? "Return to Clean Eats Hub"
        : `Return to ${workspace.displayName}`,
    href: getWorkspaceDestinationHref(
      {
        type: "tenant",
        href: "/dashboard",
        tenantSlug: workspace.slug,
      },
      { currentHost },
    ),
  }));

  const platformLinks = workspaceOptions.isPlatformAdmin
    ? [
        {
          label: "EveryBatch Platform Admin",
          description: "Open the platform owner console",
          href: getWorkspaceDestinationHref(
            {
              type: "platform",
              href: "/platform",
            },
            { currentHost },
          ),
        },
      ]
    : [];

  return [...tenantLinks, ...platformLinks];
}

export function SupportShell({
  children,
  currentHost,
  workspaceOptions,
}: SupportShellProps) {
  const parsedHost = currentHost ? parseEveryBatchHost(currentHost) : null;
  const isSupportHost = parsedHost?.hostname === PLATFORM_SUPPORT_DOMAIN;
  const workspaceLinks = getWorkspaceLinks({ currentHost, workspaceOptions });
  const supportStyle = {
    "--tenant-primary": "#176B3D",
    "--tenant-accent": "#8CC63F",
    "--tenant-success": "#176B3D",
    "--tenant-warning": "#9A5B00",
    "--tenant-danger": "#B42318",
    "--tenant-info": "#175CD3",
    "--tenant-primary-soft": "rgba(23, 107, 61, 0.1)",
    "--tenant-primary-border": "rgba(23, 107, 61, 0.25)",
    "--tenant-accent-soft": "rgba(140, 198, 63, 0.18)",
    "--tenant-success-bg": "rgba(23, 107, 61, 0.1)",
    "--tenant-success-border": "rgba(23, 107, 61, 0.24)",
    "--tenant-warning-bg": "rgba(154, 91, 0, 0.1)",
    "--tenant-warning-border": "rgba(154, 91, 0, 0.24)",
    "--tenant-danger-bg": "rgba(180, 35, 24, 0.1)",
    "--tenant-danger-border": "rgba(180, 35, 24, 0.24)",
    "--tenant-info-bg": "rgba(23, 92, 211, 0.1)",
    "--tenant-info-border": "rgba(23, 92, 211, 0.24)",
  } as CSSProperties;

  return (
    <div
      style={supportStyle}
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(140,198,63,0.18),transparent_32rem),linear-gradient(180deg,#f7fbf7_0%,#eef3ef_100%)] text-slate-950"
    >
      <header className="border-b border-green-950/10 bg-white/85 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-950 text-sm font-black text-lime-200 shadow-sm">
              EB
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-green-950">
                {PLATFORM_BRAND_NAME} Help Centre
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {PLATFORM_BRAND_CATEGORY}
              </p>
            </div>
          </div>

          <nav
            aria-label="Support navigation"
            className="flex flex-wrap items-center gap-2"
          >
            {supportNavItems.map((item) => (
              <Link
                key={item.href}
                href={getSupportHref(item.href, isSupportHost)}
                className="rounded-full border border-transparent px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
        <div className="min-w-0">{children}</div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-green-950/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-green-800">
              Signed in
            </p>
            <h2 className="mt-2 text-lg font-black text-slate-950">
              Support access active
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Support is visible to authenticated EveryBatch users. Detailed
              ticket workflows and database-backed guide content are planned
              later.
            </p>
          </section>

          <section className="rounded-lg border border-green-950/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-green-800">
              Return to workspace
            </p>
            <div className="mt-3 space-y-2">
              {workspaceLinks.map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-green-200 hover:bg-green-50"
                >
                  <span className="block text-sm font-bold text-slate-950">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {link.description}
                  </span>
                </Link>
              ))}
              <Link
                href={getCentralSelectorHref(currentHost)}
                className="block rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-green-200 hover:bg-green-50"
              >
                Workspace selector
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-green-950/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-green-800">
              Product promise
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {PLATFORM_BRAND_TAGLINE}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {PLATFORM_PRIMARY_DOMAIN} remains the root product domain, with
              support delivered through the authenticated support subdomain.
            </p>
          </section>

          <LogoutButton variant="light" />
        </aside>
      </main>
    </div>
  );
}
