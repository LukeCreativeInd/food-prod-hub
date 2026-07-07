# First Database Migrations Plan v0.1

## Purpose

This document defines the proposed order for initial Supabase database migrations. It is a planning document only. Do not create these migrations until the database scope is explicitly approved.

## Migration 001 — organisations

Purpose: Create the tenant/organisation foundation.

Key fields:

- `id` UUID
- `name`
- `slug`
- `industry`
- `status`
- `created_at`
- `updated_at`

## Migration 002 — organisation settings and branding

Purpose: Add tenant-level operating settings and visual identity.

Tables:

- `organisation_settings`
- `organisation_branding`

Key fields:

- `organisation_id`
- `timezone`
- `currency`
- `units`
- `logo_url`
- `primary_colour`
- `accent_colour`
- `sidebar_style`
- `theme_mode`

## Migration 003 — profiles and memberships

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

## Migration 004 — modules and organisation modules

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

## Migration 005 — roles and permissions

Purpose: Define the role and permission model for tenant and platform access.

Tables:

- `roles`
- `permissions`
- `role_permissions`

Key fields:

- `role_key`
- `permission_key`
- `description`

## Migration 006 — audit logs

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

- Clean Eats organisation
- Default branding
- Default enabled modules
- Default roles
- Initial admin user placeholder

## RLS Planning Notes

- Organisations visible only through membership
- Organisation-owned records filtered by `organisation_id`
- Platform admins need separate handling
- Audit logs append-only where possible

## What Not To Build Yet

Do not build these tables until auth/tenant foundation is in place:

- Product/costing tables
- Production tables
- Inventory tables
- QA tables
- Integration tables
