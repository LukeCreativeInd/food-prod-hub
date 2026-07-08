# Costings Module UI Skeleton

## Status

Step 045 has created the Costings module UI skeleton using safe sample data only.

No database migrations, Supabase changes, RLS changes, route guard changes, permission changes, real costing queries, real Clean Eats imports or real costing calculations were added.

## Pages Added or Updated

- `/costing-overview`: Costings overview/module dashboard.
- `/meal-margins`: Meal margin review skeleton.
- `/price-history`: Price history skeleton.

## Sample Data Included

The skeleton uses placeholder rows and counts for:

- ingredient cost readiness
- packaging cost readiness
- component costing status
- meals needing margin review
- missing ingredient costs
- packaging cost review prompts
- component yield prompts
- meal margin examples
- sample price movements for ingredients, packaging, components and finished products

Static example items include Chicken Thigh, Basmati Rice, Meal Sleeve, Napoli Sauce, Chicken Fajita Bowl, Naked Chicken Parma, Spaghetti Bolognese, Burrito Bowl and Shepherd's Pie.

These records and numbers are for screen review only. They are not imported Clean Eats costing data.

## Terminology and Fields for Staff Review

Tony/team should review:

- whether `Costings` is the right module label
- what target margin language should be used
- which missing inputs should block meal costing review
- whether price changes should be tracked by effective date, invoice date or supplier update date
- which users should approve new costs
- whether component yield should be required before meal costing
- how packaging costs should appear in meal margins

## Intentionally Not Connected Yet

- No costing tables were created.
- No real Supabase costing queries were added.
- No real Clean Eats cost data was imported.
- No live margin calculations exist yet.
- No ingredient, packaging, component, recipe or finished product costing logic was added.
- No write/edit/approval flow was added.
- No costing RLS policies were added.

## Shared UI Patterns Added

Small presentational Costings skeleton helper:

- `components/costings/costings-workspace-page.tsx`

The Costings pages also reuse the existing sample table pattern from the Products skeleton for consistent demo styling.

## Auth, Routing and Security

Existing behaviour is preserved:

- Costings pages are still protected through the existing app access flow.
- Sidebar module filtering remains enabled-module-aware.
- Permission rules were not changed.
- Route protection was not changed.
- RLS behaviour was not changed.

## Next Step

Recommended next step:

**046 - Production Module UI Skeleton**

The Production skeleton should use sample data only and preview production overview, areas, tasks and tablet/iPad task concepts before any production task engine or live data is created.

## 045 Follow-Up: Expanded Costings Sub-Pages

The Costings module has been expanded for staff demo review with three additional sample/demo screens:

- `/ingredient-costs`
- `/packaging-costs`
- `/component-costs`

The Costings sidebar now shows:

- Ingredient Costs
- Packaging Costs
- Component Costs
- Meal Margins
- Price History

The parent Costings row remains the overview link at `/costing-overview`; `Costing Overview` is not duplicated as a child link.

These screens are sample/demo screens only. They do not include real calculations, real Clean Eats cost data, live Supabase queries, database tables, migrations or RLS changes.

The goal is to help staff review how costs may flow from ingredients and packaging through components and finished meals before database modelling begins.
