# Phase 1 Demo User Role

## Status

Migration 016 has been drafted for review:

`supabase/migrations/016_seed_phase_1_demo_user_role.sql`

Do not apply this migration until it has been reviewed.

## Migration Purpose

The migration seeds a safe, organisation-scoped demo role for Clean Eats staff reviewing the Phase 1 sample UI modules.

Role created:

- `phase_1_demo_user`

Label:

- Phase 1 Demo User

Scope:

- organisation

Status:

- active

## Permissions Assigned

The role receives limited view-style permissions only:

- `products.view`
- `costings.view`
- `production.view`
- `production.tasks.view`
- `inventory.view`
- `goods_inwards.view`
- `purchasing.view`

These permissions are intended to support staff review of the Phase 1 demo screens:

- Dashboard
- Products
- Costings
- Production
- Inventory

## Permissions Deliberately Excluded

The role deliberately excludes:

- Admin permissions
- platform permissions
- QA permissions
- Logistics permissions
- CRM permissions
- Reports permissions
- manage permissions
- production task start/complete/log permissions
- audit log permissions

Examples deliberately not assigned:

- `admin.organisation.view`
- `admin.users.view`
- `admin.modules.view`
- `admin.integrations.view`
- `platform.tenants.view`
- `qa.view`
- `logistics.view`
- `crm.view`
- `reports.view`
- `production.tasks.start`
- `production.tasks.complete`
- `production.tasks.log_quantities`
- `production.tasks.log_waste`
- `production.tasks.report_issue`

## Actual User Not Created Yet

This migration does not create:

- Supabase Auth users
- profiles
- organisation memberships
- demo passwords
- staff accounts

The demo/test user should still be created manually later after navigation and route access have been reviewed.

## Sidebar Visibility Support

The seeded `phase_1_demo_user` role is now supported by sidebar module visibility logic documented in [Module-Level Permission-Aware Navigation](51-module-level-permission-aware-navigation.md).

Because the role has Products, Costings, Production and Inventory view permissions, it should see those Phase 1 modules once the demo user/profile/membership is created. Because it does not have Admin, QA, Logistics, CRM or Reports permissions, those modules should be hidden from the sidebar.

## RLS and Security

This migration does not:

- alter RLS policies
- enable or disable RLS
- alter table schemas
- add app UI
- change route protection
- change enabled-module filtering
- connect pages to live Supabase business data

Roles, permissions and role_permissions already have RLS SELECT policies. This seed migration is intended to be manually reviewed and applied by the project owner/admin in Supabase SQL Editor.

## Next Step

Recommended next step:

**052 - Create Demo/Test User Manual Setup**

Create the Supabase Auth user, profile and Clean Eats membership with `role_key = phase_1_demo_user`, then verify the sidebar visibility and page access before sharing the login for staff review.
