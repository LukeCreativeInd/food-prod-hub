# Task 224 - Production Replacement Evidence Collection And Legacy Logic Audit

> **Committed and accepted:** Task 224 was committed as `8b8e94a87f6e94fef78c05317f87cad4bb01caea` (`Audit legacy production logic and evidence`). Luke accepted its evidence through Task 225, which closed Review Gate 0 and established [EveryBatch Official Roadmap - Tasks 225-348](./225-348-official-roadmap.md).

> **Task 239 ownership decision:** This evidence is now classified through [Production Knowledge Concept Model](./PRODUCTION_KNOWLEDGE_CONCEPT_MODEL.md). Products owns Formula/BOM composition; Production owns independently versioned Method and Work Instruction knowledge; Recipe is presentation only. Legacy values remain behavioral evidence and are not approved by that decision.

## Status And Purpose

Task 224 is a completed and committed read-only evidence/documentation audit. It inspected the supplied cleanup/report source, matched CSV/XLSX/PDF fixture, current EveryBatch foundations and the then-provisional roadmap.

It audits current behaviour. It does not approve legacy formulas or methods, implement replacement functionality, activate the proposed roadmap, retire a tool or change a live system.

## Evidence And Integrity

All eight requested attachments were accessible. Both ZIPs passed integrity checks and were extracted only under `/private/tmp`. The archives contain no `.git`; archive comments were recorded as unverified snapshot identifiers and business-significant files were hashed. The three CSVs, two workbooks and PDF were hashed and parsed read-only. See `PRODUCTION_REPLACEMENT_EVIDENCE_MANIFEST.md`.

No raw evidence, personal data or secret value was added to EveryBatch. The fixtures contain production product/quantity data and no customer identity columns. Source code contains a GitHub secret key name only.

## Sources Inspected

- Streamlit cleanup application with Clean Eats, Made Active and historical Elite paths.
- Streamlit Production Report application, active calculation modules, inactive duplicate modules, GitHub-backed history and weekly summary support.
- Two unresolved Clean Eats store exports and one high-confidence Made Active export.
- Combined Clean Eats and Made Active cleanup workbooks.
- The 3 August 2026 generated 22-page report.
- Current EveryBatch formulas, UOM, Inventory, Production, QA, Logistics and ownership foundations through migration 044.

Exact deployment hosting was not verified. No source dependency was installed and no legacy app was run against production.

## Matched Fixture Result

The two Clean Eats exports contain 124 rows and 3,483 raw units. Exact-title filtering removes 10 known bundle parents and produces 26 rows totalling 3,473. The Made export contains 27 rows and 143 units; four aliases are mapped and the workbook retains two pack parents, producing 28 rows totalling 143. The report's fixed 26-title filter removes those two units, producing Made 141.

PDF result: Clean Eats 3,473 + Made Active 141 - Already Made 0 = 3,614. All 12 raw-to-report excluded units are explained; no unresolved quantity variance remains for this day.

## Verified Behaviour

- Exact-title fixed-list filtering, grouping and zero-fill for Clean Eats.
- Four Made title aliases and extra-row retention.
- Bundle child rows contribute; bundle parents are excluded by title rather than property parsing.
- Clean Eats Australia and Wholesale are merged before report input.
- Product/variant IDs, variant names and properties are ignored by calculations.
- Separate Clean, Made and optional Elite report columns; manual production date and `Already Made` adjustment.
- Hard-coded expansion, batch and room calculations with upward rounding.
- Five PDF sections across 22 pages with copy pattern 2/3/2/1/3.
- Static HACCP header, fixed use-by offsets, GitHub-backed daily history and weekly summaries.

## Unverified Or Unsafe To Assume

- Exact CEA versus CEW UUID-file assignment.
- Delivery-date filtering, cutoff, holiday, region, courier and wholesale/residential rules.
- Cancellation, refund, edit, free-item and subscription handling.
- Current correctness of any formula, yield, water, batch, rounding, use-by, room or check value.
- Current room recipients and physical workflow.
- Legacy deployment/ownership and whether weekly/history features are still operationally required.

## Production Calendar

Luke's Monday/Tuesday/Thursday regional examples are recorded as current operational context. None are retained in the matched files and none should become a global constant. Future rules must be configurable and effective-dated, with source connection, delivery evidence, assigned production date, facility and decision/version retained historically.

## Formula, Method And Instruction Separation

The report mixes per-meal inputs, nested component-like calculations, batch/overage logic, area presentation and printed checks. EveryBatch must keep these separate:

- Products owns Formula/BOM and versioned quantities.
- Production owns Method/Route, Work Instruction, demand, plan, batch, area task and execution.
- Planning rules own yield/batch/rounding evidence.
- QA owns check/result/review/hold evidence.
- Reports regenerate views and print output from canonical records.

The legacy source contains almost no full human method sequence, equipment, time or temperature evidence. Current approved data collection is required.

## EveryBatch Comparison

EveryBatch already has useful internal item/formula/UOM, Goods Inwards, lot/movement, Stock On Hand, traceability, plan/batch, Receiving QA/hold and Dispatch foundations. It still lacks provider-neutral order intake, store/date provenance, production demand freeze/deltas, commerce mapping exceptions, approved requirement expansion, Production Methods/Instructions, allocation/transfer/staging, real area tasks, Production QA execution and physical production actuals.

## Review Gate 0 Recommendation

The broad provisional sequence remains directionally sound, but it should explicitly separate production-calendar/store-routing architecture, strengthen commerce product/variant/bundle mapping before demand aggregation, promote Formula Import review patterns conditionally after ownership/current-data collection, and keep QA integration before task schema.

Hold-aware availability is an A blocker. Minimum pick/transfer/staging is A/E pending staff confirmation. Production task completion is A. Formal production consumption/output is B unless staff/safety evidence promotes it. See `REVIEW_GATE_0_FINDINGS_AND_ROADMAP_RECOMMENDATION.md`.

## Behaviour Preserved

No application code, route, navigation, auth, middleware, domain, schema, migration, RLS, permission, feature flag, package, database, deployment, source archive or evidence file changed. No raw evidence or generated application file was added. No Task 225 or later implementation was started.

## Checks

Task 224 passed lint, TypeScript, production build and `git diff --check` before commit; its final response records the detailed results.

## Unresolved Questions

- Which Clean raw UUID is CEA and which is CEW?
- What exact Zapiet filters and staff steps created this day?
- Which current formulas, methods, yields, checks and area rules are approved?
- Which printed copies go to which roles, and what is truly required?
- Are daily GitHub history and weekly summaries current retirement requirements?
- What minimum transfer/staging and actual-output flow is required before retirement?
- Which current source should seed a controlled reviewed import, if any?
