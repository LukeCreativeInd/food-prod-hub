# Auth Context Status

## Status

A small development-safe auth context status card has been added to the dashboard.

This does not add route protection, middleware, RLS, database migrations, user creation, membership creation or business module data queries.

Update: the dashboard is now behind basic Supabase Auth route protection, so the card is viewed after a signed-in user reaches `/dashboard`.

## Where It Appears

The status card appears on:

- `/dashboard`

It is rendered near the bottom of the dashboard and uses the existing `SectionCard` and `StatusBadge` components.

## What It Checks

The card uses the auth context helpers to display:

- Auth status: signed in or not signed in.
- Profile: found or missing.
- Membership: active or missing.
- Organisation: organisation name and slug, or missing.
- Role: current membership `role_key`, or missing.

It also runs one permission probe:

- `userHasPermission('admin.organisation.view')`

The card displays this as:

- Can view organisation settings: Yes/No

## Missing States

Missing states are expected while setup is still in progress.

- Not signed in: no active Supabase Auth session is available.
- Missing profile: the auth user does not yet have a matching `public.profiles` row.
- Missing membership: the profile does not yet have an active Clean Eats membership.
- Missing organisation: the active Clean Eats membership or organisation could not be resolved.
- Permission No: the current role does not resolve to the `admin.organisation.view` permission.

## Why This Exists Before Route Protection

This card gives a quick way to verify the first admin setup before protecting routes or enabling RLS.

It helps confirm:

- The Supabase Auth session exists.
- The auth user id matches a profile.
- The profile has an active Clean Eats membership.
- The membership resolves to Clean Eats.
- The role key can resolve permissions.

## Security Notes

The card does not expose tokens, Supabase Auth metadata or service-role keys.

It should remain a temporary development visibility aid until route protection and admin flows are more mature.

## RLS And Route Protection

RLS is still not enabled.

Routes are still not protected.

## Next Recommended Step

Verify the first admin profile and Clean Eats membership using this card.

Once the card shows the expected signed-in admin context, the next recommended step is route protection using the auth context helpers.
