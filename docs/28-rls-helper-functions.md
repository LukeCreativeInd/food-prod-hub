# RLS Helper Functions

## Status

Migration 011 has been drafted:

`supabase/migrations/011_create_rls_helper_functions.sql`

This document is a planning and review note only. The migration has not been applied to Supabase by this repo task.

## What Was Added

The migration drafts helper SQL functions for future RLS policies:

| Helper | Purpose |
| --- | --- |
| `public.current_profile_id()` | Returns the current authenticated Supabase user id from `auth.uid()`. |
| `public.is_active_member(target_organisation_id uuid)` | Checks whether the current auth user has an active, non-archived membership for an organisation. |
| `public.current_role_key(target_organisation_id uuid)` | Returns the current user's active membership `role_key` for an organisation. |
| `public.is_platform_admin()` | Checks whether the current auth user has an active, non-archived `platform_admin` membership. |
| `public.has_permission(target_organisation_id uuid, required_permission_key text)` | Checks whether the current user has an active membership role with the required active permission. |

## Why These Helpers Exist

RLS policies often need repeatable checks for:

- current user identity
- active tenant membership
- current role key
- platform admin access
- role-based permissions

Keeping those checks in reviewed helper functions should make future policies easier to read and harder to accidentally implement differently table by table.

## Security Definer Decision

The drafted functions do not use `SECURITY DEFINER`.

They are plain `language sql stable` functions that use the current authenticated user context through `auth.uid()`. If future RLS policy testing shows that a helper must bypass table-level RLS to avoid recursion or access problems, that should be reviewed in a separate migration with an explicit `search_path` and a narrow reason.

## Grants

The migration grants execute access on each helper function to `authenticated`.

No execute grants are added for `anon`.

## What Is Intentionally Not Included

- RLS is not enabled.
- No RLS policies are created.
- No existing table RLS settings are changed.
- No table schemas are changed.
- No data is inserted, updated or deleted.
- No users or memberships are created.
- No app UI or route protection changes are made.

## Next Recommended Step

Next recommended step:

First staged RLS policies planning/review.

That next checkpoint should decide which foundation tables receive the first read policies, how the helper functions behave under RLS, and how Luke's first admin access is verified before broader rollout.
