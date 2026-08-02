# EveryBatch Domain Setup and Environment Plan

> **Historical setup plan.** Domain implementation progressed after this document was written. Current domain truth is maintained in `README.md`, `docs/CODEX_PROJECT_CONTEXT.md` and [Tasks 223-276 Revised Roadmap](./223-276-revised-roadmap.md). The future task numbering in this file is not active.

## Purpose

Task 122 documents the recommended EveryBatch domain setup and environment plan before any Vercel, DNS, Supabase Auth, environment variable, routing or middleware changes are made.

This is a planning document only.

No app code, routes, middleware, auth flow, database schema, migrations, RLS policies, permissions, navigation, branding UI, Vercel domains, DNS records, Supabase settings, environment variables or packages are changed by this task.

## Purchased Domains

Purchased:

- `everybatchmrp.com`
- `everybatchmrp.com.au`
- `everybatch.com.au`

Deferred/not purchased:

- `everybatch.io`
- `everybatchmrp.app`

Do not plan around `everybatch.com`; it is not available.

## Target Domain Map

| Domain | Target role | Status now |
| --- | --- | --- |
| `everybatchmrp.com` | Public marketing website / coming-soon page | Hold. Do not point to tenant app yet. |
| `everybatchmrp.com.au` | AU market protection / redirect | Hold or redirect later. |
| `everybatch.com.au` | AU brand protection / redirect | Hold or redirect later. |
| `app.everybatchmrp.com` | Central EveryBatch app login / future tenant selector | Live and validated in Vercel. |
| `cleaneats.everybatchmrp.com` | Clean Eats tenant workspace | Hold until tenant workspace host routing is implemented. |
| `admin.everybatchmrp.com` | Preferred Platform Admin control centre | Hold until Platform Admin domain routing is implemented. |
| `platform.everybatchmrp.com` | Legacy/optional Platform Admin host | Hold; recognised in code as platform_admin compatibility only. |
| `support.everybatchmrp.com` | Support / knowledge base / tickets | Hold until support destination is selected. |

## Current Temporary State

Connected first:

```text
app.everybatchmrp.com -> existing Vercel app deployment
```

This gives EveryBatch a stable branded login/app URL while the current app still routes authenticated users into the Clean Eats Tenant 1 workspace.

This is temporary. Later, `app.everybatchmrp.com` should become the true central login and tenant selector.

## Task 123 Connection Status

Manual connection work is complete for `app.everybatchmrp.com`.

Current status:

- `app.everybatchmrp.com` is live and validated in Vercel.
- Cloudflare DNS is active.
- `app.everybatchmrp.com` has been added to the Vercel project.
- Cloudflare DNS has a CNAME record:
  - Type: `CNAME`
  - Name: `app`
  - Value: `b560eb64065fe2f1.vercel-dns-017.com`
  - Proxy status: DNS only
- Cloudflare proxy remains DNS only.
- The Vercel production URL currently redirects to `app.everybatchmrp.com`, but remains available in Vercel if needed.
- Login and dashboard smoke tests passed.

See [app.everybatchmrp.com domain connection notes](123-app-domain-connection-notes.md).

## Tenant Resolver Foundation

Task 124 adds `lib/tenant-resolver.ts` for safe host parsing and future tenant slug lookup.

This helper recognises `app.everybatchmrp.com`, tenant subdomains, Platform Admin, support, marketing/root domains and local development hosts, but it is not wired into routing yet.

No middleware, redirects, Supabase Auth settings or environment variables are changed by task 124.

## Domains To Hold For Now

Do not connect these to the current tenant app yet:

- `everybatchmrp.com`
- `everybatchmrp.com.au`
- `everybatch.com.au`
- `cleaneats.everybatchmrp.com`
- `admin.everybatchmrp.com`
- `platform.everybatchmrp.com`
- `support.everybatchmrp.com`

Reasoning:

- root `everybatchmrp.com` should be reserved for marketing or a coming-soon page
- tenant subdomains need tenant workspace host routing before they are connected
- Platform Admin needs a separate platform-owner shell first
- support needs a support/knowledge-base destination first
- AU domains should redirect only after root/public-site behaviour is agreed

## Vercel Setup Checklist For `app.everybatchmrp.com`

Completed/manual setup record:

- `app.everybatchmrp.com` has been added to the Vercel project.
- Cloudflare DNS has the Vercel-provided CNAME target.
- Vercel validation is complete.
- The domain points at the production deployment.
- The Vercel production URL currently redirects to `app.everybatchmrp.com`, but remains available in Vercel if needed.
- No wildcard `*.everybatchmrp.com` has been added.

Follow Vercel's generated instructions as the source of truth for any future domain changes.

## Later Vercel Setup

Later, separate tasks can configure:

- `everybatchmrp.com` for a marketing or coming-soon site
- `admin.everybatchmrp.com` after Platform Admin domain routing is reviewed
- `platform.everybatchmrp.com` only if the legacy/optional Platform Admin host is still wanted
- wildcard tenant subdomains after tenant resolver implementation
- `support.everybatchmrp.com` after support destination selection
- AU redirects after the root domain behaviour is agreed

## DNS Checklist

For `app.everybatchmrp.com`, likely DNS shape:

- `CNAME app -> cname.vercel-dns.com` or the exact Vercel-provided target
- TXT verification record if Vercel requests one

Current Vercel-provided CNAME target for task 123:

```text
b560eb64065fe2f1.vercel-dns-017.com
```

Cloudflare proxy is set to DNS only so Vercel can validate the CNAME directly.

Do not treat these as final provider-specific instructions. Vercel and the DNS provider must be checked at setup time.

For `everybatchmrp.com` root:

- do not point it to the app yet
- later it may use Vercel A records, CNAME flattening, or provider-specific root-domain setup
- reserve it for marketing or a coming-soon page

For `.com.au` domains:

- hold parked for now, or redirect later
- if registrar-level redirects are available, use them only after the root-domain target is confirmed

## Supabase Auth Redirect URL Considerations

After `app.everybatchmrp.com` is connected, Supabase Auth settings may need to be reviewed.

Potential additions:

- `https://app.everybatchmrp.com/login`
- `https://app.everybatchmrp.com/dashboard`
- any required post-login/callback URLs used by the current auth flow

Keep existing URLs during transition:

- current Vercel production URL
- Vercel preview URL pattern if used for testing
- `http://localhost:3000`

Later additions:

- `https://cleaneats.everybatchmrp.com/login`
- `https://admin.everybatchmrp.com`
- `https://platform.everybatchmrp.com` only if the legacy/optional Platform Admin host is retained
- support/admin callback URLs only if those surfaces later use auth

Do not change Supabase settings as part of this documentation task.

## Environment And App Config Considerations

Potential future configuration:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PLATFORM_DOMAIN`
- `NEXT_PUBLIC_MARKETING_DOMAIN`
- `NEXT_PUBLIC_SUPPORT_URL`
- tenant domain allowlist if needed
- auth callback URL configuration
- central login URL
- platform admin URL

Current app code can keep using existing environment values until the domain implementation task is approved.

Do not add or change env vars in this task.

## Local Development Notes

Local development can remain:

```text
http://localhost:3000
```

Do not require local subdomains until tenant host routing is intentionally implemented.

If future host-based development is needed, document local hostname setup separately before changing middleware or tenant resolver behaviour.

## Smoke Test Checklist After Connecting `app.everybatchmrp.com`

Completed:

- `https://app.everybatchmrp.com/login` loads.
- EveryBatch login branding appears.
- login smoke test passed.
- dashboard smoke test passed.

Repeat after future deployments as needed:

1. Confirm app shell/sidebar loads.
2. Confirm global search opens and returns expected results.
3. Confirm Help & Support menu opens.
4. Confirm user menu/sign out works.
5. Confirm Supplier Invoice Intake loads.
6. Confirm Organisation Settings logo/theme controls load.
7. Confirm logout redirects to `/login`.
8. Confirm old Vercel URL remains available in Vercel if needed.
9. Confirm localhost still works.
10. Confirm there are no SSL or mixed-content warnings.
11. Confirm Supabase Auth does not reject redirect URLs.
12. Confirm demo user restrictions remain intact if tested.

## Rollback Plan

If `app.everybatchmrp.com` causes issues:

1. Keep using the old Vercel URL.
2. Remove `app.everybatchmrp.com` from the Vercel project or revert the DNS CNAME.
3. Do not delete old Vercel URLs or old Supabase redirect URLs during troubleshooting.
4. If Supabase redirects fail, re-add/restore old redirect URLs.
5. Confirm login still works on the previous Vercel URL.
6. Re-test `app.everybatchmrp.com` only after DNS, SSL and Supabase settings are corrected.

## Future Task Roadmap

Proposed future tasks:

- 123 Connect `app.everybatchmrp.com` to Vercel
- 124 Tenant Resolver Foundation
- 125 Central Login and Tenant Selector
- 126 Tenant Workspace Host Routing
- 127 Platform Admin Domain/Shell Separation
- 128 Marketing Site Placeholder / Coming Soon
- 129 Support Domain Linkout Setup
- 130 AU Domain Redirect Setup

Do not renumber completed tasks if roadmap numbering changes later. Keep each step scoped and reviewed.

## Non-Goals

This task does not:

- configure Vercel domains
- change DNS records
- change Supabase Auth settings
- add middleware
- add host-based tenant routing
- split Platform Admin
- build tenant selector
- build marketing site
- build support site
- change environment variables
- change app code
- create migrations

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
