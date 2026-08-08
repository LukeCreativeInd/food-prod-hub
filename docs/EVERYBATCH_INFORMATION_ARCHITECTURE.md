# EveryBatch Information Architecture

## Authority And Purpose

This is the canonical information-architecture reference created by Task 243. It defines how EveryBatch behaves as one connected Food Manufacturing OS across the Tenant App, Platform Admin, Support / Help Centre and future Public / Marketing surfaces. It does not change routes, permissions, ownership, schemas or runtime behaviour.

The current application is evidence, not automatic precedent. Task 244 may standardise presentation while preserving behaviour. Task 245 may deepen representative entity and relationship patterns. Material navigation or roadmap changes still require Luke approval.

## Canonical Terminology

| Term | Meaning | Example |
| --- | --- | --- |
| Product surface | A distinct EveryBatch experience with its own purpose and information model. | Tenant App, Platform Admin, Support, Public |
| Module | A durable operational domain in the Tenant App. | Inventory, Products, Production |
| Workspace | A focused area inside a module for a coherent set of records or work. | Goods Inwards, Production Demand, Components |
| Page type | A reusable interaction pattern. | Module Home, Queue, Entity Detail, Configuration |
| Entity | A durable business record with identity and lifecycle. | Supplier, Receipt, Finished Product |
| Workflow | A sequence of controlled work that can cross entities or modules. | Demand review and freeze, Goods Inwards posting |
| View/read model | A presentation assembled from trusted owners without becoming a new owner. | Dashboard attention summary, Costings overview |

`Submodule` is not a preferred user-facing term. A route is an implementation address, not an information-architecture level.

## Product Surfaces

### Tenant App

The operational system for one organisation. It prioritises work, entities, workflow state, real relationships and permission-aware actions. Tenant Admin remains a module within this surface.

### Platform Admin

The EveryBatch operator control plane. It is denser and diagnostic: tenant readiness, provisioning, safe health, modules/features, branding/domains and Support operations. It does not inherit tenant operational mutation or proprietary-content access.

### Support / Help Centre

The authenticated knowledge and troubleshooting surface. It is search-led and task-led, connects guides to real workflows, and owns tickets/help content rather than operational records.

### Public / Marketing

The external product and brand surface. It may explain grounded capabilities, resources and product updates, but it does not reuse application navigation or expose tenant data.

## Information Hierarchy

1. **Surface:** which EveryBatch product experience the user is in.
2. **Module:** which durable operational domain owns the current context.
3. **Workspace:** which coherent job or record family the user is working with.
4. **Page type:** landing, list, queue, detail, create/edit, report or configuration.
5. **Entity/workflow context:** the specific human-readable record or controlled process.

The hierarchy must be visible through shell identity, active navigation, breadcrumbs, page title and local actions without repeating the same heading in multiple large blocks.

## Tenant Module Map

The current top-level order remains unchanged for Task 243:

1. Dashboard
2. Inventory
3. Products
4. Costings
5. Production
6. QA
7. Logistics
8. CRM
9. Reports
10. Tools
11. Admin

A future reorder requires explicit approval. Task 244 may improve grouping and visual hierarchy without changing this order.

### Inventory

| Group | Workspaces | Current interpretation |
| --- | --- | --- |
| Receive | Goods Inwards; Batch Receiving | Goods Inwards is operational; Batch Receiving is preview/future context. |
| Stock | Stock On Hand; Stock Locations; Stock Movements; Traceability | Real read models and ledgers exist, with the known Stock On Hand route issue tracked separately. |
| Supply | Purchasing | Preview/future; do not imply purchase-order capability. |

### Products

| Group | Workspaces | Current interpretation |
| --- | --- | --- |
| Supply masters | Suppliers | Supplier identity/catalogue relationships. |
| Materials | Ingredients; Packaging | Canonical internal items presented by product type. |
| Manufactured knowledge | Components; Finished Products; Recipes | Products owns item/formula truth; Recipe is a human presentation, not another source of truth. |
| Utilities | UOM Conversions | Explicit conversion configuration. |

### Costings

The intended sequence is input prices -> ingredient/packaging costs -> component/formula costs -> sell prices -> margins -> price/history evidence. Costings remains related to Products but owns its approved price, calculation, snapshot and margin read models where already defined.

### Production

The intended lifecycle is demand -> review/freeze -> plan -> preparation/readiness -> execution -> QA -> completion/actuals. Current Production Demand and planning foundations must be distinguished from Production Areas, Tasks and floor execution that are not yet fully operational. Production Report remains legacy-replacement context, not a second source of truth.

### QA

The intended groups are checks, Receiving QA, Production QA, holds/release and future non-conformance/history. Only implemented routes should be labelled available. QA permissions and operational scope remain subject to Task 249.

### Logistics

The current operational core is dispatch runs, manifests and carrier/service configuration. Carrier exports and delivery issues remain honest future/foundation states. Commerce delivery configuration interprets source-order delivery intent; Logistics owns dispatch/carrier execution. They must not be merged.

### CRM

CRM remains an honest scaffold. Its future structure may include accounts/customers, contacts and activity or relationship work supported by evidence. Task 243 does not invent a Salesforce-style model or data.

### Reports

Reports is a consumer of trusted operational domains. Future categories may include Production, Inventory, QA, Logistics, Costings and management views, but Reports does not own their truth and must not fabricate cards while read models are absent.

### Tools

Tools is a utility surface. Supplier Invoice Intake is current. Production Import may later appear here as an intake utility while its own run/source/staging evidence remains separate and Products/Production own approved canonical outcomes.

### Admin

Tenant Admin groups Organisation Settings, Users, Modules and Integrations for one organisation. Future role/permission configuration belongs conceptually here after Task 249. It must remain visually and intellectually distinct from Platform Admin.

## Tenant App Navigation

- The expanded sidebar shows modules, one open workspace group at a time and the active route.
- The collapsed sidebar remains useful through recognisable icons, tooltips and active state; child workspaces are reached by expanding or an accessible flyout/panel rather than disappearing without explanation.
- Permission-inaccessible modules/workspaces are omitted. Direct URLs remain server-guarded.
- Preview/future destinations are visibly qualified and never styled as fully operational.
- A module parent leads to a module home when one adds orientation or attention value. A utility module may lead directly to its only useful workspace until a real home is justified.
- Mobile navigation becomes a drawer/menu. It closes after navigation and never pushes a long route tree above content.

## Global Header

Global header content is limited to cross-product context:

- current page title and concise module/workspace context;
- organisation and, when operationally relevant and implemented, facility context;
- global search;
- Help / Support;
- user/workspace menu;
- future activity/notification entry only when real data and behaviour exist.

Module-specific actions do not belong in the global header. They live in the page header or entity/workflow action zone. A disabled notification placeholder is not a permanent pattern.

## Breadcrumbs

- Breadcrumbs express `Module -> Workspace -> Page/entity/workflow`.
- The last crumb identifies the current human-readable context and is not a second H1.
- Human labels take precedence over UUIDs. Technical references may appear in metadata or copy controls.
- Breadcrumbs render only links the user can access and do not bypass host or permission boundaries.
- Mobile retains the immediate parent plus current context; deeper ancestors may collapse into an accessible menu.
- Cross-module links appear as related records or workflow steps, not misleading breadcrumb ancestors.

## Page Headers

The persistent shell owns the main page title. Page content begins with useful context, status, actions or data rather than a duplicate hero.

Variants:

- **Module Home:** module purpose, attention/readiness summary and no more than one primary action.
- **Workspace Home/List/Queue:** workspace context, result/status summary, search/filter controls and primary action.
- **Entity Detail:** entity identity, lifecycle state, concise metadata and permission-aware actions.
- **Create/Edit:** operation name, parent context, save/cancel actions and validation state.
- **Configuration:** scope/applicability, readiness and explicit save/publish/archive controls.
- **Report:** source/as-of/filter context, export only where real, and read-model status.

Descriptions are optional and concise. Status and context chips carry distinct meaning; they are not decoration.

## Dashboard Model

The Tenant Dashboard answers: **What needs my attention across EveryBatch?**

Recommended order:

1. Blockers and time-sensitive operational attention.
2. Production and materials readiness.
3. Receiving/stock, QA and logistics attention where real data exists.
4. Configuration/readiness gaps relevant to the user.
5. Recent meaningful activity where evidence exists.

Dashboard cards are permission-filtered. Hidden data is not represented by misleading zeroes. A user without access does not receive a promotional card for that module. No fake KPIs or notification counts are permitted.

## Module Homes

A module home explains the domain, exposes its main workspaces and surfaces module-level attention or readiness. It does not repeat the global Dashboard.

Use only the card types needed:

- workspace navigation;
- attention/exception;
- readiness/setup;
- compact metric summary;
- recent activity;
- dependency/relationship.

Module homes use real counts and clear zero/restricted states. Cards must stack before labels or badges become cramped.

## Workspace Homes

A workspace earns a landing page when it has multiple workflows, lifecycle stages, readiness/configuration, or meaningful summary plus action. Simple CRUD workspaces open directly to a list. Operational queues such as Supplier Invoice Intake, Production Demand review, Receiving QA and Support tickets should not gain an extra click merely to imitate modules.

## Page-Type Selection

| Need | Default pattern |
| --- | --- |
| Browse and compare stable records | List/Table |
| Prioritise work, age, blockers and next action | Operational Queue |
| Understand one durable record | Entity Detail / Entity Hub |
| Create or materially edit a record | Full-page Create/Edit |
| Change one narrow value in context | Inline, drawer or modal only when safe |
| Configure applicability/version/readiness | Configuration |
| Read aggregated trusted sources | Report / Read Model |

## Entity And Workflow Models

An Entity Hub answers: what is this, what is its state, what relates to it, what can I do, where is it used, what changed and what needs attention. Important entities default to readable detail plus explicit edit rather than permanently editable screens.

A workflow page prioritises stage, blocker, next valid action, evidence and transition history. It may combine context from several entities while each domain keeps ownership.

## Search

- Global search locates permission-visible records across modules and returns grouped result types with clear destination context.
- Local search filters the current list/queue and does not pretend to be global.
- Tenant and host context are fixed by the authenticated surface.
- Search results never reveal inaccessible existence through counts, labels or snippets.
- Support search is a separate knowledge search, with contextual links from the Tenant App.
- Task 243 defines responsibility only; it adds no indexing or new search data.

## History And Provenance

History is a shared UX concept backed by domain-specific versions, events, audit logs, ledgers or snapshots. It should show what changed, when, actor, reason/source and safe before/after detail where evidence exists. Missing history is stated honestly.

Provenance is shown as a human summary first, with optional reference detail. Technical IDs are secondary. Examples include invoice observations, receipt evidence, demand contributions, frozen reviews and imported knowledge. Privacy and permission boundaries always apply.

## Support And Contextual Help

Tenant pages may link to a relevant concept, workflow or troubleshooting guide. Contextual help should explain both what to do and why a state exists. It does not copy entire guides into forms or reveal operational data to Support. Permission/no-access, Formula/Recipe/Method, Production Demand, QA and Production Import are priority contexts.

## Platform Admin Relationship

Platform Admin navigation groups Overview, Tenants, Platform, Operations, Commercial and Users. Tenant detail is a readiness/provisioning hub, not a tenant-data backdoor. Safe cards may show capability enabled state, setup/readiness, bounded counts, last status, diagnostic category and Support context only where explicitly implemented and authorised.

## Public Relationship

Public capability language must be traceable to implemented or approved evidence. Application screenshots must use safe reviewed data or clear prototypes. Public navigation may organise product, resources, updates, Support and login pathways; it does not mirror modules or expose tenant information.

## Responsive And Tablet Boundary

- Desktop is the primary management and administration context.
- Tablet supports management and selected operational review, while preserving a path to future purpose-built floor execution.
- Mobile supports quick read, attention triage and appropriate bounded actions; complex manufacturing tables/forms may use cards, safe horizontal scroll or a desktop/tablet requirement.
- Management-on-tablet is not the future floor application. Floor execution will use larger touch targets, area/task focus and minimal navigation in a later architecture task.

## Source-Of-Truth Rule

UI aggregation never transfers ownership. Products owns product/formula identity, Costings its approved price/calculation evidence, Production its demand/planning/execution, QA its checks/holds, Inventory its stock evidence, Logistics its dispatch/manifests, Support its knowledge/tickets, Platform Admin platform readiness/configuration and Reports only its read models. Tools facilitates intake and utilities.

## Task 244 Boundary

Task 244 implements shared shell/page/module-home consistency and selected multi-surface alignment without changing business logic, routes, permissions, data ownership or lifecycle. Navigation reorder, new data, new permissions and purpose-built floor UI require separate approval.

