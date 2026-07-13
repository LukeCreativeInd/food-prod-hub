# Staff Formula Collection Template Planning

## Planning Status

This is planning only.

Final CSV/XLSX templates are not created yet. No migrations, Supabase operations, RLS changes, permissions, UI, production route screens, stock movements or integrations are added by this task.

The goal is to confirm exactly what Clean Eats staff need to provide before generating collection files.

This planning builds on the component and formula model in [Component and Formula Data Model Planning](83-component-formula-data-model-planning.md).

Initial CSV template files have now been created in `data-collection/clean-eats/formula-collection/` and are documented in [Staff Formula Collection Templates](85-staff-formula-collection-templates.md).

## Purpose

The next staff data collection should capture the operational recipe and formula knowledge that invoices cannot provide.

The collection should be:

- simple for Clean Eats staff
- not overly technical
- not import-perfect
- easy for Luke to review and clean
- aligned with the future formula data model
- structured enough to become database records later

## What Invoice Intake Has Removed From Staff Workload

Staff no longer need to manually compile these in bulk where invoices exist:

- supplier legal names
- supplier trading names
- supplier item codes
- supplier item descriptions
- purchase units shown on invoices
- invoice prices
- basic supplier catalogue data
- basic price observations / history

Staff may still need to verify unclear mappings, pack conversions and operational classifications.

## What Staff Still Need To Provide

Staff need to provide knowledge invoices do not contain:

- made component formulas
- batch outputs and yields
- finished product / per-meal assembly formulas
- packaging used per finished product
- production method / routing steps
- production areas
- checks, handoffs and operational notes
- shelf life / storage details where known

## Collection File Set

Recommended collection files or workbook tabs:

1. Component / Batch Formulas
2. Finished Product Formulas
3. Production Methods / Routes
4. Production Areas

Optional later tabs:

5. QA / Food Safety Enrichment
6. Production Plan / Report Setup

Keep Phase 1 collection focused on what is needed to build formulas and basic production planning. QA enrichment can come later.

## Component / Batch Formula Collection

Purpose: capture made items produced from raw ingredients and/or other components.

Examples:

- Italian Herb Chicken Breast
- Bolognese Sauce
- Cooked Rice
- Mashed Potato
- Napoli Sauce

Recommended staff-facing columns:

- Component name
- Component category/type
- Version/status
- Standard batch output quantity
- Output unit
- Expected yield quantity
- Expected yield unit
- Input item name
- Input type if known
- Input quantity
- Input unit
- Preparation state
- Loss/yield notes
- Storage notes
- Shelf-life notes
- Staff notes
- Not sure / needs review

Required for initial capture:

- Component name
- Standard batch output quantity
- Output unit
- Input item name
- Input quantity
- Input unit

Optional for initial capture:

- Expected yield
- Preparation state
- Storage / shelf life
- Loss / yield notes

If staff do not know exact yield or loss yet, they can leave it blank or mark `Not sure / needs review`.

## Finished Product Formula Collection

Purpose: capture per-meal or per-selling-unit formula / assembly.

Examples:

- Moroccan Chicken
- Naked Chicken
- Family meals
- Ready-made meal SKUs

Recommended staff-facing columns:

- Finished product name
- Product/SKU type
- Version/status
- Selling unit
- Output quantity
- Input item/component/packaging name
- Input type if known
- Quantity per selling unit
- Unit
- Required yes/no
- Optional garnish/label/packaging note
- Staff notes
- Not sure / needs review

Required for initial capture:

- Finished product name
- Selling unit or output quantity
- Input item/component/packaging name
- Quantity per unit
- Unit

Optional for initial capture:

- Product/SKU type
- garnish notes
- packaging notes
- version/status if unknown

Finished product formulas may include Ingredients, Components and Packaging.

## Production Method / Route Collection

Purpose: capture how an item, component or product is made, where it is made and in what order.

Recommended staff-facing columns:

- Item/component/product name
- Method version/status
- Step number
- Step name
- Facility area
- Step instruction
- Input/dependency
- Expected output
- Equipment used
- Time guidance
- Temperature/check guidance
- Handoff/next area
- Cleaning/changeover note
- Staff notes
- Not sure / needs review

Required for initial capture:

- Item/component/product name
- Step number
- Step name
- Facility area
- Step instruction

Optional for initial capture:

- equipment
- times
- temperatures
- cleaning/changeover
- expected output
- checks

Method / route is separate from formula. Formula says what and how much. Method says how and where.

## Production Areas Collection

Purpose: capture the facility areas used in production workflows.

Recommended staff-facing columns:

- Area name
- Area type
- Description
- Used for
- Active yes/no
- Notes
- Not sure / needs review

Examples:

- Raw Prep
- Cooking
- Cooling
- Portioning
- Assembly
- Packing
- Cold Storage
- Dispatch

Required for initial capture:

- Area name
- Area type or description

Optional:

- used for
- capacity
- equipment
- scheduling constraints

## Production Plan / Report Setup Notes

Production plan / report should not be fully captured yet unless staff are ready.

Eventually needed:

- planned product/component
- planned quantity
- production date
- area/tasks
- actual output
- waste
- exceptions
- completed by
- batch/lot references

For now, focus on formula and route foundations first.

## Staff Instructions

Plain-English instructions for staff:

- Use names, not IDs.
- Leave blanks if unsure.
- Use `Not sure / needs review` instead of guessing.
- Do not worry about exact database formatting.
- Use one row per input line for formulas.
- Use one row per step for methods.
- Use the current best-known standard process.
- If recipes vary, add notes.
- If a component is used in multiple meals, define it once as a component.
- Include packaging in finished product formulas where known.

## Example Rows

These are examples only. Quantities are deliberately sample placeholders where staff values are not known.

### Component Formula Example

Italian Herb Chicken Breast:

| Component name | Standard output quantity | Output unit | Input item name | Input quantity | Input unit | Staff notes |
| --- | ---: | --- | --- | ---: | --- | --- |
| Italian Herb Chicken Breast | 10 | kg | Chicken Thigh | 10 | kg | Example only; confirm batch size and yield |
| Italian Herb Chicken Breast | 10 | kg | Italian herb marinade/spice/oil placeholder | 1 | kg | Placeholder input; confirm real item and quantity |

### Finished Product Example

Moroccan Chicken:

| Finished product name | Selling unit | Input item/component/packaging name | Quantity per selling unit | Unit | Staff notes |
| --- | --- | --- | ---: | --- | --- |
| Moroccan Chicken | 1 meal | Italian Herb Chicken Breast | 150 | g | Example only; confirm actual quantity |
| Moroccan Chicken | 1 meal | Side component placeholder | 180 | g | Confirm actual side component |
| Moroccan Chicken | 1 meal | Sauce component placeholder | 80 | g | Confirm actual sauce |
| Moroccan Chicken | 1 meal | Tray | 1 | each | Confirm packaging item name |
| Moroccan Chicken | 1 meal | Sleeve/label | 1 | each | Confirm packaging item name |

### Production Route Example

Italian Herb Chicken Breast:

| Item/component/product name | Step number | Step name | Facility area | Step instruction | Staff notes |
| --- | ---: | --- | --- | --- | --- |
| Italian Herb Chicken Breast | 1 | Raw prep | Raw Prep | Weigh chicken | Example only |
| Italian Herb Chicken Breast | 2 | Mixing/prep | Raw Prep | Mix with marinade/spice | Confirm actual method |
| Italian Herb Chicken Breast | 3 | Cooking | Cooking | Cook to required standard | Add temperature/check details later |
| Italian Herb Chicken Breast | 4 | Cooling | Cooling | Cool product | Add cooling check later |
| Italian Herb Chicken Breast | 5 | Portioning/assembly | Portioning | Send to assembly | Confirm handoff |

### Production Area Example

| Area name | Area type | Used for | Notes |
| --- | --- | --- | --- |
| Cooking | cooking | cooked components, sauces, proteins | Example only |

## Data Quality Rules

Recommended rules:

- do not duplicate components for every meal
- define shared components once
- use consistent item names
- flag substitutions / alternates
- separate food ingredients from packaging
- do not include supplier item descriptions in formulas unless there is no internal item name yet
- avoid free-text-only recipes where possible
- preserve operational notes separately from quantities

## Relationship To Future Database Model

The templates should map later as follows:

- Component rows become `internal_items` with `item_type = component`, plus `formula_versions` and `formula_lines`.
- Finished product rows become `internal_items` with `item_type = finished_product`, plus `formula_versions` and `formula_lines`.
- Production route rows become `production_route_versions` and `production_route_steps`.
- Production areas become `production_areas`.
- Staff item names are matched to `internal_items` created from invoice intake or added later.

## Handling Unknown Items

If staff list an item that does not yet exist from invoices:

- keep it in the template
- mark it as needs review
- it can become a new `internal_item` later
- supplier / cost details can be added from invoices or manual product setup later

## Handling Units

Practical unit guidance:

- use g / kg for food quantities
- use mL / L for liquids
- use each for packaging or count-based items
- use tray / sleeve / label where practical
- if unsure, write the unit staff normally use and mark needs review

## Handling Yield

Yield is important but can be optional in the first pass.

Ask staff to provide:

- expected output quantity if known
- cooked / final quantity if known
- loss / waste notes if known

If they do not know:

- leave blank
- mark needs review
- capture the formula first and refine yield later

## Recommended Next Step

085 - Create Staff Formula Collection Templates.

This next step should create the CSV/XLSX template files and staff instructions, based on this planning document.

Then:

086 - Component Formula Schema Review / Migration.

Do not create formula schema until the template structure is confirmed.

## Short Executive Summary

The next Clean Eats staff request should focus on operational formula and production knowledge, not supplier catalogue/pricing data. Staff should provide component formulas, finished product formulas, production methods/routes and production areas using simple names and quantities, with blanks allowed where unsure. These templates will become the bridge from invoice-derived internal items into recipes, costings, production planning and traceability.
