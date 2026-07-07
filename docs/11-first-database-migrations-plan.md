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

Purpose: Link Supabase users to application profiles and organisation memberships.

Tables:

- `profiles`
- `organisation_memberships`

Key fields:

- `user_id`
- `full_name`
- `email`
- `organisation_id`
- `role_key`
- `status`
- `invited_at`
- `joined_at`

## Migration 006 — modules and organisation modules

Purpose: Define available platform modules and enable them per organisation.

Tables:

- `modules`
- `organisation_modules`

Key fields:

- `module_key`
- `label`
- `group`
- `phase`
- `enabled`

## Migration 007 — roles and permissions

Purpose: Define the role and permission model for tenant and platform access.

Tables:

- `roles`
- `permissions`
- `role_permissions`

Key fields:

- `role_key`
- `permission_key`
- `description`

## Migration 008 — audit logs

Purpose: Record important tenant and platform actions.

Table:

- `audit_logs`

Key fields:

- `organisation_id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `created_at`

## Suggested Seed Data

- Clean Eats organisation seeded in Migration 002
- Clean Eats settings and branding seeded in Migration 004
- Default enabled modules
- Default roles
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
