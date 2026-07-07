import type { ModuleKey } from "./tenant-types";

export type ModuleGroup =
  | "Food operations"
  | "Quality"
  | "Commercial"
  | "Management"
  | "Platform";

export type ModulePhase = "Phase 1" | "Phase 2" | "Phase 3" | "Platform";

export interface ModuleRegistryItem {
  key: ModuleKey;
  label: string;
  description: string;
  group: ModuleGroup;
  phase: ModulePhase;
}

export const availableModules: ModuleRegistryItem[] = [
  {
    key: "products",
    label: "Products",
    description: "Product catalogue and food item planning.",
    group: "Food operations",
    phase: "Phase 1",
  },
  {
    key: "costings",
    label: "Costings",
    description: "Costing views for products, meals, packaging, and inputs.",
    group: "Food operations",
    phase: "Phase 1",
  },
  {
    key: "production",
    label: "Production",
    description: "Production planning, areas, tasks, and staff logging.",
    group: "Food operations",
    phase: "Phase 1",
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "Basic stock visibility, movements, and goods inwards.",
    group: "Food operations",
    phase: "Phase 1",
  },
  {
    key: "purchasing",
    label: "Purchasing",
    description: "Purchasing requirements, supplier updates, and purchase orders.",
    group: "Food operations",
    phase: "Phase 2",
  },
  {
    key: "qa",
    label: "QA",
    description: "Quality checks, sign-offs, temperature logs, and corrective actions.",
    group: "Quality",
    phase: "Phase 2",
  },
  {
    key: "logistics",
    label: "Logistics",
    description: "Logistics planning and fulfilment workflows.",
    group: "Food operations",
    phase: "Phase 2",
  },
  {
    key: "wholesale",
    label: "Wholesale",
    description: "Wholesale account and order management workflows.",
    group: "Commercial",
    phase: "Phase 3",
  },
  {
    key: "crm",
    label: "CRM",
    description: "Customer relationship and account insights.",
    group: "Commercial",
    phase: "Phase 3",
  },
  {
    key: "reports",
    label: "Reports",
    description: "Operational, production, QA, and business reporting.",
    group: "Management",
    phase: "Phase 3",
  },
  {
    key: "admin",
    label: "Admin",
    description: "Tenant settings, module enablement, and future platform controls.",
    group: "Platform",
    phase: "Platform",
  },
];
