# Legacy Production Data Transition Assessment

## Decision

Do not import legacy Production Report constants directly. The source is valuable as behavioural evidence and parity input, but it mixes formula quantities, batch rules, room presentation, check prompts and suspected stale values without controlled provenance or approval history.

A controlled future import workstream is likely useful once current Clean Eats formula/method/instruction data is collected and approved. Its input must be the approved current dataset, not the Python dictionaries by default.

## Category Assessment

| Category | Task 224 classification | Transition direction |
| --- | --- | --- |
| Shopify store identities and connections | Requires new architecture | Create provider-neutral connection/store identity; support external Made Active authorisation into Clean Eats manufacturing. |
| Source order and line references | Missing from evidence | Future intake must retain provider order/line IDs and immutable raw evidence. Cannot backfill from these CSVs. |
| Delivery and production dates | Requires new architecture and staff configuration | Effective-dated calendar/routing rules; preserve decision/version evidence. Do not encode weekday examples globally. |
| Finished-product aliases and variant mappings | Requires mapping/review | Use source product/variant IDs plus reviewed aliases. Current title maps are candidate evidence only. |
| Bundle rules | Requires new architecture and store-specific fixtures | Parse/classify raw parent/child lines per connection; never depend only on parent title exclusion. |
| Subscription metadata | Could not be verified | Preserve raw properties and add fixtures before implementing special handling. |
| Exclusion rules | Requires mapping/review | Explicit production-contribution classification with reason and exception queue. |
| Internal items and formula versions | Already represented but incomplete | Products is canonical. Populate only from approved current data using manual entry or controlled import. |
| Component formulas | Represented but incomplete | Existing versioned formula model is reusable; validate nested expansion, cycles and output/yield semantics. |
| Formula quantities and output quantities | Requires current Clean Eats data collection | Legacy dictionaries are evidence only. Approved workbook/template/import review required. |
| UOM rules | Represented but incomplete | Reuse reviewed UOM conversions; never infer unsafe conversions from PDF labels. |
| Expected yields, loss and water additions | Requires current data and planning architecture | Separate formula, expected yield and planning adjustment. Legacy constants need staff validation. |
| Batch size, minimum, overage and rounding | Requires staff validation | Versioned planning rules and golden tests; do not hide them inside presentation code. |
| Production method/route | Missing concept | Add versioned Production-owned methods after ownership decision. Legacy source rarely describes sequence. |
| Work Instructions | Missing concept | Collect approved human-facing steps, safety, equipment, time, temperature and help content. Source calculations are not instructions. |
| Production-area routing | Schema exists; configuration/workflow incomplete | Validate Clean Eats areas and route generated tasks by facility/area. Current copy counts are not routing master data. |
| Equipment and temperatures | Could not be verified | Current staff/QA collection required. |
| QA prompts/checks | QA foundation exists; Production checks missing | Convert only approved required checks into linked QA templates/results. Printed totals are not result evidence. |
| Packaging | Formula/item foundations exist; legacy evidence incomplete | Collect approved packaging BOM and area instructions. |
| Report layout and copy distribution | Presentation-only; regenerate | Build Production Admin, area digital tasks and controlled fallback packs from canonical data. |
| Use-by offsets | Requires QA/Luke decision | Move to approved shelf-life/product configuration; version historical calculation evidence. |
| `Already Made` | Requires architecture decision | Replace with authorised demand adjustment, frozen-demand delta or actual completion evidence as appropriate. |
| Historical GitHub reports/weekly summaries | Legacy behavioural evidence | Decide retention/import separately; do not treat files as canonical order/execution history. |
| Inactive duplicate Python modules | Obsolete/suspect | Do not migrate. Use only to identify contradictions needing staff resolution. |

## Controlled Import Recommendation

The official roadmap places review-first production-data transition in Tasks 238-243, after demand validation and Formula/Method/Instruction ownership decisions. Its approved stages are:

1. Approved current-data inventory and import contract.
2. Staging/parser with source file/row fingerprints.
3. Product/UOM/mapping validation and duplicate/cycle checks.
4. Human review of formulas, methods, instructions, yields and area routing as separate record classes.
5. Controlled apply into versioned canonical sources.
6. Reconciliation against approved fixtures and staff sign-off.

The Item/Supplier Mapping QA design may supply generic review UI patterns, but supplier mapping itself is not the blocker. A dedicated commerce product/variant/bundle mapping workflow is required earlier because current production accuracy depends on it.

## Manual Entry Versus Import

Manual entry remains suitable for a small, well-owned set of current records. The source shows at least 26 finished meals, nested component requirements, multiple area calculations and many special rules; this volume and ambiguity make a reviewable import/staging path likely safer than ad hoc transcription. Review Gate 0 approved the transition sequence, but Tasks 238-243 must still use Luke-supplied approved current formula/method/instruction sources and confirmed ownership.

## Prohibited Transition

- No automatic migration of Python constants.
- No formula creation from PDF totals.
- No silent alias adoption.
- No conversion of copy counts into area routing without staff validation.
- No use of historical Elite mappings as an active connection requirement.
- No merging of Formula/BOM, Method, Work Instruction, QA result and report presentation into one record type.
