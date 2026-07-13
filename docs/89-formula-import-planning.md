# Formula Import Planning

## Planning Status

This is planning only.

No import code is built yet. No UI, migrations, RLS changes, permission changes or Supabase operations are made by this step.

The goal is to define the future reviewed import workflow before Clean Eats returns formula data.

## Purpose

Formula import will turn staff-provided collection data into trusted formula records.

It should support:

- component formulas
- finished product formulas
- input item matching
- formula version creation
- formula line creation
- unresolved item review
- validation before commit

It should not blindly import the workbook. The staff workbook is a collection tool, not final clean database import data.

## Source Files

Current source templates live in:

```text
data-collection/clean-eats/formula-collection/
```

Templates:

- `component_batch_formulas.csv`
- `finished_product_formulas.csv`
- `production_methods_routes.csv`
- `production_areas.csv`

The initial formula import should focus only on:

- `component_batch_formulas.csv`
- `finished_product_formulas.csv`

Production methods/routes and areas should be handled later.

## Import Philosophy

Staff templates are collection inputs, not trusted imports.

Luke/platform admin should review and clean the data first.

The import should be staged:

```text
Upload/Load Template
-> Parse Rows
-> Match Internal Items
-> Review Issues
-> Preview Formula Records
-> Commit Approved Formulas
-> Show Import Result
```

## Component Formula Import Flow

Input:

```text
component_batch_formulas.csv
```

Rows should be grouped by:

- Component name
- Version/status
- Standard batch output quantity
- Output unit

For each group:

- create or reuse an `internal_items` row with `item_type = component`
- create a `formula_versions` row with `formula_type = component`
- create `formula_lines` for each input item

Input items should match existing `internal_items` by `display_name` and `item_type` where possible.

If no match is found, create an unresolved item issue rather than silently creating a trusted item.

Reviewer choices:

- match to existing internal item
- create new internal item
- defer row
- ignore row

## Finished Product Formula Import Flow

Input:

```text
finished_product_formulas.csv
```

Rows should be grouped by:

- Finished product name
- Version/status
- Selling unit / output quantity

For each group:

- create or reuse an `internal_items` row with `item_type = finished_product`
- create a `formula_versions` row with `formula_type = finished_product`
- create `formula_lines` for each ingredient/component/packaging input

Inputs may be:

- ingredient
- component
- packaging
- consumable/other later

Unmatched inputs should become review issues.

## Internal Item Matching Rules

Recommended matching order:

1. exact `display_name` within the same organisation
2. normalised display name
3. item type + normalised name
4. known supplier/internal mapping if relevant
5. manual reviewer selection

Rules:

- `supplier_items` should not be formula inputs.
- formulas must use `internal_items` only.
- if staff uses a supplier description by mistake, flag it for review.
- do not automatically create raw Ingredients from formula text unless reviewer confirms.
- packaging inputs should be `internal_items` with `item_type = packaging`.

## Formula Version Rules

Rules:

- formula import creates draft versions by default.
- active status should require explicit review/approval.
- only one active formula version per output item is allowed.
- if an active formula exists, importing a new formula should create a draft replacement, not overwrite the active version.
- old formula versions must remain for traceability.

Recommended default:

Imported formulas start as `draft` until Luke/Clean Eats confirms.

## Formula Line Rules

Rules:

- one row becomes one formula line.
- `line_order` should follow source row order within the formula group.
- quantity and unit are required.
- `preparation_state`, `loss_note` and `notes` are optional.
- `input_internal_item_id` must be resolved before commit.
- quantity must be greater than zero.
- unit must be present.

## Validation Rules

Before commit, validate:

- formula output item exists or is approved to create
- formula type is `component` or `finished_product`
- output quantity is greater than zero
- output unit is present
- at least one input line exists
- every formula line has resolved `input_internal_item_id`
- every quantity is greater than zero
- every unit is present
- no obvious self-reference
- no duplicate `line_order` within formula
- no accidental `supplier_item` usage
- active version conflict is handled

## Review Issues

Potential issues:

- missing component/product name
- missing output quantity/unit
- missing input item name
- input item not found
- input type unclear
- quantity missing or zero
- unit missing
- duplicate formula group
- possible existing active formula
- possible self-reference
- packaging/ingredient confusion
- row marked Not sure / needs review

Review actions:

- resolve item match
- create new internal item
- change item type
- defer row/formula
- ignore example-only row
- mark reviewed

## Example Rows Handling

Staff workbook includes example-only rows.

Import must:

- detect or let reviewer filter out example-only rows
- never import example rows as real data unless explicitly approved
- treat `Version/status = Example only` as non-importable by default

## Import Result

After commit, show:

- formulas created
- formula lines created
- internal items created/reused
- rows ignored
- rows deferred
- unresolved issues
- active/draft versions created

## Permissions

Future import should require:

- `formulas.manage`
- possibly `products.manage` or `internal_items.manage` if creating new internal items

Read-only review can use:

- `formulas.view`

Phase 1 demo user:

- can view imported formulas once committed/draft visible
- cannot import or manage

## Audit and Provenance

Future import should record:

- source file name
- uploaded by
- reviewed by
- committed by
- imported at
- row/source references
- decisions made

Potential future tables:

- `formula_import_batches`
- `formula_import_rows`

Do not create these yet. They may be useful before implementation because reviewed import needs provenance and issue tracking.

## Data Model Fit

Import output mapping:

- Component name -> `internal_items` with `item_type = component`
- Finished product name -> `internal_items` with `item_type = finished_product`
- Formula group -> `formula_versions`
- Formula input row -> `formula_lines`
- Input item name -> `internal_items`
- Production method rows -> future `production_route_versions` / steps
- Production areas -> future `production_areas`

## Non-Goals

Formula import should not:

- calculate final costs yet
- consume stock
- create production runs
- create purchase orders
- import production routes in the first formula import
- import QA checks
- overwrite active formulas silently
- expose write actions to demo user

## Recommended Implementation Phases

### Phase 1 - Import Planning

Current document.

### Phase 2 - Formula Import Schema Support If Needed

Decide whether `formula_import_batches` and `formula_import_rows` are needed.

### Phase 3 - Parser / Review UI Scaffold

- upload CSV/XLSX
- parse rows
- show issues
- no commit yet

### Phase 4 - Commit Reviewed Formulas

- create `internal_items`
- create `formula_versions`
- create `formula_lines`
- use draft status by default

### Phase 5 - Cost Rollup Planning

Use formulas plus approved supplier prices after formula data quality is trusted.

### Phase 6 - Production Route Import / Planning

Methods and areas should come after formulas.

## Recommended Next Task

Recommended:

```text
090 - Formula Import Batch Schema Planning
```

Alternative, if wanting to build UI first:

```text
090 - Formula Import Review UI Scaffold
```

Recommendation: plan import batch/row tracking first, because reviewed import needs provenance and issue tracking.

## Short Executive Summary

Formula import should be a reviewed, staged process that turns staff collection templates into draft formula versions and formula lines using `internal_items` only. It should not blindly import the workbook, overwrite active formulas or create production/stock/costing records. The first import should focus on component and finished product formulas only, with production methods and areas handled later.
