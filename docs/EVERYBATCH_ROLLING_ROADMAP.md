# EveryBatch Rolling Roadmap

## Purpose

This is the authoritative current task-order document for EveryBatch. It replaces fixed long-range numbering with a rolling horizon that can respond to operational evidence, security findings, cross-module consequences and stakeholder Reviews without losing useful future planning.

## Current Completed Baseline

The completed baseline through Task 242 remains historical truth. Task 241 is committed at `8dfc644657c92789dea9831e3f9e51181388cfbb` (`Build production import staging foundation`). Task 242 is committed at `9fa6ffc017509559976832ff823392ff13574673` (`Establish rolling roadmap governance`). Migration 056 is live and registered once as `20260807152024 production_data_staging_parser_foundation`. Its trusted parser persistence functions remain intentionally dormant and ungranted.

## Rolling Task Horizon

- Only approximately the next ten tasks receive authoritative task numbers.
- The first active horizon is Tasks 242-250, explicitly approved by Luke.
- Work beyond the active horizon lives in `EVERYBATCH_CANDIDATE_BACKLOG.md` without authoritative numbers.
- Candidates may be promoted, split, merged, reordered, deferred, replaced or removed when evidence changes.
- Historical task numbers beyond the completed baseline are planning references only.
- Luke approves numbered-task additions, resequencing, significant scope changes, live actions and architecture changes.

## Architect Intervention

The Product Architect must proactively raise architecture conflicts, security weaknesses, sequencing problems, source-of-truth conflicts, workflow assumptions, UX problems, permission gaps, scaling concerns, operational mismatches, unnecessary complexity and missing foundations. The architect must not mechanically generate the next prompt when current evidence suggests a worse or less safe product. Concerns are explained and recommendations made before Luke approves any roadmap change.

## Multi-Surface Product Rule

EveryBatch has four governed product surfaces: Tenant App, Platform Admin, Support / Help Centre and Public / Marketing. Every future numbered task and relevant lettered subtask must explicitly assess all four. `No impact` is valid; silence is not. The Tenant App remains the operational surface, Platform Admin the denser SaaS control plane, Support the authenticated knowledge/troubleshooting surface and Public / Marketing the grounded external product narrative. Shared design language may connect them, but their information architecture, authority and data exposure remain purpose-specific.

## Every-Task Horizon Assessment

Every numbered task must return a `ROADMAP / HORIZON IMPACT` assessment selecting one or more of:

- **A.** Remaining horizon unchanged.
- **B.** Remaining tasks need scope clarification.
- **C.** A critical security, integrity or architecture subtask should be inserted.
- **D.** The remaining horizon needs early replan.
- **E.** Candidate backlog items should be added, changed or removed.

Each task must inspect unresolved Review findings and candidate-backlog implications relevant to its scope. Material changes still require Luke's approval.

## Review System

Reviews are separately numbered stakeholder/evidence checkpoints recorded in `REVIEW_REGISTER.md`. They can occur between any tasks, do not consume task numbers and do not automatically stop development. A Review may confirm the roadmap or lead to acceptance changes, backlog additions, a lettered subtask, architecture correction or early horizon replan.

## Gate System

A Review gathers evidence. A Gate is an explicit capability, readiness or safety condition before dependent work proceeds. Gates are expressed by capability, not obsolete candidate task numbers.

- **Review Gate 0:** historical closure approving the production-replacement programme.
- **Architecture Gate 1:** approved facility, commerce, demand, Shopify and delivery/calendar architecture foundation.
- **Demand Gate 2:** satisfied for current sequencing after accepted Production Demand review/freeze foundations.
- **Materials Gate:** occurs after an approved location-aware material preparation workflow is implemented and validated.
- **Production Replacement Readiness Gate:** occurs after end-to-end execution, actuals, parity, staff validation and decommission evidence exist. Luke separately authorises retirement of each legacy tool.

## Urgent Lettered Subtasks

A critical security, integrity, runtime or architecture correction may be inserted inside an active horizon using a lettered identifier such as `245A`. It requires Luke's approval, must record why insertion was necessary and triggers reassessment of the remaining horizon. Routine work must not be fragmented this way. Normal sequential numbering resumes at the next horizon reset.

## Current Concrete Horizon

### Task 242 - Rolling Roadmap Governance, Review Framework and Task 241 Truth Reconciliation

**Complete and committed** at `9fa6ffc017509559976832ff823392ff13574673` (`Establish rolling roadmap governance`). Documentation/governance only. Establishes this rolling model, the Review system, architect-intervention expectation, active horizon, candidate backlog and Review 1; reconciles Task 241 committed/live truth and supersedes the old fixed future sequence. No migration.

### Task 243 - EveryBatch Information Architecture and UX System Deep Plan

**Documentation/planning complete and uncommitted.** Defines EveryBatch as one Food Manufacturing OS before broad UI work: shell hierarchy, global header, sidebar, breadcrumbs, search, dashboard and landing-page patterns, lists, entity detail, create/edit, history, related records, action placement, readiness language, layout system, empty/loading/error states, permission-aware presentation, responsive behavior, cross-module links and source-of-truth presentation. Defines operational Tenant App, denser Platform Admin, knowledge-first Support and purpose-distinct Public variants. No migration. Task 244 remains blocked until review and commit. Suggested commit: `Define EveryBatch information architecture`.

### Task 244 - EveryBatch Meeting-Readiness UI System and Module Landing Page Overhaul v1

Implement Task 243's approved system across the Tenant App shell, Dashboard and major module/workspace homes, including consistent headers, context, responsive cards/grids, truthful metrics, zero states, readiness and actions. Include proportionate visual/system alignment for Platform Admin and Support without cloning the Tenant App or rebuilding either surface; preserve public-brand compatibility. Assess Dashboard, Inventory, Products, Costings, Production, QA, Logistics, CRM, Reports, Tools and Admin. Do not invent operational values or unrelated domain behavior. No migration expected. Review 1 value: very high.

### Task 245 - Entity Detail, Cross-Module Navigation and History UX v1

Establish reusable Tenant App entity hubs using real current data: identity/status, related records, operational context, source/provenance, actions and History. Define how safe readiness/diagnostic summaries, contextual help links and grounded product language relate to those entities across Platform Admin, Support and Public / Marketing without exposing tenant content or duplicating ownership. Representative current entities may include Supplier, Ingredient, Packaging, Component, Finished Product and Formula output. Backend ownership remains unchanged; unavailable history is shown honestly. Stop for approval if an unavoidable schema requirement appears. Review 1 value: very high.

### Task 246 - Clean Eats Production Knowledge Collection Pack Prototype v1

Translate Task 240's machine field dictionary into human-friendly prototype templates for Ready Meals, Components/batches, Methods/processes, materials/items, areas/equipment/applicability, QA requirements and questions/evidence. Templates keep nested knowledge separate, avoid invented Clean Eats values and remain prototypes for Review 1. The machine taxonomy remains authoritative underneath. No migration. Review 1 value: very high.

### Task 247 - Trusted Production Import Runner and Flexible Collection Intake Architecture

Plan the trusted runtime boundary needed to persist official Task 241 parser output. Decide invocation, source-byte verification, ACL/trust model, retries, idempotency, jobs, errors, observability, accepted formats and multi-file packages using Task 241, Task 246 and Review 1 evidence when available. Do not weaken the no-service-role tenant-runtime rule. Planning first; migration need is determined only by approved architecture.

### Task 248 - Formula Model, Quantity Basis and Lifecycle Hardening

Plan and review Formula quantity bases and lifecycle before schema work. Assess mixed fixed quantity, percentage of target output, ratio and per-unit lines; target finished weight; nominal output; draft/review/publish; immutable approved versions; history; nested version pinning; indirect cycles; UOM; expected yield and reproducibility. Formula remains the preferred single composition truth, but percentage/ratio behavior is a hypothesis requiring Review 1 validation. No schema implementation without approval.

### Task 249 - Granular Roles, Permissions and Operational Scope Architecture

Plan a consistent `Module -> Workspace -> Action -> Operational Scope` model. Roles become friendly permission bundles; runtime security uses permissions rather than role-name checks where appropriate. Assess view/create/edit/execute/review/approve/publish/close/export/configure and future facility/Production Area scope. UI hiding is presentation only; RLS/RPC remains authoritative. Avoid speculative permission proliferation. No migration unless separately approved.

### Task 250 - Production Areas and Operational Responsibility Foundation v1

Assess current Production Area schema and implement only approved real configuration capability for facility ownership, identity, status, responsibility, capability, room terminology and relevance to Methods, QA, Inventory and future tablets. Do not seed fake areas or derive configuration silently from imported text. Review 1 validates Clean Eats structure. Migration only if current schema proves insufficient and Luke approves it.

## Review 1 Overlay

Review 1, the First Major Staff Review, is scheduled for Wednesday 12 August 2026 at a time still to be confirmed. High-value preparation includes clear information architecture, a materially improved visual system, understandable module relationships, coherent module/workspace homes, visible entity/history concepts, a collection-pack prototype and a clear built-versus-planned distinction. These are priorities, not stop conditions; development continues through the active horizon.

## Candidate Backlog Relationship

`EVERYBATCH_CANDIDATE_BACKLOG.md` preserves likely future capabilities and dependencies without promising order or task numbers. Candidate entries are not approved implementation tasks. Deep planning occurs only when an item is promoted into an approved horizon.

## Horizon Reassessment

During the horizon, every task assesses completed evidence, relevant Review findings, security/runtime discoveries, cross-module consequences and Candidate Backlog implications. Reassess early when a task's horizon-impact result is C or D; do not wait for Task 250 when continuing would preserve a known unsafe or incorrect plan.

## End-Of-Horizon Promotion Process

At horizon end, review the complete horizon evidence and Candidate Backlog, merge/split/remove or clarify candidates as needed, deeply plan approximately the next ten tasks, and seek Luke's approval. Assign concrete task numbers only after that approval; unpromoted candidates remain unnumbered.

## Historical Roadmap Relationship

`225-348-official-roadmap.md` preserves the Task 225 plan and completed-task chronology. Its former future sequence is superseded and no longer controls task order or gate timing. Earlier roadmaps remain historical evidence.

## Change Control

The Product Architect recommends evidence-led changes but does not silently change this roadmap. Luke must approve material changes. Once approved, update this roadmap, Current Handover, Task Index, Decision Log, Review Register or candidate backlog as materially required.
