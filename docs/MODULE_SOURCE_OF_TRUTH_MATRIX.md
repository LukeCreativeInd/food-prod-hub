# Module Source-Of-Truth Matrix

## Authority

This matrix defines current canonical ownership. Operational modules own records; dashboards, Reports and cross-module timelines read them. No consumer should create a competing source of truth.

| Record/domain | Canonical owner and source | Readers/derived views | History and tenant rule | Facility direction / prohibited duplication | Status |
| --- | --- | --- | --- | --- | --- |
| Organisations | Platform foundation: `organisations` | Platform Admin, selector, tenant resolver | `id` establishes `organisation_id` boundary | Organisation identity remains global to the tenant | Implemented |
| Memberships and access | Auth foundation: `profiles`, `organisation_memberships`, `roles`, `permissions`, `role_permissions` | Guards, navigation, Admin | Membership is organisation-scoped; permission checks supplement RLS | Do not infer operational ownership from role labels | Implemented |
| Modules and feature flags | Platform foundation: `modules`, `organisation_modules`, `feature_flags`, `organisation_feature_flags` | App shell, Platform Admin | Tenant enablement/override history is controlled configuration | Do not hard-code Clean Eats enablement globally | Implemented |
| Suppliers and aliases | Products: `suppliers`, `supplier_aliases` | Intake, Costings, Purchasing future | Tenant-owned; archive rather than erase referenced identity | Generally organisation-wide; no duplicate supplier master in Intake | Operational foundation |
| Supplier catalogue items | Products: `supplier_items`, `supplier_item_mappings` | Intake, Costings, supplier detail | Tenant-consistent supplier/internal-item relationships | Organisation-wide unless a future facility catalogue rule is approved | Operational foundation |
| Purchase documents and lines | Supplier Invoice Intake: `purchase_documents`, `purchase_document_lines` | Products, Costings, Goods Inwards linkage | Preserve uploaded evidence and supplier source values | Commercial evidence does not own stock or supplier master | Operational foundation |
| Price observations | Supplier Invoice Intake: `price_observations` | Commercial review, Price History | Evidence is append-oriented | Do not treat observations as approved prices | Operational foundation |
| Approved supplier prices | Products/commercial master: `approved_supplier_prices` | Costings and readiness | Reviewed current price with retained history | Intake proposes evidence; Costings consumes approved data | Operational foundation |
| Internal items | Products: `internal_items` | Formulas, Inventory, Costings, Production, QA | Tenant-owned canonical material/output identity | Usually organisation-wide; facility overrides need design | Operational foundation |
| Formulas and versions | Products: `formula_versions`, `formula_lines` | Costings and Production | Versioned; output and expected-yield quantities are formula evidence and history must be preserved | Formula/BOM is not a production method, work instruction or execution record | Operational foundation |
| Production methods and work instructions | Future Production-owned versioned source, referencing Products outputs/formulas | Area tasks, QA and printable fallback | Approved versions and historical task/run references must remain stable | Do not store methods as formula notes, dashboard rows or PDF-only truth | Critical future architecture |
| UOM conversion rules | Products: `uom_conversion_rules` | Costings, receiving and production calculations | Contextual, tenant-owned conversion evidence | Never perform unsafe global conversions | Operational foundation |
| Inventory receipts and lines | Goods Inwards: `inventory_receipts`, `inventory_receipt_lines` | QA, Inventory, Traceability | Draft editing; posting is controlled and historical | Future facility-scoped; do not duplicate in Supplier Invoice Intake | Operational foundation |
| Inventory lots | Inventory: `inventory_lots` | Stock On Hand, QA, Traceability, Production future | Created by confirmed inventory workflows; quantity is not held-state storage | Future facility/location scope | Operational foundation |
| Stock movements | Inventory: `stock_movements` | Stock On Hand, Traceability, reports | Append-oriented quantity ledger | Planning/allocation must not pretend physical movement occurred | Operational foundation |
| Stock On Hand | Inventory derived read model | Inventory, Production planning future | Derived from movements plus controlled availability/hold state | No independent balance table without explicit architecture | Browser validated foundation |
| Traceability | Inventory cross-module reader | Operations and recall work future | Reads source relationships; does not rewrite them | Recall-grade forward traceability remains future | Browser validated foundation |
| Sell prices | Costings: `finished_product_sell_prices` | Meal Margins, reports | Effective/status history; one active open-ended record per channel | No Shopify price sync yet | Operational foundation |
| Costing snapshots | Costings: `costing_snapshots`, `costing_snapshot_lines` | Margin/report history | Immutable snapshot evidence | Never silently recalculate historical snapshots | UI/schema foundation |
| Production plans and lines | Production: `production_plans`, `production_plan_lines` | Production Admin future, QA future | Status-controlled planning history | Future facility scope; external demand remains upstream evidence | Operational foundation |
| Production batches and inputs | Production: `production_batches`, `production_batch_inputs` | QA, Inventory output/consumption future, Logistics future | Batch identity and planned inputs preserved | Actual issue/consumption/output not yet implemented | Schema/UI foundation |
| Production areas | Production: `production_areas` | Plans/tasks and room views future | Tenant-owned setup | Strong future facility scope | Schema/readiness foundation |
| Production tasks | Production, conceptual source | QA and area/tablet views future | Must reference source plan/batch records | Do not use PDFs or dashboards as task records | Future/Pending |
| Commerce/order source | Future provider-agnostic demand domain | Production planning, CRM, Logistics | Preserve source IDs, sync events and demand changes | Shopify is first connector, not global schema identity | Critical future architecture |
| Production demand | Future Production planning domain | Inventory requirements, plans, execution and Logistics readiness | Live, reviewed/frozen, post-freeze delta and authorised adjustment states must differ | Facility/date scope; source orders remain upstream evidence | Critical future architecture |
| QA templates | QA: `qa_templates`, `qa_template_versions`, `qa_template_sections`, `qa_template_items` | Check creation | Published versions structurally immutable | Organisation-wide defaults may later have facility overrides | Schema foundation |
| QA checks and evidence | QA: `qa_check_instances`, `qa_results`, `qa_reviews`, `qa_approvals`, `qa_amendments` | Receiving/Production/Daily QA, Traceability | Completed evidence cannot be silently rewritten; amendments append | Operational checks likely facility-scoped | Receiving operational; broader foundation |
| QA holds and events | QA: `qa_holds`, `qa_hold_events` | Inventory availability, Receiving QA, Traceability | Full-lot hold state/events; append-only events; no quantity duplication | Hold details remain permission restricted | Operational foundation |
| Carriers and services | Logistics: `logistics_carriers`, `logistics_carrier_services` | Dispatch planning | Archive preserves historical references | Generally organisation-wide with future facility availability rules | Browser validated foundation |
| Dispatch runs/deliveries/lines | Logistics: `logistics_dispatch_runs`, `logistics_dispatch_deliveries`, `logistics_dispatch_lines` | Manifests, future delivery issues/reports | Controlled lifecycle and retained history | Dispatch origin becomes facility-scoped later | Browser validated foundation |
| Manifests and snapshots | Logistics: `logistics_manifests`, `logistics_manifest_deliveries`, `logistics_manifest_lines` | Carrier export/reporting | Generated snapshots immutable | Do not rebuild old manifests from mutable dispatch data | Browser validated foundation |
| Carrier exports | Logistics: `logistics_carrier_exports` | Integration diagnostics and carrier workflow | Export attempts/history should be retained | No live carrier integration yet | Schema/scaffold |
| Delivery issues | Logistics ownership pending cross-domain review | CRM, Support, QA | Lifecycle not designed | Do not use support tickets as operational delivery issue records | Future/Pending |
| Customer/accounts | Future CRM | Orders, Logistics, Reports | Tenant-owned customer master | Organisation-wide with addresses/routes possibly facility-aware | Future/Pending |
| Reports and dashboards | Read models only | Users | Must cite canonical source and freshness | Never create operational truth or fake metrics | Mixed foundations |
| Support tickets | Support: `support_tickets`, `support_ticket_comments`, `support_ticket_events`, `support_ticket_attachments` | Tenant Support and Platform inbox | Authenticated, tenant-aware history | Not a substitute for QA NC/CA or delivery issue records | Operational foundation |
| Help Centre content | Support static content | Authenticated Help Centre | Versioned in repository today | Product guidance follows implemented capability | Static content foundation |
| Platform diagnostics | Platform Admin read models | Platform operators | Must not become tenant operational truth | Future health/readiness may aggregate facility and integration state | Read-only foundation |

## Permanent Ownership Rules

- Goods Inwards owns receipts and receipt lines.
- Inventory owns lots and the stock movement ledger.
- Stock On Hand is derived from movements and controlled availability/hold rules.
- Traceability reads links among source records.
- Products owns supplier catalogue identity, internal items and formula/BOM identity.
- Supplier Invoice Intake owns commercial source evidence, not stock.
- Costings owns calculations, sell prices, margins and immutable snapshots.
- QA owns QA evidence and disposition events; it does not duplicate physical quantity.
- Logistics owns dispatch and manifest history; generated manifests are snapshots.
- Platform Admin owns SaaS operations, not tenant operations.
