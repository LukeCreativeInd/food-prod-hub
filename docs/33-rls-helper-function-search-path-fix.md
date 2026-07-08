# RLS Helper Function Search Path Fix

## Status

Migration 013 has been drafted:

`supabase/migrations/013_fix_rls_helper_function_search_path.sql`

This migration has not been applied to Supabase by this repo task.

## Why This Migration Exists

Supabase advisor reports "Function Search Path Mutable" warnings for the existing RLS helper functions. The warning means the functions do not explicitly set their `search_path`, which can make function execution less predictable.

Migration 013 replaces the existing helper functions with identical logic and an explicit `search_path`.

## Advisor Warning Addressed

This migration addresses the Supabase advisor warning:

`Function Search Path Mutable`

Affected functions:

- `public.current_profile_id()`
- `public.is_active_member(uuid)`
- `public.current_role_key(uuid)`
- `public.is_platform_admin()`
- `public.has_permission(uuid, text)`

## What Changes

Each function keeps the same:

- name
- arguments
- return type
- `language sql`
- `stable` setting
- logic
- authenticated-only execute grant

Each function now adds:

`set search_path = public, auth`

## SECURITY DEFINER

`SECURITY DEFINER` is not used.

These helpers continue to run as normal SQL stable functions using the current authenticated Supabase user context.

## What Is Not Changed

- RLS policies are not changed.
- Table RLS settings are not changed.
- Table schemas are not changed.
- No seed data is added or changed.
- No users or memberships are created.
- No app UI or route protection changes are made.
- No helper function logic is changed.

## Grants

Execute grants remain authenticated-only:

- `public.current_profile_id()` to `authenticated`
- `public.is_active_member(uuid)` to `authenticated`
- `public.current_role_key(uuid)` to `authenticated`
- `public.is_platform_admin()` to `authenticated`
- `public.has_permission(uuid, text)` to `authenticated`

No grants are added for `anon`.

## Next Recommended Step

Next recommended step:

Roles and permissions RLS `SELECT` policies.

Because Migration 013 is now used for helper function search path hardening, the roles/permissions RLS migration should move to:

`supabase/migrations/014_enable_roles_permissions_rls_select_policies.sql`
