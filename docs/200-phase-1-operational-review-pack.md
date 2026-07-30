# Phase 1 Operational Review Pack

Task 200 is the checkpoint after tasks 001-199. It reviews what EveryBatch / Clean Eats Hub can demonstrate now, what is real, what remains scaffolded, and what should guide tasks 201 onward.

This is documentation only. It does not create UI, migrations, schema, RLS, permissions, auth/domain routing, DNS/Vercel/Supabase setting changes, business logic, packages or sample data.

## Executive Summary

EveryBatch is now a multi-tenant Food Manufacturing OS foundation. Clean Eats Hub is Tenant 1 and is the first customer workspace used to prove the core operating model.

Clean Eats Hub can now demonstrate:

- authenticated domain-aware access across central app, tenant app, Platform Admin and Support
- tenant app shell, branding and workspace selection
- Products/internal item catalogue foundations
- supplier and internal item manual management
- supplier invoice upload, extraction, review and commit for supported supplier patterns
- formula builders for components and finished products
- sell price and meal margin readiness
- costing snapshot creation and locked snapshot detail
- Goods Inwards receiving with receipt posting into lots and stock movement ledger rows
- supplier invoice to draft Goods Inwards bridge
- first real Production Plan UI with planned output lines and planned batch headers
- authenticated support guides, customer support tickets and Platform Admin support inbox

Current readiness level:

- Strong foundation for internal demo and Clean Eats test data loading.
- Ready for controlled staff workflow testing in Products, Costings, Supplier Invoice Intake, Goods Inwards and Production Plan.
- Not yet ready for live operational cutover because UOM conversion, stock-on-hand summaries, production stock issue/output, QA checks, reports and transaction hardening remain incomplete.

## Architecture Summary

### Multi-Tenant Model

EveryBatch uses one codebase and tenant-owned data. `organisations` represent tenants. Tenant-owned tables use `organisation_id`, and newer foundations use composite tenant foreign keys where same-tenant relationships matter.

Clean Eats is seeded as Tenant 1. Future tenant creation exists as a controlled Platform Admin foundation but does not yet provision complete onboarding, users or data imports automatically.

### Domains And App Modes

Current live domains:

- `app.everybatchmrp.com` = central login / workspace selector gateway
- `admin.everybatchmrp.com` = Platform Admin
- `cleaneats.everybatchmrp.com` = Clean Eats tenant workspace
- `support.everybatchmrp.com` = authenticated support/help centre
- localhost = permissive development

Do not use `admin.everybatchmrp.com.au`.

Domain/app-mode routing protects surfaces from rendering in the wrong place while keeping localhost permissive.

### Auth, Memberships, Roles And Permissions

Supabase Auth is active. Profiles and organisation memberships connect users to tenants. Roles and permissions control navigation and route access. Platform admin users can access Platform Admin. Tenant users access tenant routes through membership-aware guards.

RLS is active on current public data tables, including foundations for products, purchase documents, formulas, sell prices, support tickets, costing snapshots, inventory and production planning.

### Tenant App

The tenant app shell is the Clean Eats Hub workspace. It includes module navigation, workspace switching, support entry points, global search, branding controls and tenant-aware page titles.

### Platform Admin

Platform Admin has a separate shell at `/platform`. Current functionality is mostly read-only or controlled foundation work:

- tenant overview
- Clean Eats tenant detail
- tenant module/feature overview
- new tenant scaffold/create foundation
- tenant onboarding checklist
- support inbox
- branding foundation

### Support Help Centre

Support is authenticated and available through `support.everybatchmrp.com`. It includes static guides, troubleshooting, release notes, customer support tickets, context-aware ticket creation and Platform Admin support inbox workflows.

Support ticket attachments have schema/storage helper foundation but no attachment UI yet.

### Database Migration Status

Migrations 001-036 cover:

- tenant/auth/roles/permissions/RLS foundations
- modules, organisation modules and feature flags
- purchase document intake and storage helpers
- formulas
- inventory locations
- branding/theme/storage foundations
- sell prices
- support tickets and attachments foundation
- costing snapshots
- inventory receipts/lots/stock movements
- production planning schema

Migration application status should still be confirmed in Supabase before any workflow relying on newer tables is tested.

### Storage Buckets

Current storage areas include private purchase document uploads and organisation branding assets. Support ticket attachment storage is planned/foundation only and requires manual policy/UI follow-up before use.

## Module-By-Module Review

### Dashboard

- Routes: `/dashboard`
- Real functionality: tenant-aware dashboard summaries from real setup data where available.
- Scaffold/future: full operating KPIs, stock-on-hand, production readiness and reports.
- Tables: mixed read-only summaries from products, costings, inventory and production.
- Permissions: tenant app access and enabled-module navigation.
- Admin/Support impact: support context available through Help menu.
- Cross-module links: Products, Costings, Inventory, Production.
- Gaps: needs real KPI definitions and report data.
- Recommended next tasks: reports planning, tenant health diagnostics.

### Products

- Routes: `/products`, `/suppliers`, `/suppliers/[id]`, `/ingredients`, `/packaging`, `/components`, `/components/[id]`, `/finished-products`, `/finished-products/[id]`, `/recipes`
- Real functionality: suppliers, internal items, components, finished products, detail pages and formula builders.
- Scaffold/future: Recipes remains a signpost rather than a separate table.
- Tables: `suppliers`, `supplier_items`, `supplier_item_mappings`, `internal_items`, `formula_versions`, `formula_lines`.
- Permissions: products/module permissions, formula permissions, demo read-only posture.
- Admin/Support impact: support guide content exists for Products and Formula Builder.
- Cross-module links: Supplier Invoice Intake, Costings, Inventory, Production Plan.
- Gaps: import workflows, item QA, duplicate cleanup, item lifecycle governance.
- Recommended next tasks: data collection/import workflow, supplier/internal item mapping QA tool.

### Costings

- Routes: `/costings`, `/ingredient-costs`, `/packaging-costs`, `/component-costs`, `/sell-prices`, `/meal-margins`, `/price-history`, `/costing-snapshots/[id]`
- Real functionality: supplier price observations, approved prices, formula readiness, sell price management, margin preview, manual costing snapshots.
- Scaffold/future: automated margin history and reporting.
- Tables: approved supplier prices, price observations, formulas, sell prices, costing snapshots.
- Permissions: costings/formulas/sell price/snapshot permissions.
- Admin/Support impact: support troubleshooting covers blocked margins and snapshots.
- Cross-module links: Products, Supplier Invoice Intake, Inventory, Production Plan.
- Gaps: UOM conversion, yield/waste/raw-to-cooked modelling, reporting.
- Recommended next tasks: UOM conversion plan/schema/UI, costing reports.

### Inventory

- Routes: `/inventory`, `/stock-locations`, `/stock-locations/[id]`, `/goods-inwards`, `/goods-inwards/new`, `/goods-inwards/[id]`, `/stock-movements`, `/batch-receiving`, `/bom-traceability`, `/purchasing`
- Real functionality: stock locations, manual Goods Inwards, receipt lines, posting to inventory lots and stock movements, stock movement ledger.
- Scaffold/future: stock-on-hand summary, purchasing, BOM traceability, batch receiving polish.
- Tables: `inventory_locations`, `inventory_receipts`, `inventory_receipt_lines`, `inventory_lots`, `stock_movements`.
- Permissions: inventory receipt/location/movement permissions.
- Admin/Support impact: support troubleshooting covers Goods Inwards blockers.
- Cross-module links: Supplier Invoice Intake, Costings, Production, QA, Reports.
- Gaps: stock-on-hand, transaction/RPC posting hardening, UOM conversions, QA hold/release.
- Recommended next tasks: Goods Inwards edit/hardening, posting RPC, stock-on-hand.

### Supplier Invoice Intake / Tools

- Routes: `/purchase-documents`, `/purchase-documents/[id]`, `/tools/purchase-documents`, `/tools/supplier-invoice-intake`
- Real functionality: private PDF upload, extraction registry, supported supplier parsers, review UI, generic commit, supplier/item/price creation, invoice-to-receiving draft bridge.
- Scaffold/future: generic OCR/AI extraction, purchase order matching, broad supplier coverage.
- Tables: purchase document intake tables, suppliers, supplier items, mappings, price observations, approved prices, inventory receipts when bridging.
- Permissions: purchase document permissions; demo user intentionally blocked.
- Admin/Support impact: support guide/troubleshooting exists; support tickets can include page context.
- Cross-module links: Products, Costings, Inventory, Goods Inwards.
- Gaps: parser coverage, file diagnostics, duplicate handling at scale, purchase orders.
- Recommended next tasks: item/supplier mapping QA, import/data workflow, purchase order plan later.

### Production

- Routes: `/production`, `/production-plan`, `/production-plan/new`, `/production-plan/[id]`, `/production-areas`, `/production-tasks`, `/facility-ipad-view`, `/production-report`
- Real functionality: Production dashboard readiness and Production Plan UI v1 with real plan headers, output lines and planned batch headers.
- Scaffold/future: production areas management, production task execution, facility/iPad view, production reporting.
- Tables: `production_areas`, `production_plans`, `production_plan_lines`, `production_batches`, `production_batch_inputs`.
- Permissions: production planning and batch permissions.
- Admin/Support impact: support guide and troubleshooting now mention Production Plan.
- Cross-module links: Products/internal items, formulas, costing snapshots, inventory lots/locations, future QA/logistics/reports.
- Gaps: input requirement generation, stock availability, release workflow, stock issue/output movements, QA, tablet execution.
- Recommended next tasks: production input generation, stock availability, production release and production stock movement plans.

### QA

- Routes: `/qa`, `/qa-checks`, `/qa-sign-offs`, `/qa-incidents`
- Real functionality: mostly scaffold/navigation readiness.
- Scaffold/future: checks, templates, receiving QA, production QA, non-conformance, hold/release.
- Tables: no deep QA tables yet beyond simple QA fields on inventory lot/receipt line foundations.
- Permissions: QA module/navigation permissions.
- Admin/Support impact: support guide planned, no deep content yet.
- Cross-module links: Inventory receiving, production batches, traceability, reports.
- Gaps: QA schema, checklists, hold/release and non-conformance.
- Recommended next tasks: QA deep planning, QA schema, receiving QA UI.

### Logistics

- Routes: `/logistics`
- Real functionality: scaffold only.
- Scaffold/future: dispatch, delivery manifests, Detrack, traceability.
- Tables: none dedicated yet.
- Permissions: module/nav only.
- Admin/Support impact: support guide planned.
- Cross-module links: Production, stock lots, customers, reports.
- Gaps: all logistics data model and UI.
- Recommended next tasks: logistics deep planning, dispatch schema/UI scaffold.

### CRM

- Routes: `/crm`, `/wholesale`
- Real functionality: scaffold only.
- Scaffold/future: customers, wholesale accounts, insights.
- Tables: none dedicated yet.
- Permissions: module/nav only.
- Admin/Support impact: no active support content beyond planned guides.
- Cross-module links: orders/demand, logistics, reports.
- Gaps: CRM value proposition and schema.
- Recommended next tasks: CRM deep planning after operations foundation.

### Reports

- Routes: `/reports`, `/production-report`
- Real functionality: scaffold only.
- Scaffold/future: stock, cost, production, QA, margin and operational reports.
- Tables: future views/data marts.
- Permissions: module/nav only.
- Admin/Support impact: release notes/support guide future.
- Cross-module links: every operational module.
- Gaps: report definitions, data marts/views, exports.
- Recommended next tasks: reports deep planning and reports views plan.

### Admin / Organisation Settings

- Routes: `/organisation-settings`, `/users`, `/modules`, `/integrations`
- Real functionality: tenant branding/settings controls, logo upload, module/user/integration placeholders.
- Scaffold/future: full tenant admin, users/roles management, integration credentials.
- Tables: organisations, settings, branding, modules, memberships, roles/permissions.
- Permissions: admin organisation/module/user/integration permissions.
- Admin/Support impact: support and Platform Admin diagnostics should later surface configuration issues.
- Cross-module links: tenant-wide.
- Gaps: user invite flows, integration credentials, full module enablement admin.
- Recommended next tasks: tenant admin maturity later.

### Platform Admin

- Routes: `/platform`, `/platform/tenants`, `/platform/tenants/new`, `/platform/tenants/cleaneats`, `/platform/support`, `/platform/branding`
- Real functionality: separate shell, tenant overview, new tenant foundation, support inbox, branding foundation.
- Scaffold/future: tenant health, diagnostics, billing/subscription, provisioning automation.
- Tables: organisations, modules, feature flags, memberships, support tickets, platform branding.
- Permissions: platform admin role/access.
- Admin/Support impact: core operator surface.
- Cross-module links: tenant health across all modules.
- Gaps: tenant diagnostics, module health, billing, provisioning completion.
- Recommended next tasks: tenant health and support/module diagnostics.

### Support Help Centre

- Routes: `/support`, `/support/guides`, `/support/tickets`, `/support/tickets/new`, `/support/troubleshooting`, `/support/release-notes`
- Real functionality: authenticated support shell, static guides, ticket creation/detail/list, Platform Admin inbox.
- Scaffold/future: attachments UI, email notifications, realtime, knowledge base admin.
- Tables: support tickets/comments/events and support ticket attachment foundation.
- Permissions: active tenant member and platform admin RLS patterns.
- Admin/Support impact: core support surface.
- Cross-module links: context-aware tickets can reference module/page context.
- Gaps: attachment UI, SLA, notifications, guide management.
- Recommended next tasks: support attachments UI later, support diagnostics.

## Real Vs Scaffold Matrix

| Area | Real/data-backed now | Partial/scaffold | Not built yet | Needs Clean Eats data/testing | Risk | Next task |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Real setup summaries | KPI depth | Full ops dashboard | Yes | Medium | Reports/tenant health |
| Products | Suppliers/internal items/formulas | Recipes signpost | Import QA | Yes | Medium | 244/246 |
| Costings | Prices, sell prices, snapshots | Reports | UOM conversion | Yes | High | 202-204 |
| Inventory | Receipts/lots/movements | Batch receiving/BOM traceability | Stock-on-hand | Yes | High | 205-209 |
| Supplier Invoice Intake | Upload/extract/review/commit/bridge | Supplier coverage | OCR/PO matching | Yes | Medium | 244/246 |
| Production Plan | Plans/lines/batch headers | Areas UI/tasks/report | Stock issue/output | Yes | High | 215-224 |
| QA | Basic placeholders | QA status fields | Checks/hold/release | Yes | High | 211-214 |
| Logistics | Navigation only | None | Dispatch/manifests | Yes | Medium | 229-231 |
| CRM | Navigation only | None | CRM schema/UI | Later | Low | 238-239 |
| Reports | Navigation only | Some data pages | Report suite | Yes | High | 232-237 |
| Platform Admin | Tenant/support foundations | Diagnostics | Billing/provisioning completion | Yes | Medium | 240-241 |
| Support | Tickets/guides/inbox | Attachments foundation | Notifications/SLA | Yes | Medium | later attachments UI |

## Phase 1 Launch Readiness

| Capability | Readiness |
| --- | --- |
| Products | Ready for Clean Eats test data |
| Suppliers | Ready for Clean Eats test data |
| Internal items | Ready for Clean Eats test data |
| Components | Ready for workflow QA |
| Finished products | Ready for workflow QA |
| Formula builders | Ready for Clean Eats test data |
| Costings | Needs workflow QA |
| Sell prices | Ready for Clean Eats test data |
| Meal margins | Needs workflow QA |
| Costing snapshots | Needs workflow QA |
| Supplier Invoice Intake | Ready for controlled internal demo |
| Goods Inwards | Needs workflow QA |
| Stock movements | Ready for internal demo |
| Supplier invoice to receiving bridge | Needs workflow QA |
| Production Plan UI | Ready for Clean Eats test data |
| QA | Scaffold only |
| Logistics | Scaffold only |
| Reports | Scaffold only |
| CRM | Scaffold only |
| Platform Admin | Ready for internal operator demo |
| Support tickets | Ready for internal demo |
| Support attachments | Schema only |

## Data Required From Clean Eats

- supplier master review
- internal item master
- ingredient base units
- packaging base units
- supplier item mapping confidence review
- pack/UOM conversions such as bunch to grams, carton to each, box to kg, bottle to ml
- component recipes/formulas
- finished product formulas
- sell prices and sales channels
- production areas
- stock locations
- lot, expiry and use-by rules
- receiving procedures
- QA receiving checks
- production batch procedures
- production task/room workflow
- logistics and dispatch workflow
- reports required by Tony and Clean Eats
- role/permission expectations for real staff

## Critical Known Gaps

- UOM Conversion Foundation
- pack conversions such as bunch to g, carton to each, box to kg, bottle to ml
- formula yield, waste and cooked vs raw weight modelling
- stock-on-hand summary
- production stock reservation, issue and output movements
- production task execution
- QA hold/release/checklists
- logistics, dispatch and traceability
- reporting and exports
- audit log integration for business events
- permissions QA for real staff
- import/data collection workflows
- transaction/RPC hardening for posting flows
- support attachments UI
- automated regression tests
- production-grade monitoring/reporting

## Manual Testing Checklist

- Login, logout, workspace selector and domain redirects.
- Tenant app shell navigation, branding, global search and Help menu.
- Support ticket creation from a normal page and from context-aware Help menu.
- Platform Admin support inbox list, filters, detail, customer reply and internal note.
- Supplier Invoice Intake upload, extraction, review, commit and duplicate/repeat behaviour.
- Goods Inwards manual receipt creation, line creation and posting.
- Supplier invoice to receiving draft creation and duplicate prevention.
- Stock movement ledger after receipt posting.
- Products, suppliers and internal item detail pages.
- Component and finished product formula builders.
- Sell price management and Meal Margins readiness.
- Costing snapshot creation and detail.
- Production Plan list, new plan, add line, blocked line handling and planned batch creation from planned/ready lines only.
- Demo/read-only user checks.
- Platform Admin access blocked for non-platform users.
- Support guide and troubleshooting pages.

## Risks And Hardening Priorities

- RLS safety must be rechecked after each new table/policy.
- Sequential write flows should move to transaction-safe RPCs where partial writes are risky.
- Unit conversion gaps can block costing, receiving and production confidence.
- Data quality risk is high until Clean Eats masters/formulas/conversions are reviewed.
- User permission risk remains until real staff roles are tested.
- Demo/scaffold confusion risk remains in QA, Logistics, CRM, Reports and some production surfaces.
- Automated test coverage is still thin.
- Monitoring and operational reporting are not production-grade yet.

## Task Standards From 201 Onward

Every future task should include:

- Scope
- Non-goals
- Admin + Support impact
- Cross-module impact
- Dummy/demo cleanup impact
- Permission/RLS impact
- Data model impact
- Support guide/troubleshooting/release note impact
- SQL migration full-content requirement
- Smoke checks
- Behaviour preserved
- Known gaps

If a migration is created or changed, Codex must paste the full SQL in the final response under `FULL SQL MIGRATION CONTENTS`. Do not only reference the migration file path.

## Behaviour Preserved

- no migrations were created
- no schema, RLS or permission changes were made
- no UI or business logic was built
- no packages were added
- no live workflows were changed
