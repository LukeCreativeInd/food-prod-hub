# Auth and RLS Planning

## Planning Status

This document is a planning checkpoint only.

No RLS policies, auth UI, users, memberships or app database queries have been implemented yet.

The practical implementation checklist now lives at [Auth Implementation Checklist](14-auth-implementation-checklist.md).

## Auth Goal

The goal is:

- Users sign in via Supabase Auth.
- Each auth user connects to a profile row.
- Each profile can belong to one or more organisations through `organisation_memberships`.
- Each membership has a `role_key`.
- `role_key` aligns with `roles.role_key`.
- Roles receive permissions through `role_permissions`.
- App pages and future RLS policies use organisation membership and permissions to control access.

## Identity Model

Intended relationship:

```text
Supabase auth.users
↓
public.profiles
↓
public.organisation_memberships
↓
public.organisations
```

- `auth.users` is managed by Supabase Auth.
- `profiles.id` should align with `auth.users.id` when auth integration begins.
- `profiles` stores app-facing user details.
- `organisation_memberships` stores which tenant/org a user belongs to.
- Users may eventually belong to more than one organisation.
- Clean Eats starts as the first organisation.

## Role and Permission Model

Intended relationship:

```text
organisation_memberships.role_key
↓
roles.role_key
↓
role_permissions
↓
permissions
```

- `role_key` currently exists on memberships as a simple text key.
- This should align to `roles.role_key`.
- Permissions provide module/action-level capabilities.
- `platform_admin` is platform-scoped.
- Organisation roles are organisation-scoped.
- `tablet_user` should remain restricted to production task logging.
- Permissions should be checked in server-side helpers before sensitive actions.

## Tenant Scoping Model

- Every tenant-owned business table should include `organisation_id`.
- All database reads/writes should be scoped to the current active organisation.
- Clean Eats is slug `cleaneats`.
- Future tenants should not be able to access another tenant's records.
- Tenant scoping must be designed before real app queries are added.

## First Admin User Plan

Safe manual first-user approach:

- Create Luke's Supabase Auth user manually or via invite.
- Create matching `public.profiles` row using the auth user ID.
- Create `organisation_memberships` row linking Luke's profile to Clean Eats.
- Assign `role_key = organisation_admin` or `platform_admin` depending on intended access.
- Confirm login and membership before enabling RLS broadly.

Do not seed real users into migrations. User creation should be handled through Supabase Auth or a controlled admin flow.

## Clean Eats User Plan

Expected user groups:

- Luke / admin
- Tony / production director
- Cettina / QA
- Luisa / QA
- Eddie / warehouse/inwards/outwards
- Rob / wholesale
- Production staff / tablet users

Likely role mapping:

- Luke: `platform_admin` or `organisation_admin`
- Tony: `operations_manager` or `production_manager`
- Cettina/Luisa: `qa_manager`
- Eddie: `warehouse_manager`
- Rob: `wholesale_manager`
- Production floor staff: `tablet_user` or `staff`

These are planning assumptions only and are not seeded.

## Route Protection Plan

Future app routes by access level:

- Public/unprotected: login page, password reset page
- Authenticated: dashboard
- Organisation admin: organisation settings, users, modules, integrations
- Operations/production: production, production areas, production tasks
- Tablet/staff: tablet task screens only
- QA: QA pages and checks
- Warehouse: inventory, goods inwards, purchasing visibility
- Wholesale: wholesale, CRM
- Platform admin only: future platform admin/control centre

## RLS Policy Principles

- RLS should not be enabled until policies are planned table-by-table.
- Tenant-owned tables should require membership in the matching `organisation_id`.
- Admin tables should require `organisation_admin` or equivalent permission.
- Platform tables/actions should require `platform_admin`.
- Audit logs may have special read/write rules.
- Service-role/server-only operations should be used carefully.
- Policies should be tested before connecting important UI.

## Initial RLS Rollout Plan

Stage 1:

- Auth wiring only
- Login/logout
- Profiles and memberships read helpers
- No broad RLS enablement yet

Stage 2:

- Enable RLS on low-risk foundation tables
- Add membership-based select policies
- Test with Luke's user

Stage 3:

- Add role/permission helpers
- Add admin route protection
- Add tenant-scoped database reads

Stage 4:

- Add RLS to business module tables as they are created
- Add audit logging for sensitive actions

## Permission Helper Plan

Future helper functions or app utilities:

- `getCurrentUser()`
- `getCurrentProfile()`
- `getCurrentOrganisation()`
- `getCurrentMembership()`
- `userHasPermission(permission_key)`
- `requirePermission(permission_key)`
- `requireOrganisationAccess(organisation_id)`

These should be server-side where possible.

## Audit Logging Plan

Future auth/security actions should write `audit_logs` records where appropriate:

- Login
- Logout
- Failed login if available
- User invited
- User role changed
- Module enabled/disabled
- Organisation settings changed
- Production task completed
- QA sign-off completed

## Risks and Guardrails

- Avoid enabling RLS before a known admin user can access required rows.
- Avoid tenant data leaks by never querying without `organisation_id` scope.
- Avoid client-side-only permission checks for sensitive actions.
- Avoid hard-coding Clean Eats too deeply into future reusable logic.
- Avoid putting service-role keys in client code.
- Keep migrations reviewed and manually applied.

## Recommended Next Implementation Steps

1. Create an auth implementation plan document or proceed to migration/helper planning.
2. Confirm whether Luke should be `platform_admin` or `organisation_admin` initially.
3. Add Supabase auth client/server helpers carefully.
4. Build login/logout UI.
5. Create first manual Supabase Auth user/profile/membership.
6. Add route protection.
7. Only then begin carefully enabling RLS.

## Short Executive Summary

The database foundation is ready, but auth and RLS need to be introduced carefully. The next phase should connect Supabase Auth users to profiles and memberships, protect routes, and then enable RLS in stages so Clean Eats data remains secure without locking out admin users.
