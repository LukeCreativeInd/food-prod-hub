# Phase 2 Module Integration Map

> **Task 201 historical snapshot.** This document records the system state and proposed numbering at Task 201. QA and Logistics are no longer placeholder-only: Tasks 214-217 delivered the first QA foundations and Tasks 219-222 delivered the Logistics scaffold, dispatch/manifest workflow and carrier configuration. Use [Tasks 223-276 Revised Roadmap](./223-276-revised-roadmap.md) for current numbering and sequencing. Reports and CRM remain in the active roadmap at Tasks 242-246 and 236-241 respectively.

Task 201 maps how QA, Logistics, Reports and CRM should connect into the current Phase 1 EveryBatch / Clean Eats Hub operational foundation.

This is documentation only. It does not create UI, migrations, schema, RLS, permissions, auth/domain routing, DNS/Vercel/Supabase setting changes, business logic, packages or sample data.

## Executive Summary

Phase 1 remains the launch focus: Products, Supplier Invoice Intake, Costings, Inventory, Goods Inwards, Production Plan, Support and Platform Admin foundations. The Phase 2 modules should not be built as isolated workspaces. They need to attach to the records Phase 1 already owns.

The reason to map Phase 2 now is simple: QA, Logistics, Reports and CRM will all depend on the same product, supplier, formula, inventory, production and support records. If those future modules duplicate records or invent parallel status fields, the platform will become hard to trust.

The preferred approach is:

- keep Phase 1 source-of-truth tables authoritative
- add narrow Phase 2 tables only where a module owns new records
- use support tickets, audit logs and Platform Admin diagnostics as operating visibility layers
- keep reports read-only and derived from operational records
- document Admin, Support, RLS, permissions and cross-module effects in every future task

## Source-Of-Truth Principles

- `internal_items` remain the canonical tenant product/item master for ingredients, packaging, components and finished products.
- `suppliers`, `supplier_items`, `supplier_item_mappings`, price observations and approved prices remain the supplier and supplier-cost foundation.
- Supplier Invoice Intake owns invoice upload, extraction, review, supplier item mapping and supplier price commit.
- Goods Inwards owns physical receiving intent and receipt posting.
- `inventory_lots` represent received or produced stock lots.
- `stock_movements` own the inventory ledger.
- Production Plans and Batches own planned production intent and future execution records.
- Costing Snapshots own historical cost/margin records at a point in time.
- Support Tickets own customer/support communication and issue tracking, not module business state.
- Audit Logs should record important business events, not replace workflow tables.
- QA should not duplicate supplier, item, inventory lot, receipt or production batch records.
- Logistics should not duplicate production output, lot traceability, customer/order records or stock movements.
- Reports should read from operational records, views or data marts. Reports should not create business records.
- CRM should connect to customers, orders, wholesale context, support tickets and logistics later. It should not replace production, logistics, sell price or support records.

## QA Integration Map

QA should become the quality control layer over receiving, inventory, production and dispatch. It should attach quality records to the operational object being checked.

### Phase 1 Dependencies

- Products/internal items for item identity and item type.
- Suppliers for supplier quality history.
- Goods Inwards receipt lines for receiving checks.
- Inventory lots for hold/release, expiry and lot status.
- Stock movements for future QA hold/release movements.
- Production batches, inputs and outputs for in-process and finished product checks.
- Finished products and formulas for release criteria.
- Support tickets for user-reported quality issues.
- Audit logs for check completion, hold, release and non-conformance events.

### Future QA Areas

- Receiving QA checks:
  - delivery temperature
  - packaging condition
  - supplier acceptance/rejection
  - quantity/label verification
  - lot and expiry verification
- Inventory hold/release:
  - connect to `inventory_lots.qa_status`
  - connect to `inventory_lots.status`
  - later add stock movement types for QA hold and QA release if needed
- Production QA checks:
  - pre-op checks
  - batch start checks
  - in-process temperature/weight/label checks
  - finished product release checks
- Non-conformance:
  - supplier issue
  - receiving issue
  - production issue
  - dispatch issue
  - customer complaint link later
- QA templates/checklists:
  - tenant-owned checklist definitions
  - versioned templates if checklist changes must be historically auditable
- QA reporting:
  - receiving failures
  - held lots
  - released lots
  - non-conformance trends
  - supplier quality history

### Required Future Tables

Likely tables, subject to a dedicated QA planning task:

- `qa_check_templates`
- `qa_check_template_items`
- `qa_checks`
- `qa_check_results`
- `qa_non_conformances`
- `qa_hold_release_events`

Each tenant-owned QA table should include `organisation_id`. Any relationship to receipts, lots, stock movements or production batches should use same-tenant composite references where practical.

### Required Permissions

- `qa.view`
- `qa.manage`
- `qa.checks.complete`
- `qa.signoffs.manage`
- likely future `qa.holds.manage`
- likely future `qa.non_conformances.manage`

Phase 1 demo/staff roles should receive only the minimum QA permissions needed for testing.

### Platform Admin Impact

Platform Admin should eventually show:

- whether QA module is enabled for a tenant
- QA schema/setup readiness
- count of open holds/non-conformances
- failed QA write diagnostics
- support tickets linked to QA paths

Platform Admin should not edit tenant QA records in v1 except through explicit support/admin workflows planned later.

### Support Impact

Support will need:

- QA getting-started guide
- receiving QA troubleshooting
- hold/release troubleshooting
- non-conformance guide
- context-aware support mapping for QA routes
- release notes when QA checks become live

### What Not To Duplicate

- Do not duplicate supplier records.
- Do not duplicate internal item records.
- Do not duplicate receipt lines.
- Do not duplicate inventory lots.
- Do not duplicate production batch records.
- Do not use QA tables as a second stock ledger.

## Logistics Integration Map

Logistics should manage dispatch and delivery workflows after production and inventory can tell the system what finished stock exists and where it is.

### Phase 1 Dependencies

- Finished product `internal_items`.
- Inventory lots for available finished goods.
- Stock movements for dispatch issue records later.
- Production batches and future production output lots.
- Customer/order data from future CRM or ecommerce integrations.
- Support tickets for delivery issues.
- Audit logs for manifest creation, dispatch and delivery status changes.
- Reports for dispatch history and exceptions.

### Future Logistics Areas

- Dispatch planning:
  - group orders or finished product demand into dispatch runs
  - link dispatch line items to available lots where traceability is required
- Manifest generation:
  - produce Detrack/export-ready manifests later
  - store generated manifest state
- Delivery provider integration:
  - Detrack export/import
  - status updates
  - delivery exceptions
- Order/batch allocation:
  - connect finished stock to orders
  - avoid dispatching held or unavailable lots
- Dispatch stock movements:
  - planned later after stock-on-hand and production output movement are stable

### Required Future Tables

Likely tables, subject to Logistics deep planning:

- `dispatch_runs`
- `dispatch_run_lines`
- `delivery_manifests`
- `delivery_status_events`
- `delivery_provider_connections` or integration-specific connection records later

Each tenant-owned logistics table should include `organisation_id`.

### Required Permissions

- `logistics.view`
- `logistics.manage`
- likely future `logistics.dispatch.manage`
- likely future `logistics.manifests.export`
- likely future `logistics.delivery_status.manage`

### Platform Admin Impact

Platform Admin should eventually show:

- whether Logistics is enabled
- integration readiness, especially Detrack
- dispatch sync failures
- delivery exception counts
- support tickets linked to delivery/dispatch paths

### Support Impact

Support will need:

- dispatch guide
- delivery exception troubleshooting
- Detrack/export troubleshooting
- context-aware support mapping for logistics and dispatch routes
- release notes for each provider/integration change

### What Not To Duplicate

- Do not duplicate production output records.
- Do not duplicate inventory lots.
- Do not create a parallel stock movement ledger.
- Do not duplicate CRM/customer account records.
- Do not store provider-specific payloads as the only source of dispatch truth.

## Reports Integration Map

Reports should be read-only visibility over trusted operational records. Reports should not own source business data.

### Phase 1 Dependencies

Reports should read from:

- products/internal items
- suppliers and supplier item mappings
- supplier prices and approved prices
- formulas and formula lines
- sell prices
- costing snapshots
- inventory receipts and receipt lines
- inventory lots
- stock movements
- production plans and batches
- future QA checks, holds and non-conformances
- future logistics dispatch/manifest records
- support tickets for tenant health and support workload reporting
- audit logs for operational traceability

### Report Groups

- Inventory reports:
  - stock on hand
  - stock movements
  - receiving history
  - expiry report
  - held/rejected stock
- Costing reports:
  - costing snapshot history
  - margin trend
  - supplier price movement
  - missing price/conversion blockers
- Production reports:
  - planned vs actual
  - batch history
  - ingredient/component usage
  - production readiness
- QA reports:
  - checks
  - holds
  - non-conformance
  - supplier quality
- Logistics reports:
  - dispatch history
  - delivery exceptions
  - manifest status
- Platform/Admin reports:
  - tenant readiness
  - enabled modules
  - feature flags
  - support ticket volume
  - failed workflow diagnostics

### Phase Timing

- Phase 1/early Phase 2: inventory stock-on-hand, movement ledger, receiving history, costing snapshot history, margin readiness.
- Phase 2: QA hold/non-conformance and production planning/readiness reports.
- Later Phase 2/Phase 3: logistics dispatch and delivery exception reports.
- Phase 3: CRM/customer and commercial reports.

### Required Future Views

Likely views/data marts, subject to a Reports planning task:

- `report_inventory_stock_on_hand`
- `report_inventory_movements`
- `report_costing_snapshot_summary`
- `report_supplier_price_movement`
- `report_production_batch_status`
- `report_qa_hold_summary`
- `report_tenant_health`

Use views or materialised views only when query complexity/performance justifies it.

### Required Permissions

- `reports.view`
- `reports.manage`
- module-specific report permissions later if needed, such as `reports.inventory.view` or `reports.qa.view`

### Platform Admin Impact

Platform Admin should use reports for tenant health diagnostics, not tenant business control. Cross-tenant reporting must remain platform-admin-only.

### Support Impact

Support will need report guides, troubleshooting for missing data, and Platform Admin diagnostics for report blockers.

### What Not To Duplicate

- Do not store report-only copies of business records unless using documented reporting views/materialised views.
- Do not make reports a write surface for operational records.
- Do not let report filters bypass tenant isolation or RLS.

## CRM Integration Map

CRM should stay deliberately later. Clean Eats Phase 1 does not need a full CRM to validate operations.

### Future Dependencies

CRM may later connect to:

- customer/accounts
- wholesale customers
- customer-specific product requirements
- sales/order history
- pricing channels and sell prices
- logistics and dispatch history
- customer complaints/support tickets
- reports

### Likely Future Tables

Subject to a CRM deep planning task:

- `customers`
- `customer_contacts`
- `customer_accounts`
- `customer_price_channels` or links to sell price channels
- `customer_requirements`
- `customer_interactions`

### What CRM Should Not Own

- CRM should not own production plans.
- CRM should not own dispatch records.
- CRM should not own support ticket records.
- CRM should not own sell price records unless explicitly designed as commercial pricing.
- CRM should not replace wholesale/order integration planning.

### When To Build CRM

CRM should come after:

- stock-on-hand and inventory reports
- production execution foundations
- logistics dispatch planning
- report foundations

The exception is a specific Clean Eats requirement for wholesale accounts or customer-specific requirements.

### Platform Admin Impact

Platform Admin may need module enablement and tenant readiness visibility. It should not expose customer records cross-tenant except for explicit platform_admin support/debug access.

### Support Impact

Support will need CRM guides only when customer/account features become real. Support ticket context should eventually link customer complaints to CRM customers where appropriate.

## Cross-Module Lifecycle Map

| Step | Source Table Now Or Future | Module Owner | Current Readiness | Future Integration Needed |
| --- | --- | --- | --- | --- |
| Supplier invoice uploaded | `purchase_documents` | Supplier Invoice Intake | Real for supported PDFs | More parsers, diagnostics, attachments hardening |
| Invoice lines reviewed | `purchase_document_lines` | Supplier Invoice Intake | Real review-first flow | More validation, generic extraction improvements |
| Price/mapping approved | supplier item/mapping/price tables | Supplier Invoice Intake / Costings | Real commit foundation | Mapping QA, UOM conversion |
| Draft receiving suggested | `inventory_receipts`, `inventory_receipt_lines` | Supplier Invoice Intake -> Inventory | Real draft bridge | More line edit and posting hardening |
| Physical receipt posted | receipts, lots, movements | Inventory | Real v1 | Transaction/RPC hardening, UOM conversion |
| Inventory lot created | `inventory_lots` | Inventory | Real v1 | QA hold/release, stock-on-hand summary |
| Stock movement recorded | `stock_movements` | Inventory | Real v1 | Reports, traceability, audit events |
| Production planned | `production_plans`, `production_plan_lines` | Production | Real v1 | Stock availability, input generation |
| Batch header created | `production_batches` | Production | Real v1 | Input requirements, release workflow |
| Inputs generated | `production_batch_inputs` | Production | Schema exists, workflow future | Formula expansion, UOM conversion |
| Stock issued to production | future issue workflow / `stock_movements` | Production + Inventory | Not built | Lot allocation, availability, audit |
| Production output created | future output lots/movements | Production + Inventory | Not built | Finished goods lots, QA release |
| QA release | future QA checks/hold release | QA | Not built | Lot/batch status integration |
| Dispatch/logistics | future dispatch tables/movements | Logistics | Not built | CRM/orders, Detrack, traceability |
| Reports/traceability | future views/reports | Reports | Scaffold only | Data marts, permissions, performance |

## Permission And Platform Admin Matrix

| Module | Tenant Permissions Needed | Platform Admin Visibility Needed | Feature Flag / Module Impact | Support Impact | Reporting Impact |
| --- | --- | --- | --- | --- | --- |
| QA | `qa.view`, `qa.manage`, check/hold/NC permissions | Module readiness, open holds, NC counts | QA module controls checks and hold/release | QA guides and issue tickets | QA reports and held stock |
| Logistics | `logistics.view`, `logistics.manage`, dispatch/export permissions | Integration readiness, dispatch failures | Logistics module plus Detrack/integration flags | Delivery troubleshooting | Dispatch and exception reports |
| Reports | `reports.view`, `reports.manage`, possibly per-domain report permissions | Tenant health/report readiness | Reports module and report-feature flags | Missing-data troubleshooting | Core read-only output |
| CRM | `crm.view`, `crm.manage` | Tenant commercial module readiness | CRM/Wholesale module decisions | Customer/account support later | Customer/order/commercial reports |
| Production | production planning/batch/task permissions | Planning readiness, blocked batch counts | Production module and task/tablet flags | Production blockers | Planned vs actual reports |
| Inventory | location/receipt/lot/movement permissions | Stock readiness and failed posting diagnostics | Inventory module and receiving flags | Receiving/stock support | Stock and traceability reports |
| Costings | costings, formulas, sell prices, snapshots | Missing costs/margins by tenant | Costings module and formula features | Cost/margin troubleshooting | Cost/margin reports |
| Supplier Invoice Intake | purchase document upload/review/commit permissions | Parser/storage/error diagnostics | Tools module and parser flags | Upload/parser support | Supplier price movement reports |

## Support And Docs Impact Matrix

| Workflow | Support Guide Needed | Troubleshooting Needed | Context-Aware Routes | Release Note Requirements | Platform Support Diagnostics |
| --- | --- | --- | --- | --- | --- |
| Receiving QA | Yes | Temperature/acceptance/rejection blockers | `/qa`, `/goods-inwards`, future QA detail routes | When QA checks go live | Failed QA writes, held receipt lines |
| Inventory hold/release | Yes | Held stock unavailable, release errors | `/qa`, `/stock-locations`, future lot detail | When hold/release affects availability | Held lot counts by tenant |
| Production QA | Yes | Missing checks, failed release, batch blockers | `/production-plan`, future batch/check routes | When production QA goes live | Open checks and blocked batches |
| Logistics dispatch | Yes | Manifest/export failures, delivery exceptions | `/logistics`, future dispatch routes | Each logistics workflow release | Provider sync errors |
| Reports | Yes | Missing data and stale views | `/reports`, report detail routes | New report groups | Report freshness and permissions |
| CRM | Later | Customer/account lookup and data quality | `/crm`, future customer routes | When CRM becomes real | Customer data health |
| Production Plan | Existing guide should grow | Blocked lines, formula/readiness issues | `/production-plan` | Already noted, grow later | Blocked line/batch counts |
| Support Tickets | Existing | Visibility/status workflow | `/support/tickets` | Ticket changes | Inbox filters, status health |

## Scaffold And Demo Cleanup Findings

No UI was rebuilt in this task. Current findings:

| Route | Current State | Scaffold/Demo Content | Recommended Replacement Task | Risk |
| --- | --- | --- | --- | --- |
| `/qa` | Placeholder page | Generic QA placeholder text | 211 QA Module Deep Planning, then 212/213 | Low; clearly placeholder |
| `/qa-checks` | Placeholder route through QA nav | Future checks/sign-off surface | 212 QA Schema Foundation, 213 Receiving QA Checks UI | Medium if staff expect real checks |
| `/qa-sign-offs` | Placeholder route through QA nav | Future sign-off surface | 211/212 QA planning/schema | Medium |
| `/qa-incidents` | Placeholder route through QA nav | Future incidents/NC surface | 211/212 QA planning/schema | Medium |
| `/logistics` | Placeholder page | Generic dispatch/delivery placeholder | 229 Logistics Module Deep Planning, 230/231 | Low; clearly placeholder |
| `/reports` | Placeholder page | Generic reports placeholder | 232 Reports Module Deep Planning, 233+ | Medium; reports are expected soon |
| `/crm` | Placeholder page | Generic CRM placeholder | 238 CRM Module Deep Planning | Low; later module |
| `/production-report` | Static production report preview | Sample numbers and demo report sections | 232 Reports planning, 236 Production Reports v1 | High if confused with real report |
| `/production-tasks` | Static production task preview | Sample task rows and fake counts | 226/227/228 Production Tasks | High if used in staff demo without warning |
| `/facility-tasks` | Static touch-friendly preview | Sample task cards, issue/waste placeholders | 228 Facility/iPad View v1 | High if floor staff think it saves |
| `/production-areas` | Static area preview | Sample areas/counts | 225 Production Areas UI v1 | Medium; schema exists but UI not live |

Current QA/Logistics/Reports/CRM placeholder copy is not misleading enough to change immediately. The production report/tasks/facility pages are more demo-like and should remain clearly labelled until replaced.

## Recommended Task Order Notes

At Task 201, the then-current 201-250 roadmap order looked sensible:

- Keep 202 UOM Conversion Foundation Plan next because UOM rules affect receiving, costing, inventory, production and reports.
- Keep stock-on-hand planning/UI before production stock availability and release.
- Keep QA deep planning before QA schema/UI.
- Keep production input generation and availability checks before production release/stock issue.
- Keep Logistics after inventory/production foundations because dispatch should depend on finished goods stock and traceability.
- Keep Reports planning after more operational records exist, but define reporting dimensions early.
- Keep CRM later unless Clean Eats identifies a specific wholesale/customer operational need.

No task order change was required from this map at Task 201. Task 223 now supersedes that future sequence with the approved Tasks 223-276 roadmap.

## Admin + Support Impact

This planning task affects future Admin and Support requirements only.

Future Platform Admin should eventually show module readiness, feature flag readiness, tenant health, failed workflow diagnostics and support/inbox context for QA, Logistics, Reports and CRM.

Future Support Help Centre content should include guides, troubleshooting and release notes for each future module as it moves from scaffold to real workflow. Context-aware support ticket mapping already includes QA, Logistics, Reports and CRM top-level routes, but it will need detail-route mappings when those modules get real records.

## Cross-Module Impact

Every future Phase 2 task should state:

- which existing Phase 1 source-of-truth table it reads
- which new table it owns, if any
- whether it affects inventory availability
- whether it affects costing/margin readiness
- whether it affects production readiness
- whether it affects QA status or traceability
- whether it affects reports and audit logs
- whether it requires Support Help Centre/troubleshooting updates

## Behaviour Preserved

- no migrations were created
- no schema, RLS or permission changes were made
- no UI or business logic was built
- no packages were added
- no live workflows were changed
