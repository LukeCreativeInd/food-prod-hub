export type SupportGuideItem = {
  title: string;
  description: string;
  status: "Coming soon" | "Scaffold";
};

export type SupportGuideCategory = {
  key: string;
  title: string;
  description: string;
  items: SupportGuideItem[];
};

export const supportGuideCategories: SupportGuideCategory[] = [
  {
    key: "getting-started",
    title: "Getting Started",
    description: "First steps for signing in, choosing a workspace and navigating EveryBatch.",
    items: [
      {
        title: "Sign in and select your workspace",
        description: "A short guide for central login and workspace selection.",
        status: "Coming soon",
      },
      {
        title: "Understand the tenant workspace",
        description: "How Clean Eats Hub and future tenant workspaces are organised.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "products",
    title: "Products",
    description: "Supplier, internal item, component and finished product catalogue help.",
    items: [
      {
        title: "Create and maintain supplier records",
        description: "Basic supplier profile and source-data hygiene guidance.",
        status: "Coming soon",
      },
      {
        title: "Manage internal items",
        description: "How ingredients, packaging and catalogue items fit together.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "costings",
    title: "Costings",
    description: "Price readiness, sell prices, component costs and meal margins.",
    items: [
      {
        title: "Review price readiness",
        description: "How supplier prices and approved prices support costing views.",
        status: "Coming soon",
      },
      {
        title: "Understand meal margin calculations",
        description: "How active sell prices and recipe costs support margin readiness.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "supplier-invoice-intake",
    title: "Supplier Invoice Intake",
    description: "Upload, extract, review and commit supplier invoice information.",
    items: [
      {
        title: "Upload and review an invoice",
        description: "The review-first flow for supplier purchase documents.",
        status: "Scaffold",
      },
      {
        title: "Resolve unknown suppliers",
        description: "How supplier-specific parsers will expand over time.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "formula-builder",
    title: "Formula Builder",
    description: "Component and finished-product formula setup guidance.",
    items: [
      {
        title: "Build a component formula",
        description: "How output items and input lines will be reviewed.",
        status: "Coming soon",
      },
      {
        title: "Build a finished-product formula",
        description: "Meal assembly, packaging and label-readiness guidance.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "production",
    title: "Production",
    description: "Production planning, task logging and operational readiness guides.",
    items: [
      {
        title: "Production dashboard overview",
        description: "How production views are expected to support staff workflows.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "inventory",
    title: "Inventory",
    description: "Stock locations, goods inwards and future stock movement support.",
    items: [
      {
        title: "Inventory locations overview",
        description: "How location records support future receiving and movement flows.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "admin",
    title: "Admin / Organisation Settings",
    description: "Tenant branding, modules, users, integrations and workspace settings.",
    items: [
      {
        title: "Manage workspace branding",
        description: "How logos, colours and icons are planned to work.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "troubleshooting",
    title: "Troubleshooting",
    description: "Common access, upload and routing checks.",
    items: [
      {
        title: "Login and workspace access checks",
        description: "What to check when a user cannot reach the right workspace.",
        status: "Coming soon",
      },
    ],
  },
  {
    key: "release-notes",
    title: "Release Notes",
    description: "Version notes and product updates for EveryBatch.",
    items: [
      {
        title: "Recent platform changes",
        description: "A future guide to user-facing changes after deployment.",
        status: "Coming soon",
      },
    ],
  },
];

export const supportQuickLinks = [
  {
    title: "Open guides",
    description: "Browse the authenticated guide scaffold.",
    href: "/guides",
  },
  {
    title: "Support tickets",
    description: "Ticket intake is planned and not persistent yet.",
    href: "/tickets",
  },
  {
    title: "Contact support",
    description: "See current support contact guidance.",
    href: "/contact",
  },
];
