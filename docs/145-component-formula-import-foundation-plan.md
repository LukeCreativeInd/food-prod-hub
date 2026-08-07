# Component / Formula Import Foundation Plan

> **Task 224 evidence note:** Legacy Production Report formulas, yields, water additions, batch rules and mappings are behavioural evidence only and must not be imported as canonical data. This import pattern may move earlier only for current approved Clean Eats source data, with source-row provenance, UOM/item validation, review and controlled apply.

> **Task 239 correction:** Formula import targets Products-owned composition and nominal output basis only. Expected process yield/loss, process batch envelopes, Method Steps and Work Instructions are separate Production targets. The current `formula_versions.expected_yield_*` fields are transitional and must not receive authoritative process-yield imports. Recipe is not an import table. This older plan remains useful for Formula staging patterns, subject to Tasks 240-243.

Task 145 creates the planning and schema-alignment foundation for importing Clean Eats component formulas and finished product formulas.

This is planning/static helper work only. It does not add upload UI, parser actions, import commits, database migrations, Supabase writes, production task logic, Supplier Invoice Intake changes, Costings changes, Platform Admin changes or navigation changes.

## Current Formula Schema Summary

Formula foundation already exists in:

- `supabase/migrations/022_create_formula_foundation.sql`

Current formula tables:

- `formula_versions`
- `formula_lines`

`formula_versions` stores the output item and version-level details:

- `organisation_id`
- `output_internal_item_id`
- `formula_type`: `component` or `finished_product`
- `version_name`
- `version_number`
- `status`: `draft`, `active`, `archived`
- `output_quantity`
- `output_unit`
- `expected_yield_quantity`
- `expected_yield_unit`
- `effective_from`
- `notes`

`formula_lines` stores input rows:

- `organisation_id`
- `formula_version_id`
- `input_internal_item_id`
- `line_order`
- `quantity`
- `unit`
- `preparation_state`
- `loss_note`
- `notes`

Both tables are tenant-owned and reference `internal_items` through same-tenant composite foreign keys.

## Current UI / Readiness Summary

Existing read-only formula visibility:

- `/components`
- `/components/[id]`
- `/finished-products`
- `/finished-products/[id]`
- `/component-costs`
- `/meal-margins`

Task 144 made Costings subpages read real formula readiness. These pages become more useful once Clean Eats component and finished product formulas are imported.

Current gaps:

- no formula import upload UI
- no workbook parser
- no formula import review queue
- no formula import batch/row provenance tables
- no production method/route schema
- no production area write flow from workbook data
- no sell price storage for finished product margin calculations

## Internal Item Dependencies

Formula imports must use `internal_items` only.

Relevant item types:

- `ingredient`
- `packaging`
- `component`
- `finished_product`
- `consumable`
- `equipment`

Supplier-facing `supplier_items` must not be written directly into formula lines. Supplier item descriptions can help matching only when they are clearly linked through `supplier_item_mappings`.

## Source Workbook / Template Mapping

Current source pack:

- `data-collection/clean-eats/formula-collection/component_batch_formulas.csv`
- `data-collection/clean-eats/formula-collection/finished_product_formulas.csv`
- `data-collection/clean-eats/formula-collection/production_methods_routes.csv`
- `data-collection/clean-eats/formula-collection/production_areas.csv`
- `data-collection/clean-eats/formula-collection/formula_collection_workbook_structure.md`

The staff-friendly workbook tabs are:

- Instructions
- Component / Batch Formulas
- Finished Product Formulas
- Production Methods / Routes
- Production Areas
- Examples and Notes

The Examples and Notes tab is reference-only and should not import by default.

## Component / Batch Formula Mapping

Component / Batch Formulas should map to:

- component name -> `internal_items.display_name` with `item_type = component`
- batch output quantity -> `formula_versions.output_quantity`
- output unit -> `formula_versions.output_unit`
- expected yield quantity -> `formula_versions.expected_yield_quantity`
- expected yield unit -> `formula_versions.expected_yield_unit`
- input item name -> matched `formula_lines.input_internal_item_id`
- input quantity -> `formula_lines.quantity`
- input unit -> `formula_lines.unit`
- preparation state -> `formula_lines.preparation_state`
- loss/yield notes -> `formula_lines.loss_note`
- staff notes/storage/shelf-life notes -> `formula_versions.notes` or `formula_lines.notes` after review

Known examples include:

- Italian Herb Chicken Breast
- Cooked Rice
- Bolognese Sauce

Example-only rows must be excluded unless explicitly approved by a reviewer.

## Finished Product Formula Mapping

Finished Product Formulas should map to:

- finished product name -> `internal_items.display_name` with `item_type = finished_product`
- selling unit/output quantity -> `formula_versions.output_quantity` and `formula_versions.output_unit`
- input item/component/packaging name -> matched `formula_lines.input_internal_item_id`
- quantity per selling unit -> `formula_lines.quantity`
- unit -> `formula_lines.unit`
- optional garnish/label/packaging note -> `formula_lines.notes`

Known examples include:

- Moroccan Chicken
- Naked Chicken

Finished product margin calculation remains blocked until sell price storage and costing rules exist.

Task 150 adds [Finished Product Formula Builder Plan](150-finished-product-formula-builder-plan.md), which confirms the manual builder should use the same schema targets and validation rules as future reviewed imports.

## Production Methods / Routes Mapping

Production Methods / Routes are not imported into current formula tables.

They should be treated as future method/route planning data:

- formula/component/product reference
- step number
- production area
- instruction
- equipment
- expected duration
- QA/checkpoint marker
- notes

These rows should be parsed and reviewed later only after method/route schema exists.

## Production Areas Mapping

Production Areas should be used for matching/readiness planning only until a reviewed write path exists.

Known Clean Eats area examples:

- Kitchen
- Prepack Room
- Packing Room
- Cool Room
- Freezer
- Dry Store
- Goods Inwards
- Dispatch Area
- Quarantine/Hold
- Waste

Existing inventory location data may help with matching, but production routing areas should be confirmed before any import writes.

## Proposed Import Workflow

Recommended stages:

1. Upload source file
2. Parse workbook or CSV tabs
3. Normalise rows
4. Group rows into formula headers and formula lines
5. Match line items to internal items, components, finished products and packaging
6. Validate formulas and production method references
7. Review import summary
8. Commit approved draft formula records
9. Show post-commit summary

Imports should create draft formula versions by default. Active formula versions should require explicit approval.

## Matching Rules

Component formula line matching order:

1. exact internal item friendly name
2. existing formula/component output name
3. normalised internal item name
4. known alias if alias support exists later
5. supplier item mapping if clearly linked
6. manual reviewer selection

Finished product formula line matching order:

1. exact component/formula name
2. exact internal item friendly name
3. existing finished product name if relevant
4. normalised name
5. manual reviewer selection

Rules:

- never auto-create unknown items without review
- never use `supplier_items` directly as formula inputs
- ambiguous matches require manual review
- packaging rows should map to `internal_items.item_type = packaging`
- raw ingredient rows should map to `internal_items.item_type = ingredient`
- component inputs should map to `internal_items.item_type = component`

## Unit Rules

Supported obvious unit variants can be normalised:

- `g`
- `kg`
- `each`
- `ea`
- `ml`
- `L`

Unsupported or ambiguous units should be flagged.

Do not silently convert complex units without an explicit conversion rule. Unit mismatch should block final costing readiness even if the formula can be saved as a draft.

## Validation Rules

Validation should catch:

- formula name required
- formula entity type required
- batch yield/output quantity required for component formulas
- yield/output unit required
- line item name required
- quantity required and positive
- unit required
- duplicate formula names flagged
- duplicate line numbers flagged
- unknown item match requires review
- unknown production area requires review
- component circular references blocked
- formula line cannot reference itself
- finished product cannot be margin-ready without sell price
- component cost cannot be final without all priced inputs
- packaging items should use packaging item type
- raw ingredient lines should map to ingredient item type

## Review / Approval Flow

Recommended review flow:

1. Confirm source scope and exclude example-only rows.
2. Resolve item matches.
3. Review formula groups.
4. Review validation issues.
5. Approve draft commit.
6. Review created formulas and deferred rows.

Reviewer options:

- match to existing internal item
- create new internal item in a future reviewed action
- defer formula
- ignore row
- mark example-only row as excluded
- approve draft formula commit

## Warnings And Errors

Warnings:

- unknown item
- ambiguous item match
- unsupported unit
- unit mismatch with approved supplier price
- unknown production area
- duplicate formula group
- existing active formula version found
- example-only row detected

Blocking errors:

- missing formula name
- missing output quantity or output unit
- missing line item name
- missing quantity or unit
- zero or negative quantity
- self-reference
- circular component reference
- unresolved input item at commit

## Future UI Routes

Potential future routes:

- `/formula-imports`
- `/formula-imports/new`
- `/formula-imports/[id]`
- `/formula-imports/[id]/review`
- `/formula-imports/[id]/commit`

These routes should remain tenant app routes, permission-gated by `formulas.manage` for write/commit actions.

## Future Server Actions

Potential future actions:

- uploadFormulaImportSourceAction
- parseFormulaImportSourceAction
- saveFormulaImportReviewDecisionAction
- validateFormulaImportAction
- commitFormulaImportDraftsAction

Commit actions should write only reviewed draft formulas and formula lines.

## Future Migration Needs

No migration is added in task 145.

Potential future migration, if implementation needs provenance:

- `formula_import_batches`
- `formula_import_rows`
- `formula_import_issues`
- source file path / filename
- uploaded_by_profile_id
- reviewed_by_profile_id
- committed_by_profile_id
- row-level source references
- review status
- validation severity

This should be reviewed separately before building import persistence.

## Effect On Costings

Once formulas are imported:

- `/component-costs` can show more complete formula readiness
- `/meal-margins` can show finished product input readiness
- missing ingredient/packaging prices become clearer
- margin calculation still remains blocked until sell price storage exists

Do not use formula import to create stock movements, production tasks or purchasing actions.

Task 146 adds [Component / Formula Builder v1](146-component-formula-builder-v1.md) before import work. Manual formulas created through the builder use the same `internal_items`, `formula_versions` and `formula_lines` tables that future reviewed imports should write to.

## Non-Goals

Task 145 does not build:

- formula upload UI
- parser actions
- import review UI
- formula import database rows
- formula write/commit action
- production routes/method schema
- sell price management
- costing rollup engine
- stock movements
- production tasks
- Supplier Invoice Intake changes
- Platform Admin changes

## Static Helper

Static import planning constants were added in:

- `lib/formula-import-plan.ts`

The helper contains source mappings, stages, validation rules and review steps only. It does not parse files or call Supabase.

## Next Task Recommendation

Recommended next task:

```text
Formula Import Batch / Review Schema Planning
```

Only build import persistence after reviewing whether source file, row-level issue tracking and auditability are required for Clean Eats formula import.
