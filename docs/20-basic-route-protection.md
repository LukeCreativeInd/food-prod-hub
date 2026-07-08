# Basic Route Protection

## Status

Basic Supabase Auth route protection has been added.

This does not add RLS, middleware, permission-based route restrictions, database migrations, user creation, membership creation or business module data queries.

Update: route protection now runs inside the separated protected app layout structure. `/login` uses a standalone public auth layout with no sidebar.

## Route Protection Approach

The app uses a small reusable server guard:

- `lib/auth/require-auth.ts`

The guard calls `getCurrentUser()`.

- If a Supabase Auth user exists, the page renders.
- If no Supabase Auth user exists, the user is redirected to `/login`.

This is intentionally auth-user only for now. It does not check profile, membership, organisation or permissions yet.

## Protected Routes

The authenticated app pages are protected, including:

- `/`
- `/dashboard`
- `/organisation-settings`
- `/modules`
- `/users`
- `/integrations`
- Product and module placeholder pages
- Production, costing, inventory, purchasing, QA, reports, CRM, logistics and wholesale placeholder pages

Most module placeholder routes are protected through the shared `PlaceholderPage` component. Custom dashboard/admin pages call `requireAuth()` directly.

## Public Routes

The public route is:

- `/login`

No other public app routes are intentionally added in this step.

## Unauthenticated Redirects

When an unauthenticated user opens a protected app page, `requireAuth()` redirects them to:

- `/login`

The redirect happens server-side before the protected page content renders.

## Logged-In Login Redirect

When a signed-in user opens `/login`, the login page checks the current Supabase Auth user and redirects them to:

- `/dashboard`

The login page does not query profiles, memberships, organisations or permissions.

## Why This Only Checks Supabase Auth User

This step is intentionally simple.

It confirms whether a user is signed in before app pages render, but it does not enforce tenant membership or permissions yet.

Profile, membership and permission restrictions will come later after the current auth context has been verified.

## Still Not Implemented

- No RLS policies.
- No middleware.
- No permission-based route restrictions.
- No profile or membership enforcement.
- No tenant switching.
- No production, costing, inventory or QA business data queries.
- No service-role key usage.

## RLS Reminder

RLS is still not enabled. It should remain deferred until route protection, profile/membership context and permission enforcement are tested carefully.
