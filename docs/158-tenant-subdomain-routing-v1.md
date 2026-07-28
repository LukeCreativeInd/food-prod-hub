# Tenant Subdomain Routing v1

Task 158 activates the first tenant-subdomain routing path for Clean Eats:

```text
cleaneats.everybatchmrp.com
```

This is a code-only routing/app-mode task. It does not add DNS records, change Vercel domains, change Supabase Auth redirect URLs, create tenant domain tables, create migrations, change RLS, change permissions or alter tenant business logic.

## Behaviour

`cleaneats.everybatchmrp.com` resolves as:

- mode: `tenant_app`
- tenant slug: `cleaneats`

The mapping is static for v1. Dynamic tenant-domain lookup and arbitrary tenant subdomains remain future work.

Task 159 adds a small hardening rule for inactive tenant-looking subdomains. Only `cleaneats.everybatchmrp.com` is active in v1; other `{tenant_slug}.everybatchmrp.com` hosts allow public auth/static routes only and redirect app routes to `/login` until a future tenant-domain system activates them.

## Tenant Host Redirects

On the Clean Eats tenant host:

- `/` redirects to `/dashboard`
- `/select-workspace` redirects to `/dashboard`
- `/platform` redirects to `/dashboard`
- `/platform/*` redirects to `/dashboard`
- unknown non-tenant routes redirect to `/dashboard`
- existing auth guards continue to decide whether signed-out users end up on `/login`

Middleware does not read Supabase session and does not query the database.

## Allowed Tenant Routes

The tenant host allows current tenant workspace routes including:

- `/login`
- `/select-workspace`
- `/no-access`
- `/dashboard`
- `/suppliers`
- `/ingredients`
- `/packaging`
- `/components`
- `/recipes`
- `/finished-products`
- `/costings`
- `/ingredient-costs`
- `/packaging-costs`
- `/component-costs`
- `/meal-margins`
- `/price-history`
- `/production-report`
- `/production-plan`
- `/production-areas`
- `/production-tasks`
- `/facility-tasks`
- `/inventory`
- `/goods-inwards`
- `/batch-receiving`
- `/stock-locations`
- `/stock-movements`
- `/purchasing`
- `/bom-traceability`
- `/purchase-documents`
- `/organisation-settings`
- `/users`
- `/modules`
- `/integrations`
- nested redirect/helper routes under tenant route prefixes
- Next internals and static assets

## Other Hosts

`app.everybatchmrp.com` remains the central app domain and keeps current login/workspace selector behaviour.

`admin.everybatchmrp.com.au` remains the Platform Admin host. The existing Platform Admin guard is preserved:

- `/platform` is allowed
- tenant app routes redirect to `/platform`

Localhost, private local IPs and Vercel preview hosts remain permissive for development and review.

## Manual Supabase Auth URL Checklist

Before using the live Clean Eats tenant host, review Supabase Auth URL settings and add/confirm:

- `https://cleaneats.everybatchmrp.com`
- `https://cleaneats.everybatchmrp.com/login`
- `https://cleaneats.everybatchmrp.com/dashboard`
- `https://cleaneats.everybatchmrp.com/select-workspace`

Keep existing app, admin, Vercel and localhost URLs as needed during the transition.

## Manual DNS / Vercel Checklist

This code task does not configure DNS or Vercel.

Before live validation:

- add/validate `cleaneats.everybatchmrp.com` in Vercel
- add the Cloudflare DNS record requested by Vercel
- keep Cloudflare proxy DNS-only unless separately reviewed
- wait for Vercel SSL/domain validation

## Smoke Tests

Host simulation:

- `cleaneats.everybatchmrp.com/` -> redirects to `/dashboard`
- `cleaneats.everybatchmrp.com/login` -> allowed
- `cleaneats.everybatchmrp.com/select-workspace` -> redirects to `/dashboard`
- `cleaneats.everybatchmrp.com/dashboard` -> allowed
- `cleaneats.everybatchmrp.com/components` -> allowed
- `cleaneats.everybatchmrp.com/finished-products` -> allowed
- `cleaneats.everybatchmrp.com/platform` -> redirects to `/dashboard`
- `cleaneats.everybatchmrp.com/platform/tenants` -> redirects to `/dashboard`
- `admin.everybatchmrp.com.au/dashboard` -> redirects to `/platform`
- `admin.everybatchmrp.com.au/platform` -> allowed
- `localhost/dashboard` -> allowed
- `localhost/platform` -> allowed

Live after DNS validates:

- `https://cleaneats.everybatchmrp.com`
- `https://cleaneats.everybatchmrp.com/login`
- `https://cleaneats.everybatchmrp.com/dashboard`
- `https://cleaneats.everybatchmrp.com/components`
- `https://cleaneats.everybatchmrp.com/platform`

## Future Work

- dynamic tenant domain table/lookup
- arbitrary tenant subdomain support through reviewed tenant-domain records
- tenant slug to organisation lookup from host-derived tenant slug
- tenant-host-specific workspace selector refinement
- stricter central app redirects after tenant/admin domains are fully validated

## Migration Notes

No SQL migration was created or changed.
