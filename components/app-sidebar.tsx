"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { LogoutButton } from "@/components/auth/logout-button";
import { navigationGroups } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const showLogout = pathname !== "/login";

  return (
    <aside className="flex w-full flex-col border-b border-emerald-950 bg-emerald-950 text-white md:sticky md:top-0 md:h-screen md:w-80 md:border-b-0 md:border-r md:border-emerald-900">
      <div className="border-b border-white/10 px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-clean-green-700">
            CE
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-200">
              Clean Eats
            </p>
            <h1 className="mt-0.5 text-xl font-bold text-white">Hub</h1>
          </div>
        </div>
      </div>

      <nav className="flex gap-4 overflow-x-auto px-4 py-3 md:block md:flex-1 md:space-y-6 md:overflow-y-auto md:py-5">
        {navigationGroups.map((group) => (
          <section key={group.label} className="min-w-max md:min-w-0">
            <h2 className="px-3 text-xs font-semibold uppercase text-emerald-300/80">
              {group.label}
            </h2>
            <div className="mt-2 flex gap-1 md:block md:space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-clean-green-900 shadow-sm"
                        : "text-emerald-50/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-3 md:px-6 md:py-4">
        <p className="mb-3 text-xs text-emerald-100/70">
          Modular food operations platform
        </p>
        {showLogout ? <LogoutButton /> : null}
      </div>
    </aside>
  );
}
