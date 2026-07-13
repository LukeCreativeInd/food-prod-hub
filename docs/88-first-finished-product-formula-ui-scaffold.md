# First Finished Product Formula UI Scaffold

## Status

The first read-only Finished Product Formula UI scaffold has been added.

This step does not add migrations, staff CSV/XLSX import, formula create/edit forms, costing rollups, production routes, stock movements, inventory consumption, purchase orders, Goods Inwards, Platform Admin changes or Purchase Document Intake changes.

Step 089 adds [Formula Import Planning](89-formula-import-planning.md). The finished product workspace will later show imported formula records after staff collection data is reviewed, matched and committed.

## Routes Added Or Updated

- `/finished-products`
- `/finished-products/[id]`
- `/internal-items/[id]`

## Data Helpers Added

`lib/formula-data.ts` now includes:

- `getFinishedProductFormulaOverviewForCurrentOrganisation()`
- `getFinishedProductFormulaDetailForCurrentOrganisation(id)`

The helpers read:

- `internal_items` where `item_type = finished_product`
- `formula_versions` where `formula_type = finished_product`
- `formula_lines`
- optional approved supplier price hints when visible through existing RLS

They use the authenticated Supabase server client, current organisation context and `formulas.view`.

They do not use service-role keys.

## Finished Products Workspace

`/finished-products` now acts as the Finished Product Formulas workspace.

It shows:

- finished products found
- active formula count
- draft formula count
- inputs requiring review count
- explanation of selling unit formula vs component formulas vs production routes
- read-only finished product formula list
- empty state when no finished product data exists
- staff collection reminder

If no finished product internal items exist yet, the page explains that finished products will appear after staff formula data is imported or entered. Static examples are clearly marked as example-only and are not saved data.

The empty state includes small visual-only example cards for Moroccan Chicken and Naked Chicken so staff can see the intended formula shape without confusing those examples for saved database records.

## Finished Product Detail

`/finished-products/[id]` uses the finished product internal item id.

It shows:

- finished product header and read-only status
- selected active formula, or draft formula if no active version exists
- output summary
- formula composition counts for ingredients, components, packaging and other inputs
- formula input lines joined to internal items
- approved supplier price hints where visible
- formula version list
- costing placeholder
- production method placeholder
- future usage placeholder for meal margins, production planning and inventory traceability

If no formula exists, the page explains that the finished product exists but formula data has not been captured yet.

## Relationship To Component Formulas

Component formulas define made/batch items such as sauces, cooked rice or prepared proteins.

Finished product formulas define the sellable unit and can include:

- raw ingredients
- components
- packaging
- other internal item types if needed later

Both workspaces use the same `formula_versions` and `formula_lines` foundation.

## Internal Item Detail Link

`/internal-items/[id]` now shows a formula workspace link when the internal item is a finished product or component.

For raw items, reverse formula usage remains a future feature and is not queried yet.

## Demo User Behaviour

The Phase 1 demo user can view this scaffold if Migration 022 has been manually applied and the role has `formulas.view`.

The scaffold does not grant `formulas.manage` and does not expose write actions.

## Non-Goals

This task does not build:

- formula create/edit
- formula import
- component formula write changes
- formula cost rollups
- production routes or methods
- production areas UI
- stock movements
- inventory consumption
- purchase orders
- goods receiving
- Platform Admin changes
- Purchase Document Intake changes

## Next Recommended Task

Review the finished product scaffold with Clean Eats staff using the collection templates from step 085, then plan a controlled formula import or reviewed entry flow after staff data is available.
