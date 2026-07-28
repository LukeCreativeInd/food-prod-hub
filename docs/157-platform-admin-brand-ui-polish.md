# Platform Admin Brand/UI Polish

Task 157 applies the EveryBatch brand direction to the separated Platform Admin surface.

## Brand Direction Applied

Platform Admin is now presented as the EveryBatch operator console, separate from the Clean Eats tenant workspace.

The shell and overview page use:

- app name: EveryBatch
- product line: Food Manufacturing OS
- operator console label: EveryBatch Operator Console
- tagline: Every ingredient. Every process. Every batch.
- central app domain: app.everybatchmrp.com
- future Platform Admin domain: admin.everybatchmrp.com.au

## Palette

The platform brand palette is recorded in `lib/platform-brand.ts`:

- deep green: `#0F2E23`
- primary green: `#176B3D`
- lime: `#8CC63F`
- soft green: `#E8F5E9`
- app background: `#F2F4F7`
- dark text: `#1F2937`

## Shell Changes

The Platform Admin shell now has:

- a darker EveryBatch sidebar treatment
- a compact EB mark
- visible EveryBatch, Food Manufacturing OS and Platform Admin labels
- tenant-app-inspired sidebar structure with grouped, icon-led navigation rows
- desktop collapse/expand behaviour with compact icon-only navigation
- single-open accordion behaviour so only the active or manually selected group is expanded
- active route styling using the EveryBatch green/lime palette
- clearer navigation section headings
- refined Live and Soon badges
- a lighter header with operator console wording
- domain/status badges
- existing Switch workspace and Sign out controls

The shell remains compact and admin-focused. It does not add new navigation sections or change route access.

## Mobile Menu

The mobile Platform menu keeps the existing accessible toggle behaviour and still closes when a live navigation item is selected.

The visual treatment has been aligned with the updated EveryBatch sidebar palette and uses the same grouped accordion navigation structure as desktop.

## Page Polish

The main `/platform` overview page now uses the same EveryBatch operator-console language, branded hero treatment and shared Platform UI card/badge styles.

Platform subpage content no longer starts with full-width dark green hero blocks. The persistent Platform header owns the page title, while subpages begin with compact light context callouts, badges, summary cards, tables or forms.

Existing read-only platform data remains unchanged.

## Platform Header Titles

The Platform shell header now uses the shared page-title helper so it reflects the current Platform route:

- `/platform` shows Platform Admin.
- `/platform/tenants` shows All Tenants.
- `/platform/tenants/new` shows New Tenant.
- `/platform/tenants/provisioning` shows Tenant Provisioning.
- `/platform/tenants/onboarding` shows Tenant Onboarding.
- `/platform/tenants/first-admin` shows First Admin / Invites.
- `/platform/tenants/cleaneats` shows Clean Eats Detail.
- `/platform/tenants/cleaneats/modules` shows Clean Eats Modules.
- `/platform/tenants/cleaneats/features` shows Clean Eats Feature Flags.

## Active Navigation

The Platform sidebar uses longest-route matching so only one child item is active at a time.

Examples:

- `/platform/tenants` highlights All Tenants only.
- `/platform/tenants/cleaneats` highlights Clean Eats Detail only.
- `/platform/tenants/cleaneats/modules` highlights Clean Eats Modules only.
- `/platform/tenants/cleaneats/features` highlights Clean Eats Feature Flags only.

Parent groups can still show active/open state, but stale child highlights should not remain after navigation.

## Logo/Icon Handling

No external logo asset was downloaded or embedded.

The EB mark remains the temporary Platform Admin mark. A final EveryBatch logo/icon asset should be added in a later dedicated brand asset task.

## Tenant App Unaffected

This task intentionally does not change the Clean Eats tenant app shell, tenant sidebar, tenant navigation order, tenant branding settings or tenant business module UI.

## Not Included

This task does not include:

- database migrations
- Supabase changes
- RLS changes
- permission changes
- authentication changes
- middleware or domain routing changes
- Platform Admin write actions
- tenant creation or provisioning behaviour changes
- tenant app business logic
- package installation

## Follow-Ups

- add final EveryBatch logo/icon assets
- build public marketing site styling
- refine tenant app brand treatment separately
- add Platform Admin charts/visual analytics when real metrics are ready
- build support/admin operational UI after workflows are approved
