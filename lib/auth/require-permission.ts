import { redirect } from "next/navigation";

import { requireAppAccess } from "@/lib/auth/require-app-access";
import { userHasPermission } from "@/lib/auth/permissions";

export async function requirePermissionAccess(permissionKey: string) {
  const authContext = await requireAppAccess();
  const hasPermission = await userHasPermission(permissionKey);

  if (!hasPermission) {
    redirect("/no-access");
  }

  return authContext;
}
