# Auth Implementation Checklist

## Checklist Status

This is a planning and build checklist only.

The auth helper foundation and basic login/logout UI have now been added. No users, memberships, RLS policies or app database queries have been implemented yet.

First admin setup instructions have been created at [First Admin Setup](17-first-admin-setup.md), but the manual setup itself is not completed by this repo task.

This checklist should be completed step by step before enabling RLS broadly.

## Current Backend State

Migrations 001-010 have been manually applied in Supabase and provide the first backend foundation block.

Foundation tables now exist for:

- `organisations`
- `organisation_settings`
- `organisation_branding`
- `profiles`
- `organisation_memberships`
- `roles`
- `permissions`
- `role_permissions`
- `modules`
- `organisation_modules`
- `audit_logs`

Clean Eats exists as Tenant 1. Roles, permissions and Clean Eats modules are seeded.

The app is not connected to live database data yet.

## Required Supabase Auth Package Check

Current `package.json` status:

- `@supabase/supabase-js` is installed.
- `@supabase/ssr` is installed.

The helper foundation added `@supabase/ssr` for Next.js App Router client/server helpers.

## Environment Variable Checklist

Expected environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PLATFORM_DOMAIN`

Notes:

- Never expose service-role or secret keys in client code.
- Secret/server-only keys should not be added unless there is a specific server-side need.
- Vercel environment variables and local `.env.local` values must stay aligned.

## Supabase Client Helper Plan

Current helper files:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/auth/get-current-user.ts`
- `lib/auth/get-current-profile.ts`
- `lib/auth/get-current-organisation.ts`
- `lib/auth/get-current-membership.ts`
- `lib/auth/permissions.ts`

Expected responsibilities:

- Browser client for client components.
- Server client for server components and server actions.
- User, profile and membership helpers for tenant context.
- Permission helpers for route and action checks.

Current status:

- Browser and server Supabase client helpers are created.
- `getCurrentUser()` is created and reads Supabase Auth only.
- Profile, organisation, membership and permission helpers are placeholders only and do not query the database yet.

## Route Structure Plan

Planned public routes:

- `/login`
- `/reset-password` or `/forgot-password` if needed later

Planned protected routes:

- `/dashboard`
- `/organisation-settings`
- `/modules`
- `/users`
- `/integrations`
- Product, operations and business module pages

Potential tablet routes:

- `/tablet`
- `/tablet/tasks`

Potential future platform routes:

- `/platform`
- `/platform/tenants`

These routes are planned only. They are not implemented by this document.

## First Admin User Setup Checklist

Manual setup instructions are available in [First Admin Setup](17-first-admin-setup.md). These instructions have been created, but the user/profile/membership setup must still be completed manually in Supabase.

Safe first admin setup sequence:

1. Create Luke's Supabase Auth user manually or via Supabase invite.
2. Copy the auth user id.
3. Create a matching `public.profiles` row with:
   - `id = auth user id`
   - `full_name`
   - `email`
   - `status = active`
4. Create a `public.organisation_memberships` row with:
   - `organisation_id = Clean Eats organisation id`
   - `profile_id = Luke profile id`
   - `role_key = platform_admin` or `organisation_admin`
   - `access_level = platform` or `admin`
   - `status = active`
   - `joined_at = now()`
5. Confirm the user can sign in and load protected pages before any broad RLS rollout.

Do not seed real auth users into migrations. User creation should be controlled and verified.

## Initial Role Decision Point

Luke can start with either of these roles:

Option A: `platform_admin`

- Best for platform owner/developer access.
- Can later manage multiple tenants.
- Should be used carefully.

Option B: `organisation_admin`

- Best for Clean Eats-only admin access.
- Safer tenant-specific option.

Recommendation: for development, Luke should likely start as `platform_admin`, with Clean Eats membership as well, because he is building and administering the platform. This should be reviewed before production rollout.

## Clean Eats User Onboarding Checklist

Future users and likely role mappings:

- Tony: `operations_manager` or `production_manager`
- Cettina: `qa_manager`
- Luisa: `qa_manager`
- Eddie: `warehouse_manager`
- Rob: `wholesale_manager`
- Production floor staff: `tablet_user` or `staff`

These are planning assumptions only. Do not create these users yet.

Each user should be created through the Supabase Auth or invite flow and then linked to profiles and memberships.

## Route Protection Implementation Checklist

Stage 1:

- Add auth helpers. Completed.
- Add login/logout. Completed.
- Detect current user.
- Redirect unauthenticated users away from protected routes.

Stage 2:

- Load current profile and membership.
- Establish current organisation context.
- Show safe fallback if no membership exists.

Stage 3:

- Add role/permission checks.
- Restrict admin routes.
- Restrict tablet routes.
- Restrict platform routes.

Stage 4:

- Add database reads to selected pages after tenant context is reliable.

## Pre-RLS Testing Checklist

Before enabling RLS, test:

- Login works.
- Logout works.
- Unauthenticated protected routes redirect.
- Luke user resolves to profile.
- Luke profile resolves to Clean Eats membership.
- Luke role resolves to permissions.
- Current organisation resolves to Clean Eats.
- Route protection works without RLS.
- No service-role keys are exposed.
- Vercel deployment works with auth env vars.

## RLS Readiness Checklist

Before enabling RLS, confirm:

- First admin user exists.
- Profile exists.
- Membership exists.
- `role_key` matches `roles.role_key`.
- Tenant scoping helpers are working.
- Permission helpers are working.
- Rollback plan exists.
- Policies are written table by table.
- Policies are tested in Supabase before broad rollout.

## First Tables Likely to Receive RLS Later

Likely first RLS candidates:

- `profiles`
- `organisations`
- `organisation_memberships`
- `organisation_settings`
- `organisation_branding`
- `modules`
- `organisation_modules`

`audit_logs` may need special handling.

Business module tables should include `organisation_id` from the start.

## Audit Logging Checklist

Plan future audit records for auth/security actions:

- User login
- User logout
- User invited
- Profile created
- Membership created
- Role changed
- Module enabled/disabled
- Organisation settings changed

Audit logging should not block initial auth rollout. Automatic triggers can come later.

## Risk Checklist

- Do not enable RLS before an admin user can access required rows.
- Do not rely only on client-side permission checks.
- Do not query tenant-owned data without `organisation_id` scoping.
- Do not hard-code Clean Eats into reusable platform helpers.
- Do not expose Supabase secret/service-role keys in client bundles.
- Do not create production users casually during development.
- Do not skip local and Vercel testing before moving on.

## Recommended Implementation Order

1. Confirm auth package status. Completed.
2. Add Supabase client/server helpers. Completed.
3. Add login/logout UI. Completed.
4. Add protected route handling.
5. Manually create Luke auth user.
6. Manually create Luke profile and Clean Eats membership.
7. Add profile/membership/current organisation helpers.
8. Add route-level permission checks.
9. Test locally.
10. Test on Vercel.
11. Draft first RLS policies.
12. Enable and test RLS gradually.

## Short Executive Summary

The database is ready for auth, but auth should be implemented in controlled stages. The safest next build step is to add Supabase auth helpers and login/logout, then create Luke as the first verified admin user before enabling RLS.
