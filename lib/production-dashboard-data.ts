import {
  getCurrentPermissionKeys,
  requirePermissionAccess,
} from "@/lib/auth";
import { logDevRouteTiming } from "@/lib/dev-performance";
import { createClient } from "@/lib/supabase/server";

type InventoryLocationRow = {
  id: string;
  location_code: string;
  name: string;
  location_type: string;
  area: string | null;
  temperature_zone: string | null;
  status: string;
};

type FormulaVersionRow = {
  id: string;
  output_internal_item_id: string;
  formula_type: string;
  version_name: string;
  status: string;
  updated_at: string | null;
};

type FormulaLineRow = {
  id: string;
  formula_version_id: string;
};

type InternalItemRow = {
  id: string;
  item_type: string;
  display_name: string;
  status: string;
};

export type ProductionDashboardData = {
  access: {
    canViewInventorySetup: boolean;
    canViewFormulaSetup: boolean;
    canViewProductSetup: boolean;
  };
  counts: {
    productionLocationCount: number | null;
    storageLocationCount: number | null;
    receivingDispatchLocationCount: number | null;
    componentFormulaCount: number | null;
    finishedProductFormulaCount: number | null;
    activeFormulaCount: number | null;
    draftFormulaCount: number | null;
    formulaLineCount: number | null;
    internalItemCount: number | null;
    ingredientInternalItemCount: number | null;
    componentInternalItemCount: number | null;
    finishedProductInternalItemCount: number | null;
  };
  readiness: {
    hasProductionLocations: boolean | null;
    hasComponentFormulas: boolean | null;
    hasFinishedProductFormulas: boolean | null;
    isReadyForProductionPlanning: boolean;
    blockers: {
      title: string;
      description: string;
      href?: string;
      status: "ready" | "blocked" | "limited";
    }[];
  };
  productionLocations: {
    id: string;
    code: string;
    name: string;
    area: string;
    temperatureZone: string;
    status: string;
  }[];
  recentFormulaVersions: {
    id: string;
    outputItemName: string;
    formulaType: string;
    versionName: string;
    status: string;
    updatedAt: string;
    lineCount: number;
  }[];
};

function labelFromKey(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function hasPermission(permissionKeys: string[], permissionKey: string) {
  return permissionKeys.includes(permissionKey);
}

function buildReadiness({
  canViewInventorySetup,
  canViewFormulaSetup,
  hasProductionLocations,
  hasComponentFormulas,
  hasFinishedProductFormulas,
}: {
  canViewInventorySetup: boolean;
  canViewFormulaSetup: boolean;
  hasProductionLocations: boolean | null;
  hasComponentFormulas: boolean | null;
  hasFinishedProductFormulas: boolean | null;
}) {
  const blockers: ProductionDashboardData["readiness"]["blockers"] = [];

  if (!canViewInventorySetup) {
    blockers.push({
      title: "Production locations not visible",
      description:
        "This role can view Production, but cannot read Inventory setup records.",
      status: "limited",
    });
  } else if (hasProductionLocations) {
    blockers.push({
      title: "Production locations available",
      description:
        "Production-type stock locations exist for future room and area planning.",
      href: "/stock-locations",
      status: "ready",
    });
  } else {
    blockers.push({
      title: "Add production locations",
      description:
        "Production planning needs kitchen, packing or other production locations before area-based work can be trusted.",
      href: "/stock-locations",
      status: "blocked",
    });
  }

  if (!canViewFormulaSetup) {
    blockers.push({
      title: "Formula setup not visible",
      description:
        "This role can view Production, but cannot read component or finished product formulas.",
      status: "limited",
    });
  } else if (hasComponentFormulas) {
    blockers.push({
      title: "Component formulas available",
      description:
        "Component/batch formula records exist for future production planning.",
      href: "/components",
      status: "ready",
    });
  } else {
    blockers.push({
      title: "Enter component formulas",
      description:
        "Component and batch formulas are needed before production requirements can be generated.",
      href: "/components",
      status: "blocked",
    });
  }

  if (!canViewFormulaSetup) {
    blockers.push({
      title: "Finished product formula setup not visible",
      description:
        "Finished product readiness cannot be assessed without formula read access.",
      status: "limited",
    });
  } else if (hasFinishedProductFormulas) {
    blockers.push({
      title: "Finished product formulas available",
      description:
        "Finished product formula records exist for future meal production planning.",
      href: "/finished-products",
      status: "ready",
    });
  } else {
    blockers.push({
      title: "Enter finished product formulas",
      description:
        "Finished product formulas are needed before meal production planning can move beyond scaffolding.",
      href: "/finished-products",
      status: "blocked",
    });
  }

  blockers.push({
    title: "Configure production tasks later",
    description:
      "Task assignment, iPad execution, staff logging and completion workflows are intentionally not built yet.",
    href: "/production-tasks",
    status: "limited",
  });

  return {
    blockers,
    isReadyForProductionPlanning:
      hasProductionLocations === true &&
      hasComponentFormulas === true &&
      hasFinishedProductFormulas === true,
  };
}

export async function getProductionDashboardData(): Promise<ProductionDashboardData> {
  const timingStartedAt = Date.now();
  const authContext = await requirePermissionAccess("production.view");

  if (!authContext.organisation) {
    throw new Error("Current organisation is required.");
  }

  const organisationId = authContext.organisation.id;
  const [supabase, permissionKeys] = await Promise.all([
    createClient(),
    getCurrentPermissionKeys(),
  ]);
  const canViewInventorySetup = hasPermission(permissionKeys, "inventory.view");
  const canViewFormulaSetup = hasPermission(permissionKeys, "formulas.view");
  const canViewProductSetup = hasPermission(permissionKeys, "supplier_items.view");

  const locationsPromise = canViewInventorySetup
    ? supabase
        .from("inventory_locations")
        .select(
          "id, location_code, name, location_type, area, temperature_zone, status",
        )
        .eq("organisation_id", organisationId)
        .is("archived_at", null)
    : Promise.resolve({ data: null, error: null });
  const formulasPromise = canViewFormulaSetup
    ? supabase
        .from("formula_versions")
        .select(
          "id, output_internal_item_id, formula_type, version_name, status, updated_at",
        )
        .eq("organisation_id", organisationId)
        .is("archived_at", null)
        .order("updated_at", { ascending: false })
    : Promise.resolve({ data: null, error: null });
  const formulaLinesPromise = canViewFormulaSetup
    ? supabase
        .from("formula_lines")
        .select("id, formula_version_id")
        .eq("organisation_id", organisationId)
        .is("archived_at", null)
    : Promise.resolve({ data: null, error: null });
  const internalItemsPromise = canViewProductSetup
    ? supabase
        .from("internal_items")
        .select("id, item_type, display_name, status")
        .eq("organisation_id", organisationId)
        .is("archived_at", null)
    : Promise.resolve({ data: null, error: null });

  const [
    locationsResult,
    formulasResult,
    formulaLinesResult,
    internalItemsResult,
  ] = await Promise.all([
    locationsPromise,
    formulasPromise,
    formulaLinesPromise,
    internalItemsPromise,
  ]);

  if (locationsResult.error) {
    throw new Error("Could not load Production dashboard locations.");
  }

  if (formulasResult.error) {
    throw new Error("Could not load Production dashboard formulas.");
  }

  if (formulaLinesResult.error) {
    throw new Error("Could not load Production dashboard formula lines.");
  }

  if (internalItemsResult.error) {
    throw new Error("Could not load Production dashboard internal items.");
  }

  const locations =
    ((locationsResult.data ?? []) as InventoryLocationRow[]) ?? [];
  const formulas = ((formulasResult.data ?? []) as FormulaVersionRow[]) ?? [];
  const formulaLines =
    ((formulaLinesResult.data ?? []) as FormulaLineRow[]) ?? [];
  const internalItems =
    ((internalItemsResult.data ?? []) as InternalItemRow[]) ?? [];

  const productionLocations = locations.filter(
    (location) => location.location_type === "production",
  );
  const storageLocations = locations.filter(
    (location) => location.location_type === "storage",
  );
  const receivingDispatchLocations = locations.filter((location) =>
    ["receiving", "dispatch"].includes(location.location_type),
  );
  const componentFormulas = formulas.filter(
    (formula) => formula.formula_type === "component",
  );
  const finishedProductFormulas = formulas.filter(
    (formula) => formula.formula_type === "finished_product",
  );
  const internalItemById = new Map(
    internalItems.map((item) => [item.id, item]),
  );
  const lineCountsByFormulaId = new Map<string, number>();

  formulaLines.forEach((line) => {
    lineCountsByFormulaId.set(
      line.formula_version_id,
      (lineCountsByFormulaId.get(line.formula_version_id) ?? 0) + 1,
    );
  });

  const readiness = buildReadiness({
    canViewInventorySetup,
    canViewFormulaSetup,
    hasProductionLocations: canViewInventorySetup
      ? productionLocations.length > 0
      : null,
    hasComponentFormulas: canViewFormulaSetup
      ? componentFormulas.length > 0
      : null,
    hasFinishedProductFormulas: canViewFormulaSetup
      ? finishedProductFormulas.length > 0
      : null,
  });

  const dashboardData: ProductionDashboardData = {
    access: {
      canViewInventorySetup,
      canViewFormulaSetup,
      canViewProductSetup,
    },
    counts: {
      productionLocationCount: canViewInventorySetup
        ? productionLocations.length
        : null,
      storageLocationCount: canViewInventorySetup
        ? storageLocations.length
        : null,
      receivingDispatchLocationCount: canViewInventorySetup
        ? receivingDispatchLocations.length
        : null,
      componentFormulaCount: canViewFormulaSetup
        ? componentFormulas.length
        : null,
      finishedProductFormulaCount: canViewFormulaSetup
        ? finishedProductFormulas.length
        : null,
      activeFormulaCount: canViewFormulaSetup
        ? formulas.filter((formula) => formula.status === "active").length
        : null,
      draftFormulaCount: canViewFormulaSetup
        ? formulas.filter((formula) => formula.status === "draft").length
        : null,
      formulaLineCount: canViewFormulaSetup ? formulaLines.length : null,
      internalItemCount: canViewProductSetup ? internalItems.length : null,
      ingredientInternalItemCount: canViewProductSetup
        ? internalItems.filter((item) => item.item_type === "ingredient").length
        : null,
      componentInternalItemCount: canViewProductSetup
        ? internalItems.filter((item) => item.item_type === "component").length
        : null,
      finishedProductInternalItemCount: canViewProductSetup
        ? internalItems.filter((item) => item.item_type === "finished_product")
            .length
        : null,
    },
    readiness: {
      hasProductionLocations: canViewInventorySetup
        ? productionLocations.length > 0
        : null,
      hasComponentFormulas: canViewFormulaSetup
        ? componentFormulas.length > 0
        : null,
      hasFinishedProductFormulas: canViewFormulaSetup
        ? finishedProductFormulas.length > 0
        : null,
      isReadyForProductionPlanning: readiness.isReadyForProductionPlanning,
      blockers: readiness.blockers,
    },
    productionLocations: productionLocations.slice(0, 8).map((location) => ({
      id: location.id,
      code: location.location_code,
      name: location.name,
      area: location.area ?? "Not recorded",
      temperatureZone: labelFromKey(location.temperature_zone),
      status: labelFromKey(location.status),
    })),
    recentFormulaVersions: formulas.slice(0, 6).map((formula) => ({
      id: formula.id,
      outputItemName:
        internalItemById.get(formula.output_internal_item_id)?.display_name ??
        "Formula output item",
      formulaType: labelFromKey(formula.formula_type),
      versionName: formula.version_name,
      status: labelFromKey(formula.status),
      updatedAt: formatDateTime(formula.updated_at),
      lineCount: lineCountsByFormulaId.get(formula.id) ?? 0,
    })),
  };

  logDevRouteTiming("production.dashboard-data", timingStartedAt, {
    productionLocationCount: dashboardData.counts.productionLocationCount,
    componentFormulaCount: dashboardData.counts.componentFormulaCount,
    finishedProductFormulaCount:
      dashboardData.counts.finishedProductFormulaCount,
    formulaLineCount: dashboardData.counts.formulaLineCount,
  });

  return dashboardData;
}
