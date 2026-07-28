# Domain / App Mode Routing Foundation

Task 154 formalises the domain and app-mode routing foundation for EveryBatch.

This task does not add DNS records, change Vercel domain settings, change Supabase Auth redirect URLs, activate tenant subdomain routing, add middleware, change database schema, create migrations, change RLS, change permissions, change tenant provisioning, move routes or change business logic.

Task 155 builds on this foundation with a narrow Platform Admin app-mode guard. The guard only redirects tenant workspace routes when the host resolves as `platform_admin`; tenant subdomain enforcement remains deferred.

## Strategy

EveryBatch should continue as:

- one repo
- one Vercel project
- one codebase
- multiple app modes resolved from the request host

Separate Vercel builds or client-specific forks are not needed for this foundation. Hostname mode should decide which surface is intended, while tenant data remains isolated through `organisation_id`, memberships, permissions, modules, feature flags and RLS.

## Domain Map

| Host | Mode | Current status |
| --- | --- | --- |
| `everybatchmrp.com` | `marketing` | Reserved for future marketing/coming soon. |
| `www.everybatchmrp.com` | `marketing` | Reserved for future marketing/coming soon. |
| `app.everybatchmrp.com` | `central_app` | Live central app/login domain. |
| `admin.everybatchmrp.com.au` | `platform_admin` | Preferred future Platform Admin domain, not connected/enforced yet. |
| `platform.everybatchmrp.com` | `platform_admin` | Legacy/optional Platform Admin host recognised for compatibility, not connected/enforced yet. |
| `cleaneats.everybatchmrp.com` | `tenant_app` | Future Clean Eats tenant workspace, not active yet. |
| `{tenant_slug}.everybatchmrp.com` | `tenant_app` | Future tenant workspace pattern, not active yet. |
| `support.everybatchmrp.com` | `support` | Future support/docs destination. |
| `localhost` / `127.0.0.1` | `local_dev` | Developer-friendly fallback with `cleaneats` tenant slug hint. |
| `*.vercel.app` | `local_dev` | Safe preview/deployment fallback matching existing behaviour. |
| unknown host | `unknown` | Safe unknown mode; no global enforcement yet. |

## App Modes

The resolver now explicitly supports:

- `marketing`
- `central_app`
- `platform_admin`
- `tenant_app`
- `support`
- `local_dev`
- `unknown`

`lib/tenant-resolver.ts` returns a structured host result with:

- `host`
- `hostname`
- `mode`
- `tenantSlug` when applicable
- `isKnownHost`
- `isEveryBatchDomain`
- `isLocalhost`
- `isLocalDev`
- `isPreview`
- canonical app/platform/marketing hosts
- `reason`

## Route Intent Helpers

Added:

```text
lib/app-mode-routing.ts
```

Pure helpers:

- `resolveAppModeFromHost(host)`
- `resolveAppModeFromHeaders(headers)`
- `getDefaultRouteForAppMode(mode)`
- `isRouteAllowedForAppMode(pathname, resolvedMode)`
- `getAppModeRedirect(pathname, resolvedMode)`

These helpers calculate intent only. They are not wired into middleware or global redirects.

Task 155 wires only the Platform Admin subset into middleware:

- `/` on Platform Admin host -> `/platform`
- tenant workspace routes on Platform Admin host -> `/platform`
- `/login`, `/select-workspace`, `/no-access`, `/platform/*` remain allowed

## Route Intent Rules

Current route intent:

- `marketing`: future marketing/coming-soon pages.
- `central_app`: `/login`, `/select-workspace`, transitional `/dashboard`, and `/platform` while admin domain routing is inactive.
- `platform_admin`: `/platform/*`, plus login/selector/no-access support routes.
- `tenant_app`: tenant workspace routes such as `/dashboard`, `/products`, `/suppliers`, `/components`, `/finished-products`, `/inventory`, `/costing-overview`, `/meal-margins`, `/purchase-documents`, `/tools` and admin/settings routes.
- `support`: future support/docs pages.
- `local_dev`: all current routes allowed for development convenience.
- `unknown`: recommended default route is `/login`, but no enforcement is active.

## Current Enforced Behaviour

No production domain enforcement was added in task 154.

Task 155 adds only Platform Admin host guarding. Central app and local development behaviour remain unchanged, and tenant app host enforcement remains inactive.

Current behaviour remains:

- `app.everybatchmrp.com` stays the live central app domain.
- `/login` continues using the existing workspace destination rules.
- `/select-workspace` continues to validate selections server-side.
- `/platform` remains available under the current app for platform admins.
- `/dashboard` and tenant workspace routes continue to work locally.
- tenant subdomain redirects remain inactive.

## Future Enforcement Plan

Future reviewed tasks can wire these helpers into middleware or layout-level guards after smoke testing:

1. Configure required DNS/Vercel domains.
2. Update Supabase Auth allowed redirect URLs.
3. Confirm central app login and selector behaviour.
4. Confirm Platform Admin access on the preferred admin domain.
5. Confirm tenant membership checks for host-derived tenant slugs.
6. Add limited redirect enforcement behind development/staging checks first.
7. Run the multi-tenant smoke test checklist.
8. Only then enable production tenant subdomain redirects.

## Future Login Behaviour

Planned behaviour once app-mode routing is enforced:

- central app after login:
  - one tenant workspace -> tenant workspace
  - multiple workspaces or platform admin -> `/select-workspace`
- admin domain after login:
  - `platform_admin` -> `/platform`
  - non-platform user -> `/no-access`
- tenant subdomain after login:
  - active member of that tenant -> `/dashboard`
  - no active membership -> `/no-access`

## Supabase Auth Notes

No Supabase Auth settings were changed.

Before enforcing new domains, review allowed URLs for:

- `https://app.everybatchmrp.com`
- `https://admin.everybatchmrp.com.au`
- `https://cleaneats.everybatchmrp.com`
- local development URLs

## Static Resolver Examples

`lib/tenant-resolver.ts` exports `appModeResolverExamples` for lightweight reference:

- `localhost:3000` -> `local_dev` / `cleaneats`
- `app.everybatchmrp.com` -> `central_app`
- `admin.everybatchmrp.com.au` -> `platform_admin`
- `cleaneats.everybatchmrp.com` -> `tenant_app` / `cleaneats`
- `support.everybatchmrp.com` -> `support`
- `everybatchmrp.com` -> `marketing`

## Manual Smoke Tests

After code changes, test locally:

- `/login`
- `/select-workspace`
- `/dashboard`
- `/platform`
- `/finished-products`
- `/meal-margins`

No live DNS setup is required for this task.

## Migration Notes

No SQL migration was created or changed.
