# Finished Product Formula Builder Polish

Task 189 polishes the finished product formula builder so sellable meal/SKU setup is easier to review before costing snapshots, inventory availability and production planning are built.

This task does not create migrations, change RLS, change permissions, change auth/domain routing, change formula calculation logic, change Meal Margins calculation logic, change Sell Prices business logic, change Supplier Invoice Intake, add packages or use service-role keys.

## Summary

Finished product formula detail pages now make the setup path clearer:

1. confirm the finished product internal item
2. review or edit the formula output basis
3. add component, ingredient and packaging inputs
4. resolve cost blockers through Component Costs, Ingredient Costs or Packaging Costs
5. add an active current sell price
6. review margin from Meal Margins

Production readiness remains future-only and is not presented as live production, inventory or QA logic.

## Finished Product Formula Detail Polish

Updated `/finished-products/[id]`:

- kept the app header as the main finished product title
- clarified that the page is for a sellable finished product/meal formula
- kept real data-backed product fields:
  - name
  - item type
  - base unit
  - item status
  - formula version
  - formula output
  - updated date
  - notes
- expanded review actions to link to:
  - Manage formula
  - View Components
  - Manage Sell Prices
  - View Meal Margins
  - Review Component Costs
  - Review Ingredient Costs
  - Review Packaging Costs
- kept the support ticket action scoped to the current finished product page context
- kept production readiness explicitly future-only

## Formula Input Line Usability

The formula line area now uses clearer language:

- `Formula lines` is presented as `Formula inputs`
- empty state says to add components, ingredients and packaging used to make the finished product
- add action says `Add input line`
- line badges display readable input type labels such as `Component`, `Ingredient` and `Packaging`
- line cards show the current cost source hint
- quantity is labelled as the quantity used for the formula output
- unit helper text explains that safe metric kg/g and l/ml conversions are supported, while pack units still need purchase-unit conversion setup
- editable line forms now include the existing `loss_note` field, so a loss note added on create can be maintained later
- selectable inputs are grouped by Components, Ingredients and Packaging

The allowed input item types are unchanged. Finished product inputs remain blocked in v1.

## Blocked Cost And Margin Messaging

Cost readiness still uses the existing helper logic. The UI now makes the next action clearer:

- missing approved price points users toward the relevant cost review pages
- unit review explains that the formula line unit must match the approved price unit until conversions are built
- missing child component formulas remain visible as component review blockers
- margin readiness states that margin needs cost-ready inputs plus active current sell prices
- draft and archived sell prices are explicitly described as not counting toward readiness

No formula cost or Meal Margins calculation logic was changed.

## Cost, Sell Price And Margin Links

Finished product detail now links directly to the current general review pages:

- `/components`
- `/component-costs`
- `/ingredient-costs`
- `/packaging-costs`
- `/sell-prices`
- `/meal-margins`

Product-specific filters for Sell Prices and Meal Margins remain a future task because those pages do not yet support product-specific query filters.

## Finished Products List Alignment

`/finished-products` already uses the task 187 real-data list pattern and remains aligned:

- rows are backed by tenant `internal_items`, formula versions, formula lines and active current sell prices
- readiness columns use `Formula`, `Cost`, `Sell price` and `Margin`
- summary cards remain real data-backed
- create form remains product-first and creates a finished product internal item plus the first draft formula header

No large list rewrite was needed in task 189.

## Create/Edit Flow Findings

The existing create/edit flow remains intentionally narrow:

- finished products are created as `internal_items.item_type = finished_product`
- formula headers are stored in `formula_versions.output_internal_item_id`
- formula inputs are stored in `formula_lines.input_internal_item_id`
- server actions still validate required product name, positive output quantity, output unit, positive line quantity, line unit and supported input item type
- line remove still soft-archives by setting `archived_at`

No dedicated finished product profile editor, product SKU editor, formula import flow or costing snapshot flow was built.

## Readiness Wording

The current user-facing wording remains:

- `Formula missing`
- `Needs lines`
- `Cost review needed`
- `Cost ready`
- `Sell price missing`
- `Sell price ready`
- `Margin blocked`
- `Margin ready`
- `Production readiness coming later`

The page copy now better explains what each state requires without changing calculations.

## Support Context Mapping

Finished Products remain mapped to:

- `related_module_key = finished_products`
- `category = formulas`

Meal Margins remains mapped to:

- `related_module_key = meal_margins`
- `category = costings`

Sell Prices remains mapped to:

- `related_module_key = sell_prices`
- `category = costings`

No support context mapping change was required.

## Admin And Support Impact

Platform Admin routes, tenant visibility, tenant management, feature flags, modules and permissions are not changed.

Support impact:

- Formula Builder guide copy now distinguishes component formulas from finished product formulas.
- Formula Builder guide now notes that finished product margin readiness needs an active current sell price.
- Support ticket context-aware creation remains compatible with the existing `finished_products` mapping.
- Platform Admin support visibility/inbox workflows are not changed.

No additional Admin impact.

## Cross-Module Impact

Finished product formulas connect or should later connect to:

- Component formulas: finished product formulas can use components as inputs and read component cost readiness.
- Inventory receiving/stock availability: future only; no stock-on-hand or availability calculation was added.
- Supplier Invoice Intake/prices: indirect through approved supplier prices for ingredient and packaging inputs.
- Costings: formula line quantities and approved prices drive cost readiness.
- Costing snapshots: task 192 now adds manual finished product cost/margin snapshot creation and recent history; reporting, automation and production links remain future.
- Production plans/batch recipes: future; formula output and input lines will later support production planning.
- QA checks/non-conformance: future; no hold/release or QA status is connected yet.
- Logistics/dispatch/traceability: future; no dispatch, batch traceability or delivery workflow was added.
- Reports: future reports can use finished product readiness, costs and margin state.
- CRM/customer/order history: future customer/channel history can connect through sell prices and orders later.
- Platform Admin: no route, tenant-management, feature-flag or module change.
- Support tickets/page context: support tickets can be created with finished product page context.
- Audit logs: no new audit events are written.
- Permissions: existing `formulas.view` and `formulas.manage` controls remain.

## Dummy / Demo Cleanup

- no fake finished product rows were added
- no fake stats were added
- no sample/demo formula lines were added
- production readiness remains labelled future-only
- current page sections are real empty states or real tenant data-backed views

## Known Gaps

- product-specific filters for Sell Prices and Meal Margins
- dedicated finished product profile editor for SKU/code, lifecycle, pack format and richer notes
- formula import from spreadsheets or staff templates
- unit-of-measure conversion rules
- broader costing snapshot reporting beyond the first manual UI added in task 192
- finished-goods inventory availability
- production planning/batch recipe execution
- QA release/hold state
- logistics/dispatch traceability
- audit log writes for formula edits

## Recommended Next Tasks

- Costing Snapshot Plan - now completed as task 190
- Costing Snapshot Schema Foundation - now drafted as migration 034 for future locked snapshot records
- Costing Snapshot UI v1 - now adds manual finished product cost/margin snapshot creation and recent snapshot history on finished product detail pages
- Unit Of Measure Standardisation Plan
- Finished Product Profile/SKU Schema Plan
- Product-specific Sell Price and Meal Margin filters
- Formula Import Foundation

## Behaviour Preserved

- `/finished-products` still works
- `/finished-products/[id]` still works
- `/components` still works
- `/component-costs`, `/ingredient-costs` and `/packaging-costs` still work
- `/sell-prices` still works
- `/meal-margins` still works
- `/support/tickets/new` finished product context remains compatible
- `/dashboard`, `/platform` and `/login` are unchanged
- no migrations were created or changed
