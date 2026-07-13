# Module-Level Permission-Aware Navigation

## Status

Module-level permission-aware sidebar visibility has been added.

This started as a navigation UX change only. A later 057 follow-up added matching route-level permission guards for non-admin module pages so direct URLs follow the same access model as the sidebar.

## What Changed

Navigation definitions now include module view permissions for non-admin modules.

The existing `AppShell` filtering already checks both:

- enabled module keys
- current user permission keys

Adding `requiredPermission` values to the non-admin module navigation means a module is visible only when:

1. the module is enabled for the current organisation
2. the current user has the required view permission

Dashboard remains visible after valid app access and does not require a module permission.

## Module Permission Mapping

| Module | Required module | Required permission |
| --- | --- | --- |
| Dashboard | none | none |
| Products | `products` | `products.view` |
| Costings | `costings` | `costings.view` |
| Production | `production` | `production.view` |
| Inventory | `inventory` | `inventory.view` |
| QA | `qa` | `qa.view` |
| Logistics | `logistics` | `logistics.view` |
| CRM | `crm` | `crm.view` |
| Reports | `reports` | `reports.view` |
| Admin | `admin` | visible only when at least one admin child permission is available |

## Child Link Permissions

Child links now use the closest existing seeded permission:

- Products children inherit `products.view`.
- Costings children inherit `costings.view`.
- Production Report, Plan and Areas inherit `production.view`.
- Production Tasks and Facility / iPad View use `production.tasks.view`.
- Inventory overview-style children inherit `inventory.view`.
- Goods Inwards uses `goods_inwards.view`.
- Purchasing uses `purchasing.view`.
- QA children inherit `qa.view`.
- Admin children keep their existing specific admin permissions.

No new database permissions were invented for this task.

## Expected Luke / Platform Admin Sidebar

Luke/platform admin should still see:

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

This is because `platform_admin` has all seeded permissions.

## Expected Future Phase 1 Demo User Sidebar

The future `phase_1_demo_user` should see:

- Dashboard
- Products
- Costings
- Production
- Inventory

The future `phase_1_demo_user` should not see:

- QA
- Logistics
- CRM
- Reports
- Admin

This matches the role seeded in `supabase/migrations/016_seed_phase_1_demo_user_role.sql`.

## Security Note

Hidden sidebar links are UX only.

Route-level module permission guards have now been added after navigation filtering. Non-admin module pages use `requirePermissionAccess()` with the same seeded permission keys shown in the navigation mapping.

This means a user without `qa.view`, `logistics.view`, `crm.view` or `reports.view` should not be able to load those routes by direct URL.

## Not Changed

- No users were created.
- No profiles were created.
- No memberships were created.
- No permissions were added or removed.
- No migrations were created or applied.
- No RLS policies were changed.
- No enabled-module filtering logic was removed.
- Route protection was hardened after the original navigation filtering step.
- No module pages were connected to live Supabase business data.

## Next Step

Recommended next step:

**052 - Create Demo/Test User Manual Setup**

Create the Supabase Auth user, matching profile and Clean Eats membership with `role_key = phase_1_demo_user`, then verify the sidebar shows only the intended Phase 1 demo modules.

Module-level navigation is ready to support demo user setup. The manual setup guide is documented at [Demo/Test User Manual Setup](52-demo-test-user-manual-setup.md).
