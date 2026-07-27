import { cache } from "react";

import {
  getCurrentEnabledModuleKeys,
  getCurrentPermissionKeys,
} from "@/lib/auth";
import { getTenantPresentation } from "@/lib/tenant-presentation";

export const getAppShellContext = cache(async function getAppShellContext() {
  const [permissionKeys, enabledModuleKeys, tenantPresentation] =
    await Promise.all([
      getCurrentPermissionKeys(),
      getCurrentEnabledModuleKeys(),
      getTenantPresentation(),
    ]);

  return {
    permissionKeys,
    enabledModuleKeys,
    tenantPresentation,
  };
});
