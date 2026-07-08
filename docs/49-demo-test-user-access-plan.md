# Demo/Test User Access Plan

## Planning Status

This is a planning document only.

No user is created by this task. No memberships are created by this task. No roles or permissions are changed by this task. No RLS policies are changed by this task.

This plan should be reviewed before creating the demo/test user.

## Purpose of Demo/Test User

The demo/test user will let Clean Eats staff log in and review the Phase 1 demo modules using sample data.

Purpose:

- let staff explore the HUB safely
- avoid giving staff admin/platform access
- collect feedback on Products, Costings, Production and Inventory
- validate flow and terminology before real database tables/imports
- keep the environment safe while screens are still sample/demo only

## Recommended Demo User

Suggested identity placeholder:

- Name: Clean Eats Demo User
- Email: use a controlled internal/demo email, for example `demo@cleaneats.local`, or a real controlled email Luke can access

Important:

- Do not store passwords in the repo or docs.
- Create the user manually in Supabase Auth later.
- Use a password that can be safely shared only with the intended internal reviewers, or use invite/password reset if preferred.
- This should not be used for production staff long term.

## Recommended Role Approach

Recommend creating a dedicated organisation-scoped role later:

`phase_1_demo_user`

This is better than using `staff` or `viewer` because it can be tailored to the demo review.

Purpose:

- access Phase 1 demo modules
- no Admin access
- no platform access
- no user/module/integration management
- no sensitive audit log access
- no write/manage permissions initially

This role does not need to be created in this planning task. It will likely require a reviewed migration/seed update in the next implementation step.

## Recommended Permissions

Planned view permissions for the demo role:

- `products.view`
- `costings.view`
- `production.view`
- `production.tasks.view`
- `inventory.view`
- `goods_inwards.view`
- `purchasing.view`

Potential later permission:

- `reports.view`, only if dashboard/report placeholders need it later

Recommended to exclude for now:

- `admin.organisation.view`
- `admin.organisation.manage`
- `admin.users.view`
- `admin.users.manage`
- `admin.modules.view`
- `admin.modules.manage`
- `admin.integrations.view`
- `admin.integrations.manage`
- `platform.tenants.view`
- `platform.tenants.manage`
- `platform.support.access`
- `qa.view`, unless QA is later included
- `logistics.view`, unless Logistics is later included
- `crm.view`, unless CRM is later included
- any manage permissions unless specifically needed later

## Recommended Module Visibility

For the demo user, visible modules should be:

- Dashboard
- Products
- Costings
- Production
- Inventory

Hidden modules should be:

- Admin
- QA
- Logistics
- CRM
- Reports

There are two layers:

- Tenant module enablement currently enables modules for Clean Eats overall.
- User role/permissions/sidebar filtering should limit what this demo user sees.

If current sidebar module visibility for non-admin modules is based only on `organisation_modules` and not permissions, a future step may need module-level permission filtering for non-admin modules before the demo user is created.

## Current Access Gap to Check

Admin links are already permission-filtered, but non-admin module links may currently be visible based on enabled modules only.

Need to check before creating the demo user:

- Does sidebar hide Products/Costings/Production/Inventory/QA/Logistics/CRM/Reports based on permissions or only based on enabled modules?
- If only based on enabled modules, the demo user may still see modules like QA, Logistics, CRM and Reports because they are enabled for Clean Eats.
- If so, we need a code step before creating the user: **Module-level permission-aware sidebar filtering for non-admin modules.**

Current code review note:

- `lib/navigation.ts` has `requiredPermission` values for Admin links.
- Non-admin module groups currently use `requiredModuleKey` but generally do not use `requiredPermission`.
- `components/app-shell.tsx` filters by both permissions and enabled modules, but a link without `requiredPermission` only needs its module to be enabled.

Recommendation:

Before creating the test user, confirm or implement module-level view-permission filtering across all main modules.

## Recommended Implementation Sequence

### 050 - Demo Role and Permission Seed Planning / Migration

- create or seed `phase_1_demo_user` role
- assign selected view permissions only

### 051 - Module-Level Permission-Aware Navigation

- ensure non-admin modules are hidden if the user lacks the module view permission
- preserve admin permission filtering
- preserve enabled-module filtering

If the current code already supports module-level permission filtering for all modules, this step may be skipped or adjusted. Current review suggests this step is still needed before staff demo access.

### 052 - Create Demo/Test User Manual Setup

- create Supabase Auth user
- create matching profile
- create Clean Eats membership with `role_key = phase_1_demo_user`
- verify context
- test login

### 053 - Staff Demo Review Round

- provide login to staff
- collect feedback on Phase 1 modules

## Demo User Manual Setup Plan

Documented for later only. Do not execute during this planning task.

1. Create Supabase Auth user.
2. Copy Auth user ID.
3. Create profile row.
4. Create organisation membership row:
   - `organisation_id = Clean Eats`
   - `profile_id = demo auth user id`
   - `role_key = phase_1_demo_user`
   - `access_level = viewer` or `standard`
   - `status = active`
5. Test login.
6. Confirm visible modules.
7. Confirm Admin is hidden/inaccessible.
8. Confirm Phase 1 modules load.

## Testing Checklist

Before giving login to staff:

- Demo user can log in.
- Demo user sees Dashboard.
- Demo user sees Products.
- Demo user sees Costings.
- Demo user sees Production.
- Demo user sees Inventory.
- Demo user does not see Admin.
- Demo user does not see Users/Modules/Integrations.
- Demo user does not see QA, Logistics, CRM, Reports unless deliberately included.
- Demo user cannot access admin routes by direct URL.
- Demo user sees sample/demo data only.
- Demo user can sign out.
- Luke/platform_admin still works normally.

## Risks and Guardrails

- Do not use Luke's admin account for staff testing.
- Do not give `platform_admin` to staff.
- Do not give `organisation_admin` for demo review unless needed.
- Do not expose admin/settings/user management pages.
- Do not connect real data before demo access is reviewed.
- Do not create a shared account for long-term production use.
- Keep sample data clearly marked.
- Keep passwords out of docs/repo.

## Staff Review Instructions

Staff should use the demo account to:

- click through Phase 1 modules
- note confusing wording
- note missing fields
- note missing workflows
- note what should be on iPad/facility screens
- note what should be manager-only
- continue working on CSVs in the agreed order

## Short Executive Summary

The demo/test user should be a safe, non-admin Clean Eats account used only for reviewing the Phase 1 demo modules. Before creating it, we should confirm that module-level navigation and route access can be limited to Products, Costings, Production and Inventory so staff can review the right areas without seeing admin or unrelated modules.
