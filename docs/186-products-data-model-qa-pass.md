# Products Data Model QA Pass

Task 186 reviews the current Products, Formulas, Costings and support-context foundation before deeper inventory and production workflows are built.

This pass does not create migrations, change RLS, change permissions, import data, create stock movements, build purchasing receiving, or alter production logic.

## Overall Verdict

The current Products data model is suitable for the next UI and data-entry polish phase, with medium operational risk before inventory and production are allowed to depend on it.

The important architectural choice is consistent:

- supplier-facing purchasing data lives in `suppliers`, `supplier_aliases`, `supplier_items`, `purchase_documents`, `purchase_document_lines`, `price_observations` and `approved_supplier_prices`
- Clean Eats canonical product/catalogue data lives in `internal_items`
- ingredients and packaging are `internal_items.item_type = ingredient` and `internal_items.item_type = packaging`
- components are `internal_items.item_type = component`
- finished products are `internal_items.item_type = finished_product`
- formulas use `formula_versions.output_internal_item_id` for the output item and `formula_lines.input_internal_item_id` for inputs
- finished product sell prices live separately in `finished_product_sell_prices`

No separate live `recipes` table exists yet. The Recipes page now acts as a signpost to Components and Finished Products instead of showing fake sample recipe rows.

## Current Model Audit

| Area | Tables / data sources | UI routes | User actions | Permissions | Readiness | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| Suppliers | `suppliers`, `supplier_aliases` | `/suppliers`, `/suppliers/[id]` | view, create, edit | `supplier_items.view`, `supplier_items.manage` | Real tenant data | Low |
| Supplier items | `supplier_items`, `supplier_item_mappings` | supplier detail, internal item detail, cost pages | view through Products/Costings and intake commit | `supplier_items.view`, `supplier_items.manage` | Real tenant data | Medium |
| Internal items | `internal_items` | `/internal-items`, `/internal-items/[id]`, `/ingredients`, `/packaging`, `/components`, `/finished-products` | view, manual create/edit for authorised users | `supplier_items.view`, `supplier_items.manage`; formulas use `formulas.*` | Real tenant data | Medium |
| Ingredients | `internal_items.item_type = ingredient`, approved prices | `/ingredients`, `/ingredient-costs` | view, create/edit item shell, review cost coverage | supplier item/internal item permissions | Real data with costing blockers | Medium |
| Packaging | `internal_items.item_type = packaging`, approved prices | `/packaging`, `/packaging-costs` | view, create/edit item shell, review cost coverage | supplier item/internal item permissions | Real data with costing blockers | Medium |
| Components | `internal_items.item_type = component`, `formula_versions`, `formula_lines` | `/components`, `/components/[id]`, `/component-costs` | view, create/edit formula header and lines if allowed | `formulas.view`, `formulas.manage` | Real formula builder | Medium |
| Recipes | no separate table | `/recipes` | signpost only | route protected by module/permission shell | Scaffold only | Medium |
| Finished products | `internal_items.item_type = finished_product`, formulas, sell prices | `/finished-products`, `/finished-products/[id]` | view, create/edit formula header and lines if allowed | `formulas.view`, `formulas.manage` | Real formula builder | Medium |
| Formula versions | `formula_versions` | component and finished product detail pages | create/update/soft archive through actions | `formulas.view`, `formulas.manage` | Real tenant data | Medium |
| Formula lines | `formula_lines` | component and finished product detail pages | add/edit/remove lines | `formulas.view`, `formulas.manage` | Real tenant data | Medium |
| Approved supplier prices | `approved_supplier_prices` | `/ingredient-costs`, `/packaging-costs`, `/component-costs`, `/price-history`, supplier/internal item details | view through cost pages; commit from reviewed intake | purchase document and supplier item permissions | Real cost source | Medium |
| Sell prices | `finished_product_sell_prices` | `/sell-prices`, `/meal-margins` | view/create/edit/archive if allowed | `sell_prices.view`, `sell_prices.manage` | Real foundation | Medium |
| Meal margins | formulas, approved input prices, `finished_product_sell_prices` | `/meal-margins` | read-only preview | costings/sell price visibility | Conservative real calculation | Medium |
| Price history | `price_observations`, `approved_supplier_prices` | `/price-history` | read-only | supplier/costing visibility | Real tenant data | Low |

## Taxonomy Findings

- Ingredients and packaging are correctly represented as canonical `internal_items` instead of separate siloed product tables.
- Components and finished products use the same canonical item table with different `item_type` values.
- Supplier descriptions remain supplier-facing and do not overwrite internal item display names.
- Recipes are currently terminology, not a separate data entity. That is acceptable while formulas are the active structure, but it should be settled before production batch records reference recipe language.
- Products, Costings and sidebar labels mostly align. The support-context mapping needed one cleanup so nested component/finished-product pages map to formulas rather than generic products.

## Formula Relationship Findings

The actual schema relationship is:

```text
internal_items.id
  <- formula_versions.output_internal_item_id

formula_versions.id
  <- formula_lines.formula_version_id

internal_items.id
  <- formula_lines.input_internal_item_id
```

Both `formula_versions` and `formula_lines` carry `organisation_id`, and the migration uses composite tenant foreign keys to keep output/input items and lines in the same organisation.

Formula cost readiness is deliberately conservative:

- input lines must reference internal items
- input items need approved supplier prices where applicable
- units must be compatible enough for the current calculation
- missing prices and unit mismatches block costing instead of inventing values
- component formulas can feed finished product formulas, but snapshotting is still future work

Known formula gaps before real operations:

- self-reference prevention remains server/app validation rather than a database trigger
- cooked/raw/yield/loss handling is not fully modelled
- method steps, work areas, equipment and production instructions are not part of formula lines yet
- costing snapshots are not stored yet

## Supplier And Pricing Findings

Supplier Invoice Intake has the correct separation of concerns:

- `suppliers` stores tenant supplier master records
- `supplier_aliases` supports invoice/legal/trading-name matching
- `supplier_items` stores supplier-facing catalogue descriptions and item codes
- `supplier_item_mappings` links supplier items to canonical internal items
- `price_observations` preserves observed invoice line prices
- `approved_supplier_prices` stores reviewed current supplier-side cost references

Supplier item code uniqueness is scoped to tenant and supplier, which is practical for early invoice data. Approved supplier prices and duplicate invoice detection remain safe enough for current reviewed intake, but will need stricter workflow decisions before receiving and stock valuation.

## Finished Product And Margin Findings

Finished product margin readiness depends on:

- `internal_items.item_type = finished_product`
- an active finished product formula
- cost-ready formula inputs
- compatible units
- an active, non-archived current sell price from `finished_product_sell_prices`
- AUD/tax assumptions that the current conservative calculation can handle

Draft sell prices are allowed as candidates but do not count as margin-ready. Archived sell prices do not count. The Finished Products page copy has been updated so it no longer says sell price storage is missing.

Task 187 follows this QA pass with Finished Product data-entry polish. `/finished-products` and `/finished-products/[id]` now show clearer real-data readiness for formula, cost, active current sell price and margin setup, while keeping production readiness labelled as future.

Task 188 follows with Component Formula Builder polish. `/components` and `/components/[id]` now use clearer component-first wording, component detail fields, input-line guidance, cost blocker actions and links to Component Costs, Ingredient Costs, Packaging Costs and Finished Products.

## Permission And Module QA

Current permission shape is appropriate for the current build:

- `supplier_items.view` supports supplier/internal item read flows
- `supplier_items.manage` supports supplier/internal item manual management
- `formulas.view` and `formulas.manage` control component and finished product formula access
- `sell_prices.view` and `sell_prices.manage` control sell price management
- phase 1 demo access remains read-oriented for real data views where seeded
- Platform Admin remains separate from tenant navigation

Risk to review later: supplier item and internal item permissions are doing a lot of work. A future task may split `internal_items.view/manage` from supplier catalogue permissions once data entry grows.

## Support Context Mapping

The Help menu context now maps more specific Products and Costings routes before broad parent routes:

- `/ingredients` and `/products/ingredients` -> `products`
- `/packaging` and `/products/packaging` -> `products`
- `/suppliers` and `/products/suppliers` -> `products`
- `/components` and `/products/components` -> `components`, category `formulas`
- `/recipes` and `/products/recipes` -> `recipes`, category `formulas`
- `/finished-products` and `/products/finished-products` -> `finished_products`, category `formulas`
- `/meal-margins` and `/costings/meal-margins` -> `meal_margins`, category `costings`
- `/sell-prices` and `/costings/sell-prices` -> `sell_prices`, category `costings`
- `/purchase-documents`, `/tools/purchase-documents` and `/tools/supplier-invoice-intake` -> `supplier_invoice_intake`

This helps support tickets land with more useful product/formula/costing context without adding new ticket categories or database changes.

## Dummy / Demo / Scaffold Cleanup

Cleaned in this pass:

- `/recipes` no longer shows fake recipe counts or sample recipe table rows.
- `/recipes` now clearly says no separate recipe records are connected and points users to the real formula builders.
- `/finished-products` no longer says margin is blocked because sell price storage does not exist.

Still acceptable:

- clearly labelled “Example only - not saved data” blocks on formula scaffold pages can remain as secondary visual examples.
- empty/readiness states are acceptable where real data is not yet available.

## Admin And Support Impact

Platform Admin is not changed by this task except for support inbox filter labels being able to show more specific module keys. Support ticket creation gets better page context for formula/costing pages. No support ticket schema, RLS, workflow or attachment behaviour changes are included.

## Cross-Module Impact

Products, Costings, Supplier Invoice Intake, Formulas, Sell Prices and Meal Margins are now aligned around canonical internal items. Inventory and Production should not yet depend on these records as trusted operational stock/formula execution data until the known gaps below are addressed.

## Known Gaps Before Real Operations

- product/item status lifecycle and approval workflow
- unit-of-measure standardisation and conversion rules
- supplier/internal mapping confidence and review workflow
- inventory units versus purchasing units
- yield, waste, cooked/raw and drain-loss handling
- costing snapshot model
- stock receiving, lot, batch and expiry tracking
- production batch output and consumption records
- QA hold/release workflow
- traceability chain from supplier document to inventory lot to production output
- audit log events for product, formula, price and support actions
- staff import/data collection process for formulas and products
- clearer split between supplier catalogue permissions and internal item permissions

## Recommended Next Tasks

- 187 Finished Product Data Entry Polish
- 188 Component Formula Builder Polish
- 189 Finished Product Formula Builder Polish - now completed as a focused finished product formula UX/readiness pass
- 190 Costing Snapshot Plan - now completed as the planning step for locked historical component, finished product and margin costs
- 191 Costing Snapshot Schema Foundation - now drafted as migration 034 with snapshot header/line tables, RLS and permissions for review
- 192 Costing Snapshot UI v1 - now adds manual snapshot creation, recent history panels and locked snapshot detail pages
- 193 Inventory Receiving Workflow Plan - now completed as the plan for Goods Inwards, receipt lines, lots, stock movements, QA hold/release and traceability foundations
- 194 Inventory Stock Movement Schema Foundation
- 195 Goods Inwards Receiving UI v1
- 196 Unit Of Measure Standardisation Plan
- 197 Supplier/Internal Mapping Review Workflow
- 198 Formula Import Review UI Plan
- 199 Production Batch Data Model Plan
- 200 Traceability Chain Planning

## Behaviour Preserved

- no migrations were created
- no Supabase settings, RLS policies or permissions were changed
- no service-role usage was added
- no write actions were added
- Supplier Invoice Intake behaviour is unchanged
- Platform Admin behaviour is unchanged
- tenant route/domain/auth behaviour is unchanged
## Task 234 Commerce Mapping Boundary

Task 234 mapping outputs reference active same-tenant `internal_items` limited to component or finished-product types and use the item's active base UOM. The mapping does not own or rewrite item identity, formulas, supplier mappings, approved supplier prices or sell prices. Bundle quantities are commerce interpretation evidence, not formula lines.
