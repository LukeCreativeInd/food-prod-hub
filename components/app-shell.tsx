import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8f5] md:flex-row">
      <AppSidebar />
      <main className="min-w-0 flex-1 bg-[#f6f8f5]">{children}</main>
    </div>
  );
}
