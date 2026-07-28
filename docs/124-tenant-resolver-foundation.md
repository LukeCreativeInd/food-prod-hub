# Tenant Resolver Foundation

## Purpose

Task 124 adds a safe helper foundation for parsing EveryBatch request hostnames and preparing future tenant resolution.

This task does not activate host-based routing.

Current app behaviour remains unchanged:

- existing login flow remains unchanged
- current membership/org context remains unchanged
- Clean Eats remains the active Tenant 1 workspace through existing auth context
- no middleware redirects or rewrites are added

## Files Added

Added:

```text
lib/tenant-resolver.ts
```

The helper contains:

- `normaliseHost(host)`
- `parseEveryBatchHost(host)`
- `getAppModeFromHost(host)`
- `resolveTenantFromSlug(slug)`
- `DEFAULT_LOCAL_DEV_TENANT_SLUG = "cleaneats"`

Task 154 strengthens this helper and adds route-intent helpers in:

```text
lib/app-mode-routing.ts
```

The task 154 helpers are passive only. They do not add middleware or activate host-based redirects.

## App Modes

Supported app modes:

- `marketing`
- `central_app`
- `tenant_app`
- `platform_admin`
- `support`
- `local_dev`
- `unknown`

## Host Parsing Rules

| Host | Mode | Tenant slug |
| --- | --- | --- |
| `everybatchmrp.com` | `marketing` | none |
| `www.everybatchmrp.com` | `marketing` | none |
| `everybatchmrp.com.au` | `marketing` | none |
| `everybatch.com.au` | `marketing` | none |
| `app.everybatchmrp.com` | `central_app` | none |
| `admin.everybatchmrp.com.au` | `platform_admin` | none |
| `platform.everybatchmrp.com` | `platform_admin` | none, legacy/optional compatibility |
| `support.everybatchmrp.com` | `support` | none |
| `cleaneats.everybatchmrp.com` | `tenant_app` | `cleaneats` |
| `{tenant_slug}.everybatchmrp.com` | `tenant_app` | `{tenant_slug}` |
| `localhost` / `127.0.0.1` / private local IP | `local_dev` | `cleaneats` fallback |
| `*.vercel.app` | `local_dev` | `cleaneats` fallback |
| unknown host | `unknown` | none |

The parser does not throw for unknown hosts.

## Local Development Fallback

Local development hosts resolve as:

```text
mode: local_dev
tenantSlug: cleaneats
```

This is a parsing hint only. The current app still uses existing authenticated organisation context and does not switch tenant by host.

## Tenant Lookup Helper

`resolveTenantFromSlug(slug)` uses the authenticated Supabase server client and looks up:

```text
public.organisations.slug
```

It returns only:

- `id`
- `slug`
- `name`
- `status`

It does not use service-role keys and does not bypass RLS.

Because current `organisations` RLS is membership-aware, anonymous/public tenant lookup may return `null`. That is acceptable in this foundation task. A future tenant-routing implementation may need a separately reviewed safe resolver pattern if public tenant login pages need to resolve tenant identity before authentication.

## Why Routing Is Not Activated Yet

This task intentionally does not:

- add middleware
- rewrite requests
- redirect by host
- change `/login`
- change `getCurrentOrganisation()`
- change `AppShell`
- change Platform Admin routing
- change support or marketing routing

Host-derived tenant context needs a reviewed security path before it controls app access.

## Security Notes

Important rules:

- never trust client-provided `organisation_id`
- host-derived tenant slug must be verified server-side against `organisations.slug`
- host parsing is not an access check
- tenant membership, permissions and RLS still control data access
- platform-admin support access must be explicit, scoped and auditable later
- custom domains need a future `tenant_domains` model and ownership verification

## Future Tasks

Future tasks can use this foundation for:

- central login / tenant selector
- tenant app host routing
- `cleaneats.everybatchmrp.com` tenant workspace routing
- `admin.everybatchmrp.com.au` Platform Admin shell routing
- optional/legacy `platform.everybatchmrp.com` Platform Admin shell routing if retained
- support/marketing host separation
- custom domain mapping
- `tenant_domains` schema

## Verification Table

No test framework was added.

Manual/pure helper examples to inspect later:

| Input | Expected mode |
| --- | --- |
| `app.everybatchmrp.com` | `central_app` |
| `cleaneats.everybatchmrp.com` | `tenant_app` |
| `admin.everybatchmrp.com.au` | `platform_admin` |
| `support.everybatchmrp.com` | `support` |
| `everybatchmrp.com` | `marketing` |
| `localhost:3000` | `local_dev` |
| `example.com` | `unknown` |

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
