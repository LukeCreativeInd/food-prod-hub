# Login Branding Split

## Purpose

Task 120 improves the `/login` visual foundation and prepares a future split between:

- central EveryBatch login
- tenant workspace login

The existing login route and Supabase email/password behaviour remain unchanged.

## Current Implementation

The current `/login` route uses central EveryBatch styling by default because tenant subdomain routing is not implemented yet.

The page now presents:

- EveryBatch
- Food Manufacturing OS
- "Sign in to your workspace"
- "Every ingredient. Every process. Every batch."
- a polished brand panel
- a separate secure sign-in card
- Clean Eats Hub as Tenant 1 foundation context after the login form

No host detection, tenant selector, central app domain routing or tenant-specific login routing is active.

## Components Added

Added:

```text
components/auth/login-brand-panel.tsx
components/auth/login-form-card.tsx
```

`LoginBrandPanel` supports:

- `mode="platform"`
- `mode="tenant"`
- optional tenant name
- optional tenant logo URL
- platform brand/category/tagline copy
- tenant "Powered by EveryBatch" presentation

`LoginFormCard` wraps the existing login form with central-vs-tenant copy. It does not change the form action or Supabase Auth behaviour.

## Central Login Target

Future central login target:

```text
app.everybatchmrp.com/login
```

Expected future behaviour:

- EveryBatch-branded login
- tenant selector after login when needed
- account-level password reset/invite flows
- redirect to the selected tenant workspace

This task does not implement that routing.

## Tenant Login Target

Future tenant login example:

```text
cleaneats.everybatchmrp.com/login
```

Expected future behaviour:

- tenant logo/name
- Clean Eats Hub workspace identity
- "Powered by EveryBatch"
- host-derived tenant context
- redirect only if membership matches the resolved tenant

This task only prepares visual component support for tenant mode. It does not resolve tenant context from hostnames.

## What Was Not Implemented

This task does not add:

- tenant subdomain routing
- central tenant selector
- password reset redesign
- invite flow
- platform admin separation
- support/help backend
- marketing site
- logo upload
- logo asset management
- new auth provider
- database migrations
- RLS or permission changes

## Security And Performance Notes

The public login page still only checks whether a user is already signed in and redirects signed-in users to `/dashboard`.

No database calls, tenant context calls, service-role usage, middleware changes, route handlers or external scripts/packages were added.

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
