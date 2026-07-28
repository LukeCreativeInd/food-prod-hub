# Multi-Domain Smoke Test and Redirect Hardening

Task 159 verifies the current EveryBatch multi-domain routing behaviour and adds one small redirect hardening rule.

This task does not add DNS records, change Vercel domain settings, change Supabase Auth settings, create dynamic tenant domain management, create a tenant domains table, change schema, create migrations, change RLS, change permissions or alter app business logic.

## Domain Map

| Domain | Mode | Current purpose |
| --- | --- | --- |
| `app.everybatchmrp.com` | `central_app` | Central login and workspace selection app. |
| `admin.everybatchmrp.com.au` | `platform_admin` | EveryBatch Platform Admin app. |
| `cleaneats.everybatchmrp.com` | `tenant_app` | Clean Eats tenant workspace. |
| `localhost` / `127.0.0.1` | `local_dev` | Permissive local development and review. |

## Redirect Matrix

Central app:

| Host | Path | Expected behaviour |
| --- | --- | --- |
| `app.everybatchmrp.com` | `/login` | Allowed. |
| `app.everybatchmrp.com` | `/select-workspace` | Allowed. |
| `app.everybatchmrp.com` | `/dashboard` | Current tenant app behaviour remains available after auth. |
| `app.everybatchmrp.com` | `/platform` | Redirects to `https://admin.everybatchmrp.com.au/platform`. |
| `app.everybatchmrp.com` | `/platform/*` | Redirects to the same path on `https://admin.everybatchmrp.com.au`. |
| `app.everybatchmrp.com` | tenant routes | Current central app behaviour remains available during domain transition. |

Platform Admin:

| Host | Path | Expected behaviour |
| --- | --- | --- |
| `admin.everybatchmrp.com.au` | `/` | Redirects to `/platform`. |
| `admin.everybatchmrp.com.au` | `/login` | Allowed. |
| `admin.everybatchmrp.com.au` | `/select-workspace` | Allowed. |
| `admin.everybatchmrp.com.au` | `/platform` and `/platform/*` | Allowed, then existing platform guards handle auth/role access. |
| `admin.everybatchmrp.com.au` | `/dashboard` | Redirects to `/platform`. |
| `admin.everybatchmrp.com.au` | `/components` | Redirects to `/platform`. |
| `admin.everybatchmrp.com.au` | `/finished-products` | Redirects to `/platform`. |

Clean Eats tenant:

| Host | Path | Expected behaviour |
| --- | --- | --- |
| `cleaneats.everybatchmrp.com` | `/` | Redirects to `/dashboard`. |
| `cleaneats.everybatchmrp.com` | `/login` | Allowed. |
| `cleaneats.everybatchmrp.com` | `/select-workspace` | Redirects to `/dashboard` because the tenant host already selects the workspace. |
| `cleaneats.everybatchmrp.com` | `/dashboard` | Allowed, then existing auth guard handles signed-out users. |
| `cleaneats.everybatchmrp.com` | `/components` | Allowed according to existing auth, permission and module rules. |
| `cleaneats.everybatchmrp.com` | `/finished-products` | Allowed according to existing auth, permission and module rules. |
| `cleaneats.everybatchmrp.com` | `/purchase-documents` | Allowed according to existing auth, permission and module rules. |
| `cleaneats.everybatchmrp.com` | `/platform` and `/platform/*` | Redirects to `/dashboard`; Platform Admin must not render on the tenant host. |

Local development:

| Host | Path | Expected behaviour |
| --- | --- | --- |
| `localhost:3000` | `/dashboard` | Allowed for development. |
| `localhost:3000` | `/platform` | Allowed for development, then existing app guards apply. |
| `localhost:3000` | `/components` | Allowed for development. |

## Redirect Hardening Added

Only `cleaneats.everybatchmrp.com` is active as a tenant subdomain in v1.

Inactive tenant-looking subdomains such as `{tenant_slug}.everybatchmrp.com` now redirect non-public, non-asset routes to `/login` instead of falling through to normal app rendering. This avoids accidentally exposing app pages on arbitrary tenant subdomains before dynamic tenant domain management exists.

Allowed on inactive tenant subdomains:

- Next internals and static assets
- `/login`
- `/select-workspace`
- `/no-access`

Redirected on inactive tenant subdomains:

- `/`
- `/dashboard`
- `/platform`
- tenant workspace routes
- unknown app routes

Middleware still performs no Supabase, session or database reads.

## Supabase Auth Checklist

Supabase Auth Site URL should remain the central app URL during this transition:

- `https://app.everybatchmrp.com`

Redirect URLs should include the deployed domains and local development URLs used for login/logout flows:

- `https://app.everybatchmrp.com/*`
- `https://admin.everybatchmrp.com.au/*`
- `https://cleaneats.everybatchmrp.com/*`
- `http://localhost:3000/*`
- Vercel preview/production URLs retained as needed during rollout

These settings are manual. This task does not change Supabase Auth settings.

## Vercel / DNS Checklist

- [ ] `app.everybatchmrp.com` is valid in Vercel.
- [ ] `admin.everybatchmrp.com.au` is valid in Vercel before live Platform Admin smoke testing.
- [ ] `cleaneats.everybatchmrp.com` is valid in Vercel before live tenant smoke testing.
- [ ] Cloudflare records use the target values requested by Vercel.
- [ ] Cloudflare proxy remains DNS-only unless separately reviewed.
- [ ] SSL is valid for each connected host.

These settings are manual. This task does not change Vercel or DNS settings.

## Signed-Out Smoke Tests

- [ ] `app.everybatchmrp.com/login` loads.
- [ ] `app.everybatchmrp.com/platform` redirects to `https://admin.everybatchmrp.com.au/platform`.
- [ ] `app.everybatchmrp.com/platform/tenants` redirects to `https://admin.everybatchmrp.com.au/platform/tenants`.
- [ ] `admin.everybatchmrp.com.au/` redirects to `/platform`.
- [ ] `admin.everybatchmrp.com.au/dashboard` redirects to `/platform`.
- [ ] `admin.everybatchmrp.com.au/platform` is allowed, then existing auth guard handles signed-out users.
- [ ] `cleaneats.everybatchmrp.com/` redirects to `/dashboard`, then existing auth guard may redirect to `/login`.
- [ ] `cleaneats.everybatchmrp.com/select-workspace` redirects to `/dashboard`.
- [ ] `cleaneats.everybatchmrp.com/dashboard` is allowed, then existing auth guard handles signed-out users.
- [ ] `cleaneats.everybatchmrp.com/platform` redirects to `/dashboard`.

## Signed-In Platform Admin Tests

- [ ] Login through `app.everybatchmrp.com/login`.
- [ ] Workspace selector shows Clean Eats workspace and Platform Admin Console.
- [ ] `app.everybatchmrp.com/platform` redirects to `https://admin.everybatchmrp.com.au/platform`.
- [ ] `admin.everybatchmrp.com.au/platform` loads Platform Admin.
- [ ] `admin.everybatchmrp.com.au/dashboard` redirects to `/platform`.
- [ ] `cleaneats.everybatchmrp.com/dashboard` loads Clean Eats workspace.
- [ ] `cleaneats.everybatchmrp.com/platform` redirects to `/dashboard`.

## Signed-In Tenant User Tests

- [ ] Login succeeds from allowed app/tenant URLs.
- [ ] `cleaneats.everybatchmrp.com/dashboard` loads.
- [ ] Tenant routes load according to existing module/permission rules.
- [ ] `/platform` on `cleaneats.everybatchmrp.com` does not render Platform Admin.
- [ ] `/platform` on `admin.everybatchmrp.com.au` remains blocked by existing platform guards for non-platform users.

## Demo / Non-Platform User Tests

- [ ] Demo user can reach tenant workspace routes allowed by current permissions.
- [ ] Demo user cannot access Platform Admin.
- [ ] Demo user does not see Platform Admin workspace options.
- [ ] Supplier Invoice Intake remains blocked if the user lacks permission.

## Stale Local Session Note

During local testing, `/login` may briefly show `Invalid Refresh Token: Refresh Token Not Found` if the browser has a stale local Supabase session cookie. In the observed case, login then worked and the error cleared.

No auth logic was changed in this task. If this keeps recurring, a future auth hardening task can catch stale refresh-token errors and clear local session cookies gracefully.

## Temporary Behaviour

- `cleaneats.everybatchmrp.com/login` uses the current login experience; tenant-specific login styling is future work.

## Future Hardening

- Add a `tenant_domains` table and database-backed domain lookup.
- Add tenant-specific login styling.
- Refine workspace selector behaviour on tenant subdomains.
- Add branded 404 and no-access pages.
- Add a support/docs destination for `support.everybatchmrp.com`.

## Migration Notes

No SQL migration was created or changed.
