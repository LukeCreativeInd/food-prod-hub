# Costings Dashboard Real Data Summary

## Status

The Costings landing page has been changed from sample dashboard content to a real read-only operational summary using current tenant data.

This task does not add a costing engine, recipe/formula rollups, batch cost calculations, finished meal margin calculations, supplier price editing, price approval workflows, manual price CRUD, purchase orders, stock valuation, Supplier Invoice Intake parser changes, Supplier Invoice Intake commit changes, Platform Admin changes, RLS changes or permission changes.

## Purpose

The Costings dashboard now helps Clean Eats review price-data readiness before deeper costing workflows are built.

It answers:

- how many current approved supplier prices exist
- how many recent invoice price observations exist
- how many priceable internal items have approved prices
- how many priceable internal items are missing approved prices
- how many supplier catalogue items have current approved prices
- where formula costing is not ready yet

## Data Sources Used

The dashboard reads existing tenant-scoped tables:

- `internal_items`
- `suppliers`
- `supplier_items`
- `approved_supplier_prices`
- `price_observations`
- `formula_versions`
- `formula_lines`

It does not read uploaded file contents, signed URLs, extracted invoice text or full purchase document payloads.

## Dashboard Sections Added

The Costings landing page now includes:

- top summary cards for approved prices, price observations, items with prices and missing prices
- price coverage by internal item type
- attention cards for missing internal item prices, supplier item price gaps and formula input price gaps
- formula readiness notes
- sample list of internal items missing approved price
- recent approved supplier prices
- recent invoice price observations
- quick links to existing Costings workspaces

## Formula Readiness Limitations

Formula tables are used only for readiness indicators:

- formula version count
- formulas with no lines
- distinct formula input items missing approved prices

No component, recipe, finished product or meal cost rollup is calculated.

Formula costing remains future work until formulas are entered and a reviewed rollup engine is designed.

## Permission And Access Behaviour

The route remains protected by:

- `costings.view`

Underlying tenant data is still governed by existing RLS and read permissions for supplier item, supplier price and formula reference data.

No new permissions were added.

## Demo User Behaviour

The phase 1 demo user can view the Costings dashboard if the existing demo role includes the required read permissions.

The dashboard is read-only. Demo users are not given supplier price management, price approval or price editing access.

## Supplier Invoice Intake Relationship

Supplier Invoice Intake remains the source of reviewed supplier catalogue, price observation and approved price records.

The Costings dashboard only summarises committed records. It does not:

- parse invoices
- commit invoice lines
- approve prices
- edit approved prices
- create supplier items
- create internal items
- create stock movements

## Future Costing Engine Relationship

This dashboard is a readiness surface for the future costing engine.

Future work can add reviewed calculations for:

- component formula costs
- finished product formula costs
- meal margins
- batch costs
- selling price comparisons
- price-change impact

Those workflows should remain separate from this read-only summary until the business rules are confirmed.

## Performance Considerations

The dashboard helper keeps queries lightweight:

- only summary fields are selected
- no uploaded document contents are loaded
- no signed storage URLs are created
- no source PDF previews are fetched
- no formula rollup detail is calculated

Development-only timing diagnostics were added for:

- `costings.dashboard-data`

The log includes safe counts and duration only.

## Non-Goals

Not included:

- costing engine
- recipe/formula rollups
- batch cost calculations
- finished meal margin calculations
- selling price management
- supplier price approval workflow
- supplier price edit forms
- manual price CRUD
- purchase order costing
- stock valuation
- inventory quantity valuation
- parser changes
- invoice intake changes
- Platform Admin costings management
- database summary views or RPCs

## Next Steps

Useful follow-up work:

- build real Production dashboard scaffold
- continue formula data capture and review
- review price approval requirements with Clean Eats
- design the first component formula cost rollup once formula data is trusted
