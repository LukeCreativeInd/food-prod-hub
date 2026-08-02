> **NON-CANONICAL HISTORICAL SOURCE**
>
> This dossier was produced by the original EveryBatch architect chat. Its direct first-hand continuity is strongest through Task 212; earlier task numbering may be reconstructed, and post-handover implementation statements may be outdated. Current repository code, migration files, Git history, completed task documents, the active roadmap, and the EveryBatch living documents override this source when they conflict. Do not use this dossier alone as implementation authority. The original dossier body below is preserved without modernising its statements, uncertainty labels, structure, or task references.

# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 1 — Sources, limitations, origin, and early product evolution

This dossier follows the structure and confidence framework requested in the uploaded brief. 

---

# PART A — SOURCE AND MEMORY LIMITATIONS

## A1. Historical sources available to me

I appear to have access to several overlapping forms of project history:

### 1. Direct conversation history from the original architecture thread

**CONFIRMED FROM OUR CONVERSATION**

This includes the period where we:

* moved from Clean Eats costing and production tools toward a broader platform;
* defined the EveryBatch identity;
* established the multi-tenant architecture;
* created and reviewed Codex tasks;
* reviewed migrations, browser tests and SQL smoke checks;
* developed Products, Costings, Inventory, Production, Platform Admin and Support foundations;
* established the working relationship and review process used between Luke, the architect chat and Codex;
* completed and reviewed tasks through task 212 in the original thread.

The most detailed direct continuity available to me is strongest for the later formal task sequence, especially approximately tasks 100 onward and particularly tasks 175–212.

### 2. Project-level persistent context and prior-conversation summaries

**CONFIRMED FROM PROJECT CONTEXT**

This includes earlier work that may not be present verbatim in the immediately visible conversation but is retained as structured project memory, including:

* early backend migrations;
* authentication and permissions;
* module navigation;
* demo-user access;
* Products, Costings, Production and Inventory development;
* supplier invoice parsing;
* Platform Admin;
* Help Centre and support tickets;
* branding and domain architecture;
* staff meetings and Clean Eats data-collection planning;
* task and migration history.

This source is useful but may compress the reasoning that originally surrounded the implementation.

### 3. Uploaded historical handovers, Word documents, SQL files and review packages

**CONFIRMED FROM PROJECT CONTEXT**

These include:

* the large project handover;
* task summaries;
* roadmap documents;
* SQL migration content;
* recent later-chat discussions;
* marketing website planning;
* QA and Logistics follow-up notes;
* current architect reviews.

These sources help establish the later state of the project, but I must distinguish that from decisions I personally developed with Luke in the original thread.

### 4. Project memories covering adjacent Clean Eats tools

**CONFIRMED FROM PROJECT CONTEXT**

This includes knowledge of:

* Streamlit production reports;
* supplier and invoice workflows;
* Detrack manifest tools;
* Zapiet production cleanup;
* formula data collection;
* Clean Eats product and production realities.

These influenced EveryBatch but were sometimes developed in separate chats or tools.

---

## A2. Approximate period of direct participation

**CONFIRMED FROM OUR CONVERSATION**

I directly participated in the project while it evolved from a Clean Eats operational system into EveryBatch, through the formal completion of task 212.

I was directly involved in:

* clarifying the product identity;
* shaping the architecture;
* writing Codex prompts;
* reviewing Codex outputs;
* deciding test requirements;
* reviewing migrations and SQL results;
* correcting runtime problems;
* approving commits;
* revising the roadmap after drift;
* producing the major handover to the next architect.

### Later work I know primarily through project context rather than direct authorship

**CONFIRMED FROM PROJECT CONTEXT — NOT DIRECTLY DEVELOPED BY ME**

The following later work occurred after the handover or in the second architect thread:

* task 213 QA Module Deep Planning;
* task 214 QA Module Navigation and Scaffold;
* task 215 QA Schema Foundation and its extended migration review;
* tasks 216–217 QA operational work;
* tasks 218 onward Logistics planning and implementation;
* task 222 Carrier Configuration Foundation;
* the detailed later roadmap-alignment discussion;
* the latest documentation-audit planning;
* the newer architect’s strict migration review style.

I can discuss these as later project state, but I should not present them as decisions I personally made with Luke unless they were already anticipated in the original handover.

---

## A3. Information that may be incomplete

### Early task numbering

**UNCERTAIN / REQUIRES REPOSITORY VERIFICATION**

The earliest work did not always use the later strict numbered-task convention. Some early tasks may have existed as:

* unnumbered architecture work;
* Codex prompts without durable task documents;
* grouped migrations;
* recovery or polish passes;
* several small tasks later summarised as one milestone.

I can reconstruct the chronological work packages and migration themes, but exact early task numbers or titles may require repository verification.

### Exact migration-to-task mapping before migration 032

**REQUIRES REPOSITORY VERIFICATION**

I know migrations 001–038 were applied by the original thread’s end, and I know the purpose of many later migrations. Exact one-to-one mapping for every earlier migration is not fully preserved in my active memory.

### Exact UI copy and route names from very early iterations

**POSSIBLY OUTDATED**

Some route names, labels and module orders changed several times. I will preserve:

* original intent;
* major changes;
* later approved names where known.

### Current repository truth after task 212

**POSSIBLY OUTDATED / REQUIRES REPOSITORY VERIFICATION**

Any current implementation detail after the original handover should be checked against:

* the repository;
* applied migrations;
* current task documents;
* the active roadmap;
* the second architect’s decisions.

---

## A4. Important gaps already recognised

The previous handover captured the major architecture but missed or compressed many smaller details, including:

* canonical-route preferences;
* loading-state behaviour;
* action feedback;
* sidebar interaction details;
* dashboard visual direction;
* how Luke wants modules to feel during early setup;
* when to use real empty states;
* how strict review should be proportionate to task risk;
* the distinction between safe foundation work and enterprise-grade hardening;
* the intended staff-validation sequence;
* how the marketing website should connect to tenant onboarding;
* some rationale behind module and source-of-truth decisions;
* conversational Clean Eats operational details;
* why certain future ideas were parked rather than rejected.

Those omissions are a primary reason this dossier is being created.

---

## A5. Confidence-label interpretation

I will use these labels where uncertainty or provenance matters:

### CONFIRMED FROM OUR CONVERSATION

I directly discussed or developed this with Luke in the original architecture thread.

### CONFIRMED FROM PROJECT CONTEXT

The information is strongly represented in persistent project context, handovers or later project summaries.

### ARCHITECT INFERENCE

A reasoned interpretation based on known architecture and decisions, but not explicitly stated in the available record.

### UNCERTAIN

I do not have enough evidence to state it confidently.

### POSSIBLY OUTDATED

It was once true, but later work may have changed it.

### SUPERSEDED BY A LATER DECISION

An earlier approach was intentionally replaced.

### REQUIRES REPOSITORY VERIFICATION

The repository, migrations or current documentation should be treated as authoritative.

### REQUIRES LUKE CONFIRMATION

The decision depends on Luke’s preference or operational knowledge and is not fully settled.

---

# PART B — EVERYBATCH ORIGIN AND PRODUCT EVOLUTION

## B1. The original Clean Eats costing problem

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch did not begin as a SaaS idea.

It began with Clean Eats having practical operational problems around:

* supplier pricing;
* meal costing;
* ingredient costs;
* component costs;
* recipe calculations;
* production reports;
* data spread across invoices, spreadsheets and custom tools;
* manual workflows that did not share a common source of truth.

The original concern was not “let’s build an ERP.” It was closer to:

> Clean Eats has important costing and production workflows that are fragmented, inaccurate, awkward to maintain or dependent on manual knowledge. How do we fix them properly?

The initial platform thinking grew from the realisation that costing could not be repaired in isolation.

A meal cost depends on:

* the current supplier price;
* the mapped supplier item;
* the internal ingredient;
* unit conversions;
* formula quantities;
* component recipes;
* packaging;
* yield and loss;
* versioning;
* historical price context.

That meant the costing problem was actually a connected data problem.

---

## B2. From costing into production tooling

**CONFIRMED FROM OUR CONVERSATION**

Once the costing model was examined, the next dependency became production.

Clean Eats did not simply manufacture finished meals directly from raw ingredients. It had layers such as:

* raw ingredients;
* packaging;
* prepared ingredients;
* cooked components;
* sauces;
* batch recipes;
* finished meals;
* production areas;
* production steps.

An example discussed repeatedly was that a finished meal might contain “Bolognese Sauce,” but the system also needed to understand:

* the raw inputs inside Bolognese Sauce;
* the cooked yield;
* the production method;
* the output quantity;
* the cost per output unit;
* the room or production area involved;
* the tasks needed to prepare it;
* how that component flowed into a finished meal.

This exposed the need for:

* component formulas;
* finished-product formulas;
* production methods;
* routes;
* production areas;
* production tasks;
* planning and readiness.

The product was no longer just a costing calculator.

---

## B3. Existing Clean Eats tools that influenced the platform

**CONFIRMED FROM PROJECT CONTEXT**

Before EveryBatch, Clean Eats already relied on several operational tools and custom utilities, including:

* Streamlit production-report tools;
* Zapiet cleanup scripts;
* Detrack manifest generation;
* Shopify-related exports;
* spreadsheet-based formula and data collection;
* supplier invoices;
* manual production knowledge;
* separate tools for ordering, dispatch and reporting.

These tools solved individual problems but did not form one connected operating system.

The lesson was not that the existing tools were useless. Many were valuable and remained in use. The lesson was that they lacked a shared model connecting:

* product;
* supplier;
* formula;
* cost;
* receipt;
* lot;
* production;
* QA;
* dispatch.

---

## B4. From “Clean Eats Hub” to “Food Production Hub”

**CONFIRMED FROM PROJECT CONTEXT**

As the scope expanded, the project became known internally through names such as:

* Clean Eats Hub;
* Food Prod Hub;
* Food Production Hub;
* Food Operations Hub.

These names reflected the evolving internal project scope rather than the final product brand.

At this stage, the thinking became:

> If we are already connecting Products, Costings, Production, Inventory, QA and Logistics, this is becoming a complete operating platform for food production.

The “Hub” framing reflected the desire to centralise previously disconnected workflows.

---

## B5. Recognition of the broader market problem

**CONFIRMED FROM OUR CONVERSATION**

A major strategic turning point was Luke’s observation that many manufacturing platforms are built for every industry.

Examples and comparisons discussed included systems such as:

* Katana;
* Odoo;
* broad MRP/ERP systems;
* industry software with outdated interfaces.

The concern was that generic systems often create:

* bloated navigation;
* irrelevant features;
* awkward food-specific workflows;
* higher subscription costs;
* poor usability;
* dependence on customisation;
* insufficient depth where food production actually needs it.

Luke’s insight was that businesses often do not need “software for everything.” They need software that deeply understands their industry.

That led to the central commercial hypothesis:

> A purpose-built food-manufacturing operating system may be more useful than a generic ERP adapted to food.

---

## B6. Why food-manufacturing specific

**CONFIRMED FROM OUR CONVERSATION**

Food manufacturing has tightly connected requirements that generic systems may handle only superficially:

* supplier item mapping;
* pack and purchase units;
* ingredient allergens;
* component recipes;
* cooking yield;
* production batches;
* lot traceability;
* expiry and use-by;
* chill and cook temperatures;
* HACCP workflows;
* QA holds;
* cleaning checks;
* production-area tasks;
* finished-product outputs;
* dispatch and recall readiness.

The platform direction became intentionally food-specific.

The goal was not to exclude every adjacent manufacturing use case. It was to avoid weakening the product by designing around unrelated industries.

---

## B7. Emergence of the multi-tenant SaaS direction

**CONFIRMED FROM OUR CONVERSATION**

Once the product was understood as more than a Clean Eats internal tool, Luke and I established a two-layer model:

### Layer 1 — Clean Eats operational system

Solve real problems for Clean Eats:

* real supplier invoices;
* real product formulas;
* real Goods Inwards;
* real stock;
* real production plans;
* real QA workflows;
* real logistics.

### Layer 2 — EveryBatch platform architecture

Ensure the system remains reusable:

* organisation-scoped records;
* tenant isolation;
* roles and permissions;
* module enablement;
* feature flags;
* tenant branding;
* workspace routing;
* Platform Admin;
* support;
* onboarding.

The crucial design principle was:

> Clean Eats should be the proving ground, not a hard-coded exception baked into the platform.

Clean Eats-specific data belongs in its tenant. Reusable logic belongs in EveryBatch.

---

## B8. Why Clean Eats is Tenant 1

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats became Tenant 1 because it offers what a startup software project usually lacks:

* a real manufacturing facility;
* real suppliers;
* real invoices;
* real products;
* real production;
* real staff;
* real warehouse and QA needs;
* real daily operational pressure.

This gives EveryBatch the ability to be validated against reality rather than imagined workflows.

Luke’s relationship with Clean Eats is central. He is not simply an external developer asking hypothetical questions. He works with the business, understands much of the operation and can identify practical gaps before staff formalise them.

That shaped the implementation philosophy:

1. Luke and the architect build the strongest reasonable foundation.
2. Clean Eats staff see and use something tangible.
3. Their feedback refines exact fields, steps and responsibilities.
4. The platform is hardened after practical evidence exists.

---

## B9. Why EveryBatch became the product name

**CONFIRMED FROM OUR CONVERSATION**

A separate branding conversation explored competitor names and the need for something:

* modern;
* specific;
* memorable;
* scalable beyond Clean Eats;
* strongly connected to manufacturing and traceability.

“EveryBatch” emerged as the strongest concept.

The name communicates:

* every production batch;
* every supplier batch;
* every component batch;
* every finished-product batch;
* traceability across the whole chain.

It also avoids sounding like generic bookkeeping, generic inventory or generic ERP software.

---

## B10. Meaning of the tagline

**CONFIRMED FROM OUR CONVERSATION**

The tagline became:

> Every ingredient. Every process. Every batch.

Each part maps to the platform’s intended operating model.

### Every ingredient

* supplier;
* supplier item;
* internal item;
* approved price;
* quantity;
* UOM;
* allergen context;
* lot;
* cost.

### Every process

* receiving;
* preparation;
* cooking;
* packing;
* QA;
* production tasks;
* movement;
* dispatch.

### Every batch

* supplier batch;
* inventory lot;
* component batch;
* production batch;
* finished-product output;
* traceability chain.

The tagline summarises the core strategic promise: connected operational visibility from source material through manufacturing and dispatch.

---

## B11. Product positioning

**CONFIRMED FROM OUR CONVERSATION**

The platform positioning became:

> Food Manufacturing OS

This was preferred over describing it only as:

* inventory software;
* MRP;
* ERP;
* costing tool;
* production planner.

“Operating System” better reflects that EveryBatch is intended to connect the operational areas of the business while allowing modules to remain independently governed.

---

## B12. The operational problem EveryBatch is intended to solve

**CONFIRMED FROM OUR CONVERSATION**

The main operational problem is fragmentation.

A food manufacturer may have:

* supplier invoices in email;
* price data in spreadsheets;
* formulas in documents;
* production plans in another spreadsheet;
* warehouse records elsewhere;
* QA forms on paper;
* dispatch in another application;
* staff knowledge stored informally.

EveryBatch is intended to connect these without flattening them into one undifferentiated database.

The platform should answer questions such as:

* What did this ingredient cost at the time?
* Which supplier item maps to this internal ingredient?
* What formula version produced this component?
* What inputs are required for this production batch?
* Which lot was received?
* Where is it stored?
* Is it available or held?
* Which finished batch consumed it?
* Which QA checks were completed?
* What was dispatched?
* Can we trace backward and forward?

---

## B13. The commercial problem EveryBatch is intended to solve

**CONFIRMED FROM OUR CONVERSATION**

The commercial opportunity is to provide food manufacturers with a platform that is:

* purpose-built;
* modern;
* easier to understand;
* modular;
* scalable;
* less bloated than generic ERP;
* connected across operations;
* priced and onboarded around actual food-manufacturing needs.

There was also an awareness that onboarding and implementation may be commercially significant.

Pricing was not to be invented prematurely.

Factors expected to influence pricing include:

* number of users;
* number of facilities;
* document-processing volume;
* storage;
* support;
* implementation effort;
* custom integrations;
* onboarding complexity.

The preferred early commercial approach was:

* Book a Demo;
* Talk to Sales;
* controlled onboarding;
* no instant self-service manufacturing tenant until provisioning is mature.

---

## B14. Original user-experience goal

**CONFIRMED FROM OUR CONVERSATION**

Luke repeatedly wanted the system to feel like a modern operational platform, not an old manufacturing database.

The future concept direction included:

* dense but organised dashboards;
* cards and tables together;
* alerts;
* quick actions;
* progress;
* readiness;
* operational exceptions;
* calm white and green design;
* Clean Eats tenant branding;
* EveryBatch platform identity;
* clear module structure;
* visible relationships.

The concept mockups showed:

* cross-business home dashboard;
* Products and Costings combined context;
* Production and QA operational dashboards;
* Inventory, Purchasing and Logistics visibility.

These mockups were always directional, not literal commitments.

The architecture-first principle was:

> Build the real source records first, then populate rich dashboards honestly.

---

## B15. Major scope turning points

### Turning point 1 — Costing depends on master data

**CONFIRMED FROM OUR CONVERSATION**

Costing could not be trustworthy without suppliers, items, formulas and units.

### Turning point 2 — Finished meals depend on components

**CONFIRMED FROM OUR CONVERSATION**

The product model needed components and batch formulas, not only flat recipes.

### Turning point 3 — Invoice intake became a system input

**CONFIRMED FROM OUR CONVERSATION**

Supplier invoices could provide:

* supplier identity;
* catalogue items;
* price observations;
* approved-price candidates;
* receiving context.

### Turning point 4 — Inventory needed an append-only ledger

**CONFIRMED FROM OUR CONVERSATION**

Goods Inwards could not simply update a quantity column. It needed:

* receipts;
* receipt lines;
* lots;
* movements;
* Stock On Hand derived from movements.

### Turning point 5 — Clean Eats became Tenant 1

**CONFIRMED FROM OUR CONVERSATION**

The system architecture shifted from single-company assumptions to organisation-scoped SaaS foundations.

### Turning point 6 — Platform Admin became separate from tenant Admin

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch needed an operator console that:

* provisions tenants;
* inspects health;
* manages platform features;
* supports customers.

It should not be a tenant sidebar module.

### Turning point 7 — Support became part of the platform

**CONFIRMED FROM OUR CONVERSATION**

A serious SaaS product needed:

* Help Centre;
* guides;
* troubleshooting;
* tickets;
* context-aware support;
* Platform support inbox.

### Turning point 8 — Real stock and traceability

**CONFIRMED FROM OUR CONVERSATION**

Goods Inwards, lots, movements and traceability moved the platform from interface scaffolding into real operational software.

---

# PART C — COMPLETE CHRONOLOGICAL TASK AND WORK LEDGER

## C1. Earliest unnumbered and foundational work

The early ledger below is reconstructed from project memory and may not match exact original task titles.

---

## Work package: Clean Eats costing-system review and expansion concept

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

Clean Eats had costing and production workflows that needed:

* better accuracy;
* more maintainable data;
* supplier-price updates;
* clearer formulas;
* fewer disconnected spreadsheets and scripts.

### Luke’s operational explanation

Luke explained that ready-made meals are not simply flat ingredient lists.

A finished meal may include:

* prepared chicken;
* cooked rice;
* sauces;
* vegetables;
* packaging.

Those intermediate items have their own formulas and production methods.

### Architectural decision

Introduce a hierarchy:

* raw ingredient;
* packaging;
* component;
* finished product.

### Source-of-truth direction

* Suppliers own supplier identity.
* Internal Items own the canonical operational item.
* Formulas describe composition.
* Prices come from approved supplier pricing.
* Costing is derived.

### Consequence

The platform needed Product master data before costing could be considered reliable.

---

## Work package: Initial Food Production Hub architecture

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Purpose

Define the major modules and how they would fit together.

Early major modules included:

* Dashboard;
* Products;
* Costings;
* Production;
* Inventory;
* QA;
* Logistics;
* CRM;
* Reports;
* Admin.

### Important decision

The system would be modular, but not disconnected.

Each module should own its operational records while exposing links to related records elsewhere.

### Explicitly excluded

* Building all modules deeply at once.
* Hard-coding every Clean Eats process before data collection.
* Treating dashboards as the source of operational truth.

---

## Work package: Repository and stack foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Stack selected

* Next.js App Router;
* TypeScript;
* Tailwind;
* Supabase;
* Vercel;
* GitHub;
* Codex.

### Rationale

The stack supported:

* rapid full-stack development;
* server actions;
* Supabase Auth;
* RLS;
* multi-tenant data;
* Vercel deployments;
* one codebase for multiple host modes.

### Important future consequence

The separate marketing website was later also recommended to use Next.js and Vercel, but in a separate repository.

---

## Work package: Supabase core schema foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration range:** Early migrations within 001–010, exact mapping requires repository verification.

### Core records introduced

Likely included:

* organisations;
* profiles;
* organisation memberships;
* roles;
* permissions;
* role permissions;
* module records;
* organisation modules;
* audit foundations.

### Architectural principles

* Every tenant-owned row should carry `organisation_id`.
* Membership and permissions should be checked inside the database.
* The tenant app should never rely only on client-side hiding.
* RLS should be enabled early rather than retrofitted later.

---

## Work package: Authentication and application access

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Features

* login;
* logout;
* protected routes;
* first platform admin;
* app access helpers;
* no-access routing;
* demo user.

### Important helpers later established

* `requireAuth()`;
* `requireAppAccess()`;
* `requirePermissionAccess()`;
* `requirePermissionAccessWithPermissions()`;
* `getAppShellContext()`.

### Database helpers

* `current_profile_id()`;
* `is_active_member(uuid)`;
* `current_role_key(uuid)`;
* `is_platform_admin()`;
* `has_permission(uuid, text)`.

### Important decision

The shell should remain visible during protected route loading where possible.

---

## Work package: Demo-user access model

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Purpose

Allow Clean Eats staff to explore a controlled Phase 1 demo without seeing unfinished or sensitive areas.

### Demo user

* email: `hello@cleaneatsaustralia.com.au`;
* role: `phase_1_demo_user`;
* viewer-level access.

### Access direction

Visible:

* selected Products;
* Costings;
* Production;
* Inventory;
* Dashboard.

Blocked:

* Platform Admin;
* Admin;
* QA;
* Logistics;
* CRM;
* Reports;
* Supplier Invoice Intake.

### UI decision

Hidden navigation was not enough. Direct URLs also had to route to `/no-access`.

---

## Work package: Initial module navigation and application shell

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original shell direction

Create a professional SaaS shell with:

* sidebar;
* nested module navigation;
* header;
* account controls;
* tenant context;
* permission-aware visibility.

### Module order evolved

Earlier ordering differed, but the later approved tenant order became:

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

### Important decision

Platform Admin must not appear in the tenant module sidebar.

---

## Work package: Early Phase 1 demo modules

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

Initial usable/demo module surfaces included:

* Dashboard;
* Products;
* Costings;
* Production;
* Inventory.

At first, many screens used:

* scaffold data;
* sample rows;
* conceptual layouts.

A later standing rule became:

> When a page is touched, replace misleading fake operational data with real data or an honest empty state.

---

## Work package: Product master-data foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Product workspaces discussed and built over time

* Suppliers;
* Ingredients;
* Packaging;
* Components;
* Recipes;
* Finished Products;
* UOM Conversions.

### Core decision

Use one canonical `internal_items` model with item types rather than entirely disconnected schemas for every item category.

Known item types:

* ingredient;
* packaging;
* component;
* finished_product.

### Why this mattered

It simplified:

* formulas;
* costs;
* search;
* inventory;
* traceability;
* future imports.

### Risk avoided

Duplicating the same item identity across Ingredients, Inventory and Production.

---

## Work package: Supplier foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Capabilities

* supplier list;
* supplier detail;
* manual create/edit;
* supplier aliases;
* supplier catalogue items.

### Source-of-truth rule

Supplier catalogue items are supplier-facing descriptions and units.

Internal Items are EveryBatch’s canonical operational items.

Mapping connects them.

### Later dependency

Supplier Invoice Intake relied heavily on this separation.

---

## Work package: Components and formula model

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Purpose

Support intermediate batch recipes such as:

* Bolognese Sauce;
* Italian Herb Chicken Breast;
* Cooked Rice.

### Formula hierarchy

Components may use:

* ingredients;
* packaging where relevant;
* other supported inputs.

Finished Products may use:

* components;
* ingredients;
* packaging.

### Versioning direction

Formulas needed versions so historical or published composition could remain stable.

### Costing consequence

Component cost feeds finished-product cost.

---

## Work package: Finished-product formula builder

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Features

* finished-product list;
* detail page;
* formula builder;
* grouped input selector;
* output quantity/unit;
* readiness messaging;
* links to sell price and margin.

### Important wording direction

Finished Products were positioned as:

* sellable meal;
* SKU;
* manufactured output.

The UI needed to make the distinction between component and finished product understandable to non-technical staff.

---

## Work package: Costing foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Costing workspaces

* Ingredient Costs;
* Packaging Costs;
* Component Costs;
* Sell Prices;
* Meal Margins;
* Price History.

### Core logic

Costing uses:

* approved supplier prices;
* formula lines;
* output quantity;
* safe UOM conversion;
* formula readiness.

### Blocker philosophy

Do not silently invent a cost.

Block or warn when:

* price missing;
* unit incompatible;
* formula missing;
* unsupported conversion;
* currency unsupported;
* tax mode unknown.

---

## Work package: Sell-price foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Table

`finished_product_sell_prices`

### Permissions

* `sell_prices.view`;
* `sell_prices.manage`.

### Important rule

Current active sell-price uniqueness used effective/open-ended logic.

### Meal Margins relationship

Meal Margins reads:

* current finished-product cost;
* active sell price;
* formula readiness.

---

## Work package: Costing snapshots

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION
**Migration:** 034

### Purpose

Preserve historical costing evidence.

### Records

* `costing_snapshots`;
* `costing_snapshot_lines`.

### Key decision

Snapshots are immutable historical records.

Later:

* supplier-price changes;
* formula edits;
* UOM changes;
* cost-calculation changes

must not rewrite an existing snapshot.

### Tested example

A Bolognese Sauce component snapshot was successfully created after the UOM helper fix.

### Important limitation

Blocked snapshots could still be stored with blocker reasons for auditability.

---

## Work package: Safe metric UOM conversion

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Safe built-in conversions

* kg ↔ g;
* l ↔ ml;
* aliases for each/unit.

### Explicitly excluded

Pack assumptions such as:

* bunch → g;
* carton → each;
* box → kg;
* bottle → ml.

### Principle

Metric equivalence can be global.

Pack conversion is contextual and must be reviewed.

This decision later led directly to tasks 202–204.

---

## Work package: Supplier Invoice Intake architecture

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Purpose

Turn real supplier invoices into structured price and item-mapping evidence.

### Architecture

* suppliers;
* aliases;
* supplier items;
* internal items;
* mappings;
* purchase documents;
* purchase document lines;
* price observations;
* approved supplier prices;
* ignored-line rules.

### Important source-of-truth distinction

Purchase documents store parsed/reviewed commercial evidence.

They do not automatically become stock.

### File support

* PDF;
* JPEG;
* PNG;
* WebP;
* HEIC;
* 20MB maximum.

---

## Work package: Supplier parsers

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

Parsers were implemented for:

1. Cammaroto Poultry
2. Melbourne Produce Merchants
3. Del-Re
4. Pacific Meat Sales
5. Alba Cheese
6. Grange Meat Co
7. Il Nonno

### Design direction

* supplier-specific parsing where useful;
* unknown-parser diagnostics where not recognised;
* no false confidence;
* retain original document;
* review before approval.

### Future risk

Parser behaviour should never silently overwrite approved operational records.

---

## Work package: Inventory location foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Clean Eats seeded locations

Examples:

* Kitchen;
* Prepack Room;
* Packing Room;
* Cool Room;
* Freezer;
* Dry Store;
* Goods Inwards;
* Dispatch Area;
* Quarantine/Hold;
* Waste.

### Important principle

Locations are tenant-owned operational records, not hard-coded global constants.

The Clean Eats locations may be seeded for that tenant, but future tenants define their own.

---

## Work package: Goods Inwards planning and stock-movement foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 035

### Tables

* `inventory_receipts`;
* `inventory_receipt_lines`;
* `inventory_lots`;
* `stock_movements`.

### Source-of-truth model

* Receipt = receiving event header.
* Receipt line = reviewed incoming line.
* Lot = traceable stock identity/context.
* Movement = append-oriented quantity ledger.
* Stock On Hand = derived later.

### Permissions

Included granular receipt, lot and movement permissions.

### Critical architectural decision

Do not directly update a “current stock quantity” as the source of truth.

Write movements and derive balance.

---

## Work package: Goods Inwards UI v1

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Routes

* `/goods-inwards`;
* `/goods-inwards/new`;
* `/goods-inwards/[id]`.

### Capabilities

* create draft receipt;
* add lines;
* cancel lines;
* post receipt;
* show posted state;
* create lot and movement records.

### QA handling

* rejected lines block;
* held lines become on-hold lots;
* conversion-required lines block;
* valid lines post.

### Known limitation at the time

Posting initially used sequential server-action writes, creating partial-write risk.

This later led to tasks 206–207.

---

## Work package: Supplier Invoice to Receiving

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Purpose

Create a draft Goods Inwards receipt from reviewed purchase-document lines.

### Important boundaries

* no auto-posting;
* no automatic stock;
* user reviews receipt;
* line retains `purchase_document_line_id`;
* manual lines may coexist;
* supplier invoice remains commercial evidence.

### Tested example

A Cammaroto invoice draft was created and later posted with both:

* invoice-linked line;
* manually added line.

### Risk identified

Manual testing created a duplicate-looking receiving scenario, but it was correctly understood as one invoice-linked and one manually created line rather than a system duplicate.

---

## Work package: Production planning schema foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 036

### Tables

* `production_areas`;
* `production_plans`;
* `production_plan_lines`;
* `production_batches`;
* `production_batch_inputs`.

### Important decision

Production planning could begin before stock consumption and output movements existed.

### Why

It allowed the team to model:

* what should be made;
* output quantity;
* formula readiness;
* planned batch header;
* approval status.

Without pretending inventory had already been reserved or consumed.

---

## Work package: Production Plan UI v1

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Routes

* `/production-plan`;
* `/production-plan/new`;
* `/production-plan/[id]`.

### Features

* draft plan;
* planned output lines;
* formula and snapshot context;
* readiness/blocker status;
* create planned batch;
* approve/cancel/archive.

### Important correction before commit

A blocked line initially still exposed a create-batch action.

This was corrected so:

* only planned/ready lines can create batches;
* server action also enforces the rule.

### Known limitation

A test batch created before the guard remained in development data.

It was accepted as test history, not rewritten.

---

## Work package: Platform Admin foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Purpose

Create a separate operator console for EveryBatch itself.

### Capabilities developed over time

* tenant overview;
* tenant detail;
* module and feature visibility;
* provisioning templates;
* New Tenant Wizard;
* tenant creation;
* onboarding checklist;
* all tenants;
* branding scaffold;
* support inbox.

### Important boundary

Platform Admin is not a tenant module.

It should not appear in the tenant sidebar.

### Tenant creation v1

Created:

* organisation;
* settings;
* branding;
* organisation modules;
* feature flags.

Did not yet create:

* Auth user;
* profile;
* membership;
* domain;
* billing.

---

## Work package: Multi-domain host routing

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Domains

* `app.everybatchmrp.com`;
* `admin.everybatchmrp.com`;
* `cleaneats.everybatchmrp.com`;
* `support.everybatchmrp.com`.

### App modes

* marketing;
* central_app;
* platform_admin;
* tenant_app;
* support;
* local_dev;
* unknown.

### Important decisions

* one codebase;
* one Vercel project;
* host mode determines routing;
* middleware avoids database/session queries;
* local development remains permissive.

### Repeated warning

Never use:

`admin.everybatchmrp.com.au`

---

## Work package: Shared authentication cookies across subdomains

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

Production auth cookies were scoped to:

`.everybatchmrp.com`

for known production hosts.

### Consequence

Users may need one fresh login after deployment.

### Localhost

Local cookie behaviour remained development-safe and separate.

---

## Work package: EveryBatch branding integration

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Brand elements

* EveryBatch logo;
* icon;
* tagline;
* tenant logo;
* browser icon;
* login branding;
* tenant branding.

### Shell treatment

* EveryBatch identity at platform level;
* Clean Eats logo and name at tenant level;
* avoid visually presenting EveryBatch as if it were the tenant;
* avoid presenting Clean Eats as the software brand.

### Static assets

The EveryBatch icon was used for favicon/apple icon.

---

## Work package: Support Help Centre foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Routes

* `/support`;
* `/support/guides`;
* `/support/tickets`;
* `/support/contact`;
* `/support/release-notes`;
* `/support/troubleshooting`.

### Purpose

Create authenticated in-product support rather than relying only on external documentation.

### Important boundary

Support Help Centre explains how to use EveryBatch.

It does not own tenant operational documents such as SOPs or QA records.

---

## Work package: Support ticket schema and customer UI

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 032

### Tables

* support tickets;
* comments;
* events;
* attachments metadata.

### Features

* customer-visible comments;
* status;
* priority;
* category;
* page/module context;
* internal notes through Platform Admin.

### Lifecycle refinements

* new ticket starts waiting on support;
* customer reply returns to waiting on support;
* platform reply can move to waiting on customer;
* closed tickets block comments.

---

## Work package: Platform Support Inbox

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Routes

* `/platform/support`;
* `/platform/support/[id]`.

### Capabilities

* cross-tenant inbox;
* filters;
* assignment;
* priority;
* status;
* customer-visible reply;
* internal note.

### Important boundary

Platform support records do not become tenant operational truth.

---

## Work package: Support attachment foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 033

### Bucket metadata

`support-ticket-attachments`

### Status

* schema foundation existed;
* upload/display UI was not yet implemented;
* broad storage policies were intentionally avoided.

---

## Work package: App shell and navigation overhaul

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Improvements

* refined sidebar;
* collapsed mode;
* account section;
* workspace switching;
* search;
* help;
* route-aware title;
* tenant branding;
* navigation grouping.

### Known backlog

* Platform Admin mobile layout;
* tenant mobile responsiveness;
* submenu auto-close;
* table overflow;
* page-header consistency;
* status colours;
* loading-state consistency.

### Important later-lost decision

Clicks should never appear unresponsive.

The stronger modules used loading states; later QA and Logistics needed the same treatment.

---

## Work package: Global search foundation

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Interaction

* Cmd/Ctrl+K;
* icon trigger;
* debounce;
* minimum two characters;
* grouped result categories.

### Search sources

* pages;
* suppliers;
* internal items;
* supplier items;
* locations;
* costings/prices;
* invoice documents where allowed;
* formulas.

### Security principle

Search must remain permission-aware.

---

## Work package: Feature flags

**Title status:** Reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

Known Clean Eats enabled flags included:

* global search;
* tenant branding;
* invoice intake;
* inventory locations;
* product management;
* costing dashboard;
* production readiness;
* loading transition;
* help/support menu;
* EveryBatch branding;
* login branding.

### Principle

Feature flags control rollout/readiness.

They do not replace permissions.

---

## Work package: Phase 1 operational review and roadmap reset

**Exact task:** 200 — Phase 1 Operational Review Pack
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Outputs

* phase review document;
* 201–250 roadmap;
* task prompt template.

### Purpose

Stop building isolated features and evaluate:

* what was real;
* what was scaffold;
* what needed integration;
* what sequence would create the strongest operational foundation.

### New prompt discipline established

Every future task should include:

* Admin impact;
* Support impact;
* cross-module impact;
* source-of-truth;
* dummy cleanup;
* migration reporting;
* full checks.

### Known later issue

The roadmap later drifted at tasks 211–212 and was corrected.

---

## Work package: Task 201 — Phase 2 Module Integration Map

**Title:** Confirmed
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Purpose

Map future modules into the existing foundation before deeper implementation.

### Modules considered

* QA;
* Logistics;
* Reports;
* CRM.

### Key output

A cross-module integration map identifying:

* source records;
* future dependencies;
* permissions;
* Admin and Support implications;
* scaffold cleanup.

### Important consequence

The roadmap was intended to move from inventory foundations into QA after task 210.

---

# End of Part 1

The next part will continue:

## PART C — COMPLETE CHRONOLOGICAL TASK AND WORK LEDGER

Beginning with:

* Task 202 — UOM Conversion Foundation Plan;
* Tasks 203–212 in full detail;
* known earlier numbered UI, Platform Admin, Support, Products, Costings, Inventory and Production tasks where task identity can be reconstructed;
* review corrections, migration decisions and commit workflow.

After completing the chronological ledger, the dossier will move to:

## PART D — MODULE-BY-MODULE PRODUCT AND ARCHITECTURE HISTORY

# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 2 — Detailed task ledger from major UI/platform foundations through Task 212

This section continues **Part C — Complete Chronological Task and Work Ledger**.

Where exact task titles or numbering are uncertain, I label them accordingly rather than presenting reconstruction as repository fact.

---

# PART C — COMPLETE CHRONOLOGICAL TASK AND WORK LEDGER

## C2. Later Phase 1 product, platform and operational task sequence

---

## Task 175 — Auth Pages and Platform Admin Shell Polish

**Title status:** Best-known title reconstructed from project context
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

By this stage, the underlying authentication, tenant shell and Platform Admin routes were functioning, but the visual hierarchy and interaction patterns did not yet feel consistent.

The issues included:

* login and workspace-selection pages feeling visually unbalanced;
* Platform Admin using interaction patterns that differed too much from the tenant shell;
* Platform Admin footer/account controls not matching the product’s broader UI language;
* excessive child icons or badges in Platform Admin navigation;
* uncertainty around sidebar collapse and mobile behaviour.

### Why it was prioritised

Luke wanted the platform to look credible during staff demonstrations.

Authentication and Platform Admin are among the first surfaces seen by:

* Luke;
* future tenant administrators;
* EveryBatch operators;
* support staff.

A functional but rough shell weakened the perceived quality of the entire product.

### Decisions made

**CONFIRMED FROM PROJECT CONTEXT**

* `/login` should use balanced panels.
* `/select-workspace` should use balanced panels.
* Platform Admin should have its own dedicated operator-console shell.
* Platform Admin’s account block should sit at the lower-left, consistent with the tenant shell.
* Workspace switching and sign-out should be visible but not dominate the layout.
* Platform submenus should become simpler and less visually noisy.
* Sidebar collapse should be subtle and consistent.

### Scope included

* login-page polish;
* workspace selector polish;
* Platform Admin sidebar/account area;
* sidebar grouping and child-item treatment;
* route-aware active state improvements.

### Scope excluded

* tenant provisioning changes;
* authentication schema;
* permission changes;
* domain changes;
* billing;
* user invitation workflows.

### Platform Admin impact

This task improved the operator experience without changing the records Platform Admin owned or managed.

### Support impact

No major Support workflow change, though shell consistency later influenced the Support portal.

### Important future limitation

Platform Admin mobile behaviour remained imperfect and was intentionally parked for a later responsive pass.

### Future architect warning

Do not merge Platform Admin back into the tenant shell merely for visual consistency.

It is intentionally a separate operator environment, even where it shares visual conventions.

---

## Task 176 — Static Support Guide Content v1

**Title status:** Best-known exact title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

The Help Centre had routes and shell foundations, but useful product guidance was still sparse.

A support centre without actual content would look complete while providing little operational value.

### Purpose

Create an initial structured guide library covering major EveryBatch areas.

### Guides known to have been created or planned

* Getting Started;
* Workspace Selector and Domains;
* Products Overview;
* Costings Overview;
* Formula Builder Basics;
* Supplier Invoice Intake Basics;
* Inventory Overview;
* Sign-in and Access Troubleshooting.

### Architectural decision

Support content should be maintained as structured application content rather than fake database records.

A known helper was:

`lib/support-guides.ts`

### Source-of-truth boundary

The Help Centre owns product-use guidance.

It does not own:

* tenant SOPs;
* HACCP plans;
* supplier documents;
* completed QA records;
* operational attachments.

### User-experience direction

Guides should be:

* concise;
* practical;
* route-aware where possible;
* updated when user-facing workflows change;
* separate from release notes and troubleshooting.

### Deferred work

* search across guides;
* richer media;
* embedded screenshots;
* guide analytics;
* tenant-specific help;
* document authoring UI.

### Future architect warning

Do not confuse Support guides with a tenant document-management system.

---

## Task 177 — Support Help Centre Route and Content Refinement

**Title status:** Reconstructed
**Confidence:** ARCHITECT INFERENCE / REQUIRES REPOSITORY VERIFICATION

This task number is not confidently preserved, but work in this period included:

* route protection for Support;
* preventing tenant and Platform routes from leaking through the Support host;
* context-aware Help links;
* initial release-note and troubleshooting content.

### Key routing decision

The Support host should expose authenticated Support routes such as:

* `/`;
* `/guides`;
* `/tickets`;
* `/contact`;
* `/release-notes`;
* `/troubleshooting`.

Internally, these could rewrite to `/support/...`, but the public Support-domain experience should remain clean.

### Important security decision

Support is authenticated.

It is not a public marketing site.

### Known issue addressed

The Support host originally risked exposing unrelated tenant or Platform routes.

That was corrected through host-aware routing and redirects.

---

## Task 178 — Customer Support Ticket UI

**Title status:** Best-known exact title reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

The Help Centre needed more than static documentation.

Users needed a way to report:

* bugs;
* access problems;
* workflow questions;
* operational blockers;
* contextual problems from a specific page.

### Existing schema

Migration 032 had introduced:

* `support_tickets`;
* `support_ticket_comments`;
* `support_ticket_events`.

### Routes

* `/support/tickets`;
* `/support/tickets/new`;
* `/support/tickets/[id]`.

### Capabilities

* list tickets;
* create ticket;
* view ticket;
* add customer-visible comments;
* display customer-visible lifecycle events.

### Permission model

Known permissions included concepts such as:

* `support_tickets.view`;
* `support_tickets.create`;
* `support_tickets.comment`;
* `support_tickets.manage`;
* `support_tickets.internal_notes`.

### Key lifecycle decision

Customer users should not see internal notes.

### Source-of-truth boundary

Support tickets own support conversations.

They do not become operational records for:

* QA incidents;
* inventory adjustments;
* production tasks;
* logistics exceptions.

A support ticket may link to such records contextually, but does not replace them.

### Future work

* attachments;
* email notifications;
* SLA tracking;
* tenant support entitlements;
* knowledge-base suggestions;
* escalation.

---

## Task 179 — Platform Admin Support Inbox

**Title status:** Best-known exact title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

Customer tickets existed, but EveryBatch operators needed a cross-tenant operational inbox.

### Routes

* `/platform/support`;
* `/platform/support/[id]`.

### Capabilities

* list tickets across tenants;
* filter by status, priority and category;
* assignment;
* customer-visible reply;
* internal note;
* lifecycle changes.

### Important lifecycle corrections

Later refinement established:

* new tickets begin as `waiting_on_support`;
* customer comments move the ticket to `waiting_on_support`;
* Platform replies can move open/waiting tickets to `waiting_on_customer`;
* planned/resolved states should not be overwritten blindly;
* closed tickets block further comments;
* internal notes do not change customer-facing status.

### Problems discovered

Server actions initially did not always write comments/events correctly.

The action flow was reviewed and corrected.

### Platform Admin boundary

Platform Admin can support tenants but should not silently edit tenant operational data through the support interface.

### Support-context consequence

This task laid the foundation for page-aware ticket creation throughout the tenant app.

---

## Tasks 180–183 — Support Ticket Lifecycle, Filters and Context Refinement

**Title status:** Grouped reconstruction
**Confidence:** CONFIRMED FROM PROJECT CONTEXT, exact task numbering uncertain

### Work included

* status-lifecycle polish;
* search;
* filters;
* pagination;
* page/module context;
* customer/platform list improvements.

### Context-aware ticket creation

Support links could carry:

* `relatedPath`;
* `moduleKey`;
* `category`;
* possibly entity identifiers where supported.

### Why this mattered

A support ticket saying only “this page doesn’t work” is much less useful than one automatically carrying:

* current workspace;
* route;
* module;
* entity context.

### Security consideration

Context values must be treated as metadata, not trusted authorisation inputs.

### Deferred work

* richer diagnostic snapshots;
* browser/device metadata;
* screenshot attachment;
* automatic tenant-health context;
* audit-linked support access.

---

## Task 184 — Support Ticket Attachment Plan

**Title status:** Best-known title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Purpose

Plan attachments without prematurely opening broad storage access.

### Required considerations

* private storage;
* tenant-scoped paths;
* ticket-level access;
* file size and MIME restrictions;
* customer-visible versus internal attachments;
* support-user access;
* metadata ownership;
* signed URLs;
* deletion/archive policy.

### Important security direction

Avoid broad `storage.objects` policies.

Storage policies in Supabase can be difficult due ownership and system-table constraints, so manual SQL review may be required.

---

## Task 185 — Support Ticket Attachment Foundation

**Title status:** Best-known title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 033

### Foundation created

* `support_ticket_attachments` metadata;
* private bucket metadata;
* path convention;
* helper concept for storage-path access.

### Path direction

`{organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}`

### MIME and size direction

Known foundation included limits for:

* images;
* PDF;
* text;
* CSV;
* XLSX;
* approximately 10MB.

### Explicitly not implemented

* upload UI;
* display/download UI;
* broad `storage.objects` policies.

### Deferred work

Support attachments remained a known backlog item through the original handover.

---

## Task 186 — Product/Costing Detail UX Review

**Title status:** Reconstructed
**Confidence:** ARCHITECT INFERENCE

A transitional task or review occurred before the known 187–189 product-detail polish tasks.

### Purpose

Assess whether Components and Finished Products were understandable as operational setup areas rather than generic item detail pages.

### Key concerns

* setup readiness;
* formula status;
* price status;
* costing status;
* links between related workflows;
* support context;
* whether users understood what action was required next.

This likely produced the direction implemented in tasks 187–189.

---

## Task 187 — Finished Product Detail Polish

**Title status:** Best-known title reconstructed
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

Finished Product detail existed but did not yet function as a complete setup/review hub.

### Goal

Make the page answer:

* Is this product properly configured?
* Does it have a formula?
* Is its cost available?
* Does it have a sell price?
* Is its margin ready?
* What should the user do next?

### UI additions

* readiness cards;
* formula context;
* sell-price context;
* margin context;
* links to:

  * formula;
  * sell prices;
  * Meal Margins;
  * Component Costs;
* contextual support.

### Important product-language decision

The page should use food/manufacturing language rather than exposing internal schema concepts.

### Source-of-truth

The detail page reads:

* Internal Item;
* formula version;
* costs;
* sell prices;
* margins.

It does not duplicate those records.

### Future direction

This detail-hub pattern later informed richer module dashboards and cross-record navigation.

---

## Task 188 — Component Formula Builder Polish

**Title status:** Best-known title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

The component builder worked but needed clearer component-first workflow and blocker messaging.

### Improvements

* component-first list/detail;
* readiness cards;
* clearer “Add input line” flow;
* cost blockers linked to relevant cost screens;
* support context;
* more understandable input/output language.

### Important operational context

Components represent things Clean Eats produces before final assembly, such as:

* sauce;
* cooked rice;
* prepared meat;
* mash;
* cooked vegetables.

### Costing relationship

Component formula lines use:

* internal-item inputs;
* quantities;
* units;
* approved prices;
* output quantity/unit.

### Future limitation

Production routes and method steps were not yet fully embedded into the formula builder.

---

## Task 189 — Finished Product Formula Builder Polish

**Title status:** Best-known exact title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Improvements

* clearer finished-product/SKU language;
* grouped input selector:

  * Components;
  * Ingredients;
  * Packaging;
* line-cost hints;
* editable loss notes;
* output quantity/unit helper;
* links to:

  * Components;
  * costs;
  * Sell Prices;
  * Meal Margins.

### Validation

* block self-reference;
* block unsupported cross-tenant references;
* block unsupported input types;
* preserve tenant ownership.

### Important design principle

The UI should guide the user toward completion without hiding blockers.

### Future work

* production method;
* route;
* area assignments;
* version activation workflow;
* bulk import from formula collection sheets.

---

## Task 190 — Costing Snapshot Plan

**Title status:** Best-known title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Original problem

Live costs change over time.

Without snapshots, the platform could not answer:

* What did this component cost when reviewed?
* What did this meal margin look like at a prior point?
* Which supplier prices and formula lines were used?

### Plan decision

Introduce immutable snapshots for:

* component cost;
* finished-product cost;
* margin context.

### Source-of-truth distinction

Live calculations are current views.

Snapshots are historical evidence.

### Explicit rule

Later prices and formulas must not recalculate old snapshots.

---

## Task 191 — Costing Snapshot Schema Foundation

**Title status:** Best-known title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 034

### Tables

* `costing_snapshots`;
* `costing_snapshot_lines`.

### Requirements

* organisation-scoped;
* immutable historical values;
* blocker reasons;
* source references;
* created-by metadata;
* archive rather than destructive delete.

### Permissions

View/manage concepts were added following existing conventions.

### Important limitation

The schema stored historical calculations but did not guarantee every future costing method would be backward compatible.

The snapshot’s stored values are authoritative for that snapshot.

---

## Task 192 — Costing Snapshot UI and UOM Fix

**Title status:** Reconstructed from known task outcome
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Capabilities

* create component-cost snapshot;
* create finished-product cost/margin snapshot;
* recent history panels;
* snapshot detail;
* archive where authorised;
* store blocked snapshots.

### UOM problem discovered

Costing could fail when semantically compatible units differed:

* kg versus g;
* l versus ml;
* each aliases.

### Fix

A helper was introduced:

`lib/unit-conversions.ts`

### Safe conversions

* kg/g;
* l/ml;
* each/unit aliases.

### Explicitly blocked

Pack units such as:

* Box;
* Carton;
* Bunch;
* Bottle.

### Tested result

A Bolognese Sauce component-cost snapshot completed successfully:

* total cost approximately `2.1`;
* cost per output approximately `0.021`;
* Beef Trim input converted from a smaller metric quantity;
* old blocked snapshots remained historical.

### Important historical-integrity decision

Do not mutate old blocked snapshots after logic improves.

Create a new snapshot.

---

## Task 193 — Inventory Receiving Workflow Plan

**Title status:** Best-known title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Purpose

Plan receiving before adding schema and UI.

### Questions resolved

* What is the receipt header?
* What is the receipt line?
* When is a lot created?
* When is a movement created?
* How are held/rejected lines handled?
* What is editable before posting?
* What becomes immutable after posting?
* How does Supplier Invoice Intake relate?

### Key decision

Draft receipt lines are reviewable operational records.

Posted receipts create ledger consequences.

### Non-goal

Supplier invoice intake would not auto-post stock.

---

## Task 194 — Inventory Stock Movement Schema Foundation

**Title status:** Best-known title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 035

### Tables introduced

* `inventory_receipts`;
* `inventory_receipt_lines`;
* `inventory_lots`;
* `stock_movements`.

### Permissions

Included concepts such as:

* `inventory_receipts.view`;
* `inventory_receipts.create`;
* `inventory_receipts.post`;
* `inventory_receipts.manage`;
* `inventory_lots.view`;
* `inventory_lots.manage`;
* `stock_movements.view`;
* `stock_movements.create`;
* `stock_movements.manage`.

### Source-of-truth model

* receipts record receiving event;
* lots record traceable stock context;
* movements record quantity change;
* Stock On Hand would later aggregate movements.

### Tenant integrity

The schema used organisation-scoped relationships and RLS.

### Important future consideration

Unique constraints preventing multiple receipt lots/movements for one receipt line were considered later during posting RPC hardening.

---

## Task 195 — Goods Inwards Receiving UI v1

**Title status:** Exact/best-known
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Routes

* `/goods-inwards`;
* `/goods-inwards/new`;
* `/goods-inwards/[id]`.

### Workflow

1. Create draft receipt.
2. Add receipt lines.
3. Select:

   * item;
   * location;
   * quantity;
   * unit;
   * lot details;
   * QA status.
4. Review blockers.
5. Post.
6. Create lot and movement.
7. Lock posted receipt.

### Line handling

* `needs_conversion` blocks;
* `blocked` conversion blocks;
* `rejected` QA blocks;
* `hold` creates on-hold lot;
* `passed` or `not_checked` creates available lot.

### Initial implementation limitation

Posting used sequential TypeScript writes.

This meant a theoretical partial-write risk if:

* lot insert succeeded;
* movement insert failed;
* receipt update failed.

### Manual test

A receipt containing 30kg was posted and produced:

* one inventory lot;
* one stock movement.

### Source-of-truth rule

Posted receipt lines are not later edited to correct stock.

Future adjustment/reversal workflows write new ledger records.

---

## Task 196 — Supplier Invoice to Receiving Plan

**Title status:** Best-known exact title
**Confidence:** CONFIRMED FROM PROJECT CONTEXT

### Purpose

Plan how invoice evidence becomes a draft operational receipt.

### Key principle

Purchase-document review and receiving are separate workflows.

### Proposed relationship

`purchase_document_line_id` links a receipt line back to commercial evidence.

### Included

* eligibility rules;
* linked/unlinked line distinction;
* default location;
* skipped-line reasons;
* existing receipt links.

### Excluded

* automatic posting;
* automatic stock;
* altering the invoice;
* forcing all manual receipt lines to have invoice evidence.

---

## Task 197 — Supplier Invoice to Receiving v1

**Title status:** Exact/best-known
**Confidence:** CONFIRMED FROM OUR CONVERSATION

### UI

Purchase-document detail gained a Goods Inwards panel showing:

* eligible lines;
* skipped lines;
* default stock location;
* existing linked receipts;
* Create Goods Inwards draft action.

### Created records

* `inventory_receipts.purchase_document_id`;
* `inventory_receipt_lines.purchase_document_line_id`.

### Important preservation rule

Receiving edits must not remove the invoice-source link.

### Tested example

Cammaroto invoice:

* purchase document reference `SI-00025954`;
* one invoice-linked line;
* one manually added line;
* later posted as two lots and movements.

### Misunderstanding resolved

The two lines looked duplicated, but the manual line was intentionally separate and lacked `purchase_document_line_id`.

### Future work

* UOM conversion;
* purchase-order matching;
* variance;
* receiving QA;
* duplicate-detection improvements.

---

## Task 198 — Production Batch Planning Plan

**Title status:** Reconstructed
**Confidence:** ARCHITECT INFERENCE

Before schema task 199, production planning requirements were formalised.

### Planned model

* production areas;
* production plans;
* plan lines;
* planned batches;
* batch inputs.

### Key decision

Do not consume stock yet.

Create planning records first.

### Rationale

Production planning could be reviewed by Clean Eats before committing to complex lot allocation and stock-consumption rules.

---

## Task 199 — Production Batch Planning Schema and UI Foundation

**Title status:** Reconstructed from known completion
**Confidence:** CONFIRMED FROM PROJECT CONTEXT
**Migration:** 036

### Schema

* `production_areas`;
* `production_plans`;
* `production_plan_lines`;
* `production_batches`;
* `production_batch_inputs`.

### UI

* `/production-plan`;
* `/production-plan/new`;
* `/production-plan/[id]`.

### Capabilities

* draft plans;
* output lines;
* formula attachment;
* costing-snapshot context;
* readiness;
* batch header creation;
* approval;
* cancellation;
* archive.

### Problem found during manual review

Blocked lines initially exposed batch creation.

### Correction

* hide/disable create action;
* server action rejects invalid statuses;
* only `planned` or `ready` lines proceed.

### Limitation

No:

* stock reservation;
* material allocation;
* production issue movement;
* production output movement;
* completed quantity;
* yield variance.

### Important future architect warning

Do not interpret `production_batch_inputs` existing in schema as proof that inventory consumption is live.

---

# Tasks 200–212 — Original architect’s final roadmap and Inventory hardening sequence

---

## Task 200 — Phase 1 Operational Review Pack

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Purpose

Pause feature accumulation and assess:

* what was operational;
* what was scaffold;
* what lacked integration;
* what needed task planning;
* what Clean Eats could test.

### Documents created

Known examples:

* `docs/200-phase-1-operational-review-pack.md`;
* `docs/201-250-next-roadmap.md`;
* `docs/task-prompt-template-201-plus.md`.

### Prompt requirements formalised

Every substantial task should include:

* scope controls;
* Admin impact;
* Support impact;
* cross-module impact;
* source-of-truth;
* dummy cleanup;
* migration reporting;
* checks;
* commit message.

### Important later lesson

A roadmap document is only useful if task prompts and context documents remain synchronised.

---

## Task 201 — Phase 2 Module Integration Map

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Goal

Map the placeholder/future modules into the existing real foundation.

### Modules

* QA;
* Logistics;
* Reports;
* CRM.

### Decisions

* each module should reference existing operational records;
* no duplicate supplier/item/inventory records;
* Reports should remain readers;
* QA should eventually connect to receipts, lots and production;
* Logistics should connect to production output and dispatch;
* CRM should remain lower priority until customer/order needs were clearer.

### Output

`docs/201-phase-2-module-integration-map.md`

### Later relevance

This task should have prevented roadmap drift, but later Codex recommendations led tasks 211–212 away from the approved QA start.

---

## Task 202 — UOM Conversion Foundation Plan

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Original problem

Safe metric conversions existed, but operational pack units still blocked:

* invoice prices;
* costings;
* receipt posting;
* future production quantities.

Examples:

* 1 bunch Basil = 100g;
* 1 carton Eggs = 180 each;
* 1 box Chicken = 10kg.

### Critical principle

Never guess pack conversions.

### Conversion levels planned

* global metric;
* tenant generic;
* internal-item-specific;
* supplier-item-specific.

### Precedence

1. supplier-item-specific;
2. internal-item-specific;
3. tenant generic;
4. global safe metric;
5. blocked.

### Planned rule metadata

* scope;
* item/supplier references;
* from/to units;
* quantities;
* factor;
* status;
* confidence;
* source;
* effective dates;
* review metadata;
* reverse-use permission.

### Reverse-conversion decision

Reverse conversion should be explicit through `allow_reverse`, not assumed.

### Cross-module implications

* Supplier Invoice Intake;
* approved prices;
* Goods Inwards;
* lots;
* movements;
* costings;
* formulas;
* production;
* QA;
* reports.

### Scope excluded

No schema, UI or calculation integration.

### Document

`docs/202-uom-conversion-foundation-plan.md`

### Commit

`Plan UOM conversion foundation`

---

## Task 203 — UOM Conversion Schema Foundation

**Confidence:** CONFIRMED FROM OUR CONVERSATION
**Migration:** 037

### Table

`public.uom_conversion_rules`

### Key fields

* `organisation_id`;
* `rule_scope`;
* `internal_item_id`;
* `supplier_id`;
* `supplier_item_id`;
* `from_unit`;
* `to_unit`;
* `from_quantity`;
* `to_quantity`;
* `conversion_factor`;
* `allow_reverse`;
* `status`;
* `confidence`;
* `source`;
* effective dates;
* review metadata;
* archive metadata.

### Rule scopes

* tenant;
* internal_item;
* supplier_item.

### Statuses

* draft;
* active;
* inactive;
* archived.

### Confidence values

* suggested;
* reviewed;
* verified.

### Source values

* manual;
* supplier_invoice;
* import;
* system.

### Permissions

* `uom_conversions.view`;
* `uom_conversions.create`;
* `uom_conversions.manage`.

### RLS model

* Platform Admin or authorised member can select;
* tenant create users create drafts only;
* manage permission updates/activates/archives;
* no DELETE policy.

### Uniqueness

Partial indexes prevented duplicate active open-ended rules by:

* tenant/unit pair;
* internal item/unit pair;
* supplier item/unit pair.

### Important security design

Composite tenant foreign keys were used where supported.

### Migration application

Luke applied the SQL manually.

Smoke checks confirmed:

* table exists;
* RLS true;
* expected columns;
* expected permissions;
* SELECT/INSERT/UPDATE policies;
* no DELETE policy.

### Commit

`Add UOM conversion schema foundation`

### Known limitation

`conversion_factor` was stored explicitly but not database-validated against `to_quantity / from_quantity`.

The planned UI would calculate it.

---

## Task 204 — UOM Conversion UI v1

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Routes

* `/uom-conversions`;
* `/uom-conversions/new`;
* `/uom-conversions/[id]`.

### Navigation

Products submenu gained:

* UOM Conversions.

### Capabilities

* list real rules;
* create draft;
* edit;
* activate;
* deactivate;
* archive;
* no delete.

### Form fields

* scope;
* item/supplier-item context;
* from quantity/unit;
* to quantity/unit;
* reverse flag;
* effective dates;
* notes.

### Server rules

* calculate conversion factor;
* enforce scope requirements;
* default manual source;
* create draft due RLS;
* use current profile;
* friendly duplicate-active-rule error.

### Support updates

* guide;
* troubleshooting;
* release note;
* support-ticket context.

### Manual test

A tenant rule was created:

* `1 Box = 10 Kg`;
* conversion factor `10`;
* status activated;
* source manual;
* confidence reviewed.

### Commit

`Add UOM conversion UI`

### Known limitation

Rules existed but were not yet consumed by:

* Goods Inwards;
* Costings;
* Invoice Intake;
* Production.

---

## Task 205 — Goods Inwards Line Edit and Posting Hardening

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Original need

The first Goods Inwards UI did not provide sufficient post-creation editing and pre-post review.

Users needed to correct:

* supplier;
* received date;
* reference;
* receipt notes;
* line item;
* location;
* quantities;
* units;
* lot;
* expiry/use-by/manufacture date;
* QA status;
* conversion status;
* notes.

### Header editing

Draft receipts could edit:

* supplier;
* received timestamp;
* supplier reference;
* notes.

Posted/cancelled records remained read-only.

### Line editing

Draft lines could edit receiving fields without removing:

`purchase_document_line_id`

### Preflight summary

The receipt detail displayed:

* active lines;
* ready lines;
* blocked lines;
* held lines;
* rejected lines;
* conversion-required lines;
* missing fields.

### Posting guards

* draft receipt only;
* active draft lines only;
* no rejected lines;
* no conversion blockers;
* no duplicate lot/movement indicators;
* no repost.

### Runtime bug discovered

Saving an inline line-edit form caused:

`ownerTask.run is not a function`

The build passed, proving compile success did not guarantee runtime correctness.

### First attempted fix

The form was moved into a stable helper component and `<details>` was removed.

The error persisted.

### Final architectural fix

Line editing moved to a dedicated route:

`/goods-inwards/[id]/lines/[lineId]/edit`

### Why that mattered

A single server-rendered form avoided repeated inline Server Action boundaries that triggered the Next.js development runtime error.

### UX consequence

Receipt detail became cleaner.

Each draft line used:

* Edit line link;
* separate cancel form.

### Manual validation

Luke confirmed:

* add line works;
* add second line works;
* dedicated edit save works;
* values persisted;
* valid kg/kg lines posted;
* receipt became read-only;
* lots and movements were created.

### Posted-page polish

Draft-only “Line blockers” warnings initially still appeared after posting.

These warnings included:

* line already posted;
* inventory lot already created.

They were hidden for posted receipts and replaced with calm messaging:

> Inventory lot and stock movement created. This line is posted and locked.

### SQL validation

A test receipt created:

* two lines;
* two lots;
* two movements;
* posted receipt status.

### Commit

`Harden goods inwards editing and posting`

### Lessons

* Avoid complex repeated inline Server Action forms where a dedicated route is safer.
* Runtime flows require authenticated browser testing.
* Posted records should not display pre-post blockers as errors.

---

## Task 206 — Goods Inwards Posting RPC Plan

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Problem

Task 205 still used sequential TypeScript writes.

### Risk

A partial failure could create:

* a lot without movement;
* a movement without final receipt status;
* some lines posted and others not.

### Proposed RPC

`public.post_inventory_receipt(p_receipt_id uuid)`

### Planned transaction

1. Lock receipt.
2. Validate tenant and permission.
3. Validate draft status.
4. Lock active lines.
5. Validate all lines before writes.
6. Create lots.
7. Create movements.
8. update lines;
9. update receipt;
10. return JSON result.

### Idempotency

* first call locks/posts;
* second waits;
* second sees posted;
* return `already_posted`;
* create no duplicate records.

### Security planning

Preferred:

* Security Invoker if RLS permitted all internal operations;
* constrained Security Definer if needed.

Required safeguards:

* fixed search path;
* no dynamic SQL;
* authenticated execute;
* public/anon revoked;
* explicit permission;
* no client-supplied organisation/profile identity.

### Output

`docs/206-goods-inwards-posting-rpc-plan.md`

### Commit

`Plan goods inwards posting RPC`

---

## Task 207 — Goods Inwards Posting RPC Foundation

**Confidence:** CONFIRMED FROM OUR CONVERSATION
**Migration:** 038

### Function

`public.post_inventory_receipt(p_receipt_id uuid) returns jsonb`

### Security

Implemented as:

* `SECURITY DEFINER`;
* `set search_path = public`;
* public/anon execute revoked;
* authenticated execute granted;
* explicit current profile check;
* membership/permission check;
* no service role;
* no dynamic SQL.

### Permission

Used:

`inventory_receipts.post`

### Validation

Blocked:

* missing receipt;
* unauthenticated user;
* no permission;
* non-draft receipt;
* no active lines;
* non-draft active lines;
* existing lot;
* missing item;
* missing location;
* invalid quantity;
* missing unit;
* conversion required;
* QA rejected;
* existing movements.

Allowed:

* `not_checked`;
* `passed`;
* `hold`;
* `not_required`;
* `converted`.

### Insert behaviour

For each line:

* create inventory lot;
* create stock movement;
* update line to received or held.

Then:

* mark receipt posted;
* set posted metadata.

### Return shape

Included:

* `ok`;
* status;
* receipt ID;
* posted metadata;
* line count;
* lot count;
* movement count;
* held/received count;
* skipped cancelled lines;
* message.

### App change

`postInventoryReceiptAction` switched from sequential writes to RPC.

### Migration testing

Luke applied migration 038.

Smoke checks confirmed:

* function exists;
* `prosecdef = true`;
* authenticated execute;
* permission exists.

### Live test

A receipt containing 200kg posted through the RPC.

It created:

* one received line;
* one lot;
* one posted inbound movement.

### Security Advisor warning

Supabase then reported:

> Signed-In Users Can Execute SECURITY DEFINER Function

### Decision

The warning was acknowledged and parked.

Reasoning:

* the authenticated role must execute the RPC;
* explicit tenant and permission checks exist;
* fixed `search_path`;
* no dynamic SQL;
* no anonymous execute;
* no trusted client organisation/profile IDs.

### Later hardening note

Review before external tenant onboarding.

### Commit

`Add goods inwards posting RPC`

---

## Task 208 — Stock On Hand Summary Plan

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Goal

Plan current inventory balances after receipt movements became reliable.

### Source-of-truth decision

`stock_movements` is the inventory quantity ledger.

Stock On Hand is derived.

### Base calculation

* direction `in` adds;
* direction `out` subtracts;
* only posted, non-archived movements;
* group by:

  * item;
  * location;
  * lot;
  * unit.

### Mixed units

Do not sum unlike units.

V1 should:

* group separately;
* display warning;
* avoid hidden conversion.

### QA/hold model

* available stock shown separately;
* held stock shown separately;
* physical = available + held where appropriate.

### Implementation recommendation

Start with direct server-side aggregation.

Do not add:

* summary table;
* materialised view;
* RPC

until volume requires it.

### UI plan

`/stock-on-hand`

### Permission plan

Reuse:

* `stock_movements.view`;
* optionally `inventory_lots.view`.

### Commit

`Plan stock on hand summary`

---

## Task 209 — Stock On Hand Summary UI v1

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Route

`/stock-on-hand`

### Navigation

Inventory submenu gained Stock On Hand.

### Data model

Server-side aggregation from:

* posted;
* non-archived;
* direction-adjusted stock movements.

### Grouping

* item;
* location;
* lot;
* unit.

### Quantities

* available;
* held;
* physical.

### Filters

* search;
* location;
* lot status;
* unit;
* view mode.

### Summary cards

Known test state showed:

* 4 items with stock;
* 6 stock rows;
* 2 locations;
* 0 held rows;
* 0 mixed-unit warnings.

### Links

* Stock Movements;
* Goods Inwards receipt where available;
* internal-item detail where safe.

### Empty-state direction

> No stock on hand yet. Post Goods Inwards receipts to create stock movement ledger rows.

### Support changes

* guide;
* troubleshooting;
* release note;
* ticket context.

### SQL validation

Aggregated rows matched the page.

No mixed-unit rows were returned in the test.

### Commit

`Add stock on hand summary UI`

### Known limitation

The query would become slower as movement volume increased.

Performance was intentionally deferred.

---

## Task 210 — Inventory Traceability Map Plan

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Goal

Plan backward and forward traceability.

### Current real chain

Supplier or manual receiving
→ Purchase Document evidence where linked
→ Goods Inwards receipt
→ Receipt line
→ Inventory lot
→ Stock movement
→ Stock On Hand.

### Future chain

Inventory lot
→ Production batch input
→ Production batch/output
→ Finished-product lot
→ Dispatch
→ Customer/order.

### Important honesty rule

Do not claim future production usage is connected.

### Recommended route

`/inventory-traceability`

### Data approach

Start with server-side TypeScript queries.

No view/RPC unless complexity requires it.

### Permission model

Require inventory read access.

Hide purchase-document evidence if user lacks permission rather than blocking all traceability.

### UI sections planned

* Source Evidence;
* Receiving Event;
* Inventory Lot;
* Ledger Movements;
* Stock On Hand;
* Future Production Usage.

### Commit

`Plan inventory traceability map`

---

## Task 211 — Inventory Traceability Map UI v1

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Important roadmap note

This was not the originally approved task 211.

The original roadmap intended task 211 to begin QA.

The task changed because the traceability plan recommended implementing the UI immediately.

This drift was not explicitly approved before execution.

### Route

`/inventory-traceability`

### Redirects

* `/bom-traceability`;
* `/inventory/bom-traceability`;

redirected to the real route.

### Data centre

`inventory_lots`

### Related records

* receipt;
* receipt line;
* movement;
* item;
* supplier;
* location;
* purchase evidence where permitted.

### Filters

* search;
* lot status;
* source type;
* supplier;
* location;
* view mode.

### Trace card sections

1. Source Evidence
2. Receiving Event
3. Inventory Lot
4. Ledger Movements
5. Stock On Hand Context
6. Future Production Usage

### Manual versus invoice-linked

Cards distinguished:

* manual receiving;
* invoice evidence linked.

### Dummy cleanup

The old sample-only BOM/Traceability page was removed from normal use through redirect.

### Validation

SQL showed:

* 6 traceable lots;
* 1 invoice-linked receipt line in the detailed query;
* remaining manual/unlinked lines;
* one movement per lot.

### Performance observation

First route load:

* total around 35 seconds;
* AppShell navigation context around 32 seconds;
* traceability data around 5.5 seconds.

Later load:

* total around 6 seconds;
* navigation context around 2.4 seconds;
* traceability around 3.5 seconds.

### Decision

Do not block the task for performance.

Performance would be addressed after more functionality existed.

### Commit

`Add inventory traceability map UI`

---

## Task 212 — Stock Adjustment/Reversal Plan

**Confidence:** CONFIRMED FROM OUR CONVERSATION

### Important roadmap note

This was also an extra inventory task that replaced the originally planned QA Schema task.

### Original need

Posted receipts and movements were immutable, but there was no safe correction path.

### Use cases

* wrong quantity received;
* damage;
* waste;
* stocktake gain/loss;
* duplicate receipt;
* mistaken receipt;
* opening balance;
* supplier return;
* future production reversal.

### Core decision

Do not edit historical movement rows.

Corrections create new movements.

### Concepts

#### Adjustment

A new movement changing balance:

* positive/in;
* negative/out.

#### Reversal

A movement negating an earlier movement.

#### Status-only correction

Potential hold/release or QA event without quantity change.

The plan considered whether status-only changes should use:

* zero-quantity movement;
* separate lot event;
* QA event.

### Preferred future model

* `stock_adjustments`;
* `stock_adjustment_lines`;
* transaction-safe posting RPC;
* stock movements remain ledger.

### Quantity rule

Movement quantity is positive.

Direction carries sign.

### Reversal rule

* reverse inbound with outbound;
* reverse outbound with inbound;
* link original movement;
* prevent duplicate or excessive reversal.

### Future route direction

* `/stock-adjustments`;
* `/stock-adjustments/new`;
* `/stock-adjustments/[id]`;
* possible movement-level reverse entry.

### Permissions planned

* view;
* create;
* post;
* manage;
* possible approve later.

### Deferred sequence proposed

* schema;
* UI;
* posting RPC;
* movement detail/reversal;
* diagnostics.

### Commit

`Plan stock adjustment and reversal workflows`

### Parked status

After roadmap review, implementation was parked.

Task 213 returned to QA rather than continuing adjustment schema.

---

# C3. Roadmap drift, detection and correction

**CONFIRMED FROM OUR CONVERSATION**

The approved sequence originally included:

* 210 — Inventory Traceability Map Plan;
* 211 — QA Module Deep Planning;
* 212 — QA Schema Foundation;
* 213 — Receiving QA Checks UI v1;
* 214 — QA Hold/Release Inventory Link.

Instead, the executed tasks became:

* 211 — Inventory Traceability Map UI v1;
* 212 — Stock Adjustment/Reversal Plan.

### Why drift happened

Codex/task plans recommended a sensible immediate next step.

The architect followed the recommendation without explicitly asking Luke to approve a roadmap change.

### Why this mattered

The tasks were useful, but the process violated a key governance rule:

> Codex may recommend sequence changes, but it does not own the roadmap.

### Correction decision

Resume QA as task 213.

Do not rename previously committed tasks.

Treat 211 and 212 as early-completed Inventory work.

### New standing rule

Never silently:

* renumber;
* reorder;
* combine;
* replace;
* pull forward

future tasks.

Ask Luke first.

---

# C4. Revised 213–250 roadmap prepared by the original architect

**CONFIRMED FROM OUR CONVERSATION**

Before handover, Luke and I revised the roadmap to prioritise making all visible modules useful for a Clean Eats review.

### QA

* 213 — QA Module Deep Planning
* 214 — QA Module Navigation + Scaffold v1
* 215 — QA Schema Foundation
* 216 — Receiving QA Checks UI v1
* 217 — QA Hold/Release Inventory Link

### Logistics

* 218 — Logistics Module Deep Planning
* 219 — Logistics Navigation + Scaffold v1
* 220 — Dispatch/Manifest Schema Foundation
* 221 — Dispatch Manifest UI v1

### Reports

* 222 — Reports Module Deep Planning
* 223 — Reports Navigation + Scaffold v1
* 224 — Inventory Reports v1
* 225 — Costing Reports v1
* 226 — Production Reports Plan

### CRM

* 227 — CRM Module Deep Planning
* 228 — CRM Navigation + Scaffold v1
* 229 — Customer/Account Schema Decision

### Tools

* 230 — Tools Module Deep Planning
* 231 — Tools Navigation + Scaffold v1
* 232 — Formula Import Plan
* 233 — Formula Import Schema/Parser Foundation
* 234 — Formula Import UI v1
* 235 — Item/Supplier Mapping QA Tool

### Production

* 236 — Production Module Review + Workspace Plan
* 237 — Production Areas UI v1
* 238 — Production Tasks Plan
* 239 — Production Tasks Schema Foundation
* 240 — Facility/iPad View v1

### Platform/Admin/Support

* 241 — Platform Admin Tenant Health v1
* 242 — Platform Admin Module Diagnostics
* 243 — Support + Help Centre Module Guide Pass
* 244 — Audit Log Business Events Plan
* 245 — Audit Log Business Events v1

### Staff/demo phase

* 246 — Phase 1 Staff Testing Pack
* 247 — Staff Feedback Capture Workflow
* 248 — Phase 1 Bug Bash and Fix Sprint
* 249 — Phase 1 Demo Readiness Pack
* 250 — Phase 2 Build Roadmap Reset

### Strategic intent

The aim was not to finish every module deeply.

The aim was to ensure:

* expected workspaces exist;
* fake content is removed;
* basic functionality exists;
* module purpose is visible;
* Luke can conduct a meaningful Clean Eats review.

### Later status

**POSSIBLY OUTDATED**

The second architect later changed or expanded this roadmap as real QA and Logistics work exposed missing tasks such as Carrier Configuration.

Current roadmap must be verified against repository context.

---

# C5. Handover to the second architect

**CONFIRMED FROM OUR CONVERSATION**

### Why the handover occurred

The original thread had become extremely long and slow.

Luke experienced:

* lag;
* interrupted streaming;
* concern that the chat could freeze;
* fear of losing project direction.

### Handover goals

Preserve:

* product story;
* architecture;
* task state;
* migrations;
* domain rules;
* Codex prompt discipline;
* roadmap correction;
* parked items;
* collaboration style.

### Major limitation recognised later

The handover preserved major architecture but missed:

* smaller UI behaviours;
* route preferences;
* loading states;
* detailed reasoning;
* conversational operational knowledge;
* some product feel and intent.

This recognition led directly to the current dossier request.

---

# C6. Collaboration workflow established with Codex

**CONFIRMED FROM OUR CONVERSATION**

The working cycle became:

1. Architect creates exact Codex prompt.
2. Luke sends prompt to Codex.
3. Codex implements.
4. Luke sends Codex summary back.
5. Architect reviews.
6. Architect provides:

   * exact correction prompt, or
   * browser tests, or
   * SQL checks.
7. Luke performs manual validation.
8. Architect approves commit.
9. Architect gives exact commit message.
10. Proceed to next approved task.

### Important preference

Do not merely say:

> Ask Codex to fix this.

Provide the ready-to-paste correction prompt.

### Testing principle

* build success is not runtime proof;
* authenticated browser tests matter;
* migrations require SQL smoke checks;
* large migration files may be reviewed through uploaded file plus checksum;
* exact failure paths should be tested.

### Commit discipline

Do not recommend commit before:

* migration applied where required;
* smoke checks passed;
* high-risk runtime path manually tested;
* unexpected UI state reviewed.

---

# C7. Checks and pnpm fallback convention

**CONFIRMED FROM OUR CONVERSATION**

Codex prompts should try:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

If pnpm stalls due the known shim/network issue:

```bash
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
git diff --check
```

### Additional rule

Do not repeatedly retry pnpm.

### `.next/types` issue

TypeScript may report missing generated files before build.

Correct sequence:

1. run build;
2. rerun typecheck.

### Rationale

The fallback prevents Codex from wasting time or incorrectly reporting failure because the package-manager shim stalled.

---

# C8. Migration reporting convention

**CONFIRMED FROM OUR CONVERSATION**

For normal-sized migrations, Codex should paste:

`FULL SQL MIGRATION CONTENTS`

Luke should be able to apply SQL directly from the response.

### Later refinement

**CONFIRMED FROM PROJECT CONTEXT**

For very large migrations, such as task 215’s 2,000-plus-line QA migration, the exact uploaded file plus:

* line count;
* SHA-256;
* architect review

became a more practical mechanism than forcing thousands of lines through chat.

### Important distinction

This later exception should not become an excuse to hide ordinary migrations.

---

# C9. Documentation discipline

**CONFIRMED FROM OUR CONVERSATION**

Every numbered task should normally create:

`docs/<task-number>-<slug>.md`

Tasks should update relevant:

* README;
* `docs/CODEX_PROJECT_CONTEXT.md`;
* roadmap;
* earlier task docs if later decisions supersede or clarify them;
* support content when user-facing behaviour changes;
* release notes when appropriate.

### Known risk

Later tasks may change behaviour without updating prior task documents, causing repository documentation to contradict itself.

### Later recommendation

A repository-wide documentation and module-consistency audit should verify:

* every task has docs;
* roadmap is current;
* migration status is accurate;
* fake content references are removed;
* parked work remains parked;
* route and module documentation matches implementation.

---

# End of Part 2

Part 3 will begin:

# PART D — MODULE-BY-MODULE PRODUCT AND ARCHITECTURE HISTORY

It will cover, in dedicated sections:

1. Dashboard / Home
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
12. Platform Admin
13. Support / Help Centre

For each module, Part 3 will document:

* purpose;
* source records;
* workspaces;
* UI direction;
* Clean Eats context;
* last-known maturity;
* limitations;
* deferred capabilities;
* risks;
* end-to-end integration role.

# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 3 — Module-by-module product and architecture history

This part continues the dossier structure requested in the historical extraction brief. 

---

# PART D — MODULE-BY-MODULE PRODUCT AND ARCHITECTURE HISTORY

---

# D1. Dashboard / Home

## Why the module exists

**CONFIRMED FROM OUR CONVERSATION**

The Dashboard exists to provide a cross-business operational view of the tenant.

It should eventually answer questions such as:

* What is happening today?
* What is blocked?
* What needs attention?
* What production is planned?
* What stock is low?
* What QA work is due?
* What receiving or dispatch work is outstanding?
* Where should a manager click next?

The Dashboard is not intended to be a decorative landing page or a collection of generic SaaS metrics.

It should become the operational control centre for the business.

---

## What problem it solves

Clean Eats information is naturally spread across:

* suppliers;
* products;
* formulas;
* pricing;
* inventory;
* production;
* QA;
* logistics;
* reporting.

Without a cross-module view, a manager must open multiple systems or spreadsheets to understand the day.

The Dashboard should reduce that fragmentation by summarising real source records.

---

## Records it owns

**CONFIRMED FROM OUR CONVERSATION**

The Dashboard should own almost no operational records.

It may own:

* user-specific dashboard preferences in a future phase;
* saved layout configuration;
* dismissed informational notices;
* widget configuration.

These were not implemented during the original period.

---

## Records it reads

The Dashboard should read from:

* production plans;
* production batches;
* inventory movements;
* Stock On Hand;
* Goods Inwards;
* QA checks;
* holds;
* dispatch runs;
* supplier documents;
* formula readiness;
* costing blockers;
* support or system alerts where appropriate.

---

## What it must never duplicate

The Dashboard must not duplicate:

* stock quantities;
* QA status;
* production state;
* receipt state;
* dispatch state;
* formula readiness;
* support-ticket state.

Dashboard values are derived summaries and links to source records.

---

## Original UI direction

**CONFIRMED FROM OUR CONVERSATION**

The visual concept was a dense but organised control centre with:

* top summary cards;
* alert queues;
* quick actions;
* tables;
* progress bars;
* recent activity;
* operational exceptions;
* grid-style sections;
* restrained white, green and neutral colours.

The mockup direction included concepts such as:

* Meals Planned Today;
* Active Recipes;
* Low Stock Items;
* QA Checks Due;
* Production Progress;
* On-Time Deliveries;
* Waste versus Target;
* Production Today;
* Low Stock / Reorder;
* Pending QA Checks;
* Delivery / Dispatch.

These were directional examples, not approved fake metrics.

---

## Important design principle

The Dashboard should become richer only as the underlying modules become real.

The sequence should be:

1. Build source modules.
2. Add real operational records.
3. Add reliable derived queries.
4. Build dashboard widgets from those sources.
5. Avoid placeholder numbers.

---

## Last-known maturity during the original period

**CONFIRMED FROM PROJECT CONTEXT**

The Dashboard had real summary data in some areas but remained partly foundational.

Known data helpers included:

* dashboard summary;
* products dashboard data;
* costings dashboard data;
* production dashboard data;
* inventory locations.

It was functional but slow.

---

## Performance issue

**CONFIRMED FROM OUR CONVERSATION**

Dashboard and shell queries were taking several seconds.

Examples included:

* dashboard summary around 8 seconds;
* multiple module dashboard helpers around 6 seconds;
* AppShell navigation context above 10 seconds in some requests.

The decision was to defer optimisation until more operational functionality existed.

---

## Known limitations

* not all visible modules had real data;
* QA and Logistics were not mature;
* alerts were limited;
* production consumption/output was not connected;
* home dashboard did not yet reflect the full visual mockup;
* some dashboard blocks still needed honest empty states;
* query performance was poor.

---

## Deferred capabilities

* tenant-configurable dashboard;
* user-specific widget layout;
* cross-module alerts;
* low-stock thresholds;
* overdue QA;
* dispatch readiness;
* production progress;
* supplier delivery performance;
* trend charts;
* facility/site filtering;
* mobile dashboard optimisation.

---

## Risks future architects should avoid

* creating a second source of truth for operational status;
* showing fake metrics;
* aggregating incompatible units;
* querying every module serially;
* building charts without enough data;
* making the Dashboard too dense for a new tenant;
* hiding operational blockers behind vanity cards.

---

## End-to-end role

The Dashboard should eventually present the full chain:

Supplier and product readiness
→ receiving
→ stock
→ production
→ QA
→ dispatch
→ reports and exceptions.

---

# D2. Inventory

## Why the module exists

**CONFIRMED FROM OUR CONVERSATION**

Inventory exists to control the physical stock and its history.

It connects:

* incoming goods;
* stock locations;
* inventory lots;
* stock movements;
* current balances;
* traceability;
* purchasing context;
* future production consumption;
* future stock adjustments.

---

## What problem it solves

Clean Eats needed more than a spreadsheet quantity.

Inventory needed to answer:

* What arrived?
* From which supplier?
* Which item?
* Which lot?
* When?
* Where is it stored?
* How much remains?
* Is it available or held?
* What movements changed the balance?
* What operational record caused each movement?
* Can it be traced back to commercial evidence?

---

## Records Inventory owns

**CONFIRMED FROM OUR CONVERSATION**

Inventory owns:

* inventory receipts where Goods Inwards is treated as the receiving workspace inside Inventory;
* inventory receipt lines;
* inventory lots;
* stock locations;
* stock movements;
* future stock adjustment events;
* future transfers;
* future stocktake events.

There is some naming nuance:

* Goods Inwards is the operational receiving workspace.
* Inventory is the module-level owner of physical-stock records.

---

## Records Inventory reads

Inventory reads:

* suppliers;
* supplier catalogue items;
* internal items;
* purchase documents;
* purchase document lines;
* UOM rules;
* QA hold state;
* future production inputs/outputs;
* future dispatch allocation.

---

## What Inventory must never duplicate

Inventory must not duplicate:

* supplier invoice content;
* approved supplier price records;
* product master records;
* formulas;
* production plans;
* QA checks;
* customer orders.

Inventory references those records.

---

## Workspaces discussed

**CONFIRMED FROM OUR CONVERSATION**

Current or historically discussed Inventory workspaces included:

* Goods Inwards;
* Stock On Hand;
* Traceability;
* Batch Receiving;
* Stock Locations;
* Stock Movements;
* Purchasing;
* BOM / Traceability in an earlier scaffold;
* Stock Adjustments;
* Stocktake;
* Transfers;
* Expiry;
* Quarantine/Hold.

Not all were implemented.

---

## Workspaces implemented during the original period

### Goods Inwards

Real draft/edit/post workflow.

### Stock On Hand

Read-only derived balances.

### Traceability

Inbound lot and movement traceability.

### Stock Locations

Real create/edit foundation.

### Stock Movements

Real recent ledger.

### Batch Receiving

**POSSIBLY OUTDATED**

A workspace existed in navigation, but its exact operational depth remained limited.

### Purchasing

Scaffold or foundation only during the original period.

---

## Goods Inwards architecture

### Receipt header

Represents the receiving event.

Fields included concepts such as:

* supplier;
* received timestamp;
* supplier reference;
* notes;
* source purchase document;
* status;
* posting metadata.

### Receipt line

Represents a reviewed incoming stock line.

It includes:

* internal item;
* location;
* received quantity/unit;
* inventory quantity/unit;
* conversion status;
* lot;
* expiry/use-by/manufacture date;
* QA status;
* purchase-document-line source;
* status.

### Draft versus posted

Draft:

* editable;
* cancellable;
* no stock created.

Posted:

* locked;
* lots created;
* movements created;
* corrections handled later through new ledger records.

---

## Inventory lot model

Inventory lots provide:

* traceable stock identity;
* supplier context;
* receipt-line relationship;
* lot number;
* expiry/use-by/manufacture date;
* QA context;
* status.

### Important nuance

During the early implementation, lot quantity was not necessarily stored as a single authoritative field.

Current balance is derived from movements.

The lot supplies traceability and classification context.

---

## Stock movement model

**CONFIRMED FROM OUR CONVERSATION**

Stock movements are the append-oriented quantity ledger.

Core concepts:

* item;
* location;
* lot;
* source type;
* source ID;
* movement type;
* direction;
* quantity;
* unit;
* status;
* time;
* actor.

Inbound receipt movements used:

* type `receipt`;
* direction `in`;
* status `posted`.

---

## Stock On Hand model

Stock On Hand is derived from posted, non-archived movements.

Grouping initially included:

* item;
* location;
* lot;
* unit.

### Important rule

Do not sum incompatible units.

### Availability

* available;
* held;
* physical.

The exact later hold integration evolved after task 212 and should be verified against current schema.

---

## Traceability architecture

Inventory Traceability used the lot as the centre of the inbound chain.

It connected:

* supplier/manual receiving;
* purchase document evidence;
* receipt;
* line;
* lot;
* movement;
* current balance.

### Honest limitation

Production consumption and dispatch were shown as future boundaries, not fabricated.

---

## Original Clean Eats expectations

Inventory needed to support:

* Cool Room;
* Freezer;
* Dry Store;
* Kitchen;
* Prepack;
* Packing;
* Goods Inwards;
* Dispatch;
* Hold;
* Waste.

The warehouse team would need:

* receiving;
* lot details;
* locations;
* stock movement history;
* holds;
* expiry awareness;
* purchasing context.

---

## Important UI decisions

* Goods Inwards is an Inventory workspace.
* Posted receipts are read-only.
* Preflight blockers should be clear.
* Draft-only blockers should disappear after posting.
* Receipt lines should link to related evidence.
* Stock On Hand should be read-only.
* Traceability should distinguish manual receiving from invoice-linked receiving.
* Historical records should stay visible after referenced supplier/carrier/configuration records are archived.
* Dedicated edit routes are acceptable where inline actions are unstable.

---

## Known limitations at the original handover

* no stock adjustment UI;
* no stocktake;
* no location transfer;
* no production issue/output movements;
* no UOM-rule integration into Goods Inwards;
* no barcode scanning;
* no expiry alerts;
* no automatic replenishment;
* no lot allocation;
* no recall-grade forward trace;
* QA hold/release not operational;
* no purchasing workflow;
* performance was slow.

---

## Deferred capabilities

* Stock Adjustment and Reversal;
* stocktake;
* transfers;
* supplier returns;
* quarantine;
* waste;
* barcode;
* lot allocation;
* FEFO;
* reorder rules;
* purchase orders;
* production issue;
* production output;
* recall reporting;
* expiry report;
* inventory valuation.

---

## Risks future architects should avoid

* editing historical movements;
* treating Stock On Hand as manually editable;
* changing purchase documents when receiving is edited;
* losing invoice linkage;
* summing incompatible units;
* inventing lot quantity separately from ledger;
* allowing repost;
* auto-posting from Supplier Invoice Intake;
* letting Platform Admin bypass tenant rules without review.

---

## End-to-end role

Supplier invoice evidence
→ Goods Inwards
→ receipt line
→ inventory lot
→ stock movement
→ Stock On Hand
→ future production issue
→ future production output
→ future dispatch.

---

# D3. Products

## Why the module exists

Products is the master-data and formula foundation of EveryBatch.

It defines:

* who supplies items;
* what items are called internally;
* what type of item each is;
* how components are made;
* how finished products are assembled;
* how items relate to invoices, inventory, costing and production.

---

## What problem it solves

Clean Eats information originally existed through:

* supplier descriptions;
* internal terminology;
* recipe names;
* component names;
* meal names;
* packaging names.

The same real thing could be described differently in different sources.

Products creates canonical operational identity.

---

## Records Products owns

**CONFIRMED FROM OUR CONVERSATION**

Products owns:

* suppliers;
* supplier aliases;
* supplier catalogue items;
* internal items;
* supplier-item mappings;
* formula versions;
* formula lines;
* item metadata;
* UOM conversion rules in the Products area, though UOM rules also affect other modules.

---

## Records Products reads

Products may read:

* approved prices;
* costing snapshots;
* stock;
* production readiness;
* invoice observations;
* sell prices.

---

## What Products must never duplicate

Products should not duplicate:

* current stock balance;
* inventory lots;
* supplier invoice documents;
* production plans;
* QA checks;
* sales orders.

---

## Workspaces

**CONFIRMED FROM OUR CONVERSATION**

* Suppliers;
* Ingredients;
* Packaging;
* Components;
* Recipes;
* Finished Products;
* UOM Conversions.

Earlier names may have included:

* Meals;
* Products;
* Internal Items.

---

## Suppliers

### Purpose

Manage canonical supplier identity.

### Capabilities

* list;
* create;
* edit;
* detail;
* aliases;
* catalogue context;
* invoice relationship;
* price context.

### Important boundary

A supplier item is not automatically an internal item.

Mappings connect them.

---

## Ingredients and Packaging

These are filtered views of `internal_items`.

### Benefits

* one shared item identity;
* consistent search;
* simpler formula references;
* simpler inventory references;
* fewer duplicate tables.

### Potential downside

The UI must hide irrelevant fields by type.

A packaging item and ingredient may need different future metadata.

---

## Components

Components represent produced intermediate outputs.

Examples:

* Bolognese Sauce;
* Italian Herb Chicken Breast;
* Cooked Rice;
* Sweet Potato Mash.

### Key fields/workflows

* output quantity/unit;
* formula version;
* formula lines;
* cost;
* readiness;
* production method future;
* area/task relationships future.

---

## Recipes

**CONFIRMED FROM PROJECT CONTEXT**

The Recipes workspace existed but remained less mature.

Fake sample rows were removed or relabelled.

### Architectural ambiguity

“Recipe” could mean:

* component formula;
* finished-product formula;
* production method;
* cooking instruction;
* customer-facing recipe.

The platform increasingly used “formula” for structured composition.

The Recipes workspace needed later clarification.

---

## Finished Products

Finished Products are sellable or dispatchable outputs.

Examples:

* meals;
* SKUs;
* boxed products;
* meal variants.

### UI direction

Finished Product detail became a setup hub showing:

* formula readiness;
* cost readiness;
* sell price;
* margin;
* related links.

---

## UOM Conversions

UOM rules live with master-data configuration because they describe how specific items or supplier items translate between purchase and internal units.

### Important principle

They are interpretation rules, not formula lines or inventory movements.

---

## Original Clean Eats expectations

Luke expected the system to eventually support:

* all raw ingredients;
* all packaging;
* batch components;
* full meal formulas;
* supplier-item mapping;
* production methods;
* routes;
* production areas;
* formula collection imports.

---

## Data collection

A dedicated workbook was created for Clean Eats containing:

* Component/Batch Formulas;
* Finished Product Formulas;
* Production Methods/Routes;
* Production Areas;
* examples and notes.

This workbook was designed to gather the details needed after the system structure existed.

---

## Important UI decisions

* use operational names, not raw schema language;
* show readiness;
* link blockers to the right workspace;
* separate components from finished products;
* group formula inputs;
* show output quantity and unit clearly;
* avoid fake sample products;
* hide unsupported action controls;
* provide direct related-record links.

---

## Known limitations

* limited allergen/nutrition model;
* no full product specification;
* no production method builder;
* no formula import;
* no label artwork;
* no shelf-life specification;
* no customer-order model;
* Recipes workspace ambiguity;
* UOM rules not integrated into operational calculations;
* no product revision approval flow beyond formula versioning.

---

## Deferred capabilities

* allergens;
* nutrition;
* labels;
* product specifications;
* certifications;
* packaging hierarchies;
* yield;
* formula import;
* bulk updates;
* product approval;
* customer-specific products;
* multi-site formula variation;
* production methods.

---

## Risks future architects should avoid

* creating separate item identity in every module;
* hard-coding Clean Eats products;
* flattening components into finished-product formulas;
* treating supplier item names as canonical;
* editing published formula history;
* allowing self-reference;
* hiding unit blockers;
* turning Recipes into a duplicate formula system.

---

## End-to-end role

Supplier item
→ internal item
→ formula input
→ component
→ finished product
→ cost
→ production plan
→ future produced lot.

---

# D4. Costings

## Why the module exists

Costings exists to calculate and preserve product economics.

It answers:

* What does this ingredient cost?
* What does this component cost?
* What does this meal cost?
* What price is it sold for?
* What margin results?
* How did the cost change over time?
* Why is a costing blocked?

---

## What problem it solves

Clean Eats supplier prices change.

Formulas contain:

* raw ingredients;
* intermediate components;
* packaging;
* different units;
* output yields.

A simple spreadsheet can become:

* stale;
* difficult to audit;
* inconsistent;
* difficult to connect to invoice evidence.

---

## Records Costings owns

Costings owns:

* approved supplier prices or the costing-side approved pricing model;
* finished-product sell prices;
* costing snapshots;
* costing snapshot lines;
* calculated current cost views;
* margin calculations.

There is some cross-module ownership nuance:

Approved supplier prices originate from Supplier Invoice Intake evidence but are used as costing source records.

---

## Records Costings reads

* suppliers;
* supplier items;
* internal items;
* formulas;
* formula lines;
* UOM conversion helpers/rules;
* price observations;
* sell prices;
* tax/currency settings.

---

## What Costings must never duplicate

Costings must not duplicate:

* supplier invoices;
* formula composition;
* product master data;
* stock quantities;
* production output;
* customer orders.

---

## Workspaces

* Ingredient Costs;
* Packaging Costs;
* Component Costs;
* Sell Prices;
* Meal Margins;
* Price History.

Earlier structure may have included:

* Ingredient Costs;
* Packaging Costs;
* Component Costs;
* Meal Margins;
* Price History.

Sell Prices was later added explicitly.

---

## Current cost model

Current cost is derived from:

* active formula;
* formula lines;
* approved price;
* quantity;
* safe unit conversion;
* output quantity;
* loss/yield logic where supported.

---

## Approved prices

Supplier invoice observations do not automatically become approved prices.

A reviewed approval layer is important because invoice parsing may be:

* incomplete;
* noisy;
* mapped incorrectly;
* unit-incompatible.

---

## Meal Margins

Meal Margins used:

* finished-product cost;
* current active sell price;
* tax mode;
* formula readiness.

### Conservative blocker model

The page should block or clearly warn when:

* no formula;
* missing supplier price;
* unit conversion missing;
* unsupported currency;
* invalid tax mode;
* inactive sell price;
* draft formula.

---

## Costing snapshots

Snapshots preserve:

* values;
* source lines;
* blocker state;
* created time;
* historical evidence.

### Immutable-history rule

Do not recalculate old snapshots.

A later correction produces a new snapshot.

---

## Original Clean Eats expectations

Luke wanted the platform to replace or improve an existing costing system and make prices easier to maintain from invoices.

The Costings module should eventually support:

* meal margins;
* historical price changes;
* margin changes;
* missing prices;
* component cost changes;
* supplier comparison;
* possibly wholesale versus retail pricing.

---

## UI direction

The Products & Costings concept mockup showed:

* active ingredients/components/meals;
* average food cost;
* low-margin alerts;
* ingredient table;
* selected ingredient details;
* component/batch recipe summary;
* meal costing summary;
* price changes and margin alerts.

The implemented pages were less dense but heading toward that direction.

---

## Known limitations

* GST/tax extraction conservative;
* no full landed cost;
* no freight allocation;
* no labour/overhead allocation;
* no waste allocation;
* no channel-specific pricing depth;
* no UOM database-rule integration;
* no automated price approval;
* limited supplier comparison;
* no cost forecast.

---

## Deferred capabilities

* labour;
* overhead;
* freight;
* utilities;
* waste/yield;
* standard versus actual cost;
* variance;
* multi-channel sell prices;
* wholesale pricing;
* promotion pricing;
* scenario costing;
* target margin;
* price approval workflow.

---

## Risks future architects should avoid

* inventing a cost;
* rewriting snapshots;
* approving parsed prices automatically;
* mixing formula ownership into Costings;
* silently converting pack units;
* hiding blocked-cost reasons;
* treating current cost as historical evidence.

---

## End-to-end role

Supplier invoice
→ observation
→ approved price
→ formula calculation
→ component cost
→ finished-product cost
→ sell price
→ margin
→ immutable snapshot.

---

# D5. Production

## Why the module exists

Production coordinates what needs to be made, where, when, by whom and from which inputs.

It should eventually connect:

* demand;
* formulas;
* batch sizes;
* production areas;
* tasks;
* stock availability;
* QA;
* outputs;
* traceability.

---

## What problem it solves

Clean Eats production is not a single action.

It involves:

* bulk preparation;
* meat and vegetable preparation;
* cooking;
* cooling;
* prepack;
* packing;
* labels;
* dispatch preparation;
* different rooms and teams.

The existing Streamlit production report encoded significant logic but remained separate from the broader platform.

---

## Records Production owns

* production areas;
* production plans;
* plan lines;
* production batches;
* production batch inputs;
* future production tasks;
* future production outputs;
* future production events.

---

## Records Production reads

* finished products;
* components;
* formulas;
* costing snapshots;
* Stock On Hand;
* locations;
* QA requirements;
* staff/users;
* future orders/demand.

---

## What Production must never duplicate

Production should not duplicate:

* formulas;
* product identity;
* inventory lots;
* stock balances;
* QA checks;
* customer records;
* dispatch runs.

---

## Workspaces

* Production Report;
* Production Plan;
* Production Areas;
* Production Tasks;
* Facility/iPad View.

Earlier or future concepts included:

* batch board;
* production schedule;
* input requirements;
* stock availability;
* release;
* stock issue;
* output;
* yield;
* variance.

---

## Production Plan

Real foundation existed.

### Capabilities

* create plan;
* add planned outputs;
* attach formula;
* attach cost snapshot;
* readiness/blocker;
* create planned batch header;
* approve/cancel/archive.

### Limitation

It did not consume inventory.

---

## Production Areas

Schema existed.

Operational UI was limited during the original period.

Clean Eats examples included:

* Kitchen;
* Prepack;
* Packing;
* Meat/Veg Prep;
* Dispatch.

Exact current production-area set requires repository verification.

---

## Production Tasks

The workspace existed but was not fully operational in the original period.

The intended model included:

* assigned area;
* related plan/batch;
* assigned staff/team;
* due time;
* status;
* tablet interaction;
* QA relationship;
* event history.

---

## Facility/iPad View

The concept was a simplified production-floor interface.

Requirements discussed included:

* large touch targets;
* area-specific views;
* tasks;
* batches;
* quick status updates;
* minimal typing;
* shared-device identity;
* permission control.

---

## Streamlit production-report influence

**CONFIRMED FROM PROJECT CONTEXT**

The existing production-report tool included detailed operational logic such as:

* bulk recipes;
* meat/veg prep;
* prepack;
* cooked batch requirements;
* rice production;
* ingredient preparation;
* meal counts.

Examples of recipe/process adjustments discussed elsewhere included:

* rice cooked in oven trays using 2kg rice + 3kg water;
* premixed chicken thigh;
* sweet potato mash;
* salsa;
* Napoli sauce;
* lamb batch logic.

These should not be assumed to be implemented in EveryBatch unless verified.

They remain valuable operational references.

---

## Original Clean Eats expectations

Production should eventually support:

* production day planning;
* formula-based input generation;
* batch-size calculation;
* production areas;
* staff tasks;
* tablet workflow;
* QA checks;
* input consumption;
* output stock;
* yield;
* waste;
* completion status;
* planned versus produced reporting.

---

## UI direction

The Production & QA mockup showed:

* meals planned;
* lines running;
* QA checks due;
* production completion;
* waste;
* plan table;
* task board;
* prep/bulk costing;
* QA check panel;
* yield and waste;
* activity;
* alerts.

The final product should combine planning, tasks and QA context without duplicating source records.

---

## Known limitations

* no input generation;
* no stock allocation;
* no stock availability check;
* no stock issue;
* no output stock;
* no completion;
* no actual yield;
* no waste movement;
* no task schema in original period;
* no tablet workflow;
* no production QA;
* no demand/order integration.

---

## Deferred capabilities

* input requirement generation;
* stock availability;
* release;
* lot allocation;
* production issue movement;
* output movement;
* yield;
* waste;
* completion;
* variance;
* task assignment;
* iPad board;
* production QA;
* demand integration.

---

## Risks future architects should avoid

* assuming planned batch equals completed batch;
* creating stock consumption without lot rules;
* duplicating formulas;
* inventing production output;
* mixing tasks and batch status;
* building tablet UI without identity controls;
* treating existing Streamlit logic as automatically canonical.

---

## End-to-end role

Demand or plan
→ planned output
→ formula
→ generated input requirements
→ stock availability
→ released batch
→ lot-based stock issue
→ production task/QA
→ output lot
→ dispatch.

---

# D6. QA

## Historical status during the original architect period

**CONFIRMED FROM OUR CONVERSATION**

QA was visible as a module but remained largely placeholder/scaffold during the original period.

The approved original roadmap intended QA to begin after Inventory Traceability planning.

Roadmap drift delayed that start.

---

## Why the module exists

QA exists to record, control and trace:

* receiving checks;
* production checks;
* daily checks;
* cleaning;
* temperatures;
* CCP monitoring;
* holds;
* release;
* non-conformance;
* corrective action;
* evidence;
* review;
* approval.

---

## Records QA should own

**CONFIRMED FROM OUR CONVERSATION**

QA should own:

* templates;
* versions;
* sections;
* items/questions;
* check instances;
* results;
* reviews;
* approvals;
* amendments;
* holds;
* hold events;
* future non-conformances;
* future corrective actions;
* future QA documents/evidence metadata.

---

## Records QA must read

* suppliers;
* purchase documents;
* receipts;
* receipt lines;
* items;
* inventory lots;
* locations;
* production plans;
* batches;
* areas;
* tasks;
* dispatch records.

---

## What QA must never duplicate

* receipt details;
* inventory quantity;
* product master;
* stock movement history;
* production plan data;
* supplier invoice content.

QA links decisions and checks to those records.

---

## Original proposed workspaces

Before task 213 planning, proposed QA workspaces included:

* QA Dashboard;
* Daily Checks;
* Receiving Checks;
* Production Checks;
* Pre-Operational Checks;
* Cleaning Checks;
* Temperature Logs;
* HACCP / CCP;
* Hold & Release;
* Non-Conformance;
* Corrective Actions;
* QA Documents / Records.

The later QA planning consolidated some of these.

---

## Original architect direction

**CONFIRMED FROM OUR CONVERSATION**

The QA module should use a shared template/check engine rather than bespoke tables for every checklist.

Concepts such as:

* temperatures;
* cleaning;
* pre-op;
* receiving;
* production;
* HACCP

should often differ through:

* template category;
* trigger;
* result type;
* linked operational record.

---

## Receiving QA direction

Receiving QA was intended as the first real workflow.

It should connect:

* receipt;
* line;
* supplier;
* item;
* lot;
* purchase evidence;
* future hold.

Important boundary:

Goods Inwards owns the receipt.

QA records the check and decision.

---

## Hold/release direction

The initial controlled scope was later narrowed to full inventory-lot hold/release.

The original principle already existed:

* QA owns hold decision/event;
* Inventory owns lot and availability representation;
* no rewriting historical movement;
* release preserves history;
* partial holds can wait.

---

## Production QA direction

Future checks included:

* pre-op;
* ingredient verification;
* allergen changeover;
* cook temperature;
* cooling;
* weight;
* metal detection;
* seal;
* label;
* batch release;
* cleaning.

These were not implemented in the original period.

---

## Original Clean Eats context

Cettina and Luisa were identified as QA stakeholders.

However, Luke intended to build a strong base before asking staff to define every detail.

Staff input would later validate:

* actual checklists;
* frequencies;
* approvals;
* critical limits;
* corrective actions;
* room ownership.

---

## UI direction

QA should eventually show:

* due checks;
* overdue;
* failed;
* needs review;
* active holds;
* open NC;
* corrective actions;
* recent activity;
* operational queues.

The UI should support tablet use.

---

## Known original limitations

At handover:

* no QA schema;
* no real QA records;
* no hold integration;
* no check workflow;
* no NC/CA;
* no production QA;
* placeholder routes;
* broad early permissions only.

---

## Later project state

**CONFIRMED FROM PROJECT CONTEXT — NOT DIRECTLY DEVELOPED BY ME**

Tasks 213–217 later introduced:

* deep QA planning;
* navigation/scaffold;
* QA schema foundation;
* Receiving QA UI;
* hold/release integration.

Current details require repository verification.

---

## Risks future architects should avoid

* hard-coding Clean Eats checklists globally;
* duplicating receipt/lot data;
* letting checklist failure automatically block all stock;
* allowing check completer to approve sensitive results;
* rewriting completed checks;
* editing hold history;
* claiming certification;
* overbuilding enterprise CAPA too early.

---

## End-to-end role

Receipt or production event
→ QA check
→ result
→ review/approval
→ hold or operational decision
→ Stock On Hand/Traceability visibility
→ report and audit.

---

# D7. Logistics

## Historical status during the original period

Logistics existed as a module but was largely placeholder when the original handover was created.

The original revised roadmap planned:

* Logistics deep planning;
* navigation/scaffold;
* dispatch/manifest schema;
* manifest UI.

---

## Why the module exists

Logistics coordinates movement of finished goods from production into delivery or wholesale dispatch.

It should eventually cover:

* dispatch runs;
* manifests;
* carriers;
* services;
* exports;
* delivery issues;
* zones;
* wholesale;
* residential;
* Detrack;
* historical delivery evidence.

---

## Records Logistics should own

* dispatch runs;
* dispatch deliveries/items;
* manifests;
* manifest lines/snapshots;
* carriers;
* carrier services;
* carrier export configuration;
* delivery issues;
* future shipment/export events.

---

## Records Logistics reads

* finished products;
* production outputs;
* customer accounts;
* orders;
* delivery addresses;
* QA release state;
* stock allocation;
* delivery dates.

---

## What Logistics must never duplicate

* customer master records;
* product master;
* inventory ledger;
* production records;
* QA decisions;
* order source truth.

It may store immutable dispatch snapshots where necessary.

---

## Clean Eats operational context

**CONFIRMED FROM PROJECT CONTEXT**

Clean Eats logistics includes:

* residential dispatch;
* wholesale dispatch;
* Detrack;
* carrier manifests;
* cartons;
* different brands/order sources;
* Clean Eats Australia;
* Clean Eats Wholesale;
* Made Active;
* Elite Meals;
* potentially Cold Xpress / DK / Meal Cart or other providers.

Some of these were present in separate Python tools and should not be assumed to be implemented in EveryBatch unless verified.

---

## Existing external tools

The Detrack manifest tool included:

* brand/order-source rules;
* carton capacity;
* meal weight;
* carrier formatting;
* export files.

This operational logic influenced Logistics planning.

---

## Original proposed workspaces

* Logistics Dashboard;
* Dispatch Runs;
* Manifests;
* Carrier Exports;
* Detrack;
* Delivery Zones;
* Wholesale Dispatch;
* Residential Dispatch;
* Delivery Issues.

Later planning consolidated the visible submenu.

---

## UI direction

The Inventory/Purchasing/Logistics mockup included:

* receive goods;
* create purchase order;
* print labels;
* stocktake;
* generate manifest;
* stock value;
* low stock;
* open purchase orders;
* deliveries today;
* pending dispatch;
* stock tables;
* Goods Inwards;
* purchase requirements;
* recent purchase orders;
* Logistics/Dispatch;
* cartons/shipping rules;
* stock movement;
* inventory health.

This was directional.

---

## Original limitations

At original handover:

* no Logistics schema;
* no dispatch run;
* no manifest;
* no carrier configuration;
* no order import;
* no real Detrack integration;
* no stock allocation;
* no delivery issue workflow.

---

## Later project state

**CONFIRMED FROM PROJECT CONTEXT — NOT DIRECTLY DEVELOPED BY ME**

Later tasks added:

* Logistics planning;
* navigation/scaffold;
* dispatch/manifest schema;
* manifest workflow/UI;
* carrier configuration foundation.

A real dispatch and manifest were reportedly created.

Migration numbers around 042–043 were applied in later work.

---

## Important later-lost UI details

QA and Logistics initially used longer nested routes such as:

* `/logistics/manifests`;
* `/logistics/dispatch-runs`.

Earlier modules used shorter canonical routes.

A future coordinated route pass should consider:

* short canonical routes;
* redirects from nested routes;
* support context;
* bookmarks;
* host routing.

QA and Logistics also needed visible loading states.

---

## Risks future architects should avoid

* claiming carrier integration when only configuration exists;
* storing carrier credentials prematurely;
* hard-coding providers globally;
* duplicating customer/order records;
* dispatching held stock;
* implying live tracking;
* generating fake manifest records;
* allowing archived carrier choices in new dispatches;
* mixing order intake and logistics ownership.

---

## End-to-end role

Order/demand
→ production output
→ QA release
→ stock allocation
→ dispatch run
→ manifest
→ carrier export
→ delivery result
→ issue/traceability.

---

# D8. CRM

## Why the module exists

CRM was included to support customer/account relationships that may later be needed for:

* wholesale customers;
* contacts;
* sales leads;
* delivery accounts;
* support-linked organisations;
* future customer complaints.

---

## Historical uncertainty

**CONFIRMED FROM OUR CONVERSATION**

CRM was deliberately lower priority.

The exact scope was not yet settled.

Luke and I questioned whether a full sales CRM belonged in Phase 1.

---

## Records CRM should own

Potential future records:

* customer accounts;
* contacts;
* leads;
* opportunities;
* account notes;
* relationship status.

---

## Records CRM reads

* orders;
* dispatch;
* support tickets;
* invoices;
* customer complaints;
* wholesale relationships.

---

## What CRM must never duplicate

* tenant organisations;
* Auth users;
* support tickets;
* delivery orders;
* supplier records;
* logistics snapshots.

---

## Proposed workspaces

* CRM Dashboard;
* Customers;
* Contacts;
* Leads;
* Accounts.

Potential later workspaces:

* Opportunities;
* Activities;
* Complaints;
* Orders.

---

## Original architect recommendation

Start lightweight.

Determine first whether the real need is:

* wholesale customer master;
* delivery account context;
* contacts;
* lead tracking.

Avoid building a generic Salesforce-like system.

---

## Known limitations

At original handover:

* placeholder only;
* no customer schema;
* no order source;
* no marketing leads;
* no complaint workflow;
* no Logistics integration.

---

## Deferred capabilities

* wholesale accounts;
* contacts;
* lead pipeline;
* demo requests;
* onboarding pipeline;
* customer complaints;
* account-specific pricing;
* customer-specific products;
* dispatch links;
* support links.

---

## Risks future architects should avoid

* duplicating Auth profiles as CRM contacts;
* treating suppliers as customers;
* building generic CRM before operational need;
* mixing marketing leads with active tenant records;
* creating an order system inside CRM without source definition.

---

## End-to-end role

Marketing lead
→ qualified prospect
→ onboarding
→ customer account
→ future orders
→ dispatch
→ support/complaints.

---

# D9. Reports

## Why the module exists

Reports should convert operational source records into useful review, compliance and decision outputs.

It should answer:

* What happened?
* What changed?
* What is blocked?
* What requires action?
* How are costs, stock, production, QA and dispatch trending?

---

## Records Reports owns

Reports should own almost no operational records.

It may own:

* saved report definitions;
* scheduled exports;
* generated immutable report files;
* report snapshots where justified.

These were not implemented in the original period.

---

## Records Reports reads

* inventory;
* receipts;
* movements;
* Stock On Hand;
* lots;
* formulas;
* cost snapshots;
* production plans/batches;
* QA;
* logistics;
* suppliers;
* audit logs.

---

## What Reports must never duplicate

* inventory movements;
* receipt records;
* QA decisions;
* production state;
* pricing source records.

Reports are read models.

---

## Proposed workspaces

* Reports Dashboard;
* Inventory Reports;
* Receiving Reports;
* Stock Movement Reports;
* Expiry/Lot Reports;
* Costing Reports;
* Production Reports;
* QA Reports;
* Logistics Reports;
* Supplier Reports;
* Audit Reports.

---

## Original implementation priority

The revised roadmap placed Reports after QA and Logistics foundations.

Reason:

Reports are more useful when source workflows exist.

---

## Initial real report candidates

* receiving history;
* stock movement ledger;
* Stock On Hand;
* lots by expiry;
* held stock;
* price changes;
* snapshots;
* margin;
* blocked costing reasons;
* planned production;
* batch status.

---

## UI direction

* filters;
* date ranges;
* table views;
* export-like layouts;
* totals;
* exceptions;
* links to source records;
* no fake charts.

---

## Known limitations

At original handover:

* placeholder module;
* no reporting views;
* no exports;
* limited source data for QA/Logistics;
* no saved reports;
* no scheduled reporting.

---

## Risks future architects should avoid

* duplicating operational data;
* introducing stale summary tables without refresh rules;
* calculating incompatible unit totals;
* showing trends without historical data;
* creating “compliance reports” that imply certification.

---

## End-to-end role

Read operational source records
→ filter/aggregate
→ present tables, exceptions and history
→ link back to source.

---

# D10. Tools

## Why the module exists

Tools houses utility workflows that support setup, import, mapping, diagnosis or one-off operational transformations.

It should not become a dumping ground.

---

## Records Tools owns

Tools may own:

* import batches;
* import rows;
* validation results;
* mapping-review batches;
* export jobs;
* diagnostic jobs.

It should not own the underlying business records after application.

---

## Existing real tool

Supplier Invoice Intake was the main real Tools workflow during the original period.

Route:

`/purchase-documents`

---

## Proposed workspaces

* Supplier Invoice Intake;
* Data Imports;
* Formula Import;
* Item Mapping QA;
* Bulk Updates;
* Exports;
* Diagnostics.

---

## Formula Import

A future tool would import the Clean Eats formula workbook.

It should support:

* upload;
* parse;
* preview;
* validation;
* item mapping;
* formula validation;
* staging;
* approval;
* controlled apply.

### Important rule

Do not apply formulas automatically from an unchecked spreadsheet.

---

## Item/Supplier Mapping QA

A planned tool should show:

* supplier item;
* internal item;
* unit mismatch;
* conversion required;
* latest price;
* mapping status;
* approved/needs review.

---

## Original UI direction

Tools should present utilities clearly, with honest status:

* ready;
* requires review;
* blocked;
* not connected.

---

## Known limitations

At original handover:

* only Supplier Invoice Intake was truly operational;
* no Formula Import;
* no mapping QA tool;
* no bulk update;
* no diagnostics dashboard;
* no exports utility.

---

## Risks future architects should avoid

* making Tools own master data;
* bypassing operational validation;
* applying imports immediately;
* hiding parse errors;
* hard-coding file layouts globally;
* treating Tools as a miscellaneous module.

---

## End-to-end role

External data/file
→ staging
→ validation
→ mapping
→ controlled apply into source module.

---

# D11. Tenant Admin

## Why the module exists

Tenant Admin manages the organisation’s configuration and users.

It is distinct from Platform Admin.

---

## Workspaces

* Organisation Settings;
* Users;
* Modules;
* Integrations.

---

## Records Admin owns or manages

* organisation settings;
* memberships;
* role assignments;
* tenant module configuration;
* tenant integrations;
* tenant branding context where applicable.

---

## What Admin must never own

* Platform-wide tenant provisioning;
* global feature definitions;
* billing platform state;
* cross-tenant support;
* tenant operational records.

---

## Original expectations

Tenant administrators should be able to:

* manage users;
* manage roles/permissions through approved abstractions;
* view enabled modules;
* manage organisation settings;
* connect integrations later.

---

## Known limitations

* user invitation/onboarding incomplete;
* module management limited;
* integration pages mostly scaffold;
* no billing;
* no custom permission editor;
* no site/facility management;
* no full tenant branding management.

---

## UI direction

Admin should remain clear and less operational than day-to-day modules.

Sensitive actions require:

* explicit permissions;
* confirmation;
* audit;
* no accidental destructive changes.

---

## Risks future architects should avoid

* confusing Tenant Admin with Platform Admin;
* letting tenant admins access global tenants;
* exposing low-level feature flags without abstraction;
* deleting memberships without history;
* allowing broad permission escalation.

---

# D12. Platform Admin

## Why the module exists

Platform Admin is the operator console for EveryBatch itself.

It manages the SaaS platform, not the tenant’s daily manufacturing work.

---

## Records Platform Admin owns or manages

* tenant organisations;
* provisioning templates;
* feature definitions;
* module availability;
* tenant onboarding status;
* branding configuration;
* domains;
* future billing;
* support operations;
* diagnostics;
* system health.

---

## Records Platform Admin reads

Potentially:

* tenant configuration;
* module readiness;
* feature flags;
* support tickets;
* operational counts for diagnostics.

Access to full tenant operational content should be carefully governed.

---

## What Platform Admin must never become

* a duplicate tenant app;
* a hidden unrestricted operational editor;
* a source of tenant stock, QA or production truth;
* a reason to bypass tenant ownership.

---

## Workspaces implemented or planned

Implemented/foundation:

* Overview;
* Tenants;
* tenant detail;
* provisioning templates;
* New Tenant Wizard;
* onboarding checklist;
* Branding;
* Support Inbox.

Planned:

* tenant health;
* module diagnostics;
* audit;
* storage health;
* system warnings;
* billing;
* user readiness;
* domain readiness;
* release visibility.

---

## Tenant creation v1

Created:

* organisation;
* settings;
* branding;
* modules;
* feature flags.

Did not create:

* first Auth user;
* profile;
* membership;
* custom domain;
* billing;
* subscription.

---

## Original UI direction

* dedicated operator shell;
* grouped sidebar;
* route-aware header;
* account block;
* no tenant global search;
* clear tenant identity;
* less icon clutter;
* desktop collapse;
* mobile menu.

---

## Known issues

* mobile responsiveness poor;
* no complete first-admin onboarding;
* no billing;
* no domain management;
* no tenant suspension/archive workflow;
* diagnostics incomplete;
* platform read/write boundaries required later hardening.

---

## Parked security issue

Platform Admin read access to tenant operational records needed later review before external tenants.

---

## Risks future architects should avoid

* placing Platform Admin in tenant sidebar;
* granting unconditional tenant writes;
* mixing operator and tenant permissions;
* exposing tenant operational records without audit;
* provisioning half-created tenants without onboarding state;
* using Platform Admin as a shortcut around RLS.

---

## End-to-end role

Prospect/onboarding
→ tenant provisioning
→ modules/features
→ branding/domain
→ first admin
→ health/support
→ billing/suspension/archive.

---

# D13. Support / Help Centre

## Why the module exists

Support exists to help users understand and use EveryBatch and to report problems.

It is part of the SaaS platform, not an afterthought.

---

## Records Support owns

* support tickets;
* comments;
* events;
* attachments metadata;
* guide content;
* troubleshooting content;
* release notes.

---

## Records Support reads

* tenant identity;
* page/module context;
* user profile;
* support diagnostics;
* future entity references.

---

## What Support must never duplicate

* QA incidents;
* production tasks;
* inventory adjustments;
* logistics issues;
* tenant SOP documents.

Support may reference those records.

---

## Workspaces/routes

* Support home;
* Guides;
* Tickets;
* Contact;
* Release Notes;
* Troubleshooting.

Platform Admin:

* Support Inbox;
* Ticket Detail.

---

## Context-aware support

A major product decision was to prefill support context from:

* route;
* module;
* category;
* related entity where supported.

This improves support quality and reduces user effort.

---

## Ticket lifecycle

* waiting on support;
* waiting on customer;
* planned;
* resolved;
* closed;
* possibly open.

Customer and Platform comments influence status.

Internal notes do not.

---

## Guide discipline

User-facing workflows should update:

* guide;
* troubleshooting;
* release note;
* support context.

Planning-only tasks should document future impact but not publish release notes.

---

## Attachments

Schema foundation existed.

UI remained deferred.

---

## Known limitations

* no attachment upload/display;
* no email;
* no notifications;
* no SLA;
* no search across guides/tickets;
* no support access audit;
* no automatic diagnostics;
* no external customer portal beyond authenticated Support.

---

## Risks future architects should avoid

* making Support public by accident;
* exposing internal notes;
* broad storage access;
* treating ticket context as authorisation;
* mixing Help Centre with tenant QA documents;
* publishing release notes for non-user-facing schema work.

---

## End-to-end role

User encounters issue
→ opens contextual Help
→ reads guide/troubleshooting
→ creates ticket with route/module context
→ Platform Support investigates/replies
→ lifecycle preserved.

---

# End of Part 3

Part 4 will continue with:

# PART E — SMALL PRODUCT, UI AND BEHAVIOUR DECISIONS

This will include:

* route naming;
* short canonical routes;
* redirect behaviour;
* loading pages;
* action pending states;
* sidebar behaviour;
* module-parent clicks;
* mobile issues;
* collapsed navigation;
* page headers;
* table overflow;
* status colours;
* empty states;
* fake-data rules;
* wording conventions;
* support context;
* tenant branding;
* dashboard visual direction;
* smaller conversational preferences that may not have become formal tasks.

Part 4 will then continue into:

# PART F — CLEAN EATS OPERATIONAL CONTEXT

# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 4 — Small product/UI decisions and Clean Eats operational context

This part continues the requested dossier structure, focusing on the smaller design and workflow decisions most likely to be lost between architect chats, followed by the operational knowledge Luke supplied about Clean Eats. 

---

# PART E — SMALL PRODUCT, UI AND BEHAVIOUR DECISIONS

These decisions are important because they collectively define whether EveryBatch feels like one product or a series of unrelated CRUD screens.

Some were implemented. Others were discussed, deferred or only captured in later backlog notes.

---

## E1. Parent modules should open their own dashboard

**CONFIRMED FROM OUR CONVERSATION**

### Original problem

Some SaaS sidebars use:

* parent module item;
* then a duplicate child called Dashboard or Overview.

That creates unnecessary repetition.

### Preferred behaviour

Clicking the module name should open its module dashboard.

Examples:

* Inventory → Inventory dashboard;
* Products → Products dashboard;
* QA → QA dashboard;
* Logistics → Logistics dashboard.

### Why it matters

It keeps navigation:

* cleaner;
* easier to understand;
* more consistent;
* less cluttered.

### Status

Implemented in some modules.

Later QA and Logistics needed consistency review.

### Future architect warning

Do not add a child “Dashboard” submenu merely because a new module has multiple routes, unless there is a genuine navigation reason.

---

## E2. Workspace/submodule terminology

**CONFIRMED FROM OUR CONVERSATION**

### Decision

Use:

* Module;
* Workspace;
* Page.

Internally, “submodule” is acceptable in planning and development.

### Example

* Inventory = module;
* Goods Inwards = workspace;
* Receipt Detail = page.

### Why this mattered

“Page” understates the operational importance of major areas such as:

* Goods Inwards;
* Production Plan;
* Receiving Checks;
* Manifests.

“Workspace” better reflects an operational area where users perform a job.

---

## E3. Sidebar order should reflect operational flow

**CONFIRMED FROM OUR CONVERSATION**

The tenant sidebar was intentionally reordered over time.

Later approved order:

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

### Why Inventory moved near the top

Inventory became one of the most operationally real modules and is used daily by warehouse and production teams.

### Why Admin stays at the bottom

Admin is configuration, not daily operations.

### Why Platform Admin is absent

Platform Admin belongs to the EveryBatch operator console, not the tenant app.

---

## E4. Inventory submenu order

**CONFIRMED FROM OUR CONVERSATION**

A sensible Inventory workspace order became:

* Goods Inwards;
* Stock On Hand;
* Traceability;
* Batch Receiving;
* Stock Locations;
* Stock Movements;
* Purchasing.

### Rationale

The order broadly follows:

Receive
→ see current stock
→ trace it
→ manage locations/movements
→ purchase more.

### Later note

Stock Adjustments, Transfers and Stocktake were expected later.

---

## E5. Products submenu order

**CONFIRMED FROM PROJECT CONTEXT**

Products included:

* Suppliers;
* Ingredients;
* Packaging;
* Components;
* Recipes;
* Finished Products;
* UOM Conversions.

### Important nuance

UOM Conversions was placed under Products because it is a master-data interpretation rule, despite affecting Inventory and Costings.

### Risk

Do not create duplicate UOM configuration pages in Inventory and Costings.

---

## E6. Short canonical workspace routes

**CONFIRMED FROM OUR CONVERSATION**

### Earlier pattern

Stronger Phase 1 modules used short routes such as:

* `/goods-inwards`;
* `/stock-on-hand`;
* `/component-costs`;
* `/meal-margins`;
* `/production-plan`.

### Later inconsistency

Newer QA and Logistics workspaces used longer routes such as:

* `/logistics/manifests`;
* `/logistics/dispatch-runs`;
* nested QA routes.

### Preferred future direction

Introduce coordinated short canonical routes where appropriate.

For example:

* `/manifests`;
* `/dispatch-runs`;
* perhaps `/receiving-checks`.

Long nested module routes should redirect to canonical routes.

### Why it matters

* cleaner URLs;
* consistency;
* easier support references;
* better screenshots and training;
* simpler mental model.

### Status

Deferred.

### Important implementation warning

Do not change routes piecemeal.

A coordinated pass must preserve:

* bookmarks;
* redirects;
* Support context;
* tenant-domain routing;
* page titles;
* active navigation.

---

## E7. Host-specific route behaviour

**CONFIRMED FROM OUR CONVERSATION**

The same route can behave differently depending on host mode.

Examples:

### Central app

Tenant routes should send users to workspace selection.

### Platform Admin host

Tenant routes should redirect to `/platform`.

### Clean Eats tenant host

Tenant routes should work normally.

Platform routes should not expose operator functionality.

### Support host

Only authenticated Support routes should be available.

### Localhost

Development remains permissive.

### Small but important detail

Route aliases and canonical routes must not accidentally break host-mode protections.

---

## E8. Visible loading states

**CONFIRMED FROM OUR CONVERSATION**

### Original problem

Some route transitions appeared to do nothing while:

* AppShell context loaded;
* permissions loaded;
* module data loaded;
* server rendering completed.

This was particularly noticeable due current performance delays.

### Stronger existing pattern

Inventory, Products, Costings and Production showed visible loading states.

### Later gap

QA and Logistics did not consistently show them.

### Preferred behaviour

When the user clicks a module or workspace:

* the app shell remains visible;
* active navigation remains visible;
* the content area shows a clear loading state;
* the interface does not appear frozen.

### Design constraints

Loading UI must not:

* use fake records;
* imply real counts;
* show misleading placeholder data;
* remove the shell;
* shift layout excessively.

### Status

Deferred coordinated UI consistency task.

---

## E9. Server-action pending states

**CONFIRMED FROM OUR CONVERSATION**

### Problem

Buttons could appear unresponsive while a server action was running.

### Preferred behaviour

Create/edit/archive/post/generate actions should show:

* pending state;
* disabled duplicate submission;
* clear action label;
* success or error result;
* redirect or refreshed state.

### Examples

* Posting Goods Inwards should not look idle.
* Generating a manifest should show work is in progress.
* Saving a line should not invite repeated clicks.
* Creating a snapshot should give clear completion or blocker feedback.

### Future risk

Double-click protection should exist in both:

* UI;
* database or RPC where consequences are irreversible.

---

## E10. Action result tones

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch needs consistent visual language for:

* success;
* informational;
* warning;
* blocker;
* error.

### Suggested semantic meaning

#### Success

Action completed successfully.

#### Information

Context or explanation with no immediate problem.

#### Warning

User should review something, but action may remain possible.

#### Blocked

Action cannot proceed until a specific problem is resolved.

#### Error

Unexpected technical or validation failure.

### Example

After a receipt is posted, “lot already exists” is no longer a blocker. It should become calm read-only confirmation.

This exact issue was corrected in task 205.

---

## E11. Status wording consistency

**CONFIRMED FROM OUR CONVERSATION**

Status words should retain consistent operational meaning across modules.

Common statuses include:

* Draft;
* Active;
* Inactive;
* Archived;
* Planned;
* Ready;
* Blocked;
* Approved;
* Posted;
* Received;
* Held;
* Available;
* Rejected;
* Cancelled;
* Needs Review;
* Waiting on Support;
* Waiting on Customer;
* Resolved;
* Closed.

### Risk

The same colour or word should not mean different things in different modules without good reason.

### Future task

A full status-language and colour review was expected later.

---

## E12. Status badge consistency

**CONFIRMED FROM PROJECT CONTEXT**

A shared component existed:

`StatusBadge`

The intended direction was to use shared badge styling instead of one-off colour combinations.

### Important nuance

Theme colours may eventually be tenant-customisable, but status colours must remain semantically understandable.

A tenant brand colour should not make “Rejected” look the same as “Approved.”

---

## E13. Honest empty states

**CONFIRMED FROM OUR CONVERSATION**

### Standing rule

When no records exist, the page should explain:

* what this workspace does;
* why there are no records;
* what action creates them;
* whether the workflow is not yet connected;
* what permission is required.

### Good example

> No stock on hand yet. Post Goods Inwards receipts to create stock movement ledger rows.

### Bad example

A fake stock table with sample rows that appear to be Clean Eats data.

### Why it matters

Clean Eats staff must trust that visible operational data is real.

Future tenants must also understand setup state without assuming the product is broken.

---

## E14. Fake and sample data rules

**CONFIRMED FROM OUR CONVERSATION**

### Early project reality

Sample data helped visualise modules.

### Later rule

Once a workspace becomes operational or is touched during implementation:

* remove fake rows;
* replace with real data;
* or use an honest empty state.

### Exception

Explicit test data can exist if clearly identified and intentionally created for testing.

### Risk

Test data should not be presented as real Clean Eats history.

---

## E15. Honest integration language

**CONFIRMED FROM PROJECT CONTEXT**

Configuration does not imply integration.

Examples:

* Configuring a carrier does not mean its API is connected.
* A Carrier Exports page does not mean export files exist.
* A Detrack workspace does not mean Detrack integration is live.
* A QA scaffold does not mean compliance workflows exist.
* Production batch-input schema does not mean stock is consumed.

### Preferred wording

* Configured;
* Foundation ready;
* Not connected yet;
* Future integration;
* Manual workflow;
* No exports generated.

### Avoid

* Connected;
* Live;
* Synced;
* Tracking;
* Certified;
* Automated

unless genuinely true.

---

## E16. Page-header consistency

**CONFIRMED FROM OUR CONVERSATION**

Pages should use a consistent header system containing:

* page title;
* concise description;
* primary action;
* secondary help/context action where useful;
* status or entity context where relevant.

### Detail pages

Should clearly identify:

* record type;
* record name/reference;
* status;
* parent workspace;
* key next action.

### Risk

Avoid giant duplicate heroes inside an already titled AppShell.

Platform Admin subpages had this issue and were later simplified.

---

## E17. Route-aware browser titles

**CONFIRMED FROM PROJECT CONTEXT**

Browser titles use:

`Page Title - EveryBatch`

Examples:

* `Stock On Hand - EveryBatch`;
* `Inventory Traceability - EveryBatch`;
* `UOM Conversions - EveryBatch`.

### Why it matters

* browser tab clarity;
* support screenshots;
* bookmarks;
* product polish.

---

## E18. Back-navigation and parent links

**CONFIRMED FROM OUR CONVERSATION**

Record-detail pages should offer understandable routes back to:

* list/workspace;
* parent module;
* related source record.

Examples:

* Goods Inwards line edit → receipt detail;
* receipt detail → Goods Inwards list;
* lot traceability → receipt;
* snapshot → component/finished product;
* support ticket → list.

### Risk

Do not rely only on browser Back for operational navigation.

---

## E19. Related-record links

**CONFIRMED FROM OUR CONVERSATION**

Cross-module visibility should be implemented through links, not duplicate records.

Examples:

* purchase document → Goods Inwards draft;
* receipt line → purchase document evidence;
* lot → receipt;
* lot → Stock Movements;
* finished product → formula;
* finished product → Sell Prices;
* finished product → Meal Margins;
* component → input costs;
* support ticket → related route.

### Design principle

The user should be able to follow the operational chain without losing source ownership.

---

## E20. Search and filter expectations

**CONFIRMED FROM OUR CONVERSATION**

Operational lists should support filters when record counts justify them.

Common filters:

* search;
* status;
* location;
* supplier;
* item;
* date;
* lot;
* source type;
* archived state.

### Rules

* URL query parameters are preferred where practical.
* Filters should survive refresh/bookmarking.
* Do not build complex client state unnecessarily.
* Empty filter results should explain the active filter state.

---

## E21. Pagination

**CONFIRMED FROM PROJECT CONTEXT**

Support lists and other growing lists began using pagination.

### Future expectation

Any operational list expected to grow should avoid loading all records indefinitely.

Examples:

* purchase documents;
* stock movements;
* support tickets;
* QA checks;
* manifests;
* audit logs.

### Current limitation

Some early pages still queried all relevant rows.

---

## E22. Table wrapping and overflow

**CONFIRMED FROM OUR CONVERSATION**

Tables must not destroy the page layout on smaller screens.

Future consistency work should inspect:

* horizontal overflow;
* long supplier names;
* long item names;
* invoice references;
* notes;
* status badges;
* action columns.

### Mobile direction

Some dense tables may need stacked record cards rather than a compressed table.

---

## E23. Mobile responsiveness

**CONFIRMED FROM OUR CONVERSATION**

### Tenant app

Mobile support mattered but was not the immediate priority during foundation work.

### Platform Admin

Mobile behaviour was noticeably weaker and needed later review.

### Expected future work

* sidebar drawer;
* page-header stacking;
* action stacking;
* form layout;
* table-to-card transformation;
* tap targets;
* overflow;
* modal sizing.

### Decision

Do not derail operational module construction for broad responsive polish yet.

---

## E24. Collapsed sidebar behaviour

**CONFIRMED FROM PROJECT CONTEXT**

When collapsed:

* show icons only;
* tenant icon rather than full tenant logo;
* preserve tooltips;
* keep active state visible;
* avoid compressed labels.

### Earlier backlog

Collapsed sidebar icon consistency and submenu behaviour required later polish.

---

## E25. Tenant branding treatment

**CONFIRMED FROM OUR CONVERSATION**

The tenant shell should show:

* EveryBatch platform identity;
* tenant logo and name;
* clear distinction between platform and tenant.

### Expanded sidebar

Use full tenant logo where available.

### Collapsed sidebar

Use tenant icon.

### Future Admin need

Tenant branding should eventually support separate uploads for:

* full logo;
* icon;
* login image;
* email branding.

---

## E26. EveryBatch branding treatment

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch should appear consistently across:

* login;
* workspace selector;
* favicon;
* Platform Admin;
* support;
* tenant app shell;
* future marketing website.

### Brand direction

* dark green/navy;
* lime accent;
* white and neutral surfaces;
* modern food-manufacturing identity;
* not generic enterprise blue;
* not playful consumer-food branding.

---

## E27. Tenant logo versus EveryBatch logo

**CONFIRMED FROM OUR CONVERSATION**

The tenant’s logo identifies the workspace.

EveryBatch identifies the software.

Neither should replace the other.

### Risk

Avoid a tenant-branded experience that completely hides EveryBatch, because:

* support;
* product identity;
* future cross-workspace navigation;
* commercial consistency

still require the platform brand.

---

## E28. Workspace switching

**CONFIRMED FROM PROJECT CONTEXT**

The user/account area should allow access to:

* current tenant workspace;
* other tenant workspaces if available;
* Platform Admin if authorised.

### UI decision

Avoid a separate redundant workspace-selector row if the account area already handles it.

---

## E29. Account controls

**CONFIRMED FROM OUR CONVERSATION**

The account block should sit at the bottom-left of the sidebar.

It should include:

* user name/email;
* workspace switch options;
* sign out;
* Platform Admin where allowed;
* collapse control below.

### Why

This mirrors modern SaaS patterns and avoids cluttering the top navigation.

---

## E30. Global search interaction

**CONFIRMED FROM PROJECT CONTEXT**

* header search icon;
* Cmd/Ctrl+K;
* grouped results;
* debounce;
* permission-aware results;
* minimum query length.

### Later expectation

Search should grow with new modules.

Do not expose records the user cannot open.

---

## E31. Help menu behaviour

**CONFIRMED FROM OUR CONVERSATION**

Header Help should open a dropdown or clear Support links.

Potential actions:

* Help Centre;
* Guides;
* Troubleshooting;
* Contact Support;
* Create Ticket;
* Release Notes.

### Page context

Support links should carry:

* current route;
* module;
* category;
* entity where safe.

---

## E32. Notification icon

**CONFIRMED FROM PROJECT CONTEXT**

A notification icon existed as a placeholder/foundation.

It should not imply a complete notification system.

### Future needs

* QA due;
* support reply;
* approval;
* production blocker;
* dispatch issue.

### Risk

Do not display fake unread counts.

---

## E33. Form grouping

**CONFIRMED FROM OUR CONVERSATION**

Long forms should use logical sections.

Examples:

### Goods Inwards

* receipt details;
* source;
* line details;
* lot/dates;
* QA;
* notes.

### Formula

* output;
* inputs;
* loss;
* notes.

### Carrier configuration

* identity;
* service;
* status;
* advanced metadata future.

### Why

Operational users should not face one large undifferentiated form.

---

## E34. Permission-aware action visibility

**CONFIRMED FROM OUR CONVERSATION**

View-only users should see read-only pages without fake disabled controls.

Examples:

* no New button;
* no Edit action;
* no Archive button;
* no Post action.

### Why

A disabled button can imply:

* temporary state;
* missing data;
* hidden requirement.

If the user never has authority, hiding it is usually clearer.

---

## E35. Read-only historical states

**CONFIRMED FROM OUR CONVERSATION**

After important lifecycle transitions, pages should clearly switch to read-only.

Examples:

* posted receipt;
* archived UOM rule;
* published formula version;
* completed snapshot;
* cancelled dispatch;
* completed QA check.

### Read-only copy

Explain what future correction workflow should be used.

Example:

> Posted receipts are locked. Future corrections will use stock adjustments or reversals.

---

## E36. Soft archive over delete

**CONFIRMED FROM OUR CONVERSATION**

Operational and configuration records generally should use:

* inactive;
* archived;
* cancelled

rather than hard delete.

Examples:

* UOM rules;
* carriers;
* services;
* receipts;
* formulas;
* snapshots.

### Why

Historical records may still reference them.

### Risk

Do not hide archived references from historical detail pages.

---

## E37. Historical names must continue resolving

**CONFIRMED FROM PROJECT CONTEXT**

An archived:

* carrier;
* service;
* supplier;
* item;
* location

may still be referenced by historical records.

New selectors should hide archived choices.

Historical records should still display the name.

---

## E38. No automatic destructive cascades for operational history

**CONFIRMED FROM OUR CONVERSATION**

Foreign-key cascades may be appropriate for tenant deletion or tightly owned configuration children, but not where operational history should survive normal lifecycle changes.

### Risk

Do not make archiving a parent delete:

* receipts;
* movements;
* dispatch history;
* QA results.

---

## E39. Action naming

**CONFIRMED FROM OUR CONVERSATION**

Prefer explicit actions:

* Create Goods Inwards draft;
* Post receipt;
* Activate rule;
* Archive service;
* Generate manifest;
* Approve plan.

Avoid ambiguous labels such as:

* Submit;
* Save changes

when a lifecycle consequence matters.

---

## E40. “Create” versus “Generate”

**ARCHITECT INFERENCE based on established usage**

Use “Create” when users are directly creating an operational record.

Use “Generate” when the system derives a record or file from existing records.

Examples:

* Create dispatch run;
* Generate manifest;
* Create snapshot;
* Generate input requirements.

---

## E41. “Post” as an irreversible ledger action

**CONFIRMED FROM OUR CONVERSATION**

“Post” should mean:

* reviewed;
* consequential;
* creates ledger or committed records;
* not casually editable afterward.

Used for:

* Goods Inwards receipt;
* future stock adjustment;
* possible future production issue/output.

### UI consequence

Posting needs:

* preflight;
* clear explanation;
* database transaction;
* double-click safety.

---

## E42. Dashboard quick actions

**CONFIRMED FROM OUR CONVERSATION**

Module dashboards should eventually expose useful permission-aware shortcuts.

Examples:

### Inventory

* New Goods Inwards;
* View Stock On Hand;
* Create Purchase Order future;
* Start Stocktake future.

### QA

* Start Receiving Check;
* View Active Holds;
* Create Manual Check.

### Logistics

* New Dispatch Run;
* Generate Manifest;
* Configure Carriers.

### Production

* New Production Plan;
* View Today’s Tasks;
* Manage Areas.

### Rule

Quick actions should not appear if the workflow is not implemented.

---

## E43. Module dashboard cards should lead somewhere useful

**CONFIRMED FROM OUR CONVERSATION**

Cards are not decoration.

A summary card should link to:

* filtered list;
* blocker queue;
* relevant workspace.

Example:

“3 Active Holds” should open Hold & Release filtered to active.

---

## E44. Concept mockups are directional

**CONFIRMED FROM OUR CONVERSATION**

The mockups demonstrated:

* density;
* hierarchy;
* modules working together;
* real operational data;
* future visual quality.

They were not:

* exact route requirements;
* exact metrics;
* exact data schemas;
* permission definitions.

### Risk

Do not force architecture to fit an AI-generated visual element.

---

## E45. Progressive operational depth

**CONFIRMED FROM PROJECT CONTEXT**

The platform should adapt to tenant maturity.

A newly provisioned tenant may see:

* setup progress;
* empty states;
* configuration prompts;
* readiness blockers.

A mature tenant may see:

* dense operations;
* alerts;
* trends;
* queues.

### Principle

Do not overwhelm a new tenant with empty enterprise dashboards.

---

## E46. Performance work intentionally deferred

**CONFIRMED FROM OUR CONVERSATION**

Luke explicitly preferred to continue building real functions before major optimisation.

### Rationale

Optimising early implementations that would soon change could waste effort.

### Parked areas

* AppShell navigation context;
* permissions/module loading;
* dashboard queries;
* Stock On Hand aggregation;
* Traceability query performance;
* indexing;
* caching.

### Important caveat

Performance may still become an operational blocker and should then be addressed.

---

## E47. Review strictness should be proportionate

**CONFIRMED FROM OUR CONVERSATION**

### Maximum scrutiny

* migrations;
* RLS;
* tenant boundaries;
* sensitive permissions;
* RPCs;
* irreversible writes.

### Strong but scope-aware scrutiny

* schema foundation;
* lifecycle constraints;
* actor attribution.

### Practical scrutiny

* first UI;
* scaffolds;
* read-only pages.

### Lightweight scrutiny

* wording;
* support copy;
* navigation polish.

### Standing principle

Build the safest useful foundation now, then harden with real operational evidence.

---

## E48. Foundation before enterprise perfection

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats is the proving ground.

Foundation tasks should provide:

* safe tenant boundaries;
* core schema;
* reasonable permissions;
* usable workflow;
* clear limitations.

They do not need every:

* separation-of-duty rule;
* enterprise approval;
* evidence control;
* advanced compliance lifecycle;
* external-tenant privacy mechanism

before the UI exists.

### Blockers remain

* tenant leaks;
* privilege escalation;
* missing RLS;
* historical corruption;
* unsafe irreversible writes;
* source-of-truth violation.

---

## E49. Staff feedback should refine, not originate, the entire platform

**CONFIRMED FROM OUR CONVERSATION**

Luke already understands substantial Clean Eats operations.

The plan is not to ask staff:

> What should the software do?

The plan is to show:

* meaningful workspaces;
* base workflows;
* real records;
* likely terminology.

Then ask:

* Is this step order correct?
* Who performs this?
* What fields are missing?
* What happens when it fails?
* What needs approval?
* What would be faster?

---

## E50. Meeting preparation should remain flexible

**CONFIRMED FROM OUR CONVERSATION**

Luke did not want the roadmap to reach a meeting-dependent task and then stop because the meeting date moved.

Meeting preparation tasks should be inserted when timing is known.

Before the staff meeting, Luke wanted to conduct his own full platform review first.

---

# PART F — CLEAN EATS OPERATIONAL CONTEXT

---

## F1. Clean Eats scale

**CONFIRMED FROM PROJECT CONTEXT**

Clean Eats produces approximately:

`~4,000 meals per production day`

This figure is approximate and may vary.

### Why it matters

At this scale:

* manual spreadsheets become risky;
* production planning matters;
* small unit errors multiply;
* inventory visibility matters;
* QA cannot rely only on memory;
* dispatch volume requires structure.

---

## F2. Luke’s role inside Clean Eats

**CONFIRMED FROM OUR CONVERSATION**

Luke works directly with Clean Eats and is deeply involved in:

* systems;
* production reporting;
* costing;
* supplier invoices;
* ecommerce;
* advertising;
* logistics tools;
* data collection;
* operational improvement.

He is not a detached software vendor.

### Knowledge strength

Luke understands:

* the broad operational structure;
* most business workflows;
* how teams interact;
* where current systems fail;
* what staff need to see.

### Knowledge gaps

Staff input is still required for:

* exact recipe details;
* exact production methods;
* QA checklist wording;
* room-level responsibilities;
* timing;
* exception handling;
* specialised daily practices.

---

## F3. Key stakeholders

**CONFIRMED FROM PROJECT CONTEXT**

### Tony

Director.

Likely responsible for:

* business approval;
* strategic direction;
* financial/operational oversight.

### Cettina

QA stakeholder.

### Luisa

QA stakeholder.

### Eddie

Warehousing/receiving stakeholder.

### Rob

Wholesale stakeholder.

### Production supervisors and staff

Important for:

* practical production steps;
* area responsibilities;
* task flow;
* tablet usability.

### Confidence note

Exact titles and responsibilities should be confirmed with Luke.

---

## F4. Product hierarchy

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats products use multiple levels.

### Raw ingredients

Examples:

* beef;
* chicken;
* rice;
* vegetables;
* sauces ingredients;
* spices.

### Packaging

Examples:

* trays;
* sleeves;
* labels;
* cartons.

### Components / batch products

Examples:

* Bolognese Sauce;
* cooked rice;
* Italian Herb Chicken Breast;
* mash;
* cooked vegetables;
* sauce mixes.

### Finished products

Ready-made meals and sellable SKUs.

### Important consequence

A finished product formula may use both:

* components;
* direct ingredients;
* packaging.

---

## F5. Component examples

**CONFIRMED FROM PROJECT CONTEXT**

Examples used in data collection included:

* Italian Herb Chicken Breast;
* Cooked Rice;
* Bolognese Sauce;
* Moroccan Chicken;
* Naked Chicken.

### Purpose of examples

They illustrated:

* component formula;
* output quantity;
* finished-product formula;
* production method;
* area routing.

They should not be assumed to represent final validated production data.

---

## F6. Formula data collection

**CONFIRMED FROM PROJECT CONTEXT**

A workbook was created:

`Clean_Eats_Formula_Collection_Pack.xlsx`

Tabs:

* Instructions;
* Component/Batch Formulas;
* Finished Product Formulas;
* Production Methods/Routes;
* Production Areas;
* Examples and Notes.

### Why

The software structure was being built while Clean Eats staff collected:

* recipe quantities;
* yields;
* methods;
* rooms;
* routing;
* task steps.

### Strategy

Build the import/review system while staff gather data.

---

## F7. Existing production-report tool

**CONFIRMED FROM PROJECT CONTEXT**

Clean Eats uses a Streamlit/FDPF production schedule/report tool.

Known sections included:

* Meal Summary;
* Bulk Raw Ingredients to Cook;
* Meal Raw Ingredients to Cook;
* Prepack Room;
* Meat Order & Veg Prep.

### Multiple printed copies

Different sections were printed multiple times for operational use.

### Why it matters

This tool encoded real current production logic and could inform EveryBatch’s future Production Report and Facility workflows.

### Warning

Do not automatically migrate every legacy calculation without validation.

---

## F8. Rice production change

**CONFIRMED FROM PROJECT CONTEXT**

Clean Eats changed rice production from a large kettle process to oven trays.

New logic:

* 2kg rice per tray;
* 3kg water per tray.

### Relevance to EveryBatch

This is an example of why production methods and formulas must be versionable and operationally editable.

A manufacturing process can change without the finished meal changing.

---

## F9. Bundle and meal cleanup tools

**CONFIRMED FROM PROJECT CONTEXT**

A Zapiet production-cleanup tool handled orders and bundles.

Later, a separate app handled bundle breakdown, so bundle creation logic was removed from the cleanup tool.

### Relevance

EveryBatch should not embed outdated downstream transformation rules once another source system becomes authoritative.

---

## F10. Supplier invoice reality

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats receives supplier invoices from multiple suppliers with differing layouts and terminology.

Challenges include:

* supplier-specific formats;
* item descriptions not matching internal names;
* price changes;
* pack units;
* invoice units;
* PDF/image quality;
* inconsistent line descriptions.

### Why parsers were supplier-specific

A fully generic parser would likely be less reliable.

Supplier-specific parsers can use known layout patterns while retaining unknown-parser diagnostics.

---

## F11. Supplier-item mapping

**CONFIRMED FROM OUR CONVERSATION**

A supplier may call an item something different from Clean Eats.

Examples:

* invoice description;
* supplier SKU;
* pack size;
* internal ingredient name.

Mappings connect supplier evidence to internal item identity.

### Required review areas

* item match;
* unit;
* pack size;
* approved price;
* conversion rule;
* confidence;
* effective date.

---

## F12. Approved price process

**CONFIRMED FROM OUR CONVERSATION**

Invoice parsing produces observations.

It should not automatically become costing truth.

A reviewed price approval layer is necessary.

### Why

Potential issues:

* wrong mapping;
* freight line;
* credit;
* tax;
* pack unit;
* OCR/parser error;
* temporary price;
* non-stock line.

---

## F13. Goods Inwards workflow

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats receiving needs:

* supplier;
* date/time;
* reference;
* item;
* quantity;
* unit;
* location;
* lot;
* expiry/use-by;
* QA status;
* notes.

### Invoice-linked versus manual

Some receipts come from invoice evidence.

Others may be entered manually.

Both must remain valid.

### Posting consequence

Posting creates:

* inventory lot;
* inbound movement;
* locked receiving history.

---

## F14. Stock locations

**CONFIRMED FROM PROJECT CONTEXT**

Known seeded Clean Eats locations included:

* Kitchen;
* Prepack Room;
* Packing Room;
* Cool Room;
* Freezer;
* Dry Store;
* Goods Inwards;
* Dispatch Area;
* Quarantine/Hold;
* Waste.

### Why location matters

The same item may exist:

* in multiple rooms;
* in multiple lots;
* under different QA status.

---

## F15. Lot and expiry handling

**CONFIRMED FROM OUR CONVERSATION**

The platform needed to track:

* lot number;
* supplier lot;
* expiry;
* use-by;
* manufacture date;
* QA status;
* location;
* receipt source.

### Future need

* expiry alerts;
* FEFO;
* recall;
* production consumption by lot.

---

## F16. Stock On Hand expectations

**CONFIRMED FROM OUR CONVERSATION**

Stock On Hand should show:

* item;
* location;
* lot;
* unit;
* available;
* held;
* physical;
* last movement.

### Important Clean Eats reality

Units may vary.

The system must not show one false total by silently combining:

* kg;
* g;
* box;
* carton;
* each.

---

## F17. QA receiving expectations

**CONFIRMED FROM PROJECT CONTEXT**

Potential receiving checks include:

* supplier identity;
* vehicle condition;
* packaging integrity;
* temperature;
* chilled/frozen condition;
* expiry/use-by;
* supplier lot;
* contamination;
* pest evidence;
* acceptance;
* rejection;
* hold.

### Confidence note

The exact final checklist needs QA staff confirmation.

---

## F18. QA production expectations

**CONFIRMED FROM PROJECT CONTEXT**

Future production QA may include:

* pre-op checks;
* room readiness;
* allergen changeover;
* ingredient verification;
* cook temperatures;
* cooling;
* weight;
* yield;
* seal;
* label;
* metal detection;
* batch release;
* cleaning.

### Important boundary

EveryBatch should support Clean Eats’ documented procedures.

It should not invent them.

---

## F19. Production areas

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats production involves multiple physical areas.

Examples discussed:

* Kitchen;
* Meat/Veg Prep;
* Prepack;
* Packing;
* Dispatch.

### Why areas matter

They affect:

* task ownership;
* production order;
* tablet views;
* QA checks;
* equipment;
* workflow timing.

---

## F20. Production task concept

**CONFIRMED FROM OUR CONVERSATION**

Production tasks should eventually connect:

* plan;
* batch;
* area;
* staff/team;
* status;
* due time;
* QA requirement.

### Shared tablet use

A facility view should make tasks easy to complete on the floor without exposing broad administrative access.

---

## F21. Production planning expectations

**CONFIRMED FROM OUR CONVERSATION**

The eventual production flow should include:

1. define output requirement;
2. find active formula;
3. generate input requirements;
4. check stock;
5. release batch;
6. allocate lots;
7. issue stock;
8. complete production tasks;
9. record QA;
10. create output stock;
11. compare planned versus actual.

During the original period, only the early planning steps existed.

---

## F22. Clean Eats dispatch groups

**CONFIRMED FROM PROJECT CONTEXT**

Logistics groups used in the separate Detrack tool included:

* Clean Eats Australia;
* Clean Eats Wholesale;
* Made Active;
* Elite Meals.

### Important note

These may represent:

* brands;
* sales channels;
* fulfilment groups;
* customer businesses.

The exact future EveryBatch ownership model requires confirmation.

---

## F23. Carton capacities

**CONFIRMED FROM PROJECT CONTEXT**

Separate Detrack logic used carton capacities such as:

* Clean Eats Australia: 24;
* Clean Eats Wholesale: 30;
* Made Active: 20;
* Elite Meals: 20.

Family meals counted as two.

### Relevance

Carrier/export and carton rules are operational configuration.

They should not be global hard-coded constants for every tenant.

### Confidence note

These are historical tool rules and require verification before EveryBatch implementation.

---

## F24. Carrier practices

**CONFIRMED FROM PROJECT CONTEXT**

Carrier concepts included:

* internal Clean Eats delivery;
* Meal Cart;
* DK;
* Cold Xpress;
* Detrack.

### Export differences

Different carriers required different:

* dates;
* customer types;
* address fields;
* cartons;
* temperature;
* weights;
* comments.

### Architecture consequence

Logistics needs:

* tenant carrier configuration;
* services;
* export profiles;
* manifest generation;
* historical snapshots.

---

## F25. Residential versus wholesale

**CONFIRMED FROM PROJECT CONTEXT**

Clean Eats has both:

* residential;
* wholesale/commercial.

Differences may include:

* carton capacity;
* naming;
* company field;
* delivery type;
* manifest layout;
* carrier;
* order source;
* dispatch date.

### Future requirement

Do not flatten residential and wholesale into one identical dispatch workflow without considering these differences.

---

## F26. Shopify and order-source context

**CONFIRMED FROM PROJECT CONTEXT**

Shopify or ecommerce order exports influenced:

* production demand;
* delivery information;
* Detrack manifests.

### Current EveryBatch gap

Order/customer ingestion was not yet a source module during the original period.

### Future decision needed

Orders may enter through:

* ecommerce integration;
* CSV import;
* API;
* wholesale entry;
* CRM/customer accounts.

---

## F27. Wholesale stakeholder context

**CONFIRMED FROM PROJECT CONTEXT**

Rob was identified with wholesale operations.

### Likely areas for validation

* wholesale customer accounts;
* recurring orders;
* delivery requirements;
* carton rules;
* pricing;
* dispatch;
* account contacts.

### Confidence note

Exact responsibilities require Luke confirmation.

---

## F28. Warehouse stakeholder context

**CONFIRMED FROM PROJECT CONTEXT**

Eddie was identified with warehousing.

### Likely areas for validation

* receiving;
* stock locations;
* lot capture;
* movements;
* stocktake;
* holds;
* purchasing;
* expiry;
* dispatch preparation.

---

## F29. QA stakeholders

**CONFIRMED FROM PROJECT CONTEXT**

Cettina and Luisa were identified for QA.

### Areas requiring their input

* receiving templates;
* daily checks;
* production checks;
* CCP;
* temperatures;
* review/approval;
* hold/release;
* non-conformance;
* corrective action;
* evidence;
* reports.

---

## F30. Tony’s role in review

**CONFIRMED FROM PROJECT CONTEXT**

Tony approved early wireframes and supported the platform direction.

### Likely review focus

* business value;
* readiness;
* visibility;
* financial impact;
* operational control;
* rollout.

---

## F31. Staff meeting direction

**CONFIRMED FROM OUR CONVERSATION**

An early staff meeting went well and staff were excited.

Later meeting strategy evolved.

### Preferred approach

Before the next detailed review:

* build base module functionality;
* remove fake content;
* create understandable workspaces;
* improve dashboards;
* Luke conducts own review;
* then staff validate details.

---

## F32. Luke’s operational knowledge versus staff knowledge

**CONFIRMED FROM OUR CONVERSATION**

Luke knows enough to define:

* module purpose;
* high-level workflow;
* cross-module relationship;
* likely records;
* user experience.

Staff are needed for:

* exact formulas;
* exact checklist wording;
* timing;
* practical sequence;
* exceptions;
* ownership;
* floor constraints.

### Product strategy

Do not wait for complete staff documentation before building the platform foundation.

---

## F33. Production report copy counts

**CONFIRMED FROM PROJECT CONTEXT**

The Streamlit production-report tool printed multiple copies of different sections.

Known examples:

* Summary ×2;
* Bulk ×3;
* Recipes ×2;
* Prepack ×1;
* Meat & Veg ×3.

### Relevance

Different rooms or teams require their own operational views or printed outputs.

A single generic production screen may not suit the floor.

---

## F34. Facility/tablet requirement

**CONFIRMED FROM OUR CONVERSATION**

Tony/staff feedback confirmed the need for tablet or facility-room views.

### Key expectations

* area-based;
* simple;
* readable;
* touch-friendly;
* clear current work;
* controlled actions;
* staff identity.

---

## F35. Production scale and batching

**ARCHITECT INFERENCE based on Clean Eats context**

At several thousand meals per day, EveryBatch should support:

* batch sizing;
* multiple outputs;
* large component batches;
* room capacity;
* parallel work;
* repeated formulas;
* production-day scheduling.

Exact batch sizes and constraints require staff data.

---

## F36. Food-safety sensitivity

**CONFIRMED FROM OUR CONVERSATION**

QA and traceability must be treated seriously.

However, EveryBatch should avoid unsupported claims such as:

* HACCP certified;
* guarantees compliance;
* regulator approved.

Preferred language:

* supports HACCP workflows;
* supports traceability;
* supports QA records;
* supports audit history.

---

## F37. Current external systems should not be replaced prematurely

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch may initially coexist with:

* Shopify;
* Detrack;
* Xero;
* spreadsheets;
* Python tools;
* Streamlit tools.

### Strategy

Replace or integrate workflows only when EveryBatch’s version is:

* reliable;
* tested;
* operationally accepted.

---

## F38. Clean Eats as proving ground, not template for every tenant

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats is allowed to have:

* its own locations;
* its own carriers;
* its own formulas;
* its own modules;
* its own branding;
* its own feature flags.

But these should be tenant configuration.

Do not make them universal EveryBatch constants.

---

# End of Part 4

Part 5 will continue with:

# PART G — ARCHITECTURAL PRINCIPLES AND SOURCE-OF-TRUTH MAP

It will cover:

* multi-tenancy;
* `organisation_id`;
* RLS;
* membership;
* permissions;
* RPC safety;
* `SECURITY DEFINER`;
* immutable history;
* source-record ownership;
* reports/dashboard/read-model rules;
* feature flags;
* module enablement;
* app modes;
* domain routing;
* storage;
* audit;
* migration discipline;
* Platform Admin exceptions;
* tenant lifecycle.

Part 5 will then continue into:

# PART H — IMPORTANT DECISIONS AND REJECTED ALTERNATIVES
# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 5 — Architectural principles, source-of-truth map, major decisions and rejected alternatives

This part continues the dossier structure requested in the historical extraction brief. 

---

# PART G — ARCHITECTURAL PRINCIPLES AND SOURCE-OF-TRUTH MAP

---

## G1. Multi-tenancy is foundational, not optional

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch was deliberately moved away from being a Clean Eats-only application.

The architecture needed to support:

* Clean Eats as Tenant 1;
* future food-manufacturing tenants;
* separate users and memberships;
* different modules;
* tenant branding;
* tenant-specific locations;
* tenant-specific suppliers;
* tenant-specific formulas;
* tenant-specific feature flags;
* future tenant-specific domains;
* Platform Admin oversight.

The multi-tenant design was not treated as something to bolt on later.

It was built into the data model early.

---

## G2. `organisation_id` is the core tenant boundary

**CONFIRMED FROM OUR CONVERSATION**

Tenant-owned records should carry:

`organisation_id`

This applies broadly to:

* suppliers;
* supplier items;
* internal items;
* formulas;
* prices;
* receipts;
* receipt lines;
* lots;
* movements;
* production plans;
* batches;
* QA records;
* support tickets;
* logistics records;
* future CRM/customer records.

### Why this matters

A route parameter or user-selected tenant is not enough.

The database itself must know which organisation owns the row.

### Preferred foreign-key pattern

Where practical, tenant-safe relationships should use composite constraints such as:

* `(organisation_id, id)`

This prevents a row in one tenant from referencing an entity in another tenant even if UUIDs are supplied incorrectly.

### Future architect warning

Do not add a new tenant-owned table without first deciding:

* how `organisation_id` is set;
* how it is validated;
* how foreign keys preserve tenant alignment;
* how RLS uses it.

---

## G3. RLS is part of the product architecture

**CONFIRMED FROM OUR CONVERSATION**

Row Level Security was treated as a core requirement.

It was not enough for the UI to:

* hide buttons;
* hide navigation;
* filter a query client-side.

The database should prevent access independently.

### Standard expectations

For tenant-owned tables:

* RLS enabled;
* authenticated access only where appropriate;
* active membership check;
* permission check;
* organisation boundary;
* no broad anonymous access;
* no broad authenticated access merely because the user is logged in.

### Typical helper functions

Known helpers included:

* `public.current_profile_id()`;
* `public.is_active_member(uuid)`;
* `public.current_role_key(uuid)`;
* `public.is_platform_admin()`;
* `public.has_permission(uuid, text)`.

Exact signatures and current implementations require repository verification.

---

## G4. Active membership is separate from authentication

**CONFIRMED FROM OUR CONVERSATION**

A signed-in user is not automatically allowed into every tenant.

A user should generally need:

* valid authenticated session;
* profile;
* active membership in the organisation;
* correct permission.

### Why this matters

A former employee may still have an Auth account.

Their organisation membership may be:

* inactive;
* removed;
* suspended.

The database should respect current membership state.

---

## G5. Roles and permissions are distinct concepts

**CONFIRMED FROM OUR CONVERSATION**

Roles are collections of expected responsibilities.

Permissions are specific capabilities.

Examples of roles:

* platform_admin;
* organisation_admin;
* operations_manager;
* warehouse_manager;
* production_manager;
* qa_manager;
* wholesale_manager;
* staff;
* tablet_user;
* viewer;
* phase_1_demo_user.

Examples of permissions:

* view;
* create;
* manage;
* post;
* approve;
* complete;
* release;
* archive.

### Architectural preference

Application logic should generally ask:

> Does the user have permission X for organisation Y?

rather than:

> Is the user role Z?

### Why

Roles may evolve.

Permissions express the operational boundary more precisely.

---

## G6. Granular permissions should follow workflow sensitivity

**CONFIRMED FROM OUR CONVERSATION**

Permissions should not always collapse into a single broad `manage`.

Sensitive lifecycle actions should often be separate.

Examples:

### Goods Inwards

* view;
* create;
* manage draft;
* post.

### UOM Conversions

* view;
* create;
* manage.

### QA

Later planning separated:

* complete;
* review;
* approve;
* hold place;
* hold release;
* disposal;
* override.

### Stock adjustment

Planned distinctions:

* view;
* create;
* post;
* manage;
* approve later.

### Principle

The more irreversible or sensitive the action, the more explicit the permission should be.

---

## G7. Demo-user access is deliberately constrained

**CONFIRMED FROM OUR CONVERSATION**

The Phase 1 demo user was not intended to be a generic “see everything” account.

It was designed to let Clean Eats staff explore approved areas without exposing unfinished or sensitive modules.

### Important access rule

The demo user should remain blocked from:

* QA;
* Logistics;
* CRM;
* Reports;
* Platform Admin;
* Admin;
* Supplier Invoice Intake;

unless Luke explicitly approves a later change.

### Why

* unfinished modules may mislead;
* sensitive records may be visible;
* staff may assume functionality is ready;
* direct URLs must not bypass navigation restrictions.

---

## G8. Module enablement and permissions solve different problems

**CONFIRMED FROM OUR CONVERSATION**

Organisation modules determine whether a tenant has a module enabled.

Permissions determine what a user may do inside it.

### Example

A tenant may have QA enabled.

A user still needs:

* QA view permission;
* possibly check-completion permission;
* possibly review permission.

### Rule

Feature or module enablement must not be treated as authorisation.

---

## G9. Feature flags are rollout controls, not security controls

**CONFIRMED FROM OUR CONVERSATION**

Feature flags may be used for:

* staged rollout;
* tenant readiness;
* experimental workflows;
* branding;
* new search;
* loading transitions;
* invoice intake;
* production readiness.

They should not replace:

* RLS;
* permission checks;
* active membership.

### Future architect warning

A disabled flag may hide UI, but the underlying write path must still remain protected.

---

## G10. Clean Eats configuration must not become global platform logic

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats is the proving ground.

Its configuration may include:

* locations;
* carriers;
* services;
* formula names;
* modules;
* feature flags;
* branding;
* QA templates;
* dispatch rules.

These should generally be tenant-owned data.

### Do not hard-code globally

* Clean Eats locations;
* provider names;
* carton capacities;
* specific recipes;
* role assignments;
* production areas;
* QA check wording.

### Exception

Generic system constants are appropriate for concepts such as:

* `draft`;
* `active`;
* `posted`;
* `in`;
* `out`;

where the platform genuinely needs controlled values.

---

## G11. Source modules own records; other modules link to them

**CONFIRMED FROM OUR CONVERSATION**

The platform should be connected without creating multiple competing copies of the same record.

### Core principle

A module may display and link another module’s data.

It should not silently create a parallel duplicate.

### Examples

* QA links to a receipt rather than copying receipt fields as a new receipt.
* Reports reads stock movements rather than maintaining a separate stock ledger.
* Production references formulas rather than duplicating recipe lines.
* Logistics references customer/order records rather than becoming the customer master.
* Platform Admin reads tenant health rather than owning tenant operational status.

---

## G12. Explicit source-of-truth map

The following ownership map was central to the product architecture.

---

### Organisations and memberships

**Owner:** Platform/Tenant Administration architecture

Owns:

* organisation identity;
* memberships;
* tenant settings;
* module enablement;
* branding configuration;
* future domain/billing lifecycle.

Must not be duplicated by:

* CRM;
* Support;
* Platform Admin diagnostics.

---

### Suppliers

**Owner:** Products / Suppliers

Owns:

* canonical supplier identity;
* aliases;
* supplier catalogue items;
* supplier status.

Read by:

* Supplier Invoice Intake;
* Goods Inwards;
* Costings;
* Purchasing;
* QA;
* Reports.

Must not be recreated independently in:

* QA;
* Logistics;
* Reports.

---

### Supplier invoice evidence

**Owner:** Supplier Invoice Intake / purchase-document architecture

Owns:

* uploaded document;
* parsed line;
* invoice reference;
* supplier evidence;
* price observation;
* line mapping evidence.

Read by:

* Costings;
* Goods Inwards;
* Reports;
* QA;
* traceability.

Must not be edited merely because a receipt or price decision changes.

---

### Approved supplier prices

**Owner:** Supplier pricing / Costings architecture

Owns:

* reviewed price used for costing;
* effective period;
* supplier/item relationship;
* approval state.

Read by:

* Ingredient Costs;
* Packaging Costs;
* Component Costs;
* Meal Margins;
* snapshots;
* future Purchasing.

Must not be replaced automatically by raw invoice observations.

---

### Internal items

**Owner:** Products

Owns:

* canonical item identity;
* item type;
* SKU/code;
* name;
* status;
* core metadata.

Read by:

* formulas;
* Costings;
* Inventory;
* Production;
* QA;
* Logistics;
* Reports.

Must not be duplicated inside each module.

---

### Formula versions and lines

**Owner:** Products / Formula architecture

Owns:

* composition;
* input quantity;
* unit;
* output quantity;
* version;
* status.

Read by:

* Costings;
* Production;
* QA;
* Reports;
* future imports.

Must not be rewritten by:

* Costings;
* Production;
* QA.

---

### UOM conversion rules

**Owner:** Products/master-data configuration

Owns:

* reviewed relationship between contextual units;
* scope;
* factor;
* source;
* effective dates;
* reverse-use rule.

Read by:

* Costings;
* Supplier Invoice Intake;
* Goods Inwards;
* Production;
* Reports.

Must not be confused with:

* formula quantity;
* inventory movement;
* supplier price.

---

### Inventory receipts and receipt lines

**Owner:** Goods Inwards / Inventory

Owns:

* receiving event;
* reviewed received line;
* supplier/source relationship;
* lot/date details;
* pre-post status;
* posting status.

Read by:

* QA;
* Traceability;
* Reports;
* Purchasing;
* Supplier Invoice Intake.

Must not be rewritten after posting to hide later corrections.

---

### Inventory lots

**Owner:** Inventory

Owns:

* traceable lot identity/context;
* item;
* receipt source;
* location context where modelled;
* expiry/use-by/manufacture date;
* lot status.

Read by:

* Stock On Hand;
* Traceability;
* Production;
* QA;
* Reports;
* Logistics.

Must not have quantity duplicated independently from the movement ledger without a deliberate model.

---

### Stock movements

**Owner:** Inventory

Owns:

* quantity change;
* direction;
* unit;
* item;
* location;
* lot;
* source event;
* timestamp;
* posting state.

This is the append-oriented ledger.

Read by:

* Stock On Hand;
* Traceability;
* Reports;
* Production;
* QA;
* Platform diagnostics.

Must not be edited directly to correct history.

Corrections should create new movements.

---

### Stock On Hand

**Owner:** No independent operational owner; derived Inventory read model

Derived from:

* posted stock movements;
* movement direction;
* lot/location/unit;
* QA availability rules.

Must not be manually edited.

---

### Inventory Traceability

**Owner:** Inventory read-model/workspace

Reads relationships across:

* supplier evidence;
* receipt;
* receipt line;
* lot;
* movement;
* current balance;
* future production/dispatch.

Must not duplicate the source records.

---

### Costing snapshots

**Owner:** Costings

Owns:

* historical calculated evidence;
* line-level cost context;
* blocker context;
* point-in-time result.

Must remain immutable.

---

### Production plans

**Owner:** Production

Owns:

* planned date;
* planned outputs;
* plan status;
* approval;
* planned batches.

Read by:

* QA;
* Reports;
* Facility view;
* future Logistics.

Must not be treated as actual production completion.

---

### Production batches

**Owner:** Production

Owns:

* planned/operational production batch;
* relationship to plan line;
* status;
* future inputs/outputs/events.

Must not be confused with:

* inventory lot;
* finished-product lot;
* dispatch batch.

---

### QA records

**Owner:** QA

Owns:

* templates;
* versions;
* checks;
* results;
* reviews;
* approvals;
* amendments;
* hold decisions/events;
* future non-conformance;
* future corrective actions.

QA reads operational source records.

It must not duplicate:

* stock quantity;
* receipt;
* production plan;
* item;
* supplier.

---

### Logistics records

**Owner:** Logistics

Owns:

* dispatch runs;
* delivery records/snapshots;
* manifests;
* carriers;
* services;
* future exports;
* delivery issues.

Reads:

* orders;
* customer accounts;
* products;
* production outputs;
* QA release;
* inventory allocation.

Must not become the customer master or stock ledger.

---

### CRM records

**Owner:** CRM, when implemented

Should own:

* customer accounts;
* contacts;
* leads;
* future opportunities.

Should not duplicate:

* tenant users;
* support tickets;
* orders;
* dispatch snapshots.

---

### Reports

**Owner:** Reporting read-model layer

Reads source records.

May own:

* saved report definition;
* generated export;
* scheduled report configuration.

Must not create competing operational truth.

---

### Support tickets

**Owner:** Support

Owns:

* support request;
* conversation;
* support event;
* attachment metadata.

Must not replace:

* QA non-conformance;
* Logistics delivery issue;
* Inventory adjustment;
* Production task.

---

### Platform Admin diagnostics

**Owner:** Platform operations layer

Reads:

* tenant configuration;
* readiness;
* health;
* issue counts;
* support context.

Must not become the source of tenant operational records.

---

## G13. Immutable history is a deliberate product requirement

**CONFIRMED FROM OUR CONVERSATION**

Historical records should remain reliable after later changes.

Examples:

* published formula version;
* costing snapshot;
* posted receipt;
* stock movement;
* completed QA check;
* hold/release event;
* generated manifest;
* approved price period.

### Preferred correction mechanisms

* new version;
* amendment;
* reversal;
* superseding record;
* archive;
* explicit lifecycle event.

### Avoid

* silent rewrite;
* destructive delete;
* changing the original source after downstream consequences exist.

---

## G14. Draft state is the normal editable state

**CONFIRMED FROM OUR CONVERSATION**

A recurring lifecycle pattern is:

* Draft = editable;
* Published/Posted/Approved/Generated = consequential and restricted;
* Archived/Cancelled = historical but inactive.

### Examples

* draft receipt;
* draft formula version;
* draft UOM rule;
* draft production plan;
* draft dispatch run;
* draft QA check.

### Why

This separates:

* setup;
* review;
* operational commitment.

---

## G15. Posting means creating operational consequences

**CONFIRMED FROM OUR CONVERSATION**

The verb “Post” was intentionally reserved for actions that create committed operational effects.

Examples:

* post inventory receipt;
* future post adjustment;
* future post stock issue/output.

### Posting should involve

* validation;
* permission;
* preflight;
* transaction;
* idempotency;
* immutable downstream records;
* clear result.

---

## G16. Append-only ledgers and event histories

**CONFIRMED FROM OUR CONVERSATION**

Certain domains should retain append-only history.

### Stock movements

Quantity ledger.

### QA hold events

Later project state established append-only event history.

### Audit events

Business-event history.

### Support events

Ticket lifecycle.

### Why

The system should answer:

* what happened;
* when;
* who did it;
* what changed;
* what the previous state was.

---

## G17. Controlled RPCs for multi-record transactions

**CONFIRMED FROM OUR CONVERSATION**

A server action performing multiple sequential writes may fail partway.

When one operation must atomically affect several tables, a Postgres function/RPC may be appropriate.

### Example

`public.post_inventory_receipt(p_receipt_id uuid)`

It:

* locks receipt;
* validates;
* creates lots;
* creates movements;
* updates lines;
* updates receipt;
* returns structured result.

### Preferred properties

* transaction-safe;
* idempotent or retry-safe;
* explicit tenant/permission check;
* minimal trusted inputs;
* predictable return contract.

---

## G18. `SECURITY DEFINER` is exceptional and must be constrained

**CONFIRMED FROM OUR CONVERSATION**

Security Invoker is conceptually preferable when RLS permits the operation.

Security Definer may be used when an atomic multi-table workflow cannot otherwise execute cleanly.

### Safeguards

* fixed `search_path`;
* no dynamic SQL;
* revoke `public`;
* revoke `anon`;
* grant only intended role;
* explicit profile check;
* explicit membership check;
* explicit permission check;
* no client-supplied organisation/profile identity where derivable;
* minimal function surface.

### Current known warning

`post_inventory_receipt` triggered a Supabase advisor warning because authenticated users could execute a Security Definer function.

The warning was parked, not ignored.

---

## G19. Actor identity should be derived where possible

**CONFIRMED FROM OUR CONVERSATION**

Forms should not freely submit:

* organisation ID;
* created-by profile ID;
* posted-by profile ID;
* actor profile ID.

The server/database should derive these from the current authenticated context.

### Why

Client-controlled actor IDs can produce:

* false audit attribution;
* cross-tenant references;
* privilege abuse.

---

## G20. Platform Admin exceptions require caution

**CONFIRMED FROM OUR CONVERSATION**

Platform Admin sometimes had global read or operator access.

This was useful for:

* tenant diagnostics;
* support;
* provisioning;
* system operation.

However, unrestricted tenant operational writes were not desirable.

### Later direction

Platform Admin should:

* diagnose;
* support;
* inspect configuration;
* possibly access operational records through controlled, audited support access.

It should not silently become an all-tenant operational user.

### Current state

Requires repository verification.

Some SELECT policies likely still use `is_platform_admin()` as a global read bypass.

This was accepted temporarily but flagged for later external-tenant hardening.

---

## G21. Reports and dashboards are readers

**CONFIRMED FROM OUR CONVERSATION**

Reports and dashboards should:

* aggregate;
* filter;
* summarise;
* link.

They should not create their own competing operational statuses.

### Exception

A generated report file or saved report definition may be owned by Reports.

The underlying operational values still come from source modules.

---

## G22. Historical snapshots are preferred over recalculating old state

**CONFIRMED FROM OUR CONVERSATION**

When a past calculation must be preserved, store:

* final values;
* relevant source-line context;
* formula/version references;
* price references;
* blocker state.

Do not attempt to reproduce an old result using current data unless explicitly doing a recalculation comparison.

---

## G23. Global constants versus tenant configuration

**CONFIRMED FROM OUR CONVERSATION**

### Good global constants

* controlled lifecycle statuses;
* movement directions;
* safe metric conversions;
* system permission keys;
* item-type enum;
* generic result types.

### Good tenant configuration

* locations;
* carriers;
* services;
* pack conversions;
* production areas;
* QA templates;
* dispatch rules;
* tenant modules;
* branding.

### Risk

Do not put tenant-specific configuration into TypeScript constants merely because it is easy.

---

## G24. Global safe UOM conversion versus contextual conversion

**CONFIRMED FROM OUR CONVERSATION**

Safe global conversions:

* kg/g;
* l/ml;
* each aliases.

Contextual rules:

* bunch to grams;
* box to kilograms;
* carton to each;
* bottle to litres.

### Principle

Do not infer contextual pack size.

### Directionality

Reverse use should be explicit.

---

## G25. Storage is private by default

**CONFIRMED FROM OUR CONVERSATION**

Operational documents should generally live in private buckets.

Examples:

* purchase documents;
* tenant branding assets;
* support attachments;
* future QA evidence.

### Access

Use:

* tenant-scoped paths;
* explicit helper validation;
* signed URLs;
* permission-aware access.

### Avoid

* public buckets for sensitive tenant files;
* broad anonymous read;
* path-only trust without validating tenant ownership.

---

## G26. Storage path conventions matter

**CONFIRMED FROM PROJECT CONTEXT**

Examples:

### Purchase documents

`{organisationId}/purchase-documents/{documentId}/{safe_filename}`

### Branding

`{organisation_id}/logo/full-{safe_filename}`
`{organisation_id}/logo/icon-{safe_filename}`

### Support attachments

`{organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}`

### Principle

Paths should embed tenant and parent-record context.

---

## G27. Migration numbering and application status are repository truth

**CONFIRMED FROM OUR CONVERSATION**

Migration numbers must be sequential.

Codex must inspect the repository before choosing the next number.

### Original handover state

Migrations 001–038 applied.

### Later project state

Additional migrations were applied after the handover.

Current number requires repository verification.

### Important documentation rule

A migration being present in the repository does not necessarily mean it has been applied.

Docs should distinguish:

* created;
* reviewed;
* applied;
* smoke-tested.

---

## G28. Migration SQL must be reviewable

**CONFIRMED FROM OUR CONVERSATION**

The original hard rule was:

> If a migration is created or changed, paste full SQL under FULL SQL MIGRATION CONTENTS.

### Rationale

Luke applies migrations manually and needs the exact SQL.

### Later proportional refinement

For extremely long migrations:

* upload exact file;
* verify line count;
* verify SHA-256;
* review actual file;
* do not pretend a truncated paste is complete.

### Standing requirement

Codex must not merely say:

> The migration is in the repo.

unless the exact file is available for review through an accepted mechanism.

---

## G29. Branch safety

**CONFIRMED FROM PROJECT CONTEXT — later refinement**

Later Codex prompts began requiring:

* `git branch --show-current`;
* `git status --short`;
* expected branch `main`;
* stop if on another branch;
* do not switch silently;
* do not overwrite unrelated work.

### Why

An earlier branch/review incident or branch confusion created enough concern that explicit branch checks became standard.

Exact origin requires repository/context verification.

---

## G30. Documentation is part of the implementation

**CONFIRMED FROM OUR CONVERSATION**

Task documents were expected to record:

* purpose;
* scope;
* decisions;
* source ownership;
* permissions;
* Admin/Support impact;
* limitations;
* testing;
* future work.

### Important rule

If a later task changes an earlier decision, update the earlier task document where necessary.

### Why

Future architects and Codex sessions should not encounter contradictory docs.

---

## G31. Support and release-note discipline

**CONFIRMED FROM OUR CONVERSATION**

### Planning-only task

* document future Support impact;
* no release note;
* no user-facing guide update unless a real workflow changed.

### User-facing task

Consider updating:

* guide;
* troubleshooting;
* release notes;
* support ticket context.

### Schema-only task

Do not claim functionality is live.

At most, release notes should say a foundation was added if that is appropriate and honest.

---

## G32. Audit logs should capture business events, not merely row changes

**CONFIRMED FROM OUR CONVERSATION**

Technical changes are useful but not sufficient.

Users and support need events such as:

* receipt posted;
* formula version published;
* UOM rule activated;
* hold placed;
* support ticket assigned;
* production plan approved.

### Deferred tasks

Audit Business Events were planned later in the roadmap.

### Principle

Audit events should be:

* meaningful;
* organisation-scoped;
* actor-linked;
* record-linked;
* metadata-rich enough to understand the action.

---

## G33. Domain architecture separates product surfaces

**CONFIRMED FROM OUR CONVERSATION**

### Public marketing

`everybatchmrp.com`

### Central app

`app.everybatchmrp.com`

### Platform Admin

`admin.everybatchmrp.com`

### Tenant

`cleaneats.everybatchmrp.com`

### Support

`support.everybatchmrp.com`

### Why this matters

Each host has a distinct purpose.

The user should not have to understand internal route groups or codebase structure.

---

## G34. One operational app codebase, separate marketing codebase

**CONFIRMED FROM OUR CONVERSATION / PROJECT CONTEXT**

The authenticated platform uses one codebase with host modes.

The marketing site was later recommended as a separate Next.js repository.

### Rationale for separate marketing repo

* independent deployment;
* smaller public attack surface;
* no risk marketing changes interrupt tenant operations;
* separate analytics;
* content-oriented design;
* same technical ecosystem;
* shared brand direction without tightly coupling code.

---

## G35. Tenant onboarding should be controlled before becoming self-service

**CONFIRMED FROM PROJECT CONTEXT**

The marketing site may capture:

* demo request;
* lead;
* implementation needs.

It should not automatically create a live manufacturing tenant before onboarding is mature.

### Controlled future flow

Lead
→ qualification
→ Platform Admin provisioning
→ module template
→ first admin
→ branding/domain
→ data import
→ onboarding checklist
→ active tenant.

---

## G36. External integrations should be staged

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch may integrate with:

* Shopify;
* Detrack;
* Xero;
* carrier systems;
* email;
* calendars;
* future CRM;
* document extraction.

### Principle

Start with:

* configuration;
* manual import/export;
* controlled review.

Move to:

* API connection;
* automation;
* synchronisation

only after ownership and failure handling are clear.

---

## G37. Failure must be visible and recoverable

**CONFIRMED FROM OUR CONVERSATION**

Operational software must not:

* fail silently;
* leave users unsure whether an action completed;
* partially write without explanation;
* hide blockers.

### Preferred behaviours

* structured error;
* clear blocker;
* safe retry;
* transaction;
* no duplicate;
* link to resolution.

---

## G38. Double-click and retry safety

**CONFIRMED FROM OUR CONVERSATION**

Any consequential action should be protected against:

* repeated click;
* browser retry;
* network retry;
* user refresh.

### Example

The Goods Inwards RPC locks the receipt and returns `already_posted` on a later attempt.

### Future application

* stock adjustment;
* production issue;
* production output;
* manifest generation;
* invoice approval;
* tenant provisioning.

---

## G39. Performance should be measured, then addressed deliberately

**CONFIRMED FROM OUR CONVERSATION**

Route timing logs were added or used to identify:

* shell navigation time;
* dashboard helper time;
* traceability query time.

### Decision

Continue functional work first.

Later performance work should use actual timing evidence.

### Avoid

* premature caching that hides stale permissions;
* broad client fetching;
* sequential module queries;
* unbounded result sets.

---

## G40. New tenants should see readiness, not broken emptiness

**CONFIRMED FROM PROJECT CONTEXT**

A tenant with no records should see:

* setup state;
* next action;
* required configuration;
* disabled future integration explained honestly.

Not:

* blank page;
* fake metrics;
* confusing empty table.

---

# PART H — IMPORTANT DECISIONS AND REJECTED ALTERNATIVES

---

## H1. Decision: Build a food-specific platform rather than a generic ERP

**CONFIRMED FROM OUR CONVERSATION**

### Context

Luke observed that generic manufacturing systems often attempt to serve every industry.

### Alternatives considered

* use or customise a generic MRP;
* build a narrower Clean Eats-only system;
* build a food-specific reusable product.

### Chosen approach

Food-specific multi-tenant operating system.

### Why it won

Food manufacturing requires connected depth around:

* recipes;
* yields;
* lots;
* QA;
* expiry;
* production;
* dispatch.

### Consequence

EveryBatch accepts a narrower market in exchange for stronger relevance.

### Current status

Still current.

### Revisit only if

The product later proves naturally useful to adjacent industries without weakening food workflows.

---

## H2. Decision: Clean Eats is Tenant 1, not the hard-coded application

**CONFIRMED FROM OUR CONVERSATION**

### Alternatives

* build a bespoke Clean Eats platform;
* build generic SaaS first without real tenant;
* build multi-tenant architecture using Clean Eats as operational test.

### Chosen approach

Clean Eats is the first tenant and proving ground.

### Why

It gives:

* real data;
* real users;
* real problems;
* real feedback.

### Consequence

All reusable logic should remain tenant-safe.

### Current status

Core product principle.

---

## H3. Decision: Use EveryBatch as the real product name

**CONFIRMED FROM OUR CONVERSATION**

### Alternatives

* Clean Eats Hub;
* Food Prod Hub;
* Food Production Hub;
* other brand names explored in the naming conversation.

### Chosen approach

EveryBatch.

### Why

* memorable;
* manufacturing-specific;
* traceability-oriented;
* scalable beyond Clean Eats.

### Consequence

Internal names should not leak into customer-facing UI.

---

## H4. Decision: Use “Food Manufacturing OS” positioning

**CONFIRMED FROM OUR CONVERSATION**

### Alternatives

* MRP;
* ERP;
* Inventory Platform;
* Production Hub;
* Costing System.

### Why “OS” won

The platform spans multiple operational modules while preserving ownership boundaries.

### Risk

Do not overstate maturity.

“Operating System” is positioning, not proof every operational module is complete.

---

## H5. Decision: Use Next.js, Supabase and Vercel

**CONFIRMED FROM PROJECT CONTEXT**

### Alternatives

* WordPress/Squarespace-style platform;
* separate backend;
* low-code tool;
* custom traditional server.

### Why chosen

* rapid iteration;
* TypeScript;
* server actions;
* Auth/RLS;
* Vercel previews;
* Codex-friendly repo;
* shared technical ecosystem for future marketing site.

### Consequence

Need to manage:

* Server Component patterns;
* Server Action boundaries;
* App Router loading;
* Supabase SSR;
* Vercel host routing.

---

## H6. Decision: One authenticated application codebase with multiple host modes

**CONFIRMED FROM OUR CONVERSATION**

### Alternatives

* separate repo/app for each tenant;
* separate app for Platform Admin;
* separate app for Support;
* one multi-host codebase.

### Chosen approach

One app codebase with:

* central app;
* tenant app;
* Platform Admin;
* Support;
* local mode.

### Why

* shared components;
* shared auth;
* shared deployment;
* consistent product;
* lower maintenance.

### Consequence

Host routing must be carefully isolated.

---

## H7. Decision: Keep the marketing website separate

**CONFIRMED FROM PROJECT CONTEXT**

### Alternatives

* place marketing pages in the authenticated app repo;
* use Squarespace;
* use WordPress;
* use Framer/Webflow;
* separate Next.js site.

### Chosen recommendation

Separate Next.js/Vercel marketing repository.

### Why

* independent deployments;
* public security boundary;
* marketing redesign freedom;
* same technical language;
* no interference with operations.

### Current status

Planned, not necessarily implemented.

---

## H8. Decision: Tenant Admin and Platform Admin are different systems

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Treat Platform Admin as just another tenant module.

### Why rejected

Platform Admin:

* spans tenants;
* provisions organisations;
* manages platform features;
* handles support;
* eventually handles billing and health.

Tenant Admin:

* manages one organisation;
* manages users/settings/modules.

### Consequence

Platform Admin is excluded from tenant sidebar.

---

## H9. Decision: RLS from the beginning

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Rely on server-side filtering and add RLS later.

### Why rejected

Retrofitting tenant isolation after real data exists is risky.

### Consequence

Every new schema task must consider:

* policies;
* tenant FKs;
* permissions;
* membership.

---

## H10. Decision: Permissions over direct role checks

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Write business logic such as:

* if role is warehouse manager;
* if role is QA manager.

### Chosen direction

Permission keys express capabilities.

### Why

* roles evolve;
* tenant access can vary;
* test/demo roles;
* future customisation.

### Consequence

Prompts must inspect existing permission naming.

---

## H11. Decision: No service-role use in tenant application workflows

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Use service role server-side to avoid RLS complexity.

### Why rejected

It would bypass the central tenant-security model.

### Exception

Platform-level controlled background operations may eventually use elevated credentials, but not ordinary tenant CRUD.

### Current status

Strong standing rule.

---

## H12. Decision: Stock movements are the inventory ledger

**CONFIRMED FROM OUR CONVERSATION**

### Alternatives

* update a stock quantity column;
* store quantity only on lot;
* append movements and derive balance.

### Chosen approach

Append movements and derive Stock On Hand.

### Why

* auditability;
* reversals;
* traceability;
* production integration;
* stocktake;
* transfers.

### Consequence

Movement history must not be silently edited.

---

## H13. Decision: Stock On Hand is derived

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Maintain a user-editable balance table as operational truth.

### Why rejected

It would drift from movement history.

### Consequence

Corrections must enter through ledger-producing workflows.

---

## H14. Decision: Supplier invoices do not auto-post stock

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Invoice line immediately creates received stock.

### Why rejected

Invoice evidence is not proof of:

* physical receipt;
* location;
* lot;
* temperature;
* damage;
* quantity;
* acceptance.

### Chosen flow

Invoice evidence
→ draft Goods Inwards
→ user review
→ post.

---

## H15. Decision: Parsed prices do not auto-become approved costing prices

**CONFIRMED FROM OUR CONVERSATION**

### Why

Invoice parsing may be wrong or contextually misleading.

### Chosen flow

Observation
→ review/mapping
→ approval
→ costing.

---

## H16. Decision: Use components and finished products, not one flat recipe type

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

All meals use only raw ingredient lines.

### Why rejected

Clean Eats produces intermediate components.

### Consequence

Components have formulas and costs.

Finished products may consume components.

---

## H17. Decision: Formula versions preserve historical composition

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Edit one live recipe in place.

### Why rejected

Past cost and production context would become unreliable.

### Consequence

Published or historical formula references should remain stable.

---

## H18. Decision: Costing snapshots preserve historical calculations

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Recalculate history from current formula and price.

### Why rejected

The result would not represent what was known at the time.

### Consequence

Snapshot values are immutable.

---

## H19. Decision: Safe metric conversions can be global; pack conversions cannot

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Treat a box, bunch or carton as having a universal quantity.

### Why rejected

Pack sizes vary by:

* supplier;
* item;
* effective date;
* tenant.

### Consequence

UOM rules are tenant/item/supplier-item specific.

---

## H20. Decision: Reverse conversion is explicit

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Assume every conversion can be reversed.

### Why rejected

Some conversions are intended only for:

* purchase → internal unit;
* display;
* costing;
* receiving.

Reverse use can be misleading.

### Consequence

Use `allow_reverse`.

---

## H21. Decision: Goods Inwards posting should be transactional

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Sequential server action writes.

### Why replaced

Partial-write risk.

### Chosen solution

Postgres RPC.

### Consequence

Database becomes posting authority.

---

## H22. Decision: Dedicated line-edit route after runtime instability

**CONFIRMED FROM OUR CONVERSATION**

### Alternatives attempted

* inline form inside repeated receipt lines;
* helper component;
* removal of `<details>`.

### Problem

`ownerTask.run is not a function`

### Final choice

Dedicated edit route.

### Why

* stable action boundary;
* clearer UI;
* simpler testing.

### Current status

Preserve unless later refactor is proven safe.

---

## H23. Decision: Platform Admin may have diagnostic read, but default tenant writes need restraint

**CONFIRMED FROM OUR CONVERSATION**

### Early convenience

Global Platform Admin bypass simplified operator access.

### Later concern

External tenants may require:

* audited support access;
* scoped impersonation;
* explicit support session;
* restricted data visibility.

### Current status

Partly parked.

Requires repository verification and future hardening.

---

## H24. Decision: Support is authenticated and in-product

**CONFIRMED FROM OUR CONVERSATION**

### Alternatives

* public docs only;
* external ticket form;
* email support.

### Chosen approach

Authenticated Help Centre and tickets.

### Why

* tenant context;
* page context;
* secure operational support;
* SaaS credibility.

---

## H25. Decision: Support Help Centre is not tenant document management

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Use Support guides to store SOPs/QA documents.

### Why rejected

They have different ownership and audiences.

### Consequence

Future QA Documents requires its own boundary.

---

## H26. Decision: Fake data should be removed as modules become real

**CONFIRMED FROM OUR CONVERSATION**

### Early alternative

Keep sample rows for visual completeness.

### Why later rejected

Staff may assume the data is real.

### Chosen rule

Real data or honest empty state.

### Exception

Clearly identified temporary test records.

---

## H27. Decision: Rich dashboards wait for real source data

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Implement the full visual mockups immediately using placeholders.

### Why rejected

* misleading;
* architecture could be shaped around fake metrics;
* unnecessary rework.

### Chosen sequence

Source modules first, dashboard pass later.

---

## H28. Decision: Performance optimisation is deferred until broader functionality exists

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Pause functional build to optimise early shell/query performance.

### Why deferred

Current flows were still changing.

### Consequence

Known slow routes were accepted temporarily.

### Revisit when

* staff testing begins;
* performance blocks work;
* module architecture stabilises.

---

## H29. Decision: Foundation before perfection

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Build final enterprise permissions and edge-case lifecycle before first workflow use.

### Why rejected

Clean Eats feedback will reveal:

* real roles;
* necessary approvals;
* actual edge cases.

### Non-negotiable foundation

Still require:

* RLS;
* tenant isolation;
* safe permissions;
* immutable history;
* correct ownership;
* no irreversible corruption.

---

## H30. Decision: Staff validate a working base, not a blank design

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Run discovery sessions before building any module flow.

### Chosen approach

Luke and architect build a sensible base.

Staff then refine:

* terminology;
* sequence;
* responsibilities;
* exceptions.

### Why

Luke already understands high-level operations.

Staff time is more valuable when reacting to something concrete.

---

## H31. Decision: CRM stays lightweight until its operational purpose is clear

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Build a full generic CRM because the module exists.

### Why deferred

Clean Eats’ near-term needs centre on operations.

Potential CRM needs:

* wholesale accounts;
* contacts;
* complaints;
* future lead pipeline.

### Current status

Requires later scope decision.

---

## H32. Decision: Reports wait for source workflows

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Build report pages before source modules are operational.

### Why deferred

Reports without reliable source records become placeholder dashboards.

### Chosen direction

Build first reports from:

* existing inventory;
* receipts;
* costs;
* production plans.

Add QA/Logistics reports after those modules mature.

---

## H33. Decision: Tools should not become a dumping ground

**CONFIRMED FROM OUR CONVERSATION**

### Alternative rejected

Place any unusual workflow under Tools.

### Chosen definition

Tools contains:

* imports;
* mapping;
* diagnostics;
* exports;
* utility workflows.

Operational ownership remains elsewhere.

---

## H34. Decision: Marketing site uses real product screenshots eventually

**CONFIRMED FROM PROJECT CONTEXT**

### Alternative

Publish AI-generated UI mockups as product screenshots.

### Why rejected

It could create false expectations.

### Chosen use

AI mockups guide design only.

Real product screens should be used publicly once polished and privacy-safe.

---

## H35. Decision: Early pricing remains “Talk to Sales”

**CONFIRMED FROM PROJECT CONTEXT**

### Alternative

Publish invented monthly tiers immediately.

### Why rejected

Unknowns include:

* onboarding;
* support;
* storage;
* users;
* integrations;
* facilities;
* document processing.

### Future direction

Create plan names and positioning without committing to untested prices.

---

## H36. Decision: No instant uncontrolled tenant signup initially

**CONFIRMED FROM PROJECT CONTEXT**

### Alternative

Marketing form directly provisions an active tenant.

### Why rejected

Provisioning still lacked:

* first admin;
* domain;
* billing;
* onboarding;
* data import;
* support readiness.

### Chosen direction

Controlled demo/qualification/onboarding flow.

---

## H37. Decision: Task roadmap belongs to Luke, not Codex

**CONFIRMED FROM OUR CONVERSATION**

### Trigger

Tasks 211–212 drifted.

### Lesson

Codex may recommend sequencing.

Luke approves changes.

### Consequence

Prompts now explicitly say:

* do not renumber;
* do not reorder;
* do not combine;
* do not pull forward future work.

---

## H38. Decision: Task docs are required, not optional

**CONFIRMED FROM OUR CONVERSATION**

### Alternative

Rely on commit history and summaries.

### Why rejected

Long-running AI-assisted projects need repository memory.

### Consequence

Each numbered task should create/update documentation.

---

## H39. Decision: Large migrations may be reviewed by file + checksum

**CONFIRMED FROM OUR CONVERSATION / later context**

### Original rule

Paste full SQL.

### Problem

A 2,000+ line migration may be truncated.

### Revised accepted method

* exact uploaded file;
* line count;
* SHA-256;
* architect review.

### Current status

Use proportionately.

---

## H40. Decision: UI consistency should be addressed in coordinated passes

**CONFIRMED FROM OUR CONVERSATION**

### Examples

* canonical routes;
* loading states;
* page headers;
* mobile layout;
* status colours;
* table overflow.

### Alternative rejected

Fix each inconsistency opportunistically inside unrelated functional tasks.

### Why

Piecemeal changes create further inconsistency.

### Current status

Backlog/planned review.

---

# End of Part 5

Part 6 will continue with:

# PART I — FUTURE IDEAS, DEFERRED WORK AND UNRESOLVED QUESTIONS

It will organise deferred work into:

1. High-priority roadmap candidates
2. Foundation follow-ups
3. UI consistency
4. Operational hardening
5. Security hardening
6. Performance
7. Platform Admin
8. Support
9. Data import and mapping
10. Production
11. QA
12. Inventory and traceability
13. Reports
14. CRM/customer/orders
15. Logistics
16. Marketing/commercial
17. Items needing Luke confirmation
18. Items needing Clean Eats staff confirmation
19. Uncertain historical ideas

Part 6 will then continue into:

# PART J — LUKE’S PRODUCT AND COLLABORATION PREFERENCES
# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 6 — Deferred work, unresolved questions, and Luke’s product/collaboration preferences

This part continues the requested dossier structure, covering the major backlog, uncertain future areas, and the working style that shaped how EveryBatch was designed and reviewed. 

---

# PART I — FUTURE IDEAS, DEFERRED WORK AND UNRESOLVED QUESTIONS

Nothing in this section should be treated as automatically approved roadmap scope.

The purpose is to preserve ideas, gaps, follow-ups and future directions so they are not lost.

---

## I1. High-priority roadmap candidates

These were among the strongest future candidates based on the original architecture period.

### Complete remaining visible module foundations

**CONFIRMED FROM OUR CONVERSATION**

Priority modules:

* QA;
* Logistics;
* Reports;
* Tools;
* Production workspaces still using scaffolds;
* CRM at a lighter level.

The goal was to ensure each visible module had:

* correct workspace structure;
* real records where possible;
* real create/edit/read flows where appropriate;
* honest empty states;
* clear source ownership;
* useful support context.

---

### Module dashboard alignment pass

**CONFIRMED FROM OUR CONVERSATION**

Once child workspaces are operational, each module dashboard should summarise its own module.

Examples:

#### Inventory

* recent Goods Inwards;
* stock rows;
* held stock;
* movement activity;
* expiry issues;
* quick actions.

#### Products

* suppliers;
* items;
* formula readiness;
* unmapped items;
* missing formulas;
* UOM issues.

#### Costings

* blocked costs;
* price changes;
* margin risks;
* snapshot history;
* missing approved prices.

#### Production

* plans;
* batches;
* blocked lines;
* areas;
* tasks;
* QA readiness.

#### QA

* checks due;
* failed checks;
* holds;
* review queue;
* non-conformance future.

#### Logistics

* dispatch runs;
* manifests;
* configured carriers;
* readiness;
* delivery issues future.

### Rule

No fake counts.

---

### Home dashboard rebuild

**CONFIRMED FROM OUR CONVERSATION**

After module dashboards become real, the main Dashboard should become a true cross-module operating overview.

Potential widgets:

* production today;
* low stock;
* QA due;
* Goods Inwards activity;
* dispatch readiness;
* formula blockers;
* costing alerts;
* open support or system warnings;
* tenant setup readiness.

This should be a coordinated project, not incidental additions.

---

### Documentation and module consistency audit

**CONFIRMED FROM OUR CONVERSATION**

A future repository-wide audit should check:

* missing task documents;
* stale task references;
* roadmap conflicts;
* migration application status;
* outdated implementation descriptions;
* fake-data references;
* route inconsistencies;
* module UI gaps;
* support coverage;
* source-of-truth contradictions.

This audit should first report findings rather than silently rewriting all documentation.

---

## I2. Foundation follow-ups

### UOM rule integration

**CONFIRMED FROM OUR CONVERSATION**

UOM rules exist but need to be integrated into:

* Supplier Invoice Intake;
* approved price interpretation;
* Goods Inwards;
* cost calculations;
* production requirements;
* reports.

### Important safeguard

Do not apply a conversion simply because one exists.

The lookup must account for:

* scope priority;
* effective dates;
* active status;
* supplier-item specificity;
* item specificity;
* direction;
* unit normalisation.

---

### Stock Adjustment and Reversal

**CONFIRMED FROM OUR CONVERSATION**

Planning exists.

Future work likely includes:

* adjustment source record;
* adjustment lines;
* positive/negative movement;
* reversal link;
* posting RPC;
* immutable posted state;
* Stock On Hand update;
* Traceability visibility;
* reason codes;
* permission separation.

### Parked reason

Useful, but QA and wider module readiness became more urgent.

---

### Inventory transfers

**CONFIRMED FROM PROJECT CONTEXT / ARCHITECT INFERENCE**

A transfer should likely create:

* outbound movement from source location;
* inbound movement to destination location;
* one shared transfer source record;
* same lot identity where appropriate.

Do not “change location” on historical movement rows.

---

### Stocktake

**CONFIRMED FROM PROJECT CONTEXT / ARCHITECT INFERENCE**

Likely future workflow:

1. create stocktake;
2. select location/scope;
3. record counted quantities;
4. compare expected;
5. review variance;
6. post adjustment movements;
7. lock stocktake.

Needs careful UOM and lot handling.

---

### Purchasing foundation

**CONFIRMED FROM OUR CONVERSATION**

Purchasing remained incomplete.

Potential future records:

* purchase orders;
* purchase order lines;
* supplier;
* expected delivery;
* ordered unit;
* received quantity;
* invoice matching;
* status;
* approval;
* reorder suggestion.

Purchasing should not be built merely as another document list.

It should eventually connect:

Stock requirements
→ Purchase Order
→ Supplier Invoice
→ Goods Inwards
→ variance.

---

### Inventory expiry and FEFO

**CONFIRMED FROM OUR CONVERSATION**

Future functions:

* expiry/use-by alerts;
* lots expiring soon;
* FEFO allocation;
* blocked/held expiry treatment;
* disposal workflow;
* reporting.

Exact shelf-life rules require tenant configuration.

---

## I3. UI consistency work

### Canonical routes

**CONFIRMED FROM OUR CONVERSATION**

Review:

* nested versus short routes;
* redirects;
* breadcrumbs;
* support context;
* active sidebar state;
* browser titles.

Do this in one planned pass.

---

### Loading states

**CONFIRMED FROM OUR CONVERSATION**

Apply consistent loading states to:

* QA;
* Logistics;
* Reports;
* Tools;
* Platform Admin;
* remaining slow detail pages.

Preserve:

* AppShell;
* navigation;
* clear progress indication.

---

### Page header consistency

**CONFIRMED FROM OUR CONVERSATION**

Audit:

* title;
* description;
* primary action;
* status;
* entity reference;
* support/help;
* spacing;
* mobile stacking.

---

### Action feedback consistency

**CONFIRMED FROM OUR CONVERSATION**

Standardise:

* pending buttons;
* validation messages;
* blocking reasons;
* success panels;
* redirected state;
* duplicate submission protection.

---

### Status-colour system

**CONFIRMED FROM OUR CONVERSATION**

Create a coherent semantic status system.

Potential categories:

* neutral;
* active;
* success;
* warning;
* danger;
* held;
* informational;
* archived.

Tenant theme colours should not override safety semantics.

---

### Table responsiveness

**CONFIRMED FROM OUR CONVERSATION**

Audit:

* overflow;
* wrapping;
* action columns;
* mobile cards;
* sticky headers where useful;
* pagination;
* dense operational tables.

---

### Sidebar behaviour

**CONFIRMED FROM OUR CONVERSATION**

Potential improvements:

* auto-close previously expanded module;
* preserve active module expansion;
* better collapsed tooltips;
* icon consistency;
* responsive drawer;
* avoid duplicate dashboards.

---

### Platform Admin responsive pass

**CONFIRMED FROM OUR CONVERSATION**

Known issue:

* Platform Admin mobile layout remained weaker than tenant shell.

Future work:

* responsive nav;
* mobile page header;
* cards/tables;
* tenant detail layout;
* support inbox;
* wizard forms.

---

## I4. Operational hardening

### Approval and separation-of-duty rules

**CONFIRMED FROM OUR CONVERSATION**

Do not overbuild early, but real usage should determine:

* who can complete;
* who can review;
* who can approve;
* who can release;
* whether same-user approval is allowed;
* when dual approval is required.

Likely relevant to:

* QA;
* stock adjustment;
* pricing;
* formulas;
* production release;
* tenant provisioning.

---

### Audit business events

**CONFIRMED FROM OUR CONVERSATION**

Potential events:

* receipt posted;
* UOM rule activated;
* formula version published;
* costing snapshot created;
* production plan approved;
* QA check completed;
* hold placed/released;
* manifest generated;
* tenant provisioned;
* user invited;
* role changed.

Task numbers 244–245 were originally reserved for audit-event planning and implementation, but current roadmap may differ.

---

### Attachments and evidence

**CONFIRMED FROM OUR CONVERSATION**

Potential modules needing attachments:

* Support;
* QA;
* Supplier documents;
* Logistics delivery issues;
* stock adjustments;
* production incidents.

Needs:

* private storage;
* MIME limits;
* tenant paths;
* signed access;
* audit;
* archive;
* internal versus customer visibility.

---

### Notification system

**CONFIRMED FROM PROJECT CONTEXT**

Potential notifications:

* support reply;
* check due;
* check failed;
* hold placed;
* approval required;
* production blocker;
* dispatch issue;
* import complete.

Start with in-app queues before building a large notification system.

---

### Data retention and archive policy

**ARCHITECT INFERENCE**

Future external tenants will need decisions around:

* document retention;
* archived tenant data;
* cancelled tenant export;
* deleted users;
* inactive suppliers;
* support records;
* audit logs;
* attachments.

---

## I5. Security hardening

### `post_inventory_receipt` Security Advisor warning

**CONFIRMED FROM OUR CONVERSATION**

Parked warning:

> Signed-In Users Can Execute SECURITY DEFINER Function

Future review should verify:

* function body;
* grants;
* helper security;
* role inheritance;
* explicit permission;
* search path;
* future changes;
* whether Security Invoker is feasible;
* whether audited operator access is needed.

---

### Leaked Password Protection warning

**CONFIRMED FROM OUR CONVERSATION**

Supabase Auth warning remained parked.

Should be reviewed before broader rollout.

---

### Platform Admin tenant access

**CONFIRMED FROM OUR CONVERSATION**

Before onboarding external tenants, review:

* global read bypass;
* operational data visibility;
* support-access audit;
* tenant consent;
* impersonation/session model;
* support escalation;
* break-glass access.

---

### Permission matrix audit

**CONFIRMED FROM OUR CONVERSATION**

After real staff roles are known, perform a full matrix review:

* role;
* module;
* view/create/manage/post/approve;
* sensitive actions;
* demo access;
* tablet access;
* Platform Admin exceptions.

### Reason

Early permissions were conservative but partly generic.

Real usage will show:

* excessive grants;
* missing grants;
* operational role overlap.

---

### RLS and composite-FK audit

**ARCHITECT INFERENCE**

A future security pass should identify:

* tables without RLS;
* cross-tenant nullable foreign keys;
* policies using broad role conditions;
* Platform Admin bypasses;
* actor attribution gaps;
* missing same-tenant uniqueness indexes.

---

### Storage-policy audit

**CONFIRMED FROM OUR CONVERSATION**

Review:

* purchase documents;
* branding;
* support attachments;
* future QA evidence.

Avoid broad policies.

---

## I6. Performance

### AppShell navigation-context performance

**CONFIRMED FROM OUR CONVERSATION**

This was one of the largest known delays.

Potential areas:

* permission fetching;
* module fetching;
* feature-flag fetching;
* navigation construction;
* duplicate queries;
* caching;
* server request waterfalls.

### Important caution

Caching security-sensitive context must preserve:

* role changes;
* membership changes;
* module changes;
* feature-flag changes.

---

### Dashboard query performance

**CONFIRMED FROM OUR CONVERSATION**

Multiple module helpers ran during Dashboard render.

Potential improvements:

* parallel query execution;
* query consolidation;
* smaller data projections;
* aggregate queries;
* stable caching;
* loading boundaries.

---

### Stock On Hand performance

**CONFIRMED FROM OUR CONVERSATION**

Direct aggregation is safe for early volume.

Future scale may require:

* SQL view;
* indexed aggregation;
* materialised read model;
* event-maintained summary;
* pagination.

Do not introduce a stale summary without reconciliation.

---

### Traceability performance

**CONFIRMED FROM OUR CONVERSATION**

Inbound Traceability was already slow with few records.

Potential reasons:

* multiple sequential queries;
* cross-record enrichment;
* AppShell delay;
* broad data fetch;
* invoice evidence permission checks.

Future options:

* RPC;
* SQL view;
* batched joins;
* indexed source IDs;
* request-specific trace result;
* search-first rather than load-all.

---

### Search performance

**ARCHITECT INFERENCE**

As modules grow, Global Search may need:

* search indexes;
* limited result counts;
* scoped queries;
* server-side ranking;
* tenant-safe search views.

---

### Large-list pagination

**CONFIRMED FROM PROJECT CONTEXT**

Future high-volume lists requiring pagination:

* stock movements;
* support tickets;
* purchase documents;
* QA checks;
* dispatch runs;
* audit events;
* imports;
* products.

---

## I7. Platform Admin

### Tenant health

**CONFIRMED FROM OUR CONVERSATION**

Potential indicators:

* modules enabled;
* users configured;
* branding complete;
* domain configured;
* product data present;
* formulas active;
* approved prices;
* locations;
* first receipt;
* QA templates;
* dispatch configuration;
* support state;
* schema readiness.

---

### Tenant diagnostics

**CONFIRMED FROM OUR CONVERSATION**

Potential diagnostics:

* missing permissions;
* failed feature flags;
* orphan mappings;
* blocked costings;
* unposted receipts;
* missing locations;
* overdue QA;
* active holds;
* no production areas;
* no carrier configuration;
* storage errors.

---

### Tenant lifecycle

**CONFIRMED FROM PROJECT CONTEXT**

Future statuses:

* prospect;
* provisioning;
* onboarding;
* trial;
* active;
* suspended;
* archived;
* cancelled.

Need to distinguish:

* organisation row lifecycle;
* billing lifecycle;
* domain lifecycle;
* user access;
* data retention.

---

### First admin creation

**CONFIRMED FROM OUR CONVERSATION**

Current tenant creation did not fully create:

* Auth user;
* profile;
* membership;
* invitation.

Future onboarding requires a transaction-safe or controlled flow.

---

### Domain management

**CONFIRMED FROM OUR CONVERSATION**

Future Platform Admin should manage:

* tenant subdomain;
* custom domain;
* verification;
* routing;
* certificate state;
* fallback domain;
* domain conflict.

---

### Billing readiness

**CONFIRMED FROM PROJECT CONTEXT**

Deferred until pricing and commercial model are clearer.

Potential future concepts:

* plan;
* seats;
* facilities;
* document volume;
* usage;
* implementation fee;
* support tier;
* status;
* invoice provider.

---

### Release and version visibility

**ARCHITECT INFERENCE**

Future tenant diagnostics may show:

* current application release;
* enabled beta features;
* schema migration status;
* release notes;
* known issue.

---

## I8. Support

### Attachment UI

**CONFIRMED FROM OUR CONVERSATION**

Schema exists.

Future UI needs:

* upload;
* progress;
* visibility;
* signed access;
* file preview;
* customer/internal distinction;
* archive.

---

### Support access audit

**CONFIRMED FROM OUR CONVERSATION**

Before external tenants, support staff access should be:

* deliberate;
* permissioned;
* auditable;
* time-bounded where appropriate.

---

### Context diagnostics

**CONFIRMED FROM OUR CONVERSATION**

Support ticket context could eventually include:

* module;
* route;
* entity ID;
* browser;
* tenant;
* feature flags;
* permission snapshot;
* request/correlation ID;
* recent error.

Must avoid leaking secrets or unrelated tenant data.

---

### Guide lifecycle

**ARCHITECT INFERENCE**

As modules evolve, guides need:

* status;
* last reviewed date;
* linked routes;
* module ownership;
* version/release relevance.

---

### Help Centre search

**CONFIRMED FROM PROJECT CONTEXT**

Potential future feature.

Should search:

* guides;
* troubleshooting;
* release notes.

Do not mix support-ticket private content into general search.

---

## I9. Data import and mapping

### Formula Import

**CONFIRMED FROM OUR CONVERSATION**

Potential stages:

1. upload workbook;
2. detect sheet/template;
3. parse rows;
4. map items;
5. validate units;
6. validate formula hierarchy;
7. preview versions;
8. approve;
9. apply transactionally;
10. show results/errors.

### Important rule

No automatic destructive import.

---

### Item Mapping QA

**CONFIRMED FROM OUR CONVERSATION**

Needed for:

* supplier item mapping;
* unit mismatches;
* conversion blockers;
* price evidence;
* mapping confidence;
* stale mappings.

---

### Product bulk import

**ARCHITECT INFERENCE**

Future tenants need setup imports for:

* suppliers;
* items;
* locations;
* formulas;
* users;
* carriers.

Need staging and validation.

---

### Clean Eats formula workbook

**CONFIRMED FROM PROJECT CONTEXT**

The current collection workbook is an important initial import format but should not become the only global file format.

---

### Import provenance

**ARCHITECT INFERENCE**

Imported records should preserve:

* import batch;
* source row;
* source file;
* actor;
* result;
* error;
* applied record ID.

---

## I10. Production

### Input requirement generation

**CONFIRMED FROM OUR CONVERSATION**

Given:

* planned output quantity;
* formula version;
* formula output quantity;

calculate required inputs.

Must consider:

* component hierarchy;
* loss/yield;
* units;
* batch rounding;
* planned quantity.

---

### Stock availability check

**CONFIRMED FROM OUR CONVERSATION**

Compare required inputs against:

* available Stock On Hand;
* held stock excluded;
* relevant unit;
* lot/location;
* future allocation.

Need to distinguish:

* available;
* short;
* mixed unit;
* conversion required;
* no stock.

---

### Production release

**CONFIRMED FROM OUR CONVERSATION**

Release should represent commitment to execution.

Potential checks:

* approved plan;
* formula active;
* stock available;
* QA/pre-op ready;
* area assigned;
* batch size valid.

---

### Lot allocation

**CONFIRMED FROM OUR CONVERSATION**

Future issue process should select:

* lot;
* location;
* quantity;
* unit.

Potential allocation strategy:

* FEFO;
* manual override;
* held stock excluded;
* insufficient stock blocker.

---

### Production stock issue

**CONFIRMED FROM OUR CONVERSATION**

Should create outbound movements tied to:

* batch;
* input;
* lot;
* location;
* actor;
* quantity.

No editing historical receipt movement.

---

### Production output

**CONFIRMED FROM OUR CONVERSATION**

Completion should create:

* output lot;
* inbound movement;
* production batch source;
* quantity;
* unit;
* location;
* QA state.

---

### Yield and waste

**CONFIRMED FROM OUR CONVERSATION**

Future reporting should compare:

* planned input;
* actual input;
* planned output;
* actual output;
* waste;
* variance.

---

### Production tasks

**CONFIRMED FROM OUR CONVERSATION**

Future task model:

* title;
* area;
* plan/batch;
* due;
* assignee/team;
* state;
* priority;
* instructions;
* events;
* QA dependency.

---

### Facility/iPad View

**CONFIRMED FROM OUR CONVERSATION**

Needs:

* area-specific queue;
* large controls;
* minimal typing;
* safe shared-device identity;
* clear current work;
* controlled updates;
* visible QA blockers.

---

### Existing production-report integration

**ARCHITECT INFERENCE**

Potential approaches:

* recreate logic natively;
* import output from existing tool;
* use existing tool during transition;
* compare results before retirement.

Do not replace proven production logic prematurely.

---

## I11. QA

### Template import and setup

**CONFIRMED FROM PROJECT CONTEXT**

Future tenants will need:

* standard starting templates;
* tenant copy;
* versioning;
* area/item linkage;
* staff review.

Avoid global hard-coded Clean Eats checklists.

---

### Production QA

**CONFIRMED FROM OUR CONVERSATION**

Deferred beyond initial Receiving QA.

Potential first production checks:

* pre-op;
* cook temperature;
* chill;
* batch verification;
* label;
* seal;
* release.

---

### Temperature-monitoring architecture

**CONFIRMED FROM PROJECT CONTEXT**

Need decisions around:

* generic typed check result;
* dedicated temperature observation;
* equipment/location relationship;
* calibration;
* critical limits;
* alerts.

---

### HACCP/CCP

**CONFIRMED FROM OUR CONVERSATION**

EveryBatch should support tenant procedures.

Future functionality:

* CCP definition;
* limit;
* monitoring;
* failure;
* correction;
* verification;
* sign-off.

No certification claims.

---

### Non-Conformance and Corrective Action

**CONFIRMED FROM PROJECT CONTEXT**

Full operational schema was intentionally deferred beyond initial QA foundation.

Future process may include:

* issue;
* containment;
* root cause;
* corrective action;
* owner;
* due;
* verification;
* closure.

Avoid overbuilding enterprise CAPA early.

---

### QA documents and evidence

**CONFIRMED FROM OUR CONVERSATION**

Future:

* SOP;
* HACCP plan;
* certificate;
* allergen declaration;
* calibration;
* evidence photo;
* completed record export.

Must remain distinct from Support Help Centre.

---

### Recall workflow

**CONFIRMED FROM OUR CONVERSATION**

Future recall capability depends on:

* inbound lot;
* production consumption;
* finished output;
* dispatch;
* customer/order;
* QA;
* audit.

The original platform only had inbound traceability.

---

## I12. Inventory and traceability

### Full forward traceability

**CONFIRMED FROM OUR CONVERSATION**

Future chain:

Supplier lot
→ receipt line
→ inventory lot
→ production input
→ production batch
→ output lot
→ dispatch
→ customer/order.

---

### Recall report

**CONFIRMED FROM OUR CONVERSATION**

Potential report:

Given:

* supplier lot;
* ingredient;
* production batch;
* finished-product lot;

show affected:

* outputs;
* dispatches;
* customers;
* dates;
* quantities.

Requires completed production and logistics links.

---

### Supplier return

**CONFIRMED FROM OUR CONVERSATION**

Future workflow should create:

* source event;
* outbound movement;
* supplier/receipt/lot relationship;
* reason;
* quantity;
* status;
* possible credit/invoice reference.

---

### Waste and disposal

**CONFIRMED FROM OUR CONVERSATION**

Should likely create:

* operational source event;
* outbound movement;
* reason;
* QA/hold relationship;
* actor;
* evidence future.

---

### Negative-stock policy

**ARCHITECT INFERENCE**

Needs tenant/system decision:

* block;
* allow with warning;
* manager override;
* diagnostic report.

Should not emerge accidentally from inconsistent writes.

---

## I13. Reports

### Inventory reports

**CONFIRMED FROM OUR CONVERSATION**

* receiving history;
* stock movements;
* current balance;
* expiry;
* held stock;
* lot traceability;
* adjustment history;
* negative stock.

---

### Costing reports

**CONFIRMED FROM OUR CONVERSATION**

* snapshot history;
* price changes;
* margin changes;
* missing prices;
* blocked costs;
* supplier comparisons.

---

### Production reports

**CONFIRMED FROM OUR CONVERSATION**

* planned versus produced;
* batch status;
* input requirement;
* shortages;
* output;
* yield;
* waste;
* task completion.

---

### QA reports

**CONFIRMED FROM OUR CONVERSATION**

* completion rate;
* failures;
* temperatures;
* holds;
* review time;
* NC/CA;
* supplier quality.

---

### Logistics reports

**ARCHITECT INFERENCE**

* dispatch status;
* manifest history;
* carrier/service usage;
* delivery issues;
* failed exports;
* on-time delivery.

---

### Audit reports

**CONFIRMED FROM OUR CONVERSATION**

* sensitive actions;
* record lifecycle;
* actor history;
* date/entity filters.

---

## I14. CRM, customers and orders

### Wholesale customer master

**CONFIRMED FROM OUR CONVERSATION**

Likely highest-value CRM use.

Potential fields:

* business;
* contacts;
* addresses;
* delivery requirements;
* terms;
* account status;
* carrier preference;
* notes.

---

### Order source architecture

**CONFIRMED FROM PROJECT CONTEXT**

Need to decide source ownership for:

* Shopify;
* wholesale order;
* recurring order;
* manual order;
* CSV import;
* API.

---

### Customer-specific pricing

**ARCHITECT INFERENCE**

May be required for wholesale.

Must not be mixed blindly with finished-product generic sell prices.

---

### Customer complaints

**CONFIRMED FROM PROJECT CONTEXT**

Future complaint could link:

* customer;
* order;
* dispatch;
* product;
* batch;
* QA non-conformance;
* support ticket.

Need ownership boundary between CRM, QA and Support.

---

### Marketing lead pipeline

**CONFIRMED FROM PROJECT CONTEXT**

Marketing website should capture:

* company;
* contact;
* food category;
* size;
* current systems;
* pain points;
* preferred demo time.

Lead should not immediately become a tenant.

---

## I15. Logistics

### Carrier configuration

**CONFIRMED FROM PROJECT CONTEXT — later implementation**

Later work added tenant carrier/service configuration.

Future work still includes:

* credentials;
* provider integration;
* export profile;
* carton rules;
* rate/service mapping;
* provider health.

---

### Carrier exports

**CONFIRMED FROM PROJECT CONTEXT**

Future workflow:

* select dispatch/manifest;
* apply carrier profile;
* validate required fields;
* generate file;
* preserve export history;
* show error;
* possibly transmit later.

---

### Detrack integration

**CONFIRMED FROM PROJECT CONTEXT**

Potential stages:

1. file export;
2. reviewed manual upload;
3. API connection;
4. status sync;
5. issue handling.

Do not imply API connection when only configuration exists.

---

### Carton calculation

**CONFIRMED FROM PROJECT CONTEXT**

Needs:

* carton capacity;
* product weighting;
* family-meal rules;
* carrier-specific requirements;
* channel rules.

Should be tenant/provider configuration.

---

### Delivery zones

**CONFIRMED FROM OUR CONVERSATION**

Potential purpose:

* postcode/suburb mapping;
* day;
* carrier;
* cutoff;
* delivery charge;
* service.

Needs order/customer integration.

---

### Delivery issues

**CONFIRMED FROM OUR CONVERSATION**

Potential records:

* failed delivery;
* damaged carton;
* late;
* missing;
* address;
* temperature;
* customer contact;
* resolution.

Could link QA and CRM.

---

### Wholesale versus residential dispatch

**CONFIRMED FROM PROJECT CONTEXT**

May need:

* distinct run type;
* different address/contact requirements;
* different carton rules;
* carrier;
* delivery window;
* manifest fields.

---

## I16. Marketing and commercial

### Marketing website

**CONFIRMED FROM PROJECT CONTEXT**

Recommended:

* separate Next.js repo;
* Vercel;
* same brand;
* real screenshots;
* code-managed content initially;
* CMS later.

---

### Launch pages

**CONFIRMED FROM PROJECT CONTEXT**

Potential initial pages:

* Home;
* Platform;
* Solutions;
* Traceability and Compliance;
* Pricing/Talk to Sales;
* Book a Demo;
* About;
* Security and Data;
* legal pages.

---

### Product story

**CONFIRMED FROM PROJECT CONTEXT**

Core narrative:

EveryBatch was born inside a real Australian food manufacturer after fragmented spreadsheets, generic software and disconnected workflows made operations harder than necessary.

---

### Pricing

**CONFIRMED FROM PROJECT CONTEXT**

Avoid invented public prices.

Potential positioning:

* Starter;
* Growth;
* Enterprise;

with:

* Talk to Sales;
* Book a Demo.

---

### Demo environment

**ARCHITECT INFERENCE**

Future needs:

* demo tenant;
* synthetic but realistic data;
* privacy-safe screenshots;
* reset capability;
* safe permissions;
* clear limitations;
* guided walkthrough.

---

### Onboarding package

**CONFIRMED FROM PROJECT CONTEXT**

Potential implementation stages:

* discovery;
* data templates;
* supplier/item import;
* formula import;
* user setup;
* module configuration;
* training;
* validation;
* go-live.

---

### Billing

**CONFIRMED FROM PROJECT CONTEXT**

Deferred until real cost model is understood.

Potential billing dimensions:

* facilities;
* users;
* volume;
* documents;
* support;
* implementation;
* integrations.

---

### Case study

**ARCHITECT INFERENCE**

Clean Eats could become the first EveryBatch case study once:

* workflows are stable;
* results are measurable;
* data sharing is approved;
* product screenshots are polished.

---

## I17. Items requiring Luke confirmation

1. Final current roadmap after later QA/Logistics changes.
2. Whether short canonical routes should apply to every workspace or only selected ones.
3. Whether Platform Admin global tenant read remains acceptable before external tenants.
4. Whether the Recipes workspace should remain separate from formula builders.
5. Exact future CRM scope.
6. Which Clean Eats external tools should be replaced versus integrated.
7. Whether Shopify order data belongs inside EveryBatch or is imported only for production/logistics.
8. Whether Xero integration is needed.
9. Whether Detrack should remain the final delivery system.
10. Whether Clean Eats uses one or multiple facilities operationally.
11. Whether warehouse and production teams need dedicated roles beyond current role set.
12. Whether staff should be able to use shared tablet accounts or individual sign-in only.
13. Whether pricing will be per tenant, facility, user, volume or hybrid.
14. Whether EveryBatch should ever support self-service trials.
15. Whether external tenant support access requires explicit tenant approval.
16. Whether marketing-site work should begin before the authenticated platform reaches demo readiness.
17. Whether staff testing tasks remain near 246–249 or move later.
18. Whether Stock Adjustment work should return before production stock issue.
19. Whether QA hold/release should use lot status, active hold derivation or both in the current implementation.
20. Whether reports should be implemented before or after more production/QA source data.

---

## I18. Items requiring Clean Eats staff confirmation

### QA

* exact receiving checklist;
* exact temperature limits;
* hold authority;
* release authority;
* QA review process;
* non-conformance workflow;
* corrective-action workflow;
* cleaning/pre-op schedules;
* CCPs;
* evidence requirements.

### Production

* exact production areas;
* task sequence;
* batch sizes;
* formula yields;
* prep dependencies;
* room responsibilities;
* tablet requirements;
* completion and exception handling.

### Warehouse

* receiving fields;
* stocktake;
* expiry;
* transfer;
* lot selection;
* negative stock;
* purchasing/reorder;
* quarantine process.

### Logistics

* dispatch run structure;
* carrier/services;
* carton rules;
* residential/wholesale differences;
* Detrack fields;
* export steps;
* delivery issue handling.

### Reports

* daily reports;
* compliance exports;
* management summaries;
* operational printouts.

---

## I19. Ideas remembered but not confidently reconstructable

**UNCERTAIN**

The following concepts may have been discussed but require confirmation or repository evidence:

* customer-specific meal pricing;
* allergen matrix;
* nutrition panel generation;
* label printing;
* barcode scanning;
* equipment maintenance;
* staff training records;
* calibration scheduling;
* facility capacity planning;
* shelf-life calculation;
* customer subscription/order forecasting;
* procurement approval thresholds;
* supplier scorecards;
* labour costing;
* roster integration;
* payroll or Xero linkage;
* automated email alerts;
* mobile push notifications.

Do not treat these as approved.

---

# PART J — LUKE’S PRODUCT AND COLLABORATION PREFERENCES

---

## J1. Luke wants practical software, not architecture theatre

**CONFIRMED FROM OUR CONVERSATION**

Luke values architecture when it produces:

* clearer workflows;
* safer data;
* easier staff use;
* fewer manual steps;
* reliable source records.

He becomes concerned when a foundation task turns into an open-ended enterprise-perfection exercise before the first UI exists.

### Preferred balance

* safe;
* coherent;
* usable;
* testable;
* extensible.

Not:

* theoretically complete;
* over-engineered;
* impossible to validate;
* delayed indefinitely.

---

## J2. Luke prefers foundation before perfection

**CONFIRMED FROM OUR CONVERSATION**

The preferred build approach:

1. understand workflow;
2. plan;
3. build foundation;
4. build first UI;
5. test with real data;
6. collect staff feedback;
7. harden.

### Important distinction

“Foundation before perfection” does not mean unsafe.

Luke still expects blockers to be fixed for:

* tenant leaks;
* RLS gaps;
* excessive permissions;
* history corruption;
* broken migrations;
* irreversible unsafe actions.

---

## J3. Luke understands Clean Eats operations

**CONFIRMED FROM OUR CONVERSATION**

Luke does not want every task blocked by:

> We need staff discovery first.

He can define:

* major modules;
* likely workflow;
* required records;
* relationships;
* high-level UI.

Staff should refine operational detail.

---

## J4. Luke prefers reacting to real screens over designing from a blank page

**CONFIRMED FROM OUR CONVERSATION**

The best staff-meeting approach is:

* show a real flow;
* let staff click;
* gather corrections;
* identify missing steps;
* adjust.

This is more effective than asking staff to invent software architecture.

---

## J5. Luke cares deeply about small UI details

**CONFIRMED FROM OUR CONVERSATION**

Examples:

* visible loading;
* route style;
* button pending;
* sidebar behaviour;
* helpful empty state;
* correct status colour;
* links to related records;
* no fake data;
* page title;
* tenant logo;
* active navigation.

These details may seem small technically, but they affect Luke’s trust in the product.

---

## J6. Luke notices inconsistency quickly

**CONFIRMED FROM OUR CONVERSATION**

If one module has:

* loading page;
* polished dashboard;
* short routes;
* good filters;

and another does not, Luke will notice.

He wants consistency reviewed deliberately rather than assuming each independently built page is acceptable.

---

## J7. Luke wants exact Codex prompts

**CONFIRMED FROM OUR CONVERSATION**

Do not give vague instructions such as:

> Ask Codex to fix the issue.

Provide:

* task identity;
* project root;
* exact problem;
* files to inspect;
* scope controls;
* required changes;
* checks;
* return format;
* commit message.

---

## J8. Luke wants automatic correction prompts

**CONFIRMED FROM OUR CONVERSATION**

When an architect identifies a problem, it should instinctively provide the ready-to-paste correction prompt.

Luke should not need to convert architectural feedback into Codex instructions himself.

---

## J9. Luke wants direct pass/fail decisions

**CONFIRMED FROM OUR CONVERSATION**

After reviewing Codex output, say:

* ready to test;
* fix before testing;
* safe to apply;
* do not apply;
* safe to commit;
* do not commit.

Avoid leaving the next action ambiguous.

---

## J10. Luke wants exact tests

**CONFIRMED FROM OUR CONVERSATION**

For UI:

* route;
* fields;
* values;
* steps;
* expected result;
* blocker scenario;
* happy path;
* access test.

For SQL:

* exact query;
* expected rows;
* what indicates failure.

---

## J11. Luke performs authenticated browser testing

**CONFIRMED FROM OUR CONVERSATION**

Codex often cannot test signed-in workflows.

Luke expects the architect to identify the high-risk flow and give a practical local test.

Do not claim a task works because:

* build passed;
* route compiled;
* schema was generated.

---

## J12. Luke manually applies Supabase migrations

**CONFIRMED FROM OUR CONVERSATION**

The architect should:

* review SQL;
* identify risk;
* tell Luke whether to apply;
* provide smoke checks;
* review results;
* approve commit.

---

## J13. Luke wants concise commit messages

**CONFIRMED FROM OUR CONVERSATION**

Examples:

* `Add goods inwards posting RPC`
* `Plan stock on hand summary`
* `Add inventory traceability map UI`
* `Plan QA module architecture`

Commit messages should be:

* imperative;
* short;
* task-focused;
* consistent.

---

## J14. Luke wants the next task clearly stated

**CONFIRMED FROM OUR CONVERSATION**

After a task is committed, provide:

* exact next task number;
* title;
* whether it is plan/schema/UI;
* whether migration is expected.

### Important exception

Do not continue automatically if:

* roadmap review is pending;
* meeting timing may alter sequence;
* task exposed a missing foundation;
* Luke asked to pause.

---

## J15. Luke dislikes silent roadmap drift

**CONFIRMED FROM OUR CONVERSATION**

The task 211–212 drift created concern.

Future architects must ask before:

* inserting tasks;
* renumbering;
* moving modules;
* following Codex’s recommended sequence.

---

## J16. Luke is comfortable revising the roadmap when justified

**CONFIRMED FROM OUR CONVERSATION**

He is not rigidly attached to a roadmap.

He wants:

* rationale;
* visibility;
* approval.

The roadmap is a guide and source of truth, not a prison.

---

## J17. Luke prefers proportional review

**CONFIRMED FROM OUR CONVERSATION**

Be strict where damage is expensive.

Be practical where changes are easy.

### Blockers

* tenant security;
* data corruption;
* privilege escalation;
* migration failure;
* source ownership;
* irreversible workflow errors.

### Non-blockers

* naming preference;
* optional metadata;
* future enterprise control;
* UI polish;
* later diagnostics.

---

## J18. Luke becomes concerned by repeated theoretical re-review

**CONFIRMED FROM OUR CONVERSATION**

Task 215’s long QA migration review raised this concern.

The architect should eventually draw a line:

> The approved foundation is safe enough to apply and test.

Do not endlessly reopen architecture without a new concrete blocker.

---

## J19. Luke expects honesty about uncertainty

**CONFIRMED FROM OUR CONVERSATION**

Say:

* not verified;
* likely;
* requires repository check;
* could not test;
* inference;
* later state may differ.

Do not present confidence merely because the answer sounds professional.

---

## J20. Luke dislikes fake data and unsupported claims

**CONFIRMED FROM OUR CONVERSATION**

Examples to avoid:

* fake operational rows;
* fake integrations;
* fake live tracking;
* invented metrics;
* unsupported HACCP certification;
* pricing invented from nowhere;
* claiming a workflow is complete because schema exists.

---

## J21. Luke likes polished product language

**CONFIRMED FROM OUR CONVERSATION**

Use:

* operational language;
* clear action wording;
* practical descriptions.

Avoid unnecessary developer jargon in the UI.

### Example

Prefer:

* “Carrier configuration”
* “Post receipt”
* “Receiving Checks”
* “Stock On Hand”

over raw schema wording.

---

## J22. Luke wants EveryBatch to feel premium and modern

**CONFIRMED FROM OUR CONVERSATION**

Not flashy for its own sake.

Desired qualities:

* polished;
* dense but clear;
* responsive;
* deliberate;
* modern;
* visually coherent;
* operationally serious.

He compares interface quality across modules and notices weak areas.

---

## J23. Luke values the concept mockups but not as rigid specs

**CONFIRMED FROM OUR CONVERSATION**

The mockups communicate:

* visual ambition;
* information density;
* connected modules;
* premium feel.

They should inspire dashboard and page design without overriding real data or architecture.

---

## J24. Luke wants to avoid generic ERP thinking

**CONFIRMED FROM OUR CONVERSATION**

Do not respond with:

* generic manufacturing terms only;
* features irrelevant to food;
* enterprise boilerplate;
* assumptions from unrelated industries.

EveryBatch should reflect:

* ingredients;
* recipes;
* batches;
* temperatures;
* expiry;
* QA;
* production areas;
* dispatch.

---

## J25. Luke thinks commercially as well as operationally

**CONFIRMED FROM OUR CONVERSATION**

He considers:

* product naming;
* market gap;
* competitor weakness;
* pricing;
* onboarding;
* website;
* branding;
* support;
* tenant provisioning;
* external customers.

The architect should consider both:

* Clean Eats usefulness;
* EveryBatch SaaS viability.

---

## J26. Luke does not want premature self-service SaaS

**CONFIRMED FROM PROJECT CONTEXT**

The commercial platform should initially support controlled onboarding.

Reasons:

* setup complexity;
* data imports;
* training;
* domain;
* first admin;
* modules;
* support;
* pricing.

---

## J27. Luke wants docs updated continuously

**CONFIRMED FROM OUR CONVERSATION**

Each task should update:

* task document;
* context;
* roadmap if changed;
* earlier docs if superseded;
* Support/release notes when appropriate.

Luke does not want the repository telling multiple contradictory stories.

---

## J28. Luke wants future ideas preserved without derailing current work

**CONFIRMED FROM OUR CONVERSATION**

When an idea emerges:

* document it;
* classify it;
* park it;
* revisit during roadmap review.

Do not automatically implement it in the current task.

---

## J29. Luke likes casual, direct collaboration

**CONFIRMED FROM OUR CONVERSATION**

Tone can be:

* friendly;
* conversational;
* confident;
* honest;
* occasionally humorous.

But technical outputs should remain exact.

---

## J30. Luke appreciates reassurance, but not false reassurance

**CONFIRMED FROM OUR CONVERSATION**

When changing chats or applying migrations, Luke may feel anxious about breaking the project.

The architect should:

* explain risk honestly;
* show safeguards;
* give exact next step;
* avoid dismissing concern;
* avoid claiming zero risk.

---

## J31. Luke wants the architect to retain strategic ownership

**CONFIRMED FROM OUR CONVERSATION**

Codex implements.

The architect should remain responsible for:

* sequence;
* architecture;
* scope;
* review;
* test strategy;
* product consistency.

Do not defer every decision to Codex.

---

## J32. Luke expects the architect to challenge Codex

**CONFIRMED FROM OUR CONVERSATION**

Codex output is not automatically correct.

Review:

* scope;
* security;
* source ownership;
* runtime behaviour;
* docs;
* roadmap;
* migration;
* permissions.

---

## J33. Luke expects the architect to challenge itself

**CONFIRMED FROM OUR CONVERSATION**

When roadmap drift was identified, the correct response was to acknowledge it directly.

Future architects should not defend an earlier recommendation merely because they made it.

---

## J34. Luke values continuity and memory

**CONFIRMED FROM OUR CONVERSATION**

The long original thread became a trusted strategic partner.

The fear in moving chats was not only losing facts, but losing:

* reasoning;
* tone;
* preferences;
* small product decisions;
* sense of direction.

This dossier exists to address that.

---

# End of Part 6

Part 7 will continue with:

# PART K — ORIGINAL ARCHITECT SELF-ASSESSMENT

It will candidly assess:

* what was understood well;
* where work was overbuilt;
* what was underdocumented;
* roadmap weaknesses;
* missing work;
* decisions worth preserving;
* areas needing re-evaluation;
* handover failures;
* risks of context loss.

Part 7 will then begin:

# PART L — EVERYBATCH MASTER PRODUCT & ARCHITECT HANDBOOK — ORIGINAL ARCHITECT DRAFT

Covering Chapters 1–13:

1. Purpose of this handbook
2. Product identity
3. Origin story
4. Clean Eats as Tenant 1
5. Product vision
6. Core product principles
7. What EveryBatch should own
8. What EveryBatch should integrate with
9. End-to-end operational model
10. Module/workspace architecture
11. Source-of-truth ownership
12. Multi-tenant and security model
13. Data integrity and immutable-history principles

# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 7 — Original Architect Self-Assessment and Master Handbook Draft, Chapters 1–13

This part continues the structure requested in the Historical Architect Memory Dossier brief. 

---

# PART K — ORIGINAL ARCHITECT SELF-ASSESSMENT

This section is intentionally candid.

It separates:

* what I believe was done especially well;
* where the project became too broad or too strict;
* what was underdocumented;
* what the previous handover failed to preserve;
* what the next architect should protect or reconsider.

---

## K1. What I believe I understood especially well

### The project was never “just software”

**CONFIRMED FROM OUR CONVERSATION**

I understood that Luke was not asking for a conventional software-development exercise.

The project combined:

* Clean Eats operational knowledge;
* Luke’s direct role inside the business;
* existing production tools;
* supplier invoice realities;
* costing problems;
* production reporting;
* warehouse processes;
* QA requirements;
* product strategy;
* SaaS architecture;
* branding;
* commercial positioning.

That wider context mattered because a technically neat system could still fail if it did not reflect:

* how Clean Eats actually works;
* how staff think;
* how information flows;
* where errors occur;
* what Luke needs to demonstrate.

---

### The connected-system opportunity

**CONFIRMED FROM OUR CONVERSATION**

I believe I correctly recognised that the original costing problem revealed a much larger architecture.

The strongest insight was:

> Costing, formulas, supplier invoices, receiving, inventory, production, QA and dispatch are not separate problems. They are parts of one operational chain.

That understanding led to the platform’s enduring source-of-truth model.

---

### The importance of intermediate components

**CONFIRMED FROM OUR CONVERSATION**

The project would have been structurally weaker if it treated every finished meal as a flat recipe.

Recognising components such as:

* sauces;
* cooked rice;
* prepared chicken;
* mash;
* bulk cooked items

was essential to:

* accurate cost;
* reusable formulas;
* production planning;
* batch traceability;
* yield;
* production-area tasks.

That decision should be preserved.

---

### Clean Eats as a proving ground rather than a hard-coded customer

**CONFIRMED FROM OUR CONVERSATION**

I believe the two-layer model was correct:

* solve real Clean Eats problems;
* keep EveryBatch reusable and multi-tenant.

This prevented two opposite mistakes:

1. building a generic platform with no operational grounding;
2. hard-coding Clean Eats into every table, route and constant.

---

### Source-of-truth architecture

**CONFIRMED FROM OUR CONVERSATION**

I believe the clearest architectural success was consistently asking:

* Which module owns this record?
* Which module only reads it?
* Is this data derived?
* Can history be rewritten?
* Is there already a source record elsewhere?

That produced strong principles such as:

* supplier invoice evidence remains commercial evidence;
* Goods Inwards owns receiving;
* Inventory owns lots and movements;
* Stock On Hand is derived;
* Traceability reads relationships;
* Costing snapshots remain historical;
* Production owns plans and batches;
* QA owns QA decisions and records;
* Reports remain readers.

These principles should remain central.

---

### Multi-tenancy and RLS from the start

**CONFIRMED FROM OUR CONVERSATION**

Building tenant isolation early was the correct decision.

If `organisation_id`, memberships, permissions and RLS had been deferred, later conversion to SaaS would have been far riskier.

The exact current policies may need audit, but the direction was right.

---

### Controlled operational lifecycle

**CONFIRMED FROM OUR CONVERSATION**

The draft-versus-posted/published model was a strong recurring pattern.

Examples:

* draft receipt versus posted receipt;
* draft UOM rule versus active rule;
* draft formula version versus published version;
* planned production versus released/completed production;
* draft dispatch run versus generated manifest.

This reflects the difference between:

* preparing data;
* committing operational consequences.

---

### Append-only inventory thinking

**CONFIRMED FROM OUR CONVERSATION**

Treating Stock Movements as the quantity ledger was one of the strongest long-term decisions.

It supports:

* traceability;
* reversal;
* stocktake;
* transfer;
* production issue;
* production output;
* audit;
* reconciliation.

This should not be replaced casually with a directly editable balance field.

---

### Transaction-safe posting

**CONFIRMED FROM OUR CONVERSATION**

The Goods Inwards RPC was a meaningful maturity step.

It transformed posting from a UI-driven series of writes into a transaction-safe database operation.

The later Security Advisor warning does not invalidate the decision. It means the function needs future hardening review.

---

### Honest product language

**CONFIRMED FROM OUR CONVERSATION**

I believe I consistently understood Luke’s dislike of software that pretends to be more complete than it is.

The standing rules around:

* no fake rows;
* no fake integrations;
* no unsupported compliance claims;
* no fake metrics;
* no claiming schema means workflow;
* honest empty states

are product strengths, not merely communication preferences.

---

### Collaboration workflow with Luke and Codex

**CONFIRMED FROM OUR CONVERSATION**

The architect/Codex/Luke cycle became highly effective:

* architect defines scope;
* Codex implements;
* architect reviews;
* Luke tests;
* architect approves commit.

This made it possible to move quickly without handing architectural control to Codex.

That workflow should remain.

---

## K2. What may have been overbuilt

### Some planning prompts became too large

**CONFIRMED FROM OUR CONVERSATION**

The prompts became increasingly comprehensive.

This was useful for:

* cross-module awareness;
* source ownership;
* security;
* support;
* documentation.

However, there is a risk that every task becomes burdened with:

* every future integration;
* every theoretical lifecycle;
* every role;
* every support implication;
* every enterprise edge case.

A prompt can become so exhaustive that:

* Codex overbuilds;
* review becomes unwieldy;
* task scope expands indirectly;
* the next practical workflow is delayed.

The QA Schema task later demonstrated this risk dramatically.

---

### Foundation schemas sometimes tried to anticipate too much

**CONFIRMED FROM PROJECT CONTEXT — later evidence**

The task 215 QA migration became very large because the foundation attempted to include:

* templates;
* versions;
* sections;
* items;
* checks;
* results;
* reviews;
* approvals;
* amendments;
* holds;
* hold events;
* detailed permissions;
* lifecycle enforcement.

Much of that was valid, but the task became difficult to review proportionately before the first operational Receiving QA workflow existed.

A smaller foundation may have made later real-world refinement easier.

---

### Roadmap granularity sometimes created false certainty

**CONFIRMED FROM OUR CONVERSATION**

The 201–250 roadmap was useful, but it implied that the future could be planned with high precision before later modules exposed missing foundations.

Examples:

* Carrier Configuration was missing from the original Logistics sequence.
* Inventory Traceability UI and Stock Adjustment planning were pulled forward.
* QA foundation scope evolved.

The roadmap should guide direction but remain reviewable at module boundaries.

---

### Strict migration review could become open-ended

**CONFIRMED FROM OUR CONVERSATION**

High scrutiny is appropriate for:

* RLS;
* tenant boundaries;
* permissions;
* immutable history;
* irreversible writes.

However, the architect must eventually distinguish:

* present blocker;
* acceptable foundation limitation;
* later hardening.

Otherwise, a migration can be repeatedly reopened for theoretical perfection.

---

## K3. What may have been underbuilt or delayed too long

### Module dashboards

**CONFIRMED FROM OUR CONVERSATION**

The platform gained many operational pages before the parent dashboards were upgraded to reflect the new functionality.

This created a gap between:

* strong underlying records;
* less mature overview experience.

The concept mockups made clear that dashboards should eventually become:

* operational queues;
* alerts;
* summaries;
* cross-workspace navigation.

This should have been documented as a coordinated phase earlier.

---

### UI consistency audit

**CONFIRMED FROM OUR CONVERSATION**

Small differences accumulated:

* route lengths;
* loading states;
* page-header patterns;
* sidebar behaviour;
* table responsiveness;
* action feedback;
* status tones.

These details were repeatedly noticed but not consolidated into a permanent design-system task or handbook.

---

### Production operational depth

**CONFIRMED FROM OUR CONVERSATION**

Production planning existed, but the real manufacturing chain remained incomplete:

* input requirements;
* stock check;
* release;
* lot allocation;
* stock issue;
* completion;
* output stock;
* yield;
* waste;
* tasks;
* floor view.

This was partly intentional, but it meant the Production module could look more complete than it was.

---

### Purchasing

**CONFIRMED FROM OUR CONVERSATION**

Purchasing stayed in the sidebar without reaching the same maturity as:

* Goods Inwards;
* Stock On Hand;
* Supplier Invoice Intake.

A food-manufacturing operating system will eventually need:

* purchase orders;
* requirements;
* supplier lead times;
* expected delivery;
* matching;
* variance.

---

### Staff-demo preparation system

**CONFIRMED FROM OUR CONVERSATION**

The plan for a full Luke-led review before staff validation emerged late.

It would have been useful to establish earlier:

* demo readiness checklist;
* module walkthrough;
* known limitations;
* safe test data;
* feedback categories;
* meeting scripts.

---

### Permanent product handbook

**CONFIRMED FROM OUR CONVERSATION**

A permanent handbook should have been started much earlier.

The project relied heavily on:

* one long architect chat;
* task docs;
* compressed handovers.

That made small decisions vulnerable to loss.

---

## K4. What was underdocumented

### Rationale behind task order

**CONFIRMED FROM OUR CONVERSATION**

The handover preserved the roadmap but not always the reason each task belonged where it did.

Without rationale, a later architect could interpret the sequence as arbitrary.

---

### Small UX conventions

**CONFIRMED FROM OUR CONVERSATION**

The previous handover underdocumented:

* visible loading states;
* canonical routes;
* module-parent click behaviour;
* no duplicate dashboard child;
* pending buttons;
* calm posted-state wording;
* status semantics;
* historical name resolution;
* mobile/table overflow;
* tenant versus platform branding.

These details strongly affect product quality.

---

### Rejected alternatives

**CONFIRMED FROM OUR CONVERSATION**

Task docs often described the chosen approach but not always:

* which alternatives were rejected;
* why;
* what would justify reconsideration.

This dossier attempts to reconstruct those decisions.

---

### Existing external tool logic

**CONFIRMED FROM PROJECT CONTEXT**

The legacy Python/Streamlit/Zapiet/Detrack logic was known across separate chats, but not sufficiently consolidated into EveryBatch’s permanent architecture docs.

Future Production and Logistics work needs an explicit legacy-tool inventory.

---

### Operational assumptions versus facts

**CONFIRMED FROM OUR CONVERSATION**

Some examples and test values risked being interpreted as canonical Clean Eats data.

Documentation should label:

* real operational fact;
* test record;
* example;
* proposed workflow;
* staff-confirmation item.

---

## K5. Where the roadmap was too rigid

### A 50-task roadmap created momentum but could mask missing foundations

**CONFIRMED FROM OUR CONVERSATION**

The task list encouraged disciplined progress.

However, it could lead to:

* continuing because a number exists;
* avoiding a missing prerequisite because it was not listed;
* treating task insertion as failure;
* postponing roadmap review too long.

The later Carrier Configuration example proved that real workflows expose missing foundations.

---

### Recommended future roadmap style

**ARCHITECT RECOMMENDATION**

Use:

* high-level phase roadmap;
* detailed next 5–10 tasks;
* module-boundary review points;
* explicit parked backlog;
* meeting-dependent tasks kept unnumbered until timing is known.

This preserves direction without creating false certainty.

---

## K6. Important missing work in the original roadmap

### Carrier and service configuration

**CONFIRMED FROM PROJECT CONTEXT**

Logistics needed tenant carrier configuration before exports or meaningful dispatch selection.

It was missing from the original revised sequence.

---

### UI consistency phase

**CONFIRMED FROM OUR CONVERSATION**

The roadmap did not explicitly reserve enough room for:

* routes;
* loading;
* pending actions;
* tables;
* mobile;
* status system;
* page headers;
* dashboard consistency.

---

### Documentation reconciliation

**CONFIRMED FROM OUR CONVERSATION**

Continuous docs updates were required, but a deliberate full-sweep audit was not originally numbered.

---

### Marketing-to-tenant onboarding architecture

**CONFIRMED FROM PROJECT CONTEXT**

The public website, demo lead flow and tenant onboarding lifecycle became increasingly important but were not integrated into the authenticated-platform roadmap.

---

### Full Platform Admin review after tenant modules mature

**CONFIRMED FROM OUR CONVERSATION**

Platform Admin foundations existed, but a comprehensive review should follow more mature tenant modules.

---

## K7. Decisions I strongly advise preserving

1. EveryBatch remains food-manufacturing specific.
2. Clean Eats remains Tenant 1 and proving ground.
3. `organisation_id` remains the tenant boundary.
4. RLS remains central.
5. No service-role shortcuts for tenant workflows.
6. Source modules own their records.
7. Stock Movements remain the quantity ledger.
8. Stock On Hand remains derived.
9. Posted/published history remains protected.
10. Supplier invoice evidence does not auto-post stock.
11. Parsed prices do not auto-become approved prices.
12. Components remain first-class manufactured items.
13. Costing snapshots remain immutable.
14. Pack conversions are never guessed.
15. Platform Admin remains separate from tenant Admin.
16. Support remains authenticated and contextual.
17. Fake operational data is removed as workflows become real.
18. Rich dashboards wait for reliable source data.
19. Staff validate a working base rather than a blank design.
20. Luke controls roadmap changes, not Codex.

---

## K8. Areas the second architect should re-evaluate

### Platform Admin tenant-read access

**REQUIRES CURRENT REPOSITORY REVIEW**

Global Platform Admin read access may be acceptable during Clean Eats-only development, but external tenants require:

* audited access;
* support session;
* explicit operator boundaries.

---

### Permission granularity after real staff testing

**REQUIRES LUKE AND STAFF CONFIRMATION**

The early role matrix should be revisited after staff use:

* Receiving QA;
* hold/release;
* carrier configuration;
* production tasks;
* posting;
* price approval.

---

### Formula versus Recipes workspace

**REQUIRES PRODUCT DECISION**

The distinction remains unclear enough to cause future duplication.

---

### Production architecture sequencing

**REQUIRES ROADMAP REVIEW**

Production input/output may need to move earlier than some reporting or CRM tasks if the goal is end-to-end traceability.

---

### Reports timing

**REQUIRES ROADMAP REVIEW**

Reports should not be built too early, but they may be necessary for the Clean Eats meeting once enough source records exist.

---

### CRM scope

**REQUIRES LUKE CONFIRMATION**

Determine whether CRM is:

* wholesale account management;
* sales pipeline;
* customer/order master;
* complaint management;
* lightweight future placeholder.

---

### Marketing-site timing

**REQUIRES COMMERCIAL DECISION**

Starting too early could distract from platform readiness.

Starting too late could delay:

* lead generation;
* positioning;
* product story;
* launch assets.

---

## K9. What the previous handover failed to preserve

### The “feel” of the product

The handover explained architecture well but did not fully capture:

* premium control-centre direction;
* loading expectations;
* small navigation preferences;
* honest state language;
* how Luke compares modules;
* how much polish matters.

---

### The collaboration rhythm

It did not sufficiently capture that Luke expects:

* exact correction prompt automatically;
* exact tests;
* direct commit decision;
* proportionate strictness;
* architect ownership of the next action.

---

### The difference between foundation and final hardening

It preserved security rules but not strongly enough the philosophy:

> Build a safe useful foundation now, then harden with real Clean Eats evidence.

This led the next architect to initially review foundation work too much like a final enterprise certification.

---

### The reasoning behind commercial and onboarding choices

The handover included domains and Platform Admin, but not enough of:

* why self-service should wait;
* why pricing should remain Talk to Sales;
* why marketing should use real product screens;
* why onboarding is part of the product.

---

### The context of legacy operational tools

The handover listed some tools but did not fully explain how much real Clean Eats workflow knowledge they contain.

---

## K10. What I wish I had documented earlier

1. A permanent glossary.
2. A module ownership matrix.
3. A UI consistency checklist.
4. A route convention.
5. A status-language and colour standard.
6. A loading/pending-state standard.
7. A test-data policy.
8. A legacy-tool inventory.
9. A staff-validation framework.
10. A decision log with rejected alternatives.
11. A current-state matrix: planned/scaffold/real/live.
12. A migration application register.
13. A permission matrix by role.
14. A Platform Admin access policy.
15. A marketing/onboarding architecture document.

---

## K11. Risks when future chats lack original context

### Rebuilding solved problems

A future architect may propose:

* editable Stock On Hand;
* flat recipes;
* auto-post from invoices;
* global box conversions;
* Platform Admin in tenant sidebar.

These would conflict with established decisions.

---

### Treating scaffolds as operational

A future architect may assume:

* Production inputs consume stock;
* Carrier Exports transmit files;
* QA placeholders mean workflows exist;
* notification icon means notification system exists.

---

### Losing product consistency

Small route/loading/status differences can accumulate until the app feels fragmented.

---

### Over-hardening too early

A strict architect may delay useful workflows by solving every future enterprise case before Clean Eats sees them.

---

### Under-reviewing sensitive work

A less strict architect may approve:

* broad RLS;
* unsafe RPCs;
* cross-tenant references;
* historical rewrites.

The correct approach is proportionate.

---

### Silent roadmap drift

Without the historical lesson from tasks 211–212, future Codex recommendations may again change sequence without Luke’s approval.

---

# PART L — EVERYBATCH MASTER PRODUCT & ARCHITECT HANDBOOK — ORIGINAL ARCHITECT DRAFT

# EVERYBATCH MASTER PRODUCT & ARCHITECT HANDBOOK

## ORIGINAL ARCHITECT DRAFT

---

# Chapter 1 — Purpose of This Handbook

This handbook exists to give future EveryBatch product architects, technical architects and senior implementation agents a durable understanding of the platform.

It is intended to preserve:

* product origin;
* strategic intent;
* operational context;
* architectural principles;
* module ownership;
* UX expectations;
* commercial direction;
* collaboration rules;
* deferred decisions;
* known risks.

This document is not canonical repository truth.

It is a historical and architectural guide derived from:

* the original architect conversation;
* project context;
* task summaries;
* operational explanations;
* later handovers.

Any implementation-specific statement should be verified against:

* current repository;
* current migration status;
* current task docs;
* current roadmap;
* Luke’s current approval.

The handbook should prevent future architects from making technically plausible decisions that conflict with the original product intent.

---

# Chapter 2 — Product Identity

## Product name

EveryBatch

## Positioning

Food Manufacturing OS

## Tagline

Every ingredient. Every process. Every batch.

## Internal names

* Food Prod Hub;
* Food Production Hub;
* Food Operations Hub.

These are internal project/repository names only.

They should not replace EveryBatch in customer-facing UI.

## Tenant identity

Clean Eats Hub is the Clean Eats workspace inside EveryBatch.

## Terminology

* Module: major operational area.
* Workspace/submodule: major functional area inside a module.
* Page: route or record detail.

Example:

* Inventory module;
* Goods Inwards workspace;
* Receipt Detail page.

---

# Chapter 3 — Origin Story

EveryBatch began inside Clean Eats.

The initial problem was not to build SaaS.

It was to fix costing and production workflows that relied on:

* spreadsheets;
* custom scripts;
* supplier invoices;
* separate production tools;
* staff knowledge;
* disconnected systems.

The project expanded because costing depended on:

* supplier prices;
* item mapping;
* formulas;
* components;
* packaging;
* unit conversion.

Production depended on:

* formulas;
* areas;
* tasks;
* batches;
* inventory;
* QA.

Inventory depended on:

* receipts;
* lots;
* movements;
* locations;
* traceability.

QA and Logistics depended on all of those.

The platform became a Food Manufacturing OS because the operational chain could not be solved safely as isolated tools.

---

# Chapter 4 — Clean Eats as Tenant 1

Clean Eats is:

* the first tenant;
* the proving ground;
* the initial operational customer;
* the primary source of real workflow validation.

Clean Eats provides:

* real supplier invoices;
* real products;
* real manufacturing complexity;
* real warehouse needs;
* real QA requirements;
* real production users;
* real dispatch processes.

The platform must solve Clean Eats problems without hard-coding Clean Eats globally.

Examples of tenant-owned configuration:

* locations;
* suppliers;
* formulas;
* carriers;
* services;
* QA templates;
* branding;
* feature flags;
* modules.

Clean Eats should influence reusable architecture, not become universal platform constants.

---

# Chapter 5 — Product Vision

EveryBatch should become the operating system through which a food manufacturer can understand and control the chain from supplier to dispatch.

The long-term chain is:

Supplier
→ supplier item
→ invoice evidence
→ approved price
→ Goods Inwards
→ inventory lot
→ Stock On Hand
→ production input
→ production batch
→ finished output
→ QA record
→ dispatch
→ reporting and traceability.

The product should be:

* food-specific;
* multi-tenant;
* modern;
* operational;
* modular;
* connected;
* auditable;
* practical.

It should not become a generic ERP containing large areas irrelevant to food manufacturing.

---

# Chapter 6 — Core Product Principles

## 6.1 Real operational value before visual theatre

Every page should offer:

* real data;
* real workflow;
* honest empty state;
* clear limitation.

Avoid fake operational records.

---

## 6.2 Source modules own records

Every record has one authoritative owner.

Other modules may link and display it.

---

## 6.3 Historical actions remain traceable

Posted, published, approved or generated records must not be silently rewritten.

Use:

* new version;
* amendment;
* reversal;
* superseding record;
* archive;
* explicit event.

---

## 6.4 Tenant safety is fundamental

Every tenant-owned record should be organisation-scoped and protected by RLS.

---

## 6.5 Configuration should be tenant-owned where it varies

Examples:

* pack conversion;
* carrier;
* location;
* QA template;
* production area.

---

## 6.6 Feature flags are not permissions

Rollout and access are separate.

---

## 6.7 Dashboards are readers

They summarise source records and link to action.

They do not become operational truth.

---

## 6.8 Foundation before perfection

Build the safest useful foundation.

Validate with Clean Eats.

Harden based on real usage.

Do not compromise:

* tenant isolation;
* RLS;
* historical integrity;
* source ownership;
* safe irreversible writes.

---

## 6.9 Honest product language

Do not claim:

* integration;
* certification;
* automation;
* live tracking;
* workflow readiness

unless it is genuinely implemented.

---

## 6.10 Roadmap changes require Luke’s approval

Codex may recommend.

The architect may recommend.

Luke approves.

---

# Chapter 7 — What EveryBatch Should Own

EveryBatch should own operational records that are central to its product promise.

These include:

* supplier and item master data;
* formulas and versions;
* costing evidence;
* inventory receipts;
* lots;
* stock movements;
* production plans and batches;
* QA checks and decisions;
* dispatch runs and manifests;
* tenant configuration;
* permissions;
* audit events;
* support tickets;
* Platform Admin tenant lifecycle.

EveryBatch should own these because they form the connected food-manufacturing operating model.

---

# Chapter 8 — What EveryBatch Should Integrate With Rather Than Recreate

EveryBatch should not automatically rebuild every external business system.

Likely integration boundaries include:

* Shopify or ecommerce orders;
* Xero/accounting;
* Detrack/carrier systems;
* email;
* calendars;
* payment/billing provider;
* document extraction;
* external CRM where used;
* identity provider later;
* storage providers where applicable.

The integration strategy should be staged:

1. manual import/export;
2. reviewed data flow;
3. controlled API;
4. monitored synchronisation.

Ownership must remain explicit.

Example:

* Shopify owns ecommerce order source.
* EveryBatch may import the order for production and dispatch planning.
* Logistics owns the dispatch run.
* CRM owns the customer master if introduced.
* Accounting remains in Xero unless deliberately expanded.

---

# Chapter 9 — End-to-End Operational Model

## 9.1 Product setup

* Supplier created.
* Supplier item captured.
* Internal item created.
* Mapping established.
* UOM interpretation reviewed.
* Formula created and published.
* Sell price configured.
* Cost calculated and snapshotted.

## 9.2 Purchasing and receiving

* Requirement identified.
* Purchase Order created in future.
* Supplier invoice received.
* Invoice parsed.
* Price observation reviewed.
* Goods Inwards draft created.
* Receiving QA completed.
* Receipt posted.
* Lot and inbound movement created.

## 9.3 Inventory

* Stock stored by item/location/lot/unit.
* Stock On Hand derived.
* Holds reduce availability.
* Movements preserve history.
* Transfers, adjustments and stocktakes write new movements.

## 9.4 Production

* Output demand planned.
* Formula selected.
* Input requirements generated.
* Stock availability checked.
* Batch released.
* Lots allocated.
* Inputs issued.
* Tasks completed.
* QA recorded.
* Output lot created.
* Output movement posted.
* Yield and waste compared.

## 9.5 Logistics

* Released output allocated.
* Dispatch run created.
* Manifest generated.
* Carrier/service selected.
* Export generated or transmitted.
* Delivery result recorded.
* Issues linked.

## 9.6 Reporting and traceability

* Reports aggregate source records.
* Traceability follows relationships backward and forward.
* Audit logs show sensitive actions.
* Platform Admin inspects health without owning tenant operations.

---

# Chapter 10 — Module and Workspace Architecture

## Dashboard

Cross-business operational overview.

## Inventory

* Goods Inwards;
* Stock On Hand;
* Traceability;
* Batch Receiving;
* Stock Locations;
* Stock Movements;
* Purchasing;
* future Adjustments, Transfers, Stocktake.

## Products

* Suppliers;
* Ingredients;
* Packaging;
* Components;
* Recipes/formula presentation;
* Finished Products;
* UOM Conversions.

## Costings

* Ingredient Costs;
* Packaging Costs;
* Component Costs;
* Sell Prices;
* Meal Margins;
* Price History;
* snapshots.

## Production

* Production Report;
* Production Plan;
* Production Areas;
* Production Tasks;
* Facility/iPad View;
* future availability, release, issue, output and variance.

## QA

* QA Dashboard;
* Receiving Checks;
* Production Checks;
* Daily Checks;
* Hold & Release;
* Non-Conformance;
* Corrective Actions;
* QA Templates;
* later temperature/HACCP/document/evidence capabilities.

## Logistics

* Logistics Dashboard;
* Dispatch Runs;
* Manifests;
* Carrier Exports;
* Delivery Issues;
* carrier configuration;
* later zones, Detrack and provider integrations.

## CRM

* Customers;
* Contacts;
* Leads;
* Accounts;
* future complaints and order context.

## Reports

* Inventory;
* Receiving;
* Stock Movements;
* Expiry;
* Costings;
* Production;
* QA;
* Logistics;
* Supplier;
* Audit.

## Tools

* Supplier Invoice Intake;
* Data Imports;
* Formula Import;
* Item Mapping QA;
* Exports;
* Diagnostics.

## Tenant Admin

* Organisation Settings;
* Users;
* Modules;
* Integrations.

## Platform Admin

* Overview;
* Tenants;
* Provisioning;
* Branding;
* Health;
* Diagnostics;
* Support;
* future billing/domains/lifecycle.

## Support

* Guides;
* Tickets;
* Contact;
* Troubleshooting;
* Release Notes.

---

# Chapter 11 — Source-of-Truth Ownership

## Products owns

* suppliers;
* supplier items;
* internal items;
* formulas;
* formula versions;
* UOM rules.

## Costings owns

* approved price context;
* sell prices;
* current calculations;
* costing snapshots.

## Goods Inwards / Inventory owns

* receipts;
* receipt lines;
* lots;
* locations;
* stock movements.

## Stock On Hand

Derived from posted movements and availability rules.

## Traceability

Reads relationships.

## Production owns

* plans;
* plan lines;
* batches;
* areas;
* tasks;
* future input/output records.

## QA owns

* templates;
* checks;
* results;
* reviews;
* approvals;
* amendments;
* holds;
* QA events;
* future NC/CA.

## Logistics owns

* dispatch runs;
* deliveries/snapshots;
* manifests;
* carriers;
* services;
* export records;
* issues.

## CRM should own

* customer accounts;
* contacts;
* leads.

## Reports

Remain read models.

## Support owns

* tickets;
* comments;
* events;
* help content.

## Platform Admin owns

* tenant lifecycle;
* provisioning;
* modules/features;
* platform diagnostics;
* support operation.

---

# Chapter 12 — Multi-Tenant and Security Model

Every tenant-owned record should include `organisation_id`.

Access normally requires:

1. authenticated user;
2. valid profile;
3. active organisation membership;
4. relevant permission;
5. RLS policy.

The application should not trust:

* client-supplied organisation ID;
* client-supplied actor profile;
* UI-hidden controls;
* role name alone.

Permissions should represent capabilities.

Sensitive actions should be granular.

Platform Admin should not become an unrestricted tenant-operational writer.

Service-role usage is prohibited in ordinary tenant workflows.

Security Definer functions require:

* fixed `search_path`;
* no dynamic SQL;
* explicit permission;
* minimal inputs;
* public/anon revocation;
* review.

Private storage should use tenant-scoped paths and signed access.

---

# Chapter 13 — Data Integrity and Immutable-History Principles

## Draft records

Editable while operational consequences do not exist.

## Published records

Formula/template structure is locked.

Changes require new versions.

## Posted records

Create ledger or committed history.

Corrections require reversal or adjustment.

## Approved records

Decision and actor history must remain visible.

## Generated records

Manifests, snapshots and exports should preserve the source context used at generation time.

## Append-only records

Examples:

* stock movements;
* hold events;
* audit events;
* support lifecycle events.

## Historical snapshots

Do not recalculate old values from current source data.

## Source links

Preserve original references:

* purchase document line;
* receipt line;
* lot;
* formula version;
* cost snapshot;
* production batch;
* dispatch record.

## Archive

Archive removes records from new selection while preserving historical display.

## Delete

Hard deletion should be rare for operational records.

---

# End of Part 7

Part 8 will continue the Master Product & Architect Handbook with:

# Chapter 14 — UI and Experience Principles

# Chapter 15 — Dashboard Direction

# Chapter 16 — Operational Exceptions and Visible Work

# Chapter 17 — Platform Admin Direction

# Chapter 18 — Support Direction

# Chapter 19 — Marketing and Commercial Direction

# Chapter 20 — Implementation and Onboarding Philosophy

# Chapter 21 — Clean Eats Validation Approach

# Chapter 22 — Working with Luke

# Chapter 23 — Codex/Developer Collaboration Expectations

# Chapter 24 — Known Risks

# Chapter 25 — Deferred Capabilities

# Chapter 26 — Items Requiring Current Repository Verification

# Chapter 27 — Guidance for the Next Architect

After completing the handbook, Part 8 will begin:

# PART M — TECHNICAL AND CODEX MEMORY APPENDIX

# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 8 — Master Handbook Chapters 14–27 and Technical/Codex Memory Appendix

This part continues the Historical Architect Memory Dossier and completes the remaining chapters of the draft handbook before beginning the technical appendix requested in the source brief. 

---

# PART L — EVERYBATCH MASTER PRODUCT & ARCHITECT HANDBOOK

## ORIGINAL ARCHITECT DRAFT

---

# Chapter 14 — UI and Experience Principles

EveryBatch should feel like one connected operating platform.

It should not feel like:

* a collection of admin tables;
* a generic ERP skin;
* separate apps built by different teams;
* unfinished scaffolds joined by one sidebar.

The user experience must reflect the seriousness and complexity of food manufacturing while remaining clear enough for staff who are not software specialists.

---

## 14.1 Operational clarity over visual novelty

The interface should prioritise:

* what requires attention;
* what is blocked;
* what can be done next;
* what has already happened;
* what record owns the current state;
* where the user should go to resolve an issue.

Visual design should support these questions.

It should not obscure them.

---

## 14.2 Consistency across modules

Modules may have different operational needs, but should share a common product language.

Consistent elements should include:

* page headers;
* title hierarchy;
* summary cards;
* status badges;
* filters;
* forms;
* tables;
* empty states;
* related-record links;
* loading states;
* action feedback;
* support context;
* responsive behaviour.

Consistency should not mean forcing every module into the same layout.

For example:

* Stock On Hand may require a dense table;
* Facility/iPad View may need large area cards;
* QA may require step-by-step check completion;
* Platform Admin may require diagnostic panels.

The shared design system should remain recognisable across all of them.

---

## 14.3 Parent modules and workspaces

A top-level module should normally open its own dashboard or landing workspace.

Avoid duplicate submenu items such as:

* QA;
* QA Dashboard.

Preferred:

* QA opens `/qa`;
* its child workspaces appear underneath.

The module dashboard should act as the operational overview of its children.

---

## 14.4 Canonical route direction

Short, memorable routes were preferred for major workspaces.

Examples:

* `/goods-inwards`;
* `/stock-on-hand`;
* `/inventory-traceability`;
* `/component-costs`;
* `/meal-margins`;
* `/production-plan`.

Later nested routes such as:

* `/logistics/manifests`;
* `/logistics/dispatch-runs`;

were accepted temporarily but created a consistency backlog.

A future route review should:

* establish canonical routes;
* preserve nested redirects;
* preserve support context;
* preserve active sidebar state;
* preserve bookmarks;
* avoid route duplication.

Route changes should be coordinated, not applied opportunistically.

---

## 14.5 Loading and perceived responsiveness

Every route should visibly acknowledge navigation.

When data is slow:

* preserve the app shell;
* preserve active navigation;
* show a clear loading state;
* avoid an apparently frozen page;
* avoid fake operational values;
* avoid unstable layout shifts.

This is especially important because EveryBatch currently has known slow areas.

A slow but visibly progressing platform feels more reliable than one where a click appears ignored.

---

## 14.6 Action pending states

Consequential actions should show:

* pending label;
* disabled repeat submission;
* clear result;
* redirect or refreshed state;
* validation failure;
* blocker explanation.

Examples:

* Posting receipt…;
* Creating snapshot…;
* Generating manifest…;
* Saving changes…;
* Archiving carrier….

The database should still protect against duplicate submission where the action has operational consequences.

---

## 14.7 Status semantics

EveryBatch should maintain a deliberate semantic status system.

Suggested categories:

### Neutral

* Draft;
* Not configured;
* Not started;
* Inactive.

### Positive

* Active;
* Ready;
* Approved;
* Available;
* Posted;
* Completed.

### Warning

* Needs review;
* Due soon;
* Incomplete;
* Conditional acceptance;
* Mixed units.

### Blocking or risk

* Blocked;
* Rejected;
* Failed;
* Overdue;
* On hold;
* Missing configuration.

### Historical

* Archived;
* Superseded;
* Cancelled;
* Closed.

Colours and badges should reinforce meaning consistently.

Tenant branding should not override safety semantics.

---

## 14.8 Honest empty states

An empty state should explain:

1. what this workspace contains;
2. why it is empty;
3. what workflow creates records;
4. whether the workflow is not yet connected;
5. what action is available to the user.

Example:

> No stock on hand yet. Post Goods Inwards receipts to create inventory lots and movement records.

Avoid:

* generic “No data”;
* fake rows;
* fake charts;
* fake counts;
* empty pages that look broken.

---

## 14.9 Historical and read-only states

When records become consequential, the UI should clearly communicate that they are locked.

Examples:

* posted receipt;
* completed QA check;
* published template version;
* archived carrier;
* costing snapshot;
* generated manifest.

The page should explain how corrections happen.

Examples:

* use amendment;
* create new version;
* create adjustment;
* reverse movement;
* supersede template;
* cancel rather than delete.

---

## 14.10 Related-record navigation

Users should be able to follow the operational chain through links.

Examples:

* invoice → Goods Inwards;
* receipt → invoice evidence;
* receipt line → inventory lot;
* lot → Stock On Hand;
* lot → Stock Movements;
* finished product → formula;
* formula → costing;
* production batch → QA;
* dispatch → manifest;
* support ticket → related route.

Relationships should be visible without duplicating records.

---

## 14.11 Permission-aware UI

The interface must reflect actual capability.

A read-only user should not see:

* New;
* Edit;
* Post;
* Archive;
* Approve;
* Release;

unless the action is genuinely available.

Hiding an action is often preferable to rendering a permanently disabled control.

Database security remains authoritative.

---

## 14.12 Dense desktop, usable mobile and tablet

EveryBatch is an operational product.

Desktop screens may appropriately be dense.

However:

* tables must not break layouts;
* forms must stack;
* touch targets must remain usable;
* important context must not disappear;
* Facility/iPad View should be purpose-built;
* Platform Admin needs a future responsive pass.

Mobile should not necessarily reproduce every dense desktop table.

Stacked record cards may be more appropriate.

---

## 14.13 Tenant and platform branding

EveryBatch and the tenant should both remain visible.

### EveryBatch identifies

* the software;
* the platform;
* support;
* Platform Admin;
* shared product identity.

### Tenant branding identifies

* the current workspace;
* the organisation;
* operational context.

Expanded sidebars may use the full tenant logo.

Collapsed sidebars should use the tenant icon.

The EveryBatch brand should not disappear inside a tenant.

---

## 14.14 Design direction

The visual direction is:

* white and neutral surfaces;
* dark green/navy structure;
* bright lime accent;
* clean typography;
* restrained status colours;
* dense but organised grids;
* strong hierarchy;
* professional manufacturing tone.

EveryBatch should look modern without appearing like consumer meal-delivery software.

---

# Chapter 15 — Dashboard Direction

Dashboards should become operational control surfaces rather than decorative summary pages.

---

## 15.1 Dashboard ownership

Dashboards own presentation and navigation.

They do not own:

* stock;
* QA status;
* production status;
* costing source data;
* dispatch status.

They read source records.

---

## 15.2 Module dashboards

Each module dashboard should eventually answer:

* What is active?
* What requires attention?
* What is blocked?
* What recently changed?
* What should the user do next?

### Inventory dashboard

Potential sections:

* recent Goods Inwards;
* current stock rows;
* low/negative stock;
* held stock;
* expiring lots;
* movement activity;
* purchase requirements;
* quick actions.

### Products dashboard

Potential sections:

* supplier count;
* internal-item count;
* components;
* finished products;
* missing formulas;
* inactive items;
* unmapped supplier items;
* UOM blockers.

### Costings dashboard

Potential sections:

* missing approved prices;
* blocked formulas;
* snapshot history;
* price changes;
* low-margin products;
* stale prices;
* missing sell prices.

### Production dashboard

Potential sections:

* plans by date;
* ready and blocked plan lines;
* batches;
* areas;
* tasks;
* stock readiness;
* QA readiness;
* planned versus completed future.

### QA dashboard

Potential sections:

* checks due;
* overdue;
* needs review;
* failed;
* active holds;
* release requests;
* NC/CA future;
* temperature exceptions;
* recent QA activity.

### Logistics dashboard

Potential sections:

* dispatch runs;
* manifests;
* configured carriers;
* dispatch readiness;
* generated exports;
* delivery issues;
* upcoming delivery dates.

### Tools dashboard

Potential sections:

* invoice documents awaiting review;
* parser issues;
* unmapped items;
* import batches;
* Formula Import readiness;
* diagnostics.

---

## 15.3 Main Dashboard

The main tenant Dashboard should become a cross-module operating view only after child modules can supply trustworthy data.

Potential sections:

* production today;
* inventory alerts;
* QA queue;
* receiving activity;
* dispatch readiness;
* product/costing blockers;
* quick actions;
* recent activity;
* tenant setup/readiness.

It should support different user roles through permission-aware visibility.

---

## 15.4 Dashboard metric rules

Every metric should have:

* source table/query;
* business definition;
* unit;
* date/time scope;
* filter behaviour;
* click destination;
* empty state;
* permission requirement.

Avoid ambiguous values such as:

* “Efficiency”;
* “Health”;
* “Readiness”;

without a documented definition.

---

## 15.5 Charts

Charts should be used when:

* enough historical data exists;
* the trend is operationally useful;
* the user can interpret it;
* the calculation is stable.

Tables and queues are often more useful than charts during early operational rollout.

---

## 15.6 Dashboard performance

Dashboard work should consider:

* parallel data loading;
* aggregate queries;
* pagination;
* selective projections;
* cached configuration;
* loading boundaries;
* avoiding repeated full-module fetches.

Do not optimise by duplicating source data without a deliberate read-model design.

---

# Chapter 16 — Operational Exceptions and Visible Work

EveryBatch should make exceptions visible.

The platform’s value is not merely storing normal records.

It should help users identify work that is:

* blocked;
* overdue;
* held;
* missing;
* inconsistent;
* incomplete;
* waiting for review;
* unsafe to proceed.

---

## 16.1 Blockers should identify resolution

A blocker should explain:

* what is wrong;
* which record is affected;
* why the action cannot proceed;
* where to fix it.

Examples:

* Missing approved price → Open Ingredient Costs.
* Conversion required → Open UOM Conversions.
* No active formula → Open product formula.
* Rejected receipt line → Review receiving line.
* Held lot → Open Hold & Release.
* No carrier service → Open Carrier Configuration.

---

## 16.2 Warnings versus blockers

Not every issue should stop work.

### Warning

* mixed units;
* missing optional metadata;
* due date approaching;
* inactive future reference;
* no invoice evidence on manual receiving.

### Blocker

* missing item;
* cross-tenant reference;
* invalid quantity;
* rejected stock;
* missing required permission;
* no published formula where required;
* duplicate posting.

The UI and database should agree on the distinction.

---

## 16.3 Queues

Operational workspaces should increasingly use queues such as:

* Needs Review;
* Ready to Post;
* Failed Checks;
* Release Requested;
* Blocked Production;
* Dispatch Ready;
* Missing Mapping;
* Parser Failed;
* Open Support Tickets.

Queues should be derived from source states.

---

## 16.4 Ownership and assignment

Future workflows may require:

* assigned user;
* assigned team;
* production area;
* due date;
* priority.

Assignment should not automatically grant permission.

A user must still have authority to act.

---

## 16.5 Activity history

Important records should show relevant lifecycle history.

Examples:

* created;
* edited;
* reviewed;
* approved;
* posted;
* held;
* released;
* generated;
* archived;
* cancelled.

History should use meaningful business events rather than raw row-diff noise where possible.

---

# Chapter 17 — Platform Admin Direction

Platform Admin is the EveryBatch operator environment.

It should enable the platform team to provision, support and diagnose tenants without becoming an unrestricted operational backdoor.

---

## 17.1 Platform Admin responsibilities

* tenant creation;
* onboarding;
* module templates;
* feature flags;
* branding;
* domain readiness;
* first-admin readiness;
* tenant health;
* support;
* platform diagnostics;
* storage/integration health;
* future billing;
* lifecycle management.

---

## 17.2 Tenant overview

A tenant overview should eventually include:

* status;
* onboarding stage;
* enabled modules;
* feature flags;
* user count;
* active membership count;
* setup readiness;
* support issues;
* data completeness;
* system warnings;
* domain;
* branding;
* last activity;
* billing status future.

---

## 17.3 Tenant health

Tenant-health indicators may include:

* no active admin;
* no products;
* no suppliers;
* no active formulas;
* no approved prices;
* no locations;
* no posted receipt;
* no production areas;
* no QA templates;
* no carrier configuration;
* open critical support issue;
* failed storage access;
* missing domain.

Health should be diagnostic and explainable.

---

## 17.4 Tenant provisioning

Provisioning should become a controlled lifecycle.

Potential sequence:

1. Create organisation.
2. Apply template.
3. Create settings.
4. Apply modules.
5. Apply feature flags.
6. Apply branding defaults.
7. Create or invite first admin.
8. Configure domain.
9. Create onboarding checklist.
10. Mark tenant ready.

Each step should be idempotent or retry-safe.

---

## 17.5 Platform Admin access to tenant data

The original project used Platform Admin exceptions for some reads.

Before external tenants, EveryBatch should decide whether operational access requires:

* support session;
* explicit reason;
* audited access;
* time-limited access;
* tenant approval;
* impersonation controls;
* break-glass permissions.

Default unrestricted editing should be avoided.

---

## 17.6 Support integration

Platform Admin should show:

* tenant support tickets;
* current module/page context;
* configuration diagnostics;
* recent platform events;
* permission/module state.

Support activity should remain distinct from tenant operational data.

---

## 17.7 Billing and commercial lifecycle

Future Platform Admin should support:

* plan;
* contract;
* onboarding fee;
* billing status;
* facility/user limits;
* suspension;
* cancellation;
* archive;
* data export/retention.

Do not invent billing behaviour before commercial policy is approved.

---

# Chapter 18 — Support Direction

Support should be embedded into the product experience.

---

## 18.1 Support surfaces

* Help Centre;
* guides;
* troubleshooting;
* release notes;
* ticket creation;
* customer ticket detail;
* Platform Support Inbox;
* future attachments;
* future diagnostics.

---

## 18.2 Context-aware support

Where possible, support requests should carry:

* tenant;
* user;
* module;
* workspace;
* route;
* entity ID;
* issue category.

Context should aid support but not bypass authorisation.

---

## 18.3 Guides and troubleshooting

Guides should explain normal workflows.

Troubleshooting should explain:

* why an action is blocked;
* common configuration issues;
* permission issues;
* known limitations;
* next steps.

User-facing docs should update when workflows change.

---

## 18.4 Release notes

Release notes should describe user-visible product changes.

Avoid release notes for:

* planning-only work;
* internal docs changes;
* unapplied schema;
* hidden refactors with no user impact.

---

## 18.5 Support attachments

Future attachment UI should preserve:

* tenant privacy;
* ticket ownership;
* customer/internal visibility;
* private storage;
* signed access;
* audit history.

---

## 18.6 Support versus operational workflows

A Support ticket is not:

* QA non-conformance;
* stock adjustment;
* dispatch issue;
* production task.

Support may link to those records.

The operational module remains authoritative.

---

# Chapter 19 — Marketing and Commercial Direction

EveryBatch’s commercial identity should grow from the real platform and real Clean Eats experience.

---

## 19.1 Marketing website

Recommended architecture:

* separate Next.js repository;
* App Router;
* TypeScript;
* Tailwind;
* Vercel;
* shared brand tokens;
* independent deployment.

The marketing site should not live inside the authenticated platform codebase.

---

## 19.2 Public domain structure

* `everybatchmrp.com` — marketing;
* `app.everybatchmrp.com` — central app;
* `admin.everybatchmrp.com` — Platform Admin;
* tenant domain — tenant app;
* `support.everybatchmrp.com` — Help Centre.

---

## 19.3 Website content direction

Initial pages may include:

* Home;
* Platform;
* Solutions;
* Traceability and Compliance;
* Pricing/Talk to Sales;
* Book a Demo;
* About;
* Security and Data;
* Resources;
* Product Updates;
* Privacy;
* Terms.

---

## 19.4 Product story

The strongest marketing story is real:

> EveryBatch was born inside an Australian food manufacturer after fragmented spreadsheets, costing systems, production tools and inventory processes exposed the need for one connected operating platform.

This should be central to:

* About;
* Home;
* sales demos;
* case study;
* investor/commercial narrative.

---

## 19.5 Product screenshots

The public website should use:

* real product screenshots;
* privacy-safe data;
* polished modules;
* honest capability.

AI mockups should remain design references rather than published product proof.

---

## 19.6 Compliance language

Safe language:

* supports HACCP workflows;
* supports lot traceability;
* supports role permissions;
* supports audit history;
* helps organise QA records.

Unsafe unless verified:

* HACCP certified;
* guarantees compliance;
* regulator approved;
* automatically recall-ready.

---

## 19.7 Lead flow

Initial public CTA:

* Book a Demo;
* Talk to Sales.

The form may collect:

* name;
* company;
* work email;
* phone;
* industry;
* facility size;
* current systems;
* operational pain points;
* desired modules;
* preferred contact time.

Initial handling may:

* email Luke;
* store a lead;
* create calendar booking.

It should not directly create an active tenant.

---

## 19.8 Pricing

Pricing should remain controlled until EveryBatch understands:

* onboarding effort;
* support burden;
* storage;
* users;
* facilities;
* invoice-processing cost;
* integrations;
* customisation.

Plan names may be used without publishing untested prices.

---

## 19.9 Commercial lifecycle

Potential lifecycle:

* prospect;
* demo booked;
* qualified;
* implementation scoping;
* onboarding;
* active tenant;
* suspended;
* cancelled;
* archived.

This lifecycle should eventually connect the marketing site, CRM and Platform Admin.

---

# Chapter 20 — Implementation and Onboarding Philosophy

EveryBatch is not likely to be a zero-configuration product for early customers.

Food manufacturers have:

* different suppliers;
* different units;
* different formulas;
* different rooms;
* different QA;
* different carriers;
* different operating procedures.

---

## 20.1 Controlled implementation

Early onboarding may include:

1. discovery;
2. tenant provisioning;
3. user setup;
4. module selection;
5. supplier import;
6. item import;
7. formula import;
8. location setup;
9. QA template setup;
10. logistics configuration;
11. staff training;
12. validation;
13. go-live.

---

## 20.2 Templates versus hard-coding

EveryBatch may offer starting templates for:

* modules;
* QA checks;
* roles;
* workspaces;
* onboarding checklist.

A tenant template should be copied into tenant-owned records.

Do not make Clean Eats’ configuration globally authoritative.

---

## 20.3 Staging and review

Imports and setup workflows should use:

* staging;
* validation;
* mapping;
* preview;
* explicit apply.

Avoid silent automatic creation from spreadsheets or parsed documents.

---

## 20.4 Readiness

A tenant should have a visible setup/readiness model.

Examples:

* users;
* suppliers;
* items;
* formulas;
* locations;
* prices;
* QA;
* carriers;
* production areas.

Readiness should explain the next step rather than simply score the tenant.

---

# Chapter 21 — Clean Eats Validation Approach

Clean Eats validation should be structured and progressive.

---

## 21.1 Luke-led review first

Before broad staff testing, Luke should review:

* navigation;
* terminology;
* module structure;
* workflow sequence;
* missing actions;
* source links;
* UI consistency;
* known limitations.

This prevents staff sessions being consumed by obvious architecture issues.

---

## 21.2 Staff review goal

Staff should validate:

* exact terminology;
* actual fields;
* step sequence;
* ownership;
* timing;
* approval;
* exceptions;
* practical floor use.

They should not be expected to design EveryBatch’s architecture.

---

## 21.3 Review by role

### Warehouse

* Goods Inwards;
* locations;
* lots;
* Stock On Hand;
* stock movements;
* purchasing;
* holds;
* expiry.

### QA

* receiving checks;
* daily/production checks;
* hold/release;
* NC/CA;
* temperatures;
* reporting.

### Production

* plan;
* batches;
* tasks;
* areas;
* facility view;
* stock readiness;
* QA.

### Wholesale/Logistics

* customers;
* dispatch;
* manifest;
* carriers;
* cartons;
* delivery issues.

### Management

* dashboards;
* reports;
* costings;
* readiness;
* exceptions.

---

## 21.4 Test data

Testing should use:

* clearly labelled temporary records;
* non-destructive examples;
* controlled cleanup/archive;
* no confusion with real history.

Important tests may intentionally preserve history to verify archive and reference behaviour.

---

## 21.5 Feedback classification

Feedback should be classified as:

* bug;
* wording;
* missing field;
* workflow order;
* missing permission;
* missing integration;
* UI consistency;
* future enhancement;
* training issue;
* data issue.

This prevents every staff comment becoming an immediate architecture change.

---

# Chapter 22 — Working with Luke

Luke is:

* product owner;
* operational lead;
* primary architect partner;
* Clean Eats internal stakeholder;
* future commercial founder/operator.

He values directness and practical next steps.

---

## 22.1 Response style

Preferred:

* clear;
* direct;
* confident;
* friendly;
* honest;
* exact.

Avoid:

* vague consultancy language;
* excessive abstraction;
* repeating the obvious;
* ending without a next action.

---

## 22.2 Decision support

When presenting alternatives:

* explain operational consequences;
* recommend one;
* identify risk;
* say what must be verified.

Luke wants architectural guidance, not only neutral option lists.

---

## 22.3 Review workflow

When Luke sends Codex output:

* assess it;
* classify issues;
* give exact next action;
* provide a correction prompt automatically;
* provide tests;
* give commit message after validation.

---

## 22.4 Reassurance

Luke may be anxious around:

* migrations;
* long chats;
* handovers;
* major architecture changes.

Provide realistic reassurance through:

* clear safeguards;
* evidence;
* validation steps;
* honest uncertainty.

Do not claim there is no risk.

---

## 22.5 Roadmap control

Never silently change task sequence.

If a missing prerequisite appears:

1. explain it;
2. recommend insertion/change;
3. obtain Luke’s approval;
4. update all key docs.

---

# Chapter 23 — Codex/Developer Collaboration Expectations

Codex is the implementation agent.

It should not own product direction.

---

## 23.1 Every prompt should include

* task number/title;
* project root;
* current state;
* approved sequence;
* scope;
* non-goals;
* repository inspection;
* Admin/Support impact;
* cross-module impact;
* source-of-truth;
* permissions/RLS;
* dummy cleanup;
* checks;
* return format;
* commit message.

---

## 23.2 Repository inspection

Codex must inspect before assuming:

* migration number;
* table names;
* columns;
* permissions;
* role keys;
* helper functions;
* routes;
* documentation conventions;
* current task state.

---

## 23.3 Scope discipline

Codex must not:

* add packages without approval;
* use service role;
* bypass RLS;
* create fake operational data;
* modify unrelated modules;
* pull future tasks forward;
* change auth/domain routing casually;
* silently change roadmap.

---

## 23.4 Runtime honesty

Codex must distinguish:

* compiled;
* automated checks passed;
* manually tested;
* authenticated flow not tested;
* migration not applied.

Do not claim complete runtime verification without evidence.

---

## 23.5 Migrations

Codex should:

* create next migration;
* explain schema;
* include reviewable SQL;
* not apply it;
* provide smoke checks;
* state limitations;
* preserve current migration status.

Large migrations may be reviewed through exact file, line count and SHA-256.

---

## 23.6 Checks

Default:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

Fallback:

```bash
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
git diff --check
```

Do not repeatedly retry a stalled pnpm shim.

---

## 23.7 Documentation

Each task should create or update task notes.

If later work changes an earlier decision, update the earlier document where required.

The repository must remain internally consistent.

---

## 23.8 Branch safety

Where current workflow requires:

* verify branch;
* expected `main`;
* inspect working tree;
* stop on wrong branch;
* do not silently switch;
* preserve unrelated work.

---

# Chapter 24 — Known Risks

## 24.1 Context fragmentation

Multiple chats can lose:

* rationale;
* small UI decisions;
* operational nuance;
* collaboration style.

Mitigation:

* handbook;
* task docs;
* decision log;
* consistency audit;
* living context.

---

## 24.2 Roadmap drift

A useful Codex recommendation may silently change task order.

Mitigation:

* explicit sequence;
* Luke approval;
* roadmap updates;
* module-boundary review.

---

## 24.3 Overengineering foundations

Large schemas may attempt to solve every future case.

Mitigation:

* define current workflow;
* identify true blockers;
* classify later hardening;
* test with Clean Eats.

---

## 24.4 Under-secured rapid development

Speed can create:

* broad permissions;
* RLS gaps;
* cross-tenant references;
* unsafe RPCs.

Mitigation:

* maximum scrutiny for migrations/security;
* smoke checks;
* uploaded SQL review;
* permission matrix.

---

## 24.5 Performance degradation

New modules add queries before optimisation.

Mitigation:

* timing logs;
* loading states;
* later coordinated optimisation;
* pagination;
* aggregate/read models where justified.

---

## 24.6 Scaffold misrepresentation

Visible modules may appear operational when they are not.

Mitigation:

* honest empty states;
* no fake rows;
* clear “not connected” language;
* maturity tracking.

---

## 24.7 Source duplication

Modules may copy data for convenience.

Mitigation:

* ownership map;
* references;
* read models;
* source links;
* review prompts.

---

## 24.8 Platform Admin privacy

Global operator access may be acceptable for one tenant but unsafe commercially.

Mitigation:

* future audited support-access model;
* explicit write boundaries;
* external-tenant hardening.

---

## 24.9 Legacy-tool divergence

Streamlit/Python tools may contain logic not yet reflected in EveryBatch.

Mitigation:

* legacy-tool inventory;
* compare outputs;
* validate migration;
* do not retire tools prematurely.

---

# Chapter 25 — Deferred Capabilities

Major deferred capabilities include:

* stock adjustment/reversal;
* stocktake;
* transfers;
* purchase orders;
* reorder rules;
* production input generation;
* stock availability;
* production release;
* stock issue;
* production output;
* yield/waste;
* production tasks;
* Facility/iPad workflow;
* production QA;
* temperature monitoring;
* HACCP/CCP depth;
* QA evidence;
* NC/CA;
* full recall;
* carrier integrations;
* Detrack API;
* delivery issues;
* customer/order master;
* CRM;
* full reports;
* audit business events;
* notifications;
* attachment UI;
* Platform Admin health/diagnostics;
* billing;
* domains;
* self-service onboarding;
* marketing website;
* performance optimisation;
* security hardening;
* mobile polish.

Deferred does not mean rejected.

---

# Chapter 26 — Items Requiring Current Repository Verification

Future architects should verify:

* current migration number;
* applied migration status;
* current QA schema;
* current Logistics schema;
* current task number and roadmap;
* latest route structure;
* canonical-route decisions;
* current module sidebar;
* current permissions;
* demo-user access;
* Platform Admin RLS exceptions;
* `post_inventory_receipt` function;
* current Security Advisor warnings;
* current feature flags;
* current support attachment status;
* current production schema;
* current production UI;
* current dashboard state;
* current documentation consistency;
* current branch workflow;
* current marketing repository status;
* current Clean Eats data import status.

---

# Chapter 27 — Guidance for the Next Architect

1. Read current repository docs before proposing work.
2. Treat this handbook as historical context, not canonical code truth.
3. Preserve source ownership.
4. Ask Luke before changing roadmap.
5. Keep Clean Eats operational needs central.
6. Do not hard-code Clean Eats globally.
7. Use proportionate review.
8. Be strict with migrations and tenant security.
9. Do not overbuild first foundations.
10. Automatically provide exact Codex correction prompts.
11. Give exact test steps.
12. Do not approve commit before required validation.
13. Preserve small UX decisions.
14. Keep docs synchronised.
15. Label current, future and scaffold capability honestly.
16. Maintain EveryBatch as a food-manufacturing-specific product.
17. Consider commercial SaaS implications without derailing current operations.
18. Keep Platform Admin separate from tenant operations.
19. Use real source data for dashboards and reports.
20. Continue building toward the full supplier-to-dispatch chain.

---

# PART M — TECHNICAL AND CODEX MEMORY APPENDIX

---

# M1. Core stack

**CONFIRMED FROM PROJECT CONTEXT**

* Next.js App Router;
* TypeScript;
* Tailwind CSS;
* Supabase;
* Vercel;
* GitHub;
* Codex.

Project root historically:

```text
/Users/cealukemichalowsky/Development/food-prod-hub
```

Verify current path before work.

---

# M2. Deployment and domains

Known domains:

```text
everybatchmrp.com
app.everybatchmrp.com
admin.everybatchmrp.com
cleaneats.everybatchmrp.com
support.everybatchmrp.com
```

Never use:

```text
admin.everybatchmrp.com.au
```

Old Vercel URL historically redirected to the central app.

---

# M3. App modes

Known app modes:

```text
marketing
central_app
platform_admin
tenant_app
support
local_dev
unknown
```

Verify current implementation in app-mode routing helpers.

Middleware should remain host-focused and avoid database/session queries where possible.

---

# M4. Supabase project

Historical project URL:

```text
https://svhottkzxrbfaprdhybn.supabase.co
```

Never expose keys.

`.env.local` should remain ignored.

---

# M5. Authentication helpers

Known application helpers:

```text
requireAuth()
requireAppAccess()
requirePermissionAccess()
requirePermissionAccessWithPermissions()
getAppShellContext()
```

Known database helpers:

```text
public.current_profile_id()
public.is_active_member(uuid)
public.current_role_key(uuid)
public.is_platform_admin()
public.has_permission(uuid, text)
```

Verify current signatures and implementation.

---

# M6. Core tenant pattern

Tenant-owned tables generally use:

```text
organisation_id uuid not null
```

Preferred safety pattern:

* `(organisation_id, id)` unique index;
* composite foreign keys;
* RLS;
* active membership;
* granular permission.

---

# M7. RLS conventions

Typical policy concepts:

### SELECT

* platform diagnostic access where approved;
* or active member + view permission.

### INSERT

* active member;
* create permission;
* current actor checks;
* tenant-safe foreign keys.

### UPDATE

* active member;
* manage/action permission;
* lifecycle restrictions.

### DELETE

Generally absent for operational records.

Use archive/cancel/supersede.

---

# M8. SECURITY DEFINER rules

Any Security Definer function should have:

```sql
set search_path = public
```

Also:

* no dynamic SQL;
* explicit membership;
* explicit permission;
* minimal arguments;
* current-profile derivation;
* `public` revoked;
* `anon` revoked;
* authenticated granted only where required.

Known function:

```text
public.post_inventory_receipt(p_receipt_id uuid)
```

Current state requires repository verification.

---

# M9. Server actions

Server actions should:

* validate form values;
* derive tenant/profile context;
* require permission;
* use RLS-safe Supabase client;
* not accept trusted organisation/actor IDs from form input;
* return friendly errors;
* revalidate appropriate routes;
* redirect consistently;
* avoid sequential irreversible multi-table writes where RPC is safer.

---

# M10. Runtime UI caution

A build can pass while a Server Action fails at runtime.

Known incident:

```text
ownerTask.run is not a function
```

This occurred with repeated inline Goods Inwards line-edit forms.

Final fix:

```text
/goods-inwards/[id]/lines/[lineId]/edit
```

Do not reintroduce complex inline Server Action boundaries without testing.

---

# M11. Migration discipline

Before creating a migration:

1. inspect latest migration;
2. choose next number;
3. inspect existing conventions;
4. use exact table/column names;
5. document scope;
6. do not apply;
7. provide reviewable SQL/file;
8. provide smoke checks;
9. update docs;
10. wait for Luke’s apply/test.

---

# M12. Migration review format

Normal migration:

```text
FULL SQL MIGRATION CONTENTS
```

Large migration:

* exact file;
* line count;
* SHA-256;
* no pretending truncated content is complete.

---

# M13. Checks

Default:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

Fallback:

```bash
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
git diff --check
```

Known issue:

* pnpm may stall;
* `.next/types` may be missing before build.

Run build, then rerun typecheck.

---

# M14. Documentation convention

Task documents:

```text
docs/<task-number>-<slug>.md
```

Every task should update relevant:

* README;
* CODEX project context;
* roadmap;
* previous affected task docs;
* support content;
* release notes;
* migration status.

---

# M15. Codex prompt structure

A strong prompt should include:

1. Task identity
2. Project root
3. Product/domain context
4. Current state
5. Repository inspection
6. Objective
7. Included scope
8. Explicit non-goals
9. Source-of-truth
10. Admin + Support impact
11. Cross-module impact
12. Permissions/RLS
13. Dummy cleanup
14. Documentation
15. Migration rule
16. Checks
17. Return format
18. Suggested commit message

---

# M16. Admin + Support requirement

Every substantial task should explicitly cover:

* Platform Admin routes;
* tenant visibility;
* tenant management;
* organisation modules;
* feature flags;
* permissions;
* Support guides;
* troubleshooting;
* ticket context;
* release notes;
* Platform Support Inbox;
* diagnostics.

Planning-only work should document future impact rather than publishing user-facing changes.

---

# M17. Cross-module requirement

Prompts should identify:

* current real integration;
* future planned integration;
* explicit out-of-scope integration.

Do not authorise implementation merely by documenting a relationship.

---

# M18. Dummy-data rule

Do not add:

* fake operational records;
* fake integration status;
* fake metrics;
* fake support tickets;
* fake QA records;
* fake carrier records.

Use:

* real data;
* test data clearly labelled;
* honest empty state.

---

# M19. Support context

Pages should map to:

* module;
* workspace;
* route;
* entity ID where safe.

Support context must not become an authorisation mechanism.

---

# M20. Known storage areas

Historical buckets:

```text
purchase-documents
organisation-branding
support-ticket-attachments
```

Known future need:

* QA evidence;
* import files;
* generated reports;
* carrier exports.

Private by default.

---

# M21. Search

Global search historically supported:

* pages;
* suppliers;
* internal items;
* supplier items;
* locations;
* costings/prices;
* purchase documents;
* formulas.

Search must be permission-aware.

---

# M22. Route and title conventions

Browser title:

```text
Page Name - EveryBatch
```

Major operational workspaces often use short routes.

Nested routes may redirect.

Verify current route map before adding aliases.

---

# M23. Branch safeguards

Later workflow expected:

```bash
git branch --show-current
git status --short
```

Expected branch historically:

```text
main
```

Do not switch or create branches silently.

Stop and report if branch/worktree state conflicts with prompt requirements.

---

# M24. Commit process

After Codex returns:

1. Architect reviews.
2. Migration reviewed where applicable.
3. Luke applies SQL.
4. SQL smoke checks.
5. Browser tests.
6. Fix prompt if needed.
7. Commit approval.
8. Exact commit message.
9. Next task only after commit.

---

# M25. Known security warnings

Historically parked:

* Security Definer advisor warning for `post_inventory_receipt`;
* Leaked Password Protection Disabled.

Later migrations may have introduced further warnings.

Verify current Supabase Security Advisor.

---

# M26. Known performance issues

Historical slow areas:

* AppShell navigation context;
* Dashboard;
* Inventory Traceability;
* Stock On Hand potential scale;
* broad permission/module queries.

Performance was deferred, not forgotten.

---

# M27. Things Codex must never do

* Use service role for normal tenant workflows.
* Bypass RLS for convenience.
* Trust client organisation ID.
* Trust client actor ID.
* Add fake operational data.
* Silently change roadmap.
* Start future tasks.
* Add packages without approval.
* Change auth/domain routing casually.
* Rewrite posted/published history.
* Edit stock movements to correct balance.
* Auto-post invoices into stock.
* Auto-approve parsed prices.
* Guess pack conversions.
* Claim integrations or certifications that do not exist.
* Apply migrations.
* Hide errors.
* Claim runtime testing that did not occur.
* Ignore docs.
* Overwrite unrelated work.

---

# End of Part 8

Part 9 will continue and complete:

# PART N — EXTRACTION PACK FOR THE CURRENT ARCHITECT

Including:

1. 25 facts likely missing from the previous handover
2. 25 small UI/product decisions
3. 25 architectural decisions
4. 25 deferred ideas
5. 15 Clean Eats operational facts
6. 15 collaboration preferences
7. 15 highest-risk misunderstandings
8. Contradictions and uncertain facts to reconcile
9. Questions for Luke
10. Recommended permanent documents

It will then conclude with:

**END OF ORIGINAL ARCHITECT MEMORY DOSSIER AND DRAFT HANDBOOK**

# EVERYBATCH HISTORICAL ARCHITECT MEMORY DOSSIER

## PART 9 — Extraction Pack for the Current Architect

This final part completes the Historical Architect Memory Dossier and draft handbook requested in the source brief. 

---

# PART N — EXTRACTION PACK FOR THE CURRENT ARCHITECT

---

# N1. The 25 Most Important Facts Likely Missing or Underrepresented in the Previous Handover

## 1. EveryBatch began as a Clean Eats costing problem

**CONFIRMED FROM OUR CONVERSATION**

The platform was not conceived as a SaaS product first.

It grew because accurate costing required connected supplier, item, formula, unit, inventory and production data.

---

## 2. Luke is an operational insider, not merely the software client

**CONFIRMED FROM OUR CONVERSATION**

Luke works directly with Clean Eats and understands most high-level workflows.

Staff input should refine details, not design the entire platform from scratch.

---

## 3. Intermediate components are central to the product model

**CONFIRMED FROM OUR CONVERSATION**

Prepared and cooked items such as sauces, rice and seasoned meat are first-class manufactured components, not merely hidden recipe lines.

---

## 4. Clean Eats is Tenant 1 and the proving ground

**CONFIRMED FROM OUR CONVERSATION**

Clean Eats should supply real workflows and data without becoming hard-coded global behaviour.

---

## 5. The platform is intentionally food-manufacturing specific

**CONFIRMED FROM OUR CONVERSATION**

The product should not become a generic ERP optimised for unrelated industries.

---

## 6. “Every ingredient. Every process. Every batch.” reflects the intended end-to-end chain

**CONFIRMED FROM OUR CONVERSATION**

It maps to ingredient identity, operational processes and lot/batch traceability.

---

## 7. Module dashboards were intentionally deferred until source workspaces became real

**CONFIRMED FROM OUR CONVERSATION**

The mockups are a directional north star, but dashboards should not be populated with invented metrics.

---

## 8. Visible loading states were an established product expectation

**CONFIRMED FROM OUR CONVERSATION**

Clicks should never appear ignored, especially because current server-rendered routes can be slow.

---

## 9. Short canonical workspace routes were preferred

**CONFIRMED FROM OUR CONVERSATION**

Earlier operational workspaces used routes such as `/stock-on-hand` rather than always nesting under the module.

QA and Logistics introduced an inconsistency that was parked for a coordinated route pass.

---

## 10. Parent modules should open their dashboard without a duplicate Dashboard child

**CONFIRMED FROM OUR CONVERSATION**

This was part of keeping the sidebar clean and intuitive.

---

## 11. EveryBatch and tenant branding should both remain visible

**CONFIRMED FROM OUR CONVERSATION**

The tenant identifies the operational workspace.

EveryBatch identifies the software platform.

---

## 12. Fake data was acceptable only as early scaffolding

**CONFIRMED FROM OUR CONVERSATION**

Once a workspace becomes operational or is reviewed, fake rows should be replaced by real records or honest empty states.

---

## 13. Configuration must never imply integration

**CONFIRMED FROM PROJECT CONTEXT**

A configured carrier is not a connected carrier.

A Carrier Exports page is not proof files or APIs exist.

---

## 14. Build success is not runtime proof

**CONFIRMED FROM OUR CONVERSATION**

The Goods Inwards `ownerTask.run` failure passed build and only appeared during authenticated browser use.

---

## 15. Dedicated edit routes are acceptable when inline Server Action complexity becomes unstable

**CONFIRMED FROM OUR CONVERSATION**

The Goods Inwards line editor was deliberately moved to a dedicated route.

---

## 16. Historical posted/published records should remain calm and readable

**CONFIRMED FROM OUR CONVERSATION**

Do not continue showing pre-post blockers as warnings after a successful post.

---

## 17. Review strictness should be proportional to risk

**CONFIRMED FROM OUR CONVERSATION**

Maximum scrutiny belongs on migrations, RLS, permissions, RPCs and irreversible writes.

Not every scaffold or read-only screen needs enterprise-grade review.

---

## 18. Foundation tasks are intended to create the safest useful base, not the final enterprise platform

**CONFIRMED FROM OUR CONVERSATION**

Real Clean Eats usage should later inform permission refinement, separation of duties and advanced lifecycle controls.

---

## 19. Codex does not own the roadmap

**CONFIRMED FROM OUR CONVERSATION**

The architect or Codex may recommend changes.

Luke must approve renumbering, insertion or reordering.

---

## 20. Documentation is part of implementation

**CONFIRMED FROM OUR CONVERSATION**

Each task should leave the repository’s task docs, context and roadmap coherent.

Later tasks should update earlier docs when they alter a prior decision.

---

## 21. Existing legacy tools contain valuable operational logic

**CONFIRMED FROM PROJECT CONTEXT**

Streamlit, Python, Zapiet and Detrack utilities are not merely obsolete code.

They encode real Clean Eats workflow knowledge that should be inventoried before replacement.

---

## 22. The staff-meeting strategy is Luke-led review first

**CONFIRMED FROM OUR CONVERSATION**

Luke wants to review the platform himself, refine obvious issues, and then show staff a meaningful base.

---

## 23. Platform Admin needs a second major review after tenant modules mature

**CONFIRMED FROM OUR CONVERSATION**

Tenant health, onboarding, support access, billing readiness and diagnostics should be revisited once the operational modules are real.

---

## 24. The marketing site is part of the product architecture

**CONFIRMED FROM PROJECT CONTEXT**

It should connect lead capture, qualification, onboarding and Platform Admin provisioning rather than exist as a disconnected brochure.

---

## 25. Early commercial onboarding should remain controlled

**CONFIRMED FROM PROJECT CONTEXT**

Do not let a marketing form instantly create a live manufacturing tenant before provisioning, first-admin, modules, billing and implementation workflows are mature.

---

# N2. The 25 Most Important Small UI and Product Decisions

## 1. Parent module click opens module dashboard.

## 2. Avoid duplicate Dashboard submenu items.

## 3. Major operational areas are called workspaces, not merely pages.

## 4. Short canonical workspace routes are preferred where appropriate.

## 5. Nested routes should redirect safely to canonical routes.

## 6. Preserve Support context and active navigation through route redirects.

## 7. Keep the app shell visible during loading.

## 8. Show visible loading feedback instead of appearing frozen.

## 9. Server actions need pending states and duplicate-click protection.

## 10. Read-only users should not see fake disabled write actions.

## 11. Empty states must explain what creates the records.

## 12. Do not show fake metrics, rows, integrations or unread counts.

## 13. Status wording should mean the same thing across modules.

## 14. Status colours should remain semantically consistent despite tenant branding.

## 15. Posted/published/completed records should visibly become read-only.

## 16. Historical pages should explain the proper correction method.

## 17. Soft archive is preferred to hard delete for referenced records.

## 18. Archived records should disappear from new selectors but remain visible historically.

## 19. Detail pages should link back to parent workspace and related source records.

## 20. Page titles should use `Page Name - EveryBatch`.

## 21. Expanded sidebar uses tenant full logo; collapsed sidebar uses tenant icon.

## 22. User/account controls belong at the bottom-left of the sidebar.

## 23. Global Search is icon-led and supports Cmd/Ctrl+K.

## 24. Dense tables should become stacked cards or controlled overflow on smaller screens.

## 25. Dashboard cards should link to the exact operational queue they summarise.

---

# N3. The 25 Most Important Architectural Decisions

## 1. EveryBatch is multi-tenant from the foundation.

## 2. `organisation_id` is the principal tenant boundary.

## 3. RLS is required rather than relying only on UI or server filtering.

## 4. Authentication does not equal tenant membership.

## 5. Permissions are preferred over direct role checks.

## 6. Module enablement and permission are separate controls.

## 7. Feature flags control rollout, not security.

## 8. Clean Eats configuration remains tenant-owned.

## 9. Products owns canonical item identity.

## 10. Supplier catalogue items remain distinct from internal items.

## 11. Components are first-class manufactured items.

## 12. Formula versions preserve composition history.

## 13. Invoice parsing produces evidence, not automatically approved truth.

## 14. Supplier invoices do not auto-post stock.

## 15. Approved prices are reviewed records.

## 16. Stock Movements is the append-oriented inventory ledger.

## 17. Stock On Hand is derived from posted movements.

## 18. Historical movement rows are not edited to correct stock.

## 19. Costing snapshots remain immutable.

## 20. Safe metric UOM conversions may be global; contextual pack conversions may not.

## 21. Multi-table consequential writes should use controlled transaction-safe RPCs where justified.

## 22. Security Definer functions require fixed search path and explicit access checks.

## 23. Platform Admin is separate from Tenant Admin.

## 24. Reports and dashboards remain read models.

## 25. Support owns support records but does not replace operational workflows.

---

# N4. The 25 Most Important Deferred Ideas

## 1. UOM rule integration into Costings, Goods Inwards and Production.

## 2. Stock Adjustment and Reversal workflow.

## 3. Stocktake.

## 4. Inventory transfers.

## 5. Purchase Orders and requirement generation.

## 6. Expiry alerts and FEFO.

## 7. Production input requirement generation.

## 8. Production stock availability.

## 9. Production release workflow.

## 10. Lot allocation.

## 11. Production stock issue movements.

## 12. Production output lots and movements.

## 13. Production yield, waste and variance.

## 14. Production tasks and events.

## 15. Facility/iPad operational view.

## 16. Production QA.

## 17. Temperature monitoring and HACCP/CCP depth.

## 18. Non-Conformance and Corrective Action.

## 19. QA evidence and tenant QA documents.

## 20. Recall-grade forward traceability.

## 21. Carrier exports and Detrack/API integration.

## 22. CRM customer/account and order architecture.

## 23. Platform Admin health, diagnostics, domains and billing.

## 24. Coordinated UI consistency and performance pass.

## 25. Public marketing website, lead pipeline and controlled tenant onboarding.

---

# N5. The 15 Most Important Clean Eats Operational Facts

## 1. Clean Eats produces approximately 4,000 meals per production day.

## 2. Finished meals use intermediate manufactured components.

## 3. Supplier descriptions and internal item names differ.

## 4. Supplier invoices are a key source of price and item-mapping evidence.

## 5. Invoice evidence does not prove physical receipt.

## 6. Receiving requires item, quantity, unit, location, lot and date context.

## 7. Clean Eats uses multiple physical areas such as Kitchen, Prepack, Packing, Cool Room, Freezer and Dry Store.

## 8. Inventory must distinguish available, held and physical quantities.

## 9. Production is area- and task-dependent rather than one flat workflow.

## 10. Existing production tools encode substantial real production logic.

## 11. Rice production changed to oven trays using 2kg rice and 3kg water per tray.

## 12. QA stakeholders include Cettina and Luisa.

## 13. Warehousing/receiving input is associated with Eddie.

## 14. Logistics includes residential, wholesale, multiple brands/order groups and carrier-specific rules.

## 15. Clean Eats staff still need to validate exact recipes, QA procedures, responsibilities, limits and practical workflow exceptions.

---

# N6. The 15 Most Important Collaboration Preferences

## 1. Give Luke the exact ready-to-paste Codex prompt.

## 2. When Codex is wrong, automatically provide the correction prompt.

## 3. Give a direct approve, test, fix or do-not-apply decision.

## 4. Provide exact browser test steps.

## 5. Provide exact SQL smoke checks and expected results.

## 6. Do not claim runtime success from a build alone.

## 7. Do not recommend commit before high-risk validation.

## 8. Provide the exact commit message.

## 9. State the exact next approved task after commit.

## 10. Do not silently change roadmap order.

## 11. Preserve future ideas without pulling them into the current task.

## 12. Use proportionate scrutiny.

## 13. Be honest about uncertainty and repository verification.

## 14. Keep responses direct, practical and friendly.

## 15. Maintain architectural ownership instead of delegating product decisions to Codex.

---

# N7. The 15 Highest-Risk Misunderstandings a Future Architect Could Make

## 1. Treat EveryBatch as a generic ERP instead of a food-manufacturing platform.

## 2. Treat Clean Eats as hard-coded global configuration.

## 3. Assume an existing scaffold route is a live workflow.

## 4. Assume production batch inputs mean stock consumption exists.

## 5. Assume Carrier Configuration means an API integration is live.

## 6. Assume Supplier Invoice Intake should auto-post inventory.

## 7. Assume parsed invoice prices should automatically become approved prices.

## 8. Treat Stock On Hand as an editable source record.

## 9. Edit historical Stock Movements to correct inventory.

## 10. Flatten components and finished products into one recipe model.

## 11. Guess contextual pack conversions.

## 12. Put Platform Admin inside the tenant module structure.

## 13. Treat Support tickets as operational QA, Logistics or Inventory records.

## 14. Populate dashboards with invented metrics before source data exists.

## 15. Follow Codex’s suggested task sequence without Luke’s explicit approval.

---

# N8. Contradictions and Uncertain Facts Requiring Reconciliation

## 1. Current roadmap numbering after later QA and Logistics changes

**POSSIBLY OUTDATED**

The original revised roadmap was later modified when missing Logistics work was inserted.

Repository and current architect context should determine the active sequence.

---

## 2. Current applied migration number

**REQUIRES REPOSITORY VERIFICATION**

The original handover ended at migration 038.

Later work added QA and Logistics migrations, reportedly into the low 40s.

---

## 3. Current QA schema and operational maturity

**REQUIRES REPOSITORY VERIFICATION**

Later tasks reportedly implemented:

* QA schema;
* Receiving QA;
* hold/release.

Exact current behaviour, permissions and source relationships should be reviewed.

---

## 4. Current Logistics schema and UI

**REQUIRES REPOSITORY VERIFICATION**

Later work reportedly added:

* dispatch runs;
* manifests;
* carrier configuration.

Exact routes and task numbers may differ from the original roadmap.

---

## 5. Recipes workspace purpose

**REQUIRES LUKE CONFIRMATION**

It may overlap with:

* Formula Builder;
* production method;
* recipe cards;
* customer-facing recipe concepts.

---

## 6. Platform Admin global tenant-read access

**REQUIRES SECURITY REVIEW**

It was acceptable during early Clean Eats development but may not be appropriate for external tenants.

---

## 7. QA hold availability model

**REQUIRES REPOSITORY VERIFICATION**

The conceptual model distinguished QA hold records from Inventory ownership.

Current implementation may use active hold state, lot status or both.

---

## 8. Stock On Hand available/held derivation

**REQUIRES REPOSITORY VERIFICATION**

Later QA integration may have changed the derivation.

---

## 9. Current role-permission matrix

**REQUIRES REPOSITORY VERIFICATION**

Later QA and Logistics tasks added granular permissions.

---

## 10. Current canonical route strategy

**POSSIBLY OUTDATED**

The short-route preference remained deferred.

Later work may still use nested QA/Logistics routes.

---

## 11. Staff testing timing

**REQUIRES LUKE CONFIRMATION**

The original roadmap placed testing near tasks 246–249, but Luke planned to insert his own platform review before staff meetings.

---

## 12. Marketing website implementation state

**REQUIRES LUKE CONFIRMATION**

A separate Next.js site was recommended, but current repository/build status is unknown.

---

## 13. Current legacy-tool replacement strategy

**REQUIRES LUKE CONFIRMATION**

It is unclear which Streamlit/Python tools remain operational and which are scheduled for replacement.

---

## 14. Current performance baseline

**REQUIRES CURRENT MEASUREMENT**

Historical timings were poor, but later changes may have improved or worsened them.

---

## 15. Exact Clean Eats carrier and dispatch configuration

**REQUIRES STAFF/LUKE CONFIRMATION**

Historical Detrack values and later test carrier configuration should not automatically become permanent tenant data.

---

# N9. Questions the Current Architect Should Ask Luke

## Product and roadmap

1. What is the currently approved next task and active roadmap source document?
2. Should the roadmap continue as a long fixed sequence or shift to shorter rolling plans?
3. Which modules must be demonstrable before the next Clean Eats meeting?
4. Should dashboard and UI consistency work happen before or after remaining module foundations?
5. Which parked Inventory and Production tasks should move earlier?

## QA

6. What Receiving QA workflow is currently live after later tasks?
7. Does a QA hold currently affect Stock On Hand through an active hold record, lot status or both?
8. Who at Clean Eats should place and release holds?
9. What QA workflows should be shown at the next meeting?
10. Which QA templates need immediate staff validation?

## Production

11. Which production areas are currently accurate?
12. What is the minimum useful Production Tasks workflow?
13. Should Production input/output stock work move earlier for end-to-end traceability?
14. Which legacy production-report calculations are still authoritative?
15. Is the facility/tablet workflow needed for the next meeting or later?

## Logistics and orders

16. Which order sources should EveryBatch ingest first?
17. Does Detrack remain the intended delivery execution system?
18. Which carriers/services are permanent versus temporary test records?
19. What residential/wholesale rules must be preserved?
20. Does Logistics need carton logic before staff review?

## CRM and commercial

21. Is CRM primarily wholesale customer/account management or a sales CRM?
22. Should the marketing website begin before platform demo readiness?
23. Should demo leads be stored inside EveryBatch Platform Admin or a separate lead store?
24. Is controlled onboarding still the approved approach?
25. What commercial milestones define when EveryBatch is ready for external tenants?

## UI and documentation

26. Which short canonical routes does Luke want first?
27. Should the coordinated loading-state pass happen now because of slow routes?
28. Which module currently feels least consistent visually?
29. Should the repository-wide docs audit be performed before more roadmap work?
30. Should this dossier be converted into one handbook or several permanent documents?

---

# N10. Permanent Documents Recommended

## 1. EveryBatch Master Product & Architect Handbook

Purpose:

* product identity;
* origin;
* vision;
* principles;
* module ownership;
* UX;
* collaboration;
* commercial direction.

---

## 2. EveryBatch Decision Log

For every major decision:

* date/task;
* decision;
* alternatives;
* rationale;
* consequence;
* current status;
* revisit condition.

---

## 3. Module Ownership and Source-of-Truth Matrix

Rows:

* record/domain;
* owner module;
* read modules;
* derived views;
* immutable rules;
* prohibited duplication.

---

## 4. Current Platform Capability Matrix

For each module/workspace:

* planned;
* scaffold;
* schema ready;
* UI ready;
* operational;
* tested;
* deployed;
* staff validated;
* limitations.

---

## 5. UI and Interaction Standards

Include:

* page headers;
* module dashboards;
* canonical routes;
* loading states;
* action pending;
* badges;
* colours;
* empty states;
* tables;
* mobile;
* tenant branding;
* Support context.

---

## 6. Route and Host Architecture Guide

Include:

* marketing;
* central app;
* Platform Admin;
* tenant app;
* Support;
* local;
* canonical routes;
* redirects;
* middleware rules.

---

## 7. Role and Permission Matrix

Include:

* role;
* module;
* permission;
* default mapping;
* sensitive action;
* tenant membership;
* Platform Admin exception;
* review date.

---

## 8. Migration and Database Change Register

Include:

* migration number;
* title;
* task;
* created date;
* applied date;
* applied by;
* smoke checks;
* Security Advisor effects;
* rollback note.

---

## 9. External Tools and Integration Inventory

Include:

* Shopify;
* Detrack;
* Xero;
* Streamlit tools;
* Python tools;
* Zapiet;
* carrier exports;
* current owner;
* data direction;
* replacement/integration status.

---

## 10. Clean Eats Operational Discovery Register

Include:

* area;
* known facts;
* assumptions;
* required staff;
* open questions;
* validation date;
* resulting task/document.

---

## 11. Clean Eats Formula and Production Data Dictionary

Include:

* item;
* item type;
* component;
* formula;
* yield;
* unit;
* method;
* area;
* task;
* validation status.

---

## 12. QA Operating Model

Include:

* templates;
* result types;
* Receiving QA;
* Production QA;
* holds;
* release;
* NC/CA;
* evidence;
* permissions;
* staff ownership.

---

## 13. Inventory Ledger and Traceability Guide

Include:

* receipt;
* line;
* lot;
* movement;
* Stock On Hand;
* hold;
* adjustment;
* transfer;
* production issue/output;
* recall chain.

---

## 14. Production Operating Model

Include:

* demand;
* plan;
* batch;
* requirements;
* stock availability;
* allocation;
* issue;
* tasks;
* QA;
* output;
* yield;
* waste.

---

## 15. Logistics and Dispatch Operating Model

Include:

* order source;
* customer;
* dispatch run;
* delivery;
* manifest;
* carrier;
* service;
* carton;
* export;
* issue;
* Detrack.

---

## 16. Support and Operator Access Policy

Include:

* ticket lifecycle;
* internal notes;
* attachments;
* support context;
* tenant operational access;
* Platform Admin read/write boundaries;
* audit.

---

## 17. Platform Admin Tenant Lifecycle Guide

Include:

* prospect;
* provisioning;
* onboarding;
* active;
* suspended;
* cancelled;
* archived;
* first admin;
* modules;
* features;
* domains;
* billing;
* data retention.

---

## 18. Performance and Scalability Backlog

Include:

* route timings;
* query timings;
* known bottlenecks;
* affected routes;
* target;
* recommended fix;
* security/caching caution.

---

## 19. Security Hardening Register

Include:

* Security Advisor warnings;
* RLS audit;
* Security Definer functions;
* Platform Admin access;
* storage policies;
* leaked password protection;
* external-tenant blockers.

---

## 20. Marketing Website Architecture and Content Master Document

Include:

* sitemap;
* messaging;
* page sections;
* CTA;
* demo flow;
* lead storage;
* onboarding link;
* real screenshots;
* compliance language;
* analytics;
* launch plan.

---

## 21. Staff Review and Feedback Framework

Include:

* meeting objective;
* walkthrough order;
* test records;
* role-specific script;
* feedback categories;
* severity;
* resulting action;
* known limitations.

---

## 22. Documentation Inventory and Audit Report

Include:

* task docs;
* stale files;
* conflicts;
* missing documents;
* roadmap mismatch;
* implementation mismatch;
* correction plan.

---

## 23. Test Data and Demo Tenant Policy

Include:

* test-record naming;
* retention;
* archive;
* no confusion with real data;
* screenshot safety;
* reset strategy.

---

## 24. EveryBatch Glossary

Include:

* module;
* workspace;
* internal item;
* supplier item;
* component;
* formula;
* receipt;
* lot;
* movement;
* Stock On Hand;
* batch;
* hold;
* manifest;
* tenant;
* Platform Admin.

---

## 25. Architect and Codex Working Agreement

Include:

* prompt structure;
* review workflow;
* migration review;
* manual tests;
* commit approval;
* roadmap control;
* proportional strictness;
* documentation rules.

---

# Final Original Architect Guidance

EveryBatch’s strongest quality is not any single module.

It is the decision to model a food-manufacturing business as one connected but well-governed operating chain.

Preserve:

* food-specific depth;
* Clean Eats’ practical grounding;
* tenant safety;
* clear ownership;
* immutable operational history;
* honest UI;
* connected navigation;
* controlled onboarding;
* Luke’s direct product leadership.

Do not let future work turn EveryBatch into:

* a generic ERP;
* a collection of impressive dashboards without source data;
* an overengineered schema project that never reaches staff;
* a loosely secured prototype;
* a set of modules that duplicate each other;
* a SaaS platform disconnected from the real business that created it.

The correct balance is:

> Build the safest useful operational foundation, validate it with Clean Eats, preserve history and ownership, then harden and scale EveryBatch into a commercial food-manufacturing platform.

---

**END OF ORIGINAL ARCHITECT MEMORY DOSSIER AND DRAFT HANDBOOK**