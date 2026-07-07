export type ModuleKey =
  | "products"
  | "costings"
  | "production"
  | "inventory"
  | "purchasing"
  | "qa"
  | "logistics"
  | "wholesale"
  | "crm"
  | "reports"
  | "admin";

export type UserRole =
  | "platform_admin"
  | "organisation_admin"
  | "operations_manager"
  | "production_manager"
  | "qa_manager"
  | "warehouse_manager"
  | "wholesale_manager"
  | "staff"
  | "viewer";

export type ThemeMode = "light" | "dark" | "system";

export type SidebarStyle = "default" | "compact" | "expanded";

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive" | "archived";
}

export interface OrganisationSettings {
  organisationId: string;
  timezone: string;
  currency: string;
  units: "metric" | "imperial";
  locale?: string;
}

export interface OrganisationBranding {
  organisationId: string;
  logoUrl?: string;
  primaryColour: string;
  accentColour: string;
  sidebarStyle: SidebarStyle;
  themeMode: ThemeMode;
}

export interface EnabledModule {
  organisationId: string;
  moduleKey: ModuleKey;
  enabled: boolean;
}

export interface OrganisationMembership {
  id: string;
  organisationId: string;
  userId: string;
  role: UserRole;
  status: "active" | "invited" | "suspended" | "archived";
}

export interface FeatureFlag {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
}

export interface TenantContext {
  organisation: Organisation;
  settings: OrganisationSettings;
  branding: OrganisationBranding;
  enabledModules: EnabledModule[];
  membership?: OrganisationMembership;
  featureFlags?: FeatureFlag[];
}
