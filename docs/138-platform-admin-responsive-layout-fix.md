# Platform Admin Responsive Layout Fix

## Purpose

Task 138 improves Platform Admin responsive layout so mobile and tablet users do not see the full Platform navigation dumped above page content.

This affects the Platform Admin shell only.

Tenant app sidebar behaviour from task 137 is unchanged.

## Issue

Before this fix, the Platform shell rendered the whole navigation list above content on narrow screens.

That pushed `/platform` and tenant detail content far down the page.

## Chosen Responsive Behaviour

Desktop:

- keeps the existing left Platform sidebar
- keeps EveryBatch Platform Admin visual direction
- keeps existing Platform navigation sections

Mobile/tablet below `lg`:

- shows compact Platform header area
- hides full Platform navigation by default
- shows a `Platform menu` button
- expands/collapses an inline scrollable Platform navigation panel
- keeps `Switch workspace` visible
- keeps sign out available in the sticky Platform header

## Mobile Platform Menu

The mobile menu:

- is collapsed by default
- uses `aria-expanded`
- uses `aria-controls`
- keeps Live/Soon states
- keeps implemented links active:
  - `/platform`
  - `/platform/tenants/cleaneats`
  - `/platform/tenants/cleaneats/modules`
  - `/platform/tenants/cleaneats/features`
- keeps future items disabled as `Soon`

## Page Responsive Polish

Light wrapping improvements were added for long module and feature text on:

- `/platform/tenants/cleaneats/modules`
- `/platform/tenants/cleaneats/features`

Long module keys, feature keys, descriptions and notes should wrap instead of forcing horizontal overflow.

## Tenant App Unaffected

This task does not change:

- tenant app sidebar
- tenant sidebar accordion behaviour
- tenant navigation order
- tenant app shell
- global search
- Help menu
- Supplier Invoice Intake

## Non-Goals

This task does not add:

- new Platform Admin features
- billing
- support/ticketing
- provisioning
- module/feature edit actions
- database changes
- RLS changes
- permission changes
- domain routing

## Known Limitations

This is a responsive layout fix, not a full Platform Admin redesign.

Future improvements can add:

- active route highlighting in Platform nav
- off-canvas drawer animation
- platform-wide search
- dedicated mobile actions for support/billing once those features exist
