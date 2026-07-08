# Products/UI Foundation Plan

## Phase Status

This is a planning document only.

The platform/security foundation is complete. No UI changes, migrations or data tables are created by this task.

The next phase should move Food Prod Hub from technical foundation work into visible product and module value.

## Phase 3 Goal

Phase 3 should create the visual and product foundation for the HUB before importing real Clean Eats data.

Goals:

- Make the app feel closer to the approved Clean Eats Hub mockup.
- Create reusable UI patterns for dashboards, tables and detail pages.
- Build Products module UI skeletons using safe sample data.
- Get Tony/team feedback before locking in real data tables.
- Keep Clean Eats as Tenant 1 without hard-coding Clean Eats-only logic.

## Approved Visual Direction

Luke and Tony both strongly liked the Clean Eats Hub dashboard mockup previously created. This should be treated as the visual target for the next UI pass, not necessarily a pixel-perfect copy.

The target direction includes:

- client logo/name area top left
- modern SaaS operations layout
- left sidebar with icons
- expandable major modules
- nested minor links
- top header with search
- user/profile menu top right
- notification icon/bell placeholder
- dashboard cards with icons
- quick action buttons
- alert centre cards
- data tables inside soft cards
- collapsible sidebar
- light, clean, professional style
- Clean Eats green as the first tenant theme

## Global UI Components to Polish

Shared UI areas to improve before deep data work:

- App shell
- Sidebar
- Sidebar collapse behaviour
- Sidebar icons
- Top header/search/user area
- Login page
- Dashboard summary cards
- Module overview cards
- Table styling
- Status badges
- Empty states
- Detail page layout
- Form section layout
- Quick action buttons
- Alert/notification cards

## Navigation Direction

Major modules:

- Dashboard
- Products
- Costings
- Production
- Inventory
- Purchasing
- QA
- Logistics
- Wholesale
- CRM
- Reports
- Admin

Nested examples:

| Module | Nested links |
| --- | --- |
| Products | Ingredients, Components, Meals, Packaging, Suppliers |
| Costings | Costing Overview, Meal Margins, Price History |
| Production | Production Overview, Production Areas, Production Tasks |
| Inventory | Inventory Overview, Goods Inwards, Stock Movements |
| Admin | Organisation Settings, Users, Modules, Integrations |

Navigation should remain permission-aware and enabled-module-aware.

## Products Module Scope

### Products Overview

- high-level module dashboard
- counts/cards
- quick actions
- recent updates
- missing data prompts

### Ingredients

- ingredient list
- category
- unit
- supplier
- cost placeholder
- status
- allergen/QA flags later

### Suppliers

- supplier list
- contact/status placeholders
- linked ingredients/packaging later

### Packaging

- packaging item list
- type
- unit
- supplier
- cost placeholder
- stock relevance later

### Components

- batch recipes / mixes / prepared components
- ingredients used
- yield/portion notes later
- linked meals later

### Meals

- finished products/meals
- category
- status
- components/ingredients later
- packaging links later
- costing links later

## Product Terminology to Confirm With Staff

Terms to confirm with Tony/team:

- Products
- Meals
- Finished Meals
- Components
- Batch Recipes
- Mixes
- Ingredients
- Raw Ingredients
- Packaging
- Suppliers
- Meal Versions
- Recipes
- Production Areas
- Tasks

The UI skeleton should help staff confirm which terms make sense before database tables become too rigid.

## Sample UI Data Approach

- Use safe sample/placeholder data first.
- Do not import real Clean Eats product data yet.
- Sample data should look realistic enough for screen review.
- Make it obvious that sample data is temporary.
- Avoid hard-coding Clean Eats-specific business rules too deeply.
- Use UI placeholders to validate layout, terminology and workflow.

## Phase 3 Build Sequence

### 041 - Polish Global Visual Direction

- app shell
- sidebar
- top header
- login
- dashboard cards
- shared cards/tables/badges/detail page patterns

This first visual polish pass has now been implemented and documented in [Global Visual Direction Polish](41-global-visual-direction-polish.md).

### 042 - Products Module UI Skeleton

- Products overview
- Ingredients
- Suppliers
- Packaging
- Components
- Meals
- sample data only
- no real product migrations yet unless explicitly decided

### 043 - Staff Review With Tony/Team

- review terminology
- review screens
- confirm needed columns
- confirm workflows
- confirm which data matters first

### 044 - Create Real Products Database Tables

- ingredients
- suppliers
- packaging_items
- components
- meals
- meal_components
- costing fields
- `organisation_id` from the start
- RLS planned with table creation

## Why UI Before Real Data

- Tony/team are visual.
- Screens make feedback easier than database schemas.
- It prevents building the wrong table structure.
- It helps confirm terminology.
- It reduces rework.
- It still keeps the product reusable for future tenants.
- Real data imports should happen after screen/data requirements are clearer.

## Multi-Tenant and Resale Guardrails

The Products module should be designed as reusable platform functionality.

Rules:

- every future business table should include `organisation_id`
- Clean Eats data must be tenant data, not global code
- keep labels/settings configurable where possible
- use module enablement for visibility
- use permissions for access
- avoid Clean Eats-only hard-coded logic
- future tenants should be able to use the same Products module with their own data

## Future Global Platform Admin Direction

A future platform/global admin area should eventually manage:

- organisations/tenants
- enabled modules
- branding
- users/memberships
- roles/permissions
- feature flags
- templates
- support access
- billing/subscription later

This should not be overbuilt before the core Clean Eats pilot modules have real value.

## Staff Review Plan

Reviewers:

- Tony: production/director/product structure
- Cettina and Luisa: QA/food safety requirements
- Eddie: warehouse/inwards/outwards
- Rob: wholesale/customer-related views
- production staff later: tablet/tasks

Questions to answer:

- Do the module names make sense?
- Are the screen layouts understandable?
- Are the listed fields useful?
- What is missing?
- What should be hidden from staff?
- What do people need daily?
- What should be manager-only?

## Phase 3 Success Criteria

- UI feels closer to the approved mockup.
- Login/app shell/dashboard feel polished enough for internal review.
- Products module pages exist as UI skeletons.
- Staff can understand the screens without technical explanation.
- Product terminology is confirmed or adjusted.
- Database table plan can be created with more confidence.
- Clean Eats remains Tenant 1, not hard-coded as the only tenant.

## What Not To Do Yet

- Do not import real Clean Eats data yet.
- Do not create product tables until UI/product requirements are clearer.
- Do not overbuild production/inventory/QA workflows yet.
- Do not create global admin/billing features yet.
- Do not add write policies until required.
- Do not hard-code Clean Eats-only logic into reusable modules.

## Recommended Next Step

041 - Polish Global Visual Direction

This should be the first code/UI step of Phase 3. It should move the current app shell, login and dashboard closer to the approved mockup while preserving existing auth, route protection, permissions, module filtering and RLS behaviour.

## Short Executive Summary

The secure platform foundation is complete. The next phase should make the HUB feel like the approved Clean Eats Hub mockup and create Products module screens with sample data so Tony and the team can review terminology, workflows and layout before real Clean Eats data and database tables are added.
