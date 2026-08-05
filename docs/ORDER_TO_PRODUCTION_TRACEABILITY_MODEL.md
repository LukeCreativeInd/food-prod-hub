# Order-To-Production Traceability Model

> **Task 235 implementation update:** The repository now includes an unapplied parser/calendar/rule interpretation stage between source orders and future Production contributions. Historical attribution selects effective superseded configuration from source-order business time and preserves parser/calendar identities without rewriting prior interpretations. No contribution, demand, freeze or plan rows are created.

## Purpose

This document defines the traceability chain required to explain how provider-owned order lines become EveryBatch manufacturing quantities. Task 232 implements provider-neutral connection, source observation, source order and source line identity foundations in migration 046. Interpretation, contribution, demand, freeze, allocation and execution links remain future work; no live provider runtime or source rows exist.

## Canonical Chain

```text
commerce connection
  -> source event/import/reconciliation observation
  -> source order current projection + retained observations
  -> source line current projection + retained observations
  -> interpretation revision
  -> mapping and bundle/exclusion rule versions
  -> production contribution revision
  -> selected current contribution
  -> live demand aggregate
  -> reviewed demand candidate
  -> frozen demand snapshot and line
  -> immutable source-contribution link
  -> production plan allocation and line
  -> production batch and execution evidence (later)
  -> output lot/stock movement (later)
  -> dispatch/manifest link (later)
```

Each arrow is an explicit identifier/link or a reproducible, version-pinned relationship. Similar labels, SKUs, dates or quantities are never sufficient linkage.

## Minimum Phase 1 Chain

Before the Shopify CSV export, aggregation cleanup and Production Report inputs can be replaced safely, EveryBatch must preserve at least:

1. connection/provider/store identity;
2. source order ID and safe display reference;
3. source line ID and raw quantity/product evidence;
4. accepted source observation/revision;
5. exact mapping and bundle/exclusion rule versions;
6. interpreted production contribution revision;
7. target organisation, facility and production date assignment evidence;
8. live and reviewed candidate provenance;
9. frozen snapshot, line and contribution links;
10. Production Plan allocation.

Production Report retirement additionally requires approved method/task/area semantics and verified calculation parity. Printed pack retirement additionally requires usable floor workflows, printable fallback and staff validation. Output-lot and dispatch closure extend the traceability chain later; they do not justify dropping the upstream links.

## Link Matrix

| From | To | Required link/evidence | Cardinality | Immutable after use? | Why it matters | Owning task |
| --- | --- | --- | --- | --- | --- | --- |
| Connection | Source observation | Stable connection ID, provider, provider event/import identity | One-to-many | Yes | Isolates provider/store context and idempotency | 232-233 |
| Source observation | Source order | Provider order ID plus accepted observation result | Many-to-one | Yes | Explains which evidence changed projection | 232-233 |
| Source order | Source line | EveryBatch order ID plus provider line identity | One-to-many | Identity yes | Retains order/line provenance lost by current cleanup | 232 |
| Source order/line | Current projection | Selected latest authoritative observation | Many-to-one projection | Selection controlled; observations immutable | Supports current state without full event replay | 232-233 |
| Source line | Interpretation revision | Stable line ID and source observation/version | One-to-many revisions | Yes | Prevents rule changes rewriting prior meaning | 234/236 |
| Mapping/rule version | Interpretation revision | Exact immutable version IDs | Many-to-one per rule type | Yes | Reproduces bundle, exclusion and item decisions | 234 |
| Interpretation revision | Production contribution | Interpretation ID, source and contributed quantities | One-to-zero/one/many | Yes | Handles bundles, exclusions and unresolved lines explicitly | 236 |
| Contribution revisions | Selected current contribution | Supersession/current-selection relation | Many-to-one current | History yes | Prevents double counting while live demand recalculates | 236 |
| Current contribution | Live demand line | Aggregation key plus contribution membership | Many-to-one | Projection can rebuild | Gives combined floor quantity with drilldown | 236 |
| Live demand candidate | Review | Candidate/version or reproducible source watermark | One-to-many reviews | Yes | Proves exactly what was reviewed | 236-237 |
| Review | Frozen snapshot | Review ID, freezer and freeze time | One-to-one/controlled supersession | Yes | Separates review from immutable baseline | 236-237 |
| Frozen snapshot | Frozen line | Snapshot ID and item/facility/date dimensions | One-to-many | Yes | Reproduces baseline quantities | 236 |
| Frozen line | Source contribution | Immutable junction with included quantity | Many-to-many where allocation requires | Yes | Answers which source lines formed each total | 236 |
| Frozen line | Post-freeze delta | Snapshot line, prior/new contribution and signed difference | One-to-many | Yes | Prevents late change from rewriting baseline | 236-237 |
| Frozen line | Production Plan line | Explicit allocation quantity and unit | Many-to-many controlled | Yes/history | Prevents double use and explains planned quantity | 236/247 |
| Delta | Production Plan/batch decision | Decision and target allocation | Optional one-to-many | Yes | Explains accepted, deferred or rejected late changes | 237/later Production |
| Plan line | Production batch | Existing/future stable planning relationship | One-to-many | Preserve history | Connects demand to execution | Existing foundation/later Production |
| Batch | Output lot/movement | Future execution posting linkage | One-to-many | Append-oriented | Required for actual manufactured traceability | Later Production/Inventory |
| Output lot/order attribution | Dispatch/manifest | Future fulfilment allocation/snapshot link | Many-to-many controlled | Snapshot/history | Extends source demand to delivery outcome | Later Logistics |

## Link Classification Matrix

| Link/stage | Current implementation status | Future owner | Identity retained | Historical requirement | Phase 1 requirement | Later dependency | Privacy consideration | Failure/exception behaviour |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Connection -> source observation | Schema foundation in migration 046; runtime absent | Commerce connector/intake | Connection, provider event/import key, observed time/digest | Retain processing and material observation evidence | Required before export retirement | 233 | No secrets/raw unrestricted payload in broad reads | Invalid authority/signature blocks processing; duplicate is no-op |
| Source observation -> source order | Schema foundation in migration 046; runtime absent | Commerce intake | Provider order ID in connection context plus optional resolved links | Preserve accepted material observations and projection selection | Required before export retirement | 233 | Safe order reference only outside restricted views | Malformed/reused identity becomes exception; do not merge silently |
| Source order -> source line | Schema foundation in migration 046; runtime absent | Commerce intake | EveryBatch order ID plus provider line identity | Removed/cancelled lines remain | Required before cleanup retirement | 233 | Minimise line properties; no customer contact needed | Missing/ambiguous ID blocks interpretation or uses reviewed provider-specific fallback |
| Source line -> interpretation | Not implemented | Commerce mapping/interpretation | Source line and observation/revision IDs | Every accepted interpretation revision retained | Required before cleanup retirement | 234/236 | Product/rule evidence only | Unknown/conflicting line remains visible and blocked |
| Mapping/rules -> contribution | Not implemented | Commerce-to-Production boundary | Exact mapping, bundle and exclusion version IDs | Immutable contribution revisions | Required before cleanup retirement | 234/236 | No customer PII | Missing rules yield explicit zero/unresolved contribution, never silent loss |
| Contribution -> live demand | Not implemented | Production Demand | Selected contribution revision and aggregation dimensions | Rebuildable projection; source revisions retained | Required before cleanup retirement | 236 | Attribution restricted by purpose | Invalid facility/date/UOM excluded from actionable total but shown as exception |
| Live demand -> reviewed candidate | Not implemented | Production Demand | Candidate/watermark and reviewer | Review and stale state retained | Required before cleanup retirement | 236-237 | Summary plus authorised drilldown | Material change stales review and blocks freeze |
| Review -> frozen snapshot/line | Not implemented | Production Demand | Review, snapshot, line and freezer IDs | Immutable baseline and source links | Required before cleanup retirement | 236-237 | Broad users see manufacturing totals, not PII | Hard blocker prevents freeze; warning override needs actor/reason |
| Frozen line -> Production Plan allocation | Demand/plan foundations exist separately; link absent | Production | Snapshot line, plan/line and allocated quantity | Allocation/release/supersession history | Required before Production Report retirement | 236/247 | No customer contact data | Over-allocation or facility/date mismatch blocks allocation |
| Plan -> Production batch | Partial foundation exists | Production | Existing stable plan/line/batch IDs | Preserve planned lifecycle | Required before Production Report retirement | 247/254+ | No added source PII | Blocked/unready plan cannot imply execution |
| Batch -> Production task | Not implemented | Production | Batch, method/version, area/task IDs | Task generation/execution history | Required before Production Report/printed pack retirement | 244-260 | Area users get minimum operational context | Missing method/QA/readiness blocks task generation/start |
| Task/batch -> consumption/output/lot | Not implemented | Production plus Inventory ledger | Task/batch/input lot/output lot/movement IDs | Append/correction evidence | Required before Digital Batch Record v1; exact decommission need later | 261-265 | Operational lot data only | No false movements; failed transaction creates no partial physical state |
| Output/order allocation -> dispatch | Not implemented | Logistics | Output lot, order attribution, dispatch/manifest IDs | Generated dispatch snapshots retained | Digital Batch Record/later fulfilment enhancement | Later Logistics/CRM | Delivery contact remains restricted | Missing allocation stays exception; never infer from matching title/date alone |

## Attribution Model

Every contribution must preserve enough attribution to answer both a simple floor question and a detailed operational question.

Floor-facing default:

- internal item;
- combined quantity and unit;
- production date;
- facility;
- readiness/status.

Authorised drilldown:

- storefront and connection;
- brand/channel/manufacturing customer;
- safe provider order reference;
- source line and provider product/variant/SKU evidence;
- source quantity;
- mapping, bundle and exclusion decisions;
- delivery attribution;
- contribution and revision status;
- snapshot/delta/plan decisions.

Customer name, email, phone and full address are excluded from broad Production traceability. Restricted delivery/contact data belongs behind a later Logistics/CRM boundary.

## Query Questions The Model Must Answer

The eventual implementation must answer without title/date matching:

- Which source orders and lines created this frozen manufacturing quantity?
- Which storefront, brand, channel and manufacturing customer contributed?
- Which mapping and bundle/exclusion rule versions interpreted each line?
- Which source changes increased or reduced the quantity before and after freeze?
- Which unresolved lines were excluded from actionable totals, and why?
- Which review and freeze authorised the baseline?
- Which Production Plan lines consumed each frozen quantity?
- Which late deltas were accepted, deferred, rejected or acknowledged?
- Which batch later produced the planned item?
- Which output lot and dispatch later fulfilled it, when those links exist?

## Revision And Double-Counting Rules

- Reports count selected current contribution revisions for live demand, not every historical revision.
- Frozen reporting counts immutable frozen lines and links, not a recalculated current projection.
- Delta reporting separates baseline, accepted changes, deferred changes and unresolved changes.
- A superseded snapshot remains historical and is excluded from current operational totals through explicit status, never deletion.
- Plan-allocation reporting uses effective allocation status and quantity so replacement/cancellation does not double consume demand.
- Source event counts are diagnostic metrics, not order or demand totals.

## Provider Archive, Revocation And Tenant Conversion

Connection archive, provider revocation, storefront closure or later conversion of an external manufacturing customer into an EveryBatch tenant must not break existing links.

- Stable internal connection, source order and source line IDs remain.
- Safe provider references remain as historical evidence.
- Secrets/tokens can be revoked or deleted independently.
- External business identity may later link to an organisation without rewriting old manufacturing-customer attribution.
- Archived mapping/rule versions remain readable through historical references.

## Audit Evidence

Future audit/business events should record at least:

- connection accepted, suspended, reauthorised or archived;
- import/backfill/reconciliation outcome;
- mapping/rule approval and supersession;
- source interpretation resolution/exclusion;
- demand review and freeze;
- warning override;
- snapshot supersession/void;
- delta detection and decision;
- manual adjustment and reversal;
- plan allocation/release.

Audit entries contain stable IDs and safe summaries, not provider secrets or unrestricted customer payloads.

## Legacy Decommission Evidence

| Legacy step/tool | Minimum traceability requirement | Additional gate | Retirement classification |
| --- | --- | --- | --- |
| Shopify/Zapiet CSV export step | Reliable provider ingestion, stable order/line identity, idempotent reconciliation, source counts and failure visibility | Parallel-run completeness, provider security approval, Luke approval | Blocked until Tasks 229, 232-233 and parity evidence |
| Zapiet cleanup/meal aggregation tool | Versioned mappings/bundle/exclusion rules, contribution drilldown, correct multi-store attribution, no duplicate revisions | Verified fixture and live parallel-run quantity parity; staff validation | Blocked until Tasks 234-237 and Gate 2 evidence |
| Daily Production Report tool | Frozen demand to plan allocation plus approved formulas, production methods, tasks/areas and report calculation parity | Runtime floor workflow, staff validation and explicit Luke approval | Blocked until later Production replacement sequence |
| Printed global production packs | Usable area/tablet execution, QA integration, controlled printable fallback and stable operational performance | Multi-cycle parallel run, training/SOP sign-off and explicit Luke approval | Later decommission gate; not implied by demand architecture |

## Parity Fixtures

The verified 3 August evidence set should become a privacy-safe parity fixture only through a later approved task. Fixture evidence must preserve stable synthetic/redacted source references, expected mapping/bundle decisions, expected contributions and expected aggregate totals without importing live customer PII.

Required comparisons include:

- raw source order/line counts by storefront;
- excluded and unresolved line counts;
- mapping/rule version decisions;
- contribution quantities by source line;
- combined item totals and source attribution;
- date/facility assignment results;
- reviewed/frozen totals;
- late-change and duplicate-event scenarios.

## Phase Boundaries

Phase 1 requires source-to-plan traceability sufficient to retire the manual export/cleanup steps only after parity evidence. Batch/output-lot/dispatch closure can be linked in later Production and Logistics tasks, but the model reserves stable IDs now so those later links do not require rewriting source history.

No current system can yet provide this complete chain. Tasks 229-237 must implement it incrementally after Architecture Gate 1.

## Behaviour Preserved

No schema, RLS, permission, connector, source order, demand, Production Plan, batch, inventory, QA, Logistics or live system was changed by this model.

## Task 233 Implementation Status

The local connector preserves connection, Shopify order GID, Shopify line-item GID, product/variant identity, provider timestamps, source lifecycle and bounded source metadata. That supplies the first source-evidence segment only. Mapping, contribution, demand, review/freeze, plan allocation, batch and dispatch links remain absent.
## Task 234 Traceability Update

The source-to-production chain now has a production-accepted mapping evidence stage: external catalogue variant -> approved mapping revision -> immutable mapping outputs or approved exclusion. Migration 049 is live/registered. Task 235 adds the next repository-level interpretation stage, source order -> parser/calendar/rule evidence -> reviewed delivery and production dates, through unapplied Migration 050. Contribution, demand, freeze and plan-allocation links remain future stages rather than inferred records.
