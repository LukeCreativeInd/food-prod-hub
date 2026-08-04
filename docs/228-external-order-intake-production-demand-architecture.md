# External Order Intake And Production Demand Architecture

## Purpose

Task 228 defines the provider-neutral path from external commerce evidence to trustworthy manufacturing demand. It preserves source order and line identity while giving Production a controlled live, reviewed, frozen and changed-demand lifecycle.

**Decision:** EveryBatch will use a deliberate hybrid of Option C. It will retain immutable provider identifiers and material versioned source observations, maintain privacy-minimised current order and line projections, and create immutable versioned production-contribution interpretations from approved mappings and rules. Live demand is a recalculable projection of current actionable contributions. Authorised users review a defined candidate and freeze an immutable demand snapshot for one manufacturing organisation, facility and production date. Source changes after freeze create explicit signed deltas. Manual manufacturing adjustments remain separate, authorised and reversible through append-only evidence. Later mapping, calendar, facility or source-projection changes never silently rewrite frozen history.

This is an architecture decision only. No proposed record in this document exists unless it is explicitly identified as current implemented schema.

## Scope

This task decides:

- provider-neutral order, line, observation and reconciliation boundaries;
- source order and line lifecycle principles;
- versioned product interpretation and production contributions;
- live, reviewed and frozen demand semantics;
- post-freeze deltas, manual adjustments and supersession;
- facility and production-date assignment timing;
- Production Plan linkage and source-to-production traceability;
- readiness, privacy, retention, RLS and permission direction;
- constrained blueprints for Tasks 232, 236 and 237.

It does not create SQL, schema, RLS, permissions, Shopify code, webhooks, orders, mappings, demand, plans, fixtures, UI or operational data.

## Current Platform State

- There is no commerce, source-order, source-line, provider-event, mapping or Production Demand schema.
- `/integrations` is a static placeholder and `/crm` is an honest scaffold.
- `internal_items`, formula versions/lines, Production Plans/batches, Inventory, QA and Logistics foundations exist under `organisation_id`.
- Current Production Plans are manual planning records. They do not derive from commerce demand and do not reserve or move stock.
- Logistics deliveries have optional source references and manual delivery snapshots, but they are not source-order or customer masters.
- Facilities remain documentation-only. Task 226 directs one facility per Production Plan and a validated automatic Clean Eats default after Task 231.
- Current RLS uses active membership, granular permission helpers and explicit Platform Admin paths. No cross-business commerce path exists.
- Migrations `001`-`044` are documented applied and no migration is pending.

## Business Context

Clean Eats currently filters Shopify orders through Zapiet/date logic, exports three storefront files, aggregates product quantities, loads summary workbooks into the Production Report and prints room packs. The two Clean Eats stores are merged; Made Active stays visible only as a report brand column.

Task 227 decides that CEA and CEW are distinct Clean Eats-owned connections and Made Active is an externally owned storefront/manufacturing customer whose demand requires owner consent plus Clean Eats acceptance. Task 228 must preserve those identities while still giving floor teams one practical manufacturing quantity.

## Terminology

- **Source order:** provider-owned commerce order.
- **Source order revision:** a material source-order observation at a point in time.
- **Source line:** provider-owned order line.
- **Source observation:** webhook, backfill, reconciliation or provider-fetch evidence.
- **Current source projection:** EveryBatch's latest accepted view of provider state; it is not immutable history.
- **Interpretation revision:** immutable decision applying mapping, bundle/exclusion and lifecycle rules to a source line.
- **Production contribution:** non-negative manufacturing quantity for one internal item produced by one interpretation revision. Reductions are represented by a later revision and signed delta, not a negative current contribution.
- **Live demand:** recalculable aggregation of current actionable contributions.
- **Reviewed demand:** a specific live-demand candidate reviewed with its source/readiness watermark; later material changes make it stale.
- **Frozen demand snapshot:** immutable approved baseline for one organisation, facility and production date.
- **Post-freeze delta:** signed source-derived difference against frozen contribution evidence.
- **Manual adjustment:** authorised non-provider manufacturing change retained separately from source truth.
- **Superseding snapshot:** new immutable baseline that references an earlier snapshot; it is not an in-place unfreeze.
- **Demand exception:** visible blocker or warning preventing safe progression.

## Legacy Workflow And Provenance Loss

The matched 3 August 2026 fixture contains 151 raw rows and 3,626 units. Current title-based logic excludes 12 known parent-pack units and produces 3,614 report units: Clean Eats 3,473 plus Made Active 141.

That fixture verifies one aggregation path but loses or never receives source order IDs, source line IDs, definitive CEA/CEW identity, delivery/production date, status, edits, cancellations, refunds and applied mapping/rule versions. Unknown titles can disappear and current bundle correctness relies on upstream child rows plus title-based parent exclusions.

EveryBatch must preserve both the combined 3,614-style manufacturing result and the complete source contribution chain. The fixture is architecture evidence, not seed data or approved future mappings.

## Architecture Options Considered

### Option A - Current Aggregated Totals Only

Simple and similar to the cleanup tool, but loses traceability, cannot explain edits/cancellations, cannot produce safe deltas and leaves retirement risk unchanged. Rejected.

### Option B - Source Orders With Fully Dynamic Demand

Preserves source rows but recalculates history under current mappings/calendars. It cannot reproduce an approved production baseline reliably. Rejected.

### Option C - Source Evidence, Versioned Contributions And Frozen Snapshots

Preserves provider evidence, explainable interpretation, current demand and immutable manufacturing baselines. It adds lifecycle complexity but directly solves parity, changes and auditability. Selected with a pragmatic current-projection layer.

### Option D - Source Lines Copied Into Production Plans

Fast initially but couples Production to providers, duplicates source truth and handles bundles/multi-provider changes poorly. Rejected.

### Option E - Full Event-Sourced Ledger From Day One

Complete in theory but provider events are inconsistent and rebuilding all state from them adds Phase 1 risk. Rejected. EveryBatch retains material observations and processing evidence without requiring every raw payload forever.

## Recommended Architecture

The model has four controlled layers:

1. **Commerce source evidence:** stable connection/order/line identity, observations, current projections and sync evidence.
2. **Interpretation:** immutable versions applying mapping, bundle/exclusion, lifecycle, facility and date decisions to source lines.
3. **Production Demand:** live projection, review candidate, immutable frozen snapshots, source links, deltas and adjustments.
4. **Production planning/execution:** plans consume frozen demand through explicit allocations; later batches/tasks/actuals retain lineage.

Current projections and live demand may be recomputed. Source identity, accepted observations, interpretation revisions, frozen snapshots, delta decisions, adjustment/reversal evidence and plan allocations are historical records and are not normally deleted.

## Provider-Neutral Source-Order Model

A proposed source order retains:

- stable EveryBatch ID and required connection/storefront context;
- provider order ID as canonical external identity within provider/storefront context;
- provider order number/reference as display metadata;
- provider-created and provider-updated timestamps plus provider timezone/offset evidence;
- source currency and locale where supplied;
- current provider lifecycle projection and latest accepted observation/revision;
- store, brand, channel and manufacturing-customer attribution;
- target manufacturing organisation from the accepted connection/relationship;
- imported, first-seen, last-seen and archive timestamps.

Provider order IDs are unique within verified storefront/connection context, not assumed globally unique. Malformed or conflicting IDs are quarantined. Test/development orders carry explicit environment/test evidence and never enter production demand.

The current projection is updateable only through accepted source observations. Material historical observations remain append-oriented. Order numbers, names and prefixes never establish identity.

## Source-Order Lifecycle

Provider-neutral manufacturing lifecycle separates observed facts from policy:

- draft/test orders are retained if observed but blocked from contribution;
- open/confirmed orders may contribute only after connection, mapping, date and facility readiness;
- payment state is retained, but the exact eligible payment states are provider/business policy owned by Tasks 229/233 and staff validation;
- fulfilment state is retained but does not automatically remove manufacturing demand because production normally precedes fulfilment;
- cancellation removes the affected current contribution through a new observation/interpretation, never deletion;
- refunds are financial evidence and do not reduce manufacturing demand unless provider semantics also establish a line cancellation/quantity reduction or an authorised policy says otherwise;
- archive at the provider is retained as source state, not treated as deletion;
- duplicate, merged, split or substituted orders require explicit provider-specific observations and cannot be inferred from display references.

Every accepted material change appends source observation/history and may produce a new current projection and interpretation revision.

## Source-Line Lifecycle

A proposed source line retains stable EveryBatch identity, provider line ID, parent order, product/variant/SKU references, current observed quantity, line properties, price/tax evidence where justified, bundle/subscription metadata and lifecycle quantities.

Rules:

- current active quantity is non-negative;
- reductions, removals, cancellations and refunded-cancelled quantities remain visible through revisions;
- zero-priced physical products may contribute; price does not determine physicality;
- tips, shipping, pure discounts, gift cards and service lines remain source evidence with explicit zero-contribution classification;
- unknown/unmapped lines remain visible and blocked;
- bundle parent/child relationships use stable source/property evidence and survive later changes;
- line replacement or substitution links predecessor and successor where provider evidence supports it;
- multiple observations never delete the prior line state.

## Source Observations And Reconciliation

A source observation is a normalised envelope for webhook delivery, backfill row, provider fetch, scheduled/manual reconciliation or recovery import. It records provider/connection, object type/ID, observation type, provider event ID when available, observed/provider timestamps, source revision marker, payload digest, ingestion channel and processing outcome.

Every raw event need not be retained permanently. Retain:

- immutable identity/timing/digest and safe event metadata;
- field-limited or redacted material state evidence needed to explain a revision;
- restricted raw payload only where Task 229 proves operational/legal need, with explicit encryption/access/retention controls.

Reconciliation compares provider state with the current projection and appends a correcting observation. It never edits frozen demand. Connector adapters translate provider-specific events into this provider-neutral envelope.

## Idempotency And Duplicate Handling

- Prefer provider event ID for event-delivery idempotency.
- Provider order/line identity is unique in provider/storefront context.
- Where no event ID exists, use a deterministic key from connection, source object, observation type, provider revision/timestamp and canonical payload digest.
- Processing attempts are separate from source lifecycle and may retry safely.
- Duplicate delivery records one outcome and does not create another observation revision, contribution or delta.
- Out-of-order/stale observations may be retained for diagnostics but cannot regress the current projection unless reconciliation proves they represent the authoritative state.
- Same timestamp/revision with conflicting content is an exception requiring reconciliation.
- Backfill and webhook paths share identity and projection rules.

Exact Shopify IDs, ordering guarantees and webhook topics belong to Task 229.

## Product Interpretation

The interpretation chain is:

`source line -> external product/variant -> mapping/rule versions -> lifecycle/date/facility decision -> production contribution revision`

One source line may create:

- zero contributions for an approved non-production/excluded line;
- one contribution for an ordinary mapped finished product;
- multiple contributions for a bundle/kit or deliberate multi-output interpretation.

Multiple lines do not collapse into one contribution record; aggregation combines them later. This preserves line-level provenance.

## Mapping And Rule Versioning

- Mapping, alias, bundle, exclusion and subscription decisions are connection plus target-manufacturer scoped.
- Every interpretation records the exact mapping/rule versions or immutable decision snapshot used.
- Excluded/non-production lines receive explicit zero-contribution evidence and reason.
- Mapping changes create a new interpretation revision for eligible open source state.
- Prior interpretation revisions remain visible.
- Frozen snapshots never recalculate under a new mapping/rule.
- A mapping correction affecting frozen demand creates a delta or reviewed supersession decision.
- Newly mapped historical open orders can be reinterpreted through a controlled reconciliation range; closed/frozen history is not silently backfilled.

Task 234 owns mapping and bundle/exclusion configuration/review. Task 228 owns the interpretation-history contract.

## Production Contributions

Each immutable interpretation revision contains:

- source order, source line and accepted observation/revision;
- connection, storefront, store owner, brand, channel and manufacturing customer attribution;
- target organisation and resolved/tentative facility/date assignments;
- external product/variant/SKU evidence;
- mapping/rule identity and applied versions;
- source quantity/unit and non-negative contributed quantity/unit;
- internal item;
- interpretation status, readiness and zero/exclusion reason;
- superseded interpretation reference and timestamps.

A current-effective pointer/projection identifies the latest accepted interpretation for live demand. Superseded revisions remain immutable. Signed change belongs to comparison/delta records, not current contribution quantity.

## Demand Aggregation

The default manufacturing aggregation key is:

- target manufacturing organisation;
- target facility;
- production date;
- internal manufacturing item;
- compatible manufacturing unit.

Store, brand, channel, manufacturing customer, source delivery date, region/zone and source connection remain drilldown/attribution dimensions rather than splitting the floor quantity by default. If branding or packing creates genuinely different manufacturing output, it must use an approved distinct internal item or explicit future manufacturing dimension, not a display label.

CEA and CEW can combine into one item quantity while retaining separate contributions. Made Active can combine only where it maps to the same manufacturing item/date/facility and remains visible in attribution. Production Admin sees source breakdown; floor users receive the minimum combined quantity needed for execution. Reports aggregate from one chosen demand state and never sum revisions and current projections together.

Formula version is not pinned by Task 228. Task 236 records demand item quantities; Task 246 decides formula-expansion and version-pinning semantics before Task 247.

## Source/Store/Brand Attribution

Every contribution and frozen source link preserves stable connection/storefront IDs plus relevant owner, brand, channel and manufacturing-customer attribution or snapshots. Prefixes such as `CEA`, `CEW` and `MADE` remain display metadata.

Attribution does not create separate tenant ownership. Made Active remains externally owned while Clean Eats owns the manufacturing demand and plan under the accepted relationship.

## Delivery Attribution

Raw delivery evidence and interpreted decisions remain separate. Commerce retains source delivery references and privacy-minimised planning fields. Task 230 defines zones, calendars, cutoffs, delivery-date and production-date rules. Logistics later receives reviewed delivery-contact/address data through a protected handoff/snapshot rather than treating Production demand as customer master data.

## Facility Assignment

- A source order may be imported with target organisation known and facility unresolved.
- A contribution revision may exist as blocked/non-actionable while facility is unresolved.
- Facility must be active, belong to the target organisation and be final before the contribution enters actionable live demand, review or freeze.
- Clean Eats uses the validated single default automatically after Task 231.
- A facility reassignment before freeze creates versioned assignment/interpretation evidence and recalculates live demand.
- A frozen contribution never moves facilities in place; later reassignment creates a delta and, before production start where approved, a superseding snapshot.
- Archived facilities remain on history but block new/actionable assignment.

Task 230 selects routing precedence and override rules; Task 226 owns facility identity/security.

## Production-Date Assignment

- Source ingestion may occur before production date is known.
- A contribution may exist blocked while date interpretation is incomplete.
- Production date and facility are required before actionable live demand and mandatory before review/freeze.
- Delivery date remains distinct and may map to a different production date.
- One production date may include several delivery dates.
- Calendar/rule version and manual override evidence are preserved.
- Pre-freeze reassignment recalculates live demand through a new interpretation/assignment revision.
- Post-freeze date changes create deltas/supersession decisions.

Task 230 decides exact date rules, cutoffs, holidays, blackouts, zones and override precedence.

## Live Demand

Live demand is a derived/materialisable current projection of all current actionable contributions for the aggregation key. It may change as accepted source state, mappings, facility/date assignments or readiness change.

Live demand excludes blocked/unknown/duplicate/cancelled contributions while showing them in an exception count and drilldown. It is not an approved production record and may be rebuilt from current-effective interpretations.

## Reviewed Demand

Review captures a candidate composed of:

- organisation, facility and production date;
- contribution watermark/version set;
- calculated line totals and source attribution;
- exception and reconciliation state;
- reviewer, time and readiness attestations.

Material source or interpretation changes after review mark the candidate stale and require re-review. Reviewed does not mean immutable production baseline until freeze succeeds.

## Frozen Demand

A freeze transaction creates an immutable snapshot header, immutable demand lines and immutable source-contribution links for one organisation, facility and production date. It records actor/time, review basis, included source watermark, totals, attribution and any approved non-blocking warnings.

There is no ordinary unfreeze or update/delete path. Before production starts, a tightly controlled correction may create a new snapshot version that supersedes the prior one. Both remain readable. After production starts, changes are handled as deltas and plan decisions rather than replacing the baseline by default.

## Post-Freeze Deltas

A material source or interpretation change after freeze creates a signed delta against the frozen contribution baseline. Categories include late order, quantity increase/decrease, cancellation, provider-correlated refund, delivery/date/facility change, product substitution, mapping correction and backfill discovery.

Each delta retains original snapshot/line, source order/line, prior/new interpretation, signed quantity difference, category, detected observation/time, current readiness, decision, actor/time and optional target plan/batch.

Allowed conceptual decisions are accept into current compatible plan, defer to a later plan, reject manufacturing change with reason, acknowledge only, cancel planned quantity where still safe, or escalate/block. Duplicate events create no delta.

After production completion or dispatch, a delta records discrepancy/required follow-up and cannot rewrite completed quantities. Exact corrective operational workflow remains later Production/QA/Logistics work.

## Manual Adjustments

Manual adjustments never alter provider orders, source projections or interpretation history. They are signed manufacturing-demand effects with item, unit, facility, production date, reason/category, actor, approval, evidence and optional frozen snapshot/source relationship.

Examples are classified conservatively:

- minimum run, planned overproduction and contingency normally belong to Production Plan uplift linked to the baseline;
- stock-on-hand offset belongs to requirements/availability planning;
- spoilage replacement after execution begins belongs to Production execution/rework planning;
- internal/sample production belongs to a direct authorised Production Plan source, not a fake commerce order;
- imported-evidence correction belongs to source reconciliation/reinterpretation;
- provider outage fallback may use a controlled temporary manual demand adjustment only when authorised and later reconciled.

Where Task 236 includes demand adjustments, reversal appends an equal-and-opposite record linked to the original. No adjustment is edited into provider truth.

## Supersession And Correction

- Mutable projections may be recomputed.
- Immutable observations, interpretation revisions, frozen snapshots, deltas, decisions, adjustments, reversals and plan allocations are corrected by append/supersession.
- A superseding snapshot is permitted only through explicit permission and readiness checks; it references its predecessor.
- Mapping/calendar/facility corrections after freeze produce visible delta/supersession evidence.
- Hard delete is not the normal correction path.

## Production Plan Linkage

Production Demand and Production Plans remain separate domains. Future explicit allocation records link frozen demand snapshot lines to plan/plan-line quantities.

- A plan normally belongs to one facility and production date.
- A plan may consume one or more compatible frozen snapshots only through reviewed allocation.
- One snapshot line may be split across plan lines if the allocation total is controlled and traceable.
- The same frozen quantity cannot be silently consumed twice.
- A plan references the frozen snapshot/version; it does not copy source truth without links.
- Plan cancellation releases/voids allocation evidence without deleting demand.
- Post-freeze deltas link separately to the affected plan decision.
- Existing Production Plan schema is not changed by Task 228; Task 236/237 define the demand-side link and later Production tasks integrate it.

## Source-To-Production Traceability

Minimum durable chain:

`connection -> source order -> source line -> observation/revision -> mapping/rule interpretation -> production contribution -> live demand -> frozen snapshot/line -> plan allocation -> Production Plan`

This chain is required before cleanup-tool retirement. Production Report retirement additionally requires frozen demand through formula requirements, methods/instructions, plan/batch/tasks and validated outputs. Digital Batch Record v1 later extends through actual consumption/output, output lots, QA and dispatch.

Direct relationships are used for identity-critical parentage (line-to-order, interpretation-to-line, contribution-to-interpretation, snapshot-line-to-header). Many-to-many association records are used for contribution-to-snapshot-line and snapshot-line-to-plan-line allocation. Later batch/task/lot/dispatch links derive through authoritative Production/Inventory/Logistics records rather than duplicating source IDs on every child.

## Readiness And Exceptions

Hard blockers that cannot be overridden for freeze include:

- missing/revoked owner authority or manufacturer acceptance;
- inactive/paused connection where intake is not permitted;
- missing target organisation, active facility or production date;
- missing/ambiguous mapping, unsupported bundle or unexplained exclusion;
- invalid quantity/UOM or source identity conflict;
- unresolved duplicate/revision/reconciliation conflict;
- cancelled/non-eligible source state still contributing;
- unresolved material post-freeze change in the candidate.

Warnings may be overridden only when they do not make quantity, identity, facility or date ambiguous, for example optional metadata missing or a reconciled connector currently degraded. Override records actor, time, reason and warning set.

Exception classes are source-ingestion, interpretation, demand-readiness, review, freeze and post-freeze. Blocked lines remain visible and excluded from actionable totals.

## Data Minimisation

Production needs stable source references, store/brand/channel/customer attribution, product/variant/SKU, quantities, mapping/rule evidence, source lifecycle, delivery/production date, planning zone/postcode where necessary and target organisation/facility.

Production does not need customer name, email, phone or full address in broad demand reads. Logistics may need delivery contact/address at dispatch preparation. CRM later owns canonical customer/account truth. Support and Platform Admin receive safe references, counts, states and redacted categories.

## Privacy And Retention

- Core source-order/demand tables should avoid full customer PII initially.
- Privacy-sensitive delivery contact/address should live in a separately protected source/handoff record or Logistics snapshot with narrower access.
- Postcode/zone is excluded by default. Current Shopify policy treats postcode/location as protected customer fields; Task 230 must prove planning need and the Shopify/legal/privacy review boundary before collection.
- Raw payloads are not retained by default merely for convenience.
- Any retained raw payload requires Task 229 approval for field minimisation, encryption, access, retention expiry and deletion handling.
- Provider IDs and manufacturing evidence are retained as long as required for idempotency, traceability and legal/operational history.
- Privacy-safe fixtures use synthetic/redacted references and never commit supplied customer evidence without approval.

## Permissions And RLS Direction

No permissions or RLS are implemented in Task 228. Future concepts likely separate:

- source-order/source-line view;
- sync/reconciliation manage;
- mapping/interpretation review;
- demand view/review/freeze;
- delta decide;
- manual adjustment create/approve/reverse;
- protected delivery-data view;
- diagnostics.

Tenant reads require active membership, appropriate permission and target `organisation_id`. External-store demand also requires an accepted relationship/connection scope. Facility/date reads validate facility ownership under the organisation. Public/anon remain denied. Provider callbacks use separate integration authentication. Client connection, order, mapping, relationship, organisation and facility IDs are untrusted.

Immutable frozen records receive no ordinary update/delete path. Any controlled multi-record freeze/delta/adjustment workflow should derive actor/tenant server-side and use a reviewed transaction boundary. Service role does not bypass tenant checks in tenant UI/runtime workflows.

Likely future helper concepts are `can_view_commerce_source_for_target`, `can_manage_connection_sync`, `can_review_production_demand` and `can_decide_demand_delta`; exact SQL/helpers wait for schema and security review.

## Tenant Admin Implications

Future Tenant Admin may view connection, mapping, date/facility and retention readiness; manage organisation-controlled settings; and assign demand permissions. It cannot alter provider source truth, impersonate external owner authority or edit frozen demand.

## Platform Admin Implications

Platform Admin may inspect non-secret connection health, source counts, processing lag, exception categories and readiness. It cannot silently map lines, freeze demand, create adjustments, accept relationships or inspect unrestricted PII. Any security suspension or support access is explicit and audited.

## Support Implications

Support may receive safe connection/order/line references, sync category, mapping/readiness blocker, delta state and redacted timestamps. It receives no credentials, unrestricted raw payload, broad customer data, formula/cost detail or cross-tenant manufacturing access.

## Reporting Implications

Reports select one semantic layer explicitly: current source projection, live demand, a named frozen snapshot version, accepted deltas or plan allocations. They must not sum current and superseded revisions, both old/new snapshots, or baseline plus already-incorporated deltas.

Reporting dimensions include connection, storefront, brand, channel, manufacturing customer, target organisation/facility, delivery/production date, item and lifecycle. Reports remain readers.

## Current Schema Impact Map

| Current table/module | Current organisation relationship and meaning | Future relationship | Direct source identity? | Direct frozen-demand identity? | Facility/date direction | Likely task / RLS risk |
| --- | --- | --- | --- | --- | --- | --- |
| `organisations` | Tenant/manufacturer root | Target manufacturer; optional future owner link | No | No | Owns facilities | 231-232; no arbitrary cross-tenant target |
| `organisation_memberships` | User-to-tenant access | Manufacturer authority | No | No | Organisation-wide initially | Existing; relationship grants no membership |
| `internal_items` | Products master | Contribution/demand item | No | Referenced by demand line | Organisation-wide master | 232/236; same-tenant item |
| `formulas` | No current table; formula identity is represented by version/output relationships | No direct relationship can be added to a nonexistent table | No | No | Not applicable | Tasks 239/246 must use the actual formula schema and ownership |
| `formula_versions`, `formula_lines` | Versioned Products formula truth | Expanded after frozen demand | No | Pinning deferred | Formula shared; plan facility later | 246-247; do not pin prematurely |
| `production_plans`, `production_plan_lines` | Manual Production plan/output lines | Consume frozen demand through allocation | No direct provider fields | Explicit association later | Plan direct facility/date after 231 | 236-237/later; prevent double allocation |
| `production_batches`, `production_batch_inputs` | Planned Production execution foundation | Derive source lineage through plan | No direct provider fields | Through plan allocation | Batch direct facility after 231 | Later execution; preserve lineage |
| `production_areas` | Organisation production setup | Later plan/task routing | No | No | Direct facility after 231 | 231/252 |
| `inventory_locations` | Stock location | Availability/requirements later | No | No | Direct facility after 231 | 231/248; no demand ownership |
| `inventory_lots`, `stock_movements` | Inventory physical truth/ledger | Requirements/actuals readers later | No | No | Location-derived facility | No demand writes or quantity effects |
| `qa_check_instances`, `qa_results`, `qa_reviews`, `qa_approvals`, `qa_amendments` | QA execution/review history | Later source through plan/batch/task | No | Through Production parent later | Parent-derived facility | 253+; QA remains owner and completed history stays protected |
| `qa_holds`, `qa_hold_events` | QA lot-hold/disposition history | Availability and later Production readiness only | No | No | Lot/location-derived facility | QA remains owner; demand must not duplicate held quantity |
| `logistics_dispatch_runs` | Dispatch root | Later receives approved fulfilment | Optional source refs only | Through plan/output later | Direct origin facility after 231 | Logistics owns dispatch |
| `logistics_dispatch_deliveries` | Manual delivery/address snapshots | Protected order-delivery handoff later | Order link later | No | Derives run origin; destination independent | Narrow PII access |
| `logistics_dispatch_lines` | Manual item snapshots | Source/output link later | Line reference later | Through fulfilment allocation later | Derived run facility | Do not make order master |
| `audit_logs` | Restricted generic audit | Future lifecycle events | Entity refs only | Entity refs only | Context only | 341-342; not operational truth |
| `/integrations` | Static placeholder | Future connection/source health UI | Future | No | Readiness only | After 232-233; no current data |
| `/crm` | Scaffold | Future customer/account truth | Links later, does not own source IDs | No | No | 292-295; avoid duplicate identity |

No current table or module is changed by Task 228.

## Task 232 Implementation Blueprint

Task 232 should provide the provider-neutral Commerce foundation after Tasks 229-230 and Architecture Gate 1:

1. Provider/storefront/connection and external-business/relationship concepts approved by Task 227.
2. Source order and source line stable identities with connection-scoped external uniqueness.
3. Current source projection fields separated from append-oriented material observations/revisions.
4. Source observation/processing evidence with idempotency keys, digests, state and restricted payload policy.
5. Provider product/variant identities and minimal mapping/rule-version anchors needed for line provenance; detailed review remains Task 234.
6. Source store/owner/brand/channel/manufacturing-customer and target-organisation attribution.
7. Provisional facility/delivery attributes that may remain null while blocked; Task 230 supplies the final date/routing model.
8. Archive/retention semantics and no normal DELETE path.

Conceptual uniqueness/index direction:

- provider key + provider store ID for storefront;
- connection + provider order ID;
- source order + provider line ID, with a reviewed fallback only if provider lacks a stable line ID;
- connection + provider event ID, or deterministic idempotency digest;
- organisation/connection/status/last-seen and exception-processing indexes;
- observation source object/time/revision indexes;
- same-tenant target item/facility relationships where manufacturer-owned records are referenced.

Source identity and observations are immutable/append-oriented; current projections and processing attempts are controlled mutable records. Draft/onboarding configuration may be nullable. Imported identity, connection, target organisation and required provider IDs become mandatory when source records exist. No CEA/CEW/MADE seed is allowed until real provider IDs, authority and Gate 1 approval exist.

Rollback disables new intake and processing while preserving imported source evidence. Verification must cover idempotency, out-of-order observations, cross-tenant denial, public/anon denial, minimum-field views, counts/uniqueness, archive history and privacy-safe fixtures.

## Task 236 Implementation Blueprint

Task 236 should own Production Demand, separate from Task 232 Commerce records:

- current-effective production-contribution projection plus immutable interpretation revisions/source links, unless Task 232/234 deliberately owns the interpretation tables;
- materialisable live-demand set/lines by organisation, facility, production date, item and unit;
- reviewed candidate/version with source watermark and stale detection;
- immutable frozen snapshot headers, lines and source-contribution associations;
- append-only post-freeze deltas and decisions;
- append-only manual adjustments and reversal links;
- snapshot supersession;
- explicit snapshot-line to Production Plan/line allocations;
- audit actor/time/reason and readiness evidence.

Recommended separation: live demand is a recalculable/current projection; reviewed candidates and frozen snapshots are versioned records; frozen headers/lines/links, delta decisions, adjustments/reversals and allocations are immutable or append-oriented.

Every demand record retains target `organisation_id`; actionable and frozen records require direct facility and production date. Likely uniqueness includes one current live projection row per aggregation key, one snapshot version per organisation/facility/date/version, one line per snapshot/item/unit, unique source-contribution association per snapshot and idempotent delta identity. Index organisation/facility/date/status, item, snapshot version, source contribution, unresolved delta and plan allocation paths.

RLS requires membership plus demand permissions or explicit Platform Admin diagnostics; freeze/decision/adjustment flows use controlled transactions. No DELETE policy. No source connector, mapping UI, formula expansion, Inventory movement or Production Plan redesign belongs in Task 236.

## Task 237 UI Blueprint

Prerequisites: facility foundation, Commerce/order schema, connector source state, mapping/rules, delivery/calendar configuration and Production Demand schema from Tasks 231-236.

Future UI should provide:

- facility and production-date scope with included delivery dates and source watermark;
- combined demand by item/unit with store, brand, customer and delivery drilldown;
- mapping/lifecycle/date/facility/reconciliation readiness;
- visible blocked/zero-contribution lines and exception queues;
- review and stale-review feedback;
- freeze with hard-blocker enforcement and explicit warning override evidence;
- immutable snapshot comparison;
- post-freeze delta queue with accept/defer/reject/acknowledge/escalate decisions;
- authorised adjustment/reversal controls separated from provider source;
- source order/line/observation and plan allocation drilldown;
- actor, time, reason and prior/current evidence.

The floor-facing view uses combined quantities. Production Admin and authorised reviewers retain source detail. No unrestricted PII is displayed.

## Parity Fixture Strategy

The registered 3 August 2026 fixture remains external privacy-safe evidence. Future controlled tests must prove:

- every raw row retains identity/evidence;
- explicit bundle-parent exclusions account for 12 units;
- accepted contributions reconcile 3,626 raw units to 3,614 frozen demand units with zero unexplained variance;
- Clean Eats aggregation remains 3,473 while source-store uncertainty is not fabricated;
- Made Active remains attributable at 141;
- excluded/unknown rows remain visible.

Additional synthetic/redacted fixtures: edited order, full/partial cancellation, refund, date change, late post-freeze order, mapping correction before/after freeze, unknown product, duplicate/out-of-order event, pause, uninstall, multi-facility route, calendar/holiday change, manual adjustment and superseding snapshot.

Before Task 233 completion: provider IDs, webhook/backfill duplicate/out-of-order/reconciliation fixtures. Before Demand Gate 2: mapping, cancellation/refund, date/facility, freeze/delta/adjustment and supersession fixtures. Before cleanup-tool retirement: raw-to-contribution-to-frozen totals across real parallel days. Before Production Report retirement: the full frozen-demand-to-requirements/tasks/report chain, staff validation and explicit Luke approval.

## Decisions Resolved By Task 229

- GraphQL order and line GIDs under a stable verified connection are canonical provider identities; display references, domains, prefixes and SKU are not.
- Production uses a public reviewed Shopify app with controlled limited visibility, hybrid embedded/EveryBatch surfaces and separate manufacturer acceptance.
- Managed installation, verified session tokens, token exchange and encrypted expiring offline credentials are the direction.
- Phase 1 proposes `read_orders` and `read_products`; `read_all_orders` and direct customer/location fields are conditional or excluded.
- Webhooks use raw-body HMAC verification, durable asynchronous idempotent processing and authoritative reconciliation because delivery can be duplicated, missed and out of order.
- Raw bodies are transient by default; retain allowlisted metadata, digest, normalized material evidence and attempts, not unrestricted payloads.
- Edits, cancellations and refunds create source observations/revisions and post-freeze deltas rather than rewriting frozen demand. Exact eligibility remains tenant/business validation.

## Deferred Decisions For Task 230

- delivery zone/postcode/region model;
- effective-dated calendars, cutoffs, holidays and blackouts;
- delivery-date and production-date calculation;
- Zapiet metadata interpretation;
- facility routing/override precedence and historical rule snapshots.

## Decisions Finalised In Task 228

- Source orders/lines remain provider-owned and separate from Production Demand.
- Stable source order and line identity is retained under connection/store context.
- Current source projections and append-oriented observations are distinct.
- Full event sourcing and indefinite raw payload retention are not required.
- Interpretations are immutable/versioned and may create zero, one or many contributions per source line.
- Excluded/unknown lines remain visible.
- Live demand is a recalculable projection of current actionable contributions.
- Reviewed demand captures a candidate/watermark and becomes stale on material change.
- Frozen snapshots/lines/source links are immutable.
- Post-freeze source changes create signed deltas.
- Manual adjustments remain separate and reversals append evidence.
- Formula version pinning is deferred to Task 246, not demand intake.
- Production Plans consume frozen demand through explicit controlled allocation.
- Minimum source-to-frozen-demand-to-plan traceability is required before cleanup-tool retirement.

## Risks

- Over-retaining payloads exposes unnecessary customer data.
- Weak event ordering can regress current source state.
- Dynamic-only demand can rewrite historical production meaning.
- Mapping/calendar changes can create hidden quantity drift.
- Aggregating by too many source dimensions makes floor demand unusable; aggregating without links loses traceability.
- Manual adjustments can become a back door around source/mapping controls.
- Plan allocation without quantity controls can double-consume demand.
- Broad Platform/Support access can leak external-customer data.

## Rejected Alternatives

- Store only current meal totals.
- Recalculate frozen demand from current source/mappings.
- Copy orders directly into Production Plans.
- Delete cancelled/refunded/removed lines.
- Treat refunds automatically as manufacturing cancellations.
- Use negative current contributions instead of versioned state and deltas.
- Treat manual adjustments as source-order edits.
- Require full raw payload/event retention indefinitely.
- Pin formula versions before formula-expansion architecture.

## Decisions Requiring Luke

- Confirm at Architecture Gate 1 that the selected hybrid proceeds to schema.
- Approve initial CEA/CEW/Made Active connection/backfill scope after provider IDs are verified.
- Approve which non-blocking warnings, if any, may be overridden at freeze.
- Approve the policy for superseding a frozen snapshot before production starts.
- Approve final legacy cleanup-tool and Production Report decommission evidence at their later gates.

## Decisions Requiring Staff/Business Validation

- Eligible order/payment states and handling of cancellations, refunds and fulfilment.
- Bundle, subscription, exclusion and free-item behaviour per storefront.
- When operations review/freeze demand and which roles perform it.
- How late increases/decreases are accepted once planning or production starts.
- CEA/CEW store identity and attribution, Made Active mappings and current manual overrides.
- Minimum delivery fields required before Logistics handoff; postcode/address are not approved unless Task 230 proves necessity and protected-data approval is obtained.
- Whether plans may combine multiple compatible frozen snapshots and how plan uplift is approved.

## Roadmap Implications

Task order is unchanged. Tasks 229-230 have completed Shopify security and delivery/calendar/routing architecture without implementation. Task 230 confirms revisioned assignment evidence, immutable published rules, connection-specific parsing and no silent reinterpretation of frozen demand. Architecture Gate 1 review is current. Task 231 remains blocked, and Tasks 232-237 cannot begin before their approved gates/dependencies.

## Behaviour Preserved

No application code, route, navigation, auth, middleware, domain, schema, migration, RLS, permission, package, feature flag, tenant data, provider API, connection, order, mapping, demand, plan, fixture or live system changed. The current Zapiet/manual workflow and Production tools remain operational. No migration is pending and no legacy tool is retired.

## Checks

Task 228 requires lint, TypeScript, production build, `git diff --check`, branch/status/diff inspection, stale-claim scans and scope verification. Passing checks does not make order intake or Production Demand operational.

## Next Task

Luke/product-architect Architecture Gate 1 review. No implementation task is approved yet.
