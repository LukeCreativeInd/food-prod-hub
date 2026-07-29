# Tenant App Shell, Login and Metadata Polish

Task 165 polishes the tenant app shell, login page, browser metadata and workspace/account menu now that EveryBatch has live app, admin and tenant domains.

This task does not change database schema, migrations, RLS, permissions, Supabase Auth settings, DNS/Vercel settings, middleware routing rules, Platform Admin business logic, tenant business logic, Supplier Invoice Intake logic, Costings/Formula/Sell Price logic, tenant module order or packages.

## Sidebar Branding

The tenant sidebar now presents the brand hierarchy as:

- EveryBatch mark and name at the top
- Food Manufacturing OS product line
- tagline: Every ingredient. Every process. Every batch.
- tenant workspace identity below

Clean Eats remains the tenant workspace identity. If a tenant logo URL is available, the sidebar shows the uploaded tenant logo. If no logo is available, it shows a compact logo placeholder mark beside the tenant workspace name.

The previous bottom `Powered by EveryBatch` footer has been removed because EveryBatch is now the primary sidebar brand.

## User And Workspace Menu

The user/account block has moved from the top-right app header to the bottom of the tenant sidebar.

The sidebar account menu includes:

- account summary
- inline workspace choices
- current workspace indicator
- EveryBatch Platform Admin option when the signed-in user has platform access
- sign out

Workspace destinations are still built from known EveryBatch constants and existing workspace-option helpers. Local development stays local.

## Header Cleanup

The tenant app header now keeps the page title on the left and icon-led utilities on the right:

- search icon button
- notification placeholder icon
- Help & Support icon/menu

The large top-right user card has been removed from the header.

Search still opens the existing search palette and keeps the keyboard shortcut behaviour.

## Favicon And Metadata

An EveryBatch `EB` SVG app icon was initially added through the Next app icon/metadata flow. Task 167 replaces that temporary fallback with the real EveryBatch PNG icon asset.

Browser titles now use the current route title with the EveryBatch brand, for example:

- Login - EveryBatch
- Select Workspace - EveryBatch
- Dashboard - EveryBatch
- Components - EveryBatch
- Finished Products - EveryBatch
- Platform Admin - EveryBatch

Tenant and Platform shell routes also sync the browser title on client-side navigation using the existing page-title helper.

## Login Page Polish

The login page now uses equal-height desktop panels and more production-ready EveryBatch language.

Removed temporary language such as:

- foundation wording
- future central login wording
- scaffold-style tenant routing copy

The login page still uses the existing Supabase Auth flow and post-login workspace destination logic.

Task 175 adds [App Shell And Auth Page UI Cleanup](175-app-shell-auth-page-ui-cleanup.md), which further balances the `/login` and `/select-workspace` desktop panels while preserving the existing auth and workspace-routing behaviour.

## Switch Workspace Fix

The old header `Switch workspace` entry has been replaced by the sidebar workspace menu.

Inline workspace choices take users directly to their current tenant workspace or Platform Admin destination using the existing validated workspace destination helpers.

The `/select-workspace` page remains unchanged for first-login and central gateway flows, but it is no longer repeated as a separate row inside the sidebar account menu.

## Cross-Subdomain Auth Cookie Sharing

Supabase auth cookies now use the parent EveryBatch cookie domain on live EveryBatch app surfaces:

```text
.everybatchmrp.com
```

This lets a user sign in on `app.everybatchmrp.com` and arrive authenticated on:

- `cleaneats.everybatchmrp.com`
- `admin.everybatchmrp.com`

The shared cookie domain is only applied for known EveryBatch production app modes. It is not applied on localhost, local/private hosts, Vercel preview hosts, the marketing root or future support host.

Task 172 plans the future authenticated `support.everybatchmrp.com` Help Centre. Before support goes live, support should be added to the reviewed production cookie-sharing host list so users signed in through the central app can arrive authenticated on the support domain.

The cookie options are shared by the browser and server Supabase helpers:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/cookie-options.ts`

The cookie remains limited to EveryBatch subdomains and uses `sameSite: "lax"`, `secure: true` and `path: "/"` when the production parent domain is used.

Users may need to sign in again once after deployment so their browser receives fresh Supabase cookies at the parent domain instead of an older host-only subdomain cookie.

## Preserved Behaviour

- `/login` remains the central login route.
- `/select-workspace` remains the central workspace selector.
- `/dashboard` remains the Clean Eats tenant workspace dashboard.
- `/platform` remains the Platform Admin shell.
- Domain routing rules from tasks 158-163 remain unchanged.
- No new route protection, permission gates or RLS changes were added.
- No Supabase dashboard or Auth redirect settings were changed.

## Follow-Ups

Task 166 adds the detailed [Brand Asset Logo/Icon Storage Plan](166-brand-asset-logo-icon-storage-plan.md) for these asset follow-ups.
Task 168 drafts the schema/storage foundation in [Brand Asset Schema Foundation](168-brand-asset-schema-foundation.md). Upload UI, cropping/resizing and runtime sidebar replacement remain follow-up work.
Task 169 adds tenant full-logo/icon upload controls and wires the tenant sidebar to use full logo when expanded and icon when collapsed.

- Drop in final EveryBatch logo assets when available.
- Add EveryBatch platform logo and platform icon asset support. Expanded sidebars should use the full logo; collapsed sidebars should use a dedicated icon.
- Add tenant logo and tenant icon asset support. Expanded tenant sidebar identity should use the tenant logo cleanly; collapsed sidebars should use a dedicated tenant icon instead of shrinking a full logo.
- Let login, header and favicon surfaces use the appropriate EveryBatch icon assets after the final asset set exists.
- Plan any tenant/platform logo and icon upload support through reviewed storage, schema and admin UI work later.
- Add tenant-specific login branding if needed.
- Add a real notification system later.
- Add user preferences/settings later.
- Add dynamic tenant-domain lookup after a reviewed tenant-domain model exists.

## Migration Notes

Task 165 created no SQL migration. Task 168 later drafts migration `031_brand_asset_schema_foundation.sql` for future brand asset metadata and storage-path support.
