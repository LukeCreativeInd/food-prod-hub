# app.everybatchmrp.com Domain Connection Notes

## Purpose

Task 123 documents the manual connection process for:

```text
app.everybatchmrp.com
```

This is the first stable EveryBatch app/login URL.

Temporary behaviour can still route authenticated users into the Clean Eats workspace after login until central tenant selector and tenant subdomain routing are implemented.

This note is documentation only. It does not change app code, Vercel config files, DNS records, Supabase settings, routes, middleware, auth, database schema, RLS, permissions or environment variables.

## Manual Setup Performed

Current manual setup in progress:

- `everybatchmrp.com` has been added to Cloudflare.
- Nameservers have been changed to Cloudflare and are propagating.
- `app.everybatchmrp.com` has been added to the Vercel project.
- Cloudflare DNS record has been created:
  - Type: `CNAME`
  - Name: `app`
  - Value: `b560eb64065fe2f1.vercel-dns-017.com`
  - Proxy status: DNS only
- Vercel validation is pending while nameserver/DNS propagation completes.

## Why Cloudflare Proxy Is DNS Only

Cloudflare proxy is set to DNS only for `app.everybatchmrp.com` so Vercel can validate the CNAME target directly.

Cloudflare proxying can be reconsidered later only if the Vercel/Cloudflare setup is intentionally reviewed.

## Pending Validation

Before treating the domain as ready:

- Vercel must show Valid Configuration.
- SSL certificate must be issued.
- `https://app.everybatchmrp.com/login` must load the EveryBatch login page.

## Supabase Auth Redirect Checklist

If login or redirect fails after the domain validates, manually check Supabase Auth allowed URLs.

Potential URLs to add/check:

- `https://app.everybatchmrp.com`
- `https://app.everybatchmrp.com/login`
- `https://app.everybatchmrp.com/dashboard`

Keep existing URLs during transition:

- `http://localhost:3000`
- current Vercel production URL
- any preview URLs currently needed

Do not change Supabase Auth settings unless required during smoke testing.

## Smoke Test Checklist

Once Vercel validates:

1. Visit `https://app.everybatchmrp.com`.
2. Visit `https://app.everybatchmrp.com/login`.
3. Confirm EveryBatch login loads.
4. Confirm valid login works.
5. Confirm redirect to dashboard works.
6. Confirm logout works.
7. Confirm app shell loads.
8. Confirm sidebar loads.
9. Confirm global search works.
10. Confirm Help & Support menu works.
11. Confirm Organisation Settings works.
12. Confirm Supplier Invoice Intake still works.
13. Confirm old Vercel URL still works during transition.
14. Confirm localhost still works.

## Rollback

If `app.everybatchmrp.com` fails:

- keep using the old Vercel URL
- keep the old Vercel URL active
- remove or disable the Cloudflare `app` CNAME only if required
- do not touch the root domain
- revert Supabase redirect URL changes if they cause login issues

## Domain Decisions Preserved

- `app.everybatchmrp.com` is the first domain being connected to the existing app deployment.
- `everybatchmrp.com` root remains reserved for marketing/coming-soon and should not point to the tenant app yet.
- `cleaneats.everybatchmrp.com` is held until tenant resolver exists.
- `platform.everybatchmrp.com` is held until Platform Admin shell separation exists.
- `support.everybatchmrp.com` is held until support/knowledge base setup exists.

## Follow-Ups

Proposed follow-ups:

- 124 Tenant Resolver Foundation
- 125 Central Login and Tenant Selector
- 126 Tenant Workspace Host Routing
- 127 Platform Admin Domain/Shell Separation
- 128 Marketing Site Placeholder / Coming Soon
- 129 Support Domain Linkout Setup
- 130 AU Domain Redirect Setup

## Migration Notes

No SQL migration was created.

No manual Supabase setup was performed by this task.
