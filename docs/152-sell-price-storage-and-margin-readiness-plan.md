# Sell Price Storage And Margin Readiness Plan

Task 152 plans sell price storage and margin readiness before implementation.

Task 153 now drafts the first reviewed schema foundation in [Sell Price Schema Foundation](153-sell-price-schema-foundation.md). The migration creates the tenant-scoped sell price table and permissions, but still does not add sell price UI, write actions, Shopify sync, tax automation or margin calculations.

This is planning/static-helper work only. It does not create sell price tables, migrations, write actions, UI forms, Shopify sync, channel sync, GST/tax engine, discount logic, subscription pricing, wholesale quoting, margin calculations, Platform Admin changes, tenant provisioning changes or Supplier Invoice Intake changes.

## Current Schema Findings

No migration is needed for this planning task.

Current findings:

- `internal_items` has no sell price fields.
- `formula_versions` and `formula_lines` have no sell price fields.
- Finished products are represented by `internal_items.item_type = finished_product`.
- Finished product formulas can provide the cost side through `formula_versions.formula_type = finished_product`.
- `organisation_settings.currency` exists and defaults to `AUD`.
- Task 153 drafts `finished_product_sell_prices` for channel-specific sell prices, GST/tax mode, approval fields and history-ready effective dates.
- No current table stores Shopify product/variant mappings.

Expected conclusion:

Sell prices need their own tenant-scoped storage, separate from supplier approved prices.

## Current Pricing Data Sources

Current cost-side pricing tables:

- `price_observations`
- `approved_supplier_prices`

`price_observations` are supplier invoice cost observations. They capture observed purchase prices from supplier documents and do not automatically update current costing prices.

`approved_supplier_prices` are reviewed supplier cost prices used by Costings. They belong to supplier/internal input costing and should not be reused for finished product sell prices.

## Why Supplier Cost Prices Are Separate From Sell Prices

Supplier prices answer:

- What did Clean Eats pay or approve as an input cost?
- Which supplier item/internal item does that cost belong to?
- Which invoice or observation was the source?

Sell prices answer:

- What does Clean Eats charge for a finished product?
- Which sales channel does that price apply to?
- Is the price GST-inclusive or GST-exclusive?
- Which price is current for a given date/channel?

Mixing these would make Costings and Meal Margins harder to trust. Supplier costs and customer/channel sell prices should stay separate.

## Proposed Sell Price Model

Future table name recommendation:

- `finished_product_sell_prices`

Suggested fields:

- `id`
- `organisation_id`
- `finished_product_internal_item_id`
- `channel_key`
- `channel_label`
- `price_amount`
- `currency_code`, default `AUD`
- `tax_mode`: `gst_inclusive`, `gst_exclusive`, `out_of_scope`, `unknown`
- `gst_rate` if needed later
- `effective_from`
- `effective_to`
- `status`: `draft`, `active`, `archived`
- `source`: `manual`, `shopify`, `import`, `api`, `system`
- `source_reference`
- `notes`
- `created_by`
- `approved_by`
- `approved_at`
- `created_at`
- `updated_at`
- `archived_at`

Recommended constraints for a future reviewed migration:

- tenant-owned with `organisation_id`
- same-tenant FK to `internal_items(organisation_id, id)`
- referenced internal item must be a finished product, enforced by app/server validation or a reviewed trigger
- positive `price_amount`
- uppercase 3-letter currency
- known `tax_mode`
- one active/current price per organisation, finished product and channel for overlapping effective dates

## Channel Pricing Model

One finished product may have multiple active prices by channel.

Planned channels:

- `direct_consumer`
- `wholesale`
- `retail`
- `subscription`
- `manual`
- `shopify_clean_eats_australia`
- `shopify_clean_eats_wholesale`

Clean Eats Australia and Clean Eats Wholesale may have different prices. Manual price entry should come before Shopify sync so the margin system can work without relying on integrations.

Future Shopify sync can map Shopify product/variant prices to channel-specific sell prices. Subscription, promotion, discount and account-specific wholesale prices should stay out of v1 base margin until rules are explicitly agreed.

## GST And Tax Handling Plan

Planning assumptions:

- default currency is AUD from `organisation_settings.currency`
- sell prices may be GST-inclusive or GST-exclusive
- tax mode should be stored with each sell price
- margin views should clearly say which tax basis is being used
- no assumption should be made that every food product has the same GST treatment
- GST/tax rules need accounting review before automation

Do not build a GST engine yet.

Future `tax_mode` values:

- `gst_inclusive`
- `gst_exclusive`
- `out_of_scope`
- `unknown`

Margin should stay blocked when tax mode is `unknown`.

## Current And Approved Sell Price Behaviour

Future sell prices should follow a reviewed current/history pattern similar in spirit to supplier prices, but in separate tables.

Recommended behaviour:

- draft prices can be entered but should not drive active margin reporting
- one active price per finished product/channel should be selected for a date range
- old active prices should be given an `effective_to` date or archived before a new open-ended active price is created
- effective dates should support history
- price approval should record profile/timestamp where possible

## Margin Readiness Rules

Margin readiness states:

- `no_formula`
- `formula_not_cost_ready`
- `no_sell_price`
- `sell_price_draft`
- `tax_mode_unknown`
- `channel_not_selected`
- `ready_for_margin_preview`
- `margin_active`

Margin requires:

- finished product formula exists
- finished product formula cost is ready
- selected sales channel is known
- sell price exists for selected channel
- sell price is active/current for the review date
- sell price currency matches tenant currency or is explicitly reviewed
- tax mode is known
- margin calculation rule is selected/agreed

Margin should remain blocked if:

- no formula exists
- formula inputs are missing prices
- component cost is missing
- unit mismatch exists
- no sell price exists
- sell price is only draft
- tax mode is unknown
- no channel is selected

## Margin Calculation Plan

Task 171 implements the first conservative read-only margin preview in [Meal Margins Real Calculation v1](171-meal-margins-real-calculation-v1.md).

Formulas used for the v1 preview:

- gross profit amount = net sell price - product cost
- gross margin percent = gross profit amount / net sell price
- markup percent = gross profit amount / product cost

Important:

- if sell price is GST-inclusive and product cost is GST-exclusive or mixed, tax basis must be normalised before margin is trusted
- do not fake tax normalisation without accounting rules
- display currency consistently in AUD unless tenant settings say otherwise
- margin preview and margin active states should be visibly different

Task 171 still does not add GST/tax normalisation, snapshots, approval workflows, Shopify sync, discount logic, subscription pricing or wholesale quoting.

## Future UI Routes

Plan only:

- `/sell-prices` or `/price-management`
- `/finished-products/[id]/pricing`
- `/meal-margins`
- `/meal-margins/[id]`

Recommended v1 UI direction:

- add a pricing section/tab to finished product detail later
- Meal Margins shows a channel selector once sell prices exist
- Price History remains supplier cost history unless separate tabs are added
- future Price History tabs could be:
  - Supplier Cost History
  - Sell Price History

Do not add sidebar entries in this planning task.

## Future Server Actions

Plan only:

- `createSellPriceAction`
- `updateSellPriceAction`
- `archiveSellPriceAction`
- `approveSellPriceAction`
- `setActiveSellPriceAction`

Permission recommendation:

- read sell prices with `costings.view` or a future `sell_prices.view`
- manage sell prices with `costings.manage` or a future `sell_prices.manage`
- if product team owns sell prices, consider `products.manage`

Task 153 direction:

- introduce explicit `sell_prices.view` and `sell_prices.manage` permissions because customer/channel sell prices are distinct from supplier input prices.

## Relationship To Finished Product Formulas

Finished product formulas provide the cost side.

Sell prices provide the revenue side.

Meal Margins should combine them only when:

- formula cost is ready
- sell price is active/current
- tax/currency basis is known
- margin formula is agreed

Changes to formula cost or sell price should update margin readiness. A future margin snapshot table may be needed to preserve historic margin at the time a sell price was approved.

## Relationship To Supplier Price History

Supplier cost tables remain separate:

- `price_observations`
- `approved_supplier_prices`

Sell price history should not be stored in those tables.

Future reporting may need separate histories:

- supplier cost observations and approved supplier prices
- finished product sell price history
- margin snapshots/reviews

## Shopify And Channel Sync Later

Future Shopify sync should be treated as an input source, not the core pricing model.

Planning notes:

- Clean Eats Australia consumer store maps to a consumer channel
- Clean Eats Wholesale store maps to a wholesale channel
- Shopify product/variant IDs should live in channel mapping tables
- imported Shopify prices should create sell price observations or draft sell prices for review
- automatic activation needs approval rules
- discounts, compare-at prices, subscriptions and promotions should stay future

## Future Database Needs

Task 153 drafts:

- `finished_product_sell_prices`

Future reviewed migrations may still need:

- `sell_price_channels` if channels become tenant-configurable
- `sell_price_observations`
- `sell_price_imports`
- `channel_product_mappings`
- `margin_snapshots`
- `margin_reviews`
- `tax_rules`
- tenant tax settings
- audit log writes for sell price changes

Do not create them now.

## Static Helper Added

`lib/sell-price-margin-plan.ts` records static plan types and constants:

- planned channels
- tax modes
- statuses
- sources
- workflow stages
- sell price validation rules
- margin readiness rules
- required margin calculation inputs

The helper is pure/static only. It does not call Supabase, read auth context or write data.

## Non-Goals

This task does not build:

- sell price UI/actions
- migrations
- Shopify sync
- channel sync
- GST engine
- margin engine
- discounts/promotions
- subscription pricing
- wholesale contract pricing
- PDF/export reports
- Platform Admin changes
- tenant provisioning changes

## Recommended Next Implementation Task

After reviewing/applying task 153, the next implementation step should build a controlled sell price UI/action layer that validates:

1. active tenant context
2. `sell_prices.manage`
3. same-tenant finished product internal item
4. `internal_items.item_type = finished_product`
5. current active price behaviour per channel

## Task 170 Update

Task 170 adds `/sell-prices` as the first management UI for finished product sell prices. Meal Margins now reads active sell price readiness, but final margin calculations remain deferred to task 171.
