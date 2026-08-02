# Logistics Module Deep Planning

> **Task 218 planning snapshot.** The future-state and placeholder wording below records the repository before implementation. Tasks 219-222 subsequently delivered the Logistics workspace scaffold, dispatch/manifest schema and workflow, and Carrier Configuration Foundation. Migrations 042-044 are applied. Use [Tasks 223-276 Revised Roadmap](./223-276-revised-roadmap.md) for current task order.

Task 218 is a planning-only task for the future EveryBatch Logistics module. It does not create routes, UI, schema, migrations, permissions, RLS policies, feature flags, data, exports, integrations, domain changes, middleware changes, package changes or user-facing behaviour.

Correct domain references for this plan are:

- `app.everybatchmrp.com` for central login and workspace selection.
- `admin.everybatchmrp.com` for Platform Admin.
- `cleaneats.everybatchmrp.com` for the Clean Eats tenant workspace.
- `support.everybatchmrp.com` for the authenticated support/help centre.

## 1. Logistics Module Charter

Logistics should become the tenant workspace for outbound dispatch planning, delivery manifest preparation, carrier handoffs, delivery exception tracking and future dispatch traceability.

For Clean Eats, Logistics should support:

- residential deliveries.
- wholesale deliveries.
- internal carrier runs.
- external carrier exports.
- delivery dates.
- delivery zones.
- carton-level planning.
- manifest generation.
- delivery issues.
- Detrack-oriented export/import readiness.
- future dispatch and recall traceability.

Logistics must not become a second inventory ledger, second production plan, second CRM/account list or second support inbox. It should coordinate outbound fulfilment by referencing the correct source records and writing only logistics-owned records.

## 2. Personas

Primary Clean Eats users:

- Dispatch coordinator: plans delivery runs, reviews cartons, prepares manifests and manages day-of-dispatch status.
- Warehouse or packing user: sees what must be staged, packed, held, released or blocked before dispatch.
- Operations manager: reviews route readiness, dispatch exceptions, delivery issue trends and carrier performance.
- Wholesale manager: reviews wholesale dispatches and account delivery commitments without receiving broad QA or inventory write authority.
- Customer/support user: raises or investigates delivery issues through support context, not direct operational edits.
- EveryBatch Platform Admin: sees tenant-level logistics readiness and diagnostics, not day-to-day dispatch editing by default.

## 3. Final Recommended Workspace Structure

Recommended tenant routes for task 219 scaffold and later implementation:

| Route | Purpose | First task stage |
| --- | --- | --- |
| `/logistics` | Dashboard for dispatch readiness, today's runs, manifest status and delivery issues. | 219 scaffold, later real data |
| `/logistics/dispatch` | Dispatch run planning and review. | 219 scaffold, 220/221 real schema/UI |
| `/logistics/manifests` | Manifest generation and export history. | 219 scaffold, 221 real UI |
| `/logistics/carriers` | Carrier/export configuration overview. | 219 scaffold, later config |
| `/logistics/delivery-issues` | Delivery exceptions and issue triage. | 219 scaffold, later support/CRM integration |
| `/logistics/zones` | Delivery zones and route grouping. | 219 scaffold, later configuration |

Near-term navigation should be honest: show the workspace shape without fake dispatch records. Existing `/logistics` is currently a placeholder protected by `logistics.view`; task 219 should replace it with an honest scaffold only.

## 4. Logistics Dashboard Future Queues And Metrics

Future dashboard queues should be derived from real source records:

- Dispatches due today.
- Dispatches due tomorrow.
- Unmanifested dispatch runs.
- Manifests ready to export.
- Carrier export failures.
- Delivery exceptions requiring review.
- Finished stock blocked by QA hold.
- Finished stock unavailable due physical shortage.
- Orders/demand waiting for production output.

Metrics should remain practical and operational:

- runs planned today.
- cartons expected today.
- manifests exported today.
- delivery issue count.
- on-time dispatch indicator.
- blocked dispatch lines.
- carrier export status.

Do not invent dashboard counts before dispatch source records exist.

## 5. Dispatch Model

Recommended model:

- `dispatch_runs`: tenant-owned dispatch day/run header.
- `dispatch_run_lines`: items or orders assigned to a run.
- `dispatch_allocations`: optional later table linking dispatch lines to finished inventory lots or production outputs.
- `delivery_manifests`: generated manifest records, export batches and carrier handoff state.
- `delivery_manifest_lines`: exportable line rows derived from run lines and customer/order data.
- `delivery_status_events`: append-like provider or user-entered status history.
- `delivery_issues`: operational delivery exceptions, linked to support tickets where appropriate.
- `carrier_profiles`: tenant carrier definitions.
- `delivery_zones`: tenant route/zone groupings.

Task 220 should decide the minimal schema needed for dispatch runs and manifests. It should not try to solve all future Detrack, ecommerce, proof-of-delivery and customer service workflows at once.

## 6. Clean Eats Dispatch Categories

Clean Eats should be modelled with explicit dispatch categories, not hard-coded forked logic:

| Category | Examples | Notes |
| --- | --- | --- |
| Residential | Clean Eats consumer meal deliveries | Usually delivery date, zone, address and carton count driven. |
| Wholesale | Clean Eats Wholesale, account deliveries | May need customer account, delivery instructions and invoice/order references. |
| Partner or brand | Made Active, Elite Meals | Should be tenant/customer/order metadata, not separate code paths. |
| Internal transfer/run | Internal carrier runs or site-to-site movement | May later connect to inventory transfer movements. |
| External carrier | Detrack/export-ready runs | Provider payload is derived, not the source of truth. |

Names like Made Active, Elite Meals, Clean Eats Australia and Clean Eats Wholesale should live in customer/account/order or dispatch-category configuration later, not as special-case table names.

## 7. Manifest Workflow

Recommended future workflow:

1. Source demand becomes available from future order/CRM/import records, or from manual dispatch lines in early v1.
2. User groups demand by delivery date, dispatch category, carrier and zone.
3. User creates or updates a dispatch run.
4. System checks readiness against inventory, QA holds and production status.
5. User generates a manifest draft.
6. User reviews carton counts, addresses, delivery instructions and carrier fields.
7. User marks manifest ready/exported.
8. Future integration exports to Detrack or another provider.
9. Delivery status events are imported or entered manually.
10. Exceptions are linked to delivery issues and support tickets.

Manifest generation should be review-first. Do not auto-dispatch stock merely because a manifest is created.

## 8. Carrier And Export Model

Detrack should be treated as a provider/export target, not the canonical dispatch record.

Recommended provider model:

- carrier profile stores provider name, export type, tenant-level status and notes.
- manifest stores provider target and exported timestamps.
- manifest export payload can be stored as JSON for diagnostics only.
- provider responses/status events are appended as delivery status events.
- failed exports are visible in Logistics and later Platform Admin diagnostics.

External carrier exports should never be the only durable record of what EveryBatch intended to dispatch.

## 9. Carton Calculation

Carton planning is important for Clean Eats, but should start conservative.

Recommended stages:

1. Manual carton count on dispatch run line or manifest line.
2. Optional reviewed carton rules by product/category.
3. Optional packaging/formula-derived carton estimates.
4. Optional order import-derived carton counts.

Do not infer carton counts from pack names without reviewed rules. Existing UOM planning already says pack units such as box, carton, tray and bottle must not be guessed. Logistics should follow the same rule.

## 10. Delivery And Address Data

Future dispatch needs:

- recipient name.
- delivery address lines.
- suburb/city.
- state.
- postcode.
- country.
- phone.
- email.
- delivery instructions.
- delivery date.
- time window if known.
- customer/account reference.
- carrier/service level.
- delivery zone.

Address/customer data should be owned by CRM/customer/order tables once they exist. Logistics may snapshot address text onto a manifest line for historical dispatch accuracy because delivery records need to preserve what was exported at the time.

The historical manifest snapshot must not become the editable master customer address.

## 11. Dispatch Source Data

Possible source records:

- future customer orders.
- future wholesale orders.
- imported ecommerce/export rows.
- production plan outputs.
- production batches once output stock exists.
- finished product inventory lots.
- manual dispatch demand in an early controlled v1.

Recommended near-term approach for task 220/221:

- create dispatch/manifest tables capable of referencing future orders but do not require CRM/order schema first.
- support manual dispatch line entry if needed for a first manifest workflow.
- include optional `source_type` and `source_id` fields only when the source model is clear enough.
- avoid broad polymorphic references where tenant boundaries cannot be enforced.

## 12. Inventory, QA And Production Controls

Logistics should respect existing operational controls:

- Stock On Hand physical quantity comes from posted `stock_movements`.
- Availability excludes formal active/release-requested QA holds through the task 217 hold availability helper.
- Inventory lots are source-of-truth for lot identity, lot code, expiry and QA context.
- Production plans and batches are planning records until future production execution creates output stock.
- QA holds are full-lot availability controls and do not duplicate physical quantity.
- Dispatch should not consume stock until a reviewed dispatch posting/release workflow exists.

Future dispatch posting should create outbound `stock_movements` only through a reviewed, transaction-safe RPC. It should not update historical receipt lines, lots or previous movement rows.

## 13. Delivery Issues

Delivery issues should capture operational exceptions without replacing Support:

- failed delivery.
- incorrect address.
- missing carton.
- damaged carton.
- late delivery.
- carrier rejection.
- customer complaint.
- returned goods.
- temperature concern.
- proof-of-delivery mismatch.

Support tickets should remain the customer/support conversation system. Logistics delivery issues should be operational records that can link to support tickets when an issue needs customer-facing handling.

## 14. Conceptual Data Model

Recommended future tables:

| Table | Owner | Tenant boundary | Notes |
| --- | --- | --- | --- |
| `delivery_zones` | Logistics | `organisation_id` | Tenant-defined zones/routes. |
| `carrier_profiles` | Logistics | `organisation_id` | Provider/carrier setup without secrets in client code. |
| `dispatch_runs` | Logistics | `organisation_id` | Dispatch header by date/category/carrier/zone. |
| `dispatch_run_lines` | Logistics | `organisation_id` | Demand/order/product lines assigned to a run. |
| `dispatch_allocations` | Logistics | `organisation_id` | Later lot/output allocation table. |
| `delivery_manifests` | Logistics | `organisation_id` | Generated/exportable manifest header. |
| `delivery_manifest_lines` | Logistics | `organisation_id` | Historical export line snapshot. |
| `delivery_status_events` | Logistics | `organisation_id` | Append-like delivery/provider status history. |
| `delivery_issues` | Logistics | `organisation_id` | Delivery exception record. |

Every tenant-owned table should include `organisation_id`. Cross-module foreign keys should use same-tenant composite references wherever practical, following the existing inventory, formula, production and QA patterns.

## 15. Status Lifecycles

Recommended dispatch run statuses:

- draft.
- planned.
- ready.
- manifested.
- dispatched.
- partially_delivered.
- delivered.
- issue.
- cancelled.
- archived.

Recommended manifest statuses:

- draft.
- ready.
- exported.
- accepted.
- failed.
- superseded.
- archived.

Recommended dispatch line statuses:

- draft.
- planned.
- blocked.
- allocated.
- packed.
- dispatched.
- delivered.
- issue.
- cancelled.

Recommended delivery issue statuses:

- open.
- investigating.
- waiting_on_carrier.
- waiting_on_customer.
- resolved.
- closed.
- archived.

The exact checks should remain practical in task 220. Avoid overly narrow statuses that cannot represent real carrier exceptions.

## 16. Permissions

Existing permission foundation includes:

- `logistics.view`.
- `logistics.manage`.

Recommended future permission keys:

- `logistics.dispatch.view`.
- `logistics.dispatch.create`.
- `logistics.dispatch.manage`.
- `logistics.manifests.view`.
- `logistics.manifests.generate`.
- `logistics.manifests.export`.
- `logistics.delivery_status.view`.
- `logistics.delivery_status.manage`.
- `logistics.delivery_issues.view`.
- `logistics.delivery_issues.manage`.
- `logistics.carriers.view`.
- `logistics.carriers.manage`.
- `logistics.zones.view`.
- `logistics.zones.manage`.

Recommended conservative mapping:

- `platform_admin`: all logistics permissions, mainly for support/diagnostics and setup.
- `organisation_admin`: all tenant logistics permissions.
- `operations_manager`: dispatch, manifest, delivery issue and zone management.
- `warehouse_manager`: dispatch and manifest operational management, no carrier credentials by default.
- `warehouse_user`: dispatch view and limited line/status updates later, no export configuration.
- `production_manager`: dispatch view/readiness only unless explicitly approved.
- `wholesale_manager`: wholesale dispatch visibility and delivery issue creation/view once CRM/order permissions exist.
- `phase_1_demo_user`: no new logistics write permissions by default.
- generic viewer roles: read-only logistics view only if approved; no create/manage/export permissions.

Do not grant broad logistics permissions merely to make demo data visible.

## 17. RLS And Security Plan

Future Logistics RLS should follow the existing helper pattern:

- `public.is_platform_admin()`.
- `public.is_active_member(organisation_id)`.
- `public.has_permission(organisation_id, required_permission_key)`.
- `public.current_profile_id()` where actor ownership is required.

Recommended policy shape:

- SELECT: active tenant membership plus relevant view permission, or platform admin.
- INSERT: relevant create/generate/manage permission, or platform admin.
- UPDATE: relevant manage/export/status permission, or platform admin.
- DELETE: omit in early versions.

Append-like tables, such as delivery status events, should avoid broad UPDATE/DELETE policies. Provider payloads should not expose secrets. Carrier credentials, if ever stored, need separate reviewed storage and likely server-only access.

## 18. Platform Admin Impact

Task 218 has no Platform Admin implementation impact.

Future Platform Admin should eventually show logistics diagnostics:

- whether the Logistics module is enabled per tenant.
- whether logistics feature flags are enabled.
- whether carrier/export configuration is ready.
- recent manifest export failures.
- delivery issue counts by status.
- dispatch readiness blockers.
- support tickets linked to logistics routes or delivery issues.

Platform Admin should not become the place where tenant staff run daily dispatch. It should provide operator oversight, tenant support, configuration visibility and diagnostics.

## 19. Support Impact

Task 218 has no Support implementation impact.

Future Support updates should include:

- Logistics guide.
- dispatch run guide.
- manifest export guide.
- Detrack/export troubleshooting.
- delivery exception troubleshooting.
- support-ticket context mapping for future logistics subroutes.
- release notes when real logistics workflows ship.

Support tickets should capture customer/operator conversation and linked context. Logistics delivery issues should remain operational records.

## 20. Audit Events

Future logistics workflows should write audit events for:

- dispatch run created.
- dispatch run updated.
- dispatch line blocked/unblocked.
- manifest generated.
- manifest exported.
- manifest export failed.
- delivery status imported/changed.
- delivery issue created.
- delivery issue resolved.
- carrier configuration changed.
- dispatch stock posting completed, if built later.

Audit logs should include tenant, actor, action, entity type, entity id, module key `logistics` and compact metadata. Do not store secrets or oversized provider payloads in audit metadata.

## 21. Reports

Future Reports module can read logistics records for:

- dispatch history.
- manifest export history.
- delivery issue trends.
- carrier performance.
- dispatch volume by day/category/zone.
- carton counts by carrier/date.
- late/failed delivery rates.
- customer/account delivery exception summaries.
- recall traceability once production and dispatch chains are complete.

Reports should consume Logistics read models or direct logistics records. Reports should not own or mutate dispatch state.

## 22. Dummy/Demo Cleanup

Current `/logistics` is a generic placeholder. Task 219 should replace it with an honest scaffold and remove any misleading impression that dispatch records, manifests or carrier integrations are live.

Future scaffold pages must:

- label unavailable workflows as planned.
- avoid fake carrier names or invented delivery data.
- avoid sample dispatch metrics that look real.
- avoid pretending Detrack is connected.
- avoid implying dispatch consumes stock before that posting workflow exists.

## 23. Task Staging

Recommended staging:

| Task | Scope | Notes |
| --- | --- | --- |
| 219 | Logistics Navigation + Scaffold v1 | Add honest routes/workspace shape only. No schema or writes. |
| 220 | Dispatch/Manifest Schema Foundation | Add reviewed tenant-owned tables, permissions and RLS. No Detrack API. |
| 221 | Dispatch Manifest UI v1 | First real reviewed manifest workflow. Keep review-first and no auto-stock posting unless explicitly approved. |
| Later | Carrier/export integration | Add Detrack export/import after manual manifest records are stable. |
| Later | Dispatch stock posting RPC | Create outbound stock movements atomically after allocation rules are reviewed. |
| Later | CRM/order integration | Replace manual demand with order/customer source records. |
| Later | Recall-grade forward traceability | Link finished output lots to dispatch/customer/order records. |

Do not begin tasks 219, 220 or 221 during task 218.

## 24. Risks And Follow-Up

Key risks:

- dispatch data duplicates future CRM/orders.
- manifest rows become the only source of customer address truth.
- carton counts are guessed from product names.
- Detrack payloads become source records instead of exports.
- dispatch consumes stock before production output and allocation rules are reviewed.
- QA-held stock is accidentally dispatched.
- provider credentials are exposed to the browser.
- broad logistics permissions are granted to demo or viewer roles.

Follow-up decisions needed before schema:

- Is manual dispatch demand acceptable for v1 before CRM/order tables?
- Which carrier/export fields are needed for the first Clean Eats Detrack-style manifest?
- Should delivery zones be configured before dispatch runs, or optional at first?
- Should carton counts be manual at first, or based on reviewed product rules?
- Which roles should export manifests?
- Should delivery issues be a logistics-owned table in task 220 or delayed until support/CRM integration is clearer?

## 25. Firm Decisions, Assumptions And Questions

### Firm Decisions

- Logistics should own dispatch and manifest records.
- Inventory remains the source of physical quantity and stock movement history.
- QA holds remain the source of held availability state.
- Production remains the source of planned/batch production records.
- CRM/future order tables should own customer/account/order master data.
- Detrack and other carriers are integration/export targets, not source-of-truth records.
- Early Logistics should be review-first and should not auto-post stock movements.
- All future tenant logistics tables must include `organisation_id`.
- RLS should use existing membership and permission helpers.
- No task 218 implementation changes are made.

### Material Assumptions

- Clean Eats needs residential and wholesale dispatch categories from the start.
- Clean Eats will need Detrack-compatible export support, but direct API integration can wait.
- Carton counts may initially be manually reviewed.
- Future orders/customer records may not exist before a first dispatch manifest workflow.
- Production output stock movement logic is not complete yet, so dispatch should not depend on produced stock until that chain is reviewed.

### Unresolved Questions

- What exact Detrack CSV/API fields does Clean Eats currently use?
- Are Made Active and Elite Meals separate customer accounts, brands, channels or delivery groups?
- Which carriers are internal runs versus external providers?
- Does Clean Eats dispatch by order, meal SKU, carton, route stop or customer account?
- Does the first v1 need proof-of-delivery import, or only manifest export?
- Which users should be allowed to export or mark dispatch as completed?
- Should delivery issue records exist before CRM/customer order records?

## Admin + Support Impact

Task 218 makes no Platform Admin or Support code changes.

Future Platform Admin should expose Logistics module readiness, carrier/export diagnostics, feature flags, permission visibility and support-ticket context. Future Support should add guides and troubleshooting only when user-facing logistics behaviour ships.

## Cross-Module Impact

| Module | Logistics relationship |
| --- | --- |
| Products | Finished products and packaging/carton rules are referenced, not duplicated. |
| Suppliers | No direct ownership; supplier delivery performance may become reporting context later. |
| Supplier Invoice Intake | Inbound invoice evidence remains separate from outbound dispatch. |
| Purchasing | Future purchase orders remain inbound, not logistics-owned. |
| Goods Inwards | Receiving remains inbound stock creation, not dispatch. |
| Inventory Lots | Logistics may allocate or dispatch lots later; lot identity remains Inventory-owned. |
| Stock Movements | Dispatch stock effects must be new outbound movements from a reviewed posting RPC later. |
| Stock On Hand | Logistics should read physical/held/available state, not recompute it differently. |
| Traceability | Dispatch/customer traceability becomes the future outbound branch. |
| UOM | Pack/carton conversions require reviewed UOM or carton rules; do not guess. |
| Costings | Dispatch cost reporting can later use costing snapshots but must not recalculate historical costs casually. |
| Formulas | Formulas may inform finished product and packaging requirements; Logistics should not own formula structure. |
| Production | Production outputs feed future dispatch readiness only after output stock exists. |
| QA | QA holds and checks can block dispatch; QA owns quality records. |
| Logistics | Owns dispatch runs, manifests, carrier handoff and delivery issues. |
| Reports | Reads logistics records for trend/report outputs. |
| CRM | Owns customers/accounts/orders when built; Logistics snapshots manifest delivery details. |
| Tools | Future import/export utilities may support manifests but should not own dispatch state. |
| Platform Admin | Tenant diagnostics and configuration visibility only. |
| Support | Ticket context and troubleshooting, not operational dispatch ownership. |
| Audit Logs | Captures important dispatch/manifest/provider events. |
| Permissions | Logistics permissions must remain granular and conservative. |

## Source-Of-Truth Notes

- Dispatch run and manifest records should be Logistics-owned.
- Customer/account/order master data should be CRM/order-owned later.
- Inventory lots and movements remain Inventory-owned.
- QA checks, reviews and holds remain QA-owned.
- Production plans and batches remain Production-owned.
- Manifest lines may snapshot delivery/export details for historical accuracy.
- Provider payloads are diagnostics/export evidence, not canonical business truth.
- Immutable or append-like delivery status and issue events should preserve history.

## Permission And RLS Impact

No permission or RLS changes are included in task 218.

Future task 220 should add granular logistics permissions, tenant-owned RLS policies and no anon access. Early write permissions should be limited to operational managers/admins. Viewer/demo access should stay read-only or absent unless explicitly approved.

## Behaviour Preserved

Task 218 preserves:

- existing `/logistics` placeholder behaviour.
- existing navigation.
- existing module registry.
- existing support page context.
- existing inventory, QA, production, support and platform admin behaviour.
- existing domains and middleware.
- existing database schema and migrations.
