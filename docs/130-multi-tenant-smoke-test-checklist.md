# Multi-Tenant Smoke Test Checklist

## Purpose

Task 130 creates a repeatable smoke test checklist for EveryBatch multi-tenant foundations.

Use this checklist before and after:

- domain changes
- login changes
- tenant selector changes
- Platform Admin changes
- permission/RLS changes
- feature flag changes
- module gating changes
- Vercel deployments
- migration application
- future tenant onboarding

This checklist is documentation only. It does not change app code, routes, middleware, auth, database schema, migrations, RLS, permissions, navigation, branding UI, environment variables, Vercel config, Supabase config or packages.

## 1. Environment / Domain Checks

- [ ] Local dev loads at `http://localhost:3000`.
- [ ] Live app loads at `https://app.everybatchmrp.com`.
- [ ] Old Vercel production URL redirects to `app.everybatchmrp.com`.
- [ ] No SSL warnings appear.
- [ ] No mixed content warnings appear.
- [ ] `everybatchmrp.com` root is not incorrectly pointing to the tenant app.
- [ ] `cleaneats.everybatchmrp.com` is active only after task 158 code, Vercel, DNS and Supabase Auth URL checks are complete.
- [ ] `admin.everybatchmrp.com` is not active unless Platform Admin domain routing is complete.
- [ ] `platform.everybatchmrp.com` is not active unless deliberately retained as a legacy/optional Platform Admin host.
- [ ] `support.everybatchmrp.com` is not treated as a live Help Centre until support domain setup and scaffold tasks are complete.

Clean Eats tenant host checks:

- [ ] `cleaneats.everybatchmrp.com/` redirects to `/dashboard`.
- [ ] `cleaneats.everybatchmrp.com/login` loads.
- [ ] `cleaneats.everybatchmrp.com/select-workspace` redirects to `/dashboard`.
- [ ] `cleaneats.everybatchmrp.com/dashboard` is allowed.
- [ ] `cleaneats.everybatchmrp.com/components` is allowed.
- [ ] `cleaneats.everybatchmrp.com/finished-products` is allowed.
- [ ] `cleaneats.everybatchmrp.com/platform` redirects away from Platform Admin.
- [ ] `cleaneats.everybatchmrp.com/platform/tenants` redirects away from Platform Admin.
- [ ] inactive tenant-looking subdomains, if they ever resolve, redirect app routes to `/login` until explicitly activated.

Central and Platform Admin host checks:

- [ ] `app.everybatchmrp.com/platform` redirects to `https://admin.everybatchmrp.com/platform`.
- [ ] `app.everybatchmrp.com/platform/tenants` redirects to `https://admin.everybatchmrp.com/platform/tenants`.
- [ ] `app.everybatchmrp.com/dashboard` redirects to `/select-workspace?next=%2Fdashboard`.
- [ ] `app.everybatchmrp.com/components` redirects to `/select-workspace?next=%2Fcomponents`.
- [ ] `admin.everybatchmrp.com/platform` is allowed.
- [ ] `admin.everybatchmrp.com/dashboard` redirects to `/platform`.
- [ ] localhost remains permissive for `/platform` during development.

See [Multi-domain smoke test and redirect hardening](159-multi-domain-smoke-test-and-redirect-hardening.md) for the current domain redirect matrix.

See [Live multi-domain smoke test results](160-live-multi-domain-smoke-test-results.md) for the latest recorded deployed results and manual follow-ups.

See [Live domain redirect QA pass](162-live-domain-redirect-qa-pass.md) for post-task-161 live redirect results.

See [Workspace selector live domain QA / polish](163-workspace-selector-live-domain-qa-polish.md) for signed-in selector destination checks.

Support host checks:

- [ ] `support.everybatchmrp.com` resolves over HTTPS after task 173 domain setup.
- [ ] Before task 174, app fallback/redirect/404 behaviour is recorded as expected interim state.
- [ ] After task 174, signed-out `/`, `/guides` and `/tickets` require auth.
- [ ] After task 174, signed-in `/` shows the Support Help Centre scaffold.
- [ ] After task 174, `/platform` does not expose Platform Admin from the support host.
- [ ] After task 174, `/dashboard` does not expose the tenant app from the support host.

See [Support Domain Setup](173-support-domain-setup.md) for the support-domain Vercel, Cloudflare, Supabase Auth and smoke-test checklist.

## 2. DNS / Vercel Checks

- [ ] Vercel shows `app.everybatchmrp.com` as Valid Configuration.
- [ ] Vercel SSL is issued.
- [ ] Cloudflare DNS has:
  - [ ] `CNAME app -> b560eb64065fe2f1.vercel-dns-017.com`
  - [ ] Proxy status: DNS only
- [ ] Cloudflare proxy remains off/DNS-only for the `app` CNAME unless intentionally reviewed.

Optional resolver checks:

```bash
dig app.everybatchmrp.com
dig app.everybatchmrp.com @8.8.8.8
dig app.everybatchmrp.com @1.1.1.1
```

## 3. Supabase Auth Checks

- [ ] `app.everybatchmrp.com` is allowed in Supabase Auth redirect settings if required.
- [ ] `localhost` remains allowed for local development.
- [ ] Old Vercel URL remains allowed during transition.
- [ ] Login does not fail due redirect URL mismatch.
- [ ] Logout works.

## 4. Login And Workspace Selector Checks

### Platform/Admin User

- [ ] Visit `/login` signed out.
- [ ] Invalid login shows an error.
- [ ] Valid login redirects to `/select-workspace`.
- [ ] Clean Eats workspace card appears.
- [ ] Platform Admin Console card appears.
- [ ] `Open workspace` routes to `/dashboard`.
- [ ] `Open Platform Admin` routes to `/platform`.
- [ ] User menu -> `Switch workspace` returns to `/select-workspace`.
- [ ] Sign out works.

### Demo / Single-Workspace User

- [ ] Valid login redirects to `/dashboard`.
- [ ] No Platform Admin option appears.
- [ ] Demo can access allowed modules only.
- [ ] User menu `Switch workspace` is safe if visible.
- [ ] Sign out works.

## 5. App Shell / Navigation Checks

- [ ] Sidebar appears after login.
- [ ] Tenant logo appears.
- [ ] Tenant theme colours apply.
- [ ] Sidebar collapse works.
- [ ] Menu order remains:
  - [ ] Dashboard
  - [ ] Inventory
  - [ ] Products
  - [ ] Costings
  - [ ] Production
  - [ ] QA
  - [ ] Logistics
  - [ ] CRM
  - [ ] Reports
  - [ ] Tools
  - [ ] Admin
  - [ ] Platform
- [ ] Hidden modules remain hidden by permission/module rules.
- [ ] Platform is visible only to `platform_admin`.
- [ ] Tools / Supplier Invoice Intake is visible only to authorised users.

## 6. Header Checks

- [ ] Page title appears in the top header.
- [ ] Global search works.
- [ ] Help / Support menu opens.
- [ ] Notification placeholder remains harmless.
- [ ] User dropdown works.
- [ ] `Switch workspace` link works.
- [ ] Sign out works.

## 7. Global Search Checks

### Platform/Admin User

Search:

- [ ] `chicken`
- [ ] `gnocchi`
- [ ] `cammaroto`
- [ ] `il nonno`
- [ ] `stock`
- [ ] `price`
- [ ] `platform`

Expected:

- [ ] products/internal items appear.
- [ ] suppliers appear.
- [ ] Supplier Invoice Intake documents appear only if authorised.
- [ ] stock locations/pages appear.
- [ ] Platform appears only for `platform_admin`.

### Demo User

- [ ] No Platform/Admin results.
- [ ] No Supplier Invoice Intake documents.
- [ ] Allowed product/costing/inventory results still appear.

## 8. Tenant Branding / Theme Checks

- [ ] Organisation Settings loads.
- [ ] Logo upload works.
- [ ] Logo displays in sidebar.
- [ ] Remove logo returns to placeholder.
- [ ] Primary, accent and status colours save.
- [ ] Light/dark mode saves.
- [ ] App remains readable in light mode.
- [ ] App remains readable in dark mode.
- [ ] Demo cannot edit branding.

## 9. Feature Flag Checks

SQL/admin checks:

- [ ] `feature_flags` table exists.
- [ ] `organisation_feature_flags` table exists.
- [ ] Clean Eats overrides exist and are enabled.
- [ ] Demo has no management permissions.
- [ ] No current feature is accidentally disabled because flags are not gating app behaviour yet.

## 10. Module / Page Checks

### Admin / Platform User

- [ ] `/dashboard`
- [ ] `/products`
- [ ] `/suppliers`
- [ ] `/ingredients`
- [ ] `/packaging`
- [ ] `/costing-overview`
- [ ] `/inventory`
- [ ] `/stock-locations`
- [ ] `/production`
- [ ] `/purchase-documents`
- [ ] `/organisation-settings`
- [ ] `/platform`

### Demo / Single-Workspace User

- [ ] Dashboard works.
- [ ] Products allowed/read-only where intended.
- [ ] Costings allowed/read-only where intended.
- [ ] Inventory allowed/read-only where intended.
- [ ] Production allowed/read-only where intended.
- [ ] Admin hidden/blocked.
- [ ] Platform hidden/blocked.
- [ ] Supplier Invoice Intake hidden/blocked if no permission.

## 11. Supplier Invoice Intake Checks

- [ ] `/purchase-documents` loads for authorised user.
- [ ] Upload still works.
- [ ] Existing documents list loads.
- [ ] Review page loads.
- [ ] PDF/source preview works when requested.
- [ ] Extraction flow is not broken.
- [ ] Commit flow is not broken.
- [ ] Demo cannot access.

## 12. CRUD Foundation Checks

- [ ] Supplier list shows real suppliers.
- [ ] Create/edit supplier works for authorised user.
- [ ] Demo supplier access is read-only/no create/edit.
- [ ] Ingredients/internal items list works.
- [ ] Create/edit internal item works for authorised user.
- [ ] Packaging empty/real state works.
- [ ] Stock locations show seeded locations.
- [ ] Create/edit stock location works for authorised user.
- [ ] Demo stock/internal item access is read-only/no create/edit.

## 13. Platform Admin Checks

- [ ] `/platform` is accessible to `platform_admin`.
- [ ] `/platform` is not accessible to demo.
- [ ] Tenant detail page works.
- [ ] Platform copy is EveryBatch operator-console aligned.
- [ ] Platform remains transitional inside the current app until separation task.

## 14. RLS / Permission Sanity

- [ ] Signed-out protected route redirects/blocks.
- [ ] Demo cannot access Admin.
- [ ] Demo cannot access Platform.
- [ ] Demo cannot access Purchase Documents.
- [ ] Direct hidden URLs go to `/no-access` or the appropriate access issue route.
- [ ] `platform_admin` can access platform areas.
- [ ] No cross-tenant data is visible.
- [ ] No service-role keys are exposed.

## 15. Performance Sanity

- [ ] No `AuthApiError 429` spam.
- [ ] App-shell navigation context is not repeatedly spiking badly.
- [ ] Major pages load acceptably after warmup.
- [ ] Route loading keeps shell visible.
- [ ] Workspace loader appears in content area only.
- [ ] Vercel Speed Insights is reviewed after live traffic.

## 16. Migration Application Checklist

- [ ] Review full SQL from Codex response before applying.
- [ ] Apply migration in Supabase SQL Editor.
- [ ] Run post-migration SQL checks.
- [ ] Verify no `storage.objects` owner issue if storage policies are involved.
- [ ] If storage policies need manual UI setup, create them manually in Supabase UI.
- [ ] Run smoke tests after migration.
- [ ] Commit only after migration/test pass where applicable.

## 17. Release Checklist

- [ ] Local build passes.
- [ ] If `pnpm` stalls, fallback checks pass:

```bash
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
```

- [ ] Vercel deployment succeeds.
- [ ] `app.everybatchmrp.com` smoke tests pass.
- [ ] Old URL redirect remains acceptable.
- [ ] Key workflows pass.

## 18. Rollback Checklist

- [ ] Keep old Vercel URL available.
- [ ] Revert latest code commit/deployment if app breaks.
- [ ] Remove/revert domain redirect if needed.
- [ ] Do not delete DNS records unless required.
- [ ] Restore Supabase Auth redirect settings if changed incorrectly.
- [ ] Avoid destructive DB changes.
- [ ] Do not run data deletion migrations without backup/review.

## 19. Known Not-Yet-Active Items

- Tenant subdomain routing is not active.
- `cleaneats.everybatchmrp.com` is not active.
- `admin.everybatchmrp.com` is not active.
- `platform.everybatchmrp.com` remains legacy/optional and is not active.
- `support.everybatchmrp.com` is not active.
- Marketing root `everybatchmrp.com` is not active.
- Platform Admin has a separate `/platform` shell, but preferred admin-domain routing is not active.
- Feature flags are not gating app behaviour yet.
- Support/ticketing backend is not built.
- Central tenant selector is foundational and transitional.

## Task 154 Resolver Checks

Task 154 adds passive resolver and route-intent helpers. Before enabling any host-based routing, verify expected mappings:

- [ ] `localhost:3000` resolves as `local_dev` with Clean Eats fallback.
- [ ] `app.everybatchmrp.com` resolves as `central_app`.
- [ ] `admin.everybatchmrp.com` resolves as `platform_admin`.
- [ ] `cleaneats.everybatchmrp.com` resolves as `tenant_app` with `tenantSlug = cleaneats`.
- [ ] `support.everybatchmrp.com` resolves as `support`.
- [ ] `everybatchmrp.com` resolves as `marketing`.

These checks do not require DNS changes while the helpers remain passive.

## Task 155 Platform Admin Host Guard Checks

Task 155 adds narrow middleware enforcement for `platform_admin` mode only. When host simulation is practical, verify:

- [ ] `Host: admin.everybatchmrp.com` with `/` redirects to `/platform`.
- [ ] `Host: admin.everybatchmrp.com` with `/dashboard` redirects to `/platform`.
- [ ] `Host: admin.everybatchmrp.com` with `/components` redirects to `/platform`.
- [ ] `Host: admin.everybatchmrp.com` with `/finished-products` redirects to `/platform`.
- [ ] `Host: admin.everybatchmrp.com` with `/platform` is allowed.
- [ ] `Host: admin.everybatchmrp.com` with `/login` is allowed.
- [ ] `localhost:3000/dashboard` remains allowed.
- [ ] `app.everybatchmrp.com/platform` remains allowed until the admin domain is live and reviewed.

Tenant subdomain enforcement remains deferred.

## Task 156 Platform Admin Domain Setup Checks

Use [Platform Admin Domain Setup](156-platform-admin-domain-setup.md) before connecting `admin.everybatchmrp.com`.

Manual setup checks:

- [ ] Add `admin.everybatchmrp.com` to the existing Vercel project.
- [ ] Copy the exact DNS target/verification values from Vercel.
- [ ] Add the Cloudflare `admin` DNS record for `everybatchmrp.com.au`.
- [ ] Keep Cloudflare proxy DNS only while Vercel validates, unless Vercel instructs otherwise.
- [ ] Confirm Vercel marks the domain valid.
- [ ] Confirm HTTPS/SSL works.
- [ ] Add required Supabase Auth redirect URLs for `admin.everybatchmrp.com`.
- [ ] Keep existing `app.everybatchmrp.com`, Vercel and localhost auth URLs.
- [ ] Run signed-out, platform-admin, non-platform/demo, central app and local dev smoke tests.
- [ ] Keep rollback notes available before changing DNS.

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this documentation task.
