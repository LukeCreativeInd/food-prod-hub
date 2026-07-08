# First RLS Policies Plan

## Planning Status

This is a planning document only.

- RLS helper functions are already applied.
- RLS is not enabled yet.
- No policies have been created yet.
- This document defines the recommended first staged RLS migration.

## Goal of First RLS Stage

The first RLS stage should protect foundation tables needed for auth and tenant context, while avoiding lockout.

Goals:

- Keep Luke/platform_admin able to sign in and use the app.
- Allow users to read their own profile and memberships.
- Allow members to read their current organisation/settings/branding/modules.
- Avoid write/update/delete policies unless absolutely needed.
- Keep first stage mostly `SELECT` policies.
- Keep policy scope small and testable.

## Tables Recommended for First RLS Stage

Recommended first tables:

- `profiles`
- `organisations`
- `organisation_memberships`
- `organisation_settings`
- `organisation_branding`
- `modules`
- `organisation_modules`

Reasons:

- They are already used by auth context/navigation helpers.
- They are foundation data, not business module data.
- They allow us to test RLS with current working app flows.
- They have clear membership-based access rules.

## Tables Not Included Yet

The first stage should not include:

- `audit_logs`
- `roles`
- `permissions`
- `role_permissions`
- future business module tables

Reasons:

- `audit_logs` need special append-only/admin-only design.
- `roles`, `permissions` and `role_permissions` are global reference data and need careful handling.
- Future business tables do not exist yet.
- The first RLS stage should stay small and easy to verify.

## RLS Helper Functions Available

Available helper functions:

- `current_profile_id()`
- `is_active_member(uuid)`
- `current_role_key(uuid)`
- `is_platform_admin()`
- `has_permission(uuid, text)`

These functions are available for future policies but are not `SECURITY DEFINER`.

Policies should be written carefully so helper functions can access required rows once RLS is enabled. If helper functions cannot read required rows after RLS is enabled, a later adjustment may be required.

## First Stage Policy Principles

- Enable RLS only on selected foundation tables.
- Add `SELECT` policies first.
- Avoid `INSERT`, `UPDATE` and `DELETE` initially unless needed for the app to keep working.
- Keep `platform_admin` access explicit.
- Keep organisation membership rules tenant-scoped.
- Do not assume Clean Eats is the only tenant.
- Do not rely on sidebar hiding as security.
- Do not expose service-role keys.
- Test locally and on Vercel immediately after applying.

## Table-by-Table First Policy Plan

| Table | Enable RLS? | First policy type | Who can SELECT? | Writes in first stage? | Notes |
| --- | --- | --- | --- | --- | --- |
| `profiles` | Yes | `SELECT` | User can select own profile where `id = auth.uid()`. `platform_admin` can select profiles if needed. | No | App currently only needs current user's profile. |
| `organisations` | Yes | `SELECT` | Active members can select organisations they belong to. `platform_admin` can select as needed. | No | Must not assume Clean Eats is the only tenant. |
| `organisation_memberships` | Yes | `SELECT` | User can select own memberships. `platform_admin` can select memberships as needed. Optional organisation admin visibility can be delayed. | No | Keep this policy simple to avoid recursion. |
| `organisation_settings` | Yes | `SELECT` | Active members of the organisation can select. `platform_admin` can select. | No | Used for tenant operational defaults. |
| `organisation_branding` | Yes | `SELECT` | Active members of the organisation can select. `platform_admin` can select. | No | Used for tenant visual customisation. |
| `modules` | Yes | `SELECT` | Authenticated users can select active modules. `platform_admin` can select all modules if needed. | No | Global reference table. |
| `organisation_modules` | Yes | `SELECT` | Active members of the organisation can select enabled module rows for their organisation. `platform_admin` can select. | No | Used by enabled-module-aware navigation. |

## Potential Recursion / Dependency Risks

RLS helper functions and policies can accidentally depend on the same tables they are protecting.

Examples:

- `organisation_memberships` policies may need to check `organisation_memberships`.
- `has_permission()` reads `organisation_memberships`, `roles`, `role_permissions` and `permissions`.
- `is_active_member()` reads `organisation_memberships`.
- Once RLS is enabled on `organisation_memberships`, policies that call `is_active_member()` may depend on whether that helper can read memberships.

Recommendations:

- Keep the `organisation_memberships` `SELECT` policy simple:
  - `profile_id = auth.uid()`
  - or `is_platform_admin()`
- Avoid using `is_active_member()` inside `organisation_memberships` policies if it could recurse.
- Use direct `auth.uid()` checks where possible for first-stage policies.
- Be prepared to adjust helper functions to `SECURITY DEFINER` with locked `search_path` if necessary, but do not do that unless reviewed.

## Proposed First Migration Scope

Recommended next SQL migration:

`supabase/migrations/012_enable_foundation_rls_select_policies.sql`

This migration has now been drafted and requires manual review before applying.

It should:

- Enable RLS on selected foundation tables.
- Create `SELECT` policies only.
- Avoid write policies for now.
- Avoid `audit_logs`.
- Avoid `roles`, `permissions` and `role_permissions` for now unless absolutely needed for helpers.
- Use direct `auth.uid()` checks where safer.
- Use helper functions where safe.

## Draft Policy Intent in Plain English

These are intent examples, not final SQL.

`profiles`:

- A user can read their own profile.

`organisation_memberships`:

- A user can read their own active/non-archived memberships.

`organisations`:

- A user can read organisations connected to their active memberships.

`organisation_settings` and `organisation_branding`:

- A user can read settings/branding for organisations they actively belong to.

`modules`:

- Signed-in users can read active module records.

`organisation_modules`:

- A user can read module enablement rows for organisations they actively belong to.

## Testing Plan for First RLS Migration

Before applying:

- Confirm Luke login works.
- Confirm Auth Context card is green/valid.
- Confirm app routes load.
- Confirm helper functions exist.

After applying:

- Test `/login`.
- Test `/dashboard`.
- Confirm Auth Context card still shows:
  - signed in
  - profile found
  - membership active
  - organisation found
  - `platform_admin`
  - permission probe yes
- Test sidebar still shows modules/admin links.
- Test `/organisation-settings`, `/users`, `/modules`, `/integrations`.
- Test sign out/sign in.
- Test Vercel after deployment if code changes exist.
- Confirm no lockout.

## Rollback Plan

- If app loses access, use Supabase SQL Editor as project owner.
- Disable RLS on the affected table temporarily if needed.
- Drop or adjust specific policies.
- Avoid applying RLS to too many tables at once.
- Keep migration reviewed before running.

## What Must Not Be Included in First RLS Migration

- No business table RLS.
- No audit log policies.
- No insert/update/delete policies unless deliberately reviewed.
- No broad "allow all authenticated" policies on tenant-owned tables.
- No service-role client usage.
- No Clean Eats-only hard-coded tenant assumptions.
- No policy relying only on sidebar visibility.

## Recommended Next Step

Recommended next step:

030 - Create First Foundation RLS Migration

This should create migration 012. It should enable RLS and `SELECT` policies only for the selected foundation tables. It should be manually reviewed before applying, then applied and tested immediately.

The drafted migration is documented in [Foundation RLS SELECT Policies](30-foundation-rls-select-policies.md).

## Short Executive Summary

The first RLS stage should be small, mostly read-only, and focused on the foundation tables the app already uses to identify the current user, membership, organisation and enabled modules. The goal is to prove database-level tenant security without locking out the first admin user.
