# UI Overhaul v2 Part A - App Shell, Navigation and Branding

> **Task 243 direction:** Preserve current route/Auth/permission behaviour while converging Tenant App shell ownership, adding a consistent breadcrumb/page-action model, making collapsed navigation genuinely useful and replacing narrow horizontal navigation with an accessible mobile drawer. See `EVERYBATCH_INFORMATION_ARCHITECTURE.md` and `EVERYBATCH_UX_DESIGN_SYSTEM.md`.

## Purpose

This pass polishes the shared app shell for Clean Eats Hub without changing dashboards, business workflows, permissions, RLS, Supplier Invoice Intake logic or Platform Admin functionality.

The design direction is a light SaaS command-centre shell with:

- white/light sidebar treatment
- Clean Eats green tenant accents
- icon-led navigation
- clear active states
- compact tenant branding
- a cleaner top header with search and notification placeholders
- a profile menu that preserves the existing sign-out flow

## Sidebar Collapse

The sidebar now has a working collapse control.

Expanded state:

- shows a tenant logo slot
- shows module labels
- shows nested child links when a module is expanded
- keeps the existing expandable module behaviour

Collapsed state:

- shows icon-only module navigation on desktop
- shows only the compact logo or logo placeholder mark
- keeps active states visible through the icon row styling
- hides text labels and nested child text on desktop
- exposes labels through `aria-label` and `title`
- persists via `localStorage` key `food-prod-hub.sidebar-collapsed`

Mobile/tablet behaviour remains horizontal and label-friendly rather than forcing the desktop icon-only layout.

## Navigation Order

The primary navigation order is now:

1. Dashboard
2. Inventory
3. Products
4. Costings
5. Production
6. QA
7. Logistics
8. CRM
9. Reports
10. Tools
11. Admin

Supplier Invoice Intake remains under Tools at `/purchase-documents`.

Purchase Documents has not been added back under Inventory.

Platform Admin was removed from tenant navigation in task 135. It remains available through `/select-workspace` and guarded `/platform` routes.

## Sidebar Accordion Behaviour

Task 137 updates expandable tenant navigation to use accordion-style behaviour:

- route changes auto-expand only the active expandable module
- previously active groups close when navigating to another module
- manual expansion opens one group at a time
- collapsed sidebar mode remains icon-only on desktop

## Tenant Branding

The app shell reads existing organisation branding where available:

- `organisation_branding.logo_url`
- `organisation_branding.primary_colour`
- `organisation_branding.accent_colour`

If no logo exists, the sidebar falls back to a clean logo placeholder labelled `Client Logo` instead of showing tenant metadata as a stacked brand block. 109C adds logo URL management and theme colour controls; 109D completes tenant-safe logo upload/storage.

Future user-facing platform branding should align with EveryBatch. Tenant workspace branding should remain workspace-specific, so the Clean Eats tenant shell can keep Clean Eats logo/name treatment while EveryBatch appears only as the platform/trust layer where appropriate.

## Top Header

The top header now uses tenant context for the organisation label and includes:

- a disabled search placeholder
- a disabled notification placeholder
- a compact profile menu
- the existing logout action inside the profile menu

No global search backend or notification backend has been added.

## Access Behaviour

Existing navigation visibility rules remain in place:

- module visibility still uses enabled module keys
- permission visibility still uses current permission keys
- Admin remains permission-gated
- demo user restrictions remain unchanged

No RLS, permission seed, route guard or database behaviour was changed.

## Performance Notes

The shared route loading skeleton no longer renders another `AppShell`, reducing the chance of duplicate shell-level auth/navigation work during loading states.

This pass adds a lightweight tenant branding lookup through the existing request-cached auth context. It does not start the broader 110 performance overhaul.

## Known Limitations

- Dashboard/card redesign is deferred to 109B.
- Admin theme and logo URL controls are added in 109C.
- The current logo placeholder remains when no tenant logo has been uploaded.
- Dark mode is not included in 109A.
- Status colour settings are not included in 109A.
- Search and notifications remain placeholders.
- Platform Admin now uses its own shell and is no longer shown in tenant navigation.

## EveryBatch Brand Follow-Up

Task 113 documents EveryBatch as the real platform/product brand and plans the future domain architecture. This 109A shell work remains tenant-workspace UI; no domain or platform-brand implementation is added here.
