export type SupportGuideStatus = "available" | "draft" | "coming_soon";

export type SupportGuideSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type SupportGuideLink = {
  label: string;
  href: string;
};

export type SupportGuide = {
  slug: string;
  categoryKey: string;
  categoryTitle: string;
  title: string;
  summary: string;
  status: SupportGuideStatus;
  audience: string;
  estimatedRead: string;
  sections: SupportGuideSection[];
  relatedLinks: SupportGuideLink[];
};

export type SupportGuideCategory = {
  key: string;
  title: string;
  description: string;
  guides: SupportGuide[];
};

const categoryDefinitions = [
  {
    key: "getting-started",
    title: "Getting Started",
    description: "Sign in, workspace selection and first navigation steps.",
  },
  {
    key: "products",
    title: "Products",
    description: "Suppliers, internal items, components and finished products.",
  },
  {
    key: "costings",
    title: "Costings",
    description: "Costs, sell prices, readiness and margin review.",
  },
  {
    key: "formula-builder",
    title: "Formula Builder",
    description: "Component and finished-product formula setup guidance.",
  },
  {
    key: "supplier-invoice-intake",
    title: "Supplier Invoice Intake",
    description: "Upload, extract, review and commit supplier invoices.",
  },
  {
    key: "inventory",
    title: "Inventory",
    description: "Stock locations, inventory setup and future movements.",
  },
  {
    key: "operations",
    title: "Operations",
    description: "Production, QA, logistics and operational workflows.",
  },
  {
    key: "commercial",
    title: "Commercial",
    description: "CRM, reporting and customer-facing workflows.",
  },
  {
    key: "admin",
    title: "Admin / Organisation Settings",
    description: "Access, workspace settings and future support workflows.",
  },
  {
    key: "troubleshooting",
    title: "Troubleshooting",
    description: "Common access, upload and readiness checks.",
  },
  {
    key: "release-notes",
    title: "Release Notes",
    description: "Recent user-facing EveryBatch changes.",
  },
] as const;

export const supportGuides: SupportGuide[] = [
  {
    slug: "getting-started",
    categoryKey: "getting-started",
    categoryTitle: "Getting Started",
    title: "Getting started with EveryBatch",
    summary:
      "A short orientation for signing in, choosing the right workspace and finding the main Clean Eats Hub areas.",
    status: "available",
    audience: "All signed-in users",
    estimatedRead: "4 min read",
    sections: [
      {
        heading: "Sign in from the central app",
        body: [
          "Use app.everybatchmrp.com as the central EveryBatch login and workspace selector.",
          "After signing in, choose the workspace you need. Most Clean Eats users will open Clean Eats Hub. Platform operators may also see the EveryBatch Platform Admin option.",
        ],
      },
      {
        heading: "Open the right workspace",
        body: [
          "Clean Eats Hub is the tenant workspace for Clean Eats Australia. It is also available directly at cleaneats.everybatchmrp.com.",
          "The Platform Admin console is separate from the tenant workspace and is only shown to users with platform access.",
        ],
      },
      {
        heading: "Find your way around",
        body: [
          "Use the sidebar to move between Products, Costings, Production, Inventory, Tools and Admin areas.",
          "The help menu and support site remain available for guide content, troubleshooting and workspace-linked support tickets.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Workspace selector and domains", href: "/support/guides/workspace-selector-and-domains" },
      { label: "Sign-in and access troubleshooting", href: "/support/guides/sign-in-and-access-troubleshooting" },
      { label: "Contact support", href: "/support/contact" },
    ],
  },
  {
    slug: "workspace-selector-and-domains",
    categoryKey: "getting-started",
    categoryTitle: "Getting Started",
    title: "Workspace selector and domains",
    summary:
      "How the central app, tenant workspace, platform admin and support domains fit together.",
    status: "available",
    audience: "Managers and admins",
    estimatedRead: "5 min read",
    sections: [
      {
        heading: "Domain roles",
        body: [
          "EveryBatch uses separate domains so each part of the platform has a clear job.",
        ],
        bullets: [
          "app.everybatchmrp.com is the central login and workspace selector.",
          "cleaneats.everybatchmrp.com is the Clean Eats tenant workspace.",
          "admin.everybatchmrp.com is the Platform Admin console.",
          "support.everybatchmrp.com is the authenticated support help centre.",
        ],
      },
      {
        heading: "Why the selector appears",
        body: [
          "The workspace selector appears when EveryBatch needs you to choose which authorised area to open after login.",
          "On a tenant domain such as cleaneats.everybatchmrp.com, the workspace is already implied, so users should go straight to the tenant app after authentication.",
        ],
      },
      {
        heading: "If a workspace is missing",
        body: [
          "A missing workspace usually means the user account does not yet have an active membership for that organisation or platform area.",
          "Sign out and sign back in after a new membership is added. If the option is still missing, contact support.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Getting started", href: "/support/guides/getting-started" },
      { label: "Sign-in and access troubleshooting", href: "/support/guides/sign-in-and-access-troubleshooting" },
    ],
  },
  {
    slug: "products-overview",
    categoryKey: "products",
    categoryTitle: "Products",
    title: "Products overview",
    summary:
      "How supplier records, internal items, components and finished products are organised in Clean Eats Hub.",
    status: "available",
    audience: "Operations, purchasing and product teams",
    estimatedRead: "5 min read",
    sections: [
      {
        heading: "Core catalogue areas",
        body: [
          "Products is the home for supplier-facing records and internal catalogue items.",
          "Suppliers describe who Clean Eats buys from. Internal items describe what the business recognises and costs internally, such as ingredients, packaging, components and finished products.",
        ],
      },
      {
        heading: "Current manual foundation",
        body: [
          "Supplier and internal item pages support manual review and maintenance foundations.",
          "Component and finished product areas connect into formula and costing readiness without creating production or stock movements yet.",
          "Finished product pages now show setup readiness across formula, cost, sell price and margin so teams can see what still needs review before production depends on the item.",
        ],
      },
      {
        heading: "Good data habits",
        body: [
          "Keep supplier descriptions separate from internal item names. Supplier source text should stay intact, while reviewed internal names should be clear for costing and production users.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Formula Builder basics", href: "/support/guides/formula-builder-basics" },
      { label: "UOM Conversion basics", href: "/support/guides/uom-conversion-basics" },
      { label: "Supplier Invoice Intake basics", href: "/support/guides/supplier-invoice-intake-basics" },
    ],
  },
  {
    slug: "uom-conversion-basics",
    categoryKey: "products",
    categoryTitle: "Products",
    title: "UOM Conversion basics",
    summary:
      "How reviewed pack and purchase-unit conversion rules prepare EveryBatch for costing, receiving and production workflows.",
    status: "available",
    audience: "Operations, purchasing, inventory and costing users",
    estimatedRead: "5 min read",
    sections: [
      {
        heading: "What UOM conversions are for",
        body: [
          "UOM conversion rules describe reviewed relationships between units, such as 1 bunch Basil = 100 g or 1 box Chicken Thigh = 10 kg.",
          "Metric unit changes such as kg to g and l to ml are handled globally. Pack units such as bunch, box, carton, bottle and tray need reviewed workspace rules because pack size can vary by supplier and item.",
        ],
      },
      {
        heading: "Rule scope",
        body: [
          "Tenant-wide rules are generic and should be used carefully. Internal item rules are more specific. Supplier item rules are the most specific and are preferred when a supplier pack size is known.",
          "Create rules as drafts first, then activate them after review. Duplicate active open-ended rules for the same scope and unit pair are blocked.",
        ],
      },
      {
        heading: "Source of truth",
        body: [
          "UOM conversion rules do not replace supplier invoices, approved prices or formula quantities.",
          "They also do not change historical costing snapshots or stock movements. They are reviewed interpretation rules that future workflows can use when converting between purchase, inventory, costing and production units.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Products overview", href: "/support/guides/products-overview" },
      { label: "Costings overview", href: "/support/guides/costings-overview" },
      { label: "Supplier Invoice Intake basics", href: "/support/guides/supplier-invoice-intake-basics" },
    ],
  },
  {
    slug: "costings-overview",
    categoryKey: "costings",
    categoryTitle: "Costings",
    title: "Costings overview",
    summary:
      "A practical guide to ingredient costs, packaging costs, sell prices, price history and meal margin readiness.",
    status: "available",
    audience: "Operations, finance and management users",
    estimatedRead: "6 min read",
    sections: [
      {
        heading: "What costings reads today",
        body: [
          "Costing views use reviewed supplier item prices, internal item mappings, formula lines and sell price records where those foundations exist.",
          "The dashboard favours readiness signals over assumptions. Missing prices, missing formulas or mismatched units are shown as items to resolve.",
        ],
      },
      {
        heading: "Sell price readiness",
        body: [
          "Meal margins only use active, non-archived current sell prices. Draft prices can be prepared, but they do not count as ready.",
          "Only one active open-ended sell price should exist for a finished product and channel at a time.",
        ],
      },
      {
        heading: "Margin calculation preview",
        body: [
          "Meal margin views combine active formula cost readiness with active current sell prices to show margin status.",
          "If a formula line cannot be costed, the page should show the reason instead of pretending the margin is complete.",
        ],
      },
      {
        heading: "Snapshots versus live previews",
        body: [
          "Meal Margins and costing subpages are live previews. They can change when formulas, approved supplier prices or sell prices change.",
          "Use the snapshot controls on component and finished product detail pages when a cost or margin review point needs to be locked. Blocked snapshots can still be useful because they preserve the missing price, unit mismatch or sell price blocker at the time of review.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Formula Builder basics", href: "/support/guides/formula-builder-basics" },
      { label: "Supplier Invoice Intake basics", href: "/support/guides/supplier-invoice-intake-basics" },
    ],
  },
  {
    slug: "formula-builder-basics",
    categoryKey: "formula-builder",
    categoryTitle: "Formula Builder",
    title: "Formula Builder basics",
    summary:
      "How component and finished product formulas are reviewed before they feed costing readiness.",
    status: "available",
    audience: "Operations and product teams",
    estimatedRead: "6 min read",
    sections: [
      {
        heading: "Formula structure",
        body: [
          "A formula version belongs to an output internal item. Formula lines list the input internal items and quantities needed to make that output.",
          "Component formulas and finished product formulas use the same foundation, but they represent different operational levels.",
          "Component formulas describe prepared or intermediate batch outputs such as sauces, cooked rice, spice mixes or cooked proteins. Finished product formulas describe sellable meals or SKUs and can use components, ingredients and packaging as inputs.",
        ],
      },
      {
        heading: "Review before relying on cost",
        body: [
          "Every line should be checked for the right internal item, quantity and unit before the cost is trusted.",
          "Missing approved prices, missing child formulas, unsupported item types and purchase-unit conversion needs should remain visible as readiness messages. Simple metric kg/g and l/ml conversions are handled safely; pack units such as bunch, box and carton still need review. Use Ingredient Costs, Packaging Costs and Component Costs to resolve blockers.",
          "Finished product margin readiness also needs an active current sell price. Draft or archived sell prices can be reviewed, but they do not count as ready.",
        ],
      },
      {
        heading: "What it does not do yet",
        body: [
          "The builder does not create stock movements, production batches or purchasing requirements. It prepares reviewed formula data for costing and later production workflows.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Products overview", href: "/support/guides/products-overview" },
      { label: "Costings overview", href: "/support/guides/costings-overview" },
    ],
  },
  {
    slug: "supplier-invoice-intake-basics",
    categoryKey: "supplier-invoice-intake",
    categoryTitle: "Supplier Invoice Intake",
    title: "Supplier Invoice Intake basics",
    summary:
      "How to upload a supplier invoice, review extracted lines and commit approved supplier price information.",
    status: "available",
    audience: "Purchasing, warehouse and operations users",
    estimatedRead: "7 min read",
    sections: [
      {
        heading: "Review-first flow",
        body: [
          "Supplier Invoice Intake is designed to upload a document, extract readable values, let a reviewer confirm the details and then commit reviewed supplier item and price records.",
          "Extraction does not auto-commit. The review page keeps source supplier values separate from corrected and internal values.",
        ],
      },
      {
        heading: "Supported supplier parsers",
        body: [
          "Current supplier-specific parsers cover the first Clean Eats review set.",
        ],
        bullets: [
          "Cammaroto Poultry",
          "Melbourne Produce Merchants",
          "Del-Re National Food Group",
          "Pacific Meat Sales",
          "Alba Cheese",
          "Grange Meat Co",
          "Il Nonno",
        ],
      },
      {
        heading: "What commit creates",
        body: [
          "After review, commit can create or reuse supplier records, supplier items, internal items, mappings, price observations and approved supplier prices.",
          "It does not post stock movements, purchase orders, accounting updates or supplier payment detail changes.",
          "Reviewed and mapped invoice lines can now be sent to Goods Inwards as a draft receipt. The draft still needs warehouse review and manual posting before stock is updated.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Products overview", href: "/support/guides/products-overview" },
      { label: "Costings overview", href: "/support/guides/costings-overview" },
    ],
  },
  {
    slug: "inventory-overview",
    categoryKey: "inventory",
    categoryTitle: "Inventory",
    title: "Inventory overview",
    summary:
      "How stock locations, Goods Inwards and stock movements work together in the current inventory foundation.",
    status: "available",
    audience: "Warehouse and operations users",
    estimatedRead: "4 min read",
    sections: [
      {
        heading: "Current foundation",
        body: [
          "Inventory now includes stock locations, manual Goods Inwards receipts and a read-only stock movement ledger.",
          "Location setup helps the business describe where stock can be stored. Goods Inwards captures physical supplier deliveries and posting creates lot records plus receipt stock movements.",
        ],
      },
      {
        heading: "Goods Inwards basics",
        body: [
          "Create a draft receipt when goods arrive, add or edit receiving lines, choose the internal item and stock location, then post the receipt after review.",
          "Draft receipt headers and draft lines can be corrected before posting. Invoice-linked receiving lines keep their source link, but warehouse users can still correct receiving fields such as location, quantity, lot details, QA status and notes.",
          "Posting now runs through a transaction-safe database action, so lot and stock movement creation complete together or not at all. Lines needing unknown unit conversion or marked as rejected cannot be posted in v1. Held lines can be posted as stock on hold.",
        ],
      },
      {
        heading: "Stock On Hand",
        body: [
          "Stock On Hand is a read-only summary calculated from posted stock movement ledger rows.",
          "The page groups stock by item, location, lot and unit. Available stock and held stock are shown separately using lot and QA status context.",
          "Mixed units are flagged instead of silently converted. Use reviewed UOM conversion rules before relying on a single normalised total for items that appear in multiple units.",
        ],
      },
      {
        heading: "Inventory Traceability",
        body: [
          "Inventory Traceability is a read-only inbound map for real inventory lots. It follows each lot from supplier invoice evidence or manual Goods Inwards receiving through receipt lines, inventory lots, stock movement ledger rows and Stock On Hand context.",
          "Invoice-linked lots can point back to the supplier invoice when the current role can view Purchase Documents. Manual receipts are clearly labelled as manual receiving instead of pretending invoice evidence exists.",
          "The current map stops at inbound stock. Production consumption, dispatch/customer traceability and recall-style forward tracing remain future workflows.",
        ],
      },
      {
        heading: "What is still separate",
        body: [
          "Supplier Invoice Intake can create a draft Goods Inwards receipt from eligible reviewed invoice lines, but it does not post stock automatically.",
          "The receiving user still reviews locations, lot/expiry details, QA status and conversion blockers before posting.",
          "Posted receipts are locked. Future corrections should use stock adjustment or reversal workflows rather than editing posted receipt lines.",
          "Manual stock adjustments, reversals, valuation, purchase orders, QA checklists, barcode scanning and production consumption remain future workflows.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Stock On Hand", href: "/stock-on-hand" },
      { label: "Inventory Traceability", href: "/inventory-traceability" },
      { label: "Supplier Invoice Intake basics", href: "/support/guides/supplier-invoice-intake-basics" },
      { label: "Products overview", href: "/support/guides/products-overview" },
    ],
  },
  {
    slug: "sign-in-and-access-troubleshooting",
    categoryKey: "troubleshooting",
    categoryTitle: "Troubleshooting",
    title: "Sign-in and access troubleshooting",
    summary:
      "Common checks when a user cannot sign in, cannot see a workspace or lands on the wrong domain.",
    status: "available",
    audience: "All users and workspace admins",
    estimatedRead: "5 min read",
    sections: [
      {
        heading: "Start with the right domain",
        body: [
          "Use app.everybatchmrp.com for central login and workspace selection.",
          "Use cleaneats.everybatchmrp.com for the Clean Eats tenant workspace, admin.everybatchmrp.com for Platform Admin access and support.everybatchmrp.com for help content.",
        ],
      },
      {
        heading: "If login loops or access looks stale",
        body: [
          "Sign out, close old tabs and sign back in from the central app. A one-time sign-in refresh can be needed after auth cookie or domain changes.",
          "If a workspace still does not appear, ask an admin to confirm the user has an active profile and membership for that workspace.",
        ],
      },
      {
        heading: "If a page says access is blocked",
        body: [
          "The user may be signed in but missing the role or permission needed for that area.",
          "Platform Admin is only for platform operators. Purchase Document Intake is intentionally not available to demo read-only users.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Workspace selector and domains", href: "/support/guides/workspace-selector-and-domains" },
      { label: "Contact support", href: "/support/contact" },
    ],
  },
  {
    slug: "production-workflow",
    categoryKey: "operations",
    categoryTitle: "Operations",
    title: "Production workflow",
    summary:
      "Plan production days, planned output lines and planned batch headers before execution workflows are built.",
    status: "available",
    audience: "Production managers and staff",
    estimatedRead: "5 min",
    sections: [
      {
        heading: "What Production Plan v1 does",
        body: [
          "Production Plan v1 lets authorised users create a draft production plan for a date, add planned finished product or component outputs, and create planned batch/run headers from those lines.",
          "Lines can attach active formula versions and recent costing snapshots when those setup records exist. If a formula is missing, the line can still be captured but is marked blocked so the setup gap is visible.",
        ],
      },
      {
        heading: "What it does not do yet",
        body: [
          "Production plans do not reserve inventory, consume stock, create output stock, generate facility tasks or update reports.",
          "Planned batches are planning records only. QA release, tablet execution, stock issue, output stock movements and production reporting are future workflows.",
        ],
      },
      {
        heading: "Common checks",
        body: [
          "If no production areas appear, keep the line unassigned or ask an admin to review Production Areas setup later.",
          "If a line is blocked, check whether the chosen finished product or component has an active formula.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Production Plan", href: "/production-plan" },
      { label: "Formula Builder basics", href: "/support/guides/formula-builder-basics" },
      { label: "Inventory basics", href: "/support/guides/inventory-basics" },
    ],
  },
  {
    slug: "qa-checks",
    categoryKey: "operations",
    categoryTitle: "Operations",
    title: "QA checks",
    summary:
      "How Receiving QA checks attach quality results and review decisions to Goods Inwards records.",
    status: "available",
    audience: "QA and operations users",
    estimatedRead: "5 min",
    sections: [
      {
        heading: "Receiving QA checks",
        body: [
          "Receiving QA starts from a real Goods Inwards receipt or receipt line and uses a published Receiving QA template.",
          "A check can save typed checklist results while in progress, then move to completed or needs review when the checklist is finished.",
        ],
      },
      {
        heading: "Review decisions",
        body: [
          "Failed, warning, uncertain or review-triggering results can mark a check as needing QA review.",
          "QA reviewers can record accepted, conditional acceptance, rejected or escalated decisions. These decisions are QA records only and do not automatically change inventory availability.",
        ],
      },
      {
        heading: "Current boundaries",
        body: [
          "Receiving QA does not create inventory holds, release stock, dispose stock, create stock movements or alter Goods Inwards posting.",
          "Hold recommendations can be recorded in notes for follow-up. Formal QA hold/release inventory control is planned for a later workflow.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Receiving Checks", href: "/qa/receiving" },
      { label: "QA Templates", href: "/qa/templates" },
      { label: "Goods Inwards", href: "/goods-inwards" },
    ],
  },
  {
    slug: "logistics",
    categoryKey: "operations",
    categoryTitle: "Operations",
    title: "Logistics",
    summary:
      "Planned guide for future delivery, dispatch and logistics workflows.",
    status: "coming_soon",
    audience: "Logistics and operations users",
    estimatedRead: "Coming soon",
    sections: [],
    relatedLinks: [],
  },
  {
    slug: "crm",
    categoryKey: "commercial",
    categoryTitle: "Commercial",
    title: "CRM",
    summary:
      "Planned guide for customer and wholesale relationship workflows.",
    status: "coming_soon",
    audience: "Commercial users",
    estimatedRead: "Coming soon",
    sections: [],
    relatedLinks: [],
  },
  {
    slug: "reports",
    categoryKey: "commercial",
    categoryTitle: "Commercial",
    title: "Reports",
    summary:
      "Planned guide for management reporting and operational insights.",
    status: "coming_soon",
    audience: "Managers and admins",
    estimatedRead: "Coming soon",
    sections: [],
    relatedLinks: [],
  },
  {
    slug: "support-tickets",
    categoryKey: "admin",
    categoryTitle: "Admin",
    title: "Support tickets",
    summary:
      "How to create, review and reply to workspace-linked EveryBatch support tickets.",
    status: "available",
    audience: "All signed-in users",
    estimatedRead: "4 min read",
    sections: [
      {
        heading: "Create a ticket",
        body: [
          "Use Support Tickets to create a customer-visible request for the selected workspace.",
          "New tickets start as waiting on support, which means EveryBatch needs to review or respond.",
          "From inside the app, use Report an issue on this page from the Help menu to include safe page/module context automatically.",
        ],
      },
      {
        heading: "Reply and status flow",
        body: [
          "When EveryBatch replies, the ticket may move to waiting on customer. If you reply again, it moves back to waiting on support.",
          "Resolved tickets can be replied to if the issue still needs attention. Closed tickets do not accept new customer comments in v1.",
        ],
      },
      {
        heading: "Find tickets",
        body: [
          "Use status, category and search filters on the ticket list when you need to find a previous request.",
          "Clear filters if a ticket seems missing, then confirm the selected workspace is correct.",
        ],
      },
      {
        heading: "What customers can see",
        body: [
          "The customer support portal shows customer-visible comments and timeline events only.",
          "Internal Platform Admin notes are not shown in the customer support portal.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Support tickets", href: "/support/tickets" },
      { label: "New support ticket", href: "/support/tickets/new" },
      { label: "Troubleshooting", href: "/support/troubleshooting" },
    ],
  },
  {
    slug: "platform-admin-for-operators",
    categoryKey: "admin",
    categoryTitle: "Admin",
    title: "Platform Admin for operators",
    summary:
      "Planned guide for platform-owner operators who manage tenants and platform settings.",
    status: "coming_soon",
    audience: "Platform operators",
    estimatedRead: "Coming soon",
    sections: [],
    relatedLinks: [],
  },
];

export const availableSupportGuides = supportGuides.filter(
  (guide) => guide.status === "available",
);

export const popularSupportGuides = availableSupportGuides.filter((guide) =>
  [
    "getting-started",
    "supplier-invoice-intake-basics",
    "formula-builder-basics",
    "costings-overview",
    "sign-in-and-access-troubleshooting",
  ].includes(guide.slug),
);

export const supportGuideCategories: SupportGuideCategory[] =
  categoryDefinitions.map((category) => ({
    ...category,
    guides: supportGuides.filter((guide) => guide.categoryKey === category.key),
  }));

export const supportQuickLinks = [
  {
    title: "Open guides",
    description: "Browse static help guides and planned guide topics.",
    href: "/guides",
  },
  {
    title: "Support tickets",
    description: "Create and review customer-visible workspace tickets.",
    href: "/tickets",
  },
  {
    title: "Contact support",
    description: "See current support contact guidance.",
    href: "/contact",
  },
];

export function getSupportGuideBySlug(slug: string) {
  return supportGuides.find((guide) => guide.slug === slug);
}

export function getSupportGuideStatusLabel(status: SupportGuideStatus) {
  if (status === "available") {
    return "Available";
  }

  if (status === "draft") {
    return "Draft";
  }

  return "Coming soon";
}

export function getSupportGuideStatusTone(
  status: SupportGuideStatus,
): "success" | "warning" | "neutral" | "info" {
  if (status === "available") {
    return "success";
  }

  if (status === "draft") {
    return "warning";
  }

  return "neutral";
}
