# Module Registry Alignment Review

## Review Status

This is an inspection/review document only.

No migrations, Supabase changes, database table changes, seed changes, app behaviour changes, navigation changes, permission changes, auth changes, route protection changes, RLS changes, UI changes or live business data connections are made by this task.

The goal is to identify alignment gaps before master admin/module management work begins.

## Current Intended Module Model

Current intended top-level modules:

- Dashboard
- Products
- Costings
- Production
- Inventory
- QA
- Logistics
- CRM
- Reports
- Admin

Principles:

- Main sidebar item = module.
- Nested sidebar item = page/workspace inside that module.
- Modules should be tenant-controllable where practical.
- Permissions should control user-level access inside enabled modules.
- Dashboard may be a default app area rather than a tenant-toggleable module.

Current Phase 1 demo modules:

- Dashboard
- Products
- Costings
- Production
- Inventory

## Current Database Module Seed Review

Migration reviewed:

- `supabase/migrations/009_seed_platform_modules_and_clean_eats_modules.sql`

Currently seeded modules:

| module_key | label | current status | aligns with intended structure? | notes/action needed |
| --- | --- | --- | --- | --- |
| `products` | Products | Active, enabled for Clean Eats | Yes | Description still mentions meals; future wording should align with Suppliers, Ingredients, Packaging, Components, Recipes and Finished Products. |
| `costings` | Costings | Active, enabled for Clean Eats | Yes | Description still mentions meal costing, which is acceptable for Meal Margins but should be reviewed against Recipes/Finished Products terminology. |
| `production` | Production | Active, enabled for Clean Eats | Yes | Aligns with current top-level Production module. |
| `inventory` | Inventory | Active, enabled for Clean Eats | Yes | Aligns with current top-level Inventory module. |
| `purchasing` | Purchasing | Active, enabled for Clean Eats | Partial | Current navigation treats Purchasing as an Inventory child workspace, not a top-level module. Keep permission for now; decide later whether database module remains separate. |
| `qa` | QA | Active, enabled for Clean Eats | Yes | Standalone module, hidden for demo user by permissions. |
| `logistics` | Logistics | Active, enabled for Clean Eats | Yes | Standalone module, hidden for demo user by permissions. |
| `wholesale` | Wholesale | Active, enabled for Clean Eats | No / needs review | Removed from sidebar. Likely should be deprecated, hidden, or later merged into CRM as a workspace. |
| `crm` | CRM | Active, enabled for Clean Eats | Yes | Standalone module; future Wholesale relationship needs planning. |
| `reports` | Reports | Active, enabled for Clean Eats | Yes | Standalone module, hidden for demo user by permissions. |
| `admin` | Admin | Active, enabled for Clean Eats | Yes | Tenant/admin area; visibility is driven by admin child permissions. |

Important gap:

- `dashboard` is visible as a main app area but is not seeded as a database module or TypeScript `ModuleKey`.

This may be correct if Dashboard is treated as the default signed-in landing area rather than a tenant-toggleable module.

## Current Navigation Review

File reviewed:

- `lib/navigation.ts`

| top-level nav item | route | requiredModuleKey | requiredPermissionKey | children | notes |
| --- | --- | --- | --- | --- | --- |
| Dashboard | `/dashboard` | none | none | none | Visible after valid app access. Not tenant-toggleable in current navigation. |
| Products | `/products` | `products` | `products.view` | Suppliers, Ingredients, Packaging, Components, Recipes, Finished Products | Aligns with current staff meeting direction. |
| Costings | `/costing-overview` | `costings` | `costings.view` | Ingredient Costs, Packaging Costs, Component Costs, Meal Margins, Price History | Aligns with Phase 1 demo direction. |
| Production | `/production` | `production` | `production.view` | Production Report, Production Plan, Production Areas, Production Tasks, Facility / iPad View | Task/facility children use `production.tasks.view`. |
| Inventory | `/inventory` | `inventory` | `inventory.view` | Goods Inwards, Batch Receiving, Stock Locations, Stock Movements, Purchasing, BOM / Traceability | Purchasing is a child workspace using `purchasing.view`, not a top-level module. |
| QA | `/qa` | `qa` | `qa.view` | Checks, Sign-offs, Incidents | Standalone module. |
| Logistics | `/logistics` | `logistics` | `logistics.view` | none | Standalone module. |
| CRM | `/crm` | `crm` | `crm.view` | none | Standalone module; Wholesale may feed into this later. |
| Reports | `/reports` | `reports` | `reports.view` | none | Standalone module. |
| Admin | `/organisation-settings` | `admin` | child-specific | Organisation Settings, Users, Modules, Integrations | Top-level Admin group has no direct permission; child visibility is permission-driven. |

Navigation no longer includes:

- Wholesale as a top-level item.
- Purchasing as a top-level item.
- Meals as a visible Products child.

## Current TypeScript Registry Review

Files reviewed:

- `lib/module-registry.ts`
- `lib/tenant-types.ts`

The TypeScript `ModuleKey` and `availableModules` still include:

- `products`
- `costings`
- `production`
- `inventory`
- `purchasing`
- `qa`
- `logistics`
- `wholesale`
- `crm`
- `reports`
- `admin`

Alignment notes:

- TypeScript registry currently mirrors the earlier database module seed.
- It does not include `dashboard`.
- It still treats `purchasing` as a module.
- It still treats `wholesale` as a module.
- Navigation now treats Purchasing as an Inventory child and does not show Wholesale.

This should be resolved before building tenant module toggles in a master/platform admin UI.

## Current Permission Key Review

Migration reviewed:

- `supabase/migrations/007_seed_default_roles_and_permissions.sql`

| module area | relevant permissions | aligns with current navigation? | notes/action needed |
| --- | --- | --- | --- |
| Products | `products.view`, `products.manage` | Yes | Used for Products and child routes. |
| Costings | `costings.view`, `costings.manage` | Yes | Used for Costings routes. |
| Production | `production.view`, `production.manage`, `production.tasks.*` | Yes | `production.tasks.view` is used for task/facility routes. |
| Inventory | `inventory.view`, `inventory.manage` | Yes | Used for Inventory overview and most Inventory child routes. |
| Goods Inwards | `goods_inwards.view`, `goods_inwards.manage` | Yes | Used as an Inventory child workspace permission. |
| Purchasing | `purchasing.view`, `purchasing.manage` | Partial | Still useful as an Inventory child workspace permission. May not need to remain a tenant-toggleable module. |
| QA | `qa.view`, `qa.manage`, `qa.checks.complete`, `qa.signoffs.manage` | Yes | Standalone QA module. |
| Logistics | `logistics.view`, `logistics.manage` | Yes | Standalone Logistics module. |
| Wholesale | `wholesale.view`, `wholesale.manage` | No / needs review | Permissions remain seeded but Wholesale is no longer visible in sidebar. Likely hide/deprecate until CRM/Wholesale relationship is planned. |
| CRM | `crm.view`, `crm.manage` | Yes | Standalone CRM module. |
| Reports | `reports.view`, `reports.manage` | Yes | Standalone Reports module. |
| Admin | `admin.organisation.*`, `admin.users.*`, `admin.modules.*`, `admin.integrations.*` | Yes | Used by admin routes and Admin child navigation. |
| Platform | `platform.tenants.*`, `platform.support.access` | Yes / future | Reserved for platform admin/control centre. |

Module-level permissions are now important for both sidebar filtering and direct route access.

## Phase 1 Demo User Alignment

Migration reviewed:

- `supabase/migrations/016_seed_phase_1_demo_user_role.sql`

The `phase_1_demo_user` role receives:

- `products.view`
- `costings.view`
- `production.view`
- `production.tasks.view`
- `inventory.view`
- `goods_inwards.view`
- `purchasing.view`

Expected visible modules:

- Dashboard
- Products
- Costings
- Production
- Inventory

Expected hidden modules:

- Admin
- QA
- Logistics
- CRM
- Reports

Current alignment:

- The demo role aligns with current Phase 1 demo direction.
- Purchasing is available as an Inventory child workspace through `purchasing.view`.
- Goods Inwards is available as an Inventory child workspace through `goods_inwards.view`.
- Hidden modules are blocked by missing permissions, even though those modules may be enabled for Clean Eats at tenant level.

## Mismatch / Cleanup List

| Issue | Risk | Recommended action | Timing |
| --- | --- | --- | --- |
| Wholesale exists in database modules, TypeScript `ModuleKey`, TypeScript registry and permissions, but is no longer visible in sidebar. | Future module admin could expose a module that is not part of the current product/menu model. | Do not delete casually. Decide whether to mark Wholesale hidden/deprecated or move it under CRM later. | Before master admin module toggles. |
| Purchasing exists as a database/TypeScript module, but navigation treats Purchasing as an Inventory child workspace. | Tenant module toggles could allow Purchasing independently from Inventory, which may confuse admins or users. | Keep `purchasing.view` permission for the child workspace. Decide whether `purchasing` remains a module key or becomes permission-only. | Before module enablement UI. |
| Dashboard is a main app area but not represented as a database module. | Master admin may need to explain why Dashboard cannot be toggled like other sidebar items. | Treat Dashboard as default app shell/landing area unless a future requirement says tenants can disable dashboards. | Document before master admin UI. |
| Product terminology shifted from Meals to Recipes + Finished Products. | Database seed descriptions and older docs may keep using meal wording, creating confusion in module admin labels/descriptions. | Update module descriptions in a reviewed migration later if needed. Keep route `/meals` legacy/guarded until retired. | Before real Products database design or module admin UI. |
| TypeScript registry mirrors old database module list rather than current final sidebar list. | Admin placeholder pages and future module toggles may show stale modules. | Align `availableModules`, `ModuleKey`, database seed and navigation after this review is accepted. | Next cleanup/migration planning step. |
| Route/module guards now use permissions, but enabled-module and permission metadata are maintained in separate places. | Drift can reappear when new modules/pages are added. | Future route/module guards should be driven consistently by shared module + permission metadata where practical. | Before adding more modules or master admin controls. |

## Recommended Alignment Strategy

Recommended approach:

- Do not immediately delete modules or permissions.
- Deprecate/hide older modules like Wholesale if needed.
- Keep `purchasing.view` and `purchasing.manage` permissions, but treat Purchasing as an Inventory workspace for now.
- Decide whether `purchasing` should remain in `public.modules` before building tenant module toggles.
- Decide whether Dashboard is a default app area or a database module.
- Add/adjust module metadata in code before creating platform admin UI.
- If database seed changes are needed, create a reviewed migration later.
- Preserve demo user access.
- Avoid breaking existing RLS policies.

## Proposed Final Module Registry Direction

Proposed future database module list:

Core visible modules:

- `products`
- `costings`
- `production`
- `inventory`
- `qa`
- `logistics`
- `crm`
- `reports`
- `admin`

Special cases:

- `dashboard` may be a default app area rather than a tenant-toggleable module.
- `purchasing` may be a workspace/permission under Inventory, not a top-level module.
- `wholesale` may become a CRM workspace later, not a top-level module.

This is a proposed direction only, not a migration.

## Impact On Future Master Admin Portal

The master admin portal will eventually need to manage tenant module enablement.

It should use the final aligned module registry.

Before building it, module keys and visibility rules should be consistent across:

- database module seed data
- `organisation_modules`
- TypeScript module registry
- navigation metadata
- route guards
- permission keys
- demo/client role seed data

Master admin should eventually manage:

- enabled modules per tenant
- module packs/templates
- tenant branding
- first admin user
- subscription/status later

## Recommended Next Step

Recommended next step:

**061 - Module Registry Alignment Migration / Cleanup Plan**

Before writing a migration, review this document and decide:

- whether to deprecate Wholesale
- whether to keep Purchasing as a database module or workspace only
- whether Dashboard should be in the modules table
- whether any permission keys need new naming later

Alternative:

**061 - Master Admin Portal Planning**

Use this alternative only if no immediate database/module registry cleanup is required.

## Guardrails

- Do not delete existing module/permission rows casually.
- Do not break Clean Eats demo user access.
- Do not change RLS without planning.
- Do not hard-code Clean Eats.
- Keep future resale/multi-tenant module control in mind.
- Keep navigation, permissions and database module keys aligned.

## Short Executive Summary

The app now treats main sidebar items as modules, but the database seed/module registry was created before the final navigation structure was refined. Before building the master admin portal, we should align module keys, permissions and navigation so future tenants can be created cleanly without code forks.
