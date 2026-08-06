# Production Demand Lifecycle And Freeze Model

## Purpose

This document defines the Task 228 lifecycle contract from accepted source evidence to Production Plan allocation. It is architecture only. Current Zapiet/manual exports and Production tools remain operational until parity and decommission gates are passed.

## Lifecycle Layers

The lifecycle is deliberately separated into five layers:

1. **Source observation:** provider event, import, fetch or reconciliation evidence arrives.
2. **Current source projection:** accepted observations update the latest provider-observed order and line state without deleting older material evidence.
3. **Interpretation revision:** approved mapping, bundle, exclusion, delivery and assignment rules produce zero, one or many versioned production contributions.
4. **Demand state:** selected current contributions aggregate into live demand, are reviewed, then freeze into an immutable baseline.
5. **Production allocation:** an authorised Production Plan consumes frozen demand; later source changes become explicit deltas.

No layer silently rewrites an immutable downstream layer.

## Conceptual States

| State | Meaning | Entry condition | Permitted outcome |
| --- | --- | --- | --- |
| Ingesting | Source evidence is being validated and projected | Accepted connection/event/import context | Awaiting interpretation, blocked or excluded |
| Awaiting interpretation | Source is valid but mapping/rules are incomplete | Source line retained without approved interpretation | Resolved contribution or explicit exclusion |
| Blocked | Material truth is ambiguous or required assignment is missing | Unknown mapping, duplicate conflict, invalid quantity/UOM, missing relationship/facility/date | Resolve through new evidence/configuration/review; never hide quantity |
| Live | Current accepted contributions can aggregate | Source, relationship, mapping, facility and date are ready | Recalculate, move to review, or return to blocked |
| Ready for review | Candidate totals and contribution set have no hard blockers | Current calculation is complete for scope/watermark | Authorised review |
| Reviewed | Reviewer accepted the candidate and evidence watermark | Permission, actor and readiness captured | Freeze or become stale if material inputs change |
| Frozen | Immutable baseline for one organisation/facility/production date | Authorised freeze of reviewed candidate | Allocate to plan; record deltas; supersede under control |
| Partially superseded | Later controlled baseline or decisions replace part of the prior operational intent | New snapshot/delta decision references prior evidence | Historical reporting retains both |
| Closed | Production/operational lifecycle no longer accepts normal demand changes | Plan/execution policy closes the scope | Historical view and discrepancies only |
| Cancelled/voided | Snapshot or review is invalidated through controlled evidence before use | Explicit authorised decision | Retained as non-actionable history |

These are conceptual states, not final SQL enum values.

## Live Demand

Live demand is a recalculable projection over the selected current production-contribution revisions. Its default aggregation key is:

- target manufacturing organisation;
- target facility;
- production date;
- internal manufacturing item;
- compatible demand unit.

Storefront, connection, brand, channel, manufacturing customer, source order, source line, delivery date and delivery zone remain attribution dimensions available through contribution drilldown. They do not split floor-facing demand rows by default.

Live demand may change when a new accepted source observation, interpretation revision, mapping/rule revision, pre-freeze facility/date assignment or reconciliation result changes the selected current contributions. A rebuild must produce the same result from the same selected revisions and must never double count superseded contributions.

## Reviewed Demand

Review records an authorised decision over a specific live-demand candidate. It must preserve:

- candidate/version or reproducible source watermark;
- organisation, facility and production date;
- contribution set or stable query boundary;
- totals and compatible units reviewed;
- hard blockers and warnings at review time;
- reviewer profile and reviewed time;
- any permitted warning override and reason.

Material changes after review make that review stale. Stale reviewed demand cannot be frozen until recalculated and reviewed again.

## Frozen Demand

A freeze produces an immutable snapshot header, immutable demand lines and immutable source-contribution links. It records:

- organisation, facility and production date;
- snapshot sequence/version and predecessor where applicable;
- reviewer/freezer identities and timestamps;
- item, quantity and unit per frozen line;
- exact contributions behind each quantity;
- source, mapping, bundle, delivery and assignment evidence references;
- readiness and any approved warning evidence.

There is no ordinary unfreeze. Before Production starts, an authorised replacement may create a superseding snapshot that references the prior snapshot and explains the change. After Production starts, changes use deltas and plan decisions. Frozen rows are not recalculated when mappings, calendars or formulas change.

Formula-version pinning is not decided here. Task 236 must preserve the demand/item boundary; Tasks 246-247 decide where formula expansion and exact formula version become pinned for Production execution.

## Post-Freeze Delta

A post-freeze delta is the signed difference between a contribution included in the frozen baseline and a later accepted source or interpretation state. It must preserve:

- original snapshot and frozen line;
- source order and source line;
- prior and new contribution revisions;
- signed quantity difference and unit;
- category and reason;
- detecting observation/event and detected time;
- decision, actor, reason and decision time;
- target plan/batch allocation where relevant.

Supported decisions are conceptually:

- accept into the current plan when safe;
- defer into a later plan;
- reject the manufacturing change with reason;
- acknowledge without changing production;
- cancel unstarted planned quantity when safe;
- escalate/block pending review.

A source-derived delta is not a manual adjustment. After completion or dispatch, the delta remains a discrepancy or later operational decision; it never rewrites produced or dispatched history.

## Manual Adjustments And Reversals

Manual demand adjustments are authorised manufacturing decisions separate from provider truth. They require organisation, facility, production date, item, signed quantity, compatible unit, category, reason, actor and approval evidence. They may reference source evidence but cannot alter it.

Adjustments are append-only. A reversal links the original adjustment and records an equal/opposite controlled decision rather than updating or deleting the original.

Typical classification:

| Scenario | Correct model |
| --- | --- |
| Minimum run, planned overproduction or contingency | Production Plan uplift/decision, normally not source demand |
| Stock-on-hand offset | Availability/planning calculation, not negative source demand |
| Spoilage replacement after execution | Later execution/rework decision, not source rewrite |
| Samples or internal production | Direct authorised plan demand/adjustment, no fake provider order |
| Correcting misinterpreted open source evidence | New interpretation revision; delta if already frozen |
| Temporary provider outage | Controlled temporary adjustment only if approved, then reconcile explicitly |

## Production Plan Allocation

Freezing does not automatically create a Production Plan. An authorised user creates or approves planning allocation.

- A plan normally belongs to one facility and production date.
- One plan may consume compatible lines from more than one frozen snapshot.
- One frozen line may be allocated across plans only through explicit quantities.
- Total effective allocation must prevent accidental double consumption.
- Each allocation preserves snapshot line, plan, plan line, quantity, unit, actor and status history.
- Cancelling or replacing a plan releases or supersedes allocation evidence; it does not delete demand or source history.
- Late deltas link to the plan decision that accepted, deferred or rejected them.

## Readiness And Overrides

Hard blockers are not overrideable when manufacturing truth is ambiguous:

- invalid or inactive connection/relationship;
- target organisation mismatch;
- missing/inactive facility;
- missing production date;
- unknown or conflicting product/bundle mapping;
- invalid quantity or incompatible UOM;
- malformed/duplicate source identity conflict;
- cancelled source state still contributing;
- missing required source observation evidence.

Warnings may be overrideable only when the underlying quantity and ownership remain unambiguous. Each override requires an authorised actor, reason, time and retained review evidence. Final permission names belong to Tasks 236-237.

## Scenario Decisions

### 1. New Order Before Freeze

The observation updates the current source projection. Approved interpretation creates contributions; ready contributions recalculate live demand. Reviewed demand becomes stale if the new order is within its candidate scope. No delta exists until a snapshot is frozen.

### 2. Quantity Increase Before Freeze

A new source observation and interpretation revision supersede the prior current contribution. Live demand increases. Historical contribution evidence remains. Any prior review is stale; the new amount is included only after review/freeze.

### 3. Full Cancellation Before Freeze

The provider cancellation state is retained. A new contribution revision reduces current contributed quantity to zero. Live demand falls; the removed quantity does not disappear from source history. A refund alone changes demand only if provider/policy evidence says manufacturing quantity changed.

### 4. Late Order After Freeze

The new contribution is compared with the frozen scope and creates a positive delta. An authorised user may accept it into the current plan, defer it, reject manufacturing change or escalate. The snapshot stays unchanged.

### 5. Quantity Decrease After Freeze

The prior frozen contribution and new current contribution produce a signed negative delta. Plan allocation changes only after an explicit decision, and only unstarted quantity may be cancelled safely. If Production is complete or dispatched, record a discrepancy/later decision rather than rewriting output.

### 6. Mapping Correction Before Freeze

Create a new immutable interpretation revision using the corrected mapping/rule version and select it as current. Recalculate live demand and stale any prior review. Preserve the earlier interpretation; do not edit its item or quantity.

### 7. Mapping Correction After Freeze

Keep the original mapping/rule evidence in the frozen snapshot. Create corrected interpretation/contribution revisions and explicit negative/positive deltas, or a controlled superseding baseline only if Production has not started. Never recalculate old snapshots in place.

### 8. Manual Authorised Overproduction

Do not invent or increase a provider order. Record the additional quantity as an authorised Production Plan uplift or, where the future policy specifically treats it as demand, a separate manual demand adjustment with reason, actor and approval. Preserve the frozen provider-derived baseline.

### 9. Facility Reassignment

Before freeze, a versioned authorised assignment moves live contribution only after the new facility is active and permitted. After freeze, use a superseding snapshot before Production starts or explicit cross-scope deltas and plan decisions. Never mutate a frozen snapshot’s facility.

### 10. Delivery-Date Change After Production Starts

Retain the new source delivery evidence and create cross-scope post-freeze deltas or an exception decision. Do not move the frozen baseline or rewrite started plan/batch history. An authorised operator records whether remaining quantity is accepted, deferred, rejected or handled as a later operational discrepancy.

Duplicate and out-of-order observations remain governed by idempotent no-op and authoritative-reconciliation rules described above; arrival order alone cannot regress the current projection.

## Lifecycle Invariants

- Source cancellation, refund, archive and deletion signals never erase imported identity or historical interpretation.
- Current projections are replaceable; material observations and accepted interpretation revisions remain traceable.
- Selected-current pointers must prevent duplicate contributions from entering live demand.
- Reviewed demand is not frozen demand.
- Frozen snapshots and their source links are immutable.
- Mapping, calendar and facility rule changes do not rewrite frozen history.
- Parser, courier, delivery-date and production-date changes also create explicit post-freeze delta/supersession evidence rather than reinterpretation.
- Signed reductions live in revision differences/deltas; a selected current contribution quantity is nonnegative.
- Physical stock movements, production outputs and dispatch history are outside this lifecycle and cannot be fabricated by demand decisions.

## Task Boundaries

- Task 229 owns Shopify OAuth, webhook/event mechanics, provider identifiers, payload minimisation and security specifics.
- Task 230 has selected delivery-zone, calendar, cutoff and production-date routing semantics; Task 235 owns configuration implementation after Gate 1.
- Task 232 owns provider-neutral Commerce schema boundaries and idempotency foundations after Gate 1.
- Task 234 owns mapping, bundle and exclusion configuration/version workflows.
- Task 235 owns delivery/calendar configuration implementation.
- Task 236 owns contribution, demand, snapshot, delta, adjustment and allocation schema details.
- Task 237 owns review/freeze/delta user experience and authorisation feedback.
- Tasks 246-247 own formula expansion and formula-version pinning in production preparation.

## Behaviour Preserved

This model changes no source orders, Production Plans, batches, inventory, QA, Logistics, CRM, permissions, tenant data or live systems. Existing legacy production exports remain required until verified parity and explicit decommission approval.

Task 228 creates no SQL, schema, migration, RLS policy, permission or runtime workflow.

## Task 236 Implementation Update

Live Migrations 051-052 implement only the recalculable live stage and have passed full rollback-only database/runtime verification. Generation runs replace a source line's selected-current contribution set idempotently while retaining prior contribution rows as history. Current blocker, exclusion and inactive-source evidence has its own deterministic fingerprint: unchanged evidence retains the same issue row, while only a meaningful evidence transition resolves and replaces it. The stable aggregate is grouped by organisation, facility, production date, internal item and exact UOM. Task 236 deliberately adds no reviewed candidate, watermark, immutable freeze, delta, manual adjustment or plan-allocation records; those boundaries remain Task 237 or later.
