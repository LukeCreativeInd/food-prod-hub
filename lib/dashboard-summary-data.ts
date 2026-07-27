import { getCurrentPermissionKeys, requireAppAccess } from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type CountResult = {
  count: number | null;
};

export type DashboardSummaryData = {
  permissionKeys: string[];
  counts: {
    suppliers: number | null;
    internalItems: number | null;
    approvedPrices: number | null;
    stockLocations: number | null;
  };
};

function safeCount(result: CountResult) {
  return result.count ?? 0;
}

export async function getDashboardSummaryData(): Promise<DashboardSummaryData> {
  const timingStartedAt = Date.now();
  const authContext = await requireAppAccess();
  const permissionKeys = await getCurrentPermissionKeys();

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const hasPermission = (permission: string) => permissionKeys.includes(permission);
  const supabase = await createClient();

  const [suppliersResult, internalItemsResult, approvedPricesResult, stockLocationsResult] =
    await Promise.all([
      hasPermission("products.view")
        ? supabase
            .from("suppliers")
            .select("id", { count: "exact", head: true })
            .eq("organisation_id", organisationId)
            .is("archived_at", null)
        : Promise.resolve({ count: null }),
      hasPermission("products.view")
        ? supabase
            .from("internal_items")
            .select("id", { count: "exact", head: true })
            .eq("organisation_id", organisationId)
            .is("archived_at", null)
        : Promise.resolve({ count: null }),
      hasPermission("costings.view")
        ? supabase
            .from("approved_supplier_prices")
            .select("id", { count: "exact", head: true })
            .eq("organisation_id", organisationId)
            .eq("status", "current")
        : Promise.resolve({ count: null }),
      hasPermission("inventory.view")
        ? supabase
            .from("inventory_locations")
            .select("id", { count: "exact", head: true })
            .eq("organisation_id", organisationId)
            .eq("status", "active")
            .is("archived_at", null)
        : Promise.resolve({ count: null }),
    ]);

  logDevRouteTiming("dashboard.summary", timingStartedAt, {
    permissionCount: permissionKeys.length,
  });

  return {
    permissionKeys,
    counts: {
      suppliers: hasPermission("products.view") ? safeCount(suppliersResult) : null,
      internalItems: hasPermission("products.view")
        ? safeCount(internalItemsResult)
        : null,
      approvedPrices: hasPermission("costings.view")
        ? safeCount(approvedPricesResult)
        : null,
      stockLocations: hasPermission("inventory.view")
        ? safeCount(stockLocationsResult)
        : null,
    },
  };
}
