# Global Visual Direction Polish

## Status

Step 041 has implemented the first global visual polish pass for the Clean Eats Hub app.

This was a UI-only change. No database migrations, Supabase changes, RLS changes, auth rule changes, permission rule changes, module filtering changes or business data queries were added.

## What Was Visually Updated

- Protected app shell now has a top header above page content.
- Top header includes a search placeholder, notification button placeholder and account/action area.
- Sidebar now has stronger Clean Eats Hub branding, icons for major navigation groups and softer active/hover states.
- Sidebar includes a visual collapse affordance without adding risky collapse behaviour.
- Login page has a cleaner standalone card, brand treatment and green foundation note.
- Dashboard now uses four top metric cards, operational alert cards, quick module shortcuts and a sample operations table.
- Shared cards, stat cards, module cards, alerts and empty states now use softer borders, cleaner spacing and lighter card treatment.
- Generic module placeholder pages now feel more like module overview dashboards with sample summary cards, coming-next cards and review prompt tables.

## Alignment With Approved Mockup

The pass moves the app closer to the approved Clean Eats Hub mockup by introducing:

- Clean Eats/client branding in the sidebar and login page
- modern SaaS operations layout
- light content background
- left sidebar with grouped module navigation and icons
- top header with search placeholder
- notification placeholder
- user/account action area
- clean dashboard cards with compact status badges
- quick action/module cards
- soft table/card styling
- dashboard and placeholder-page patterns that can be reused by future modules

This is not intended to be a pixel-perfect copy. It is the first practical implementation pass toward the approved direction.

## Auth and Security Behaviours Preserved

The visual pass intentionally preserved the existing foundation:

- `/login` remains standalone and public.
- Signed-in users visiting `/login` still redirect to `/dashboard`.
- Logout still uses Supabase Auth sign out and redirects to `/login`.
- Protected app pages still use the existing route guards.
- Membership-aware access remains unchanged.
- Admin permission checks remain unchanged.
- Sidebar visibility remains permission-aware.
- Module navigation remains enabled-module-aware.
- Auth Context status remains on the dashboard for development/admin verification.
- No RLS policies or database tables were changed.

## Placeholder and Sample Data

The dashboard and module overview cards still use placeholder/sample data only.

No real production, costing, inventory, QA, logistics, products, ingredients, meals, supplier or packaging data is queried or connected yet.

The sample content exists to validate layout, terminology and review flow before real Clean Eats data or product tables are added.

## Intentionally Not Built Yet

- No Products module skeleton yet.
- No product, ingredient, supplier, packaging, component or meal tables.
- No real Clean Eats data import.
- No production, inventory, QA or costing workflow logic.
- No write policies.
- No new auth flows such as invite or password reset.
- No real notification system.
- No functional sidebar collapse yet.
- No global platform admin or billing features.

## Next Step

The recommended next step is:

**042 - Products Module UI Skeleton**

That step should create Products overview, Ingredients, Suppliers, Packaging, Components and Meals screens using safe sample data only. Real database tables should wait until Tony and the team have reviewed the screens, terminology and required fields.

## 041 Follow-Up: Mockup Alignment Refinements

A follow-up refinement pass moved the shell/sidebar closer to the approved Clean Eats Hub mockup.

Updates:

- Replaced the dark green sidebar with a light white/grey sidebar.
- Strengthened top-left Clean Eats Hub branding with a green mark and clearer hierarchy.
- Changed Dashboard into a single top-level clickable sidebar item.
- Changed Products, Costings, Operations, Business and Admin into clickable top-level module rows.
- Added expandable/collapsible nested module sections so submenu links are hidden by default.
- Kept the current active section expanded automatically.
- Moved sign out out of the sidebar footer and into the top-right account area.
- Cleaned up the sidebar collapse affordance so it is a subtle row rather than a boxed button.
- Increased sidebar item sizing and spacing for a closer match to the approved mockup.

Auth and security behaviour remains unchanged:

- `/login` remains standalone and public.
- Existing route protection remains unchanged.
- Membership-aware access remains unchanged.
- Admin permission guards remain unchanged.
- Sidebar permission filtering remains unchanged.
- Enabled-module filtering remains unchanged.
- No RLS, database, Supabase or business-query changes were made.

## 041 Follow-Up: Operational Navigation Structure

A second 041 follow-up refined the sidebar module structure to better match Clean Eats operations while keeping the same reusable platform navigation model.

Updates:

- Renamed `Operations` to `Production`.
- Limited `Production` to production workflows only:
  - Production Overview
  - Production Areas
  - Production Tasks
- Added `Inventory` as its own major module.
- Moved `Goods Inwards` and `Purchasing` under `Inventory`.
- Added `QA` as its own major module.
- Added `Logistics` as its own major module.
- Removed the `Business` grouping from the sidebar.
- Removed `Wholesale` from sidebar visibility for now because wholesale workflows will feed into CRM later.
- Added `CRM` as its own major module.
- Added `Reports` as its own major module.
- Ensured all top-level sidebar items have icons.

This structure better matches Clean Eats operational responsibilities while staying reusable for future tenants. Route files were not deleted, no broken links were added and the existing permission-aware and enabled-module-aware filtering remains in place.

## 041 Follow-Up: Final Operational Navigation Structure

A final 041 navigation cleanup removed duplicate overview child links. Parent module rows now act as overview links, and nested items only represent sub-pages.

Final sidebar structure:

- Dashboard
- Products
  - Ingredients
  - Components
  - Meals
  - Packaging
  - Suppliers
- Costings
  - Meal Margins
  - Price History
- Production
  - Production Areas
  - Production Tasks
- Inventory
  - Goods Inwards
  - Purchasing
- QA
  - Checks
  - Sign-offs
  - Incidents
- Logistics
- CRM
- Reports
- Admin
  - Organisation Settings
  - Users
  - Modules
  - Integrations

Notes:

- Dashboard remains a single top-level link.
- `Operations` remains renamed to `Production`.
- `Inventory` remains its own major module.
- `Goods Inwards` and `Purchasing` remain under `Inventory`.
- `QA` is now its own major module with placeholder nested routes for Checks, Sign-offs and Incidents.
- `Logistics`, `CRM` and `Reports` are standalone major modules for now.
- The `Business` grouping remains removed.
- `Wholesale` remains hidden from the sidebar for now because wholesale workflows will feed into CRM later.
- All major sidebar items have icons.
- A later step should review module registration/routes so each major module has a clean overview page.

The new QA nested pages use the existing placeholder page pattern only. They do not add QA business logic, database queries, tables, migrations or RLS changes.

## Products Skeleton Uses Polished UI Direction

Step 042 now applies the polished global visual direction to the Products module skeleton. The Products overview, Ingredients, Components, Meals, Packaging and Suppliers pages use the light shell, sidebar, cards, summary metrics and table patterns established in step 041.

The Products skeleton remains sample-data-only and does not add real product queries, database tables, migrations or business logic.
