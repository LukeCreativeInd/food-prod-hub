# Task 223 - Roadmap And Project Context Realignment

> **Historical roadmap-control task:** Task 225 superseded this task on 4 August 2026, and Task 242 later superseded the fixed Task 225 future sequence. Current authority is the [EveryBatch Rolling Roadmap](./EVERYBATCH_ROLLING_ROADMAP.md); the decisions below describe the Task 223 checkpoint.

## Why The Roadmap Paused

EveryBatch reached a point where the repository's old post-Task-222 roadmap no longer matched completed work or the approved foundation-first direction. Logistics and Carrier Configuration had advanced beyond placeholder planning, migration 044 had been applied, and Task 222 had become Carrier Configuration Foundation rather than Reports planning. Continuing from the stale sequence would have created conflicting task identities and encouraged work in the wrong order.

Task 223 is therefore a documentation-only control point. It aligns current project truth, replaces the active roadmap, establishes permanent execution standards and keeps future ideas visible without silently renumbering approved work. It does not implement Task 224 or any later task.

## Task 223A/223B Insertion

At this historical checkpoint, Task 223A inserted the permanent EveryBatch handover/living knowledge system and Task 223B was next. Tasks 224-276 were preserved and paused. Task 225 later superseded that sequence with the official Tasks 225-348 roadmap.

## Approved Build Philosophy

Complete coherent module and workspace foundations before broad dashboard polish or commercial expansion. A foundation must be safe, tenant-aware, permission-aware, demonstrable and honest about limitations. It may provide real read data, real create/edit behaviour, useful configuration, an operational queue, or a deliberately useful empty state. It does not need every enterprise edge case before Clean Eats staff validate it.

Concept mockups are directional references rather than exact specifications. No dashboard should invent metrics. Operational source modules own records; dashboards and Reports read those sources.

## Terminology

- **EveryBatch** is the product brand.
- **Clean Eats Hub** is the Clean Eats tenant/workspace.
- **Module** means a major area such as Products, Inventory, Production, QA, Logistics, Reports or Tools.
- **Workspace** means an operational area inside a module, such as Goods Inwards, Receiving Checks, Manifests or Formula Import. Internal planning may also call this a submodule.
- **Page** means a specific route, list, form, detail or record screen.
- Food Prod Hub and Food Operations Hub remain internal repository or historical terms only.

Current domains are:

- `everybatchmrp.com` - future marketing website;
- `app.everybatchmrp.com` - central app and workspace selector;
- `admin.everybatchmrp.com` - Platform Admin;
- `cleaneats.everybatchmrp.com` - Clean Eats tenant;
- `support.everybatchmrp.com` - Support and Help Centre.

`admin.everybatchmrp.com.au` is not an EveryBatch domain and must not be used.

## Roadmap Authority

At Task 223, [223-276 Revised Roadmap](./223-276-revised-roadmap.md) became active. Task 225 later superseded it with [EveryBatch Official Roadmap - Tasks 225-348](./225-348-official-roadmap.md). Tasks 201-222 remain completed history, and roadmap changes still require Luke approval.

The former [Tasks 201-250 Roadmap](./201-250-next-roadmap.md) is retained as historical planning context and is no longer an active source of future task numbering.

## Future And Pending Work

The active roadmap contains a formal unnumbered Future/Pending Task Register. Every newly identified feature, defect, dependency or future idea must be recorded there rather than being left in chat history. Recording an item does not promote it or alter numbering. Critical roadmap candidates are reviewed at checkpoints and are promoted only after Luke approves.

The initial register preserves:

- Clean Eats review and meeting preparation, privacy-safe demo data, staff testing, feedback capture and bug-bash work;
- the Facility/iPad architecture decision;
- the separate EveryBatch marketing website project;
- the demo lead and controlled commercial onboarding pipeline;
- future real screenshot and demo-tenant preparation;
- Platform Admin review ideas supporting Task 263;
- the then-planned report-first documentation audit, now superseded by official Tasks 325-326;
- live verification of Leaked Password Protection before stale warning-era documentation is broadly corrected.

Clean Eats preparation remains timing-dependent and unnumbered. Meeting timing must not become a blocking dependency, and Luke decides when preparation work is promoted.

## Task 228 Decision Gate

Task 228 retains the title `Facility/iPad View v1`, but no implementation prompt should be written until Luke approves an architecture direction. The discussion must compare responsive tenant-app UI, PWA, shared or tenant-specific tablet hosts/routes, current domain conventions, tenant resolution, facility/area device scope, native iOS and Android, cross-platform wrappers, offline operation, registration, kiosk operation, staff versus shared-device sessions, security, Support and deployment/update burden.

Task 223 makes no architecture choice and does not imply that Task 228 is a normal page implementation.

## Dashboard Timing

Tasks 253-259 are the coordinated dashboard workstream. Module/workspace foundations come first, then module dashboards using reliable source data, then the main home dashboard. Newly provisioned tenants need uncluttered and honest readiness or empty states. Dashboards do not own operational records.

## Platform Admin Timing

Tasks 263-267 cover the later Platform Admin review and operating foundations: tenant health, readiness, modules/features, users and memberships, onboarding, first admin, branding, domains, Support, storage, diagnostics, provisioning and lifecycle. Billing readiness remains later and evidence-led.

## Marketing And Commercial Direction

Tasks 268-272 cover a separate marketing and commercial workstream. The public `everybatchmrp.com` site belongs in its own Next.js, TypeScript and Tailwind repository and Vercel deployment while sharing the approved brand system. It should use real privacy-safe screenshots, controlled claims and the Clean Eats origin story. Initial conversion remains demo or Talk to Sales. Lead capture and qualification may connect to calendar/email and controlled onboarding, but must not automatically provision active production tenants. Pricing remains Talk to Sales until commercial evidence supports a different model.

## Documentation Checkpoint

At Task 223, Tasks 261-262 were reserved for the report-first Documentation and Module Consistency Audit and correction pass. The Task 225 official roadmap supersedes those numbers with Tasks 325-326 while preserving the report-first rule. Task 223 itself corrected only roadmap and context conflicts caused directly by that historical realignment.

All future tasks follow [Codex Task Standards](./CODEX_TASK_STANDARDS.md). A later task that changes earlier decisions must update every materially affected document instead of leaving contradictory instructions in place.

## Current Migration Truth

- migration 039: QA schema foundation - applied;
- migration 040: audit hardening recovery - applied;
- migration 041: QA hold/release inventory link - applied;
- migration 042: dispatch/manifest schema foundation - applied;
- migration 043: dispatch manifest workflow - applied;
- migration 044: Logistics configuration identity trigger fix - applied.

Task 222, Carrier Configuration Foundation, was completed and committed before Task 223 began. Task 223 creates or changes no migration.

## Limitations And Review Rules

- Do not implement later tasks from this document.
- Do not silently promote pending work or invent titles beyond Task 276.
- Preserve parked hardening work until its approved handling point.
- Revisit roadmap boundaries through explicit reviews as real Clean Eats usage provides evidence.
- Treat build success and runtime proof as separate completion evidence.
- Keep current functionality, tenant isolation, permissions, RLS and source ownership unchanged during this documentation realignment.
