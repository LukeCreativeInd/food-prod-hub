# Module Registry Cleanup Plan

## Planning Status

This is a planning document only.

No database changes are made. No navigation changes are made. No modules are deleted, archived or updated by this task.

The goal is to decide what should happen before master admin module management is built.

## Current Problem

The app's navigation and business understanding evolved after the original modules were seeded.

Main mismatches:

- `purchasing` is seeded as a top-level module, but now belongs under Inventory.
- `wholesale` is seeded as a top-level module/permission, but is hidden from the sidebar and likely belongs under CRM later.
- `dashboard` is a main landing area but is not in the database modules table.
- Future master admin module toggles need clean module definitions.

## Module Definitions Going Forward

Module:

A top-level tenant-controllable area of the HUB.

Workspace/Page:

A nested screen inside a module.

Default App Area:

A required/default area like Dashboard that may not be tenant-toggleable.

Current recommended module list:

- `products`
- `costings`
- `production`
- `inventory`
- `qa`
- `logistics`
- `crm`
- `reports`
- `admin`

Default app area:

- `dashboard`

Workspaces:

- Purchasing under Inventory
- Goods Inwards under Inventory
- Batch Receiving under Inventory
- Production Tasks under Production
- Ingredient Costs under Costings
- Finished Products under Products
- Other nested screens that support their parent module

## Purchasing Recommendation

Purchasing should be treated as an Inventory workspace for now, not a top-level module.

Current reality:

- `public.modules` includes `purchasing`.
- Permissions include `purchasing.view` and `purchasing.manage`.
- Navigation places Purchasing under Inventory.
- `phase_1_demo_user` has `purchasing.view`.

Recommended approach:

- Keep purchasing permissions because they are useful.
- Do not delete the `purchasing` module row yet.
- Consider marking the `purchasing` module as inactive or archived in a future migration only if safe.
- Alternatively, keep the module row but do not expose it as top-level.
- For master admin, avoid showing Purchasing as a top-level tenant module unless intentionally reintroduced later.
- Treat `purchasing.view` as a workspace permission under Inventory.

Recommended immediate action:

No database change yet. Document Purchasing as a workspace under Inventory.

## Wholesale Recommendation

Wholesale should not be a visible top-level module for now.

Current reality:

- `public.modules` includes `wholesale`.
- Permissions include `wholesale.view` and `wholesale.manage`.
- Sidebar no longer shows Wholesale.
- Business direction is that wholesale/customer/account workflows will feed into CRM later.

Recommended approach:

- Do not delete the Wholesale module or permissions yet.
- Consider marking Wholesale inactive/deprecated in a future reviewed migration.
- Keep Wholesale permissions dormant for now.
- Future CRM planning can decide whether Wholesale becomes:
  - CRM workspace
  - CRM account type
  - separate module again later
- Master admin should not expose Wholesale as a normal selectable module for now.

Recommended immediate action:

No database change yet. Document Wholesale as dormant/deprecated pending CRM planning.

## Dashboard Recommendation

Dashboard should remain a default app landing area.

Current reality:

- Dashboard appears as a top-level sidebar item.
- Dashboard is not currently a seeded module.
- Dashboard is useful for all valid app users.

Recommended approach:

- Do not add Dashboard to the modules table unless tenant-specific dashboard enablement is needed later.
- Treat Dashboard as a default app area available after app access.
- Master admin does not need to toggle Dashboard separately in early versions.

## Admin Recommendation

Admin is a tenant/platform management module.

Current reality:

- Admin exists as a module.
- Admin links are permission-aware.
- Demo user cannot see or access Admin.
- Luke/platform_admin can access Admin.

Recommended approach:

- Keep Admin as a module.
- Continue permission-gating Admin sub-pages.
- Future master admin should distinguish tenant Admin from platform/global Admin.

## Proposed Future Module Registry State

| module_key | label | recommended status | top-level visible? | notes |
| --- | --- | --- | --- | --- |
| `products` | Products | active | yes | Core Phase 1 and future tenant module. |
| `costings` | Costings | active | yes | Core Phase 1 and future tenant module. |
| `production` | Production | active | yes | Core Phase 1 and future tenant module. |
| `inventory` | Inventory | active | yes | Core Phase 1 and future tenant module. |
| `qa` | QA | active | yes | Later module; hidden from demo user by permissions. |
| `logistics` | Logistics | active | yes | Later module; hidden from demo user by permissions. |
| `crm` | CRM | active | yes | Future commercial/customer module. |
| `reports` | Reports | active | yes | Future reporting module. |
| `admin` | Admin | active | yes | Tenant/admin management area. |
| `purchasing` | Purchasing | workspace/dormant | no top-level | Treat as Inventory workspace for now. |
| `wholesale` | Wholesale | dormant/deprecated pending CRM | no top-level | Keep dormant until CRM/Wholesale planning is clearer. |
| `dashboard` | Dashboard | default app area | not module for now | Keep as required landing area after app access. |

## Potential Migration Options

### Option A - No Database Change For Now

- Keep `purchasing` and `wholesale` module rows.
- Master admin planning treats them as hidden/dormant.
- Lowest risk.

Recommendation:

Use Option A now.

### Option B - Mark Purchasing And Wholesale Inactive

- Update `modules.status` to `inactive`.
- Risk: could affect current permission/module filtering or future assumptions.
- Requires careful testing.

Recommendation:

Do not do this until master admin behaviour and module filtering expectations are confirmed.

### Option C - Add Module Type / Visibility Metadata Later

- More flexible.
- Could distinguish top-level module vs workspace vs deprecated.
- Requires schema change.
- Better for mature master admin but not urgent.

Recommendation:

Consider later if master admin needs to manage module taxonomy cleanly.

### Option D - Delete Rows

- Not recommended.
- Could break historical references, permissions, `organisation_modules` or future assumptions.

Recommendation:

Avoid deleting module rows casually.

## Future Master Admin Impact

The master admin portal should:

- show only current top-level tenant modules by default
- hide dormant/workspace modules from tenant module toggles
- treat Purchasing as part of Inventory
- treat Wholesale as a future CRM/workspace planning item
- keep Dashboard as default and not toggleable initially

## Recommended Next Step

Master Admin Portal planning now exists at [Master Admin Portal Planning](62-master-admin-portal-planning.md). It uses this cleanup direction and recommends a lightweight read-only `/platform` v1 before write/create flows.

Recommended next step:

**063 - Platform Admin Route And Read-Only Skeleton**

Proceed to a lightweight read-only platform admin skeleton using this module registry direction, without requiring immediate database cleanup.

Before building actual master admin UI, a later step can revisit:

- whether `module_type` metadata is needed
- whether `purchasing` or `wholesale` should be marked inactive
- whether CRM should get Wholesale workspaces

## Guardrails

- Do not delete modules casually.
- Do not remove permissions casually.
- Do not break demo user.
- Do not hard-code Clean Eats.
- Do not expose dormant modules in tenant setup unless intentionally planned.
- Keep module registry, navigation and permissions aligned.
- Treat this as product architecture cleanup, not urgent migration work.

## Short Executive Summary

The safest path is to leave the database module rows unchanged for now, treat Purchasing as an Inventory workspace, treat Wholesale as dormant pending CRM planning, keep Dashboard as a default app area, and proceed to Master Admin Portal planning using the cleaned top-level module model.
