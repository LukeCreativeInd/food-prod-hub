import { getCurrentMembership } from "@/lib/auth/get-current-membership";
import { createClient } from "@/lib/supabase/server";

type PermissionRow = {
  permissions:
    | {
        permission_key: string;
      }
    | {
        permission_key: string;
      }[]
    | null;
};

function getPermissionKey(row: PermissionRow) {
  const permission = Array.isArray(row.permissions)
    ? row.permissions[0]
    : row.permissions;

  return permission?.permission_key;
}

export async function getCurrentPermissionKeys(): Promise<string[]> {
  const membership = await getCurrentMembership();

  if (!membership) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select(
      `
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
    .eq("permissions.status", "active")
    .is("permissions.archived_at", null);

  if (error) {
    return [];
  }

  return ((data as unknown as PermissionRow[] | null) ?? [])
    .map((row) => getPermissionKey(row))
    .filter((permissionKey): permissionKey is string => Boolean(permissionKey));
}

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
