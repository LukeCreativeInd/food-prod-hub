# RLS Planning

## Planning Status

This is a planning document only.

- No RLS policies have been created.
- RLS has not been enabled on any tables yet.
- No database changes are made by this document.
- The app currently relies on server-side route guards and helpers, not database-level RLS.

## RLS Goal

The goal of RLS is database-level tenant security.

Users should only access rows for organisations they belong to. Platform admins should be able to support and manage platform-level areas where appropriate, but that access must be explicit and carefully limited.

Future business tables must be scoped by `organisation_id` wherever they are tenant-owned. RLS should protect against accidental cross-tenant data access even if app code has a bug.

## Existing Auth and Tenant Model

Current identity model:

```text
auth.users
↓
public.profiles
↓
public.organisation_memberships
↓
public.organisations
```

Current role and permission model:

```text
organisation_memberships.role_key
↓
roles.role_key
↓
role_permissions
↓
permissions
```

- `profiles.id` should match `auth.users.id`.
- Memberships define tenant access.
- Roles and permissions define capabilities.
- Clean Eats is the first tenant with slug `cleaneats`.
- Luke currently has a `platform_admin` membership.

## Important RLS Principles

- Enable RLS only after policies are written and reviewed.
- Policies should be table-specific.
- Tenant-owned rows should include `organisation_id` where applicable.
- Users should only select tenant rows where they have active membership.
- Admin/manage actions should require role or permission checks.
- Platform-level access should be limited carefully.
- Avoid client-side-only security assumptions.
- Service-role keys must never be exposed in browser/client code.
- Test with Luke's user before broader rollout.

## Recommended RLS Rollout Strategy

### Stage 1 - Helper SQL Functions

- Create safe SQL helper functions for current auth user access checks.
- Do not enable RLS yet unless functions are ready.

Migration 011 has been manually applied from `supabase/migrations/011_create_rls_helper_functions.sql`. It adds helper functions only and does not enable RLS or create policies.

### Stage 2 - Low-Risk Read Policies

- Start with select policies on foundation tables.
- Confirm Luke can still access required data.

The first RLS policy stage has been planned in [First RLS Policies Plan](29-first-rls-policies-plan.md). It recommends a small foundation-table `SELECT` policy rollout before any business table RLS.

The first foundation RLS SELECT policy migration has now been manually applied and tested successfully. It is documented in [Foundation RLS SELECT Policies](30-foundation-rls-select-policies.md), and the applied checkpoint is documented in [Foundation RLS Applied Review](31-foundation-rls-applied-review.md).

### Stage 3 - Membership and Admin Checks

- Add insert/update/delete policies where needed.
- Use role and permission rules carefully.

### Stage 4 - Business Tables

- Apply RLS to future production/products/costings/inventory/QA tables from day one.
- Ensure every tenant-owned table has `organisation_id`.

### Stage 5 - Audit Logs

- Add special audit log policies after deciding who can read and write audit records.

## Candidate SQL Helper Functions

These are possible helper functions for later reviewed migrations. They are not implemented yet.

| Function | Purpose |
| --- | --- |
| `public.current_profile_id()` | Returns `auth.uid()`. |
| `public.is_active_member(target_organisation_id uuid)` | Returns true if `auth.uid()` has an active membership for that organisation. |
| `public.current_role_key(target_organisation_id uuid)` | Returns the `role_key` for the active membership. |
| `public.has_permission(target_organisation_id uuid, required_permission_key text)` | Returns true if the active membership role has the required active permission. |
| `public.is_platform_admin()` | Returns true if `auth.uid()` has an active `platform_admin` membership. |

Notes:

- These functions should be `SECURITY DEFINER` only if needed and carefully reviewed.
- Function `search_path` should be locked down if `SECURITY DEFINER` is used.
- Functions should avoid leaking data.
- Simpler policies may not need all helpers immediately.

## Existing Tables and RLS Plan

| Table | Tenant-owned? | Current sensitivity | First RLS approach | Notes |
| --- | --- | --- | --- | --- |
| `organisations` | Tenant/platform foundation | Medium | Select only organisations where active membership exists, plus explicit platform admin access as needed. | Clean Eats is Tenant 1. Future tenants must remain isolated. |
| `organisation_settings` | Yes | Medium | Select/update by active membership and admin permission. | Tenant operational defaults. |
| `organisation_branding` | Yes | Medium | Select by active membership, update by admin permission. | Tenant visual customisation. |
| `profiles` | User-owned/app foundation | Medium | Users can select own profile; admins may select profiles in their organisation later. | Avoid broad profile visibility. |
| `organisation_memberships` | Tenant-owned access table | High | Users can select own memberships; organisation admins can view memberships for their organisation. | Core access table, so policies must be careful. |
| `roles` | Global reference | Medium | Probably readable to authenticated users, limited writes/admin only. | Global role definitions. |
| `permissions` | Global reference | Medium | Probably readable to authenticated users, limited writes/platform only. | Global capability definitions. |
| `role_permissions` | Global reference | Medium | Probably readable to authenticated users, limited writes/platform only. | Links roles to permissions. |
| `modules` | Global reference | Low/medium | Readable to authenticated users. | Global platform module registry. |
| `organisation_modules` | Yes | Medium | Select by active membership, manage by admin/module permission. | Controls tenant module availability. |
| `audit_logs` | Mixed | High | Special handling; likely insert from trusted server actions later and read by admins only. | Sensitive traceability records. |

## First Tables Recommended for RLS

Recommended first candidates:

- `profiles`
- `organisations`
- `organisation_memberships`
- `organisation_settings`
- `organisation_branding`
- `modules`
- `organisation_modules`

These should come first because they are foundation tables, they are needed for auth context, and they let us test access without business data risk.

## Tables to Delay

Recommended to delay:

- `audit_logs`
- `roles`
- `permissions`
- `role_permissions` write policies
- future business module tables until created

Audit logs need special append-only and security rules. Roles and permissions are global reference data and should be handled carefully. Business tables do not exist yet and should receive RLS as they are designed.

## Platform Admin Considerations

- Luke currently has `platform_admin`.
- `platform_admin` may need broader read access during development.
- `platform_admin` should not automatically mean unsafe unrestricted client access forever.
- Production rollout should distinguish platform owner support access from tenant admin access.
- Platform admin behaviour must be explicit in policies.

## Organisation Admin Considerations

- `organisation_admin` should manage tenant settings, users and modules inside their organisation only.
- `organisation_admin` should not access other tenants.
- `organisation_admin` should not manage platform-level tenants unless explicitly granted.

## Tablet User Considerations

- `tablet_user` should have very narrow future RLS access.
- It should only access assigned or available production task workflows later.
- Tablet users should not access admin/settings/users/modules.
- Future production task tables should include `organisation_id` and possibly `production_area_id` or task assignment logic.

## Audit Log RLS Considerations

- Audit logs are sensitive.
- Normal users should not freely read audit logs.
- Trusted server actions may insert audit records.
- Admin users may read audit logs for their organisation.
- Platform admins may read platform-level logs.
- Avoid allowing client-side inserts that can spoof actor/context unless carefully controlled.

## Testing Plan Before Enabling RLS

- Confirm Luke can sign in.
- Confirm profile resolves.
- Confirm membership resolves.
- Confirm organisation resolves.
- Confirm permissions resolve.
- Confirm route protection works.
- Write policies in a reviewed migration.
- Apply policies to one or a few tables first.
- Test `SELECT` from Supabase SQL editor as an authenticated user if practical.
- Test local app.
- Test Vercel.
- Confirm no lockout.
- Commit only after successful verification.

## Rollback / Recovery Plan

- Keep service-role/admin access in Supabase dashboard.
- Apply RLS in small migrations.
- If lockout occurs, disable RLS or adjust policies from Supabase SQL editor.
- Avoid enabling all tables at once.
- Keep migrations reviewed and manually applied.

## What Must Not Happen Yet

- Do not enable RLS globally.
- Do not add broad permissive policies just to make things work.
- Do not expose service-role keys.
- Do not rely on sidebar hiding as security.
- Do not add business module queries without organisation scoping.
- Do not create policies that assume Clean Eats is the only tenant forever.
- Do not skip testing on Vercel.

## Recommended Next Implementation Step

Recommended next step completed for review:

028 - Draft RLS Helper Functions Migration

This should create safe SQL helper functions only. It should not enable RLS yet unless explicitly decided. It should be reviewed carefully before applying. After helper functions, the next step can be first staged RLS policies.

The helper function draft is documented in [RLS Helper Functions](28-rls-helper-functions.md).

The first policy rollout plan is documented in [First RLS Policies Plan](29-first-rls-policies-plan.md).

The first foundation RLS SELECT policy migration is documented in [Foundation RLS SELECT Policies](30-foundation-rls-select-policies.md), and the applied review is documented in [Foundation RLS Applied Review](31-foundation-rls-applied-review.md).

## Short Executive Summary

The app can now identify the signed-in user, their profile, their Clean Eats membership, their role and their enabled modules. RLS is the next layer that will make the database enforce tenant security. It should be introduced slowly with reviewed helper functions and staged policies to avoid lockout or cross-tenant access.
