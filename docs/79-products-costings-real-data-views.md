# Products and Costings Real Data Views

## Status

Products and Costings now have the first read-only views over records created by Purchase Document Intake.

This step does not add OCR, external extraction, stock movements, purchase orders, Goods Inwards, payment details, generic costing formulas, Platform Admin changes, RLS changes, service-role access or demo-user permissions.

Step 081 later drafts a narrow permission migration so the Phase 1 demo role can view these read-only Products and Costings records without receiving Purchase Document Intake access.

## Views Connected

The following pages now read tenant-scoped Supabase data:

- `/suppliers`
- `/ingredients`
- `/packaging`
- `/price-history`
- `/ingredient-costs`

The pages remain read-only. They do not create, update or delete supplier, item, mapping, document or price records.

Step 082 adds read-only detail pages so supplier and internal item rows can be inspected in context:

- `/suppliers/[id]`
- `/internal-items/[id]`

Step 083 plans the next data layer: component and finished product formula modelling built on `internal_items`. The real-data views remain the inspection layer for supplier, raw ingredient and approved price foundations before formulas are created.

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

These real data views use invoice-derived read permissions:

- page helpers require `supplier_prices.view` for these real-data views
- RLS uses `supplier_items.view` for supplier/item catalogue records
- RLS uses `supplier_prices.view` for price observation and approved price records

Migration 021 grants `phase_1_demo_user` only:

- `supplier_items.view`
- `supplier_prices.view`

after manual Supabase review/application. It does not grant Purchase Document Intake or write/manage permissions.

## Expected Cammaroto Result

After the Cammaroto invoice is extracted, reviewed and committed:

- `/suppliers` should show Cammaroto Poultry / Surefire-linked supplier data
- Cammaroto Poultry should link to `/suppliers/[id]`
- `/ingredients` should show `Chicken Thigh`
- `Chicken Thigh` should link to `/internal-items/[id]`
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
