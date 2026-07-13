# Clean Eats Formula Collection Pack

## Purpose

This pack helps Clean Eats staff capture the formula and production knowledge that supplier invoices cannot provide.

Invoice intake can now help collect supplier names, supplier item codes, supplier descriptions, purchase units, invoice prices and basic price history. Staff do not need to manually build bulk supplier catalogue and price lists where invoices exist.

Staff should now focus on:

- component and batch formulas
- finished product formulas
- production methods and route steps
- production areas
- notes, checks, handoffs and unclear items

## Files In This Pack

- `component_batch_formulas.csv`
- `finished_product_formulas.csv`
- `production_methods_routes.csv`
- `production_areas.csv`
- `formula_collection_workbook_structure.md`

## How To Fill These In

- Use names, not database IDs.
- Leave blanks if unsure.
- Use the `Not sure / needs review` column instead of guessing.
- Use one row per formula input.
- Use one row per production method step.
- Define shared components once, then reference the same component name in finished products.
- Include packaging in finished product formulas where known.
- Use the current best-known standard process.
- Add notes where recipes vary or where staff disagree.
- Do not worry about exact system formatting.

## Examples

The CSV files include example rows at the top.

These rows are marked `Example only` or `Yes` in the review column. They are guides only. Staff can replace, delete or edit them once the real Clean Eats data is ready.

## Review Before Import

These files are not final import data.

Luke should review and clean the completed files before anything is turned into system records. The review should confirm:

- item names are consistent
- shared components are not duplicated for every meal
- food ingredients and packaging are separated clearly
- quantities and units make sense
- unclear rows are marked for review
- formula and method notes are kept separate from quantities

## What To Leave Blank

It is fine to leave these blank if staff are unsure:

- yield
- storage notes
- shelf-life notes
- exact time guidance
- temperature/check guidance
- equipment
- cleaning/changeover notes

Blank is better than guessing.
