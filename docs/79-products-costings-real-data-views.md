# Products and Costings Real Data Views

## Status

Products and Costings now have the first read-only views over records created by Purchase Document Intake.

This step does not add OCR, external extraction, stock movements, purchase orders, Goods Inwards, payment details, generic costing formulas, Platform Admin changes, RLS changes, service-role access or demo-user permissions.

## Views Connected

The following pages now read tenant-scoped Supabase data:

- `/suppliers`
- `/ingredients`
- `/packaging`
- `/price-history`
- `/ingredient-costs`

The pages remain read-only. They do not create, update or delete supplier, item, mapping, document or price records.

## Data Source

The views use `lib/products-data.ts`.

The helper reads from:

- `suppliers`
- `supplier_aliases`
- `supplier_items`
- `internal_items`
- `supplier_item_mappings`
- `purchase_documents`
- `price_observations`
- `approved_supplier_prices`

All data is scoped through the current organisation context and the existing authenticated Supabase server client.

## Permissions

These real data views use stricter invoice-derived data permissions:

- supplier and item catalogue views require `supplier_prices.view`
- price history and ingredient cost views require `supplier_prices.view`

This keeps `phase_1_demo_user` out of real supplier and price data because that role has Phase 1 module view permissions but not `supplier_items.view` or `supplier_prices.view`.

No new permissions are granted in this step.

## Expected Cammaroto Result

After the Cammaroto invoice is extracted, reviewed and committed:

- `/suppliers` should show Cammaroto Poultry / Surefire-linked supplier data
- `/ingredients` should show `Chicken Thigh`
- `/ingredient-costs` should show the approved current Cammaroto supplier price for Chicken Thigh
- `/price-history` should show approved price and invoice observation traceability

The supplier-facing description remains separate from the internal item name.

For the known invoice:

- supplier description: `THIGH FILLET NO SKIN DICEDMARINATED VAC PACK`
- internal item: `Chicken Thigh`

## Informational Lines

`CTNS` / `CARTONS` remains informational.

It should not appear in:

- `/ingredients`
- `/packaging`
- `/ingredient-costs`

This is because those pages read canonical `internal_items` and filter by item type. Informational invoice lines do not create internal ingredient or packaging records.

## Current Limitations

- No edit screens are added.
- No supplier contact management is added.
- No meal costing formulas are calculated.
- No purchase orders or receiving flows are created.
- No stock movement records are created.
- No generic invoice automation is added.
- Table rows are intentionally simple until the real data volume and review needs are clearer.

## Next Recommended Step

Verify the Cammaroto committed records as an admin user, then review which Product and Costing fields should become editable before expanding to another supplier pattern.
