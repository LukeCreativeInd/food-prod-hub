# Costings Subpages Real Data Pass

Task 144 updates the Costings subpages so they use real tenant-scoped data where available instead of static demo rows.

## Pages Updated

- `/ingredient-costs`
- `/packaging-costs`
- `/component-costs`
- `/meal-margins`
- `/price-history`

The tenant app navigation was not changed. The current app routes remain the existing top-level Costings subpage routes.

Legacy nested routes now redirect to the active routes:

- `/costings/ingredient-costs` -> `/ingredient-costs`
- `/costings/packaging-costs` -> `/packaging-costs`
- `/costings/component-costs` -> `/component-costs`
- `/costings/meal-margins` -> `/meal-margins`
- `/costings/price-history` -> `/price-history`

## Shared Data Helper

New helper:

- `lib/costings-subpage-data.ts`

The helper reads tenant-scoped records through the authenticated Supabase server client and current RLS policies. It does not use service-role keys and does not write data.

Data sources used:

- `internal_items`
- `supplier_items`
- `supplier_item_mappings`
- `approved_supplier_prices`
- `price_observations`
- `purchase_documents`
- `suppliers`
- `formula_versions`
- `formula_lines`

## Ingredient Costs

Ingredient Costs now reads real `internal_items` where `item_type = ingredient`.

It shows internal item name, supplier item details, approved supplier price where available, unit, effective date, source invoice context and mapping status.

Missing price and missing mapping states are shown clearly.

## Packaging Costs

Packaging Costs now reads real `internal_items` where `item_type = packaging`.

It follows the same pattern as Ingredient Costs and no longer uses static packaging examples.

## Component Costs

Component Costs now reads real component `formula_versions` and `formula_lines`.

It shows formula status, output quantity/unit, line count, priced line count, missing priced inputs and readiness state.

Estimated component cost is shown only when every formula line has a current approved price in the same unit as the formula line. Broader conversion, yield and loss rules remain future work.

## Meal Margins

Meal Margins now reads real finished product formula data where available.

It does not fake sell prices or margins. Because sell price storage is not currently part of the schema, the page shows:

- `Sell price not stored yet`
- `Margin pending sell price`

This keeps the page useful for readiness review without inventing commercial data.

## Price History

Price History now reads real `price_observations` and current approved price context.

It shows supplier, supplier item, mapped internal item where available, observed price, current approved price where available, source invoice context, approval decision and basic change compared with the previous visible observation for the same supplier item when safely derivable.

## Tenant Safety

All queries are scoped to the current organisation id from the authenticated membership context. RLS remains active and respected. No Platform Admin tenant data is used in tenant Costings pages.

## Performance Notes

The helper uses a small set of tenant-scoped queries and joins the current datasets in memory. This is acceptable for the current Phase 1 data size. A later optimisation can introduce SQL views or RPC helpers if tenant datasets become large.

## Not Included

This task does not add:

- database migrations
- approved price editing
- manual cost overrides
- formula builder changes
- formula import
- sell price management
- margin rule configuration
- GST/tax logic
- purchasing actions
- stock valuation
- batch costing engine
- Platform Admin changes

Task 145 adds [Component / Formula Import Foundation Plan](145-component-formula-import-foundation-plan.md), which describes how future formula imports can improve Component Costs and Meal Margins readiness without changing task 144 Costings logic.

## Follow-Up Fix Before Commit

The shared Costings page wrapper no longer renders a second large content title/hero. Page titles remain in the persistent app header, and page content starts with summary cards and real-data sections.
