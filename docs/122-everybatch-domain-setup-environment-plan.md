# EveryBatch Domain Setup and Environment Plan

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
| `app.everybatchmrp.com` | Central EveryBatch app login / future tenant selector | First domain to connect to the existing app deployment. |
| `cleaneats.everybatchmrp.com` | Clean Eats tenant workspace | Hold until tenant resolver exists. |
| `platform.everybatchmrp.com` | Platform Admin control centre | Hold until Platform Admin shell separation exists. |
| `support.everybatchmrp.com` | Support / knowledge base / tickets | Hold until support destination is selected. |

## Current Temporary Recommendation

Connect first:

```text
app.everybatchmrp.com -> existing Vercel app deployment
```

This gives EveryBatch a stable branded login/app URL while the current app still routes authenticated users into the Clean Eats Tenant 1 workspace.

This is temporary. Later, `app.everybatchmrp.com` should become the true central login and tenant selector.

## Task 123 Connection Status

Manual connection work is now in progress for `app.everybatchmrp.com`.

Current status:

- `everybatchmrp.com` has been added to Cloudflare.
- Nameservers have been changed to Cloudflare and are propagating.
- `app.everybatchmrp.com` has been added to the Vercel project.
- Cloudflare DNS has a CNAME record:
  - Type: `CNAME`
  - Name: `app`
  - Value: `b560eb64065fe2f1.vercel-dns-017.com`
  - Proxy status: DNS only
- Waiting for DNS propagation and Vercel validation.

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
- `platform.everybatchmrp.com`
- `support.everybatchmrp.com`

Reasoning:

- root `everybatchmrp.com` should be reserved for marketing or a coming-soon page
- tenant subdomains need a host-derived tenant resolver first
- Platform Admin needs a separate platform-owner shell first
- support needs a support/knowledge-base destination first
- AU domains should redirect only after root/public-site behaviour is agreed

## Vercel Setup Checklist For `app.everybatchmrp.com`

When explicitly approved as a future task:

1. Open the Vercel project for the current app.
2. Go to Settings -> Domains.
3. Add `app.everybatchmrp.com`.
4. Follow Vercel's exact DNS/verification instructions.
5. Add the required DNS records at the current DNS provider.
6. Wait for domain verification and SSL certificate provisioning.
7. Confirm the domain points at the production deployment, not a preview deployment.
8. Keep the old Vercel deployment URL active during transition.
9. Do not add wildcard `*.everybatchmrp.com` yet unless tenant routing is being deliberately implemented.

Follow Vercel's generated instructions as the source of truth for exact DNS values.

## Later Vercel Setup

Later, separate tasks can configure:

- `everybatchmrp.com` for a marketing or coming-soon site
- `platform.everybatchmrp.com` after Platform Admin shell separation
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
- `https://platform.everybatchmrp.com`
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

After a future domain connection:

1. Visit `https://app.everybatchmrp.com`.
2. Confirm the login page loads.
3. Confirm EveryBatch login branding appears.
4. Sign in with the platform admin account.
5. Confirm redirect/dashboard works.
6. Confirm app shell/sidebar loads.
7. Confirm global search opens and returns expected results.
8. Confirm Help & Support menu opens.
9. Confirm user menu/sign out works.
10. Confirm Supplier Invoice Intake loads.
11. Confirm Organisation Settings logo/theme controls load.
12. Confirm logout redirects to `/login`.
13. Confirm old Vercel URL still works during transition.
14. Confirm localhost still works.
15. Confirm there are no SSL or mixed-content warnings.
16. Confirm Supabase Auth does not reject redirect URLs.
17. Confirm demo user restrictions remain intact if tested.

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
