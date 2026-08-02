# Production Replacement Evidence Pack

## Purpose And Privacy

This is the minimum practical collection request needed to inspect current logic, plan implementation and later prove parity. Redact customer names, addresses, email, phone, payment data, access tokens and secrets. Keep stable synthetic IDs only where needed to connect rows across files. Evidence can block implementation/parity without blocking high-level planning.

## A. Tool Source And Deployment Evidence

| Request | Why / decision supported | Blocking level | Privacy-safe preparation |
| --- | --- | --- | --- |
| Repository or exact local path for each aggregation/report tool | Identify actual transformations, dependencies and maintainers | Blocks implementation/parity | Exclude secrets and deployment tokens |
| Current deployment name/URL and owner | Match source to the production-used deployment | Blocks retirement approval | URL/owner only; no credentials |
| Runtime, framework and configuration notes | Plan extraction, testing and archival | Blocks implementation detail | Replace secrets with variable names |
| Current release/deploy procedure | Define fallback and support during parallel run | Blocks retirement | Document steps without tokens |

## B. Shopify Source Evidence

| Request | Why / decision supported | Blocking level | Privacy-safe preparation |
| --- | --- | --- | --- |
| One representative Shopify order export | Establish columns, IDs, quantities and source semantics | Blocks intake/mapping implementation | Replace customer data; preserve columns and stable fake IDs |
| Relevant column dictionary | Prevent accidental field assumptions | Blocks schema detail | No personal data required |
| Zapiet tag/attribute examples and date formats | Define configurable delivery-date interpretation | Blocks Clean Eats connector | Use synthetic order/customer identity |
| Edited and cancelled order examples | Design sync/delta lifecycle | Blocks safe freeze/delta behaviour | Keep before/after states with redacted identity |
| Bundle/multipack examples | Determine expansion and mapping rules | Blocks parity if used | Product titles/SKUs may be pseudonymised consistently |
| Non-production, gift card, discount and free-item cases | Prevent false manufacturing demand | Blocks parity if used | Remove customer details |

## C. Aggregation Evidence

| Request | Why / decision supported | Blocking level | Privacy-safe preparation |
| --- | --- | --- | --- |
| Source Shopify CSV and its resulting aggregated CSV | Derive testable input/output pairs | Blocks parity | Consistently pseudonymise IDs/SKUs |
| Mapping between source rows and aggregate rows | Explain bundle/product transformation | Blocks mapping engine | No customer identity needed |
| Written aggregation and exclusion rules | Distinguish intentional logic from code accident | Blocks parity | Business rules only |
| Manual corrections Tony performs | Expose exception workflow EveryBatch must support | Blocks staff-safe replacement | Describe case, reason and corrected result |

## D. Production Report Evidence

| Request | Why / decision supported | Blocking level | Privacy-safe preparation |
| --- | --- | --- | --- |
| Aggregated CSV uploaded to the report tool | Define report input contract | Blocks parity | Use matched redacted production day |
| Current source/configuration CSV | Classify formula, method, yield, rounding, area and layout rules | Blocks implementation/parity | Preserve operational values; remove secrets only |
| Generated approximately 24-page PDF | Inventory sections, calculations and instructions | Blocks decommission scope | Redact customer/order personal data |
| Section definition and room distribution list | Design area tasks/views and fallback packs | Blocks area acceptance | Area/role names are sufficient |
| Print count and outage/fallback procedure | Define resilience requirement | Blocks retirement | No personal data |
| Known shortages/errors and workarounds | Design exceptions and comparison tests | Blocks safe replacement | Use dates/items without customer data |

## E. Formula And Method Evidence

| Request | Why / decision supported | Blocking level | Privacy-safe preparation |
| --- | --- | --- | --- |
| Finished-product and component formulas | Establish composition/version parity | Blocks requirement calculation | Product/process data only |
| Expected yields and water additions | Separate theoretical from yield-adjusted requirements | Blocks yield semantics | No personal data |
| Production methods and sequence | Define Production-owned method records | Blocks task/instruction parity | Remove staff names; retain role/area |
| Batch-size and rounding rules | Reproduce safe required quantities | Blocks calculation parity | Representative values only |
| Room/area assignments | Generate area-specific work | Blocks floor replacement | Area names, not employee identity |
| Equipment, time and temperatures | Define method and QA boundaries | Blocks affected instruction/check parity | Process evidence only |
| Packaging and special instructions | Cover Prepack/Packing tasks | Blocks affected room parity | Product/process data only |

## F. Inventory Evidence

| Request | Why / decision supported | Blocking level | Privacy-safe preparation |
| --- | --- | --- | --- |
| Warehouse/store/location process | Define facility/location availability and responsibility | Blocks Inventory A/B decision | Item/location examples only |
| FIFO/FEFO and lot/expiry practice | Define recommendation and override rules | Blocks safe lot workflow if promoted to A | Synthetic lot numbers allowed |
| Held-stock scenarios | Confirm availability exclusion and escalation | Blocks shortage accuracy | Remove QA actor names/notes not needed |
| Staging and transfer confirmation | Separate planned from physical movement | Blocks transfer implementation | Quantities/locations only |
| Actual consumption/output capture | Decide day-one decommission boundary | Blocks A/B classification | Batch/item examples only |
| Shortage, substitution and reversal cases | Define exceptions and correction safety | Blocks safe physical execution | Redact supplier/staff identity |

## G. Staff Validation

| Participant | Validate | Decision supported |
| --- | --- | --- |
| Tony / Production Admin | Date selection, totals, report logic, exceptions, control view | Overall parity and retirement gate |
| Warehouse/store | Availability, lots, picks, transfers, staging and shortages | Inventory A/B classification |
| QA | Production checks, holds, release and evidence | QA integration boundary |
| Kitchen | Methods, sequence, quantities, equipment, QA and completion | Area task parity |
| Prepack | Portions, source components, quantities, rejects | Area task parity |
| Packing | Packaging, labels, finished quantities and shortages | Finished-output readiness |
| Other areas found in report | Their sections/actions and dependencies | Full area coverage |

Use a real production-day walkthrough with privacy-safe records and compare what staff read, decide, change and record. Staff validation is required for decommission, but collecting personal information is not.

## Suggested Evidence Bundles

1. **Happy path day:** source export, aggregate output, report input/config, PDF and final known production outcome.
2. **Change day:** edited/cancelled order before and after freeze plus staff correction.
3. **Exception day:** bundle/non-production line, shortage, held lot or schedule exception.
4. **Room pack:** annotated page-to-area map with each field marked required, useful or obsolete.

The evidence should be versioned and read-only during analysis. It must not be imported into production systems by Task 223B.
