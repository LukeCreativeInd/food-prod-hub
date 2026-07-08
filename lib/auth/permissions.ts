export async function userHasPermission(
  permissionKey: string,
): Promise<boolean> {
  void permissionKey;
  // TODO: Check role permissions after memberships and roles are wired to auth.
  return false;
}

export async function requirePermission(
  permissionKey: string,
): Promise<boolean> {
  void permissionKey;
  // TODO: Enforce permissions after route and action guards are introduced.
  return false;
}
