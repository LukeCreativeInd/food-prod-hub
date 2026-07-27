# UI Overhaul v2 Part C - Admin Theme and Logo Management

## Purpose

This pass adds the first real tenant branding management foundation to Organisation Settings.

It does not redesign dashboards, change navigation order, alter Supplier Invoice Intake logic, change Platform Admin functionality, add business workflows, or start the 110 performance overhaul.

## Branding Controls Added

Organisation Settings now shows and manages tenant branding controls for the active organisation:

- logo URL
- logo preview
- primary colour
- accent colour
- success / good colour
- warning / medium colour
- danger / critical colour
- info colour
- theme mode

The form uses native colour inputs and a simple live preview. It saves only after an authorised user submits the form.

## Logo Handling

This version originally supported logo URL entry and preview only.

If `organisation_branding.logo_url` exists, the app shell/sidebar displays the logo URL. If no logo URL exists, the 109A clean `Client Logo` placeholder remains.

Part D completes this foundation with tenant-safe logo upload to private Supabase Storage. New uploads store the private storage object path in `organisation_branding.logo_url`; the app resolves that path to a short-lived signed URL server-side for display.

## Theme Colour Fields

Migration 025 adds these fields to `public.organisation_branding`:

- `success_colour`
- `warning_colour`
- `danger_colour`
- `info_colour`

Existing fields continue to be used:

- `logo_url`
- `primary_colour`
- `accent_colour`
- `theme_mode`

All colour values are validated as hex colours before saving.

## Light/Dark Mode Foundation

Theme mode now supports:

- `light`
- `dark`

The app shell applies a central `data-tenant-theme` attribute and CSS variables for tenant surfaces, borders, text and muted text.

Dark mode is intended as a foundation. Shared shell/cards/forms remain usable, but individual older placeholder pages may still need future polish.

## Theme Token Application

The app shell sets tenant CSS variables once from the cached tenant presentation helper:

- `--tenant-primary`
- `--tenant-accent`
- `--tenant-success`
- `--tenant-warning`
- `--tenant-danger`
- `--tenant-info`
- surface/background/border/text variables for light/dark mode

Shared UI components now consume theme tokens where safe:

- status badges
- primary/secondary page action buttons
- stat card icons
- empty states
- module card hover accents
- sidebar active state

## Permission And Demo Behaviour

The Organisation Settings page still requires `admin.organisation.view`.

Saving branding requires `admin.organisation.manage` or platform admin membership. Demo users are not granted new permissions and cannot edit branding unless they already have the manage permission, which they should not.

RLS remains enabled. Migration 025 adds insert/update policies for `organisation_branding` only, gated by existing helper functions and `admin.organisation.manage`.

## Storage Setup

Part C did not create a storage bucket or storage policy.

Part D adds the reviewed `organisation-branding` private storage bucket and tenant-scoped logo policies in `supabase/migrations/026_organisation_branding_storage.sql`.

## Known Limitations

- No image cropping/resizing.
- No physical object cleanup on logo removal yet.
- No SVG upload until sanitisation is reviewed.
- No per-module theme controls.
- Dark mode is a central foundation, not a finished page-by-page dark polish pass.
- 110 should still handle deeper performance and query optimisation.
