# Production Replacement Gap Matrix

> **Task 242 update:** Task 240's machine collection contract is approved and Task 241's source/staging/Storage foundation is live/database-runtime accepted with bounded CSV parser code. Trusted parser persistence, mapping/review, Formula hardening, Method/WI schema, controlled apply and parity evidence remain open. Task 246 will test a flexible human collection pack.

## Reading The Matrix

`A` means required to retire current production tools, `B` means safer operational depth shortly after replacement, `C` means valuable Phase 1 improvement or later operational optimisation, `D` means later commercial/checkout expansion and `E` marks unknown design details requiring staff/source validation. E does not make the underlying business capability optional. Current sequence uses `EVERYBATCH_ROLLING_ROADMAP.md`; older task references remain historical source annotations.

## Task 224 Evidence Update

Task 224 verified one complete raw-to-cleaned-to-PDF day. The current six-column exports have already lost store, order/line, date, region, courier/service, status and SKU provenance. Cleanup uses exact product titles, ignores product/variant IDs and bundle properties, merges the two Clean Eats stores, and silently excludes non-allowlisted titles. The Production Report then applies a second fixed 26-title filter, manual date/adjustment controls, hard-coded requirement tables and upward rounding. These findings replace earlier `unknown legacy logic` descriptions but do not approve the legacy values.

Task 227 now settles commerce ownership/consent direction: CEA and CEW are separate Clean Eats-owned storefront connections; Made Active remains an externally owned manufacturing customer; external intake requires owner authorisation plus manufacturer acceptance; provider/store identity cannot rely on prefixes/domains; mappings and rule outcomes are connection plus manufacturer scoped and history preserving. No schema, connector, order intake or mapping workflow is implemented.

Task 228 now settles the provider-neutral order-to-demand direction: stable source identities and material observations feed controlled current projections; immutable versioned interpretations/contributions preserve mapping/rule evidence; live demand is recalculable; reviewed demand is a versioned decision; frozen snapshots and source links are immutable; post-freeze changes become deltas; manual adjustments remain separate; and Production Plans consume demand through explicit allocations. No schema, connector or demand workflow is implemented.

Task 239 settles the production-knowledge ownership gap: Formula/BOM is Products-owned composition; Method/Step and Work Instruction are Production-owned and independently versioned; Recipe is presentation only. Expected process yield and process batch envelopes belong to Method Version, not Formula output basis. Method/WI schema, approved Clean Eats content, recursive expansion and controlled import remain open.

| Capability | Legacy handling | Current EveryBatch / verified status | Gap: data, schema, UI, integration | Owner and cross-module impact | Facility/inventory/QA/Logistics impact | Class / dependency / official task | Evidence required |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Order intake | Already-filtered six-column Zapiet export; no order/line/date/status fields | Ownership/consent architecture complete; no runtime intake | Connection, sync events, raw/normalised lines, UI, Shopify integration | Commerce -> Production | Target manufacturer/default facility direction decided; detailed assignment later | A / architecture and foundation / 228-233 | Pre-export source plus change/cancel cases |
| Order changes/cancellations | Re-export/manual handling unknown | None | Idempotent updates, cancellation state, post-freeze delta | Order intake + Production | Prevent obsolete demand/dispatch | A / intake lifecycle / 228, 232-237 | Edited/cancelled examples |
| Delivery-date extraction | Upstream Zapiet/staff filter; no date retained in fixture | None | Configurable source rule, evidence and exception UI | Order intake | Facility calendar/routing | A/E / connector + calendar | Tag/key/date/filter examples |
| Production-date calculation | Assigned upstream through changing staff/calendar rules; matched files retain no decision evidence | Plan dates exist; no source rule | Effective-dated calendar, cut-off, override and reason | Production | Facility operating calendar | A/E / facility + demand / 226, 230-237 | Regional, public-holiday, courier and exception examples |
| Finished-product mapping | Exact product-title allowlist plus four Made aliases; IDs ignored | Internal items exist; no commerce mapping | ID-based mapping schema/UI, alias history and exception queue | Order intake + Products | Determines all downstream demand | A / intake before aggregation | Approved product/variant mapping |
| Bundle handling | Two metadata families observed; child rows counted, parents excluded by title rather than parsed | None | Store-specific parent/child classification and review | Order intake + Products | Affects requirement accuracy | A/E / early commerce mapping | More bundle, edited and failure fixtures |
| Non-production lines | Exact allowlist removes observed pack parents silently | None | Explicit contribution/exclusion reason and exception queue | Order intake | Prevent gifts/services/unknown meals entering or disappearing | A/E / early commerce mapping | Gift, free and renamed-product examples |
| Demand aggregation | Exact-title group/sum; two Clean stores merged; report filters again | No demand engine | Source-linked calculation/read model and review UI | Production | Feeds Inventory/QA/Logistics | A / mappings + date | Matched fixture exists; more day/change fixtures needed |
| Demand freeze | Manual CSV snapshot | No lifecycle | Reviewed/frozen snapshot, actor/time | Production | Facility/date scope | A / demand schema and review / 236-237 | Staff approval process |
| Demand deltas | Re-run/manual unknown | No lifecycle | Post-freeze change queue and authorised adjustment | Production | Prevent history rewrite | A / freeze / 236-237 | Late-change cases |
| Formula expansion | Production Report config | Active formulas exist; no demand expansion | Recursive expansion, version pinning, UOM blocking | Production reads Products | Inventory requirements; QA method links later | A / formula quality / 239-247 | Expected calculations |
| Component expansion | Legacy report logic | Component formulas supported | Multi-level explosion and cycle/error handling | Products + Production | Shortages by component/input | A / same / 239-247 | Nested formula examples |
| Production methods | Mostly absent; Python provides calculations, not full sequence | No method schema | Steps, sequence, area, equipment, time/temp | Production | QA prompts and task generation | A/E / ownership decision | Approved current instructions + staff review |
| Work instructions | Global calculation tables/checklists; no full approved steps | `/recipes` scaffold only | Approved human-facing versioned instructions | Production, Products reference | Area/tablet and QA | A/E / ownership decision | Staff-authored area instructions |
| Legacy formula/method/instruction transition | Hard-coded Python dictionaries and manual source maintenance; approved current source not supplied | Formula Import planning exists; no legacy Production import | Approved-source inventory, staging/parser, provenance, mapping/review, duplicate/item/UOM/method validation and controlled apply | Tools may support Products/Production-owned records | Import quality affects every Production requirement/task | A/E / approved current-data transition / 238-245 | Current approved record volume, source structure/quality and manual-entry practicality |
| Yield factors | Fixed quantities, batch overage and water rules exist but are not approved yield data | Formula expected-yield fields exist but Task 239 classifies them as transitional/ambiguous | Method-owned expected process yield/loss, planning rules, engine and reviewed assumptions | Production Method; Formula retains composition basis | Changes Inventory requirements and variance | A/E; basic expected-yield calculation is A | Approved current yield/water examples |
| Inventory availability | Not live/limited | Stock On Hand derives physical/held/available | Production requirement comparison and facility view | Inventory reader | Held exclusion mandatory | A / facility+UOM / 248 | Decommission boundary validation |
| Held stock exclusion | Unknown | QA availability helper operational | Production reader integration | QA owns holds; Inventory derives availability | No hold detail leakage | A / availability / 248 | Staff scenario |
| FEFO/FIFO recommendation | Staff process unknown | Lots/expiry exist | Recommendation policy/UI | Inventory | Lot/location/facility; QA hold-aware | A/E where current data supports it / 248-251 | Current picking practice and data quality |
| Lot allocation | Unknown/manual | Planned input can reference lot; no workflow | Allocation lifecycle, release/replan | Production/Inventory planning | No physical movement | B/E / architecture / 249-251 | Day-one safety decision |
| Warehouse picking | Printed report/manual | None | Minimum pick requirements, confirmation and exceptions | Inventory execution | Source/destination/lot | A / availability and execution / 248-251 | Warehouse walkthrough |
| Stock transfers | Manual | Movements/locations exist; no workflow | Planned transfer plus authorised physical confirmation/reversal | Inventory | Facility/location critical; planning must not post movement | A for required transfer and confirmation; deeper allocation B / 249-251 | Store/warehouse practice |
| Production staging | Manual | None | Staging requirement, location and confirmation flow | Inventory + Production | Must not equal consumption | A for minimum required staging / 249-251 | Floor walkthrough |
| Production issue/consumption | Not integrated | Batch input actual fields only | Atomic stock movement and correction | Inventory owns ledger; Production owns evidence | Lot traceability/QA | B/E / transaction plan and foundation / 261-263 | Current capture and decommission need |
| Production output | Not integrated | Batch actual output fields only | Output lot/movement and QA linkage | Production + Inventory | Finished stock/dispatch | B/E / 261-265 | Current stock handoff |
| Production batches | Report/grouped work | Plans/batches foundation exists | Demand linkage, number/inputs/task execution | Production | Facility/area, QA later | A / demand, methods and tasks / 236-247, 254 | Report batch rules |
| Production areas | Report sections/rooms | Table exists; page not complete live config | Real configuration and responsibility UI | Production | Strong facility scope | A / facility / 252 | Area list/ownership |
| Production tasks | Printed pages | Static scaffold | QA-informed task schema, generation, lifecycle and blockers | Production | Area/device and required QA prompts | A / methods+batches / 253-258 | Room task inventory |
| QA checks | Static HACCP header and cooked-ingredient quantity-check tables; no captured result evidence | Receiving QA real; Production QA scaffold | Required-check attachment and Production check linkage | QA | Batch/task/facility scope | A/E where paper checks are required | QA/staff classification of every printed check |
| Admin overview | Global report | Setup dashboard only | Demand/shortage/readiness/progress control view | Production reader/control | Reads all source modules | A / source workflows / 255 | Tony workflow validation |
| Tablet/room execution | Printed copies | Visual scaffold only | Real task UI after delivery architecture decision | Production | Device/session/offline unresolved | A/E / 256-258 | Device/environment evidence |
| Progress tracking | Paper/manual | No task execution | Start/complete/block/status timeline | Production | Admin/area consistency | A / 254-258 | Staff workflow |
| Actual quantity | Paper/manual unknown | Batch/input optional actual columns | Safe task completion and actual-quantity lifecycle | Production | Physical issue/output remains B unless promoted | A for task completion; B/E for physical actuals / 257-265 | Current actual capture |
| Shortage | Can leave production short | Formula-missing blockers only | Requirement-versus-availability exceptions | Production + Inventory | Held/location aware | A / expansion+availability / 246-248 | Known shortage examples |
| Waste | Unknown/manual | None | Capture reason/quantity/unit | Production/Costings reader | May need QA disposition | C / actuals / 264 | Staff process |
| Yield/variance | Static assumptions | No workflow | Expected vs actual calculation/review | Production/Costings | Facility/area trends | C / actuals / 264 | Historical examples |
| Finished-stock readiness | Manual | No production output | Derived output availability/QA | Inventory reader | Logistics dependency | B / output / 261-265 | Dispatch handoff |
| Dispatch readiness | Separate/manual | Logistics workflow exists, no stock/order link | Demand/output/QA readiness reader | Logistics | Facility origin | B / output+order / 265, 291 | Current handoff |
| Printable fallback | Verified 22-page matched PDF; five section types and repeated copies | No real production export | Versioned area/full export | Production report reader | Facility/area | A/E / 260 | Annotated room distribution and outage process |
| Parity comparison | Manual confidence | Not performed | Comparison harness/log and disposition | Replacement programme | Cross-module | A / 266 | Representative production days |
| Legacy decommission | Tools remain critical | Not ready | Formal gate, support, rollback and archive | Product owner + operations | Whole workflow | A / 268 | Staff and Luke approval |

## Workspace Disposition

| Workspace | Finding | Recommended disposition |
| --- | --- | --- |
| Purchasing | Honest scaffold; not a production replacement blocker | Keep later pending purchasing architecture |
| Batch Receiving | Honest scaffold; Goods Inwards is the real receipt source | Merge/rename decision later; do not duplicate Goods Inwards |
| Stock Adjustments/Reversals | Planned but not built | Keep as safe Inventory follow-up; required before mature physical execution |
| Recipes | Honest scaffold; Task 239 decides presentation-only Recipe | Later repurpose to present approved Formula + compatible Method + linked Work Instructions; no Recipe table |
| Formula builders/UOM | Real foundations | Bring data-quality and expansion integration earlier |
| Production Plan | Real planning foundation | Extend from frozen demand rather than replace |
| Production Areas | Schema foundation | Promote real configuration after facility decision |
| Production Tasks | Static scaffold | Replace with real task records/execution |
| Facility/iPad | Visual direction only | Preserve business requirement; architecture gate first |
| Production/Daily QA | Scaffolds | Production QA follows execution; Daily QA can remain later |
| Logistics readiness | Dispatch foundation real | Link only after demand/output truth exists |
| Formula Import | Planning only | Consider earlier conditional reuse for approved current data after ownership; do not import legacy constants |
| Legacy Production data transition | No reviewed EveryBatch workflow | Likely controlled current-data staging/review after ownership; legacy constants are evidence only. Promote Formula Import patterns conditionally; reuse Mapping QA patterns without moving supplier mapping wholesale. |
| Integrations | Honest scaffold | Shopify connection and health work must move earlier |
| Platform readiness | Foundation only | Add connection/facility/mapping readiness after source workflows exist |

## Task 236 Progress Note

Task 236 closes the production-accepted live-demand foundation. Live/registered Migrations 053-055 close the database/runtime/concurrency portion of review/freeze/cumulative-delta control; deployment/browser acceptance remains open. Production Plan allocation, representative source fixtures, formula expansion, requirements, execution, parallel runs and staff acceptance remain open.
