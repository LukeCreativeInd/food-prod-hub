# Task 226 - Facility and Site Architecture Decision

## Purpose

This document decides how EveryBatch represents physical operational facilities while preserving the organisation as the tenant and security boundary. It gives Clean Eats a low-friction single-facility path and establishes the constraints required before facility-aware schema begins.

## Scope

Task 226 is architecture, ownership, migration strategy and roadmap-gate planning only. It creates no schema, migration, permissions, RLS, routes, selector, facility record or operational data. Task 231 remains blocked until Architecture Gate 1 after Task 230.

## Explicit Decision

EveryBatch will retain `organisation_id` as the tenant and security boundary and introduce facilities as organisation-owned physical operational scopes. Facility identity will be stored directly on authoritative operational roots where independent planning, physical origin or historical identity requires it, and derived through stable same-tenant parent relationships elsewhere. Organisation-wide master data will not be duplicated per facility. Single-facility tenants will resolve an organisation default automatically and will not be forced through facility-selection UI.

The selected model is **Option C: selective direct facility ownership with derivation**.

## Current Platform State

- `organisations` is the current tenant root.
- `organisation_settings` holds one organisation-wide settings row, including timezone, currency and unit defaults.
- There is no `facilities` table, no `facility_id` column and no runtime facility selector.
- `inventory_locations` and `production_areas` are organisation-owned and are the strongest existing physical-scope records.
- Receipts, production plans, production batches and dispatch runs are organisation-owned operational roots without facility identity.
- QA checks can reference receipts, lots, locations, plans, batches and areas; templates and template versions are organisation-owned.
- All current facility-relevant tables retain `organisation_id`, use same-tenant relationships where implemented and rely on organisation membership plus permissions for RLS.

Facility architecture is complete after Task 226, but facility schema and runtime support remain unimplemented.

## Terminology

- **Organisation:** an EveryBatch tenant/business workspace and the primary tenant/security boundary.
- **Facility:** a physical manufacturing, warehousing or operational location owned or used by one organisation.
- **Stock location:** a physical or logical inventory position within exactly one facility.
- **Production area:** a work room or operational zone within exactly one facility.
- **Storefront:** an external commerce source. It is not a facility.
- **Brand/channel:** commercial attribution associated with demand. It is not a facility.
- **Manufacturing customer:** an external organisation or brand whose products are manufactured by the tenant.
- **Site:** avoided when it could mean a web domain, storefront or physical facility.

## Business Context

EveryBatch must support one manufacturer receiving demand from several storefronts, brands and manufacturing customers. Those commercial identities must remain separate from the physical facility that receives stock, performs production, executes QA and dispatches output.

A contract manufacturer remains the sole owner of its facility. External-customer and brand attribution stays on commerce, demand and production relationships. Shared facility ownership across tenant organisations is rejected because it would blur tenant ownership and RLS.

## Clean Eats Current State

Clean Eats currently has one confirmed physical manufacturing facility. Clean Eats Australia and Clean Eats Wholesale are storefronts, not facilities. Made Active is an external brand/manufacturing customer, not a facility and not a Clean Eats tenant facility.

The repository does not confirm a canonical street address for the facility. Supplier invoices are not approved facility master data, so Task 231 must not infer or copy an address from them.

## Future Multi-Facility Requirement

An organisation may have zero facilities while provisioning, one facility for normal single-site operation or many facilities in future. Operational readiness requires at least one active facility and exactly one valid default facility. Multi-facility support must use the shared product model, not tenant-specific forks.

## Architecture Options Considered

### Option A - Organisation Only Until Later

This is fastest now, but preserves ambiguity in receipts, production plans and dispatch origins. It would force larger retrofits after real records accumulate and is rejected because production replacement already needs physical scope.

### Option B - Facility ID On Most Operational Tables

This is explicit but duplicates identity on children, creates drift risks, expands migrations and RLS unnecessarily, and makes every write responsible for synchronising repeated scope. It is rejected.

### Option C - Selective Direct Ownership With Derivation

This puts facility identity on operational roots and foundational physical configuration, retains `organisation_id`, and derives scope on children through same-tenant parents. It gives durable historical identity with controlled migration size. This option is selected.

### Option D - Locations And Areas Only

This is minimal but cannot represent facility-scoped demand, a plan before area assignment, a receipt before line entry, a standalone batch or a dispatch origin. It also couples unrelated modules to Inventory or Production configuration. It is rejected.

## Recommended Architecture

The proposed table concept is `public.facilities`. This is a proposed Task 231 table, not current schema.

Recommended identity and lifecycle fields:

- stable UUID `id`;
- required `organisation_id`;
- human-facing facility code unique within the organisation;
- display name;
- status of active, inactive or archived;
- IANA timezone;
- ISO country code;
- optional structured postal address pending verified tenant input;
- created/updated timestamps and actor references;
- `archived_at`.

The organisation default should have one canonical pointer, proposed as nullable `organisation_settings.default_facility_id`, rather than duplicating an `is_default` flag on facility rows. It becomes required for operational readiness after backfill, but may remain nullable during provisioning.

## Organisation And Facility Relationship

- An organisation owns zero, one or many facilities.
- A facility belongs to exactly one organisation.
- A facility cannot move between organisations.
- A facility cannot be shared by organisations.
- A production plan may aggregate demand from multiple storefronts, brands or manufacturing customers when all demand is assigned to the same facility.
- Cross-facility demand must be split into separate facility-owned plans before operational planning is released.
- `organisation_id` remains present on facility-scoped records and is never replaced by `facility_id`.

## Facility Lifecycle

- **Active:** available for new operational records.
- **Inactive:** temporarily unavailable for new work but retained for configuration and history.
- **Archived:** retired from normal selection; historical references remain readable.
- Referenced facilities are never hard-deleted.
- Archive must be blocked or require a replacement default when the facility is the organisation default.
- Archive never rewrites or reassigns historical operational records.
- Facility codes and IDs remain stable and must not be reused in a way that confuses history.
- Restore may be supported later after uniqueness and readiness checks.

## Single-Facility UX

- Clean Eats receives one default facility in Task 231 after review.
- The server resolves the only active default facility automatically.
- No facility selector is shown when the user has one accessible active facility.
- A selector appears only when more than one accessible active facility exists and the route needs a working context.
- A remembered selection may be stored later as a convenience preference, never as authorisation.
- If a saved facility is archived or inaccessible, the server discards it and falls back to the validated organisation default.
- If no active default exists, operational creation routes show a setup/readiness state rather than guessing.

## Facility Context And Routing

Current routes and domains remain unchanged. The recommended future hybrid is:

1. Record detail routes derive facility from the authoritative record.
2. List/create routes resolve a server-validated selected facility, then the organisation default.
3. A multi-facility selector may store the last selected facility in a cookie or persisted preference, but every request validates it against the current organisation and access rules.
4. Deep links use record identity where possible. Facility path segments may be introduced only where a workspace genuinely needs a stable facility-scoped URL.
5. Query parameters and client-submitted IDs are never security boundaries.

This does not change `app.everybatchmrp.com`, `admin.everybatchmrp.com`, `cleaneats.everybatchmrp.com` or `support.everybatchmrp.com`. The retired `admin.everybatchmrp.com.au` host is not reintroduced.

## Permissions And RLS Direction

- Active organisation membership remains mandatory.
- Phase 1 roles and permissions remain organisation-wide.
- Facility-specific membership rows are deferred until a real tenant needs restricted site access.
- Likely permission concepts are `facilities.view` and `facilities.manage`; archive may remain under manage unless later separation is justified.
- Platform-admin access remains explicit and does not make Platform Admin the owner of tenant operational data.
- Facility rows and direct facility references must use same-tenant composite relationships.
- Derived facility checks must follow authoritative parents, not browser payloads.
- A future `can_access_facility` helper is warranted only if facility-specific access is approved later. Phase 1 RLS can validate active organisation membership, permission and same-organisation facility ownership without inventing facility memberships.
- Public and anon remain denied; tenant runtime never uses service-role credentials.

Facility-specific access must be revisited when a tenant requires users restricted to selected facilities, different roles per facility, separate legal/compliance access, or shared devices whose scope cannot be safely handled by task/area assignment.

## Master-Data Classification

Organisation-wide:

- suppliers, aliases and supplier catalogue identity;
- approved supplier prices;
- internal items, ingredients, packaging, components and finished products;
- formulas, formula versions and formula lines;
- UOM conversion rules;
- sell-price records by commercial channel;
- core costing rules and current costing snapshots.

Future facility capability must be represented by an explicit availability/capability or override relationship, not duplicate item, supplier or formula masters. Methods, Work Instructions, calendars, carrier-service availability and selected cost components may later use an organisation default with a facility override.

## Inventory Classification

- Every `inventory_locations` row must belong to exactly one facility.
- One location cannot belong to several facilities.
- Every `inventory_receipts` header must identify one receiving facility; a receipt cannot span facilities.
- Receipt lines derive facility from the receipt and must reference a location in that same facility.
- `inventory_lots` retain organisation identity and derive current facility distribution from stock movements and their locations. A lot may later have quantity across locations or be in transit, so one mutable lot-level facility field would be misleading.
- `stock_movements` derive facility from their required stock location. Inter-facility transfer evidence links paired movements to one controlled transfer transaction.
- Stock On Hand supports organisation, facility, location and lot aggregation without a competing balance table.
- QA-held availability remains QA-owned hold state applied to Inventory-derived quantities. Detailed hold evidence remains permission restricted.

## Production Classification

- Every production plan belongs to exactly one facility.
- Every production batch belongs to exactly one facility, including standalone batches.
- Every production area belongs to exactly one facility.
- Plan lines derive facility from the plan and any selected area must match it.
- Batch inputs and future tasks derive facility from the batch/plan; source locations and assigned areas must match unless an approved transfer occurs first.
- Organisation-wide demand may exist before assignment, but facility assignment is mandatory before it becomes an executable plan or batch. Exact demand lifecycle is Task 228.
- Formula versions remain shared. Production Methods and Work Instructions are organisation defaults with possible versioned facility overrides later.
- Production dates use the assigned facility calendar once Task 230 defines that model.

## QA Classification

- QA templates and published template versions remain organisation-wide.
- Facility-specific template applicability or overrides may be added later without duplicating the template source.
- Receiving, production, daily, cleaning, pre-operational and location checks execute in facility context.
- Current receiving/production checks can derive facility from their immutable operational source. Future manual/daily checks need explicit facility context when no stable parent exists.
- Results, reviews, approvals and amendments derive facility from the check instance.
- Lot holds derive affected quantities from Inventory and the lot's location distribution; QA does not duplicate physical quantities.
- Facility review queues are filtered read models. Facility-specific QA permissions are deferred.

## Logistics Classification

- A dispatch run has exactly one origin facility.
- Deliveries and dispatch lines derive origin from the dispatch run.
- One manifest cannot combine dispatch runs from different facilities.
- Generated manifest snapshots must preserve origin facility ID, code and name as historical evidence.
- Carriers and carrier services remain organisation-wide.
- Facility-specific carrier-service availability can be an explicit future relationship if operational evidence requires it.
- Delivery destinations remain independent of facility identity.
- Dispatch readiness reads output, availability and QA state for the run's origin facility.

## Commerce And Demand Implications

Storefronts and source orders are external/source-owned evidence. They may carry a proposed or resolved target facility, but they do not own facilities. One facility may receive demand from multiple storefronts and brands. Exact source-connection ownership, contract-manufacturing authorisation and target-facility routing remain for Tasks 227-230.

## Admin Implications

Tenant Admin is the future configuration owner for facility list, default, lifecycle, timezone, country, verified address, readiness, stock locations, production areas, calendar links and dispatch origin defaults. Facility creation may occur during provisioning or later onboarding, but operational activation requires a valid default and readiness checks.

Tenant branding remains organisation-wide. Facility-specific document headers or operational branding are Future/Pending and must not duplicate the tenant brand by default.

## Platform Admin Implications

Platform Admin may read facility count, default, readiness, archive state, connection routing and onboarding diagnostics. It does not own or silently edit tenant operational truth. Platform provisioning may create an initial facility only through a later controlled workflow.

## Support Implications

Support tickets may later retain validated facility context when relevant. Support and Platform operators may need tenant-safe diagnostics such as facility code, active/default state and affected route. Users without operational detail access must not receive facility-linked QA, stock or production data through Support.

## Reporting Implications

- Dashboards and reports must display their scope: current facility, selected facilities or organisation-wide.
- Single-facility Clean Eats reports may default silently to the only facility while still recording the scope in data/query metadata.
- Organisation totals aggregate facility quantities once and show in-transit stock separately.
- Cross-facility reporting groups by stable facility identity and retains archived facilities in historical filters.
- Reports remain readers and do not own facility assignments.

## Inter-Facility Transfer Direction

Inventory owns inter-facility transfers. The future design should use a transfer header, transfer lines, source and destination facilities/locations, a controlled ship action, an in-transit state, a controlled receive action, paired append-oriented ledger movements and explicit exception/reversal evidence.

Shipping removes availability from the source. Receipt adds availability to the destination. Shipped-but-not-received quantity appears as in transit and must not be available at both facilities. Corrections append evidence rather than edit historical movements. Task 249 owns detailed planning; Task 250 owns the approved schema/transaction foundation; Task 251 owns operational UI.

## Current Schema Impact Map

| Current table | Current meaning | Facility treatment | Backfill direction | RLS implication | Likely task/risk |
| --- | --- | --- | --- | --- | --- |
| `organisations` | Tenant root | No facility field | None | Remains tenant boundary | Task 231 creates child facilities |
| `organisation_settings` | Organisation defaults | Direct default facility pointer | Set Clean Eats default after facility creation | Same-tenant default validation | Task 231; circular ordering must be controlled |
| `organisation_branding` | Tenant brand | No facility field | None | Organisation-wide | No Phase 1 change |
| `organisation_memberships` | Tenant access | No facility field initially | None | Organisation-wide roles | Facility restrictions deferred |
| `suppliers` | Supplier master | No facility field | None | Organisation-wide | Future availability only if proven |
| `supplier_items` | Supplier catalogue | No facility field | None | Organisation-wide | Avoid duplicate catalogues |
| `purchase_documents` / `purchase_document_lines` | Supplier invoice evidence | No facility field | None | Organisation-wide commercial evidence | Receiving owns any later physical facility assignment |
| `approved_supplier_prices` | Approved commercial price | No facility field in Phase 1 | None | Organisation-wide/channel context | Landed cost later |
| `internal_items` | Canonical item master | No facility field | None | Organisation-wide | Capability relation later |
| `formula_versions` / `formula_lines` | Formula/BOM truth | No facility field | None | Organisation-wide | Methods/overrides later |
| `uom_conversion_rules` | Reviewed conversion rules | No facility field | None | Organisation-wide | No guessed conversions |
| `finished_product_sell_prices` | Channel sell prices | No facility field in Phase 1 | None | Organisation-wide/channel scoped | Revisit only with evidence |
| `costing_snapshots` / `costing_snapshot_lines` | Immutable cost evidence | No required facility in Phase 1 | None | Organisation-wide | Facility cost overlay later |
| `inventory_locations` | Physical/logical stock location | Direct required facility | Map all Clean Eats locations to default | Validate org plus facility | Task 231; mapping must be complete |
| `inventory_receipts` | Physical receiving header | Direct required facility | Clean Eats default after line/location audit | Same-tenant facility | Task 231 selected root |
| `inventory_receipt_lines` | Receipt material/location | Derived from receipt; location must match | Validate existing line locations | Parent and location consistency | Task 231 constraints or compatibility validation |
| `inventory_lots` | Lot identity | Derived from movement locations/origin receipt | No direct facility backfill | Organisation remains boundary | Avoid ambiguous mutable facility |
| `stock_movements` | Append-oriented quantity ledger | Derived from `stock_location_id` | Existing locations gain facility | Location same-tenant checks remain | Transfer tasks 249-251 |
| `production_areas` | Work room/zone | Direct required facility | Map all Clean Eats areas to default | Validate org plus facility | Task 231 |
| `production_plans` | Planning root | Direct required facility | Clean Eats default | Same-tenant facility | Task 231 selected root |
| `production_plan_lines` | Planned output | Derived from plan | Validate selected area matches plan | Parent/area consistency | Task 231 or later action hardening |
| `production_batches` | Independent or plan-linked batch | Direct required facility | Derive from plan, else Clean Eats default after review | Same-tenant facility | Task 231 selected root |
| `production_batch_inputs` | Planned input | Derived from batch | Validate location when assigned | Parent/location consistency | Tasks 247-251 |
| `qa_templates` and version tables | QA definition | Organisation default with future facility applicability | None | Organisation-wide permissions | QA future task |
| `qa_check_instances` | QA execution context | Derive from stable source now; direct for manual/daily checks later | No Task 231 field required | Source relationship must be tenant-safe | Tasks 253, 259 or 278 |
| QA result/review/approval/amendment tables | QA evidence | Derived from check | None | Parent-derived | No Task 231 change |
| `qa_holds` / `qa_hold_events` | QA lot disposition | Derived from lot/movement context | None | Detailed hold access unchanged | Transfer/QA follow-up |
| `logistics_carriers` / services | Carrier config | Organisation-wide, future facility availability | None | Organisation-wide | Later only if needed |
| `logistics_dispatch_runs` | Dispatch root | Direct required origin facility | Clean Eats default | Same-tenant facility | Task 231 selected root |
| `logistics_dispatch_deliveries` / lines | Delivery/line records | Derived from run | None | Parent-derived | No Task 231 field |
| `logistics_manifests` and snapshot tables | Immutable dispatch evidence | Derived; snapshot facility identity on generation | Existing generated history needs reviewed compatibility treatment | Parent-derived | Task 231 compatibility plus later manifest generation update |
| `logistics_carrier_exports` | Manifest export history | Derived from manifest/run | None | Parent-derived | Task 290 |
| `support_tickets` | Tenant support record | Optional contextual facility later | None | Tenant-safe context only | Later Support task |

## Clean Eats Backfill Recommendation

Proposed initial record for review in Task 231:

- display name: **Clean Eats Manufacturing Facility**;
- internal code: **MAIN**;
- status: active;
- organisation default: yes, through `organisation_settings.default_facility_id`;
- timezone: `Australia/Melbourne`;
- country: `AU`;
- address: leave unpopulated until verified from an approved tenant source;
- stock locations: map every existing Clean Eats `inventory_locations` row to this facility;
- production areas: map every existing Clean Eats `production_areas` row to this facility;
- receipts, plans, batches and dispatch runs: backfill to this facility only after consistency checks;
- QA: derive from linked records; no Task 231 QA schema expansion;
- branding: remains organisation-wide.

The display name and code require Luke's approval before migration drafting. No database row is created in Task 226.

## Task 231 Implementation Blueprint

Task 231 should implement the minimum useful foundation only after Architecture Gate 1:

1. Create proposed `facilities` identity/lifecycle table with tenant-safe indexes, constraints, audit fields, RLS and no DELETE policy.
2. Add a nullable same-tenant default facility pointer to `organisation_settings`.
3. Create reviewed facility view/manage permissions and conservative role mappings.
4. Insert the approved Clean Eats default facility by stable organisation slug, without creating generic facilities for unrelated/test tenants.
5. Add nullable `facility_id` to `inventory_locations` and `production_areas`; backfill Clean Eats; validate; then make required where safe.
6. Add nullable direct facility identity to `inventory_receipts`, `production_plans`, `production_batches` and `logistics_dispatch_runs`; backfill through authoritative parents/default; validate; then make required where safe.
7. Add or validate same-facility rules for receipt locations, plan areas and batch plan/area relationships without rewriting historical operational data.
8. Preserve manifest history and define compatibility for generated snapshots before enforcing dispatch-origin assumptions.
9. Add indexes for organisation/facility/status and same-tenant composite foreign keys.
10. Verify RLS, role mappings, counts, nulls, cross-tenant impossibility, existing route compatibility and Clean Eats browser flows.

Task 231 should not add facility membership, selector UI, route changes, commerce connections, storefronts, source orders, demand, calendars, inter-facility transfer schema, facility item duplication, methods/instructions, QA daily check schema, carrier integration, stock movements or operational data beyond the reviewed Clean Eats facility/backfill.

## Deferred Decisions For Tasks 227-230

- **Task 227 (now complete):** selects stable provider/store identity, internal/external store ownership, a narrow external business identity, explicit owner consent plus manufacturer acceptance, and a default-facility readiness direction. No commerce schema is implemented.
- **Task 228:** source order/demand ownership, when facility assignment becomes mandatory, reassignment evidence, freeze/delta behaviour and plan splitting.
- **Task 229:** Shopify installation/credential/security model and trusted connection context. Shopify IDs must not become facility IDs.
- **Task 230:** delivery zones, calendars, cut-offs, public holidays, production-date calculation and automatic target-facility routing.

These tasks must preserve organisation tenancy, facility ownership, provider-neutral source evidence and server-validated facility assignment.

## Risks

- Backfilling a default without auditing existing locations/areas could hide inconsistent records.
- Repeating `facility_id` on children could create drift.
- Deriving facility through a nullable or mutable parent could erase historical meaning.
- A client-selected facility could become an IDOR boundary if not revalidated.
- One lot may eventually span locations/facilities, so lot-level current facility is unsafe.
- Existing generated manifests lack an approved facility snapshot; compatibility must be reviewed before enforcement.
- Facility-specific permissions added too early would complicate RLS without current business value.

## Rejected Alternatives

- Using organisation as permanent physical scope.
- Adding facility identity to almost every operational row.
- Deriving all facility context only from locations or areas.
- Treating storefront, brand, domain or manufacturing customer as facility.
- Sharing or transferring facility ownership between organisations.
- Creating separate facility memberships in Phase 1 without evidence.
- Duplicating items, suppliers or formulas per facility.

## Decisions Requiring Luke

- Approve the proposed Clean Eats display name and `MAIN` code before Task 231.
- Approve any roadmap change if Tasks 227-230 reveal that Task 231 scope must change.
- Approve Architecture Gate 1 before Task 231 begins.

## Decisions Requiring Later Staff Validation

- Verified Clean Eats facility address and dispatch origin details.
- Current stock-location and production-area mapping completeness.
- Facility operational-readiness checklist.
- Whether any staff need facility-restricted access.
- Current transfer, in-transit, receiving, daily QA and production calendar practices.
- Facility-specific methods, instructions, carriers or cost differences.

## Roadmap Implications

Task 226 is committed at `36d53894579e0e8762d7ed441187e5c23552678e`. Tasks 227-229 are complete and Task 230 is next approved. Task 230 must conform to this facility boundary, the Task 227 commerce/authorisation model, the Task 228 order/demand lifecycle and the Task 229 Shopify connector constraints. Architecture Gate 1 remains after Task 230, and Task 231 cannot begin before Luke's gate approval. Detailed transfer design remains Tasks 249-251.

## Behaviour Preserved

No runtime, route, selector, facility record, schema, migration, RLS, permission, tenant data, stock, production, QA, Logistics, Support, Platform Admin or domain behaviour changed. Clean Eats continues as the current single-facility tenant under existing organisation-scoped behaviour.

## Checks

Task 226 requires lint, TypeScript, production build, `git diff --check`, branch/status/diff inspection and stale-claim scans. Static checks do not make facility support operational.

## Next Task

Task 227 is complete. The next approved task is Task 228 - External Order Intake and Production Demand Architecture.
