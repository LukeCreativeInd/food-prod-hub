# Backend Foundation Review

## Status Summary

The first backend foundation block has been created and manually applied in Supabase.

This foundation supports:

- Multi-tenant organisations
- Clean Eats as Client 1 / Tenant 1
- Organisation settings and branding
- User/profile foundations
- Memberships
- Roles and permissions
- Module enablement
- Audit logging

## Applied Migrations

| Migration | File | Purpose | Applied Status |
| --- | --- | --- | --- |
| 001 | `001_create_organisations.sql` | Create the tenant/organisation table. | Applied |
| 002 | `002_seed_clean_eats_organisation.sql` | Seed Clean Eats as Client 1 / Tenant 1. | Applied |
| 003 | `003_create_organisation_settings_and_branding.sql` | Create organisation settings and branding tables. | Applied |
| 004 | `004_seed_clean_eats_settings_and_branding.sql` | Seed Clean Eats settings and branding. | Applied |
| 005 | `005_create_profiles_and_memberships.sql` | Create profile and organisation membership foundations. | Applied |
| 006 | `006_create_roles_and_permissions.sql` | Create roles, permissions and role-permission mapping tables. | Applied |
| 007 | `007_seed_default_roles_and_permissions.sql` | Seed default roles, permissions and role-permission assignments. | Applied |
| 008 | `008_create_modules_and_organisation_modules.sql` | Create module registry and organisation module enablement tables. | Applied |
| 009 | `009_seed_platform_modules_and_clean_eats_modules.sql` | Seed platform modules and enable Clean Eats starting modules. | Applied |
| 010 | `010_create_audit_logs.sql` | Create audit log traceability foundation. | Applied |

## Database Tables Created

### Tenant Foundation

| Table | Plain-English purpose | Key relationships | Notes |
| --- | --- | --- | --- |
| `organisations` | Stores each tenant/client using the platform. | Referenced by tenant-owned tables through `organisation_id`. | Clean Eats is the first organisation. |
| `organisation_settings` | Stores tenant-level operational defaults. | One row per organisation through `organisation_id`. | Keeps timezone, currency, units and date/time formats separate from tenant profile. |
| `organisation_branding` | Stores tenant-level visual customisation. | One row per organisation through `organisation_id`. | Keeps logo, colours, sidebar style and theme mode separate from tenant profile. |

### User and Access Foundation

| Table | Plain-English purpose | Key relationships | Notes |
| --- | --- | --- | --- |
| `profiles` | Stores app-level user details for future Supabase Auth users. | Intended to align `profiles.id` with future Supabase auth user IDs. | No auth UI or auth foreign key is connected yet. |
| `organisation_memberships` | Links profiles/users to organisations. | References `organisations` and `profiles`. | Stores `role_key` for now; will align to `roles.role_key`. |
| `roles` | Stores named access levels. | Used by memberships and role-permission assignments. | Supports platform and organisation scope. |
| `permissions` | Stores module/action-level capabilities. | Assigned to roles through `role_permissions`. | Covers admin, modules, operations, reports and platform support. |
| `role_permissions` | Connects roles to permissions. | References `roles` and `permissions`. | Seeded with default access rules. |

### Module Foundation

| Table | Plain-English purpose | Key relationships | Notes |
| --- | --- | --- | --- |
| `modules` | Stores the global platform module registry. | Referenced by `organisation_modules`. | Aligns with the app module registry where practical. |
| `organisation_modules` | Enables or disables modules per tenant. | References `organisations` and `modules`. | Supports tenant-specific Hubs without custom forks. |

### Traceability Foundation

| Table | Plain-English purpose | Key relationships | Notes |
| --- | --- | --- | --- |
| `audit_logs` | Stores future traceability records for important actions. | Optionally references `organisations` and `profiles`. | Supports tenant, user, module, platform and system-generated events. |

## Seed Data Created

- Clean Eats Australia organisation with slug `cleaneats`
- Clean Eats settings and branding
- Default roles
- Default permissions
- Role-permission assignments
- Global platform modules
- Clean Eats enabled modules

## Current Clean Eats Tenant State

Clean Eats now exists as the first tenant.

- Slug: `cleaneats`
- Industry: Food Manufacturing
- Status: active
- Settings: Australia/Melbourne, AUD, metric, DD/MM/YYYY, 24h
- Branding: Clean Eats green/accent colours
- Modules: all starting modules enabled

## Access Model Foundation

Default roles:

- `platform_admin`
- `organisation_admin`
- `operations_manager`
- `production_manager`
- `qa_manager`
- `warehouse_manager`
- `wholesale_manager`
- `staff`
- `tablet_user`
- `viewer`

Access model notes:

- `platform_admin` receives all permissions.
- `organisation_admin` receives all non-platform permissions.
- `tablet_user` is restricted to production task logging permissions.
- Memberships currently store `role_key` and will later align to `roles.role_key`.
- RLS is not enabled yet by design.

## Module Foundation

Global modules:

- Products
- Costings
- Production
- Inventory
- Purchasing
- QA
- Logistics
- Wholesale
- CRM
- Reports
- Admin

Future tenants can have different enabled module combinations without code forks.

## Audit Log Foundation

`audit_logs` supports future traceability of:

- Tenant actions
- User/admin actions
- Production/task actions
- QA actions
- Platform-level actions
- System-generated events

Triggers and automatic audit writing are not added yet.

## What Is Intentionally Not Done Yet

- No Supabase Auth integration
- No login UI
- No protected routes
- No app database queries
- No RLS policies
- No audit triggers
- No real users created
- No memberships seeded
- No tenant subdomain routing yet
- No production/business module tables yet

## Recommended Next Phase

The next logical phase is Auth and Security Foundation.

The Auth and RLS planning document is available at [Auth and RLS Planning](13-auth-and-rls-planning.md).

Suggested next steps:

- Treat this document as the migration 001-010 backend foundation checkpoint.
- Plan Supabase Auth.
- Plan RLS policies.
- Create first internal admin user flow.
- Connect authenticated users to profiles.
- Create first Clean Eats membership.
- Protect app routes.
- Then carefully introduce database reads into admin/settings/modules pages.

## Important Guardrails Before Moving Forward

- Do not enable RLS until policies are designed and tested.
- Do not connect UI to Supabase tables until auth context is clear.
- Do not create tenant-sensitive queries without organisation scoping.
- Keep migrations reviewed and manually applied.
- Keep Clean Eats as Client 1 but maintain reusable tenant architecture.

## Short Executive Summary

The platform now has a real backend foundation under the UI. It does not yet have login or live app data, but the database structure is ready for tenants, users, roles, enabled modules and audit history.
