# Review Gate 0 Findings And Roadmap Recommendation

> **Reviewed and approved through Task 225 on 4 August 2026.** This file preserves the Task 224 recommendation package. The final approved sequence and numbering are authoritative in [EveryBatch Official Roadmap - Tasks 225-348](./225-348-official-roadmap.md).

> **Later decision:** Task 239 resolves the recommendation in item 23. Recipe is a presentation of approved Formula + compatible Production Method + linked Work Instructions, not a third canonical record. The original recommendation chronology below remains preserved.

## Gate Decision

The evidence is sufficient to plan the next architecture and evidence work safely, and to define a golden matched-day normalisation/report fixture. It is not sufficient to implement approved production formulas/methods, automate the production calendar, retire a legacy tool or finalise the complete roadmap without Luke and Clean Eats staff decisions.

## Required Questions

1. **Enough evidence to plan implementation?** Yes for facility, source/order/demand, calendar, mapping/exception and parity architecture. No for approved formula/method/instruction content or decommission.
2. **Raw-file stores?** The 76 UUID file is Made Active with high confidence. The e302 and ea142 files are the two Clean Eats stores, but exact CEA/CEW assignment is unresolved because no store/order prefix remains.
3. **Raw-export provenance lost?** Store, order/line, delivery/production date, region/zone, courier/service, lifecycle, SKU and commercial state.
4. **Cleaned-summary provenance lost?** Raw product/variant IDs, properties, source lines and CEA/CEW split; only product title and aggregate quantity remain.
5. **Previously unknown stages?** The Production Report persists daily PDF/paired CSV history through GitHub, provides deletion, and generates weekly summary PDFs. The archive also contains inactive duplicate calculation modules.
6. **Confirmed bundle/subscription rules?** Two bundle metadata families and parent/child rows are confirmed. Cleanup does not parse metadata; correctness comes from child rows plus exact-title exclusion. No subscription-specific rule is confirmed.
7. **Calendar encoded versus staff knowledge?** Only manual production-date selection is encoded. Regional/date inclusion, cutoff, holiday, courier and wholesale/residential rules are not retained and remain staff/configuration evidence.
8. **Confirmed report rules?** Fixed 26 meals, brand upload slots, manual adjustments, bulk overrides, hard-coded expansion tables, upward rounding, copy counts, use-by offsets, GitHub history and weekly summaries.
9. **Obsolete/dangerous rules?** Silent exact-title drops, unlinked manual adjustment, inconsistent active comments/calculations, duplicate Moroccan rows, fixed chicken multipliers, zero-demand batch artefacts and unused conflicting modules.
10. **Staff validation required?** All formula quantities, yields, batch sizes, rounding/overage, water, use-by, area ownership, copy distribution, prepared toggles, cooked checks and current instructions.
11. **Values that must not migrate?** All legacy formulas, setup constants, mappings, copy counts, shelf-life offsets, static HACCP identities and room rules unless independently approved.
12. **Controlled import workstream?** Likely yes for approved current formula/method/instruction data, but only after ownership and source collection. Legacy code is not the import source by default.
13. **Formula Import earlier?** Yes, promote its review/staging patterns immediately after formula/method/instruction ownership if approved current data volume confirms the need.
14. **Item/Supplier Mapping QA earlier?** Reuse its review patterns, but supplier mapping itself is not a production replacement blocker and need not move wholesale.
15. **Dedicated commerce mapping earlier?** Yes. Product/variant/bundle/exclusion mapping and exception review must precede trusted demand aggregation.
16. **Facility architecture before demand schema?** Yes. The matched flow combines stores/brands into one manufacturer, and future tenants may route stores to facilities.
17. **Provider-neutral intake still correct?** Yes. Shopify is first, but the domain must preserve generic connections/source IDs/events.
18. **Installable Shopify App still correct?** Yes for the first connector direction, subject to a later current-official-Shopify-doc architecture/security task.
19. **Inventory retirement blockers?** Hold-aware availability, shortages and enough pick/transfer/staging guidance to replace warehouse/prep pages. Exact minimum physical workflow needs staff validation.
20. **Transfer/staging before printed-pack retirement?** Probably yes for the room packs that currently communicate material preparation. Classify A/E until warehouse and area staff confirm.
21. **Consumption/output before initial retirement?** The legacy report itself does not record stock consumption/output, so strict calculation parity does not prove it an initial A blocker. Digital task completion is A; controlled consumption/output and finished-stock linkage remain B unless staff/safety review promotes them.
22. **Production QA earlier?** QA integration planning must precede the task schema. Required Production Checks must be operational before the relevant paper checks retire. Daily QA can remain later.
23. **`/recipes`?** Keep the honest scaffold until ownership is approved. Likely split into Products Formula/BOM and Production Method/Work Instruction surfaces rather than create a third canonical recipe record.
24. **New-staff model?** Versioned methods and Work Instructions linked to area tasks, with concise task guidance and an accessible full approved instruction control; execution and QA evidence remain separate.
25. **Proposed Tasks 225-257?** Retain the broad sequence, split production-calendar/store-routing from generic demand architecture, strengthen mapping/exception work before aggregation, make import conditional earlier, and keep QA planning before task schema. No number is activated here.
26. **Preserved work to move earlier?** Formula Import review/staging patterns and targeted UI/loading/responsive quality within each operational workflow. A dedicated commerce mapping workflow moves earlier. Broad CRM/Reports/marketing/Platform work remains later.
27. **Full-roadmap decisions?** Approve revised ordering; decide calendar task boundary; approve facility scope; confirm import path; classify minimum warehouse movement and actuals; resolve Recipes ownership; identify staff owners; decide weekly/history parity and retirement gates.

## Phase 1 Reclassification Recommendation

| Class | Evidence-based recommendation |
| --- | --- |
| A - decommission blockers | Raw source/order/line retention; connection/store/brand attribution; delivery/production-date evidence; mapping/bundle/exclusion exceptions; reviewed/frozen demand and deltas; approved formula/component expansion; traceable rounding/yield semantics; Production Admin; area tasks/instructions; required Production QA; controlled fallback output; parity/parallel run; staff and Luke approval. Hold-aware availability/shortage remains A. Minimum transfer/staging is A/E pending staff confirmation. |
| B - safe shortly after replacement | Deeper reservation/allocation; controlled production issue/consumption; output lots/movements; finished-stock/dispatch linkage; advanced reversal and deeper traceability. Promote any item to A only with staff/safety evidence. |
| C - valuable improvement | Historical yield/waste analytics, advanced optimisation, richer weekly/reporting UX and non-blocking dashboard refinements. |
| D - later expansion | Zapiet replacement, checkout calendar, broader courier/customer/commercial/CRM capabilities, multi-facility optimisation beyond approved foundation. |
| E - evidence required | Exact CEA/CEW file identity; schedule/cutoff/holiday/courier rules; subscription behaviour; current formulas/methods/instructions/yields; room owners; check requirements; copy distribution; weekly history reliance; minimum movement/actuals gate. |

## Evidence-Based Sequence Recommendation

1. Review Gate 0 decisions and official roadmap update.
2. Facility/site architecture decision.
3. Provider-neutral commerce/order/demand architecture, with a distinct effective-dated production-calendar/store-routing decision.
4. Current-official-Shopify-doc connector/security plan.
5. Facility and commerce/source schema foundations.
6. Shopify intake plus source-line preservation, then dedicated product/variant/bundle/exclusion mapping review.
7. Demand snapshot/review/freeze/delta foundation and UI.
8. Formula/Method/Instruction/Recipes ownership; collect approved current data; activate controlled import workstream only if approved.
9. Expansion/yield/rounding engine and golden fixtures.
10. Hold-aware availability, shortages and approved minimum pick/transfer/staging.
11. Real Production Areas; Production QA integration plan; task/execution schema.
12. Production Admin and area execution under the approved device architecture.
13. Required Production QA and controlled print fallback.
14. Consumption/output/variance depth according to the A/B decision.
15. Parallel run and tool-by-tool readiness gate.

## Proposed Task Changes

- **Remain:** facility decision; source/demand architecture; Shopify plan; facility/source/demand foundations; expansion; availability; Production Admin; device decision; area execution; fallback; parallel run; readiness gate.
- **Split/strengthen:** production calendar/store-to-facility routing from general demand architecture; commerce mapping into product, variant, bundle, exclusion and exception review; report history/weekly parity from daily report replacement where staff says it matters.
- **Move earlier conditionally:** Formula Import staging/review after ownership and approved source collection.
- **Reuse, not promote wholesale:** Item/Supplier Mapping QA interaction patterns.
- **Keep QA early:** integration plan before task schema; operational required checks before paper retirement.
- **Keep B unless promoted:** production consumption/output, deep reservation and finished-stock linkage.
- **Delay:** Zapiet replacement, checkout calendar, broader CRM/Reports/marketing/commercial work until production replacement source chain is stable.

## Decisions Requiring Luke

- Approve the official post-224 roadmap and numbering.
- Confirm exact CEA/CEW file identity if external knowledge is available.
- Approve facility and external-manufacturer relationship boundaries.
- Approve formula/method/instruction ownership and `/recipes` disposition.
- Decide controlled import versus manual entry after current data is supplied.
- Decide whether report history/weekly summaries are retirement blockers.
- Approve final tool-by-tool retirement only after parallel-run evidence.

## Decisions Requiring Clean Eats Staff

- Delivery-calendar, cutoff, holiday, courier/service and exception rules.
- Current formulas, components, yields, water, batch sizes, minimums, rounding and overage.
- Current production methods, Work Instructions, equipment, time, temperature and QA requirements.
- Area ownership, task sequence, pack recipients and required printable fallback.
- Minimum warehouse pick/transfer/staging and whether production consumption/output must precede retirement.

## Gate Outcome

Task 224 was accepted as the evidence baseline and Review Gate 0 was closed by Luke's Task 225 approval. The recommendation itself retired no tool and created no migration. Tasks 226-230 have since completed the facility, commerce/manufacturing-relationship, order-intake/demand, Shopify-app and delivery/calendar architecture decisions; Architecture Gate 1 review is current.
