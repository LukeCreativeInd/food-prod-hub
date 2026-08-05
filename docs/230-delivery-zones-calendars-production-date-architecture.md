# Task 230 - Delivery Zones, Calendars and Production-Date Architecture

> **Task 232 implementation update:** Source orders can retain nullable delivery-date/region/service candidates and provisional same-tenant facility identity. Migration 046 adds no postcode, zone, parser, calendar or production-date calculation; those remain Task 235.

## Purpose

Define the tenant-owned, effective-dated delivery and production calendar architecture that completes the Tasks 226-230 architecture phase and supplies the review evidence for Architecture Gate 1.

## Scope

This is architecture only. It creates no schema, SQL, migration, configuration records, postcode validator, calendar engine, Shopify extension, Zapiet parser, facility, source order or Production Demand. Current Zapiet/manual operations remain authoritative until later implementation, parity review and explicit retirement approval.

## Explicit Decision Statement

EveryBatch will use organisation-owned, versioned delivery zones with normalized exact-postcode membership as the first deterministic eligibility resolver and explicit region/state metadata for operational grouping. Customer-facing delivery services remain separate from Logistics-owned carriers and carrier services, with effective-dated mappings between them. Delivery and production calendars use immutable published versions containing explainable recurring rules and exact-date exceptions. Delivery-date-driven production assignment retains the source evidence, parser version, zone, service, facility and exact rule version used. Current Clean Eats Monday, Tuesday and Thursday patterns become reviewed tenant configuration, never global code. Frozen demand is never silently reinterpreted when calendars, couriers, facilities, parser profiles or source evidence change.

## Current Platform State

- `organisations` is the tenant boundary; `organisation_settings.timezone` currently defaults to `Australia/Melbourne`.
- No `facilities`, Commerce, delivery-zone, postcode-membership, calendar, production-date assignment or Production Demand tables exist.
- `inventory_locations`, `production_areas`, `production_plans` and `production_batches` are currently organisation-owned and have no facility identity.
- Logistics has organisation-owned `logistics_carriers`, `logistics_carrier_services`, dispatch runs, deliveries, lines and manifests. Carrier configuration is operational truth, not a customer delivery promise.
- No Shopify app, Zapiet parser, customer calendar or postcode endpoint exists.

## Business Context

Clean Eats manufactures demand from Clean Eats Australia, Clean Eats Wholesale and externally owned Made Active. Several delivery dates and regions can feed one production day at one current facility. Courier and schedule changes are expected. The model must explain historical assignments while supporting later tenants and facilities without encoding Clean Eats conventions globally.

## Current Clean Eats Production Schedule

Luke-confirmed current operational examples, each requiring staff validation before activation as effective-dated tenant configuration:

| Production day | Included delivery evidence |
| --- | --- |
| Monday | Tuesday VIC |
| Tuesday | Wednesday VIC; Thursday VIC; Thursday NSW; Friday NSW; Thursday QLD; Friday QLD |
| Thursday | Friday VIC; Saturday VIC; Monday NSW |

These examples are not permanent rules. Exact postcodes, cutoffs, services, couriers, holiday behavior and effective dates remain unverified.

## Terminology

- **Postcode:** protected delivery-location input, not a zone.
- **Delivery zone:** tenant-defined eligibility grouping.
- **Region:** broader operational attribution such as VIC, NSW or QLD.
- **Delivery service:** customer-facing promise or option.
- **Courier/carrier:** external operator; Logistics owns its master record.
- **Delivery date:** customer-selected or provider-promised date.
- **Production date:** manufacturing date assigned by an approved rule or override.
- **Calendar version:** immutable published rule set with an effective period.
- **Assignment evidence:** retained inputs, result and rule/parser versions for one decision.

## Legacy Zapiet Workflow

Zapiet currently supports postcode/date eligibility and contributes delivery metadata before staff export. Tony applies report filters before export. Current files then pass through cleanup and Production Report tools.

## Provenance Loss

The supplied production CSVs/workbooks omit source store, order/line IDs, delivery date, postcode, zone, region, service, courier and production date. The PDF retains only a manually selected production date. Exact Zapiet fields and filter choices cannot be reconstructed. Task 233 must retrieve approved source metadata; Task 234 owns connection-specific interpretation; Task 235 owns tenant rules.

## Architecture Options Considered

### Zone Options

- **State only:** simple but cannot establish postcode eligibility or metro/regional differences.
- **Exact postcode:** deterministic and testable, but needs maintenance and overlap controls.
- **Generic rule engine:** powerful but premature, difficult to explain and unsafe to configure initially.
- **Staged hybrid:** exact postcode membership plus region/state metadata now, extensible resolver strategies later. **Selected.**

### Calendar Options

- **Hard-coded weekdays:** reproduces examples but fails on holidays, courier changes and tenant reuse.
- **One global calendar:** cannot safely separate stores, zones, services or facilities.
- **Generic expression engine:** excessive complexity and poor operational explainability.
- **Versioned explicit rules:** effective-dated recurring mappings and exact-date exceptions with retained evidence. **Selected.**

## Recommended Architecture

1. Tenant-owned zones and services form stable configuration identity.
2. Published calendar versions contain explicit delivery availability, cutoff and production-assignment rules.
3. Source metadata is parsed through a connection-specific versioned profile.
4. Resolution produces revisioned assignment evidence, not mutable fields without provenance.
5. A source order may remain imported but blocked while zone, date, service or facility is unresolved.
6. Open/live demand may be recalculated through a new assignment revision; reviewed demand becomes stale; frozen demand changes only through delta/supersession evidence.

## Delivery-Zone Model

Zones are organisation-owned, have stable code/display identity, optional region/state attribution, lifecycle status and versioned memberships. Several connections may use one zone. A zone does not own a facility. Archive removes future eligibility but preserves historical references. No hard delete after use.

Task 235 should implement exact Australian postcode memberships and connection/service applicability, not range, radius or polygon evaluation. Later resolver types can be added behind the same normalized eligibility result.

## Postcode Normalization and Eligibility

- Phase 1 Australian input is trimmed and validated as exactly four digits; leading zeroes are preserved.
- A postcode is required for a public eligibility lookup, but not necessarily for source-order ingestion.
- Trusted provider delivery date/region evidence may permit production assignment without retaining postcode when tenant rules prove that input sufficient.
- Raw postcode is restricted source/routing data. Downstream Production should prefer zone/region attribution.
- Resolution returns `eligible`, `ineligible`, `ambiguous` or `requires_review`; it never guesses.
- Public resolution is rate-limited, validates country/context, and returns only minimum service/date results.

## Zone Overlap and Precedence

The same normalized postcode may appear in different non-competing scopes, such as separate storefront/service applicability. Two published memberships must not produce multiple eligible zones within the same organisation, country, connection applicability, service and effective date. Deliberate overlap requires explicit priority, review and a deterministic uniqueness/overlap validator. An unresolved tie blocks availability and demand freeze.

## Region and State Model

Country uses ISO code; state/territory uses normalized jurisdiction codes; region is tenant-defined operational grouping. Zones may reference region/state, but neither replaces exact postcode eligibility. Current VIC/NSW/QLD labels are operational attribution, not the full zone model.

## Delivery-Service Model

A customer-facing delivery service is organisation-owned and may be available by connection, zone, facility and effective calendar. It has stable code/name and archive history. Retail, wholesale and external-customer connections may share a service or use separate applicability without duplicating the zone.

## Courier and Carrier Relationship

Logistics remains source of truth for `logistics_carriers` and `logistics_carrier_services`. Calendar configuration owns the customer promise and may map it to a Logistics carrier service by effective period, zone and facility. Courier change creates a new mapping/version and never rewrites historical service or dispatch evidence. Task 235 must reference, not duplicate, Logistics carrier masters.

## Delivery-Calendar Rules

Published delivery-calendar rules state when a service/date is eligible for an organisation, optional connection, zone/region and facility. Phase 1 dimensions are organisation, calendar version, connection applicability where needed, zone/region, service, delivery weekday/date, timezone and cutoff. Product-specific lead time, radius and real-time reservation capacity remain later.

## Production-Calendar Rules

Rules are delivery-date-driven: an eligible delivery date plus scoped connection/zone/region/service/facility maps to an exact production date using an explicit production weekday/date rule. Recurring weekday rules calculate an exact local business date; exact-date exceptions can replace it. A no-match or unresolved tie blocks assignment.

## Effective Dating

Draft versions may change. Reviewed versions await publication. Published versions are immutable and have non-overlapping effective periods within the same calendar scope. A future-effective version supports planned courier/schedule changes. Supersession closes/replaces future applicability; archive removes future selection. Rollback republishes a reviewed successor rather than deleting history.

## Rule Versioning

Every assignment records calendar/version ID, rule ID, parser profile/version, source delivery evidence, resolved zone/service, timezone, target facility, decision timestamp and any override. Current configuration never reinterprets historical assignments.

## Rule Precedence

1. Approved manual assignment override.
2. Published exact-date exception for the narrow validated scope.
3. Published connection-specific zone/service rule.
4. Published shared zone/service rule.
5. Published organisation/facility standard rule.
6. No unique match: blocked.

Specificity is defined structurally, not by row order. Rules at equal precedence cannot overlap unless one explicit reviewed priority produces a unique winner.

## Cutoffs

Cutoffs are timezone-aware, effective-dated and scoped only as narrowly as required. Evaluation records the applicable rule, local cutoff instant, source/selection time and result. Crossing a cutoff prevents that option for new selection; already imported orders become reviewed exceptions rather than being silently removed. One-off exceptions may extend or shorten a cutoff with actor/reason evidence.

## Blackouts

Blackouts are published exact-date exceptions scoped to organisation, facility, delivery/production purpose, zone, service or connection as needed. They retain reason, actor, status and history. Emergency closure creates an explicit exception and follow-up review; it does not mutate recurring rules.

## Public Holidays

Holidays are jurisdiction-aware inputs, not automatic production decisions. Task 235 should support reviewed manual holiday entries and resulting exceptions first. External holiday feeds are deferred until provenance, update and override behavior is designed. Delivery, courier, cutoff and production impacts are configured separately.

## Capacity Direction

Capacity remains Future/Pending for the first calendar foundation. Task 235 may reserve extensible concepts in documentation but should not add a live capacity engine or generic limit fields without approved units and ownership. Real-time cart reservations are explicitly excluded. Production Demand/load visibility must mature before capacity controls customer availability.

## Delivery-Date Interpretation

Provider values remain source evidence. A parser produces normalized date, service, zone/region candidates and confidence. Calendar validation confirms whether the date/service was valid for the recorded source context. Invalid, missing or conflicting data remains visible as an exception.

## Production-Date Assignment

The resolver uses normalized delivery date, source/connection context, zone/region, service, organisation timezone and validated facility scope. It selects one published rule and stores the exact calculated date and evidence. Before freeze, changed inputs create a new assignment revision. After freeze, they create delta/supersession evidence. After production starts, the historical plan is not rewritten.

## Multi-Date Production Runs

Several delivery dates, regions and storefronts may aggregate to one production date and facility when units/items are compatible. Attribution remains available by source contribution. One delivery date may route to different production dates only through explicit scoped rules. Multi-facility contribution splitting is deferred until a proven tenant need.

## Facility Routing

Task 226 remains authoritative. Phase 1 resolves the target manufacturer's active default facility from the accepted connection relationship. A published exact routing rule may override that default only within the same organisation. Facility must be active before demand review/freeze. Clean Eats' single default resolves automatically. Source evidence can import unresolved; frozen demand never moves silently. Task 231 adds facility identity/defaults only, not calendar-routing schema.

## Storefront and Connection Scope

Zones and services can be shared organisation configuration. Applicability and parser profiles can be connection-specific. Storefront never equals facility. Each CEA, CEW and Made Active installation remains a distinct Commerce connection with separate authorization/readiness and may select shared manufacturer rules after acceptance.

## Clean Eats Australia Implications

CEA is a distinct Clean Eats-owned connection. It may use shared Clean Eats zones, services and production calendars, but its provider identity, parser profile, source observations, sync health and applicability remain independently traceable. Retail behavior must be configured explicitly rather than treated as the organisation default by accident.

## Made Active Implications

Made Active owns and authorizes its storefront. Clean Eats accepts manufacturing intake and controls its facilities/calendars. Made Active receives no Clean Eats tenant access and cannot publish Clean Eats rules. Its metadata parser and service applicability may differ while using approved Clean Eats production calendars.

## Clean Eats Wholesale Implications

CEW is a separate connection. Wholesale may use different services, cutoff or applicability, but differences must be explicit configuration, not inferred from store name.

## Zapiet Parser/Configuration Model

Each connection selects an immutable/versioned parser profile defining allowlisted source locations, key aliases, formats, timezone, normalization and conflict behavior. Parser logic may inspect tags, order custom/note attributes and approved line attributes. No global Clean Eats key names. Exact keys remain unverified by current repository evidence.

## Parser Confidence and Exceptions

Results are `resolved`, `resolved_with_warning`, `missing`, `conflicting`, `invalid` or `requires_review`, with confidence/evidence and parser version. Only resolved or explicitly reviewed results can become actionable. Format changes create a new parser version and reprocessing revision, not in-place historical changes.

## Future EveryBatch Shopify Calendar

EveryBatch should ultimately own canonical zone/calendar rules. A then-current Shopify cart, checkout or theme surface may request minimum eligibility results, show services/dates, revalidate server-side and write structured versioned selection metadata. Extension type, write scopes and platform capability are deferred to implementation-time official review.

## Zapiet Replacement Direction

Zapiet remains operational through initial connector and demand work. Replacement is Future/Pending and requires stable configuration, parity fixtures, Shopify review/scopes, customer fallback, uninstall safety, support readiness, live parallel validation and explicit Luke approval. No new task number is assigned.

## Manual Overrides

Zone, date and facility overrides require active tenant membership, explicit permission, reason, actor, prior/result values and approval where policy requires. Pre-freeze overrides create revisioned assignment evidence. Post-freeze changes create deltas/supersession; after production begins they become operational exceptions. Reversal is append-only.

## Historical Preservation

Published configuration, parser versions, assignments, overrides, frozen attribution and supersession remain readable after archive. Reports read stored assignment evidence and never rerun old records through current rules.

## Readiness and Exceptions

Separate dimensions: configuration, source/parser, zone, delivery, production date, facility and demand readiness. Blockers include missing/ambiguous zone where required, invalid date/service, cutoff failure needing review, blackout/holiday unresolved, no unique production rule, inactive facility, missing mapping or unresolved source evidence. Courier unresolved may be a Logistics warning if customer service/date and production routing are otherwise valid. Every blocker records owner and permitted resolution.

## Permissions and RLS Direction

Future rows retain direct `organisation_id`; same-tenant facility/connection/service relationships are validated server-side. View, manage, publish and override permissions remain distinct. Client IDs are untrusted. Public/anon cannot read tenant calendar configuration; a future public eligibility function returns minimum results only after validation/rate limiting. Tenant UI never uses service-role bypass. Support/Platform access is explicit, redacted and audited.

## Tenant Admin Implications

Tenant Admin will own zone memberships, customer services, applicability, calendar drafts/review/publication, cutoffs, exceptions, parser profiles, facility defaults and readiness. Publication and sensitive overrides require dedicated authority.

## Platform Admin Implications

Platform Admin may diagnose counts, overlaps, stale versions, parser failures and readiness. It does not silently edit tenant schedules or accept manufacturing relationships.

## Support Implications

Support sees safe connection/zone/service references, parser status, calendar version and error category. It receives no unrestricted address/postcode or rule-management authority.

## Production Admin Implications

Production views need production date/facility, included delivery dates, region/zone, stores, rule/version, overrides and post-freeze changes. Production Admin does not edit provider source truth.

## Logistics Implications

Logistics retains carrier/service and dispatch truth. It consumes customer delivery-service attribution and effective carrier mapping. Dispatch origin derives from the assigned facility after Task 231.

## Reporting Implications

Reports group by stored production date/facility and preserve delivery-date, connection, zone/region and service drilldown. Archived versions remain labeled. Current rules never recalculate frozen or historical output.

## Current Schema Impact Map

| Current table/module | Current relationship/meaning | Future relationship | Direct future identity | Derivation/history | Task / RLS risk |
| --- | --- | --- | --- | --- | --- |
| `organisations` | Tenant root | Owns zones/services/calendars | None on existing row | Stable owner | 235; no public reads |
| `organisation_settings` | Tenant timezone/defaults | Default facility/calendar context | `default_facility_id` from Task 231 only | Calendar defaults later | 231/235; same tenant |
| `internal_items` | Product master | Future lead-time applicability only | None in Phase 1 | Rules may reference later | Future; avoid scope creep |
| `inventory_locations` | Org-owned location | Belongs to one facility | `facility_id` | Historical physical scope | 231; same-tenant FK |
| `production_areas` | Org-owned work area | Belongs to one facility | `facility_id` | Plans/batches validate facility | 231 |
| `production_plans` | Org-owned plan date | One facility and frozen-demand allocations | `facility_id` | Plan date stays production date | 231/236 |
| `production_batches` | Org-owned output batch | One facility | `facility_id` | Derive from plan when present | 231 |
| `logistics_carriers` | Carrier master | Referenced by effective mapping | No calendar ownership | Historical carrier retained | 235/later Logistics |
| `logistics_carrier_services` | Operational service master | Optional mapping target | No duplicate calendar master | Historical mapping snapshot | 235 |
| `logistics_dispatch_runs` | Org-owned dispatch header | One origin facility | `origin_facility_id` | Delivery assignments feed run | 231/later Logistics |
| `logistics_dispatch_deliveries` | Delivery snapshot | Reads service/date/zone evidence | No facility duplication | Derives origin from run | Later Logistics |
| `logistics_dispatch_lines` | Delivery item lines | Source/demand attribution later | None now | Derive parent | Later Logistics |
| `logistics_manifests` | Immutable generated manifest | Snapshot origin/service evidence | No direct facility field in Task 231 | Derives origin from the protected dispatch run; existing snapshots are not rewritten | 231/later Logistics |
| Integrations placeholder | Static UI only | Future Commerce readiness | None implemented | N/A | 232-233 |
| Support tickets | Tenant support context | Safe diagnostic references only | No calendar FK initially | Snapshot safe context | Later Support |
| `audit_logs` | Generic audit table | Publication/override events later | Reference metadata only | Append business events later | 235/348 |
| Future source orders/lines | Not implemented | Source delivery/parser evidence | Connection/source IDs | Revisioned observations | 232-233 |
| Future Production Demand | Not implemented | Assignment/freeze/delta evidence | Facility/date/rule version | Immutable frozen attribution | 236-237 |

## Cross-Module Impact

| Domain | Decision now | Implementation later / unresolved dependency |
| --- | --- | --- |
| Facilities | Active same-tenant default/routing target | Task 231 after Gate 1; canonical Clean Eats identity needs Luke |
| Commerce connections | Connection-scoped parser/applicability and accepted manufacturer | Task 232; no schema |
| Shopify connector | Minimum approved delivery metadata only | Task 233; exact fields/privacy recheck |
| Products | No facility duplication; lead-time rules deferred | Task 234 mappings; later product lead-time evidence |
| Production Demand | Date/facility/rule evidence required before review/freeze | Tasks 236-237 |
| Production Plans | Consume frozen facility/date allocations | Task 231 facility root and later 236 allocation |
| Inventory | No calendar quantity changes | Task 231 location/receipt facility only |
| QA | Calendar exceptions do not become QA results | Later checks may read facility/date context |
| Logistics | Carrier masters retained; customer service maps effectively | Task 235 relation and later dispatch handoff |
| CRM | No customer master/address collection | Tasks 292-295 if later approved |
| Reports | Read stored assignment versions | Tasks 303-308; no reinterpretation |
| Tenant Admin | Future configuration owner | Task 235 UI/task sequencing after schema |
| Platform Admin | Redacted readiness only | Later platform diagnostics; no tenant edits |
| Support | Safe error/version context only | Later diagnostics; no PII/rule authority |
| Audit | Publication/override events required later | Task 235 plus business-event work 341-342 |
| Permissions/RLS | Membership plus separate view/manage/publish/override direction | Exact keys/policies in owning migrations |
| CEA/CEW/Made Active | Separate connections, potentially shared manufacturer rules | Staff/store evidence before activation |
| Future facilities/providers | Stable extensibility without global Clean Eats/Shopify logic | Add only through explicit reviewed rules/adapters |

## Task 232 Constraints

Store connection-scoped source delivery metadata, parser profile/version reference, normalized date/service/zone candidates, provisional facility/date state, revision history and privacy-minimised postcode handling. Preserve unparsed allowlisted evidence. Do not make Commerce configuration the zone/calendar master.

## Task 233 Constraints

Retrieve only approved Shopify fields needed for lifecycle and configured parser inputs, including source timestamps/store timezone, tags and approved custom attributes. Postcode is excluded unless Task 230 legal/privacy/business conditions are satisfied. Imported evidence may remain blocked. No global Zapiet keys.

## Task 235 Implementation Blueprint

After Gate 1, design reviewed schema/RLS for organisation-owned zones and exact postcode memberships; region metadata; customer delivery services; connection/service/zone applicability; calendar/version lifecycle; recurring delivery and production rules; exact-date exceptions; cutoffs; blackouts; manually reviewed holidays; parser profiles/versions; default facility/routing applicability; immutable publication/history; readiness and audit events. Every proposed row directly retains `organisation_id`; scoped FKs are same-tenant. Published versions are immutable; no hard delete after reference.

Likely constraints include stable org codes, non-overlapping published periods per calendar scope, unique normalized postcode per competing resolver scope, one selected published version for an effective instant, unique explicit priorities and active same-tenant references. Likely indexes cover organisation/status, effective periods, normalized postcode, connection/service/zone applicability, local date/weekday, facility and unresolved readiness. Task 235 must include zero tenant seed data, manual review/backfill steps, rollback by successor publication, SQL verification, fixtures and browser smoke tests. It must not add cart UI, real-time capacity, Production Demand, duplicate carrier masters or a generic expression engine.

## Task 236 Constraints

Production Demand stores delivery attribution, production date/facility assignment revision, exact rule/version and source contribution links. Review requires resolved facility/date. Freeze stores immutable attribution. Later changes create explicit deltas/supersession and never mutate the frozen baseline.

## Task 237 UI Constraints

Show production date, facility, included delivery dates, stores, region/zone, service where relevant, parser/assignment status, rule/version, blockers, overrides and post-freeze deltas with source drilldown. Do not expose unnecessary customer location data.

## Clean Eats Configuration Recommendation

Later create one active default `MAIN` facility with `Australia/Melbourne` and `AU`, only after Luke verifies the canonical name/address. Configure separate CEA, CEW and Made Active connections; VIC/NSW/QLD region metadata; zones only from verified postcode evidence; and the confirmed schedule examples as draft rules. Staff review, parallel comparison, publication, monitoring and effective-dated supersession are mandatory. Do not invent postcode memberships, cutoffs, couriers, service IDs, holiday rules or capacity.

## Parity and Fixture Strategy

Required fixture families: Monday VIC; Tuesday multi-date VIC/NSW/QLD; Thursday VIC/NSW; unserviceable/ambiguous postcode; trusted date without postcode; unsupported date; cutoff crossed; blackout; holiday shift; future courier mapping; future-effective version; exact-date exception; supersession; inactive facility; manual override; post-freeze date/facility change; connection-specific/parser format change; conflicting metadata; no production date; wholesale rule; Made Active using Clean Eats calendar; future multi-facility routing.

Task 235 requires deterministic rule/precedence/history tests. Demand Gate 2 requires source-to-frozen attribution and delta tests. Live CEA/CEW/Made Active requires verified real metadata, permissions, privacy and parallel results. Manual export retirement requires production parity, staff validation, runtime evidence and Luke approval. Zapiet replacement additionally requires customer-flow parity, rollback and App Review readiness.

## Architecture Gate 1 Review

Post-task status: Luke approved Architecture Gate 1 through the Task 231 prompt. Task 231 is committed; migration 045 is live and browser validated, though SQL Editor did not register version 045. Task 232 then created unapplied migration 046. The original recommendation below is retained as Task 230 decision history.

Tasks 226-230 are coherent: organisation remains tenant boundary; facilities are manufacturer-owned physical scope; storefront ownership and manufacturer acceptance remain separate; Commerce preserves source evidence; Production Demand owns review/freeze/delta; Shopify uses privacy-minimised read-only intake; calendars provide versioned assignment evidence without stealing Logistics carrier truth. No direct contradiction was found.

Open items do not block review of the architecture model: exact postcodes, current Zapiet keys, cutoffs, courier/service names, holiday responses and schedule effective dates need staff evidence; postcode collection and retention need legal/privacy confirmation before use. Gate approval itself and Task 231 authorization remain Luke/product-architect decisions.

## Architecture Gate 1 Recommended Outcome

**Original Task 230 recommendation: ready for Luke/product-architect Architecture Gate 1 review with listed non-blocking evidence follow-ups.** This document did not approve the gate; Luke subsequently approved it through the Task 231 prompt.

## Risks

- Incomplete Zapiet provenance may hide current edge cases.
- Overlapping configuration can create ambiguous eligibility without strict validators.
- Postcode is protected customer data and may add review/legal burden.
- Courier transition may occur before rules are captured.
- Excessive dimensions could make staff configuration unusable.
- Holiday and cutoff behavior remains operationally unverified.
- Premature capacity or multi-facility logic would distract from parity.

## Rejected Alternatives

State-only zones; hard-coded Clean Eats weekdays; one global calendar; unrestricted generic expressions; courier-as-delivery-service; storefront-as-facility; postcode-as-zone; live rule mutation; current-rule reinterpretation of history; webhook/Zapiet metadata as unquestioned truth; full real-time capacity in Task 235; immediate Zapiet replacement.

## Decisions Requiring Luke

- Approve or correct Architecture Gate 1 and explicitly approve Task 231.
- Confirm the default Clean Eats facility identity when Task 231 begins.
- Approve any postcode collection, capacity scope, customer calendar work, Shopify scope expansion or Zapiet retirement.
- Confirm publication/override authority during later permission design.

## Decisions Requiring Staff Validation

Exact postcodes/zones; CEA/CEW/Made Active service differences; Zapiet keys/formats; current cutoff and late-order handling; courier/service mapping; holiday/blackout process; schedule effective dates; wholesale rules; manual fallback and emergency closure process.

## Decisions Requiring Legal/Privacy Confirmation

Whether postcode is necessary; Shopify protected-data approval; retention/redaction; public resolver disclosures/rate controls; processor/subprocessor terms; support/platform visibility; later address/contact use.

## Roadmap Implications

Task 230 completed the architecture phase. Luke subsequently approved Architecture Gate 1 and Task 231. Task 231 is committed, migration 045 is live/browser validated, and Task 232 creates the next unapplied Commerce foundation without changing task order.

## Behaviour Preserved

Task 230 changed no schema, code, routes, permissions, RLS, packages, live settings, source orders, facilities, calendar rules, parser, demand or operational data. Current Zapiet/manual exports and legacy Production tools remain operational. Migration `045` was created and manually applied later by Task 231.

## Checks

Required completion checks are lint, TypeScript, production build, `git diff --check`, branch/status/diff inspection, stale-claim scans and confirmation that only approved Markdown changed.

## Next Step

Luke and the product architect review `ARCHITECTURE_GATE_1_REVIEW_PACKAGE.md`. No next implementation task is approved until that review closes the gate explicitly.

## Task 233 Implementation Update

Order and line tags/custom attributes are preserved only as bounded allowlisted source metadata for later connection-specific parsing. Task 233 does not interpret Zapiet keys, resolve delivery/production dates, add postcode/customer fields, publish calendars or replace Zapiet. Delivery/calendar readiness therefore remains blocked.

## Task 235 Implementation Update

Task 235 implements the constrained repository foundation in unapplied Migration 050. It uses organisation-owned zones, separate delivery services with optional same-tenant Logistics references, immutable effective-dated calendar/parser versions, reviewed exact-date exceptions and approved order overrides. The resolver enforces the approved precedence and blocks same-precedence ambiguity. The Phase 1 model deliberately omits postcode/customer PII storage, capacity, customer-facing calendar work, Zapiet replacement and Production Demand.
