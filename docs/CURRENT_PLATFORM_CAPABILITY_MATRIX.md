# Current Platform Capability Matrix

## Status Language

`Operational foundation` means a real, controlled workflow exists, not that every edge case is complete. `Browser validated` records available runtime evidence. `Staff validated` is used only after real Clean Eats validation. `Navigation/scaffold` is an honest shell, not implemented capability. `Paused/reassessment required` means roadmap sequencing must be reviewed first.

Future task references use the official `225-348-official-roadmap.md`. A roadmap task does not change the current capability state until implemented and validated.

| Module / workspace | Route | State | Source and current actions | Validation / limitations / dependency |
| --- | --- | --- | --- | --- |
| Dashboard | `/dashboard` | Operational read foundation | Real module summaries/readiness | Browser foundations; query performance remains backlog |
| Inventory / Goods Inwards | `/goods-inwards` | Browser validated operational foundation | Receipts/lines; create, edit, QA-linked review and transaction-safe posting | No PO matching; production issue/output future |
| Inventory / Stock On Hand | `/stock-on-hand` | Browser validated read foundation | Derived movements and narrow QA hold availability | No adjustment workflow yet; scaling backlog |
| Inventory / Traceability | `/inventory-traceability` | Browser validated read foundation | Receipt, lot, movement and source links | First-load performance and recall-grade forward trace future |
| Inventory / Batch Receiving | `/batch-receiving` | Navigation/scaffold | Static preview; Goods Inwards is the real receipt source | Ownership/rename or merge review required; must not duplicate Goods Inwards |
| Inventory / Stock Locations | `/stock-locations` | Operational foundation | `inventory_locations`; view/create/edit | Applied migration `045` adds required direct facility scope; browser smoke testing pending |
| Cross-module / Facility architecture | No runtime route | Schema foundation applied; browser validation pending | Organisation-owned physical scope, selective direct roots, parent derivation and Clean Eats single-facility default | No facility UI, selector or multi-facility runtime; SQL Editor did not register migration history |
| Cross-module / Delivery and production calendars | `/shopify/delivery-zones`, `/shopify/delivery-services`, `/shopify/delivery-calendars`, `/shopify/delivery-parser`, `/shopify/delivery-exceptions` | Production-accepted live schema and UI | Organisation-owned zones, separate customer service/carrier truth, immutable effective calendars, source-order-date parser profiles and versioned production-date/facility interpretation | Migration 050 live/registered with zero rows; no postcode/customer PII or seeded configuration |
| Tenant Admin / Commerce Integrations | `/integrations` | Browser-accepted Shopify readiness/list foundation | Migrations 046-048 are live; Task 233 adds claim and manufacturer-acceptance actions, discovered-catalogue/run summaries and restricted connector runtime | No registered/connected app, live data or Production Demand; install/sync actions stay gated |
| Tenant Admin / Commerce mappings | `/integrations/shopify/mappings` | Production accepted foundation | Task 234 adds direct, bundle/pack and exclusion mapping review, approval history and source-line interpretation readiness | Migration 049 is live/registered; zero connection/catalogue/mapping rows; no demand contribution or Production Demand creation |
| Inventory / Stock Movements | `/stock-movements` | Read foundation | Append-oriented movement ledger | Adjust/reverse plan exists; actions future |
| Inventory / Purchasing | `/purchasing` | Navigation/scaffold | Static preview only | Purchasing architecture and demand dependencies; not required merely to reproduce the current production report |
| Products / Suppliers | `/suppliers` | Operational foundation | Supplier master/catalogue; view/create/edit/archive | Staff validation ongoing |
| Products / Ingredients | `/ingredients` | Operational foundation | Ingredient internal items; view/create/edit | UOM/price/formula data quality affects downstream |
| Products / Packaging | `/packaging` | Operational foundation | Packaging internal items; view/create/edit | Same as Ingredients |
| Products / Components | `/components` | Operational foundation | Component items and formula builder | Methods/instructions separate; cost readiness blockers shown |
| Products / Recipes | `/recipes` | Paused/reassessment required | Honest scaffold; no separate recipe records/source | Task 239 resolves formula/method/instruction/Recipes ownership before Tasks 240-245 |
| Products / Finished Products | `/finished-products` | Operational foundation | Finished items and formula builder | Demand, method and execution links future |
| Products / UOM Conversions | `/uom-conversions` | Operational foundation | Contextual conversion rules | Broader calculation integration remains incremental |
| Costings / Ingredient Costs | `/ingredient-costs` | Read foundation | Approved supplier prices and item data | Missing/unsafe UOM blocks calculation |
| Costings / Packaging Costs | `/packaging-costs` | Read foundation | Approved prices and packaging items | Same conservative blockers |
| Costings / Component Costs | `/component-costs` | Operational read foundation | Formula explosion and source costs | No fake conversion or incomplete totals |
| Costings / Sell Prices | `/sell-prices` | Operational foundation | Real sell-price records; create/edit/archive | Drafts excluded from readiness; no commerce sync |
| Costings / Meal Margins | `/meal-margins` | Operational read foundation | Active formulas, costs and active current sell prices | Conservative gross margin preview; no full tax/discount engine |
| Costings / Price History | `/price-history` | Read foundation | Price observations/approved history | Intake evidence remains separate |
| Costings / Snapshots | Product detail costing routes | UI/schema foundation | Immutable snapshot create/read | Requires safe units/prices; broader reporting future |
| Production / Production Report | `/production` | Paused/reassessment required | Real setup/readiness summaries, not demand, report or floor execution | Tasks 255/260 replace control and pack roles; Tasks 266-268 govern parity and retirement |
| Production / Production Plan | `/production-plan` | Operational foundation | Plans/lines and planned batch creation for ready lines | No live order demand, actual issue/output or floor execution |
| Production / Areas | `/production-areas` | Schema plus scaffold | `production_areas` exists; current page is not the complete live area-management workflow | Facility scope follows 226/231; real configuration is Task 252 |
| Production / Tasks | `/production-tasks` | Navigation/scaffold | Static sample/preview only; no task records or actions | QA plan 253, schema 254 and execution 257-258 |
| Production / Facility/iPad | `/facility-tasks` (compatibility redirects include `/facility-ipad-view`) | Critical architecture gate | Visual direction only today | Delivery architecture is Task 256; implementation is Task 258 |
| Production / Live Demand | `/production-demand` | Production accepted | Live Migrations 051-052 provide append-oriented mapping-output contributions, fingerprint-idempotent current safe issues, scoped recalculation and stable facility/date/item/UOM aggregates with canonical host isolation | All four tables remain empty; no live source data; Stock On Hand is separate |
| Production Demand / Review Capture | `/production-demand`, `/production-demand/reviews/[reviewId]` | Production accepted | Non-empty unowned base plus explicit externally committed context reconciles to full facility/date live demand | Migrations 053-055 live/registered; no review/owner rows remain; no manual quantity input; demo read-only |
| Production Demand / Review Lifecycle and Freeze | `/production-demand/reviews/[reviewId]` | Production accepted | Shared organisation evidence barrier serialises Task 236 generation with reviewed-state checks, exact unscoped acknowledgement and irreversible one-base freeze | Full rollback lifecycle, independent-session ordering and browser verification passed; no frozen rows remain |
| Production Demand / Cumulative Deltas | `/production-demand/reviews/[reviewId]/deltas/[deltaVersionId]` | Production accepted | Owner-filtered cumulative differences follow moved lines under one review; late lines claim on approval; quantities remain exact-UOM with no global net | Cumulative replacement and mixed-UOM verification passed; no delta rows remain; no automatic generation/approval or ownership transfer |
| Production Demand / Effective Frozen Demand | Review detail | Production accepted | Read helper returns frozen base plus only latest approved cumulative delta by exact facility/date/item/UOM | Effective-demand arithmetic and browser verification passed; no Production Plan allocation; pending/rejected/superseded deltas excluded |
| Production / Plan Allocation | `/production-plan` | Existing independent planning scaffold; later roadmap | Does not consume Task 237 frozen demand yet | No allocation/link state in Task 237 or Task 238 |
| Commerce / Shopify connector | `/shopify`, `/api/integrations/shopify/*` | Non-live implementation foundation; setup routes browser accepted | Official auth/GraphQL/HMAC runtime, encrypted credential boundary, durable jobs, reconciliation and live/registered Migrations 047-048; tenant `/shopify` is a read-only permission-gated setup surface | No app registration/listing/review/store validation, scheduler, connection, source order or protected customer data exists |
| Production / consumption/output | None | Future/Pending | No physical production movements | Tasks 261-265 preserve plan/issue/consume/output distinctions |
| QA / Receiving Checks | `/qa/receiving` | Browser validated operational foundation | QA checks/results/reviews linked to receiving | Permission-aware; broader templates/admin future |
| QA / Production Checks | `/qa/production` | Navigation/scaffold | Honest workspace | Integration plan 253 and UI Task 259 |
| QA / Daily Checks | `/qa/daily` | Navigation/scaffold | Honest workspace | Task 278 after facility/production foundations |
| QA / Hold & Release | `/qa/holds` | Browser validated operational foundation | Controlled lot holds/releases and append-only events | Full-lot only; no NC/CA workflow |
| QA / template/history schema | QA tables | Schema foundation | Templates, versions, sections/items, results/reviews/approvals/amendments | Published/completed history protected |
| QA / NC/CA | None | Future/Pending | No operational tables | Plan 280, foundation 281 and UI 282 |
| Logistics / Dispatch Runs | `/logistics/dispatch-runs` | Browser validated operational foundation | Controlled create/validate/lifecycle and lines/deliveries | No customer/order master or stock allocation |
| Logistics / Manifests | `/logistics/manifests` | Browser validated operational foundation | Draft/generate immutable snapshots | No carrier transmission yet |
| Logistics / Carrier Configuration | `/logistics/carriers` | Browser validated operational foundation | Carrier/service create/edit/archive | Active-only dispatch selection; history retained |
| Logistics / Carrier Exports | `/logistics/carrier-exports` | Navigation/scaffold / schema foundation | Export table exists | Architecture 289 and implementation 290 |
| Logistics / Delivery Issues | `/logistics/delivery-issues` | Navigation/scaffold | Honest empty state | Ownership 287 and implementation 288 |
| CRM | `/crm` | Navigation/scaffold | No fake customer records | Planning 292, schema 293 and UI 294 |
| Reports | `/reports` | Navigation/scaffold | No fake report metrics | Planning/readiness begins at Task 303 |
| Tools / Supplier Invoice Intake | `/purchase-documents` | Operational foundation | Private upload, supplier parsers, reviewed generic commit | Supplier-specific extraction; no OCR/AI/auto stock posting |
| Tools / Formula Import | No operational route | Planning documented | Staff templates/plans only | Production transition Tasks 238-243; general expansion Task 300 |
| Tools / Production Data Import | No operational route | Ownership architecture only | Task 238 selects a dedicated Production-governed import/staging domain that may be surfaced through Tools | No upload, parser, staging, review, apply, bucket, permission or Migration 056 exists; Tasks 239-243 govern next decisions/implementation |
| Tools / Mapping QA | Commerce mapping route exists; broader QA route absent | Partial foundation | Task 234 owns Commerce catalogue mapping review; current supplier mappings remain visible through Products/Intake | Supplier/item mapping QA remains Task 298; Commerce mappings do not become a generic Tools-owned mapping system |
| Tenant Admin / Organisation Settings | `/organisation-settings` | Operational configuration | Branding/theme/settings | Facility/integration configuration future |
| Tenant Admin / Users | `/users` | Foundation | Membership/user visibility | Full invite/lifecycle remains controlled future work |
| Tenant Admin / Modules | `/modules` | Operational configuration/read foundation | Enabled module registry | Platform provisioning remains separate |
| Tenant Admin / Integrations | `/integrations` | Navigation/scaffold | Static catalogue/log preview only; Tasks 227-230 commerce, demand, Shopify and calendar architecture are documented, but no live connection, relationship, order, zone, calendar or demand data exists | Gate 1, foundations 232-235 and diagnostics 301 |
| Platform Admin | `/platform` | Read/configuration foundation | Tenant overview, provisioning foundation, module/feature diagnostics, support inbox | SaaS health/billing/lifecycle depth future |
| Support / Help Centre | `/support` | Static + operational foundation | Authenticated guides, tickets, comments, attachments; Platform inbox; shared production EveryBatch Auth cookie scope | Product guides must track user-facing capabilities; Auth correction needs post-deploy cross-domain verification |

## External And Legacy Operational Workflows

| Workflow | Current state | Role in target architecture |
| --- | --- | --- |
| Shopify + Zapiet delivery-date filtering | Operational context confirmed; supplied exports contain no delivery, region, order or line fields, so the upstream filter decision cannot be reconstructed | First order source; connector must retain source/date evidence and keep date interpretation configurable |
| Shopify CSV export and meal aggregation tool | Source and matched fixture audited; exact-title filters, store-specific aliases and parent exclusions reduce 3,626 raw units to 3,614 accepted report units | Replace with controlled intake, mapping, line classification, aggregation, freeze/deltas and explicit exceptions |
| Current Production Report tool | Source and matched 22-page PDF audited; hard-coded formulas/planning/presentation rules remain non-canonical | Reproduce only staff-approved calculation, instruction and area behaviour before decommission |
| Printed global production pack | Matched PDF verifies 2 summary, 3 bulk, 2 meal-raw, 1 prepack and 3 meat/veg copy sets; actual room use still needs staff validation | Replace with area-scoped digital work plus controlled area/full printable fallback |
| Legacy report history/weekly helpers | Source audit found stored daily PDF/CSV history, deletion and weekly summary behaviour not previously inventoried | Decide reporting retention and ownership without making the legacy tool a future source of truth |

No current foundation in this matrix is labelled staff validated unless a later task records that evidence explicitly.
