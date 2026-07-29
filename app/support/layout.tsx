import type { ReactNode } from "react";
import { headers } from "next/headers";

import { SupportShell } from "@/components/support/support-shell";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCurrentUserWorkspaceOptions } from "@/lib/workspace-options";

export default async function SupportLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  const [workspaceOptions, requestHeaders] = await Promise.all([
    getCurrentUserWorkspaceOptions(),
    headers(),
  ]);
  const currentHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  return (
    <SupportShell
      currentHost={currentHost}
      workspaceOptions={workspaceOptions}
    >
      {children}
    </SupportShell>
  );
}
