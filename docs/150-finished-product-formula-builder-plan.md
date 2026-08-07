# Finished Product Formula Builder Plan

> **Task 239 ownership decision:** A Formula/BOM is the Products-owned composition and nominal output basis. Production Method/Work Instruction knowledge is separate and independently versioned. Recipe is a presentation assembled from approved knowledge, not a canonical table. The current builder remains valid for composition, while its expected-yield fields are transitional and not approved process-yield truth.

Task 150 plans Finished Product Formula Builder v1 before implementation.

This is planning/static-helper work only. It does not add finished product formula write actions, UI forms, imports, parsers, migrations, sell price management, margin calculations, production tasks, iPad workflows, QA checks, Platform Admin changes, tenant provisioning changes or Supplier Invoice Intake changes.

## Current Schema Findings

No migration is needed for the planned v1 builder.

The current formula foundation from `supabase/migrations/022_create_formula_foundation.sql` already supports finished product formulas:

- `formula_versions.formula_type` supports `finished_product`.
- `formula_versions.output_internal_item_id` can reference a tenant-scoped finished product internal item.
- `formula_lines.input_internal_item_id` can reference tenant-scoped component, ingredient, packaging or other internal items.
- `formula_versions` and `formula_lines` both include `organisation_id`.
- Same-tenant composite foreign keys prevent cross-tenant formula/output/input references.
- One active formula per output internal item is enforced by `formula_versions_one_active_output_uidx`.
- Line removal can use soft archive through `formula_lines.archived_at`, matching the current no-delete policy design.

Finished products are currently represented as `internal_items` where `item_type = finished_product`.

Component formulas are currently represented as:

- output: `internal_items.item_type = component`
- formula header: `formula_versions.formula_type = component`
- formula inputs: `formula_lines.input_internal_item_id`

Finished product formulas should use the same tables with `formula_type = finished_product`.

## Proposed V1 Formula Model

### Header

A finished product formula header should use:

- `internal_items.display_name` for the finished product name
- `internal_items.item_type = finished_product`
- `internal_items.base_unit` where useful
- `formula_versions.output_internal_item_id`
- `formula_versions.formula_type = finished_product`
- `formula_versions.version_name`
- `formula_versions.status`
- `formula_versions.output_quantity`, usually `1`
- `formula_versions.output_unit`, for example `each`, `meal` or `unit`
- `formula_versions.expected_yield_quantity`
- `formula_versions.expected_yield_unit`
- `formula_versions.notes`

Draft formulas should be the default for new manual entry. Activating a formula should be explicit because the schema allows only one active formula per output internal item.

### Lines

Finished product lines should use:

- `formula_lines.formula_version_id`
- `formula_lines.input_internal_item_id`
- `formula_lines.line_order`
- `formula_lines.quantity`
- `formula_lines.unit`
- `formula_lines.preparation_state`
- `formula_lines.loss_note`
- `formula_lines.notes`
- `formula_lines.archived_at` for soft removal

Lines should represent what goes into one finished selling unit unless the header output quantity says otherwise.

## Line Input And Reference Rules

Allowed v1 inputs:

- component internal items, for made or batch outputs such as cooked protein, cooked vegetables, sauces or mash
- ingredient internal items, for raw or directly purchased inputs
- packaging internal items, for tray, film, lid, sleeve or label when packaging BOM is confirmed
- consumable/equipment internal items only with explicit review, because these may not belong in product cost

Disallowed or delayed:

- `supplier_items` directly in formula lines
- payment, delivery or invoice footer details
- production method steps as formula lines
- QA checks as formula lines
- stock movement/inventory allocation records
- finished product self-reference
- circular product/component references
- other finished product inputs unless a later reviewed bundle/kit rule is agreed

Supplier catalogue data can help matching only through reviewed internal items and supplier mappings. The formula line itself should remain canonical and internal-item based.

## Costing Readiness Rules

Finished product cost should be shown only when it is safe.

A finished product formula is cost-ready when:

- every active line has a visible tenant-scoped input item
- every active line has a positive quantity
- every active line has a unit
- archived lines are excluded
- component lines have a cost-ready component formula
- ingredient and packaging lines have current approved supplier prices
- line units match the cost source exactly, or a reviewed supported conversion exists
- circular references are blocked

Recommended component cost source:

- use the active component formula where available
- if no active version exists, a later implementation may show the latest draft as a warning state, but should not treat it as final active cost

Ingredient and packaging costs should come from `approved_supplier_prices`.

No fake cost should be shown when:

- approved price is missing
- component formula is missing
- component formula has missing line prices
- unit conversion is needed but unsupported
- formula contains unresolved or unsupported line types

## Margin Readiness Rules

Margin readiness is separate from costing readiness.

Margin requires:

- finished product formula cost is ready
- reliable sell price storage exists
- pack size or serving quantity is known when relevant
- GST/tax handling is confirmed
- margin formula is agreed

Current limitation:

- sell price is not stored in the current schema

Therefore Meal Margins should continue to show readiness/missing sell price states and should not invent sell prices, AUD margin values or margin percentages.

## Validation Rules

Future server actions should validate headers:

- finished product name is required
- output item belongs to the current organisation
- output item has `item_type = finished_product`
- output quantity is required and greater than zero
- output unit is required
- status is one of `draft`, `active` or `archived`
- duplicate active formula conflict is handled clearly

Future server actions should validate lines:

- formula version belongs to the current organisation
- formula version has `formula_type = finished_product`
- input internal item belongs to the current organisation
- input item type is allowed
- input item is not the output item
- circular references are blocked
- quantity is required and greater than zero
- unit is required
- unsupported or ambiguous units are flagged
- component inputs with missing/incomplete formulas are flagged
- component inputs with missing prices are flagged
- packaging lines should map to `item_type = packaging` where possible
- raw ingredient lines should map to `item_type = ingredient` where possible

## Proposed UI Routes

Existing routes should be reused:

- `/finished-products`
  - list finished product internal items
  - show formula status and readiness
  - future New Finished Product action
- `/finished-products/[id]`
  - finished product formula builder
  - header edit
  - formula lines
  - costing readiness
  - margin readiness
  - source/import notes

Compatibility route:

- `/products/finished-products` already redirects to `/finished-products`.

Future possible routes:

- `/finished-products/import`
- `/formula-imports/new`
- `/meal-margins/[id]`

No new sidebar entry is needed for the planning step.

## Proposed Future Server Actions

Plan only:

- `createFinishedProductFormulaAction`
- `updateFinishedProductFormulaHeaderAction`
- `addFinishedProductFormulaLineAction`
- `updateFinishedProductFormulaLineAction`
- `deleteFinishedProductFormulaLineAction`
- `setFinishedProductFormulaStatusAction`

Recommended permissions:

- reads: `formulas.view`
- mutations: `formulas.manage`

The current Component Formula Builder v1 already uses `formulas.manage`, so finished product formula editing should follow the same pattern unless a later product-specific permission split is explicitly required.

All future actions should derive `organisation_id` from authenticated app context. They must not trust client-provided tenant ids.

## Relationship To Component Formulas

Finished product formulas sit above component formulas.

Examples:

- Naked Chicken can include an Italian Herb Chicken Breast component, vegetables, sauce and packaging.
- Moroccan Chicken can include protein, side, sauce, tray and sleeve/label lines.

Component outputs are internal items. Finished product lines can reference those component internal items through `formula_lines.input_internal_item_id`.

Component cost readiness should feed finished product cost readiness. If a component formula changes, finished product readiness may change too.

There is no automatic recalculation table yet. A future task may need cached cost summaries or materialised cost snapshots once formula volume grows.

## Relationship To Formula Import

The Clean Eats workbook Finished Product Formulas tab maps directly to the planned builder structure:

- finished product name -> `internal_items.display_name`
- finished product output -> `formula_versions.output_internal_item_id`
- selling unit/output quantity -> `formula_versions.output_quantity` and `formula_versions.output_unit`
- input item/component/packaging name -> `formula_lines.input_internal_item_id`
- quantity per selling unit -> `formula_lines.quantity`
- unit -> `formula_lines.unit`
- optional garnish/label/packaging note -> `formula_lines.notes`

The manual builder and future import review should share validation rules so staff-entered and imported formulas behave consistently.

## Relationship To Costings And Meal Margins

Task 144 Costings pages already read `formula_versions` and `formula_lines`.

Finished Product Builder v1 should improve:

- `/finished-products`
- `/finished-products/[id]`
- `/meal-margins`
- `/component-costs` indirectly when finished products include cost-ready components

Meal Margins should continue to avoid fake commercial calculations. Until sell price storage exists, it should show formula/cost readiness and missing sell price state only.

## Future Database Needs

No database migration is required for the planned v1 manual builder.

Future reviewed work may need:

- sell price table or product channel price table
- formula cost snapshots
- formula status/version approval rules
- unit conversion rules
- formula dependency graph or cycle guard
- production method/route tables
- production area links
- packaging BOM flags or packaging usage conventions
- audit log writes for formula changes
- formula import batch/review tables
- source workbook/import provenance

These should be planned and reviewed separately before any migration is drafted.

## Static Helper Added

`lib/finished-product-formula-plan.ts` records static plan types and constants:

- builder stages
- line types
- reference types
- validation rules
- costing readiness rules
- margin readiness rules

The helper is pure/static only. It does not call Supabase, read auth context or write data.

## Non-Goals

This task does not build:

- finished product create/edit forms
- finished product formula line mutation actions
- formula upload/import
- workbook or CSV parsing
- sell price management
- margin calculation engine
- unit conversion engine
- production output generation
- production task generation
- iPad/facility workflow
- QA checks
- stock movements
- inventory allocation
- Platform Admin changes
- tenant provisioning changes

## Recommended Next Implementation Task

Build Finished Product Formula Builder v1 using the existing schema and the same safety model as Component Formula Builder v1:

1. Add manual finished product header creation/editing.
2. Add line add/edit/soft-remove actions.
3. Reuse `formulas.view` and `formulas.manage`.
4. Keep cost estimates conservative.
5. Keep margin readiness separate until sell price storage exists.

Task 151 adds [Finished Product Formula Builder v1](151-finished-product-formula-builder-v1.md), implementing this manual builder without a migration, import flow, sell price storage or margin engine.

Task 152 adds [Sell Price Storage And Margin Readiness Plan](152-sell-price-storage-and-margin-readiness-plan.md), defining the future revenue-side pricing model needed before Meal Margins can calculate real margins.
