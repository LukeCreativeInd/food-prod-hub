import { getCurrentMembership } from "@/lib/auth/get-current-membership";
import { createClient } from "@/lib/supabase/server";

export async function userHasPermission(
  permissionKey: string,
): Promise<boolean> {
  const membership = await getCurrentMembership();

  if (!membership) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select(
      `
        id,
        roles!inner (
          role_key,
          status,
          archived_at
        ),
        permissions!inner (
          permission_key,
          status,
          archived_at
        )
      `,
    )
    .eq("roles.role_key", membership.role_key)
    .eq("roles.status", "active")
    .is("roles.archived_at", null)
    .eq("permissions.permission_key", permissionKey)
    .eq("permissions.status", "active")
    .is("permissions.archived_at", null)
    .limit(1)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function requirePermission(
  permissionKey: string,
): Promise<boolean> {
  return userHasPermission(permissionKey);
}
