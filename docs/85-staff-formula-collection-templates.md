# Staff Formula Collection Templates

## Status

Initial staff-friendly formula collection templates have been created.

This task creates CSV and markdown collection files only. It does not create migrations, Supabase changes, RLS changes, permissions, app UI, formula screens, production route screens, stock movements, purchase orders or integrations.

## Folder Path

The collection pack lives at:

```text
data-collection/clean-eats/formula-collection/
```

## Files Created

- `README.md`
- `component_batch_formulas.csv`
- `finished_product_formulas.csv`
- `production_methods_routes.csv`
- `production_areas.csv`
- `formula_collection_workbook_structure.md`

## Purpose

The templates help Clean Eats staff capture operational knowledge that invoice intake cannot provide.

Invoice intake can help with supplier, catalogue and price data. Staff should now focus on:

- component / batch formulas
- finished product formulas
- production methods / routes
- production areas
- unclear items and operational notes

## Column Structure

### Component / Batch Formulas

Captures made components and batch items.

Key fields:

- Component name
- Component category/type
- Version/status
- Standard batch output quantity
- Output unit
- Expected yield quantity/unit
- Input item name
- Input type if known
- Input quantity/unit
- Preparation state
- Loss/yield notes
- Storage and shelf-life notes
- Staff notes
- Not sure / needs review

### Finished Product Formulas

Captures per-meal or per-selling-unit formulas.

Key fields:

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

### Production Methods / Routes

Captures how and where work happens.

Key fields:

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

### Production Areas

Captures facility area names and usage.

Key fields:

- Area name
- Area type
- Description
- Used for
- Active yes/no
- Notes
- Not sure / needs review

## Example-Row Approach

Each CSV includes sample rows at the top.

The examples are clearly marked with:

- `Example only`
- `Yes` in `Not sure / needs review`
- staff notes explaining that values must be confirmed

Examples are guides only. Staff can replace, delete or edit them.

## What Staff Need To Complete

Staff should complete:

- real component names
- real finished product names
- input item names
- quantities and units where known
- production steps and areas
- notes for unclear formulas, variations, yields or checks

## What Staff Can Leave Blank

Staff can leave blanks for:

- exact yields
- storage notes
- shelf-life notes
- equipment
- times
- temperatures
- cleaning/changeover notes
- any field they are unsure about

They should mark `Not sure / needs review` rather than guessing.

## Luke Review Before Import

Before anything becomes system data, Luke should review:

- duplicate component names
- inconsistent item names
- unclear units
- missing required quantities
- items that do not yet exist as internal items
- packaging mixed into food ingredient rows
- formulas that vary by production day or customer
- example rows that need deleting or replacing

## Mapping To Formula Schema

Migration 022 drafts the future schema target:

- component and finished product headers map to `formula_versions`
- input rows map to `formula_lines`
- item names will later be matched to `internal_items`

No import has been built yet. The templates remain staff collection files until Luke reviews and cleans them.

## Next Recommended Task

087 - Component Formula UI Scaffold.

Only proceed after Migration 022 is reviewed/applied and Luke/staff confirm the collection fields are good enough.
