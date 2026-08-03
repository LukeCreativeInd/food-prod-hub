# Current Platform Capability Matrix

## Status Language

`Operational foundation` means a real, controlled workflow exists, not that every edge case is complete. `Browser validated` records available runtime evidence. `Staff validated` is used only after real Clean Eats validation. `Navigation/scaffold` is an honest shell, not implemented capability. `Paused/reassessment required` means roadmap sequencing must be reviewed first.

| Module / workspace | Route | State | Source and current actions | Validation / limitations / dependency |
| --- | --- | --- | --- | --- |
| Dashboard | `/dashboard` | Operational read foundation | Real module summaries/readiness | Browser foundations; query performance remains backlog |
| Inventory / Goods Inwards | `/goods-inwards` | Browser validated operational foundation | Receipts/lines; create, edit, QA-linked review and transaction-safe posting | No PO matching; production issue/output future |
| Inventory / Stock On Hand | `/stock-on-hand` | Browser validated read foundation | Derived movements and narrow QA hold availability | No adjustment workflow yet; scaling backlog |
| Inventory / Traceability | `/inventory-traceability` | Browser validated read foundation | Receipt, lot, movement and source links | First-load performance and recall-grade forward trace future |
| Inventory / Batch Receiving | `/batch-receiving` | Navigation/scaffold | Static preview; Goods Inwards is the real receipt source | Ownership/rename or merge review required; must not duplicate Goods Inwards |
| Inventory / Stock Locations | `/stock-locations` | Operational foundation | `inventory_locations`; view/create/edit | Future facility scope |
| Inventory / Stock Movements | `/stock-movements` | Read foundation | Append-oriented movement ledger | Adjust/reverse plan exists; actions future |
| Inventory / Purchasing | `/purchasing` | Navigation/scaffold | Static preview only | Purchasing architecture and demand dependencies; not required merely to reproduce the current production report |
| Products / Suppliers | `/suppliers` | Operational foundation | Supplier master/catalogue; view/create/edit/archive | Staff validation ongoing |
| Products / Ingredients | `/ingredients` | Operational foundation | Ingredient internal items; view/create/edit | UOM/price/formula data quality affects downstream |
| Products / Packaging | `/packaging` | Operational foundation | Packaging internal items; view/create/edit | Same as Ingredients |
| Products / Components | `/components` | Operational foundation | Component items and formula builder | Methods/instructions separate; cost readiness blockers shown |
| Products / Recipes | `/recipes` | Paused/reassessment required | Honest scaffold; no separate recipe records/source | Task 224 confirms the legacy tool mixes formula, planning, instruction and presentation concerns; Review Gate 0 must resolve ownership |
| Products / Finished Products | `/finished-products` | Operational foundation | Finished items and formula builder | Demand, method and execution links future |
| Products / UOM Conversions | `/uom-conversions` | Operational foundation | Contextual conversion rules | Broader calculation integration remains incremental |
| Costings / Ingredient Costs | `/ingredient-costs` | Read foundation | Approved supplier prices and item data | Missing/unsafe UOM blocks calculation |
| Costings / Packaging Costs | `/packaging-costs` | Read foundation | Approved prices and packaging items | Same conservative blockers |
| Costings / Component Costs | `/component-costs` | Operational read foundation | Formula explosion and source costs | No fake conversion or incomplete totals |
| Costings / Sell Prices | `/sell-prices` | Operational foundation | Real sell-price records; create/edit/archive | Drafts excluded from readiness; no commerce sync |
| Costings / Meal Margins | `/meal-margins` | Operational read foundation | Active formulas, costs and active current sell prices | Conservative gross margin preview; no full tax/discount engine |
| Costings / Price History | `/price-history` | Read foundation | Price observations/approved history | Intake evidence remains separate |
| Costings / Snapshots | Product detail costing routes | UI/schema foundation | Immutable snapshot create/read | Requires safe units/prices; broader reporting future |
| Production / Production Report | `/production` | Paused/reassessment required | Real setup/readiness summaries, not demand, report or floor execution | Task 224 audits one matched 22-page fixture and legacy source rules; implementation and full parity remain missing |
| Production / Production Plan | `/production-plan` | Operational foundation | Plans/lines and planned batch creation for ready lines | No live order demand, actual issue/output or floor execution |
| Production / Areas | `/production-areas` | Schema plus scaffold | `production_areas` exists; current page is not the complete live area-management workflow | Future facility scope and real configuration UI required |
| Production / Tasks | `/production-tasks` | Navigation/scaffold | Static sample/preview only; no task records or actions | Schema, method linkage, area workflow and execution pending |
| Production / Facility/iPad | `/facility-tasks` (compatibility redirects include `/facility-ipad-view`) | Critical architecture gate | Visual direction only today | Business requirement approved; technology/device model unresolved |
| Production / Demand intake | None | Critical future architecture | Legacy Shopify/Zapiet/CSV flow external | Provider-agnostic order/demand model required |
| Production / consumption/output | None | Future/Pending | No physical production movements | Must distinguish plan/allocation/transfer/issue/consume/produce |
| QA / Receiving Checks | `/qa/receiving` | Browser validated operational foundation | QA checks/results/reviews linked to receiving | Permission-aware; broader templates/admin future |
| QA / Production Checks | `/qa/production` | Navigation/scaffold | Honest workspace | Production execution dependency |
| QA / Daily Checks | `/qa/daily` | Navigation/scaffold | Honest workspace | Recurrence/facility architecture pending |
| QA / Hold & Release | `/qa/holds` | Browser validated operational foundation | Controlled lot holds/releases and append-only events | Full-lot only; no NC/CA workflow |
| QA / template/history schema | QA tables | Schema foundation | Templates, versions, sections/items, results/reviews/approvals/amendments | Published/completed history protected |
| QA / NC/CA | None | Future/Pending | No operational tables | Root cause, correction, CAPA and closure future |
| Logistics / Dispatch Runs | `/logistics/dispatch-runs` | Browser validated operational foundation | Controlled create/validate/lifecycle and lines/deliveries | No customer/order master or stock allocation |
| Logistics / Manifests | `/logistics/manifests` | Browser validated operational foundation | Draft/generate immutable snapshots | No carrier transmission yet |
| Logistics / Carrier Configuration | `/logistics/carriers` | Browser validated operational foundation | Carrier/service create/edit/archive | Active-only dispatch selection; history retained |
| Logistics / Carrier Exports | `/logistics/carrier-exports` | Navigation/scaffold / schema foundation | Export table exists | No carrier integration/export action |
| Logistics / Delivery Issues | `/logistics/delivery-issues` | Navigation/scaffold | Honest empty state | Ownership decision across Logistics/CRM/Support/QA required |
| CRM | `/crm` | Navigation/scaffold | No fake customer records | Lightweight scope and schema future |
| Reports | `/reports` | Navigation/scaffold | No fake report metrics | Source readiness/performance review future |
| Tools / Supplier Invoice Intake | `/purchase-documents` | Operational foundation | Private upload, supplier parsers, reviewed generic commit | Supplier-specific extraction; no OCR/AI/auto stock posting |
| Tools / Formula Import | No operational route | Planning documented | Staff templates/plans only | Parser/review/commit foundation future |
| Tools / Mapping QA | No operational route | Future/Pending | Current mappings visible through Products/Intake | Dedicated QA tool future |
| Tenant Admin / Organisation Settings | `/organisation-settings` | Operational configuration | Branding/theme/settings | Facility/integration configuration future |
| Tenant Admin / Users | `/users` | Foundation | Membership/user visibility | Full invite/lifecycle remains controlled future work |
| Tenant Admin / Modules | `/modules` | Operational configuration/read foundation | Enabled module registry | Platform provisioning remains separate |
| Tenant Admin / Integrations | `/integrations` | Navigation/scaffold | Static integration catalogue/log preview; no live Shopify connection | Installable connector, tenant configuration and sync-health architecture critical |
| Platform Admin | `/platform` | Read/configuration foundation | Tenant overview, provisioning foundation, module/feature diagnostics, support inbox | SaaS health/billing/lifecycle depth future |
| Support / Help Centre | `/support` | Static + operational foundation | Authenticated guides, tickets, comments, attachments; Platform inbox | Product guides must track user-facing capabilities |

## External And Legacy Operational Workflows

| Workflow | Current state | Role in target architecture |
| --- | --- | --- |
| Shopify + Zapiet delivery-date filtering | Operational context confirmed; supplied exports contain no delivery, region, order or line fields, so the upstream filter decision cannot be reconstructed | First order source; connector must retain source/date evidence and keep date interpretation configurable |
| Shopify CSV export and meal aggregation tool | Source and matched fixture audited; exact-title filters, store-specific aliases and parent exclusions reduce 3,626 raw units to 3,614 accepted report units | Replace with controlled intake, mapping, line classification, aggregation, freeze/deltas and explicit exceptions |
| Current Production Report tool | Source and matched 22-page PDF audited; hard-coded formulas/planning/presentation rules remain non-canonical | Reproduce only staff-approved calculation, instruction and area behaviour before decommission |
| Printed global production pack | Matched PDF verifies 2 summary, 3 bulk, 2 meal-raw, 1 prepack and 3 meat/veg copy sets; actual room use still needs staff validation | Replace with area-scoped digital work plus controlled area/full printable fallback |
| Legacy report history/weekly helpers | Source audit found stored daily PDF/CSV history, deletion and weekly summary behaviour not previously inventoried | Decide reporting retention and ownership without making the legacy tool a future source of truth |

No current foundation in this matrix is labelled staff validated unless a later task records that evidence explicitly.
