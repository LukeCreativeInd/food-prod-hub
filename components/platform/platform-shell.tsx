import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { PlatformMobileMenu } from "@/components/platform/platform-mobile-menu";
import {
  PLATFORM_ADMIN_DOMAIN,
  PLATFORM_BRAND_NAME,
} from "@/lib/platform-brand";

type PlatformShellProps = {
  children: ReactNode;
};

type PlatformNavItem = {
  label: string;
  href?: string;
  status?: "live" | "soon";
};

const platformNavigation: Array<{
  label: string;
  items: PlatformNavItem[];
}> = [
  {
    label: "Overview",
    items: [{ label: "Platform Overview", href: "/platform", status: "live" }],
  },
  {
    label: "Tenants",
    items: [
      {
        label: "Clean Eats Detail",
        href: "/platform/tenants/cleaneats",
        status: "live",
      },
      { label: "All Tenants", href: "/platform", status: "live" },
      { label: "New Tenant", status: "soon" },
      {
        label: "Tenant Provisioning",
        href: "/platform/tenants/provisioning",
        status: "live",
      },
      {
        label: "Tenant Modules",
        href: "/platform/tenants/cleaneats/modules",
        status: "live",
      },
      {
        label: "Tenant Feature Flags",
        href: "/platform/tenants/cleaneats/features",
        status: "live",
      },
    ],
  },
  {
    label: "Platform",
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
    items: [
      { label: "Support", status: "soon" },
      { label: "Audit Logs", status: "soon" },
      { label: "System Health", status: "soon" },
      { label: "Smoke Tests", status: "soon" },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Plans", status: "soon" },
      { label: "Billing", status: "soon" },
      { label: "Invoices", status: "soon" },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "Platform Users", status: "soon" },
      { label: "Tenant Admins", status: "soon" },
    ],
  },
];

function PlatformMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300 text-sm font-black text-green-950 shadow-lg shadow-lime-950/10">
      EB
    </div>
  );
}

function PlatformNavItem({
  item,
  onNavigate,
}: {
  item: PlatformNavItem;
  onNavigate?: () => void;
}) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 hover:text-white"
      >
        <span>{item.label}</span>
        {item.status === "live" ? (
          <span className="rounded-full bg-emerald-300/15 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-emerald-200">
            Live
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-500">
      <span>{item.label}</span>
      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-400">
        Soon
      </span>
    </div>
  );
}

export function PlatformNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-5 lg:px-4" aria-label="Platform navigation">
      {platformNavigation.map((section) => (
        <section key={section.label}>
          <p className="px-3 text-[0.7rem] font-black uppercase tracking-[0.18em] text-slate-500">
            {section.label}
          </p>
          <div className="mt-2 space-y-1">
            {section.items.map((item) => (
              <PlatformNavItem
                key={item.label}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
}

export function PlatformShell({ children }: PlatformShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[18rem_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block">
          <Link href="/platform" className="flex items-center gap-3">
            <PlatformMark />
            <span>
              <span className="block text-sm font-black tracking-tight">
                {PLATFORM_BRAND_NAME}
              </span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-lime-200">
                Platform Admin
              </span>
            </span>
          </Link>
          <Link
            href="/select-workspace"
            className="inline-flex rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            Switch
          </Link>
        </div>

        <PlatformMobileMenu />

        <div className="hidden px-3 pb-5 lg:block">
          <PlatformNavigation />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                EveryBatch operator console
              </p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                Platform Admin
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-800">
                Transitional /platform
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Future: {PLATFORM_ADMIN_DOMAIN}
              </span>
              <Link
                href="/select-workspace"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
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
