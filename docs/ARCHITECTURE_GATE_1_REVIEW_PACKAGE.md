# Architecture Gate 1 Review Package

## Gate Purpose

Review the complete Tasks 226-230 architecture before any facility, Commerce, connector, calendar or Production Demand schema begins. This package recommends an outcome; it does not approve the gate.

## Tasks Reviewed

- Task 226 - Facility and Site Architecture Decision
- Task 227 - Commerce Connections and Contract Manufacturing Architecture
- Task 228 - External Order Intake and Production Demand Architecture
- Task 229 - Shopify App Architecture and Security Plan
- Task 230 - Delivery Zones, Calendars and Production-Date Architecture

## Decisions from Task 226

Organisation remains tenant/security boundary. Facilities are organisation-owned physical scopes. Direct facility identity belongs on authoritative operational roots; children derive through same-tenant parents. Single-facility tenants use a validated default. Storefronts and facilities remain distinct.

## Decisions from Task 227

Provider/store identity is stable and connection-scoped. Store owner authority and manufacturer acceptance are separate. Made Active remains an external storefront owner and receives no Clean Eats tenant access. Manufacturer-approved mapping and routing preserve history.

## Decisions from Task 228

Source orders/lines, observations, current projections, interpretations, contributions, live/reviewed/frozen demand, deltas, adjustments and Production Plan allocations are distinct. Frozen demand is immutable. Facility and production date are required before review/freeze.

## Decisions from Task 229

The Shopify app uses public reviewed distribution, limited visibility first, a hybrid merchant/EveryBatch experience, managed installation, expiring offline credentials, read-only least privilege, privacy-minimised GraphQL intake, verified asynchronous webhooks and mandatory reconciliation.

## Decisions from Task 230

Zones are organisation-owned and initially resolve normalized exact postcodes with region/state metadata. Delivery service is separate from courier. Published calendar versions are immutable/effective-dated. Delivery-date-driven production assignment retains exact evidence/rule version. Zapiet parsing is connection-specific. Capacity and customer-calendar replacement remain later.

## Cross-Task Consistency

The five tasks form one chain: accepted storefront source evidence enters Commerce; mappings and calendar rules resolve a target manufacturer, facility, date and product contribution; Production Demand reviews/freezes immutable attribution; Production Plans allocate the frozen result; Logistics later dispatches from the facility using its own carrier truth.

## Source-of-Truth Consistency

- Provider: source order/line and current delivery evidence.
- Commerce: normalized observations, projections and parser/interpretation evidence.
- Tenant Admin: tenant zones, services, calendars and publication.
- Facilities: physical operating scope.
- Products: internal item/formula truth.
- Production Demand: assignment, review, freeze, delta and adjustment truth.
- Logistics: carrier, carrier service, dispatch and manifest truth.
- Reports: read-only historical interpretation.

No competing master was identified.

## Tenant-Boundary Consistency

`organisation_id` remains direct on tenant-owned and future operational records. Facilities and connections are validated same-tenant or through an explicit accepted cross-business manufacturing relationship. Public Shopify requests do not gain tenant access. Made Active authorization cannot grant Clean Eats membership.

## Facility Consistency

Connections may select a target manufacturer/default facility, but do not own facilities. Calendar routing can only select an active same-tenant facility. Plans, batches, receipts and dispatch-run origins become facility roots in Task 231. Calendar/routing schema waits for Task 235.

## Commerce Ownership Consistency

Commerce preserves source evidence without becoming customer CRM or Production truth. Connection-specific parser/routing applicability does not transfer ownership of tenant configuration to a merchant.

## Demand Lifecycle Consistency

Unresolved source evidence may import and remain blocked. Open assignments revise; reviewed demand becomes stale; frozen demand never changes in place. Date/facility changes after freeze become deltas/supersession.

## Shopify Security Consistency

The calendar model does not broaden Task 229 scopes. Postcode remains excluded unless proven necessary and approved. Public eligibility endpoints are future minimum-result boundaries, not direct RLS access to tenant configuration.

## Calendar/Routing Consistency

Postcode, zone, region, service, courier, delivery date, production date, storefront and facility remain separate concepts. Exact postcode plus explicit rules is sufficient for the first foundation and remains extensible. Clean Eats schedule examples are tenant configuration.

## Privacy Consistency

Production uses zone/region/date attribution, not customer contact/address data. Raw postcode is restricted and optional. Support/Platform diagnostics are redacted. Historical source/production evidence follows future retention/redaction rules.

## RLS Direction

Active membership and explicit permissions control tenant configuration. Publishing and overrides are separate sensitive permissions. Same-tenant composite relationships validate facility, connection, zone, service and rule references. Public/anon cannot read operational calendar tables. Provider ingress uses narrow authenticated/private boundaries, never a tenant UI service-role bypass.

## Migration Sequencing

1. Gate 1 review and explicit approval.
2. Task 231 facility foundation and controlled Clean Eats facility backfill.
3. Task 232 provider-neutral Commerce/source foundation.
4. Task 233 Shopify connector foundation.
5. Task 234 product/variant/bundle mappings.
6. Task 235 delivery/production calendar configuration foundation.
7. Task 236 Production Demand schema.
8. Task 237 review/freeze/delta UI.

Each migration remains separately reviewed/applied; no migration is created by Task 230.

## Task 231 Readiness

Architecturally ready **only after Gate 1 approval**. Scope stays facilities, default facility and selected operational roots. It must not add zones, calendars, Commerce routing or Production Demand. Exact Clean Eats facility identity/address needs Luke validation before operational seed/backfill.

## Task 232 Readiness

Architecture inputs are complete after Gate 1: connection/relationship identity, source evidence, parser references, provisional assignment state, jobs/checkpoints and privacy boundaries. It remains blocked pending Gate 1 and Task 231 sequencing.

## Task 233 Prerequisites

Gate approval, Task 232 schema, current official Shopify recheck, environment registrations/hosts, queue/worker/key-management selection, exact scopes/fields, privacy/legal materials, test stores and approved fixtures.

## Task 235 Prerequisites

Gate approval; facilities; Commerce connection identity; verified staff schedule/service/Zapiet evidence; permission design; postcode legal decision if postcode membership is activated; Logistics carrier relationship review.

## Known Risks

Incomplete Zapiet provenance; courier transition timing; unverified cutoffs/holidays; protected postcode; configuration complexity; over-broad future public endpoints; ambiguous overlap; premature multi-facility/capacity work; staff reliance on undocumented exceptions.

## Non-Blocking Follow-Ups

- Collect verified postcode/service/courier/cutoff/holiday evidence before Task 235 activation.
- Capture actual connection-specific Zapiet metadata during controlled Task 233 fixture work.
- Confirm Clean Eats facility name/address before Task 231 backfill.
- Decide exact permission names during each schema task.
- Select Shopify infrastructure and legal/privacy handling before live connection.

## Blocking Decisions

- Luke/product architect must approve or correct Architecture Gate 1.
- Task 231 must receive explicit approval after the gate.
- Any correction identified by reviewers must be completed before schema work.

No unresolved technical contradiction currently requires a correction task, but the reviewers own that determination.

## Decisions Requiring Luke

Gate outcome; Task 231 authorization; canonical Clean Eats facility identity; any postcode collection; publication/override authority; capacity scope; customer calendar/Zapiet retirement; live Shopify rollout.

## Decisions Requiring Staff

Current zone/postcode lists, service differences, schedule effective dates, Zapiet keys, cutoffs, holiday/blackout behavior, courier transition, wholesale rules and emergency/manual processes.

## Decisions Requiring Legal/Privacy Review

Postcode necessity and retention; Shopify protected-data approval; public resolver disclosures/rate limits; redaction/legal holds; support/platform visibility; subprocessors and later address/contact use.

## Recommended Gate Outcome

**Ready for Luke/product-architect Architecture Gate 1 review with listed non-blocking evidence follow-ups.**

The gate is not approved by this document. Task 231 remains blocked.

## Exact Next Actions After Approval

1. Record Luke/product-architect Gate 1 decision and required corrections.
2. If approved, explicitly approve Task 231.
3. Reconfirm Task 231 scope against `FACILITY_FOUNDATION_MIGRATION_STRATEGY.md`.
4. Validate the Clean Eats default facility identity and backfill evidence.
5. Implement/review Task 231 only; do not pull forward Commerce/calendar work.
6. Continue the approved roadmap with separate review gates and post-commit context backfills.
