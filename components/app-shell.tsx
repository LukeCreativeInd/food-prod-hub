import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentPermissionKeys } from "@/lib/auth";
import { navigationGroups } from "@/lib/navigation";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const permissionKeys = await getCurrentPermissionKeys();
  const permissionSet = new Set(permissionKeys);
  const visibleNavigationGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !item.requiredPermission || permissionSet.has(item.requiredPermission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8f5] md:flex-row">
      <AppSidebar navigationGroups={visibleNavigationGroups} />
      <main className="min-w-0 flex-1 bg-[#f6f8f5]">{children}</main>
    </div>
  );
}
