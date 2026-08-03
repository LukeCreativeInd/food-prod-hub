# Facility Scope And Ownership Matrix

## Authority

This matrix records the Task 226 architecture decision. It does not create schema. Proposed entities and fields remain unimplemented until their approved roadmap tasks.

Classification terms:

- **Organisation-wide:** one tenant-owned master or configuration source shared by facilities.
- **Facility-scoped:** one authoritative physical/operational scope.
- **Organisation default with facility override:** shared default with explicit site applicability or override later.
- **Cross-facility transaction:** preserves source, destination and in-transit evidence.
- **Facility-derived through parent:** no repeated facility field where an immutable authoritative parent supplies it.
- **External/source-owned with target-facility assignment:** source evidence remains external while EveryBatch assigns destination scope.
- **Reporting scope only:** reader/filter, not an operational source.
- **Unresolved pending Tasks 227-230:** exact facility routing depends on the architecture phase.
- **Future/Pending:** not required for current Phase 1 foundation.

## Tenant And Platform

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tenant | organisations | Implemented | `organisations` | Organisation-wide | No | N/A | Yes, root | No | Yes | 231 reads parent | Facility never replaces tenant identity. |
| Tenant | organisation_settings | Implemented | `organisation_settings` | Organisation-wide default configuration | Default pointer only | `default_facility_id` proposed | Yes | No | Yes | 231 | One canonical default pointer; nullable during provisioning. |
| Tenant | organisation_branding | Implemented | `organisation_branding` | Organisation-wide | No | N/A | Yes | No | Yes | Future only if operational branding proven | Do not duplicate tenant branding per facility. |
| Identity | profiles | Implemented | `profiles` | Platform identity | No | Through memberships | Yes where tenant context is used | No | Yes | Existing | Profile is not a facility assignment. |
| Identity | organisation_memberships | Implemented | `organisation_memberships` | Organisation-wide | No in Phase 1 | Organisation membership | Yes | No | Yes | Revisit only on access trigger | Facility memberships are deferred. |
| Access | roles | Implemented global reference | `roles` | Organisation-wide assignment semantics | No | Membership role | Yes through membership | No | Yes | 231 permissions only | Roles initially apply across accessible facilities. |
| Access | permissions | Implemented global reference | `permissions` | Organisation-wide permission catalogue | No | Role permissions | Yes at evaluation | No | Yes | 231 | Likely `facilities.view/manage`; no facility ACL now. |
| Platform | feature flags | Implemented | `feature_flags`, `organisation_feature_flags` | Organisation-wide | No | Organisation enablement | Yes | No | Yes | Existing/platform future | Facility rollout flags only if later justified. |
| Routing | domains | Implemented in app resolver/config, not facility table | Tenant resolver and app-mode config | Organisation-wide | No | Domain to organisation/app mode | Yes | No | Yes | Existing | A domain is not a facility. |
| Support | Support tickets | Implemented | `support_tickets` | Organisation-wide with optional facility context | Not in Phase 1 | Validated related record/context later | Yes | Helpful when relevant | No | Future Support task | Never leak QA/stock detail through context. |
| Facility | facilities (proposed) | Not implemented | Proposed `facilities` | Facility-scoped identity | Yes, identity itself | Organisation parent | Yes | Yes | Yes | 231 | Possible name only until approved migration. |

## Products And Costings

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Products | suppliers | Implemented | `suppliers` | Organisation-wide | No | N/A | Yes | No | Yes | Existing | Facility availability is a relationship, not duplicate supplier. |
| Products | supplier catalogue identity | Implemented | `supplier_items`, `supplier_aliases`, mappings | Organisation-wide | No | Supplier/item parent | Yes | No | Yes | Existing/298 | Keep one catalogue identity per tenant. |
| Intake | purchase documents and lines | Implemented | `purchase_documents`, `purchase_document_lines` | Organisation-wide commercial evidence | No | Optional link to receipt later | Yes | Preserve supplier/source history | Yes | Existing | An invoice is not physical receiving or facility stock. |
| Products | approved supplier prices | Implemented | `approved_supplier_prices` | Organisation-wide | No in Phase 1 | Supplier/item/channel context | Yes | No | Yes | Existing; facility landed cost later | Do not infer facility cost from invoice location. |
| Products | internal items | Implemented | `internal_items` | Organisation-wide | No | N/A | Yes | No | Yes | Existing | Facility capability uses a future relationship. |
| Products | ingredients | Implemented item subtype | `internal_items` | Organisation-wide | No | Item type | Yes | No | Yes | Existing | Do not duplicate by facility. |
| Products | packaging | Implemented item subtype | `internal_items` | Organisation-wide | No | Item type | Yes | No | Yes | Existing | Same rule as ingredients. |
| Products | components | Implemented item/formula subtype | `internal_items`, formulas | Organisation-wide | No | Formula output | Yes | No | Yes | 238-245 for approved knowledge | Facility method can differ; item remains shared. |
| Products | finished products | Implemented item/formula subtype | `internal_items`, formulas | Organisation-wide | No | Formula output | Yes | No | Yes | Existing/demand tasks | Availability and capability are separate. |
| Products | formulas | Implemented via versions | `formula_versions`, `formula_lines` | Organisation-wide | No | Output item | Yes | Historical version, not facility | Yes | 238-243 transition | Formula is not a facility method. |
| Products | formula versions | Implemented | `formula_versions` | Organisation-wide | No | Formula output item | Yes | Yes for formula version | Yes | Existing | Facility override belongs to methods/instructions, not copied formulas by default. |
| Products | formula lines | Implemented | `formula_lines` | Facility-derived through formula | No | Formula version | Yes | Through version | Yes | Existing | No repeated facility. |
| Products | UOM conversions | Implemented | `uom_conversion_rules` | Organisation-wide | No | Item/context rule | Yes | Rule history retained | Yes | Existing/204+ | Never guess facility pack conversions. |
| Costings | sell prices | Implemented | `finished_product_sell_prices` | Organisation-wide and channel-specific | No in Phase 1 | Product/channel | Yes | Effective history | Yes | Existing | Facility price only if future commercial evidence requires it. |
| Costings | costing snapshots | Implemented | `costing_snapshots`, lines | Organisation-wide immutable evidence | No in Phase 1 | Item/formula/price sources | Yes | Snapshot history retained | Yes | Existing | Facility landed/operating cost overlay is later. |

## Commerce And Demand

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Commerce | commerce connections (proposed) | Not implemented | Future provider-neutral Commerce | External/source-owned with one Phase 1 target manufacturer and optional onboarding default facility | Optional default; required before actionable intake | Connection default plus reviewed routing | Yes | Yes for routing evidence | Yes | 227 decided; 229, 232 implement later | Store connection is not facility identity; business status and health differ. |
| Commerce | storefronts (proposed) | Not implemented | Future Commerce source identity | Provider/store-owner identity with target-facility assignment | No as identity | Connection/routing rule | Yes | Preserve source and resolved target | Yes | 227 decided; 232 later | CEA/CEW/Made Active are not facilities; Made Active is externally owned. |
| Commerce | source orders (proposed) | Not implemented | Future Commerce intake | External/source-owned with target-facility assignment | Assignment field likely | Source connection plus reviewed routing | Yes | Yes | Yes | 228, 232-233 | Preserve provider IDs and source evidence. |
| Commerce | source order lines (proposed) | Not implemented | Future Commerce intake | Facility-derived through order/routing | Usually no repeated field | Source order/demand assignment | Yes | Yes | Yes | 228, 232-233 | Do not lose line provenance. |
| Commerce | mappings (proposed) | Partial supplier mappings only; commerce mapping absent | Future Commerce/Products relationship | Connection plus target-manufacturer scoped | No by default | Connection/product mapping | Yes | Mapping version/history required | Yes | 232 foundation, 234 review | Facility override only if later product routing differs. |
| Commerce | bundle rules (proposed) | Not implemented | Future Commerce mapping | Connection-scoped interpretation approved by manufacturer | No | Storefront/mapping | Yes | Yes | Yes | 232 foundation, 234 review | Exact legacy rules require review; no silent drops. |
| Commerce | delivery zones (proposed) | Not implemented | Future Logistics/Commerce boundary | Unresolved pending Task 230 | To be decided | Zone/calendar/routing rule | Yes | Yes | Yes | 230 | Destination zone may route to facility, but is not facility. |
| Calendars | delivery calendars (proposed) | Not implemented | Future calendar domain | Unresolved pending Task 230 | To be decided | Connection/zone | Yes | Effective-dated history | Yes | 230 | Do not conflate with production calendar. |
| Calendars | production calendars (proposed) | Not implemented | Future Production/Admin configuration | Organisation default with facility override | Facility applicability likely | Facility/default rule | Yes | Effective-dated history | Yes | 230 | Facility timezone and operating days matter. |
| Demand | production demand (proposed) | Not implemented | Future Production demand | External/source-owned with target-facility assignment | Assignment required before execution | Source order to reviewed demand | Yes | Yes | Yes | 228, 236 | May remain unassigned before review. |
| Demand | demand snapshots (proposed) | Not implemented | Future Production demand | Facility-scoped once frozen | Yes on snapshot/root | Reviewed assignment | Yes | Yes | Yes | 228, 236-237 | A frozen snapshot cannot span facility execution silently. |
| Demand | post-freeze deltas (proposed) | Not implemented | Future Production demand | Facility-derived through snapshot, with reassignment evidence | No unless delta changes assignment | Snapshot and source change | Yes | Yes | Yes | 228, 236-237 | Never rewrite frozen history. |

## Inventory

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Inventory | inventory locations | Implemented | `inventory_locations` | Facility-scoped | Yes | Facility parent | Yes | Yes | Yes | 231 | Exactly one facility per location. |
| Goods Inwards | receipts | Implemented | `inventory_receipts` | Facility-scoped root | Yes | Receiving facility | Yes | Yes | Yes | 231 | One receipt cannot span facilities. |
| Goods Inwards | receipt lines | Implemented | `inventory_receipt_lines` | Facility-derived through parent | No | Receipt; location must match | Yes | Through receipt/location | Yes | 231 consistency | Cross-facility line rejected. |
| Inventory | lots | Implemented | `inventory_lots` | Facility-derived through movements/current location | No current facility field | Movement locations and origin receipt | Yes | Origin and movement history | Yes | 231 compatibility; 249-251 | A lot may later span locations or be in transit. |
| Inventory | stock movements | Implemented | `stock_movements` | Facility-derived through location | No repeated field | `stock_location_id` | Yes | Yes | Yes | 231 location backfill; 250 workflow | Append-oriented ledger. |
| Inventory | stock adjustments (proposed workflow) | Planned only | Inventory future | Facility-scoped transaction | Root/direct source and location | Adjustment document to movements | Yes | Yes | Soon after replacement | 269 | Must append correction evidence. |
| Inventory | stocktakes (proposed) | Not implemented | Inventory future | Facility-scoped transaction | Root facility | Count locations | Yes | Yes | Soon after replacement | 274-275 | Scope must be explicit. |
| Inventory | transfer requests (proposed) | Not implemented | Inventory planning | Cross-facility transaction | Source/destination direct | Transfer header/lines | Yes | Yes | Yes where required | 249 | Planning does not post stock. |
| Inventory | inter-facility transfers (proposed) | Not implemented | Inventory | Cross-facility transaction | Source/destination direct | Header, lines, ship/receive | Yes | Yes | Yes where required | 249-251 | No simultaneous availability. |
| Inventory | staged inventory (proposed) | Not implemented | Inventory | Facility-scoped | Through staging location/transaction | Allocation/pick/staging | Yes | Yes | Yes | 249-251 | Staging is physical only after confirmation. |
| Inventory | Stock On Hand | Implemented read model | Movement ledger plus hold availability | Reporting scope only | Filter dimension only | Movement location to facility | Yes | Yes in grouping | Yes | 248 | Aggregate organisation/facility/location/lot without double count. |
| Inventory/QA | QA-held availability | Implemented minimal read boundary | QA holds applied to Inventory quantities | Facility-derived through lot movements | No | Lot/location distribution | Yes | Hold history retained | Yes | Existing; revisit 249-251 | Do not expose hold details to inventory-only roles. |

## Production

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production | production areas | Implemented foundation | `production_areas` | Facility-scoped | Yes | Facility parent | Yes | Yes | Yes | 231, UI 252 | Exactly one facility per area. |
| Production | production plans | Implemented foundation | `production_plans` | Facility-scoped root | Yes | Assigned facility | Yes | Yes | Yes | 231, integration 247 | One plan cannot execute across facilities. |
| Production | production batches | Implemented foundation | `production_batches` | Facility-scoped root | Yes | Plan when linked; direct for standalone | Yes | Yes | Yes | 231, later 247 | Direct field prevents standalone ambiguity. |
| Production | production tasks (proposed) | Scaffold only | Future Production | Facility-derived through parent | No by default | Batch/plan/area | Yes | Through task parents | Yes | 254 | Assignment is not facility membership. |
| Production | methods (proposed) | Not implemented | Future Production knowledge | Organisation default with facility override | Applicability/override relationship | Output/version/facility | Yes | Version history | Yes | 239-245 | Distinct from formula. |
| Production | Work Instructions (proposed) | Not implemented | Future Production knowledge | Organisation default with facility override | Applicability/override relationship | Method version/facility | Yes | Version history | Yes | 239-245 | Facility-specific instruction must be explicit/versioned. |
| Production | equipment references (proposed) | Not implemented | Future Production/Admin | Facility-scoped | Yes | Facility/area | Yes | Yes | Not initial replacement minimum | Future/Pending | Equipment cannot float between tenants. |
| Production | material requirements (proposed) | Not implemented | Production calculation | Facility-derived through demand/plan | No | Demand snapshot/plan | Yes | Snapshot history | Yes | 246-247 | Formula shared, stock facility-aware. |
| Production | allocations (proposed) | Not implemented | Inventory/Production planning boundary | Facility-scoped planning | Through plan and location | Requirement to lot/location | Yes | Yes | Yes | 249-250 | Allocation is not movement. |
| Production | picks (proposed) | Not implemented | Inventory | Facility-scoped transaction | Through allocation/location | Pick record | Yes | Yes | Yes | 249-251 | Physical confirmation required. |
| Production | staging (proposed) | Not implemented | Inventory | Facility-scoped transaction | Through staging location | Pick/transfer | Yes | Yes | Yes | 249-251 | Preserve source/destination. |
| Production | consumption (proposed) | Not implemented | Production plus Inventory ledger | Facility-derived through batch | No repeated field | Batch and issue location | Yes | Yes | Yes | 261-262 | Actual movement only on confirmation. |
| Production | outputs (proposed) | Not implemented | Production plus Inventory ledger | Facility-derived through batch | No repeated field | Batch and output location | Yes | Yes | Yes | 263 | Creates physical evidence when confirmed. |
| Production | yield/waste/variance (proposed) | Not implemented | Production actuals | Facility-derived through batch | No | Batch/area/method | Yes | Yes | Yes for parity | 264 | Never rewrite formulas from observed yield. |
| Production | Digital Batch Record (proposed) | Not implemented | Production read/history composition | Facility-derived through batch | No | Batch/tasks/QA/movements | Yes | Yes | Valuable after replacement | 305 | Reader of canonical records, not second truth. |

## QA

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QA | QA templates | Implemented foundation | `qa_templates` | Organisation default with facility override | No on master | Applicability relationship later | Yes | Versioned applicability | Yes | 253/278 if needed | Keep one template source. |
| QA | template versions | Implemented | `qa_template_versions` and children | Facility-derived through template applicability | No | Template/applicability | Yes | Yes | Yes | Existing/future QA | Published versions immutable. |
| QA | checks | Implemented receiving foundation | `qa_check_instances` | Facility-derived through parent; direct for independent checks later | Conditional later | Receipt/lot/location/plan/batch/area | Yes | Yes | Yes | 253, 259, 278 | Manual/daily checks need explicit facility. |
| QA | results | Implemented | `qa_check_results` | Facility-derived through parent | No | Check instance | Yes | Through check | Yes | Existing | No repeated facility. |
| QA | reviews | Implemented | `qa_reviews` | Facility-derived through parent | No | Check instance | Yes | Through check | Yes | Existing | Queue filters by check facility later. |
| QA | holds | Implemented full-lot workflow | `qa_holds` | Facility-derived through inventory | No | Lot movement/location context | Yes | Hold plus inventory history | Yes | Existing; transfer follow-up | Hold does not duplicate quantity. |
| QA | releases | Implemented as hold lifecycle/event | `qa_holds`, `qa_hold_events` | Facility-derived through hold | No | Hold/lot | Yes | Yes | Yes | Existing | Release authority stays restricted. |
| QA | daily checks | Scaffold only | Future QA checks | Facility-scoped execution | Yes when no parent | Facility/area/location | Yes | Yes | Yes where required | 278 | Recurrence/calendar exact design later. |
| QA | non-conformance (proposed) | Not implemented | Future QA | Facility-derived or organisation-wide by source | Conditional | Source check/lot/batch/supplier | Yes | Yes | Soon after replacement | 280-282 | Supplier NC may be organisation-wide; event facility remains traceable. |
| QA | CAPA (proposed) | Not implemented | Future QA | Organisation-wide with source facility context | Conditional | NC/source | Yes | Yes | Soon after replacement | 280-282 | Do not force all CAPA to one facility. |
| QA | recalls/incidents (proposed) | Not implemented | Future QA/Inventory coordination | Cross-facility investigation | Scope set/read model | Lots, batches, dispatch | Yes | Yes | Later | 283-284 | May span facilities without shared ownership. |
| QA | supplier quality (proposed) | Not implemented | QA reading supplier evidence | Organisation-wide | No | Supplier/check/NC | Yes | Facility as event dimension only | Later | 285-286 | Supplier master remains Products-owned. |

## Logistics

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Logistics | carriers | Implemented | `logistics_carriers` | Organisation-wide | No | N/A | Yes | No | Yes | Existing | Facility availability relation later only if needed. |
| Logistics | carrier services | Implemented | `logistics_carrier_services` | Organisation-wide with possible facility availability | No on master | Carrier plus future applicability | Yes | Service history | Yes | Existing/later | Do not duplicate carrier per facility. |
| Logistics | dispatch runs | Implemented | `logistics_dispatch_runs` | Facility-scoped root | Yes, origin | Assigned origin facility | Yes | Yes | Yes | 231 | Exactly one origin. |
| Logistics | deliveries | Implemented | `logistics_dispatch_deliveries` | Facility-derived through parent | No | Dispatch run | Yes | Through run | Yes | Existing | Destination remains independent. |
| Logistics | dispatch lines | Implemented | `logistics_dispatch_lines` | Facility-derived through parent | No | Delivery/run | Yes | Through run | Yes | Existing | No stock allocation yet. |
| Logistics | manifests | Implemented | `logistics_manifests` | Facility-derived through parent | No | Dispatch run | Yes | Yes, snapshot origin | Yes | 231 compatibility, 221 workflow follow-up | One manifest run, one origin facility. |
| Logistics | carrier exports | Implemented schema/scaffold | `logistics_carrier_exports` | Facility-derived through manifest | No | Manifest/run | Yes | Yes | Later | 289-290 | Export history retains origin indirectly/snapshot. |
| Logistics | delivery issues | Scaffold only | Future Logistics | Facility-derived through delivery/run | No | Delivery/run | Yes | Yes when linked | Later | 287-288 | Do not use Support tickets as issue records. |

## Reports And Operations

| Domain | Entity | Current implementation status | Current source of truth | Recommended scope classification | Direct facility identity? | Derivation path | Organisation identity retained? | Historical facility required? | Phase 1 requirement? | Owning future task | Notes/risks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reporting | module dashboards | Mixed real foundations | Read models | Reporting scope only | No source field | Canonical records | Yes | Filter/history as applicable | Yes | 314-322 | Always label scope. |
| Reporting | home dashboard | Implemented mixed summary | Read model | Reporting scope only | No source field | Canonical records | Yes | Filter/history as applicable | Yes | 323 | Single facility can resolve default silently. |
| Reporting | reports | Scaffold only | Future read models | Reporting scope only | No source field | Canonical records | Yes | Yes for historical filters | Later | 303-308 | Avoid double-counting transit and cross-facility totals. |
| Reporting | saved views | Not implemented | Future user configuration | Reporting scope only | Stored filter reference only | Validated facility filter | Yes | No | Later | Future/Pending | Saved IDs must be revalidated. |
| Audit | audit events | Implemented generic foundation | `audit_logs` | Organisation-wide with facility context | No required field in Task 231 | Entity/metadata relationship | Yes | Facility context useful | Yes | 341-342 | Audit must not become operational source. |
| Operations | notification/escalation events | Not implemented | Future event workflow | Facility-derived through source | No | Source record | Yes | Yes | Later | Future/Pending | Recipient routing is not facility membership. |

## Permanent Rules

1. `organisation_id` remains on facility-scoped records and remains the tenant boundary.
2. A facility belongs to one organisation and is never shared or moved.
3. Physical roots store facility directly; stable children derive it.
4. Master data is not duplicated per facility.
5. Client-supplied facility IDs are always untrusted and server/database validated.
6. Archived facility history remains readable.
7. Reports expose scope but do not own facility assignment.
