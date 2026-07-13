# Component and Formula Data Model Planning

## Planning Status

This is planning only.

No migrations, Supabase operations, RLS changes, permissions, UI, production routes, stock movements or integrations are added by this task.

The goal is to define the component and formula model before building component, recipe or finished product screens. The current invoice-derived internal item data is only the raw-item foundation: it proves that supplier invoice intake can create reviewed supplier, internal item and price records, but it does not define component formulas or production methods yet.

Migration 022 now drafts the schema foundation for `formula_versions` and `formula_lines`; see [Component Formula Schema Foundation](86-component-formula-schema-foundation.md). Production methods/routes remain future work.

## Purpose

The next major Clean Eats data layer is formulas.

The system needs to support:

- raw Ingredients from supplier invoice intake
- made Components / batch items
- Finished Products / ready meals
- packaging inputs
- versioned formulas
- future costing rollups
- future production planning
- future inventory / BOM traceability

The model should keep three ideas separate:

- Formula / BOM = what and how much
- Method / Route = how, where and in what sequence
- Production Run / Report = what actually happened

## Current Foundation

The `internal_items` table already exists.

`internal_items` currently supports these `item_type` values:

- `ingredient`
- `packaging`
- `consumable`
- `equipment`
- `non_stock_charge`
- `component`
- `finished_product`
- `unknown`

`supplier_items` and `supplier_item_mappings` connect supplier-facing catalogue records to canonical internal items.

`approved_supplier_prices` connects supplier items and internal items to costing data.

Recipes and production should use internal item names, not supplier descriptions. Supplier-facing descriptions remain purchasing-facing source data.

This makes `internal_items` the natural canonical item layer for future formulas.

## Key Domain Concepts

### Internal Item

Canonical tenant item used across the app.

It can represent a raw ingredient, packaging item, consumable, component or finished product.

### Raw Ingredient

An internal item with `item_type = ingredient`.

Usually purchased from suppliers.

### Packaging Item

An internal item with `item_type = packaging`.

Used in finished product formulas, but not consumed like food ingredients.

### Component

A made or semi-finished internal item with `item_type = component`.

Examples:

- Bolognese Sauce
- Italian Herb Chicken Breast
- Cooked Rice
- Mashed Potato
- Napoli Sauce

### Finished Product

A sellable internal item with `item_type = finished_product`.

Examples:

- Moroccan Chicken
- Naked Chicken
- ready-made meal SKUs
- family meals

### Formula Version

A versioned BOM / recipe that defines what inputs and quantities are required to make one output item.

### Formula Line

A single input line inside a formula version.

### Production Method / Route Version

Step-by-step operational instructions that define how and where the formula is made.

### Production Run / Report

An actual production event recording planned vs actual quantities, outputs, waste, exceptions and batch / lot usage.

## Component Formula Model

Component formulas should define made batch items.

Examples:

- Italian Herb Chicken Breast
- Bolognese Sauce
- Cooked Rice
- Mashed Potato

A Component Formula Version should include:

- `organisation_id`
- `output_internal_item_id`
- version number or name
- status: `draft`, `active`, `archived`
- standard batch output quantity
- output unit
- expected yield
- yield unit or yield percentage
- notes
- effective date
- created / approved metadata later

Formula lines should include:

- `input_internal_item_id`
- input item type
- quantity
- unit
- optional preparation state
- optional loss / yield note
- line order
- notes

Example: Italian Herb Chicken Breast formula:

- output: Italian Herb Chicken Breast
- input: Chicken Thigh
- input: marinade / spice / oil items later
- output unit: kg
- standard batch size to be confirmed by staff

## Finished Product Formula Model

Finished product formulas should define the per-unit or per-meal assembly formula.

Example: Moroccan Chicken:

- x grams Chicken Thigh or cooked chicken component
- x grams rice / couscous / side component
- x grams sauce component
- tray
- film / lid
- sleeve / label

A finished product formula should support inputs of:

- raw Ingredients
- Components
- Packaging
- possibly Consumables if needed later

Fields:

- `output_internal_item_id`
- serving / selling unit
- version / status
- output quantity, usually 1 meal or unit
- formula lines with input item, quantity and unit
- notes

## Recursive BOM Requirement

Future formulas need recursive relationships:

Supplier Item
-> Internal Raw Ingredient
-> Component
-> Finished Product

Example:

Cammaroto supplier item `T/F-DCE M-VA`
-> Chicken Thigh
-> Italian Herb Chicken Breast
-> Moroccan Chicken

Rules:

- formulas should use `internal_items` only
- `supplier_items` should not appear in recipe formulas
- supplier item data remains purchasing-facing
- `internal_items` are the bridge across recipes, costings, production and inventory

## Formula Versioning

Versioning is required because:

- recipes change
- yields change
- production methods change
- cost history needs to understand what version was current
- production needs the active version at the time of run

Recommended statuses:

- `draft`
- `active`
- `archived`

Rules:

- only one active formula version per output item initially
- old versions should remain available for traceability
- formula edits should create new versions later, not silently overwrite history

## Unit and Yield Handling

The model needs to support:

- kg
- g
- L
- mL
- each / unit
- tray
- sleeve
- carton if later relevant
- pack / unit conversions where verified

Do not derive unclear conversions automatically.

Invoices provide purchase units, not always recipe units. Staff must confirm formula units and yields.

Yield examples:

- raw chicken input to cooked chicken output
- cooked rice from dry rice + water
- sauce batch cooked yield
- mashed potato batch yield

For v1:

- store declared formula input quantities and output quantity
- add advanced yield / loss modelling later

## Costing Relationship

Costings should roll up from approved supplier prices through internal item formulas.

Cost layers:

- raw ingredient approved supplier price
- packaging approved supplier price
- component formula cost
- finished product formula cost
- meal margin later

Rules:

- formula cost should use the active formula version
- component cost should roll up recursively
- finished product cost should include ingredients, components and packaging
- production waste and overheads can be added later

## Production Relationship

Formula / BOM tells what and how much.

Production method tells how and where.

Production run records actuals.

Formula should not duplicate method instructions.

A Production Method / Route Version should include:

- linked output item or formula version
- step order
- area
- task / instruction
- expected time / temperature / checks where needed
- equipment if relevant
- handoff / dependency
- notes

Production areas should include:

- Raw Prep
- Cooking
- Cooling
- Portioning
- Assembly
- Packing
- Cold Storage
- Dispatch

For v1, production method and production areas can be planned separately after formulas.

## Proposed Future Tables

These are possible tables only. Do not create them yet.

### `formula_versions`

Suggested fields:

- `id`
- `organisation_id`
- `output_internal_item_id`
- `formula_type`: `component` / `finished_product`
- `version_name` or `version_number`
- `status`
- `output_quantity`
- `output_unit`
- `expected_yield_quantity`
- `expected_yield_unit`
- `effective_from`
- `notes`
- `created_by_profile_id`
- `approved_by_profile_id`
- `created_at`
- `updated_at`
- `archived_at`

### `formula_lines`

Suggested fields:

- `id`
- `organisation_id`
- `formula_version_id`
- `input_internal_item_id`
- `line_order`
- `quantity`
- `unit`
- `preparation_state`
- `loss_note`
- `notes`
- `created_at`
- `updated_at`

### `production_route_versions`

Suggested fields:

- `id`
- `organisation_id`
- `output_internal_item_id`
- `formula_version_id` nullable
- `version_name`
- `status`
- `notes`
- `created_at`
- `updated_at`

### `production_route_steps`

Suggested fields:

- `id`
- `organisation_id`
- `production_route_version_id`
- `step_order`
- `area_id`
- `step_name`
- `instruction`
- `expected_duration_minutes`
- `temperature_target`
- `check_required`
- `equipment`
- `notes`

### `production_areas`

Suggested fields:

- `id`
- `organisation_id`
- `name`
- `area_type`
- `description`
- `status`
- `notes`

## Tenant Isolation and RLS Requirements

All future formula and route tables must:

- include `organisation_id`
- enforce same-tenant foreign keys
- use RLS
- use read / write permissions
- preserve tenant isolation
- avoid cross-tenant sharing

## Permissions Planning

Potential future permissions:

- `formulas.view`
- `formulas.manage`
- `formula_versions.approve`
- `production_routes.view`
- `production_routes.manage`
- `production_areas.view`
- `production_areas.manage`

For Phase 1 demo:

- demo user should eventually view formulas / routes read-only
- demo user should not manage or approve formulas / routes

## Staff Data Collection Impact

Invoice intake reduces supplier, catalogue and price workload, but staff still need to provide formula and method data.

Staff collection template planning is documented in [Staff Formula Collection Template Planning](84-staff-formula-collection-template-planning.md). That document defines the proposed collection tabs, staff-facing fields and instructions before final CSV/XLSX templates are created.

Component formulas:

- component name
- output quantity / unit
- input items
- input quantities / units
- expected yield
- notes

Finished product formulas:

- finished product name
- per-unit output
- ingredient / component / packaging inputs
- quantities / units
- notes

Production method / routes:

- steps
- area
- order
- checks
- equipment if relevant
- handoffs / dependencies

Production areas:

- area names
- area types
- basic descriptions

## Minimum Fields for Future Staff Collection Forms

### Component Formula Collection

- Component name
- Standard output quantity
- Output unit
- Input item name
- Input type if known
- Input quantity
- Input unit
- Expected yield
- Notes

### Finished Product Formula Collection

- Finished product name
- Selling unit
- Input item / component / packaging name
- Input type
- Quantity per unit
- Unit
- Notes

### Production Route Collection

- Item / component / product
- Step number
- Step name
- Area
- Instruction
- Check required yes / no
- Notes

### Production Area Collection

- Area name
- Area type
- Description
- Active yes / no

## First Test Chain Recommendation

Because current real data only includes Chicken Thigh, use a small first chain once more staff data is available:

Chicken Thigh
-> Italian Herb Chicken Breast
-> Moroccan Chicken

or another meal confirmed by Luke / staff.

Do not build this yet until staff confirms the actual formulas and quantities.

## Recommended Build Sequence After Planning

Recommended sequence:

- 084 - Component Formula Schema Planning Review / Migration
- 085 - Component Formula UI Scaffold
- 086 - Finished Product Formula UI Scaffold
- 087 - Formula Cost Rollup Planning
- 088 - Production Route Planning

For 084, create `formula_versions` and `formula_lines` only after review.

Before migrations, Luke should confirm initial staff collection fields.

## Open Questions

Should Components and Finished Products remain `internal_items` or get specialised tables linked to `internal_items`?

Recommended default: keep them as `internal_items` first, then add specialised tables later only when a real field need appears.

Should formula type be `component` / `finished_product` on `formula_versions`?

Recommended default: yes. It keeps one formula structure while allowing UI and validation to differ by output type.

Should packaging be formula input lines or a separate packaging BOM section?

Recommended default: store packaging as formula lines using `internal_items` with `item_type = packaging`. Add a UI grouping later if staff need it.

How should yield be represented in v1?

Recommended default: store declared output quantity and optional expected yield quantity / unit. Avoid automatic yield maths until staff confirms real production behaviour.

What unit conversion rules are required before costing rollups?

Recommended default: support declared units first. Add verified conversion rules only for known, approved conversions.

Should formulas have approval workflow in Phase 1 or later?

Recommended default: draft / active / archived status in Phase 1, with explicit approval metadata planned but not overbuilt.

Should production route be linked to output item or formula version?

Recommended default: support both `output_internal_item_id` and nullable `formula_version_id`. This allows method planning before formulas are perfect while preserving stronger links later.

How much method detail belongs in Phase 1 versus later QA / production enrichment?

Recommended default: capture step order, area, instruction and whether a check is required. Temperatures, equipment and detailed QA checks can deepen later.

## Short Executive Summary

The formula layer should build on `internal_items`. Raw Ingredients, Packaging, Components and Finished Products should all be canonical internal items, while `formula_versions` and `formula_lines` define versioned BOMs using only internal item inputs. Production methods / routes should be separate from formulas so the system can distinguish what is used, how it is made and what actually happened in production.
