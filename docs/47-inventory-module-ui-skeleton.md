# Inventory Module UI Skeleton

## Status

Step 047 has created the Inventory module UI skeleton using safe sample data only.

No database migrations, Supabase changes, RLS changes, route guard changes, permission changes, enabled-module filtering changes, real inventory queries, stock movement logic, purchasing logic, BOM calculations or traceability writes were added.

## Pages Added or Updated

- `/inventory`: Inventory overview/module dashboard.
- `/goods-inwards`: Goods inwards and supplier delivery preview.
- `/batch-receiving`: Batch/lot receiving preview.
- `/stock-locations`: Facility storage and location preview.
- `/stock-movements`: Stock movement preview.
- `/purchasing`: Purchasing and reorder prompt preview.
- `/bom-traceability`: BOM and traceability preview.

## Sample Data Included

The skeleton uses placeholder rows and counts for:

- supplier deliveries
- receiving checks
- supplier batches/lots
- received dates
- expiry/use-by dates
- storage locations
- stock movements
- production issue destinations
- low-stock and purchasing prompts
- supplier lead time review
- BOM/traceability paths
- component and recipe usage examples
- finished product traceability examples

Example sample items include Chicken Thigh, Basmati Rice, Sweet Potato, Meal Tray, Meal Sleeves, Napoli Sauce, Chicken Mix, Rice Batch, Chicken Fajita Bowl, Shepherd's Pie and Burrito Bowl.

## Inventory Is More Than Stock On Hand

The Inventory module is being previewed as a broader operational layer, not just a stock count screen.

Future inventory needs to support:

- receiving stock and goods inwards
- supplier batches/lots
- received dates
- expiry/use-by dates where applicable
- supplier references, invoices and delivery notes
- storage locations
- movement between storage and production areas
- material issue to kitchen and production work
- material consumption into components and recipes
- finished product output
- BOM and traceability visibility
- purchasing and reorder prompts

## Flow Represented

The UI skeleton previews this future flow:

supplier delivery -> goods inwards -> batch receipt -> storage location -> stock movement -> kitchen/production issue -> component/batch recipe -> recipe -> finished product -> traceability view

## Goods Inwards and Batch Receiving

`/goods-inwards` previews supplier deliveries and receiving checks.

`/batch-receiving` previews batch/lot capture, received dates, expiry/use-by fields, quantity and storage location fields.

These screens do not receive stock, validate supplier references, create batches or write to a database.

## Stock Locations and Movements

`/stock-locations` previews the facility location model, including Dry Store, Cool Room, Freezer, Kitchen Prep, Pre-Pack Room and Finished Goods Fridge.

`/stock-movements` previews stock movement rows from storage into kitchen, packing and production areas.

These screens do not move stock, reserve stock, consume stock or write movement history.

## Purchasing

`/purchasing` previews low-stock prompts, supplier review, suggested reorder quantities, lead times and missing supplier/cost prompts.

This screen does not calculate reorder points, create purchase orders, call supplier APIs or run purchasing logic.

## BOM / Traceability

`/bom-traceability` previews how incoming batches may later connect to components, recipes and finished products.

Sample paths include:

- Chicken Thigh batch -> Chicken Mix -> Chicken Fajita Bowl Recipe -> Chicken Fajita Bowl
- Sweet Potato batch -> Sweet Potato Mash -> Shepherd's Pie Recipe -> Shepherd's Pie
- Basmati Rice batch -> Rice Batch -> Burrito Bowl Recipe -> Burrito Bowl
- Meal Tray batch -> Packaging -> Finished Products

This screen does not calculate BOMs, consume stock, create traceability records or query production data.

## Future Module Connections

Inventory may later feed:

- Production, through stock issues and material consumption.
- Costings, through current ingredient and packaging costs.
- Products, through ingredients, packaging, components, recipes and finished products.
- QA, through receiving checks, holds and corrective actions.
- Reports, through stock, purchasing and traceability visibility.

## Intentionally Not Connected Yet

- No inventory tables.
- No live Supabase inventory data.
- No real Clean Eats stock imported.
- No stock movement logic.
- No purchasing logic.
- No purchase orders.
- No supplier API integration.
- No BOM calculations.
- No traceability writes.
- No production consumption logic.
- No additional RLS policies.

## Auth, Routing and Security

Existing behaviour is preserved:

- Inventory pages are still protected through the existing app access flow.
- Sidebar module filtering remains enabled-module-aware.
- Permission rules were not changed.
- Route protection was not changed.
- RLS behaviour was not changed.

## Next Step

Recommended next step:

**048 - Demo/Test User Access Plan**

Plan the staff demo/test user experience now that the Phase 1 sample UI modules for Products, Costings, Production and Inventory exist.
