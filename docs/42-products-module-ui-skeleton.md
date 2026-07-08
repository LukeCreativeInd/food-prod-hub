# Products Module UI Skeleton

## Status

Step 042 has created the first Products module UI skeleton using safe sample data only.

No database migrations, Supabase changes, RLS changes, route guard changes, permission changes, business logic, real Products queries or real Clean Eats imports were added.

## Pages Added or Updated

- `/products`: Products overview/module dashboard.
- `/ingredients`: Ingredients workspace.
- `/components`: Components, batch recipes and mixes workspace.
- `/meals`: Meals/finished products workspace.
- `/packaging`: Packaging workspace.
- `/suppliers`: Suppliers workspace.

## Sample Data Included

The skeleton uses placeholder rows and counts for:

- ingredients such as Chicken Thigh, Basmati Rice, Sweet Potato, Napoli Sauce and Roast Chicken Mix
- generic suppliers such as Fresh Produce Supplier, Poultry Supplier, Packaging Supplier and Dry Goods Supplier
- packaging items such as Meal Sleeve, Meal Tray, Carton, Label and Sauce Container
- components such as Sweet Potato Mash, Chunky Salsa, Napoli Sauce, Chicken Mix and Rice Batch
- sample Clean Eats-style meals such as Chicken Fajita Bowl, Naked Chicken Parma, Spaghetti Bolognese, Burrito Bowl and Shepherd's Pie

These records are for screen review only. They are not imported Clean Eats data.

## Terminology for Staff Review

Tony/team should review:

- Products vs Meals vs Finished Meals
- Components vs Batch Recipes vs Mixes
- which ingredient categories are useful
- whether packaging belongs in Products, Inventory or both
- which supplier fields matter daily
- which missing-cost, missing-supplier and QA/allergen prompts should appear first
- which fields should be visible to staff versus managers

## Intentionally Not Connected Yet

- No product tables were created.
- No ingredient, supplier, packaging, component or meal tables were created.
- No live Supabase product queries were added.
- No real Clean Eats product data was imported.
- No costing logic was added.
- No production, inventory or QA business workflows were added.
- No write policies or product RLS policies were added.

## Shared UI Patterns Added

Small presentational Products skeleton helpers were added:

- `components/products/products-workspace-page.tsx`
- `components/products/sample-data-table.tsx`

These keep the Products pages visually consistent while staying sample-data-only.

## Auth, Routing and Security

Existing behaviour is preserved:

- Products pages are still protected through the existing app access flow.
- Sidebar module filtering remains enabled-module-aware.
- Permission rules were not changed.
- Route protection was not changed.
- RLS behaviour was not changed.

## Next Step

Recommended next step:

**043 - Staff Review Pack / Products Terminology Review**

The Products skeleton should be reviewed with Tony/team before real database tables or real Clean Eats imports are created.

The staff review pack now exists at [Staff Review Pack - Products/UI Foundation](43-staff-review-pack-products-ui.md).

## 042 Follow-Up: Products Structure Aligned To Staff Meeting

The Products module skeleton has been aligned to the agreed staff meeting CSV/data collection order:

1. Suppliers
2. Ingredients
3. Packaging
4. Components and Batch Recipes / Items
5. Recipes
6. Finished Product

Products navigation now shows:

- Suppliers
- Ingredients
- Packaging
- Components
- Recipes
- Finished Products

`Recipes` and `Finished Products` have been added as sample UI pages:

- `/recipes`
- `/finished-products`

`Meals` is no longer the visible Products navigation label for now. The existing `/meals` route remains as a legacy placeholder but is no longer shown in the Products sidebar.

No real product data, database tables, Supabase queries, calculations or imports were added. This follow-up keeps the Products UI skeleton aligned with the source CSV/data collection structure before database modelling begins.
