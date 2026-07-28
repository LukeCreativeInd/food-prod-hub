# app.everybatchmrp.com Domain Connection Notes

## Purpose

Task 123 documents the manual connection process for:

```text
app.everybatchmrp.com
```

This is the first stable EveryBatch app/login URL.

Temporary behaviour can still route authenticated users into the Clean Eats workspace after login until central tenant selector and tenant subdomain routing are implemented.

This note is documentation only. It does not change app code, Vercel config files, DNS records, Supabase settings, routes, middleware, auth, database schema, RLS, permissions or environment variables.

## Live Status

`app.everybatchmrp.com` is live and validated in Vercel.

Current status:

- Cloudflare DNS is active.
- `app.everybatchmrp.com` has been added to the Vercel project.
- Cloudflare DNS record has been created:
  - Type: `CNAME`
  - Name: `app`
  - Value: `b560eb64065fe2f1.vercel-dns-017.com`
  - Proxy status: DNS only
- Vercel shows the domain as validated/live.
- Cloudflare proxy remains DNS only.
- The Vercel production URL currently redirects to `app.everybatchmrp.com`, but remains available in Vercel if needed.
- Login and dashboard smoke tests passed.

## Why Cloudflare Proxy Is DNS Only

Cloudflare proxy is set to DNS only for `app.everybatchmrp.com` so Vercel can validate the CNAME target directly.

Cloudflare proxying can be reconsidered later only if the Vercel/Cloudflare setup is intentionally reviewed.

## Validation Completed

Completed validation:

- Vercel domain validation is complete.
- SSL is active through the validated Vercel domain.
- `https://app.everybatchmrp.com/login` loads the EveryBatch login page.
- login smoke test passed.
- dashboard smoke test passed.

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

Completed smoke tests:

- `https://app.everybatchmrp.com/login` loads.
- EveryBatch login loads.
- valid login works.
- dashboard loads after login.

Further app smoke tests can still be repeated after future deployments:

- logout works.
- app shell loads.
- sidebar loads.
- global search works.
- Help & Support menu works.
- Organisation Settings works.
- Supplier Invoice Intake still works.
- old Vercel URL remains available in Vercel if needed.
- localhost still works.

## Rollback

If `app.everybatchmrp.com` fails:

- keep using the old Vercel URL
- keep the old Vercel URL active
- remove or disable the Cloudflare `app` CNAME only if required
- do not touch the root domain
- revert Supabase redirect URL changes if they cause login issues

## Domain Decisions Preserved

- `app.everybatchmrp.com` is the first domain being connected to the existing app deployment.
- `app.everybatchmrp.com` is now live as the first stable EveryBatch app/login URL.
- `everybatchmrp.com` root remains reserved for marketing/coming-soon and should not point to the tenant app yet.
- `cleaneats.everybatchmrp.com` remains future until tenant workspace host routing is implemented.
- `admin.everybatchmrp.com.au` is the preferred future Platform Admin host and remains held until Platform Admin domain routing is implemented.
- `platform.everybatchmrp.com` remains earlier optional Platform Admin planning language only.
- `support.everybatchmrp.com` is held until support/knowledge base setup exists.

## Task 154 Routing Foundation Note

Task 154 adds passive domain/app-mode resolver and route-intent helpers. It does not change the live `app.everybatchmrp.com` setup, DNS, Vercel domains, Supabase Auth redirect URLs or production redirect behaviour.

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
