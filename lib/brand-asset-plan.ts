export type BrandAssetOwnerType = "platform" | "organisation";

export type BrandAssetKind =
  | "logo_full"
  | "logo_icon"
  | "favicon"
  | "social_preview"
  | "email_logo"
  | "login_brand_image";

export type BrandAssetUsage =
  | "sidebar_expanded"
  | "sidebar_collapsed"
  | "login"
  | "app_favicon"
  | "platform_admin"
  | "tenant_workspace"
  | "email"
  | "social_preview";

export type BrandAssetFallbackRule = {
  ownerType: BrandAssetOwnerType;
  usage: BrandAssetUsage;
  preferredKind: BrandAssetKind;
  fallback: string;
};

export type BrandAssetStoragePlan = {
  ownerType: BrandAssetOwnerType;
  bucketOrLocation: string;
  pathPattern: string;
  notes: string;
};

export type BrandAssetDisplayRule = {
  usage: BrandAssetUsage;
  ownerType: BrandAssetOwnerType;
  expandedBehaviour?: string;
  collapsedBehaviour?: string;
};

export const brandAssetKinds: BrandAssetKind[] = [
  "logo_full",
  "logo_icon",
  "favicon",
  "social_preview",
  "email_logo",
  "login_brand_image",
];

export const brandAssetUsages: BrandAssetUsage[] = [
  "sidebar_expanded",
  "sidebar_collapsed",
  "login",
  "app_favicon",
  "platform_admin",
  "tenant_workspace",
  "email",
  "social_preview",
];

export const brandAssetStoragePlan: BrandAssetStoragePlan[] = [
  {
    ownerType: "platform",
    bucketOrLocation: "public/ or future platform-branding storage",
    pathPattern: "platform-branding/logo/full.{ext}",
    notes:
      "Near-term EveryBatch core brand assets can live as reviewed static files. Dynamic Platform Admin management can be planned later.",
  },
  {
    ownerType: "platform",
    bucketOrLocation: "public/ or future platform-branding storage",
    pathPattern: "platform-branding/logo/icon.{ext}",
    notes:
      "Dedicated icon asset for collapsed sidebars, favicons and compact marks.",
  },
  {
    ownerType: "organisation",
    bucketOrLocation: "organisation-branding",
    pathPattern: "{organisation_id}/logo/full-{safe_filename}",
    notes:
      "Build on the existing private tenant branding bucket. The first segment remains organisation_id for tenant isolation.",
  },
  {
    ownerType: "organisation",
    bucketOrLocation: "organisation-branding",
    pathPattern: "{organisation_id}/logo/icon-{safe_filename}",
    notes:
      "Future tenant icon asset for collapsed sidebar, workspace selector and compact tenant identity.",
  },
];

export const brandAssetFallbackRules: BrandAssetFallbackRule[] = [
  {
    ownerType: "platform",
    usage: "sidebar_expanded",
    preferredKind: "logo_full",
    fallback: "Temporary EveryBatch EB mark plus text.",
  },
  {
    ownerType: "platform",
    usage: "sidebar_collapsed",
    preferredKind: "logo_icon",
    fallback: "Temporary EveryBatch EB mark.",
  },
  {
    ownerType: "organisation",
    usage: "sidebar_expanded",
    preferredKind: "logo_full",
    fallback: "Tenant organisation name.",
  },
  {
    ownerType: "organisation",
    usage: "sidebar_collapsed",
    preferredKind: "logo_icon",
    fallback: "Tenant initials.",
  },
];

export const brandAssetDisplayRules: BrandAssetDisplayRule[] = [
  {
    ownerType: "platform",
    usage: "platform_admin",
    expandedBehaviour: "Use full EveryBatch logo when available.",
    collapsedBehaviour: "Use EveryBatch icon asset when available.",
  },
  {
    ownerType: "organisation",
    usage: "tenant_workspace",
    expandedBehaviour: "Use tenant full logo if available, otherwise tenant name.",
    collapsedBehaviour: "Use tenant icon if available, otherwise tenant initials.",
  },
];
