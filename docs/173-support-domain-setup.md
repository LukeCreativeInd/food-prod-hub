# Support Domain Setup

Task 173 documents the real-world setup path for:

```text
support.everybatchmrp.com
```

This task does not build support routes, support UI, support ticket tables, migrations, RLS policies, permissions, middleware/domain routing, DNS/Vercel/Supabase settings through code, tenant app business logic, Platform Admin business logic, Supplier Invoice Intake logic, Costings/Formula/Sell Price/Margins logic, sidebars/design or packages.

## Purpose

`support.everybatchmrp.com` is the future authenticated EveryBatch Help Centre and Support portal.

It should use:

- the same repo
- the same Vercel project
- the same codebase
- the existing app-mode idea, with host resolving to `support`

It is not:

- a tenant workspace
- Platform Admin
- a public anonymous documentation site

## Current State

- The Help & Support menu already points to `support.everybatchmrp.com` paths.
- The support help centre is planned in [Support Domain And Auth-Gated Help Centre Plan](172-support-domain-auth-gated-help-centre-plan.md).
- Support routes and support UI are not scaffolded yet.
- Support ticket tables do not exist yet.
- The support domain may currently show DNS errors or app fallback behaviour until Vercel/DNS setup and task 174 are complete.

## Vercel Setup Checklist

In the existing EveryBatch Vercel project:

- [ ] Open the EveryBatch/Food Prod Hub Vercel project.
- [ ] Add domain:

```text
support.everybatchmrp.com
```

- [ ] Wait for Vercel to show DNS instructions.
- [ ] Copy the exact DNS target and any verification value from Vercel.
- [ ] Do not guess the DNS target.
- [ ] Do not reuse the `app.everybatchmrp.com` target unless Vercel explicitly shows the same value.
- [ ] Wait for Vercel to mark the domain as valid.
- [ ] Confirm Vercel SSL/HTTPS is active.
- [ ] Keep existing app/admin/tenant domains unchanged.

## Cloudflare DNS Checklist

In Cloudflare for `everybatchmrp.com`:

- [ ] Add the DNS record exactly as Vercel instructs.
- [ ] Record type will likely be `CNAME`.
- [ ] Name will likely be:

```text
support
```

- [ ] Target/value must be copied from Vercel.
- [ ] Set Cloudflare proxy to DNS only while Vercel validates, unless Vercel's current instructions say otherwise.
- [ ] Wait for DNS propagation.
- [ ] Confirm `https://support.everybatchmrp.com` resolves over HTTPS.
- [ ] Confirm there is no `DNS_PROBE_FINISHED_NXDOMAIN`.

## Supabase Auth Redirect Checklist

Review Supabase Auth URL configuration before testing login from the support domain.

Add support URLs if required:

- `https://support.everybatchmrp.com`
- `https://support.everybatchmrp.com/login`
- `https://support.everybatchmrp.com/guides`
- `https://support.everybatchmrp.com/tickets`
- `https://support.everybatchmrp.com/contact`

Keep existing URLs:

- `https://app.everybatchmrp.com`
- `https://app.everybatchmrp.com/login`
- `https://app.everybatchmrp.com/select-workspace`
- `https://admin.everybatchmrp.com`
- `https://admin.everybatchmrp.com/login`
- `https://admin.everybatchmrp.com/platform`
- `https://cleaneats.everybatchmrp.com`
- `https://cleaneats.everybatchmrp.com/login`
- localhost development URLs
- current Vercel production/preview URLs if still used for testing

The Supabase Auth Site URL should remain:

```text
https://app.everybatchmrp.com
```

## Auth Cookie Note

Support should eventually use the same Supabase auth session as the app, tenant and admin domains.

Before the support Help Centre is made live, support should be added to the reviewed production cookie-sharing host list so `.everybatchmrp.com` auth cookies work across:

- `app.everybatchmrp.com`
- `admin.everybatchmrp.com`
- `cleaneats.everybatchmrp.com`
- `support.everybatchmrp.com`

Task 173 does not change cookie code or Supabase settings.

## Expected Behaviour Before Task 174

Because task 174 has not created support routes yet:

- DNS/domain validation can be completed.
- SSL can become active.
- The Help & Support link may still fail, redirect, show an app fallback or show a generic 404 depending current deployed routing.
- The final Help Centre dashboard is not expected yet.
- Support tickets are not expected yet.

Do not claim the support centre is live until task 174 or later creates an authenticated support scaffold.

## Expected Behaviour After Task 174

After the Support Help Centre Scaffold is implemented:

- `support.everybatchmrp.com` redirects signed-out users to login or an auth-required support landing.
- `support.everybatchmrp.com/login` loads login.
- signed-in users see the Support Help Centre dashboard.
- `support.everybatchmrp.com/guides` shows an authenticated guide index/scaffold.
- `support.everybatchmrp.com/tickets` shows a ticket scaffold or coming-soon state.
- `support.everybatchmrp.com/platform` does not expose Platform Admin.
- `support.everybatchmrp.com/dashboard` does not expose the tenant workspace.

## Smoke Tests Before Task 174

Run after Vercel and Cloudflare validate:

- [ ] `https://support.everybatchmrp.com` resolves.
- [ ] HTTPS works without browser SSL warning.
- [ ] No `DNS_PROBE_FINISHED_NXDOMAIN`.
- [ ] Vercel shows `support.everybatchmrp.com` as valid.
- [ ] Cloudflare record is DNS only during validation.
- [ ] Any app fallback, redirect or 404 is recorded as expected until support scaffold exists.
- [ ] Existing domains still work:
  - [ ] `https://app.everybatchmrp.com/login`
  - [ ] `https://admin.everybatchmrp.com/platform`
  - [ ] `https://cleaneats.everybatchmrp.com/dashboard`

## Smoke Tests After Task 174

Signed out:

- [ ] `https://support.everybatchmrp.com/` redirects to login or an auth-required support landing.
- [ ] `https://support.everybatchmrp.com/login` loads login.
- [ ] `https://support.everybatchmrp.com/guides` redirects to login.
- [ ] `https://support.everybatchmrp.com/tickets` redirects to login.

Signed in:

- [ ] `/` shows Support Help Centre.
- [ ] `/guides` shows guide index/scaffold.
- [ ] `/tickets` shows ticket scaffold or coming-soon.
- [ ] `/platform` does not show Platform Admin.
- [ ] `/dashboard` does not show tenant app.
- [ ] Help & Support menu lands on the support dashboard or relevant guide route.

## Help Icon Notes

Current behaviour:

- the Help & Support menu points to future `support.everybatchmrp.com` paths
- task 173 does not change those URLs

Interim expectation:

- before DNS and task 174, the help link may not work as intended
- after task 174, it should land on authenticated support content

Future:

- add context-aware help links by page/module
- link directly to relevant guides where safe

## Rollback Notes

If the support domain setup causes issues:

- remove or disable `support.everybatchmrp.com` from the Vercel project
- remove or disable the Cloudflare `support` DNS record if needed
- keep existing app/admin/tenant domains unchanged
- keep Supabase Auth redirect URLs if harmless; remove only if a confirmed redirect problem occurs
- no database rollback is required
- no migration rollback is required
- no RLS rollback is required

## Not Included

Task 173 does not include:

- support routes
- support UI
- support shell
- support ticket schema
- support ticket RLS
- support storage bucket
- support middleware enforcement
- DNS/Vercel/Supabase setting changes through code
- public guide publishing
- Platform Admin Support Inbox
- packages
- migrations

## Next Step

Task 174 should create the first authenticated Support Help Centre scaffold after the domain setup path is reviewed.
