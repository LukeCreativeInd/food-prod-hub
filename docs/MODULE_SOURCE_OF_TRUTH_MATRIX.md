# Module Source-Of-Truth Matrix

## Task 236 Production Demand Foundation

| Data or capability | Canonical owner | Consumers | Rules | Current limitation | Status |
| --- | --- | --- | --- | --- | --- |
| Production contributions | `production_demand_contributions` in Production | Live demand, later review/freeze, Support traceability | One active mapping output per source line/item; source/mapping/interpretation/facility/item lineage retained; supersede, never rewrite/delete | Migrations 051-052 live/registered; full rollback verification passed; no source or demand rows | Production accepted |
| Generation blockers/exclusions | `production_demand_generation_issues` in Production | Production users and later Support diagnostics | One current safe outcome per source line; no PII/raw payload | No detailed drilldown UI | Repository foundation |
| Live Production Demand | `production_live_demand` in Production | Production UI and later review/freeze | Stable IDs; active contributions only; exact facility/date/item/UOM key | Recalculable only; not reviewed/frozen/allocated | Repository foundation |

Commerce continues to own source projections, mappings and delivery interpretations. Products owns internal items/UOM. Facilities owns physical scope. Production Plans do not consume or mutate live demand in Task 236.

## Task 237 Review, Freeze and Delta Boundary

| Evidence/state | Source of truth | Mutation authority | Consumers |
| --- | --- | --- | --- |
| Live active contributions and live aggregates | Task 236 Production Demand tables | Task 236 scoped generators | Task 237 capture/delta comparison |
| Human-reviewed facility/date capture | `production_demand_reviews` plus immutable review child tables | Task 237 `production.manage` RPCs only | Production Demand UI; later plan allocation |
| Frozen base commitment | One `status = frozen` review per organisation/facility/date | Irreversible Task 237 freeze RPC | Effective-demand helper; later Production Plan allocation |
| Post-freeze source differences | `production_demand_delta_contributions` | Deterministic Task 237 generation RPC | Delta UI and aggregate lines |
| Current approved cumulative adjustment | One `status = approved` delta version per frozen review | Task 237 approve/reject RPCs | Effective frozen demand |
| Effective frozen demand | Frozen review lines plus latest approved cumulative delta only | Read-only helper | Later Production Plan allocation, not implemented yet |

Commerce, Products and Facilities retain ownership of their source records. Task 237 snapshots lineage but does not update those records. Production Plans and Inventory cannot modify review/freeze/delta evidence and are not written by Task 237. Platform Admin and Support have no cross-tenant mutation bypass.

Migrations 053-055 are live/registered and immutable. Full rollback-only lifecycle, exact/mixed-UOM, cumulative replacement, effective-demand, source-ownership, real independent-session concurrency and production browser verification passed with zero residue. Task 237 is production accepted at `13a5f1b4aca93f0f2fbb38dd256ec5968044ef67`; Production Plan allocation remains deferred to the later approved roadmap.

## Task 238 Tools And Production Import Boundary

| Evidence/state | Source of truth | Mutation authority | Consumers |
| --- | --- | --- | --- |
| Tools workspace definition | Permanent mixed utility module with strict domain ownership boundaries | Module/navigation configuration only; no generic canonical mutation authority | Specialised bounded utilities |
| Supplier invoice source/extraction/commit evidence | Supplier Invoice Intake | Existing Purchase Document workflow boundaries | Products, Costings and optional draft Goods Inwards bridge |
| Future Production source metadata, parser runs and staging revisions | Dedicated tenant-owned Production Data Import domain governed by Production | Future Production Import intake/staging boundaries | Tools utility UI, Production review, redacted Support readiness |
| Future mapping, validation, review, approval, apply and reconciliation evidence | Production Data Import | Future dedicated import boundaries plus target-domain permission checks | Products and Production apply workflows, audit and redacted diagnostics |
| Canonical Products records | Products | Products-owned mutation boundaries | Production, Costings, Inventory and import reconciliation |
| Canonical Production records | Production | Production-owned mutation boundaries | Production execution and import reconciliation |
| Future import configuration | Tenant Admin configuration for Production Import | Future Admin configuration boundary | Production Import parsers/intake |

UI placement does not define data ownership. A future route under Tools may launch Production Data Import, but Tools does not own the staging domain or resulting canonical records. Parser code is platform implementation; run evidence belongs to Production Data Import. Platform Admin receives redacted readiness only and Support receives minimum necessary redacted diagnostics. Task 239 resolves the target concepts in the production-knowledge section below.

No Production import schema, parser, bucket, permission or Migration 056 exists.

## Task 239 Production Knowledge Boundary

| Data or capability | Canonical owner | Consumers | Rule | Current status |
| --- | --- | --- | --- | --- |
| Internal Item | Products | Formulas, Inventory, Costings, Production and QA | Stable tenant item/material/output identity | Implemented |
| Formula / BOM, Formula Version and Formula Line | Products | Costings, Production and Recipe presentation | One composition truth; nominal output basis and inputs only; approved history must be immutable | Directionally canonical implementation; lifecycle hardening needed |
| Recipe | Presentation only | Product reviewers and future operators | Aggregates approved Formula, compatible Method and linked Work Instructions; no canonical Recipe table | Scaffold only; later repurpose `/recipes` |
| Production Method, Method Version and Method Step | Production | Planning, execution, Recipe presentation and QA links | Independently versioned process definition with explicit Formula compatibility | Architecture decided; not implemented |
| Work Instruction and Version | Production | Method Steps and operator presentation | Independently versioned controlled human guidance; Method Step pins exact approved version | Architecture decided; not implemented |
| Expected process yield/loss and process batch envelope | Production Method Version | Costing/planning/execution comparison | Separate from Formula output basis and actual quantities | Architecture decided; not implemented |
| Planned/actual production and actual consumption | Production/Inventory execution evidence | Reports, variance and traceability | Operational occurrence, never a reusable definition | Partial foundations |
| QA checkpoint definitions/results | QA | Method references and execution views | QA owns definition/result; Method only references approved definition | QA foundation |

See `PRODUCTION_KNOWLEDGE_CONCEPT_MODEL.md` and `FORMULA_METHOD_WORK_INSTRUCTION_RECIPE_OWNERSHIP_MATRIX.md`.

## Task 234 Commerce Catalogue Mapping Foundation

| Data or capability | Canonical owner | Consumers | Rules | Current limitation | Status |
| --- | --- | --- | --- | --- | --- |
| Product/variant interpretation | `commerce_catalogue_mappings` | Source-line readiness and later Production Demand contribution logic | Organisation, connection, catalogue item and provider variant identity; direct, bundle or exclusion; one current working revision | Migration 049 live/registered; no rows | Production-accepted foundation |
| Mapping outputs | `commerce_catalogue_mapping_outputs` | Later contribution calculation | Manufacturer-owned active component/finished-product item; positive decimal quantity; exact active base UOM | No automatic UOM conversion or formula mutation | Repository foundation |
| Mapping approval/history | Mapping status, supersession link and `commerce_catalogue_mapping_events` | Tenant Admin review and later traceability | Approved mappings immutable; revisions supersede rather than rewrite; events append only | No Platform Admin or Support detail surface | Repository foundation |
| Source-line interpretation readiness | `commerce_source_order_lines.interpretation_status` refreshed from approved mapping evidence | Integrations summaries and later Demand review | Exclusion resolves to excluded; direct/bundle resolve to mapped; otherwise unresolved | Does not create contributions, quantities, facility/date assignment or Production Demand | Repository foundation |

Migration 049 is live/registered. Commerce mapping is owned by the manufacturer tenant; provider catalogue evidence remains external Commerce truth and internal items/formulas remain Products truth.

## Task 233 Shopify Connector Foundation

| Data or capability | Canonical owner | Consumers | Rules | Current limitation | Status |
| --- | --- | --- | --- | --- | --- |
| Shopify installation/shop identity | Restricted `shopify_installations` boundary | Commerce connection readiness and trusted connector runtime | Canonical Shopify Shop GID plus verified `myshopify.com` domain and environment; never tenant-selected | Migrations 047-048 live/registered; no app/store installed | Local foundation |
| Shopify credentials | Restricted `shopify_connection_credentials` boundary | Server-only Shopify GraphQL runtime | AES-256-GCM ciphertext in database, key outside database, no authenticated/public/anon read | No external KMS or live token; rotation requires environment operations | Local foundation |
| Shopify provider observations/jobs | `commerce_source_observations`, `commerce_processing_attempts`, `shopify_connector_jobs` | Trusted reconciliation worker | Raw-body HMAC, event ID idempotency, reference-only durable job, authoritative refetch | Manual development-safe executor only; no production scheduler | Local foundation |
| Shopify product/variant discovery | Provider-neutral `commerce_external_catalogue_items` | Task 234 mapping review | Discovery never maps by title/SKU and retains connection/provider identity | No discovered data; Task 234 UI remains empty until controlled discovery | Local foundation |
| Shopify source orders/lines | Task 232 Commerce projections | Task 234 interpretation and later Demand | Privacy-minimised authoritative refetch; stale provider updates cannot regress projection | No live import, mapping, demand or delivery-date interpretation | Local foundation |

## Task 232 Commerce Foundation

| Concern | Canonical source now | Runtime status | Boundary |
| --- | --- | --- | --- |
| Storefront/connection identity | `commerce_connections` | Live empty foundation from migration 046 | Provider-neutral Commerce, not universal Integrations |
| External manufacturing-customer identity | `commerce_external_businesses` | Schema only | Narrow identity, not CRM or membership |
| Manufacturing authority | `commerce_manufacturing_relationships` plus events | Schema only | Manufacturer acceptance separate from provider consent |
| Source order/line projections | `commerce_source_orders`, `commerce_source_order_lines` | Schema only; zero rows | Commerce evidence, not Production Plans |
| Provider observation/sync evidence | Commerce observation/attempt/checkpoint/run tables | Schema only | No raw payloads, credentials, queue or worker |

Xero remains accounting-owned, Detrack remains Logistics-owned, Klaviyo remains marketing-owned, CSV remains Tools/import-owned, notifications remain notification-owned, and future APIs remain platform integration surfaces. The shared Tenant Admin catalogue does not collapse those domains into Commerce.

## Authority

This matrix defines current canonical ownership. Operational modules own records; dashboards, Reports and cross-module timelines read them. No consumer should create a competing source of truth.

Future ownership direction is sequenced by `225-348-official-roadmap.md`. Proposed records remain future until their approved schema/workflow task is implemented; this matrix does not turn roadmap concepts into current tables.

| Record/domain | Canonical owner and source | Readers/derived views | History and tenant rule | Facility direction / prohibited duplication | Status |
| --- | --- | --- | --- | --- | --- |
| Organisations | Platform foundation: `organisations` | Platform Admin, selector, tenant resolver | `id` establishes `organisation_id` boundary | Organisation identity remains global to the tenant | Implemented |
| Facilities | Tenant configuration source: `facilities` in migration `045` | Inventory, Production, QA, Logistics, Admin, reports | Organisation-owned physical identity; archive preserves history | `organisation_id` remains tenant boundary; SQL applied manually; no UI/selector | Schema/backfill applied; browser validation and migration-history reconciliation pending |
| Memberships and access | Auth foundation: `profiles`, `organisation_memberships`, `roles`, `permissions`, `role_permissions` | Guards, navigation, Admin | Membership is organisation-scoped; permission checks supplement RLS | Do not infer operational ownership from role labels | Implemented |
| Modules and feature flags | Platform foundation: `modules`, `organisation_modules`, `feature_flags`, `organisation_feature_flags` | App shell, Platform Admin | Tenant enablement/override history is controlled configuration | Do not hard-code Clean Eats enablement globally | Implemented |
| Suppliers and aliases | Products: `suppliers`, `supplier_aliases` | Intake, Costings, Purchasing future | Tenant-owned; archive rather than erase referenced identity | Generally organisation-wide; no duplicate supplier master in Intake | Operational foundation |
| Supplier catalogue items | Products: `supplier_items`, `supplier_item_mappings` | Intake, Costings, supplier detail | Tenant-consistent supplier/internal-item relationships | Organisation-wide unless a future facility catalogue rule is approved | Operational foundation |
| Purchase documents and lines | Supplier Invoice Intake: `purchase_documents`, `purchase_document_lines` | Products, Costings, Goods Inwards linkage | Preserve uploaded evidence and supplier source values | Commercial evidence does not own stock or supplier master | Operational foundation |
| Price observations | Supplier Invoice Intake: `price_observations` | Commercial review, Price History | Evidence is append-oriented | Do not treat observations as approved prices | Operational foundation |
| Approved supplier prices | Products/commercial master: `approved_supplier_prices` | Costings and readiness | Reviewed current price with retained history | Intake proposes evidence; Costings consumes approved data | Operational foundation |
| Internal items | Products: `internal_items` | Formulas, Inventory, Costings, Production, QA | Tenant-owned canonical material/output identity | Usually organisation-wide; facility overrides need design | Operational foundation |
| Formulas and versions | Products: `formula_versions`, `formula_lines` | Costings and Production | Versioned composition and nominal output basis; current `expected_yield_*` fields are transitional, not approved process-yield truth | Formula/BOM is not a production method, work instruction or execution record; approval immutability/cycle/child-version hardening remains | Operational foundation |
| Production methods and work instructions | Future Production-owned versioned source, referencing Products outputs/formulas | Area tasks, QA and printable fallback | Approved versions and historical task/run references must remain stable | Do not store methods as formula notes, dashboard rows or PDF-only truth | Critical future architecture |
| UOM conversion rules | Products: `uom_conversion_rules` | Costings, receiving and production calculations | Contextual, tenant-owned conversion evidence | Never perform unsafe global conversions | Operational foundation |
| Inventory receipts and lines | Goods Inwards: `inventory_receipts`, `inventory_receipt_lines` | QA, Inventory, Traceability | Draft editing; posting is controlled and historical | Migration `045` makes receipt a direct facility root; lines derive and location must match | Operational foundation; facility schema applied, browser retest pending |
| Inventory lots | Inventory: `inventory_lots` | Stock On Hand, QA, Traceability, Production future | Created by confirmed inventory workflows; quantity is not held-state storage | Facility distribution derives from movement locations; do not add one mutable current facility | Operational foundation |
| Stock movements | Inventory: `stock_movements` | Stock On Hand, Traceability, reports | Append-oriented quantity ledger | Planning/allocation must not pretend physical movement occurred | Operational foundation |
| Stock On Hand | Inventory derived read model | Inventory, Production planning future | Derived from movements plus controlled availability/hold state | No independent balance table without explicit architecture | Browser validated foundation |
| Traceability | Inventory cross-module reader | Operations and recall work future | Reads source relationships; does not rewrite them | Recall-grade forward traceability remains future | Browser validated foundation |
| Sell prices | Costings: `finished_product_sell_prices` | Meal Margins, reports | Effective/status history; one active open-ended record per channel | No Shopify price sync yet | Operational foundation |
| Costing snapshots | Costings: `costing_snapshots`, `costing_snapshot_lines` | Margin/report history | Immutable snapshot evidence | Never silently recalculate historical snapshots | UI/schema foundation |
| Production plans and lines | Production: `production_plans`, `production_plan_lines` | Production Admin future, QA future | Status-controlled planning history | Migration `045` makes plan a direct facility root; lines derive; external demand remains upstream evidence | Operational foundation; facility schema applied, browser retest pending |
| Production batches and inputs | Production: `production_batches`, `production_batch_inputs` | QA, Inventory output/consumption future, Logistics future | Batch identity and planned inputs preserved | Migration `045` stores batch facility directly; inputs derive and source locations must match | Schema/UI foundation; facility schema applied, browser retest pending |
| Production areas | Production: `production_areas` | Plans/tasks and room views future | Tenant-owned setup | Migration `045` requires one same-tenant facility per area | Schema/readiness foundation; facility schema applied, browser retest pending |
| Production tasks | Production, conceptual source | QA and area/tablet views future | Must reference source plan/batch records | Do not use PDFs or dashboards as task records | Future/Pending |
| Legacy production exports and tool outputs | Shopify/Zapiet exports and legacy tools are current operational evidence only | Task 224 parity fixtures and future controlled transition review | Preserve fingerprints and transformation evidence; they are not canonical master data | Do not copy legacy constants, mappings, formulas or report presentation into operational truth without approval | External evidence audited |
| Commerce providers, storefronts and connections | Proposed Commerce domain from Tasks 227 and 229 | Tenant Admin, Production intake, Platform diagnostics, Support diagnostics | Provider/app environment plus stable shop identity resolve to an internal connection; merchant authorization, manufacturer acceptance, installation, credential reference, health and archive history remain distinct | Storefront, owner, manufacturer and facility remain distinct; credentials are separately encrypted/non-tenant-readable; no schema exists | Architecture decided; Tasks 232-233 implement after Gate 1/prerequisites |
| External business/manufacturing customer identity | Proposed narrow Commerce identity, later linked/enriched by CRM | Manufacturing relationship, source attribution, future limited owner view | External identity grants no membership; later organisation conversion links rather than rewrites | Made Active is not Clean Eats-owned and is not required to be a tenant in Phase 1 | Architecture decided; Task 232 gate-blocked; CRM 292-295 enrich later |
| Contract-manufacturing relationships | Proposed Commerce authorisation source | Connection readiness, Production intake, Platform diagnostics | Store-owner consent and manufacturer acceptance are separate, retained evidence | Cross-organisation access is explicit and relationship-scoped | Architecture decided; Task 232 gate-blocked |
| External products, variants and commerce mappings | Future Commerce source identity plus manufacturer-approved mapping | Production contribution, Products review, mapping QA | Provider identity is preserved; mapping/rule version used is immutable history | Internal item remains Products-owned; mapping is connection plus manufacturer context | Critical future foundation; Tasks 232-234 |
| Source orders, lines and observations | Future provider-agnostic Commerce intake domain from Tasks 228-229 | Production planning, CRM, Logistics, Support diagnostics | Provider owns source lifecycle; EveryBatch preserves stable IDs, material observations and a controlled current projection using verified webhooks plus reconciliation | Shopify is first connector, not global schema identity; raw payloads are transient by default; order access is protected customer data and direct customer fields are excluded | Architecture decided; Tasks 232-233 implement later |
| Shopify app registration and provider credentials | Restricted Task 233 connector boundary | Commerce connection health and connector worker only | Shopify owns app/shop authorization; EveryBatch stores environment/config metadata and AES-GCM-encrypted credential material separately | Tokens, refresh tokens, app secrets, HMACs and session tokens are never tenant/Support/Platform readable; no app registration or credential exists | Local foundation; Migration 047 live/registered, Migration 048 unapplied |
| Shopify connection readiness | Future derived Commerce/integration readiness from Task 229 | Tenant Admin, Platform Admin and Support diagnostics; Production intake gate | Business authority, technical connection, configuration, sync and demand readiness remain separate inputs | A healthy token/webhook does not create manufacturer authority or actionable demand | Architecture decided; Tasks 232-237 implement later |
| Delivery zones | `delivery_zones` | Commerce interpretation, Production routing and reports | Organisation-owned stable zones resolved from reviewed source region/service evidence | No postcode/customer address is stored; no rows are seeded | Task 235 live foundation; Migration 050 registered |
| Customer-facing delivery services | `delivery_services` plus `delivery_service_zone_assignments` | Commerce, future customer calendar, Production attribution and Logistics handoff | Stable tenant service identity with optional same-tenant carrier/service reference | Separate from Logistics carrier/carrier-service masters; no rows are seeded | Task 235 live foundation; Migration 050 registered |
| Delivery and production calendars | `delivery_calendars`, versions, rules and exceptions | Commerce resolution, Production Demand, Logistics and reports | Immutable published effective-dated versions; exact rule/version retained on interpretation | Clean Eats weekdays are tenant configuration; current rules never reinterpret history | Task 235 live foundation; Migration 050 registered |
| Zapiet metadata interpretation | Connection-specific parser profiles/fields and append-oriented order interpretations | Commerce delivery evidence and later Production Demand | Exact allowlisted keys/formats, versioned published parser, deterministic resolver | No global Zapiet keys, raw payloads, customer PII or seeded profile | Task 235 live foundation; Migration 050 registered |
| Delivery/production/facility assignment evidence | Proposed Production Demand boundary from Task 230 | Demand review/freeze, plans, Logistics and reports | Revisioned pre-freeze; immutable in frozen attribution; post-freeze changes append deltas | Storefront/date/facility remain distinct; no assignment engine exists | Architecture decided; Tasks 235-237 after Gate 1 |
| Zapiet parser profiles and results | Proposed connection-specific Commerce/calendar configuration from Task 230 | Commerce exceptions, Tenant Admin readiness, Production Demand | Provider metadata remains source evidence; parser profile/version and outcome are retained | No verified global key names and no parser implementation; privacy-minimize values | Architecture decided; Tasks 232-235 after Gate 1 |
| Production contributions | Future versioned Commerce-to-Production interpretation boundary from Task 228 | Live demand, review/freeze, mapping QA | Immutable revisions preserve source line, mapping/bundle rule versions, source/contributed quantity and assignments; a selected-current projection prevents double counting | One source line may create zero, one or many contributions; unknown/excluded lines remain visible | Architecture decided; Tasks 234/236 implement later |
| Production demand | Future Production planning domain from Tasks 228 and 230 | Inventory requirements, plans, execution and Logistics readiness | Live demand is recalculable; reviewed decisions are versioned; frozen snapshots/source links are immutable; deltas and manual adjustments append separately | Facility/date scope and exact assignment evidence are mandatory before actionable/frozen demand; source orders remain upstream evidence | Architecture decided; Tasks 235-237 after Gate 1 |
| QA templates | QA: `qa_templates`, `qa_template_versions`, `qa_template_sections`, `qa_template_items` | Check creation | Published versions structurally immutable | Organisation-wide defaults may later have explicit facility applicability/overrides | Schema foundation |
| QA checks and evidence | QA: `qa_check_instances`, `qa_results`, `qa_reviews`, `qa_approvals`, `qa_amendments` | Receiving/Production/Daily QA, Traceability | Completed evidence cannot be silently rewritten; amendments append | Derive facility from stable operational source; independent daily/manual checks need direct context later | Receiving operational; broader foundation |
| QA holds and events | QA: `qa_holds`, `qa_hold_events` | Inventory availability, Receiving QA, Traceability | Full-lot hold state/events; append-only events; no quantity duplication | Hold details remain permission restricted | Operational foundation |
| Carriers and services | Logistics: `logistics_carriers`, `logistics_carrier_services` | Dispatch planning | Archive preserves historical references | Generally organisation-wide with future facility availability rules | Browser validated foundation |
| Dispatch runs/deliveries/lines | Logistics: `logistics_dispatch_runs`, `logistics_dispatch_deliveries`, `logistics_dispatch_lines` | Manifests, future delivery issues/reports | Controlled lifecycle and retained history | Migration `045` makes dispatch run the direct origin-facility root; children derive | Browser validated foundation before facility apply; facility browser retest pending |
| Manifests and snapshots | Logistics: `logistics_manifests`, `logistics_manifest_deliveries`, `logistics_manifest_lines` | Carrier export/reporting | Generated snapshots immutable | Derive from dispatch run and preserve origin facility identity in generated snapshots | Browser validated foundation |
| Carrier exports | Logistics: `logistics_carrier_exports` | Integration diagnostics and carrier workflow | Export attempts/history should be retained | No live carrier integration yet | Schema/scaffold |
| Delivery issues | Logistics ownership pending cross-domain review | CRM, Support, QA | Lifecycle not designed | Do not use support tickets as operational delivery issue records | Future/Pending |
| Customer/accounts | Future CRM | Orders, Logistics, Reports | Tenant-owned customer master | Organisation-wide with addresses/routes possibly facility-aware | Future/Pending |
| Reports and dashboards | Read models only | Users | Must cite canonical source and freshness | Never create operational truth or fake metrics | Mixed foundations |
| Support tickets | Support: `support_tickets`, `support_ticket_comments`, `support_ticket_events`, `support_ticket_attachments` | Tenant Support and Platform inbox | Authenticated, tenant-aware history | Not a substitute for QA NC/CA or delivery issue records | Operational foundation |
| Help Centre content | Support static content | Authenticated Help Centre | Versioned in repository today | Product guidance follows implemented capability | Static content foundation |
| Platform diagnostics | Platform Admin read models | Platform operators | Must not become tenant operational truth | Future health/readiness may aggregate facility and integration state | Read-only foundation |

## Permanent Ownership Rules

- Organisations own facilities; `organisation_id` remains the tenant boundary.
- Physical operational roots store facility directly only where independent historical scope requires it; stable children derive facility through authoritative parents.
- Storefronts, brands, domains and manufacturing customers are not facilities.
- Store owners control provider consent; manufacturers control manufacturing acceptance, internal mapping and target facility.
- Externally owned demand requires an explicit accepted manufacturing relationship; external identities do not grant tenant membership.
- Providers own source order/line lifecycle; EveryBatch owns retained observations, current projections and manufacturing interpretation evidence without becoming the commerce order master.
- Live demand may be rebuilt from selected contribution revisions. Frozen snapshots, source links, post-freeze deltas, manual adjustments/reversals and Production Plan allocations retain their own history.
- Connection business status and technical health are separate, and order prefixes/domains are never canonical store identity.
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
