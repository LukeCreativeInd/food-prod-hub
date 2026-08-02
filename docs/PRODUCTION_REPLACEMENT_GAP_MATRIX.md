# Production Replacement Gap Matrix

## Reading The Matrix

`A` means required to retire current production tools, `B` means safer operational depth shortly after replacement unless Task 224 promotes it to A, `C` means valuable Phase 1 improvement or later operational optimisation, `D` means later commercial/checkout expansion and `E` marks unknown design details requiring staff/source validation. E does not make the underlying business capability optional. Proposed task references are provisional and not active roadmap numbers.

| Capability | Legacy handling | Current EveryBatch / verified status | Gap: data, schema, UI, integration | Owner and cross-module impact | Facility/inventory/QA/Logistics impact | Class / dependency / proposed task | Evidence required |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Order intake | Shopify export | None; repository verified | Connection, sync events, normalised lines, UI, Shopify integration | Order intake -> Production | Facility routing later; downstream Logistics | A / architecture / 226-230 | Source export and change cases |
| Order changes/cancellations | Re-export/manual handling unknown | None | Idempotent updates, cancellation state, post-freeze delta | Order intake + Production | Prevent obsolete demand/dispatch | A / intake lifecycle / 229-233 | Edited/cancelled examples |
| Delivery-date extraction | Zapiet tag filter | None | Configurable source rule and exception UI | Order intake | Facility calendar/routing | A / connector / 226-233 | Tag/key/date examples |
| Production-date calculation | Generally day before delivery | Plan dates exist; no source rule | Calendar, cut-off, override and reason | Production | Facility operating calendar | A/E / facility + demand / 225,233 | Schedule exception examples |
| Finished-product mapping | Legacy aggregation logic | Internal items exist; no commerce mapping | Mapping schema/UI and exception queue | Order intake + Products | Determines all downstream demand | A / intake / 229,231 | SKU/variant mapping |
| Bundle handling | Unknown legacy logic | None | Bundle expansion semantics and review | Order intake + Products | Affects requirement accuracy | E likely A / evidence / 224,231 | Bundle examples/rules |
| Non-production lines | Unknown exclusions | None | Classification/exclusion rules | Order intake | Prevent gift/service lines entering production | E likely A / evidence / 224,231 | Gift card, discount, free-item examples |
| Demand aggregation | Meal-total tool | No demand engine | Calculation service/read model and review UI | Production | Feeds Inventory/QA/Logistics | A / mappings / 232-233 | Paired source/aggregate CSVs |
| Demand freeze | Manual CSV snapshot | No lifecycle | Reviewed/frozen snapshot, actor/time | Production | Facility/date scope | A / demand schema / 232-233 | Staff approval process |
| Demand deltas | Re-run/manual unknown | No lifecycle | Post-freeze change queue and authorised adjustment | Production | Prevent history rewrite | A / freeze / 232-233 | Late-change cases |
| Formula expansion | Production Report config | Active formulas exist; no demand expansion | Recursive expansion, version pinning, UOM blocking | Production reads Products | Inventory requirements; QA method links later | A / formula quality / 237-238 | Expected calculations |
| Component expansion | Legacy report logic | Component formulas supported | Multi-level explosion and cycle/error handling | Products + Production | Shortages by component/input | A / same / 237-238 | Nested formula examples |
| Production methods | Config CSV/PDF | No method schema | Steps, sequence, area, equipment, time/temp | Production | QA prompts and task generation | A/E / ownership decision / 234-236 | Source instructions + staff review |
| Work instructions | Global printed report | `/recipes` scaffold only | Approved human-facing versioned instructions | Production, Products reference | Area/tablet and QA | A/E / 234-236 | Room-specific report sections |
| Legacy formula/method/instruction transition | Configuration CSV/manual maintenance | Formula Import planning exists; no legacy Production import | Source inventory, staging/parser, provenance, mapping/review, duplicate/item/UOM/method validation and controlled apply | Tools may support Products/Production-owned records | Import quality affects every Production requirement/task | A/E if Task 224 finds import is required; conditional unnumbered workstream | Record volume, source structure/quality and manual-entry practicality |
| Yield factors | Old configuration assumptions unknown | Formula expected-yield quantity exists | Basic semantics, engine and reviewed assumptions | Products/Production | Changes Inventory requirements and variance | A/E / 237-238; basic expected-yield calculation is A | Yield examples/rules |
| Inventory availability | Not live/limited | Stock On Hand derives physical/held/available | Production requirement comparison and facility view | Inventory reader | Held exclusion mandatory | A / facility+UOM / 239 | Decommission boundary validation |
| Held stock exclusion | Unknown | QA availability helper operational | Production reader integration | QA owns holds; Inventory derives availability | No hold detail leakage | A / availability / 239 | Staff scenario |
| FEFO/FIFO recommendation | Staff process unknown | Lots/expiry exist | Recommendation policy/UI | Inventory | Lot/location/facility; QA hold-aware | A/E where current data supports it / 239-242 | Current picking practice and data quality |
| Lot allocation | Unknown/manual | Planned input can reference lot; no workflow | Allocation lifecycle, release/replan | Production/Inventory planning | No physical movement | B/E / architecture / 240-242 | Day-one safety decision |
| Warehouse picking | Printed report/manual | None | Minimum pick requirements, confirmation and exceptions | Inventory execution | Source/destination/lot | A / availability and provisional 240-242 | Warehouse walkthrough |
| Stock transfers | Manual | Movements/locations exist; no workflow | Planned transfer plus authorised physical confirmation/reversal | Inventory | Facility/location critical; planning must not post movement | A for required transfer and confirmation; deeper allocation B / provisional 240-242 | Store/warehouse practice |
| Production staging | Manual | None | Staging requirement, location and confirmation flow | Inventory + Production | Must not equal consumption | A for minimum required staging / provisional 240-248 | Floor walkthrough |
| Production issue/consumption | Not integrated | Batch input actual fields only | Atomic stock movement and correction | Inventory owns ledger; Production owns evidence | Lot traceability/QA | B/E / transaction plan / 251-253 | Current capture and decommission need |
| Production output | Not integrated | Batch actual output fields only | Output lot/movement and QA linkage | Production + Inventory | Finished stock/dispatch | B/E / 251-253 | Current stock handoff |
| Production batches | Report/grouped work | Plans/batches foundation exists | Demand linkage, number/inputs/task execution | Production | Facility/area, QA later | A / demand/expansion / 233,238,245 | Report batch rules |
| Production areas | Report sections/rooms | Table exists; page not complete live config | Real configuration and responsibility UI | Production | Strong facility scope | A / facility / 243 | Area list/ownership |
| Production tasks | Printed pages | Static scaffold | QA-informed task schema, generation, lifecycle and blockers | Production | Area/device and required QA prompts | A / methods+batches / provisional 244-248 | Room task inventory |
| QA checks | Report/manual QA | Receiving QA real; Production QA scaffold | Required-check attachment and Production check linkage | QA | Batch/task/facility scope | E; required report checks may be A / provisional 244 and 250 | Required production checks |
| Admin overview | Global report | Setup dashboard only | Demand/shortage/readiness/progress control view | Production reader/control | Reads all source modules | A / source workflows / provisional 246 | Tony workflow validation |
| Tablet/room execution | Printed copies | Visual scaffold only | Real task UI after delivery architecture decision | Production | Device/session/offline unresolved | A/E / provisional 247-249 | Device/environment evidence |
| Progress tracking | Paper/manual | No task execution | Start/complete/block/status timeline | Production | Admin/area consistency | A / provisional 245-248 | Staff workflow |
| Actual quantity | Paper/manual unknown | Batch/input optional actual columns | Safe task completion and actual-quantity lifecycle | Production | Physical issue/output remains B unless promoted | A for task completion; B/E for physical actuals / provisional 248-253 | Current actual capture |
| Shortage | Can leave production short | Formula-missing blockers only | Requirement-versus-availability exceptions | Production + Inventory | Held/location aware | A / expansion+availability / 238-239 | Known shortage examples |
| Waste | Unknown/manual | None | Capture reason/quantity/unit | Production/Costings reader | May need QA disposition | C / actuals / 254 | Staff process |
| Yield/variance | Static assumptions | No workflow | Expected vs actual calculation/review | Production/Costings | Facility/area trends | C / actuals / 254 | Historical examples |
| Finished-stock readiness | Manual | No production output | Derived output availability/QA | Inventory reader | Logistics dependency | B / output / 252-253 | Dispatch handoff |
| Dispatch readiness | Separate/manual | Logistics workflow exists, no stock/order link | Demand/output/QA readiness reader | Logistics | Facility origin | B / output+order / 253 | Current handoff |
| Printable fallback | 24-page global PDF | No real production export | Versioned area/full export | Production report reader | Facility/area | A/E / parity / 255 | PDF + outage process |
| Parity comparison | Manual confidence | Not performed | Comparison harness/log and disposition | Replacement programme | Cross-module | A / implementation / 256 | Representative production days |
| Legacy decommission | Tools remain critical | Not ready | Formal gate, support, rollback and archive | Product owner + operations | Whole workflow | A / all gates / 257 | Staff and Luke approval |

## Workspace Disposition

| Workspace | Finding | Recommended disposition |
| --- | --- | --- |
| Purchasing | Honest scaffold; not a production replacement blocker | Keep later pending purchasing architecture |
| Batch Receiving | Honest scaffold; Goods Inwards is the real receipt source | Merge/rename decision later; do not duplicate Goods Inwards |
| Stock Adjustments/Reversals | Planned but not built | Keep as safe Inventory follow-up; required before mature physical execution |
| Recipes | Ambiguous scaffold | Resolve formula/method/instruction ownership before execution |
| Formula builders/UOM | Real foundations | Bring data-quality and expansion integration earlier |
| Production Plan | Real planning foundation | Extend from frozen demand rather than replace |
| Production Areas | Schema foundation | Promote real configuration after facility decision |
| Production Tasks | Static scaffold | Replace with real task records/execution |
| Facility/iPad | Visual direction only | Preserve business requirement; architecture gate first |
| Production/Daily QA | Scaffolds | Production QA follows execution; Daily QA can remain later |
| Logistics readiness | Dispatch foundation real | Link only after demand/output truth exists |
| Formula Import | Planning only | Preserve later; source/config import may become migration utility after evidence |
| Legacy Production data transition | No reviewed EveryBatch workflow | Conditional; Task 224 decides whether manual entry or promoted Formula Import/Mapping QA patterns are appropriate |
| Integrations | Honest scaffold | Shopify connection and health work must move earlier |
| Platform readiness | Foundation only | Add connection/facility/mapping readiness after source workflows exist |
