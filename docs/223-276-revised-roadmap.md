# Tasks 223-276 Revised Roadmap - Historical

> **Superseded historical roadmap.** Task 225 superseded this document on 4 August 2026; Task 242 later superseded fixed future numbering entirely. Use the [EveryBatch Rolling Roadmap](./EVERYBATCH_ROLLING_ROADMAP.md) for current order.

## Authority And Status

This was the active EveryBatch roadmap after Task 223 and before Task 225. Its remaining content is retained as historical planning context and must be read in that time-bound state.

At this historical checkpoint, Task 224 was the latest completed task and Tasks 225 onward were paused pending roadmap approval. Task 224 was later committed at `8b8e94a87f6e94fef78c05317f87cad4bb01caea`, and Task 225 superseded this sequence.

Task 223B's proposal and Task 224 annotations are preserved in `docs/PROPOSED_POST_223B_ROADMAP.md`. Review Gate 0 was the project stage represented here; Task 225 later closed it and established the official Tasks 225-348 sequence.

EveryBatch is the product brand. Clean Eats Hub is the Clean Eats tenant/workspace. Food Prod Hub and Food Operations Hub are internal repository or historical concept terminology only, not public product names.

Task boundaries from 248 onward are directionally approved and may be refined through an approved roadmap review. Task numbers and order must not change without Luke's approval.

## A. Completed Baseline

Tasks 201-222 are completed history:

| Range | Completed foundation |
| --- | --- |
| 201 | Phase 2 cross-module integration map |
| 202-204 | UOM conversion planning, schema foundation and first UI |
| 205-212 | Goods Inwards hardening, posting RPC, Stock On Hand, traceability and stock-adjustment planning |
| 213-217 | QA planning, navigation, schema, Receiving Checks and inventory hold/release |
| 218-221 | Logistics planning, navigation, dispatch/manifest schema and controlled workflow |
| 222 | **Carrier Configuration Foundation** |

Current migration truth at this checkpoint:

- migration 039: QA schema foundation - applied;
- migration 040: audit hardening recovery - applied;
- migration 041: QA hold/release inventory link - applied;
- migration 042: dispatch/manifest schema foundation - applied;
- migration 043: dispatch manifest workflow - applied;
- migration 044: Logistics configuration identity trigger fix - applied.

## B. Active Approved Working Sequence

| Task | Approved title | Foundation intent |
| --- | --- | --- |
| 223 | Roadmap and Project Context Realignment | Establish this roadmap, permanent task standards and consistent current context. |
| 223A | EveryBatch Master Handover and Living Knowledge System | **Completed.** Preserves historical architect evidence and establishes the permanent reconciled living knowledge system. |
| 223B | Phase 1 Production Replacement and Roadmap Reassessment | **Completed and committed.** Documents replacement scope, evidence gaps, parity/decommission criteria, Review Gate 0 and a provisional sequence without activating it. |
| 224 | Production Replacement Evidence Collection And Legacy Logic Audit | **Completed by the current changeset.** Audits both source archives and the matched production-day fixture; creates the evidence, parity, rule, transition and Review Gate 0 package without implementation. |
| 225 | Production Areas UI v1 | Add useful tenant-aware Production Area configuration from the existing foundation. |
| 226 | Production Tasks Schema Foundation | Add the reviewed task data model only after Production ownership and lifecycle rules are confirmed. |
| 227 | Production Tasks UI v1 | Add permission-aware operational task queues and actions against real task records. |
| 228 | Facility/iPad View v1 | **Decision-gated.** Architecture discussion and Luke's approval are mandatory before an implementation prompt is written. |
| 229 | QA Production Checks UI v1 | Add Production-linked QA checks without duplicating Production source records. |
| 230 | QA Daily Checks UI v1 | Add recurring facility/operational QA checks from QA-owned templates and records. |
| 231 | Tools Module Deep Planning and Workspace Review | Review Tools ownership, existing Supplier Invoice Intake and future utility workspaces. |
| 232 | Formula Import Plan | Define reviewed component and finished-product formula import behaviour. |
| 233 | Formula Import Schema and Parser Foundation | Add import batches, parser results and safe review foundations without automatic formula overwrite. |
| 234 | Formula Import UI v1 | Add review-first formula import UI against real Products/formula source records. |
| 235 | Item and Supplier Mapping QA Tool | Add a focused review tool for supplier/internal-item mappings. |
| 236 | CRM Module Lightweight Planning | Define the minimum useful customer/account scope without building a broad CRM suite. |
| 237 | CRM Navigation and Scaffold v1 | Add an honest CRM workspace structure with no fake customer records. |
| 238 | Customer and Account Schema Foundation | Add tenant-owned customer/account foundations after ownership review. |
| 239 | Customer and Account UI v1 | Add real read/create/edit workflows within approved CRM boundaries. |
| 240 | Delivery Issues Planning and Ownership Decision | Decide Logistics, CRM, Support and QA ownership before creating issue records. |
| 241 | Delivery Issues Schema and UI v1 | Add the reviewed tenant-owned issue foundation and first useful workflow. |
| 242 | Reports Module Deep Planning and Source Readiness Review | Define report ownership, source readiness, permissions and performance boundaries. |
| 243 | Reports Navigation and Real Availability Dashboard | Replace generic Reports placeholders with truthful source-availability states. |
| 244 | Inventory and Purchasing Reports v1 | Read real receipt, lot, movement, supplier and purchasing sources without owning them. |
| 245 | Costing and Margin Reports v1 | Read costing snapshots, prices and margin sources without recalculation side effects. |
| 246 | Production, QA and Logistics Reports v1 | Add reporting only where source workflows provide reliable real records. |
| 247 | Tenant Module Foundation Completion Review | Review every tenant module/workspace against the approved foundation-completion definition. |

### Review Gate 0 - Current Stage

Task 224 is complete. Luke and the architect must now review its evidence before any proposed Task 225 onward is activated. The former paused roadmap remains preserved for comparison; the provisional proposal does not become official through Task 224.

## Task 228 Decision Gate

Task 228 keeps the approved title `Facility/iPad View v1`, but it is not a straightforward page task. Before an implementation prompt exists, Luke must approve an architecture decision covering:

- responsive web workspace inside the tenant app;
- Progressive Web App;
- dedicated shared tablet host;
- tenant-specific tablet host or route;
- candidate domains such as `tablet.everybatchmrp.com` or `tablet.everybatchmrp.com.au`;
- compatibility with the current EveryBatch domain convention;
- tenant resolution after login;
- facility/area-scoped device sessions;
- native iOS application;
- native Android application;
- cross-platform wrapper;
- offline operation;
- device registration;
- kiosk mode;
- staff login versus shared floor device;
- security and Support implications;
- deployment and update burden.

Task 223 does not choose between these options.

## C. Directionally Approved Later Sequence

| Task | Directionally approved title |
| --- | --- |
| 248 | Cross-Module UI Consistency Plan |
| 249 | Canonical Workspace Routes and Redirects |
| 250 | App-Shell Loading and Action Pending States |
| 251 | Status, Feedback and Page Header Consistency |
| 252 | Responsive Tables, Forms and Related-Record Links |
| 253 | Module Dashboard Data and Design Plan |
| 254 | QA and Logistics Dashboard Real-Data Pass |
| 255 | Production and Tools Dashboard Real-Data Pass |
| 256 | Reports and CRM Dashboard Real-Data Pass |
| 257 | Products, Inventory and Costings Dashboard Alignment |
| 258 | Main Home Dashboard Plan |
| 259 | Main Home Dashboard v1 |
| 260 | Support and Help Centre Module Guide Pass |
| 261 | Documentation and Module Consistency Audit |
| 262 | Documentation Correction Pass |
| 263 | Platform Admin Full Review and SaaS Operations Plan |
| 264 | Platform Admin Tenant Health and Readiness v1 |
| 265 | Platform Admin Module, Permission and Feature Diagnostics |
| 266 | Platform Admin Onboarding and First-Admin Foundation |
| 267 | Platform Admin Tenant Lifecycle and Support Diagnostics |
| 268 | Marketing Website Architecture and Repository Plan |
| 269 | Marketing Brand, Content and Screenshot Readiness |
| 270 | Demo Lead Capture and Sales Pipeline Plan |
| 271 | Tenant Onboarding and Provisioning Workflow Plan |
| 272 | Commercial Lifecycle and Billing Readiness Plan |
| 273 | Audit Log Business Events Plan |
| 274 | Audit Log Business Events v1 |
| 275 | Phase 1 Hardening and Parked Backlog Review |
| 276 onward | Approved hardening tasks determined through Task 275 |

Final future milestone: **Phase 2 Roadmap Reset**.

## D. Future/Pending Task Register

Future ideas, defects and dependencies must enter this register before promotion. They do not automatically receive task numbers or reorder the roadmap. Critical candidates are reviewed at roadmap checkpoints and are promoted only after Luke approves.

| Title | Category | Source/date | Reason | Dependency | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Clean Eats preparation stage | Tenant validation | Task 223, 2026-08-02 | Covers Luke's full platform review, UI/workflow and terminology review, missing links/actions, Clean Eats walkthrough preparation, privacy-safe demo data, staff testing pack, feedback capture, bug bash, demo readiness and case-study/screenshot preparation. Timing must not block foundation work. | Luke selects meeting/review timing | High | Timing-dependent |
| Facility/tablet architecture decision | Architecture | Task 223 / Task 228 | Task 228 cannot be safely implemented until host, app form, session, device, offline, kiosk, security, support and deployment choices are approved. | Mandatory Task 228 decision discussion | Critical roadmap candidate | Blocked by dependency |
| Marketing website project | Marketing | Task 223, 2026-08-02 | Build the public `everybatchmrp.com` product site in a separate repository/deployment using Next.js, TypeScript, Tailwind, Vercel and the shared brand system. | Tasks 268-269 and screenshot readiness | High | Timing-dependent |
| Demo lead and commercial onboarding pipeline | Commercial | Task 223, 2026-08-02 | Plan lead capture, qualification, calendar/email, privacy/source tracking and controlled onboarding without automatic production-tenant provisioning. Billing follows evidence. | Tasks 270-272 | High | Pending review |
| Future screenshot/demo tenant work | Marketing/demo | Task 223, 2026-08-02 | Use real product screenshots with privacy-safe data; never present AI mockups as real EveryBatch product UI. | Stable module/dashboard states and Clean Eats review | Normal | Timing-dependent |
| Platform Admin full review supporting ideas | Platform Admin | Task 223 / Task 263 | Retain tenant health, readiness, modules/features, memberships, onboarding, first admin, branding, domains, Support, storage, diagnostics, provisioning, lifecycle and later billing-readiness ideas until the formal review starts. | Task 263 | High | Promoted to roadmap |
| Documentation consistency audit | Documentation | Task 223 / Task 261 | Report first, obtain approval before broad rewrites, then use Task 262 for corrections. | Task 261 | High | Promoted to roadmap |
| Leaked Password Protection live-setting verification | Security/documentation | Task 223, 2026-08-02 | Earlier project context records it as enabled after the Supabase upgrade, while older documents retain warning-era language. Do not call it disabled without live evidence. Verify during Task 261 or a security review and correct stale references. | Approved live-setting verification | Normal | Pending review |
| Phase 1 legacy production replacement and decommission | Production | Tasks 223A-224, 2026-08-03 | Replace the Shopify/Zapiet/CSV/aggregation/Production Report/printed-pack chain only after parity, real production-day comparison and staff approval. | Task 224 baseline complete; official sequence, additional exception/current-data evidence and staff gates remain | Critical roadmap candidate | Review Gate 0 |
| Facility/site architecture | Platform architecture | Tasks 223A-223B, 2026-08-03 | Future tenants may have multiple sites; operational scope cannot permanently assume organisation equals facility. | Dedicated architecture decision before facility-scoped schema | Critical roadmap candidate | Proposed early dependency; not approved |
| External order source, Shopify App and demand architecture | Integration/Production | Tasks 223A-223B, 2026-08-03 | Clean Eats Shopify/Zapiet is first evidence, but the connector and demand model must remain tenant-installable and provider-agnostic. | Dedicated source/demand architecture, then current-official-Shopify-doc security task | Critical roadmap candidate | Proposed early dependency; not approved |
| Formula, Production Method and Recipes ownership | Products/Production | Tasks 223A-223B, 2026-08-03 | Formula/BOM, method, work instruction and run/report are distinct; current Recipes route is an honest scaffold, not a separate source. | Dedicated Luke-approved ownership decision using legacy evidence | Critical roadmap candidate | Unresolved; decision task proposed |
| Production allocation, transfer, issue, consumption and output | Production/Inventory | Task 223A, 2026-08-02 | Planning must not falsely post physical movement; FEFO/FIFO, held stock and confirmed movement need explicit lifecycle. | Demand, facility, inventory and execution design | Critical roadmap candidate | Pending review |
| Yield, waste and variance | Production/Costings | Task 223A, 2026-08-02 | Separate theoretical, yield-adjusted, allocated, actual consumed/output and variance; history informs review, never silent rewrites. | Digital execution and costing evidence | High | Pending review |
| Product compliance, NC/CAPA/recall, equipment, supplier quality, competency and shelf life | Platform capability | Task 223A, 2026-08-02 | Required long-term Food Manufacturing OS depth without pretending it is operational today. | Source-module architecture and roadmap promotion | High | Future/Pending |
| Action Centre, timelines, saved views, notifications, governance and integration health | Cross-module | Task 223A, 2026-08-02 | Make exceptions visible work and provide controlled operational awareness. | Mature source workflows and notification/integration architecture | High | Future/Pending |

## E. Parked And Hardening Backlog

Tasks 248-252 are the coordinated handling point for the first group of UI consistency work. Nothing below is implemented by Task 223:

- short canonical QA/Logistics routes and nested redirects;
- visible route loading states and action pending states;
- parent-module dashboard behaviour;
- sidebar submenu auto-close and collapsed-sidebar icon consistency;
- page-header, status vocabulary and status-colour consistency;
- responsive cards, tables, forms and related-record links;
- permission-aware controls;
- tenant/client logo handling;
- tenant and Platform Admin mobile/tablet responsiveness;
- app-shell/navigation and dashboard query performance;
- Support attachment UI and storage policies;
- UOM integration into real calculations;
- stock adjustment/reversal continuation;
- production stock consumption and production output stock;
- recall-grade forward traceability;
- audit business events;
- reviewed Supabase `SECURITY DEFINER` Advisor warnings;
- external-tenant security hardening;
- marketing website, lead pipeline, tenant onboarding and billing readiness;
- legal, privacy and security content.

## Dashboard Direction

Concept mockups are directional north-star references, not exact specifications. Workspace foundations come first and must not use fake metrics. Module dashboards follow once their source workflows expose reliable real data; the main home dashboard follows those module dashboards. Dashboards read source modules and do not own operational records. Newly provisioned tenants need honest, uncluttered empty and readiness states.

Tasks 253-259 own this dashboard workstream.

## Platform Admin And Commercial Direction

Tasks 263-267 cover Platform Admin review and operational maturity: tenant health, readiness, modules/features, users/memberships, onboarding, first admin, branding, domains, Support, storage, diagnostics, provisioning and tenant lifecycle. Billing readiness remains later and evidence-led.

Tasks 268-272 cover the separate marketing/commercial workstream. The public site remains a separate repository and deployment, uses real screenshots and controlled claims, may tell the Clean Eats origin story, and uses a demo or Talk to Sales flow. It must not provision an active production tenant automatically. Pricing remains Talk to Sales until commercial evidence supports a different model.

## Review Rules

- Record new ideas in the Future/Pending Task Register rather than losing them in chat history.
- Do not renumber, promote or reorder work without Luke's approval.
- Build the safest useful foundation, then refine it through real Clean Eats usage.
- Foundation completion requires at least one of: real read-only data, real create/edit behaviour, useful configuration, an operational queue, or an honest empty state explaining ownership, source workflow, reason for emptiness, next valid action and disconnected functionality.
- Foundation work must be safe, tenant-aware, permission-aware, coherent, demonstrable and honest about limitations.
- A foundation does not need every enterprise edge case before Clean Eats staff validate it.
