# First Database Migrations Plan v0.1

## Purpose

This document defines the proposed order for initial Supabase database migrations. It is a planning document only. Do not create these migrations until the database scope is explicitly approved.

## Migration 001 — organisations

Status: Drafted in `supabase/migrations/001_create_organisations.sql`. Manually applied in Supabase outside this repo workflow.

Purpose: Create the tenant/organisation foundation.

Key fields:

- `id` UUID
- `name`
- `slug`
- `industry`
- `status`
- `created_at`
- `updated_at`

Notes: RLS should not be enabled in this migration. RLS policies will come later after organisation memberships exist.

## Migration 002 — seed Clean Eats organisation

Status: Drafted in `supabase/migrations/002_seed_clean_eats_organisation.sql`, not applied.

Purpose: Seed Clean Eats as Client 1 / Tenant 1.

Key values:

- `name`: Clean Eats Australia
- `slug`: cleaneats
- `industry`: Food Manufacturing
- `status`: active

Notes: Clean Eats is seeded before settings, branding, users, and memberships. This seed is idempotent and safe to re-run. RLS remains deferred until memberships exist.

## Migration 003 — organisation settings and branding

Status: Drafted in `supabase/migrations/003_create_organisation_settings_and_branding.sql`, not applied.

Purpose: Add tenant-level operating settings and visual identity.

Tables:

- `organisation_settings`
- `organisation_branding`

Key fields:

- `organisation_id`
- `timezone`
- `currency`
- `default_units`
- `date_format`
- `time_format`
- `logo_url`
- `primary_colour`
- `accent_colour`
- `sidebar_style`
- `theme_mode`

Notes: Settings and branding are separated from `organisations` to keep tenant profile, operational defaults, and visual customisation modular. Clean Eats settings/branding seed data is separate from this table creation migration. RLS remains deferred until memberships exist.

## Migration 004 — seed Clean Eats settings and branding

Status: Drafted in `supabase/migrations/004_seed_clean_eats_settings_and_branding.sql`, not applied.

Purpose: Seed Clean Eats organisation settings and branding after the organisation and settings/branding tables exist.

Tables:

- `organisation_settings`
- `organisation_branding`

Key values:

- `timezone`: Australia/Melbourne
- `currency`: AUD
- `default_units`: metric
- `date_format`: DD/MM/YYYY
- `time_format`: 24h
- `primary_colour`: #176B3A
- `accent_colour`: #A7D129
- `sidebar_style`: clean-operations
- `theme_mode`: light

Notes: Clean Eats settings/branding seed data is separate from the table creation migration and is idempotent. Users/memberships and RLS still come later.

## Migration 005 — profiles and memberships

Status: Drafted in `supabase/migrations/005_create_profiles_and_memberships.sql`, not applied.

Purpose: Link Supabase users to application profiles and organisation memberships.

Tables:

- `profiles`
- `organisation_memberships`

Key fields:

- `id`
- `full_name`
- `email`
- `profile_id`
- `organisation_id`
- `role_key`
- `team`
- `access_level`
- `status`
- `invited_at`
- `joined_at`

Notes: Profiles and memberships prepare for Supabase Auth, but no auth UI or auth foreign key is added yet. Seed users are not added yet. Roles/permissions and RLS still come later.

## Migration 006 — roles and permissions

Status: Drafted in `supabase/migrations/006_create_roles_and_permissions.sql`, not applied.

Purpose: Define the role and permission model for tenant and platform access.

Tables:

- `roles`
- `permissions`
- `role_permissions`

Key fields:

- `role_key`
- `permission_key`
- `module_key`
- `action_key`
- `description`

Notes: Roles and permissions are created before seed data. `organisation_memberships.role_key` will later align with `roles.role_key`. RLS remains deferred until roles, permissions, and memberships are seeded.

## Migration 007 — seed default roles and permissions

Status: Drafted in `supabase/migrations/007_seed_default_roles_and_permissions.sql`, not applied.

Purpose: Seed default platform roles, organisation roles, permissions, and role-permission assignments.

Tables:

- `roles`
- `permissions`
- `role_permissions`

Key values:

- Platform role: `platform_admin`
- Organisation roles: `organisation_admin`, `operations_manager`, `production_manager`, `qa_manager`, `warehouse_manager`, `wholesale_manager`, `staff`, `tablet_user`, `viewer`
- Foundation permissions for admin, products, costings, production, inventory, purchasing, QA, logistics, wholesale, CRM, reports, and platform support

Notes: Default roles and permissions are seeded before RLS. User memberships will later reference `role_key` values that now exist in `roles`. RLS remains deferred until roles, permissions, and memberships are seeded and policies are designed.

## Migration 008 — modules and organisation modules

Status: Drafted in `supabase/migrations/008_create_modules_and_organisation_modules.sql`, not applied.

Purpose: Define available platform modules and enable them per organisation.

Tables:

- `modules`
- `organisation_modules`

Key fields:

- `module_key`
- `label`
- `module_group`
- `phase`
- `enabled`
- `sort_order`

Notes: `modules` and `organisation_modules` define the database-backed module enablement layer. Module seed data and Clean Eats enabled modules come later. RLS remains deferred until memberships, roles, and module policies are designed.

## Migration 009 — seed platform modules and Clean Eats enabled modules

Status: Drafted in `supabase/migrations/009_seed_platform_modules_and_clean_eats_modules.sql`, not applied.

Purpose: Seed the global platform module registry and enable starting modules for Clean Eats.

Tables:

- `modules`
- `organisation_modules`

Key values:

- Platform modules: products, costings, production, inventory, purchasing, QA, logistics, wholesale, CRM, reports, admin
- Clean Eats enabled modules: all starting platform modules

Notes: Global modules and Clean Eats enabled modules are seeded after module tables exist. Future tenants can have different `organisation_modules` rows without custom code forks. RLS remains deferred.

## Migration 010 — audit logs

Status: Drafted in `supabase/migrations/010_create_audit_logs.sql`, not applied.

Purpose: Record important tenant and platform actions.

Table:

- `audit_logs`

Key fields:

- `organisation_id`
- `actor_profile_id`
- `actor_role_key`
- `action`
- `entity_type`
- `entity_id`
- `module_key`
- `summary`
- `metadata`
- `created_at`

Notes: `audit_logs` creates the future traceability foundation for tenants, users, modules and business records. Triggers and RLS will come later.

## Suggested Seed Data

- Clean Eats organisation seeded in Migration 002
- Clean Eats settings and branding seeded in Migration 004
- Default roles and permissions seeded in Migration 007
- Platform modules and Clean Eats enabled modules seeded in Migration 009
- Initial admin user placeholder

## RLS Planning Notes

- Organisations visible only through membership
- Organisation-owned records filtered by `organisation_id`
- Platform admins need separate handling
- Audit logs append-only where possible
- RLS for `organisations` will come in a later reviewed migration after memberships exist

## What Not To Build Yet

Do not build these tables until auth/tenant foundation is in place:

- Product/costing tables
- Production tables
- Inventory tables
- QA tables
- Integration tables
