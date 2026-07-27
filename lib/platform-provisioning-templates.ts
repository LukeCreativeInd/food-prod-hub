import type { FeatureFlagKey } from "@/lib/feature-flags";
import type { ModuleKey } from "@/lib/tenant-types";

export type ProvisioningTemplateKey =
  | "foundation_pilot"
  | "meal_prep_manufacturer"
  | "food_manufacturer"
  | "custom";

export type ModulePackKey =
  | "foundation_operations"
  | "meal_prep_operations"
  | "full_food_operations"
  | "custom";

export type FeatureFlagPackKey =
  | "foundation_features"
  | "supplier_import_features"
  | "meal_prep_features"
  | "full_food_foundation"
  | "custom";

export type FeatureTemplateStatus = "active" | "planned";

export type PlannedFeatureFlagKey =
  | "stock_movements_v1"
  | "goods_inwards_v1"
  | "formula_builder_v1"
  | "production_tasks_v1"
  | "qa_checks_v1"
  | "logistics_dispatch_v1";

export type ProvisioningFeatureKey = FeatureFlagKey | PlannedFeatureFlagKey;

export type OnboardingChecklistStatus = "not_started";

export type OnboardingChecklistCategory =
  | "tenant_setup"
  | "products"
  | "inventory"
  | "production"
  | "costings"
  | "qa_compliance"
  | "launch";

export type TenantProvisioningTemplate = {
  key: ProvisioningTemplateKey;
  label: string;
  description: string;
  target: string;
  defaultModulePackKey: ModulePackKey | null;
  defaultFeatureFlagPackKey: FeatureFlagPackKey | null;
};

export type ModulePackTemplate = {
  key: ModulePackKey;
  label: string;
  description: string;
  moduleKeys: ModuleKey[];
  defaultWorkspaceAreas: string[];
};

export type FeatureFlagTemplateItem = {
  featureKey: ProvisioningFeatureKey;
  enabledByDefault: boolean;
  status: FeatureTemplateStatus;
  notes: string;
};

export type FeatureFlagPackTemplate = {
  key: FeatureFlagPackKey;
  label: string;
  description: string;
  features: FeatureFlagTemplateItem[];
};

export type OnboardingChecklistTemplateItem = {
  key: string;
  label: string;
  description: string;
  category: OnboardingChecklistCategory;
  defaultStatus: OnboardingChecklistStatus;
  required: boolean;
  moduleDependency?: ModuleKey;
};

export type OnboardingChecklistTemplate = {
  key: string;
  label: string;
  items: OnboardingChecklistTemplateItem[];
};

export type DefaultProvisioningConfig = {
  templateKey: ProvisioningTemplateKey;
  modulePack: ModulePackTemplate | null;
  featureFlagPack: FeatureFlagPackTemplate | null;
  settings: typeof defaultOrganisationSettings;
  branding: typeof defaultOrganisationBranding;
  onboardingChecklist: OnboardingChecklistTemplate;
};

export const defaultOrganisationSettings = {
  timezone: "Australia/Melbourne",
  currency: "AUD",
  defaultUnits: "Metric",
  dateFormat: "DD/MM/YYYY",
  themeMode: "light",
} as const;

export const defaultOrganisationBranding = {
  displayNamePlaceholder: "Tenant Workspace",
  logoUrl: null,
  logoState: "placeholder",
  primaryColour: "#176B3A",
  accentColour: "#A7D129",
  successColour: "#15803D",
  warningColour: "#B7791F",
  dangerColour: "#B91C1C",
  infoColour: "#0369A1",
} as const;

const foundationFeatureItems: FeatureFlagTemplateItem[] = [
  {
    featureKey: "global_search_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Tenant-scoped search in the app header.",
  },
  {
    featureKey: "tenant_branding_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Tenant branding controls and workspace presentation.",
  },
  {
    featureKey: "loading_transition_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Branded route loading experience.",
  },
  {
    featureKey: "help_support_menu_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Help and support entry point.",
  },
  {
    featureKey: "everybatch_branding_v1",
    enabledByDefault: true,
    status: "active",
    notes: "EveryBatch platform trust layer.",
  },
  {
    featureKey: "login_branding_v1",
    enabledByDefault: true,
    status: "active",
    notes: "EveryBatch login branding split.",
  },
  {
    featureKey: "products_manual_management_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Manual supplier and internal item management foundation.",
  },
  {
    featureKey: "costings_dashboard_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Read-only costing readiness dashboards.",
  },
  {
    featureKey: "production_readiness_dashboard_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Read-only production readiness dashboard.",
  },
  {
    featureKey: "inventory_locations_v1",
    enabledByDefault: true,
    status: "active",
    notes: "Inventory location master data foundation.",
  },
];

export const tenantProvisioningTemplates: TenantProvisioningTemplate[] = [
  {
    key: "foundation_pilot",
    label: "Foundation / Pilot",
    description: "Lightweight tenant setup for validation and onboarding.",
    target: "Early pilot clients",
    defaultModulePackKey: "foundation_operations",
    defaultFeatureFlagPackKey: "foundation_features",
  },
  {
    key: "meal_prep_manufacturer",
    label: "Meal Prep Manufacturer",
    description: "Ready-made meal and food prep production workflows.",
    target: "Meal prep and ready-made meal manufacturers",
    defaultModulePackKey: "meal_prep_operations",
    defaultFeatureFlagPackKey: "meal_prep_features",
  },
  {
    key: "food_manufacturer",
    label: "Food Manufacturer",
    description:
      "General food manufacturing with production, inventory, QA and traceability foundations.",
    target: "Broader food manufacturing operators",
    defaultModulePackKey: "full_food_operations",
    defaultFeatureFlagPackKey: "full_food_foundation",
  },
  {
    key: "custom",
    label: "Custom",
    description: "Operator-selected modules and feature flags.",
    target: "Specialised tenants",
    defaultModulePackKey: "custom",
    defaultFeatureFlagPackKey: "custom",
  },
];

export const modulePackTemplates: ModulePackTemplate[] = [
  {
    key: "foundation_operations",
    label: "Foundation Operations",
    description: "Core pilot workspace for early onboarding.",
    defaultWorkspaceAreas: ["Dashboard"],
    moduleKeys: [
      "products",
      "costings",
      "inventory",
      "production",
      "tools",
      "admin",
    ],
  },
  {
    key: "meal_prep_operations",
    label: "Meal Prep Operations",
    description: "Meal prep production, inventory, QA and logistics setup.",
    defaultWorkspaceAreas: ["Dashboard"],
    moduleKeys: [
      "products",
      "costings",
      "production",
      "inventory",
      "logistics",
      "qa",
      "reports",
      "tools",
      "admin",
    ],
  },
  {
    key: "full_food_operations",
    label: "Full Food Operations",
    description: "Full food manufacturing module pack for mature tenants.",
    defaultWorkspaceAreas: ["Dashboard"],
    moduleKeys: [
      "products",
      "costings",
      "production",
      "inventory",
      "qa",
      "logistics",
      "crm",
      "reports",
      "tools",
      "admin",
    ],
  },
  {
    key: "custom",
    label: "Custom",
    description: "No fixed module list. Operator selects modules later.",
    defaultWorkspaceAreas: ["Dashboard"],
    moduleKeys: [],
  },
];

export const featureFlagPackTemplates: FeatureFlagPackTemplate[] = [
  {
    key: "foundation_features",
    label: "Foundation Features",
    description: "Core active foundation features for a pilot tenant.",
    features: foundationFeatureItems,
  },
  {
    key: "supplier_import_features",
    label: "Supplier Import Features",
    description: "Supplier invoice intake and review-first import tooling.",
    features: [
      {
        featureKey: "supplier_invoice_intake_v1",
        enabledByDefault: true,
        status: "active",
        notes: "Reviewed supplier invoice upload, extraction and commit.",
      },
    ],
  },
  {
    key: "meal_prep_features",
    label: "Meal Prep Features",
    description: "Foundation features plus supplier import and planned meal prep rollout controls.",
    features: [
      ...foundationFeatureItems,
      {
        featureKey: "supplier_invoice_intake_v1",
        enabledByDefault: true,
        status: "active",
        notes: "Supplier invoice intake for purchasing/costing inputs.",
      },
      {
        featureKey: "logistics_dispatch_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned dispatch and logistics workflow controls.",
      },
      {
        featureKey: "production_tasks_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned production task execution controls.",
      },
      {
        featureKey: "qa_checks_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned QA check controls.",
      },
    ],
  },
  {
    key: "full_food_foundation",
    label: "Full Food Foundation",
    description: "Foundation features plus supplier import and planned full operations flags.",
    features: [
      ...foundationFeatureItems,
      {
        featureKey: "supplier_invoice_intake_v1",
        enabledByDefault: true,
        status: "active",
        notes: "Supplier invoice intake for purchasing/costing inputs.",
      },
      {
        featureKey: "stock_movements_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned stock movement workflow controls.",
      },
      {
        featureKey: "goods_inwards_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned goods-inwards receiving controls.",
      },
      {
        featureKey: "formula_builder_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned formula builder controls.",
      },
      {
        featureKey: "production_tasks_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned production task execution controls.",
      },
      {
        featureKey: "qa_checks_v1",
        enabledByDefault: false,
        status: "planned",
        notes: "Planned QA check controls.",
      },
    ],
  },
  {
    key: "custom",
    label: "Custom",
    description: "No fixed feature list. Operator selects feature flags later.",
    features: [],
  },
];

export const onboardingChecklistTemplate: OnboardingChecklistTemplate = {
  key: "default_tenant_onboarding",
  label: "Default Tenant Onboarding",
  items: [
    {
      key: "confirm_tenant_identity",
      label: "Confirm tenant identity",
      description: "Confirm tenant name, slug, industry and contacts.",
      category: "tenant_setup",
      defaultStatus: "not_started",
      required: true,
    },
    {
      key: "confirm_first_admin",
      label: "Confirm first admin",
      description: "Confirm the first tenant admin name and email.",
      category: "tenant_setup",
      defaultStatus: "not_started",
      required: true,
    },
    {
      key: "confirm_modules",
      label: "Confirm modules",
      description: "Review selected module pack before provisioning.",
      category: "tenant_setup",
      defaultStatus: "not_started",
      required: true,
    },
    {
      key: "upload_tenant_logo",
      label: "Upload tenant logo",
      description: "Add tenant logo when branding controls are ready.",
      category: "tenant_setup",
      defaultStatus: "not_started",
      required: false,
    },
    {
      key: "upload_supplier_invoices",
      label: "Upload supplier invoices",
      description: "Upload first supplier invoices for reviewed intake.",
      category: "products",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "tools",
    },
    {
      key: "review_suppliers",
      label: "Review suppliers",
      description: "Review supplier records and aliases.",
      category: "products",
      defaultStatus: "not_started",
      required: true,
      moduleDependency: "products",
    },
    {
      key: "review_internal_items",
      label: "Review internal items",
      description: "Review ingredient, packaging and internal catalogue items.",
      category: "products",
      defaultStatus: "not_started",
      required: true,
      moduleDependency: "products",
    },
    {
      key: "create_packaging_items",
      label: "Create packaging items",
      description: "Create packaging records needed for costing and production.",
      category: "products",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "products",
    },
    {
      key: "collect_component_formulas",
      label: "Collect component formulas",
      description: "Collect component formulas from staff templates.",
      category: "products",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "products",
    },
    {
      key: "review_stock_locations",
      label: "Review stock locations",
      description: "Confirm stores, chillers, freezers and production locations.",
      category: "inventory",
      defaultStatus: "not_started",
      required: true,
      moduleDependency: "inventory",
    },
    {
      key: "configure_receiving_areas",
      label: "Configure receiving areas",
      description: "Confirm goods-inwards and receiving locations.",
      category: "inventory",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "inventory",
    },
    {
      key: "collect_production_areas",
      label: "Collect production areas",
      description: "Confirm production work areas and tablet workflow needs.",
      category: "production",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "production",
    },
    {
      key: "collect_production_tasks",
      label: "Collect production tasks",
      description: "Collect tasks, methods and route requirements.",
      category: "production",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "production",
    },
    {
      key: "confirm_supplier_prices",
      label: "Confirm approved supplier prices",
      description: "Review approved prices and missing price coverage.",
      category: "costings",
      defaultStatus: "not_started",
      required: true,
      moduleDependency: "costings",
    },
    {
      key: "review_component_cost_readiness",
      label: "Review component cost readiness",
      description: "Review formulas, quantities and missing input prices.",
      category: "costings",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "costings",
    },
    {
      key: "collect_qa_checks",
      label: "Collect QA checks",
      description: "Collect QA check, sign-off and traceability requirements.",
      category: "qa_compliance",
      defaultStatus: "not_started",
      required: false,
      moduleDependency: "qa",
    },
    {
      key: "invite_users",
      label: "Invite users",
      description: "Invite tenant admin, managers and staff.",
      category: "launch",
      defaultStatus: "not_started",
      required: true,
    },
    {
      key: "smoke_test_tenant",
      label: "Smoke test tenant",
      description: "Run tenant access, module, branding and RLS smoke checks.",
      category: "launch",
      defaultStatus: "not_started",
      required: true,
    },
    {
      key: "confirm_support_contact",
      label: "Confirm support contact",
      description: "Confirm who receives EveryBatch support and onboarding updates.",
      category: "launch",
      defaultStatus: "not_started",
      required: true,
    },
    {
      key: "mark_tenant_active",
      label: "Mark tenant active",
      description: "Final reviewed status change after provisioning and smoke tests.",
      category: "launch",
      defaultStatus: "not_started",
      required: true,
    },
  ],
};

export function getTenantProvisioningTemplates() {
  return tenantProvisioningTemplates;
}

export function getTenantProvisioningTemplate(key: ProvisioningTemplateKey) {
  return tenantProvisioningTemplates.find((template) => template.key === key);
}

export function getModulePack(key: ModulePackKey) {
  return modulePackTemplates.find((pack) => pack.key === key);
}

export function getFeatureFlagPack(key: FeatureFlagPackKey) {
  return featureFlagPackTemplates.find((pack) => pack.key === key);
}

export function getOnboardingChecklistTemplate() {
  return onboardingChecklistTemplate;
}

export function getDefaultProvisioningConfig(
  templateKey: ProvisioningTemplateKey,
): DefaultProvisioningConfig | null {
  const template = getTenantProvisioningTemplate(templateKey);

  if (!template) {
    return null;
  }

  return {
    templateKey,
    modulePack: template.defaultModulePackKey
      ? (getModulePack(template.defaultModulePackKey) ?? null)
      : null,
    featureFlagPack: template.defaultFeatureFlagPackKey
      ? (getFeatureFlagPack(template.defaultFeatureFlagPackKey) ?? null)
      : null,
    settings: defaultOrganisationSettings,
    branding: defaultOrganisationBranding,
    onboardingChecklist: getOnboardingChecklistTemplate(),
  };
}
