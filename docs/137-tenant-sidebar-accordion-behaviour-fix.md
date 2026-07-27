# Tenant Sidebar Accordion Behaviour Fix

## Purpose

Task 137 fixes tenant app sidebar submenu behaviour so expandable module sections do not remain open indefinitely after navigation.

This applies to the Clean Eats tenant workspace sidebar only.

Platform Admin shell navigation is unaffected.

## Issue

Before this fix, navigating between expandable modules could leave multiple groups open at once.

Example:

- Products open
- Costings open
- Production open

This made the sidebar very tall and harder to scan.

## Chosen Behaviour

The tenant sidebar now uses accordion-style behaviour:

- route changes auto-expand only the active expandable module
- previously active groups close when the route changes
- clicking a closed expandable group opens that group and closes others
- clicking the currently open group can collapse it temporarily
- navigating again reopens the active module

## Active Route Handling

Examples:

- `/products` opens Products only
- `/suppliers` opens Products only
- `/costing-overview` opens Costings only
- `/ingredient-costs` opens Costings only
- `/production` opens Production only
- `/production-report` opens Production only
- `/inventory` opens Inventory only
- `/stock-locations` opens Inventory only
- `/dashboard` does not leave unrelated groups open

## Collapsed Sidebar Compatibility

Collapsed sidebar behaviour is preserved:

- icons remain visible
- nested text remains hidden
- active parent icon styling remains visible
- sidebar collapsed state still uses localStorage

## Platform Admin Unaffected

This task does not change:

- Platform Admin shell
- Platform Admin navigation
- `/platform` routes
- Platform guards

## Non-Goals

This task does not change:

- tenant navigation order
- permissions
- RLS
- database schema
- migrations
- login/workspace selector flow
- Supplier Invoice Intake
- business workflows
