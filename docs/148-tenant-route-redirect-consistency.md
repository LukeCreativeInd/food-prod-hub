# Tenant Route Redirect Consistency

Task 148 adds tiny redirect pages so natural nested tenant workspace URLs land on the existing active top-level workspace routes.

This task does not move canonical pages, change sidebar links, add middleware, activate tenant subdomain routing, change auth guards, change database schema, change RLS, change permissions, change Platform Admin, change Supplier Invoice Intake logic, change Costings logic or change Formula Builder logic.

## Problem

Some natural nested tenant app routes could previously load blank or invalid pages.

Examples:

- `/production/production-report`
- `/products/suppliers`
- `/inventory/goods-inwards`

Costings and Components already had redirects from previous tasks, so the tenant app route behaviour was inconsistent.

## Canonical Route Rule

Nested sidebar-style routes should redirect to the current active top-level workspace routes.

The app keeps current canonical pages for now:

- `/suppliers`
- `/ingredients`
- `/packaging`
- `/components`
- `/recipes`
- `/finished-products`
- `/ingredient-costs`
- `/packaging-costs`
- `/component-costs`
- `/meal-margins`
- `/price-history`
- `/production-report`
- `/production-plan`
- `/production-areas`
- `/production-tasks`
- `/facility-tasks`
- `/goods-inwards`
- `/batch-receiving`
- `/stock-locations`
- `/stock-movements`
- `/purchasing`
- `/bom-traceability`
- `/organisation-settings`
- `/users`
- `/modules`
- `/integrations`
- `/purchase-documents`

## Redirects Added

Products:

- `/products/suppliers` -> `/suppliers`
- `/products/ingredients` -> `/ingredients`
- `/products/packaging` -> `/packaging`
- `/products/recipes` -> `/recipes`
- `/products/finished-products` -> `/finished-products`

Existing product redirects preserved:

- `/products/components` -> `/components`
- `/products/components/[id]` -> `/components/[id]`

Production:

- `/production/production-report` -> `/production-report`
- `/production/production-plan` -> `/production-plan`
- `/production/production-areas` -> `/production-areas`
- `/production/production-tasks` -> `/production-tasks`
- `/production/facility-ipad-view` -> `/facility-tasks`

Compatibility alias:

- `/facility-ipad-view` -> `/facility-tasks`

The current sidebar and page title registry use `/facility-tasks` as the active Facility/iPad route, so this task redirects to that existing page instead of introducing a new canonical page.

Inventory:

- `/inventory/goods-inwards` -> `/goods-inwards`
- `/inventory/batch-receiving` -> `/batch-receiving`
- `/inventory/stock-locations` -> `/stock-locations`
- `/inventory/stock-movements` -> `/stock-movements`
- `/inventory/purchasing` -> `/purchasing`
- `/inventory/bom-traceability` -> `/bom-traceability`

Admin:

- `/admin/organisation-settings` -> `/organisation-settings`
- `/admin/users` -> `/users`
- `/admin/modules` -> `/modules`
- `/admin/integrations` -> `/integrations`

Tools:

- `/tools/purchase-documents` -> `/purchase-documents`
- `/tools/supplier-invoice-intake` -> `/purchase-documents`

Existing Costings redirects remain:

- `/costings/ingredient-costs` -> `/ingredient-costs`
- `/costings/packaging-costs` -> `/packaging-costs`
- `/costings/component-costs` -> `/component-costs`
- `/costings/meal-margins` -> `/meal-margins`
- `/costings/price-history` -> `/price-history`

## Why Redirects

Redirects keep the app behaviour predictable without duplicating page implementations.

They also avoid changing:

- canonical page locations
- sidebar navigation order
- route guards
- module enablement logic
- business logic

## Future Follow-Up

Add a branded tenant Not Found page for genuinely invalid tenant routes.

That should remain separate from this redirect consistency task.

## Task 170 Update

Task 170 adds `/costings/sell-prices` as a small redirect to the canonical `/sell-prices` route.
