# Tenant Page Heading Cleanup

Task 149 cleans up repeated tenant page headings after the app header/title refactor.

## Why This Exists

The tenant app now shows the current page title in the persistent top app header through `AppHeaderTitle` and `lib/page-title.ts`.

Some tenant pages still repeated the same title inside the content area using the older `PageHeader` hero or compact header pattern. That made pages feel top-heavy and duplicated labels such as Dashboard, Products, Inventory, Production, Suppliers, Modules and Supplier Invoice Intake.

## Cleanup Rule

Tenant workspace pages should use:

- the top app header as the single main page title
- content sections for useful status, summaries, tables, forms and actions
- compact section headings where they describe a specific part of the page

Tenant workspace pages should avoid:

- repeating the same page title as a large content hero
- repeating the same page title as a badge-only intro strip
- using `PageHeader` for generic module/list page titles after the app header already shows the title

## Pages Audited

The cleanup audited the main tenant workspace families:

- Dashboard
- Products
- Suppliers
- Ingredients and Packaging via the internal items workspace
- Components
- Finished Products
- Costings overview
- Production overview
- Production placeholder/workspace pages
- Facility/iPad View
- Inventory overview
- Stock Locations
- Inventory placeholder/workspace pages
- BOM / Traceability
- Supplier Invoice Intake list and review pages
- Admin placeholder pages for Users, Modules and Integrations
- Generic placeholder module pages

## Entity Detail Exceptions

Entity detail pages can still show the entity name inside the content area when it is more specific than the generic app header title.

Examples:

- top header: Component Detail; content entity name: a specific component formula
- top header: Supplier Detail; content entity name: a specific supplier
- top header: Internal Item Detail; content entity name: a specific internal item
- top header: Stock Location Detail; content entity name: a specific stock location
- top header: Finished Product Detail; content entity name: a specific finished product

This is intentional because the entity name is useful record context, not a duplicate module heading.

## What Changed

The duplicated `PageHeader` usage was removed from broad tenant workspace pages and shared placeholder/workspace wrappers. Page content now starts with summary cards, status badges, tables, forms or section cards.

Shared wrappers now keep accessibility context with `aria-label` where the removed title/description were still useful for page semantics.

## What Did Not Change

This task does not change:

- database schema or migrations
- RLS policies
- auth or permissions
- route protection
- tenant redirects
- Platform Admin
- sidebar navigation order
- Supplier Invoice Intake parser, extraction or commit behaviour
- Costings or Formula Builder business logic
- write/edit/delete actions

## Future Guidance

When adding new tenant pages, add the route title to `lib/page-title.ts` and let the app shell show it. Use content section headings for actual page sections only.
