# First Component Formula UI Scaffold

## Status

The first read-only Component Formulas UI scaffold has been added.

This step does not add migrations, staff CSV/XLSX import, formula create/edit forms, costing rollups, production routes, stock movements, purchasing flows, Goods Inwards, Platform Admin changes or Purchase Document Intake changes.

Step 088 adds the matching read-only Finished Product Formula UI scaffold; see [First Finished Product Formula UI Scaffold](88-first-finished-product-formula-ui-scaffold.md).

## Routes Added Or Updated

- `/components`
- `/components/[id]`
- `/internal-items/[id]`

## Data Helper Added

```text
lib/formula-data.ts
```

The helper reads formula data for the current organisation using the authenticated Supabase server client and the existing app auth context.

It requires:

- `formulas.view`
- current authenticated app access
- current active organisation context

It does not use service-role keys.

## Components Overview

`/components` now acts as the Component Formulas workspace.

It shows:

- component count
- active formula count
- draft formula count
- inputs requiring review count
- Formula / BOM vs Method / Route explanation
- read-only component formula table
- empty state when no component data exists
- staff collection reminder

If no component internal items exist yet, the page explains that components appear after staff data import or reviewed entry. Static examples are clearly marked as example-only and are not saved data.

## Component Detail

`/components/[id]` uses the component internal item id.

It shows:

- component header and read-only status
- selected active formula, or draft formula if no active version exists
- component/output summary
- formula lines joined to input internal items
- approved supplier price hints where visible
- formula version list
- costing placeholder
- production method placeholder
- future finished product usage placeholder

If no formula exists, the page explains that the component exists but formula data has not been captured yet.

## Internal Item Detail Link

`/internal-items/[id]` now shows a formula workspace link when the internal item is a component.

For ingredient items, it shows a future placeholder for component formulas using that ingredient. Reverse formula usage is not queried yet.

## Review-First Boundaries

This scaffold is read-only.

It does not:

- create or edit formula versions
- create or edit formula lines
- import staff templates
- calculate formula cost rollups
- create stock movements
- create production methods or routes
- connect formulas to finished products
- alter permissions or RLS

## Demo User Behaviour

The Phase 1 demo user can view this scaffold only if Migration 022 has been manually applied and the role has `formulas.view`.

The scaffold does not grant `formulas.manage` and does not expose write actions.

## Next Recommended Steps

1. Apply and test Migration 022 manually if not already applied.
2. Collect staff component formula data using the templates from step 085.
3. Build a reviewed formula import or entry flow after staff confirms fields and terminology.
4. Add formula cost rollups only after formula data quality is trusted.
