# Staff Meeting Outcomes and Phase 1 Demo Plan

## Meeting Summary

The wider Clean Eats team has now seen and discussed the HUB direction.

Feedback was positive and the team is excited. There was a lot of information, so the next step is not real data connection yet.

The next step is to build realistic dummy/sample versions of the Phase 1 modules so staff can review flows before database tables and imports are locked in.

## Updated Build Direction

Immediate priority:

**Phase 1 demo-module layer using dummy/test data.**

Modules:

- Products
- Costings
- Production
- Inventory

Purpose:

- let staff see and test realistic module flows
- collect better feedback
- identify missing features before real database design
- avoid locking database structure too early
- keep Clean Eats as Tenant 1 without hard-coding Clean Eats-only logic

## Phase 1 Modules

### Products

- already has UI skeleton
- covers suppliers, ingredients, packaging, components and meals
- sample data only
- staff feedback and CSV collection underway

### Costings

- next UI skeleton to create
- should show ingredient cost status, packaging cost status, component costing, recipe/finished product costing, margin prompts and price history placeholders
- sample data only

### Production

- should show production overview, production plans, production areas, tasks, batch/component prep and tablet/iPad preview concepts
- should use sample production-flow data only

### Inventory

- should show inventory overview, goods inwards, receiving, batches, storage locations, stock movements, kitchen issue/transfer, BOM/traceability concepts and reorder prompts
- sample data only
- no real inventory data yet

## Demo/Test User Plan

After Products, Costings, Production and Inventory have dummy/sample screens, create a demo/test user for staff review.

The test user should:

- be separate from Luke/platform admin
- have access only to Phase 1 modules needed for review
- not have Admin access
- not have `platform_admin` access
- be safe for internal staff testing
- use sample/demo data only

Suggested visible modules:

- Dashboard
- Products
- Costings
- Production
- Inventory

Suggested hidden modules for this demo user:

- Admin
- QA unless included later
- Logistics unless included later
- CRM unless included later
- Reports unless included later

This will require future planning around roles, permissions and module access before creating the user.

## Staff Review Workflow

Staff should review the dummy modules over the next few days and provide feedback on:

- whether the flow makes sense
- what fields are missing
- what terminology is wrong
- what should be manager-only
- what should be staff/tablet-facing
- what should happen daily
- what causes delays/errors currently

## CSV/Data Collection Order

The Products UI skeleton has now been aligned to this collection order. The Products sidebar shows Suppliers, Ingredients, Packaging, Components, Recipes and Finished Products, with `Meals` removed from visible Products navigation for now.

Agreed order:

1. Suppliers
2. Ingredients
3. Packaging
4. Components and Batch Recipes / Items
5. Recipes
6. Finished Product

Why this order matters:

- suppliers connect to ingredients and packaging
- ingredients connect into components, recipes and costings
- packaging connects into finished product and costings
- components/batch recipes feed into recipes and finished products
- recipes and finished products depend on the upstream data
- collecting all data close together is normal because the structures are linked

## Data Collection Guardrails

- do not import everything immediately
- collect first, review second, model third, import fourth
- clean inconsistent naming before import
- watch for duplicate ingredients/suppliers/packaging names
- separate real business data from sample UI data
- keep source files versioned/dated
- note unknown fields rather than forcing bad data

## Inventory and BOM / Traceability Requirements

Inventory is not just stock on hand.

It eventually needs to support:

- supplier receipt
- batch/lot capture
- received date
- expiry/use-by date where applicable
- supplier reference/invoice/delivery note where useful
- storage location
- movement between storage areas
- movement from storage to kitchen/production
- material consumption in components/batch recipes
- material consumption in recipes/finished product
- finished product output
- traceability from incoming goods to finished product where practical

Likely future concepts:

- Bill of Materials
- `inventory_batches`
- `stock_locations`
- `stock_movements`
- `production_batches`
- `production_consumption`
- component inputs
- finished product outputs

Do not create tables yet. This is planning only.

## Production and iPad/Facility Portal Requirements

The iPad/facility portal is important and should be considered early.

Future iPad/facility screens should eventually support:

- staff login or area-based access
- today's tasks
- production area task queue
- task instructions
- batch/material selection
- required weights
- actual weights
- checks/confirmations
- waste logging
- issue reporting
- start/pause/complete task controls
- QA/supervisor sign-off where needed

For now, Production module demo screens should include a preview of this flow using dummy data only.

## What We Are Not Building Yet

- no real Clean Eats data imports yet
- no real Products database tables yet
- no real Inventory/BOM tables yet
- no real Production task engine yet
- no real iPad portal yet
- no live costing calculations yet
- no write/edit flows yet unless separately planned
- no staff demo user until the Phase 1 demo screens are ready

## Updated Next Build Sequence

### 045 - Costings Module UI Skeleton

- sample data only
- cost status, margins, missing cost prompts and price history placeholders

This has now been created and documented in [Costings Module UI Skeleton](45-costings-module-ui-skeleton.md).

The Costings demo scope now includes ingredient, packaging, component, meal margin and price history review pages so staff can review how costs may flow before real costing tables or calculations are designed.

### 046 - Production Module UI Skeleton

- sample data only
- production overview, areas, tasks and tablet/iPad task preview

This has now been created and documented in [Production Module UI Skeleton](46-production-module-ui-skeleton.md). It includes production report, production plan, production areas, production tasks and facility/iPad workflow previews.

### 047 - Inventory Module UI Skeleton

- sample data only
- goods inwards, batches, stock movements and BOM/traceability preview

This has now been created and documented in [Inventory Module UI Skeleton](47-inventory-module-ui-skeleton.md). It includes goods inwards, batch receiving, stock locations, stock movements, purchasing prompts and BOM/traceability previews for Phase 1 staff review.

### 048 - Phase 1 Dashboard Refresh

- sample data only
- dashboard landing page for Products, Costings, Production and Inventory staff review

This has now been created and documented in [Phase 1 Dashboard Refresh](48-phase-1-dashboard-refresh.md). The dashboard now focuses on the Phase 1 demo modules, staff review prompts, CSV/data collection order and next steps before real data is connected.

### 049 - Demo/Test User Access Plan

- plan role/module/permission access for staff demo user

This has now been created and documented in [Demo/Test User Access Plan](49-demo-test-user-access-plan.md). The plan recommends a safe non-admin demo user, a dedicated `phase_1_demo_user` role, and a check/fix for module-level permission-aware navigation before user creation.

### 050 - Demo Role and Permission Seed Planning / Migration

- create or seed `phase_1_demo_user`
- assign selected Phase 1 view permissions only

This seed migration has now been drafted and documented in [Phase 1 Demo User Role](50-phase-1-demo-user-role.md). It creates the `phase_1_demo_user` role and selected view-only permission assignments for later manual demo user setup.

### 051 - Module-Level Permission-Aware Navigation

- ensure non-admin modules are hidden if the user lacks the module view permission
- preserve enabled-module filtering
- preserve admin permission filtering

### 052 - Create Demo/Test User

- only after access plan is reviewed
- no Admin/platform access

### 053 - Staff Demo Review Round

- staff review Phase 1 modules with test user

### 054 - Products/Inventory Data Model Planning

- use feedback and CSVs to plan real database tables

## Questions Still To Resolve

- final terminology for Components vs Batch Recipes vs Items
- final terminology for Recipes vs Meals vs Finished Product
- what `Finished Product` includes
- how family meals differ from standard meals
- what costing fields are needed first
- what inventory traceability level is required for first release
- what needs to appear on iPad from day one
- what staff should be allowed to edit
- who signs off QA/production checks
- what data is already clean enough to import

## Short Executive Summary

The Clean Eats team is excited and the next best step is to build realistic dummy versions of the Phase 1 modules: Products, Costings, Production and Inventory. Staff will review those flows while collecting CSVs for suppliers, ingredients, packaging, components/batch recipes, recipes and finished products. Real database tables should come after the demo screens and staff feedback so the system matches how Clean Eats actually works.
