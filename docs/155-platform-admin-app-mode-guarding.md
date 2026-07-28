# Platform Admin App Mode Guarding

Task 155 adds safe app-mode-aware guarding for the planned EveryBatch Platform Admin domain.

This is a code-only guard task. It does not add DNS records, change Vercel domains, change Supabase Auth redirect URLs, change database schema, create migrations, change RLS, change permissions, change tenant provisioning, change app business logic or install packages.

Task 156 adds the manual setup guide for connecting `admin.everybatchmrp.com.au`. The guard in task 155 remains unchanged.

## What Is Enforced

When the request host resolves as:

```text
platform_admin
```

the middleware now prevents tenant workspace routes from rendering on the Platform Admin host.

Preferred future Platform Admin host:

```text
admin.everybatchmrp.com.au
```

Legacy/optional compatibility host still resolves as platform admin:

```text
platform.everybatchmrp.com
```

## Guarding Approach

Added:

```text
middleware.ts
```

The middleware:

- reads the request host
- resolves app mode through `lib/app-mode-routing.ts`
- applies redirects only when mode is `platform_admin`
- does not read Supabase Auth session
- does not query the database
- does not change permissions
- leaves all non-platform-admin modes unchanged

`lib/tenant-resolver.ts` was kept pure for middleware use. The server-side tenant lookup moved to:

```text
lib/tenant-lookup.ts
```

## Allowed On Platform Admin Host

Allowed:

- `/login`
- `/select-workspace`
- `/no-access`
- `/platform`
- `/platform/*`
- Next internals/assets such as `/_next/*`
- common static assets such as `/favicon.ico`, `/robots.txt`, `/sitemap.xml`

## Redirected On Platform Admin Host

Redirected to `/platform`:

- `/`
- tenant workspace routes such as `/dashboard`
- product routes such as `/products`, `/components`, `/finished-products`
- costings routes such as `/costing-overview`, `/meal-margins`, `/price-history`
- production routes
- inventory routes
- supplier invoice/tool routes
- tenant admin/settings routes

Unknown non-tenant paths are left to normal app routing/not-found handling.

## Local Development

`localhost`, `127.0.0.1`, private local IPs and Vercel deployment hosts remain permissive.

This keeps local development and preview testing simple while production domain routing is still being staged.

## Central App Behaviour

`app.everybatchmrp.com` keeps current central app behaviour.

The central app still allows `/platform` for now because the preferred Platform Admin domain is not live/enforced yet. Future tightening can happen after `admin.everybatchmrp.com.au` is connected and smoke tested.

## Tenant App Enforcement

Task 158 activates the first narrow tenant subdomain guard for Clean Eats only.

`cleaneats.everybatchmrp.com` resolves as `tenant_app` / `cleaneats`. On that host, `/` and `/platform/*` redirect to `/dashboard`, tenant workspace routes remain allowed, and no database/session reads are performed in middleware.

## Host Simulation Examples

Expected behaviour once host simulation is available:

| Host/path | Expected result |
| --- | --- |
| `admin.everybatchmrp.com.au/` | redirect to `/platform` |
| `admin.everybatchmrp.com.au/dashboard` | redirect to `/platform` |
| `admin.everybatchmrp.com.au/components` | redirect to `/platform` |
| `admin.everybatchmrp.com.au/platform` | allowed |
| `admin.everybatchmrp.com.au/login` | allowed |
| `localhost:3000/dashboard` | allowed |
| `app.everybatchmrp.com/platform` | allowed for now |

## Future Tasks

Recommended follow-ups:

- task 156: Platform Admin domain setup notes and deployment smoke test
- task 157: Platform Admin brand/UI polish for admin-domain readiness
- task 158: first Clean Eats tenant subdomain routing guard

## Migration Notes

No SQL migration was created or changed.
