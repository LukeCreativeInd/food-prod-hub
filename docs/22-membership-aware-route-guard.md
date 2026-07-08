# Membership-Aware Route Guard

## Status

Protected app pages now require more than a signed-in Supabase Auth user.

They require:

- Signed-in Supabase Auth user.
- Matching `public.profiles` row.
- Active Clean Eats organisation membership.
- Active organisation context.

This does not add RLS, permission-based page restrictions, database migrations, user creation, membership creation or business module data queries.

## What Changed

A new guard was added:

- `lib/auth/require-app-access.ts`

Protected app pages now use `requireAppAccess()` instead of only `requireAuth()`.

## `requireAuth()` vs `requireAppAccess()`

`requireAuth()` checks only:

- Is there a signed-in Supabase Auth user?

If no user exists, it redirects to:

- `/login`

`requireAppAccess()` checks:

- Signed-in user exists.
- Profile exists.
- Active Clean Eats membership exists.
- Active organisation context exists.

If no signed-in user exists, it redirects to:

- `/login`

If profile, membership or organisation context is missing, it redirects to:

- `/access-issue`

## Access Issue Page

The access issue page lives at:

- `/access-issue`

It explains that sign-in works, but app access has not been fully set up yet.

It does not show sensitive debug data and does not query business module data.

It includes a sign-out option.

Important: `/access-issue` uses only `requireAuth()`, not `requireAppAccess()`, so users with missing membership context do not get stuck in a redirect loop.

## Guarded Routes

Membership-aware guarding applies to:

- `/`
- `/dashboard`
- `/organisation-settings`
- `/modules`
- `/users`
- `/integrations`
- Existing product/module placeholder page URLs
- Production, costing, inventory, purchasing, QA, reports, CRM, logistics and wholesale placeholder URLs

Most placeholder routes are guarded through the shared `PlaceholderPage` component.

Custom dashboard/admin pages call `requireAppAccess()` directly.

## Public And Special Routes

Public route:

- `/login`

Special signed-in-only route:

- `/access-issue`

`/login` remains public and redirects signed-in users to `/dashboard`.

`/access-issue` is available to signed-in users even if profile, membership or organisation context is missing.

## Missing Context Behaviour

If a signed-in user has no matching profile, no active Clean Eats membership or no active organisation context, app pages redirect to:

- `/access-issue`

The user sees a clear setup message and can sign out.

## Permission Restrictions

No permission-based page restrictions have been added yet.

This guard does not check specific permissions such as `admin.organisation.view`.

Permission-aware route planning or admin route permission checks should come later.

## RLS Reminder

RLS is still not enabled. It should remain deferred until membership-aware guarding and permission planning are tested carefully.
