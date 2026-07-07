# Supabase / Auth Plan v0.1

## Purpose

Supabase will eventually manage authentication, users, organisation memberships, role-based access, and tenant-aware database security for Food Prod Hub.

This document is a planning guide only. It does not add authentication code, database migrations, real database queries, or business logic.

## Supabase Responsibilities

- Auth/login
- User identities
- Postgres database
- Row Level Security
- Storage later
- API access
- Environment variables

## Authentication Flow

Draft future tenant app flow:

1. User visits tenant URL such as `cleaneats.projectname.com`.
2. User logs in.
3. Supabase authenticates user.
4. App loads user profile.
5. App loads organisation memberships.
6. App resolves current organisation/tenant.
7. App loads enabled modules, role, and permissions.
8. User lands on Dashboard.

## Central Login Flow

Future `app.projectname.com` flow:

1. User logs in centrally.
2. System checks memberships.
3. If the user has one organisation, redirect to that tenant.
4. If the user has multiple organisations, show an organisation picker.

## Tenant Subdomain Flow

- `cleaneats.projectname.com` resolves tenant slug as `cleaneats`.
- App checks whether authenticated user has membership for that organisation.
- If yes, load tenant context.
- If no, deny access or redirect.

## User / Profile Model

Future auth and profile data should separate:

- Supabase `auth.users`: Authentication identity managed by Supabase.
- Application profile table: App-specific user profile fields, such as display name and email reference.
- Organisation memberships: Links users to organisations/tenants.
- Role assignments: Defines what a user can access within an organisation or platform context.

This separation keeps authentication identity, app profile data, tenant access, and permissions clear.

Profiles and organisation memberships will be created before auth UI is added. `profiles.id` is intended to align with Supabase auth user IDs later, while memberships define which organisations each profile can access.

## Role and Permission Approach

- Roles belong to memberships or organisation context.
- Permissions should eventually control module and action-level access.
- Staff/tablet users may have limited access to production task screens.
- Admin users may access organisation settings, users, modules, and integrations.

Roles and permissions should be implemented only after the tenant and auth model is approved.

## Protected Routes

Future route groups may include:

- Public marketing pages
- Auth pages
- Tenant app pages
- Platform admin pages
- Tablet/production task pages

Each protected route group should validate authentication, organisation membership, role, and permission as appropriate.

## Security Principles

- Never trust client-side tenant selection alone.
- Every tenant-owned database row should include `organisation_id`.
- RLS should enforce organisation boundaries.
- Server-side checks should validate membership and role.
- Secrets stay in environment variables.
- Service-role keys must never be exposed to the browser.

## Environment Variables

Future environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, server-only, future use only
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PLATFORM_DOMAIN`

## Supabase Publishable Keys

Supabase now labels browser-safe public API keys as Publishable keys. This project stores that publishable key in `NEXT_PUBLIC_SUPABASE_ANON_KEY` for compatibility with existing Supabase client naming and helper conventions.

Secret keys, including `sb_secret_...` keys and future service-role keys, are server-only and must not be exposed to the browser.

## MVP Auth Approach

Phase 1 can start with:

- One Clean Eats organisation
- Invited users only
- Basic roles
- Protected dashboard/app routes
- No public sign-up

## Open Decisions

- Email/password vs magic link
- Whether Clean Eats uses one tenant URL or central login first
- Initial roles to implement first
- Whether tablet users need separate simplified login
