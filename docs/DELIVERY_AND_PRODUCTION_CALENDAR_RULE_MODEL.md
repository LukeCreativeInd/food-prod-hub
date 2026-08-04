# Delivery and Production Calendar Rule Model

## Status

Architecture only. No SQL, schema, engine, tenant configuration or runtime behavior is implemented by this document.

## Core Model

A tenant owns stable zones, customer-facing delivery services and calendars. Mutable drafts are reviewed and published as immutable effective-dated versions. Source metadata is interpreted by a connection-specific parser version. Resolution appends assignment evidence containing inputs, the selected rule/version, result, facility and decision time.

## Zone Lifecycle

`draft -> reviewed -> active/published applicability -> inactive/archived`

- Membership edits occur in a draft/version.
- Publication validates exact postcode format and absence of ambiguous overlap in the same resolver scope.
- Archive stops future eligibility but preserves all historical references.
- A referenced zone is never deleted or moved between organisations.

## Service Lifecycle

`draft -> active -> inactive/archived`

- Customer service identity remains stable across courier changes.
- Connection/zone/facility applicability and carrier-service mappings are effective-dated.
- Archive prevents new selection; historical source and dispatch evidence remains readable.

## Calendar Lifecycle

`draft -> reviewed -> published future-effective/active -> superseded -> archived`

- Drafts are mutable and non-operational.
- Review records reviewer/outcome but does not activate rules.
- Publication fixes rule content and establishes an effective interval.
- Published content is immutable. Correction creates a successor draft/version.
- Future-effective versions allow planned schedule/courier changes.
- Supersession closes future applicability without deleting history.
- Rollback publishes a known reviewed successor; it never edits a prior version.

## Standard Recurring Rule

A recurring rule explicitly scopes delivery weekday, service and optional connection/zone/region/facility to delivery availability or a production weekday. The resolver calculates an exact local date and retains that result. Recurrence is not an unqualified global weekday constant.

## Exact-Date Exception

An exact-date exception has a purpose (`delivery`, `production`, `cutoff`, `routing`), scope, effect, reason and effective date. It can close, open or remap an otherwise recurring result. It outranks recurring rules and remains immutable after publication.

## Cutoff

Cutoff uses an IANA timezone and a local weekday/date/time. The decision records evaluated instant, rule/version and pass/fail outcome. New customer options disappear after cutoff; imported late evidence becomes an exception for review.

## Blackout

A blackout is a reviewed exact-date closure, not a flag edited on historical assignments. It may target all activity or a narrower facility, connection, zone or service. Emergency blackouts append actor/reason evidence.

## Public-Holiday Input

A holiday records jurisdiction, date, source/reviewer and status. It is an input to an explicit exception, not an automatic shift. Delivery, production, courier and cutoff effects can differ.

## Facility Route

Phase 1 starts with the accepted Commerce connection's active same-tenant default facility. A published narrow routing rule may override it. Inactive or cross-tenant facilities never resolve. One contribution is not split across facilities in the initial model.

## Production-Date Assignment

The production resolver is delivery-date-driven. It combines source delivery date, connection, zone/region, service, organisation timezone and facility context, selects exactly one published rule, calculates an exact production date and appends evidence. No match or equal-priority conflict is blocked.

## Parser Profile

A profile is connection-specific and versioned. It allowlists provider metadata locations/keys and defines date/service/region formats, timezone and conflict rules. A result records source evidence references, parser version and status. Published parser versions are immutable after use.

## Manual Override

An override records actor, authority, reason, prior assignment, new assignment, time and approval where required. Before freeze it creates a new assignment revision. After freeze it creates explicit delta/supersession evidence. Reversal is another append-only decision.

## Supersession and Archive

Supersession is forward-looking. Archive removes configuration from normal selection. Neither operation alters source observations, assignment evidence, frozen demand, plans, dispatches or reports.

## Historical Retention

Retain stable zone/service/facility identity, source delivery evidence, normalized outputs, parser version, calendar/rule version, local timezone, assignment result, override and freeze/delta links. Reports read stored attribution.

## Precedence

1. Approved manual override.
2. Published exact-date exception.
3. Published connection-specific zone/service rule.
4. Published shared zone/service rule.
5. Published organisation/facility standard.
6. No unique result: blocked.

Narrower scope wins only where the model explicitly defines specificity. Row creation time and arbitrary database order never resolve conflicts.

## Conflict Detection

Validate effective-period overlap, postcode overlap in the same resolver scope, duplicate rule dimensions, equal explicit priority, multiple active versions and incompatible facility/connection ownership. Publication fails on ambiguity. Runtime ambiguity produces an exception, not a guess.

## Readiness

- **Configuration:** published parser, zones/services/calendars and valid facility default.
- **Source:** recognized provider evidence or approved review.
- **Zone:** active unique resolution when required.
- **Delivery:** valid service/date, cutoff and exceptions handled.
- **Production:** one date rule and active facility.
- **Demand:** mapping, assignment and source contribution complete.

## Transition Rules

- Source import may precede resolution.
- Resolved live assignment may revise when evidence/configuration changes.
- Reviewed demand becomes stale on material revision.
- Freeze requires one valid facility and production date with retained version evidence.
- Frozen demand is immutable; later changes append deltas.
- Started/completed production is historical; changes become exceptions rather than plan rewrites.

## Worked Conceptual Scenarios

### 1. Monday VIC Production

A reviewed recurring VIC rule maps Tuesday delivery to the preceding Monday at the Clean Eats default facility. The exact dates and rule version are retained.

### 2. Tuesday Multi-Region Production

Distinct recurring rules map Wednesday/Thursday VIC and Thursday/Friday NSW/QLD delivery dates to one Tuesday production date. Demand aggregates by item/facility/date while retaining each delivery/source attribution.

### 3. Thursday VIC/NSW Production

Friday/Saturday VIC and Monday NSW rules converge on one Thursday production date. The Monday delivery crossing a weekend is explicit, not inferred by a fixed offset.

### 4. Public Holiday Shifts Production

A reviewed holiday input leads staff to publish an exact-date production exception. Existing frozen demand remains unchanged; affected open assignments revise and reviewed demand becomes stale.

### 5. Courier Changes Next Month

A future-effective customer-service-to-carrier-service mapping is published. Customer service identity and prior dispatch history do not change.

### 6. Cutoff Passed

The resolver records the applicable cutoff instant and prevents the date from new selection. A late imported provider order is retained as a review exception.

### 7. Missing Postcode but Trusted Delivery Date

A connection-specific parser resolves a trusted delivery date and region. If the published production rule does not require zone/postcode, production assignment can succeed without retaining postcode; otherwise it remains blocked.

### 8. Conflicting Zapiet Metadata

Tag and order attribute produce different dates. Parser result is `conflicting`; source evidence remains visible and no actionable demand is created until reviewed.

### 9. Production Date Manually Overridden Before Freeze

An authorized manager records reason and replacement date/facility. A new assignment revision becomes current and the prior result remains historical.

### 10. Delivery Date Changed After Freeze

Commerce appends the new source observation. Production Demand creates a signed post-freeze delta/supersession decision. The frozen snapshot and plan linkage are not rewritten.

### 11. Default Facility Becomes Inactive

New assignments block. Existing history remains linked to the inactive facility. Tenant Admin must publish/approve a replacement default/routing rule before new review/freeze.

### 12. Future Multi-Facility Routing

A later explicit route selects a facility by approved scope. Contribution splitting, if ever needed, produces separate revisioned contributions and separate facility plans; it is not an implicit calendar side effect.

## Implementation Boundary

Task 235 may implement the constrained rule/configuration foundation after Architecture Gate 1 and its prerequisites. It must not implement a generic expression engine, customer Shopify UI, real-time reservations, Production Demand or duplicate Logistics carrier tables.
