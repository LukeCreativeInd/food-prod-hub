# Finished Product Data Entry Polish

Task 187 polishes the Finished Products list and detail experience so it feels like a real data-entry/review area before deeper costing, inventory and production workflows are built.

This task does not create migrations, change RLS, change permissions, change auth/domain routing, change Supplier Invoice Intake, change formula calculation logic, change Meal Margins calculation logic, create stock movements, add packages or use service-role keys.

## Summary

Finished Products now presents a clearer product setup flow:

1. create or review the finished product internal item
2. build or review its formula
3. confirm cost readiness from formula inputs
4. add an active current sell price
5. review margin from the Meal Margins page

Production readiness remains explicitly future and is not presented as live operational data.

## List Improvements

Updated `/finished-products`:

- renamed the main section to `Finished products`
- made the table read as a real product setup list rather than only a formula-builder table
- kept all rows real data-backed from tenant `internal_items`, formula rows and sell price rows
- added clearer columns for:
  - finished product
  - formula status
  - output quantity/unit
  - formula lines
  - cost readiness
  - sell price readiness
  - margin readiness
  - estimated cost
  - updated date
  - action
- improved the empty state to explain that finished products are sellable/output items and that formula, sell price and margin setup follows
- changed the primary create wording from `Create finished product formula` to `Add finished product`
- added helper copy explaining that the create form creates a canonical `internal_items.item_type = finished_product` record plus the first draft formula header

## Detail Improvements

Updated `/finished-products/[id]`:

- added a `Finished product details` card showing:
  - name
  - item type
  - base unit
  - item status
  - formula version
  - formula output
  - updated date
  - notes
- added a support-ticket action with safe page context for the finished product detail page
- added readiness cards for:
  - formula lines
  - component inputs
  - cost readiness
  - sell price readiness
  - margin readiness
- added a `Review actions` section linking to:
  - formula header/line management
  - sell prices
  - meal margins
  - component costs
- updated no-formula messaging to say margin needs a formula with cost-ready component, ingredient or packaging lines
- made production readiness wording future-only

## Create/Edit Flow Findings

The existing create/edit flow already exists and remains intentionally narrow:

- creating from `/finished-products` creates or reuses a finished product internal item by name
- the item type is fixed server-side as `finished_product`
- a first formula header is created at the same time
- formula lines are added on the finished product detail page
- server-side validation still enforces required name, positive output quantity, output unit and supported formula line input types
- finished product line inputs remain restricted to component, ingredient and packaging internal items

No full standalone product profile editor was built in this task. A future task can add richer SKU/code, description, lifecycle, pack format and sales-channel fields once the item model is reviewed.

## Formula / Sell Price / Margin Links

Finished product detail pages now make the review path obvious:

- formula management stays on the detail page
- sell price management links to `/sell-prices`
- margin review links to `/meal-margins`
- component cost review links to `/component-costs`

Filtered links to a specific finished product are still future because `/sell-prices` and `/meal-margins` do not yet support product-specific URL filters.

## Readiness Wording

The user-facing readiness language is now:

- `Formula missing`
- `Cost review needed`
- `Cost ready`
- `Sell price missing`
- `Sell price ready`
- `Margin blocked`
- `Margin ready`

Margin is ready only when:

- formula cost readiness is safe
- at least one active, non-archived, open-ended sell price exists for the finished product

This does not change the Meal Margins calculation engine. It only makes the Finished Products list/detail readiness messages align with the already-built sell price and margin foundations.

## Support Context Mapping

Task 186 already mapped Finished Products to:

- `moduleKey = finished_products`
- `category = formulas`

Task 187 uses that mapping from finished product detail support links:

```text
/support/tickets/new?relatedPath=/finished-products/{id}&moduleKey=finished_products&category=formulas
```

The path is generated with `URLSearchParams` and does not include secrets or unsafe auth/session values.

## Admin And Support Impact

Platform Admin routes, tenant management, feature flags, modules and permissions are not changed.

Support impact:

- Support Help Centre Products overview now mentions finished product readiness across formula, cost, sell price and margin setup.
- Release Notes now include Finished Product setup polish.
- Support ticket context-aware creation remains compatible with the existing `finished_products` mapping.
- Platform Admin support inbox filters already include `finished_products` from task 186 and are not otherwise changed.

No additional Admin impact.

## Cross-Module Impact

Finished Product data entry now points clearly to future or existing module relationships:

- Inventory receiving/stock availability: future only; no inventory availability is calculated.
- Supplier Invoice Intake/prices: indirect through approved supplier prices used by formula input costs.
- Costings: formula and approved prices drive cost readiness.
- Costing snapshots: future; no snapshot rows are created.
- Production plans: future; finished products are not production orders yet.
- QA/non-conformance: future; no hold/release or QA status is connected.
- Logistics/dispatch/traceability: future; no dispatch or traceability chain is connected.
- Reports: future reports can use finished product readiness, formulas and margins.
- CRM/customer/order history: future customer/channel history can connect through sell prices and orders later.
- Platform Admin: no route or tenant-management change.
- Support tickets/page context: finished product detail can open support with page context.
- Audit logs: no new audit events are written yet.
- Permissions: existing `formulas.view`, `formulas.manage`, `sell_prices.view` and `sell_prices.manage` boundaries remain.

## Dummy / Demo Cleanup

- no fake finished product stats were added
- no fake finished product rows were added
- existing list summary cards remain real data-backed
- old wording that said sell price storage was not implemented has been removed from Finished Product list/detail
- production readiness is labelled future instead of being shown as live

## Known Gaps

- dedicated SKU/code storage for finished products
- richer product profile editing separate from formula editing
- product lifecycle/approval status model
- product-specific filters on Sell Prices and Meal Margins
- unit-of-measure conversion and pack-format handling
- costing snapshots
- production readiness engine
- inventory availability and finished-goods stock
- QA hold/release state
- audit log events for formula/product/sell price actions

## Recommended Next Tasks

- 188 Component Formula Builder Polish
- 189 Finished Product Formula Builder Polish - now added clearer finished product formula input copy, grouped selectable inputs, cost/sell/margin action links and support guide notes without changing formula or margin calculations
- 190 Costing Snapshot Plan - now documents how finished product cost/margin snapshots should preserve formula, price and sell price assumptions
- 191 Costing Snapshot Schema Foundation
- 192 Costing Snapshot UI v1
- 196 Unit Of Measure Standardisation Plan
- future Finished Product SKU/Profile Schema Plan
- future Finished Product product-specific Sell Price/Margin filters

## Behaviour Preserved

- no migrations were created
- no RLS policies or permissions were changed
- no auth/domain routing changed
- no Supabase settings changed
- no Supplier Invoice Intake logic changed
- no Meal Margins calculation logic changed
- no sell price write/business rules changed
- no production, inventory or QA integrations were built
