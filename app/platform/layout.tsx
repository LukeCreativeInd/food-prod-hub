import type { ReactNode } from "react";

import { PlatformShell } from "@/components/platform/platform-shell";
import { requirePermissionAccess } from "@/lib/auth";

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePermissionAccess("platform.tenants.view");

  return <PlatformShell>{children}</PlatformShell>;
}
