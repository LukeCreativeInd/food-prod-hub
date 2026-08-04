# Production Parity Fixture Register

## Registered Fixture

| Field | Value |
| --- | --- |
| Fixture ID | `PROD-PARITY-2026-08-03-001` |
| Production date | 3 August 2026 |
| Source stores | Clean Eats Australia and Clean Eats Wholesale as two unresolved UUID files; Made Active identified with high confidence |
| Evidence | `FIX-CE-RAW-A-001`, `FIX-CE-RAW-B-001`, `FIX-MADE-RAW-001`, `FIX-CE-CLEAN-001`, `FIX-MADE-CLEAN-001`, `FIX-PDF-001` |
| Privacy | Customer-derived privacy-safe/internal operational; no customer identity fields present |
| Delivery coverage | Not retained in fixture; upstream Zapiet/staff filter decision cannot be reconstructed |
| Raw rows / quantity | 151 rows / 3,626 units |
| Verified cleanup | Clean parent exclusion 10; Made alias mapping; exact-title grouping; 3,473 Clean workbook and 143 Made workbook |
| Verified report filter | Two Made pack-parent units excluded from fixed 26 rows |
| Verified report totals | Clean 3,473; Made 141; Already Made 0; final 3,614 |
| Verified output | 26 meal rows, 22 pages, five section types and copy pattern 2/3/2/1/3 |
| Acceptance owner | Luke plus responsible Clean Eats production/QA/area staff at future parity gate |

## Automated Test Levels

This fixture can support deterministic tests for:

- CSV schema parsing;
- raw-line preservation;
- store-input labelling where supplied externally;
- bundle parent/child classification for the observed `_sb_*` and `_rc_*` patterns;
- Made alias mapping;
- exact current aggregation output;
- unknown/non-production exception reporting;
- demand total reconciliation;
- fixed matched-day PDF summary and section comparison.

It cannot establish correct production-calendar assignment, cancellations/edits, approved formulas, yields, methods, room ownership, stock allocation, QA execution or actual output.

Task 228 defines how later privacy-safe fixtures should retain stable synthetic/redacted source order and line references, source observations, exact mapping/bundle-rule versions, contribution revisions, reviewed/frozen totals and delta decisions. The current matched fixture does not contain that lost provenance and must not be represented as if it does.

## Future Required Fixtures

| Fixture category | Evidence still required | Test purpose |
| --- | --- | --- |
| Ordinary production day | Source orders/lines through final outcome | Baseline ingestion and execution |
| Monday VIC-only | Delivery dates/zones and assigned production date | Calendar rule |
| Tuesday multi-date VIC/NSW/QLD | All included dates/regions/services | Multi-date aggregation |
| Thursday VIC/NSW | All included dates/regions/services | Calendar rule |
| Edited order | Before/after source event and freeze state | Delta reconciliation |
| Cancelled/refunded order | Source lifecycle evidence | Demand removal/review |
| Delivery-date change | Original/new metadata and decisions | Reassignment without history rewrite |
| Store-source change | Connection/store attribution | Preserve source identity |
| Bundle/multipack | Parent/children and expected contribution | No double count/omission |
| Subscription line | Actual subscription metadata | Classification rules |
| Unknown product | Unmapped source line | Visible exception; no silent loss |
| Non-production product | Gift/service/pack examples | Explicit exclusion reason |
| Free/gift item | Price and production intent | Production contribution independent of price where approved |
| Duplicate event | Replayed source event | Idempotency |
| Component-heavy day | Approved nested formulas | Expansion/cycle/performance |
| Batch-rounding edge | Approved expected values | Batch/minimum/rounding semantics |
| Yield/water rule | Approved formula/yield/method data | Requirement parity |
| Shortage/held stock | Lots, locations, holds and demand | Physical/held/available result |
| Multi-location transfer | Pick, transfer, staging confirmation | Planning versus movement |
| Courier/calendar change | Effective-dated old/new configuration | Historical stability |
| Public holiday/blackout | Rule and approved exception | Calendar handling |
| Printable fallback | Canonical frozen/task data and accepted pack | Controlled fallback parity |
| Legacy-to-digital room comparison | Annotated pack and area user test | Task coverage and staff acceptance |

All unsupplied categories remain future evidence required. Expected values must be approved from real current operations, not invented from legacy constants.
