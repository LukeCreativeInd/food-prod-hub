# Formula Collection Workbook Structure

The CSV files in this folder are the repo/source version of the Clean Eats formula collection pack.

If Luke wants a staff-friendly XLSX workbook later, it should use the following tabs:

1. Instructions
2. Component / Batch Formulas
3. Finished Product Formulas
4. Production Methods / Routes
5. Production Areas
6. Examples

## Instructions Tab

The Instructions tab should explain:

- use names, not IDs
- leave blanks if unsure
- mark `Not sure / needs review` instead of guessing
- one row per formula input
- one row per production method step
- shared components should be defined once
- packaging should be included in finished product formulas where known
- Luke will review and clean data before system import

## Component / Batch Formulas Tab

Source CSV:

- `component_batch_formulas.csv`

Purpose:

- collect made component and batch formulas
- capture output quantity/unit
- capture input items and quantities
- capture yield/storage/shelf-life notes where known

## Finished Product Formulas Tab

Source CSV:

- `finished_product_formulas.csv`

Purpose:

- collect per-meal or per-selling-unit formula lines
- include Ingredients, Components and Packaging
- capture quantity per unit and required/optional status

## Production Methods / Routes Tab

Source CSV:

- `production_methods_routes.csv`

Purpose:

- collect how and where items are made
- one row per method step
- keep method separate from formula quantities

## Production Areas Tab

Source CSV:

- `production_areas.csv`

Purpose:

- collect facility area names and usage
- support later production route setup

## Examples Tab

The Examples tab can repeat or explain the example rows from the CSV files.

Examples should remain clearly labelled as examples only so staff do not mistake them for approved Clean Eats data.
