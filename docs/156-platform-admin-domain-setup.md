# Platform Admin Domain Setup

Task 156 prepares the manual setup plan for the real EveryBatch Platform Admin domain.

Domain:

```text
admin.everybatchmrp.com.au
```

This task does not add DNS records, change Vercel settings, change Supabase Auth settings, activate tenant subdomain routing, change database schema, create migrations, change RLS, change permissions, move routes, change business logic or install packages.

## Purpose

`admin.everybatchmrp.com.au` is the future EveryBatch Platform Admin/operator console.

It is not a tenant workspace.

It uses the same Vercel project, same repo and same codebase as `app.everybatchmrp.com`. The request hostname resolves to app mode:

```text
platform_admin
```

Task 155 already added the narrow Platform Admin host guard:

- admin host `/` redirects to `/platform`
- admin host tenant routes redirect to `/platform`
- admin host `/login`, `/select-workspace`, `/no-access`, `/platform` and `/platform/*` are allowed
- existing Platform Admin auth/permission guards still decide whether the user can access `/platform`

## Current Domain State

Current live app domain:

```text
app.everybatchmrp.com
```

Platform Admin domain not yet connected:

```text
admin.everybatchmrp.com.au
```

Legacy/optional Platform Admin planning host:

```text
platform.everybatchmrp.com
```

Treat `platform.everybatchmrp.com` as legacy/optional unless a future task deliberately retains it.

## Vercel Setup Checklist

In the existing Vercel project:

- [ ] Open the EveryBatch/Food Prod Hub Vercel project.
- [ ] Add domain:
  - `admin.everybatchmrp.com.au`
- [ ] Wait for Vercel to show DNS instructions.
- [ ] Copy the exact CNAME and/or verification values Vercel provides.
- [ ] Do not guess or reuse the `app.everybatchmrp.com` DNS target unless Vercel explicitly shows the same value.
- [ ] Do not remove `app.everybatchmrp.com`.
- [ ] Do not remove the current Vercel production URL.
- [ ] Wait for Vercel to mark `admin.everybatchmrp.com.au` as valid.
- [ ] Confirm Vercel SSL/HTTPS is active.

## Cloudflare DNS Checklist

In Cloudflare for `everybatchmrp.com.au`:

- [ ] Add a DNS record for `admin`.
- [ ] Record type will likely be `CNAME`, but follow Vercel's exact instructions.
- [ ] Target/value must be copied from the Vercel domain instructions.
- [ ] Set Cloudflare proxy to DNS only while Vercel validates the record, unless Vercel's current instructions say otherwise.
- [ ] Wait for DNS propagation.
- [ ] Confirm `https://admin.everybatchmrp.com.au` resolves.
- [ ] Confirm there are no SSL warnings.
- [ ] Do not add wildcard tenant DNS as part of this task.
- [ ] Do not connect `cleaneats.everybatchmrp.com` as part of this task.

## Supabase Auth Redirect Checklist

Review Supabase Auth URL configuration before testing login from the admin domain.

Add admin domain URLs if the current auth flow requires them:

- `https://admin.everybatchmrp.com.au`
- `https://admin.everybatchmrp.com.au/login`
- `https://admin.everybatchmrp.com.au/platform`
- `https://admin.everybatchmrp.com.au/select-workspace`

Keep existing URLs:

- `https://app.everybatchmrp.com`
- `https://app.everybatchmrp.com/login`
- `https://app.everybatchmrp.com/select-workspace`
- existing Vercel production URL if currently used
- existing Vercel preview URL patterns if used for testing
- `http://localhost:3000`
- any existing local callback/login URLs

Do not remove existing redirect URLs during the transition.

## Expected Behaviour After Setup

Signed out:

- `https://admin.everybatchmrp.com.au`
  - redirects to `/platform`, then existing auth guard should send to `/login`
- `https://admin.everybatchmrp.com.au/login`
  - loads the login page
- `https://admin.everybatchmrp.com.au/dashboard`
  - redirects to `/platform`, then login/no-access behaviour depends on auth state

Signed in as `platform_admin`:

- `/platform` loads Platform Admin
- `/platform/tenants` loads
- `/platform/tenants/new` loads
- `/platform/tenants/provisioning` loads
- `/platform/tenants/onboarding` loads
- `/platform/tenants/first-admin` loads
- `/dashboard` on the admin domain redirects away from the tenant app

Signed in as non-platform/demo user:

- `/platform` is blocked by existing Platform Admin guards
- `/dashboard` on the admin domain does not show the tenant app

Central app:

- `https://app.everybatchmrp.com` still works
- `/login` still works
- `/select-workspace` still works
- `/dashboard` still works after tenant selection
- `/platform` remains available for `platform_admin` temporarily

Local development:

- `localhost` remains permissive
- `/login`, `/select-workspace`, `/dashboard`, `/platform`, `/finished-products` and `/meal-margins` continue to work locally

## Smoke Test Checklist

### Before Connecting Domain

- [ ] Code build passes.
- [ ] Host simulation still confirms admin host guard behaviour.
- [ ] `lib/platform-brand.ts` uses `admin.everybatchmrp.com.au` as `PLATFORM_ADMIN_DOMAIN`.
- [ ] `platform.everybatchmrp.com` is documented as legacy/optional where referenced.

### After Vercel And DNS Validate

Signed out:

- [ ] Visit `https://admin.everybatchmrp.com.au`.
- [ ] Confirm it lands safely on login through `/platform` auth guard flow.
- [ ] Visit `https://admin.everybatchmrp.com.au/login`.
- [ ] Confirm login page loads.
- [ ] Visit `https://admin.everybatchmrp.com.au/dashboard`.
- [ ] Confirm tenant dashboard does not render on admin domain.

Signed in as `platform_admin`:

- [ ] `/platform` loads.
- [ ] `/platform/tenants` loads.
- [ ] `/platform/tenants/new` loads.
- [ ] `/platform/tenants/provisioning` loads.
- [ ] `/platform/tenants/onboarding` loads.
- [ ] `/platform/tenants/first-admin` loads.
- [ ] `/dashboard` redirects away from tenant app.

Signed in as non-platform/demo user:

- [ ] `/platform` does not expose Platform Admin.
- [ ] `/dashboard` on admin domain does not expose tenant app.
- [ ] `/login` still loads.

Central app:

- [ ] `https://app.everybatchmrp.com/login` works.
- [ ] `https://app.everybatchmrp.com/select-workspace` works.
- [ ] `https://app.everybatchmrp.com/dashboard` works after tenant selection.
- [ ] `https://app.everybatchmrp.com/platform` remains available for `platform_admin` during the transition.

Local dev:

- [ ] `http://localhost:3000/login` works.
- [ ] `http://localhost:3000/select-workspace` works.
- [ ] `http://localhost:3000/dashboard` works.
- [ ] `http://localhost:3000/platform` works.

## Rollback Notes

If the admin domain setup causes issues:

- remove or disable `admin.everybatchmrp.com.au` from the Vercel project
- remove or disable the Cloudflare `admin` DNS record if needed
- keep `app.everybatchmrp.com` live
- keep the current Vercel production URL available
- do not delete tenant data
- no database rollback is required
- no migration rollback is required
- the code guard is harmless when the admin host is not pointed at the app
- restore Supabase Auth redirect URL settings only if a newly added admin URL causes a confirmed problem

## Not Included

This task does not include:

- DNS record creation
- Vercel domain creation
- Supabase Auth settings changes
- tenant subdomain routing
- Clean Eats host enforcement
- Platform Admin UI polish
- Platform Admin route moves
- app business logic changes
- database migrations
- RLS or permission changes

## Future Follow-Ups

- task 157: Platform Admin brand/UI polish for admin-domain readiness has been added without DNS, routing, auth, database or permission changes
- task 158: Clean Eats tenant subdomain routing v1 has been added in code for `cleaneats.everybatchmrp.com`; DNS, Vercel and Supabase Auth URL settings remain manual
- future: central app tightening so `/platform` can eventually move away from `app.everybatchmrp.com`
