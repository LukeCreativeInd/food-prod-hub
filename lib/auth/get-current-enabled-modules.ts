import { getCurrentOrganisation } from "@/lib/auth/get-current-organisation";
import { createClient } from "@/lib/supabase/server";
import type { ModuleKey } from "@/lib/tenant-types";

type EnabledModuleRow = {
  modules:
    | {
        module_key: ModuleKey;
      }
    | {
        module_key: ModuleKey;
      }[]
    | null;
};

function getModuleKey(row: EnabledModuleRow) {
  const moduleRecord = Array.isArray(row.modules)
    ? row.modules[0]
    : row.modules;

  return moduleRecord?.module_key;
}

export async function getCurrentEnabledModuleKeys(): Promise<ModuleKey[]> {
  const organisation = await getCurrentOrganisation();

  if (!organisation) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisation_modules")
    .select(
      `
        modules!inner (
          module_key,
          status,
          archived_at
        )
      `,
    )
    .eq("organisation_id", organisation.id)
    .eq("enabled", true)
    .eq("modules.status", "active")
    .is("modules.archived_at", null);

  if (error) {
    return [];
  }

  return ((data as unknown as EnabledModuleRow[] | null) ?? [])
    .map((row) => getModuleKey(row))
    .filter((moduleKey): moduleKey is ModuleKey => Boolean(moduleKey));
}
