# Codex Project Context

## Current Naming

EveryBatch is the real product/platform brand.

Food Prod Hub is the internal repo/project name only. Do not introduce new user-facing "Food Prod Hub" wording unless the task explicitly asks for internal documentation.

Clean Eats Hub is Tenant 1/customer workspace powered by EveryBatch.

Food Operations Hub is older/internal concept language only.

## Brand And Domain Context

Primary purchased domain:

```text
everybatchmrp.com
```

Additional purchased domains:

```text
everybatchmrp.com.au
everybatch.com.au
```

Deferred/not purchased:

```text
everybatch.io
everybatchmrp.app
```

Do not plan around `everybatch.com`; it is not available.

Target domains:

- `everybatchmrp.com` for public marketing
- `app.everybatchmrp.com` for central login
- `cleaneats.everybatchmrp.com` for Clean Eats tenant workspace
- `admin.everybatchmrp.com` for future Platform Admin
- `support.everybatchmrp.com` for support and knowledge base

Current domain setup:

- `app.everybatchmrp.com` is live and validated in Vercel
- Cloudflare DNS is active with `CNAME app -> b560eb64065fe2f1.vercel-dns-017.com`
- Cloudflare proxy remains DNS only
- the Vercel production URL currently redirects to `app.everybatchmrp.com`, but remains available in Vercel if needed
- login and dashboard smoke tests passed on `app.everybatchmrp.com`
- do not point `everybatchmrp.com` root to the tenant app; reserve it for marketing or a coming-soon page
- do not connect `cleaneats.everybatchmrp.com` until tenant workspace host routing is implemented
- do not connect `admin.everybatchmrp.com` until Platform Admin domain routing is explicitly implemented
- do not connect `support.everybatchmrp.com` until the support/knowledge-base target exists
- do not change Vercel, DNS, Supabase Auth redirect URLs or env vars from a code task without explicit user instruction

Task 123 domain connection is complete. `app.everybatchmrp.com` is the first stable EveryBatch app/login URL.

Tenant subdomain routing target:

- `app.everybatchmrp.com` is the central login / tenant selector.
- `{tenant_slug}.everybatchmrp.com` is the tenant workspace pattern.
- `cleaneats.everybatchmrp.com` is the target Clean Eats workspace.
- `admin.everybatchmrp.com` is the preferred Platform Admin target.
- `platform.everybatchmrp.com` remains earlier optional Platform Admin planning language only.
- `support.everybatchmrp.com` is support/help.

Do not implement host-based tenant routing casually. Follow the task 116 routing plan first.

Never trust client-provided `organisation_id`.

Host-derived tenant slug must be verified server-side against `organisations.slug`.

Tenant resolver foundation helpers live in:

```text
lib/tenant-resolver.ts
```

They parse EveryBatch hostnames and provide a server tenant lookup helper, but they are not wired into routing, middleware, auth redirects or app shell context yet.

Task 154 strengthens the domain/app-mode foundation. `lib/tenant-resolver.ts` now maps marketing, central app, preferred Platform Admin, tenant app, support, local development, Vercel preview and unknown hosts. `lib/app-mode-routing.ts` adds pure route-intent/default-route helpers. These helpers are passive only: no middleware, production redirects, DNS/Vercel changes, Supabase Auth settings, tenant subdomain activation or route moves are included.

Central login target:

- `app.everybatchmrp.com/login` should become the EveryBatch-branded central login.
- Multi-tenant users should eventually choose a workspace through a tenant selector.
- One-tenant users can be redirected directly to their workspace after active membership is validated.
- Tenant selection must validate active membership server-side.
- Do not trust client-submitted tenant ids, tenant slugs or arbitrary `organisation_id` values.
- Do not allow arbitrary `returnTo` or open redirects; allow only reviewed relative paths or approved EveryBatch domains.
- `platform_admin` users should see a Platform Admin option.
- Tenant-specific login branding, such as `cleaneats.everybatchmrp.com/login`, comes later.

Workspace option helper foundation lives in:

```text
lib/workspace-options.ts
```

It prepares active workspace options, platform-admin detection, default destination guidance and server-side workspace selection validation. Login now uses these destination rules, but the helper is not wired into middleware, tenant subdomain routing or the app shell.

Tenant selector UI foundation lives at:

```text
/select-workspace
```

It is an EveryBatch-branded central app/login-flow route outside the tenant AppShell/sidebar. It uses the workspace options helper and validates selected workspaces server-side before redirecting to the current transitional destination. Login now uses workspace destination rules, but tenant subdomain redirects remain inactive.

Login redirect behaviour:

- `/login` now uses the workspace options helper after successful sign-in.
- Already-signed-in visits to `/login` use the same destination logic.
- Allowed transitional destinations are `/dashboard`, `/select-workspace`, `/platform` and `/no-access`.
- Tenant subdomain redirects remain inactive.
- Authenticated tenant app users switch workspaces from the sidebar account menu. The menu shows tenant workspace options inline and shows Platform Admin when the signed-in user has platform access. `/select-workspace` remains available for first-login and central gateway flows, but it is not repeated as a separate row inside the sidebar account menu.
- Supabase Auth cookies are configured through `lib/supabase/cookie-options.ts`. On known production EveryBatch app/admin/tenant subdomains, auth cookies use `.everybatchmrp.com` so sessions can travel between `app.everybatchmrp.com`, `cleaneats.everybatchmrp.com` and `admin.everybatchmrp.com`. Localhost, local/private hosts, Vercel preview hosts, marketing root and support hosts keep default host-only cookie behaviour. Users may need to sign in again once after this cookie-domain change deploys.

Use the multi-tenant smoke test checklist before and after major domain, login, selector, Platform Admin, permission/RLS, feature flag, deployment, migration or tenant onboarding changes:

```text
docs/130-multi-tenant-smoke-test-checklist.md
```

## Architecture Guardrails

Keep the architecture multi-tenant, tenant-safe and RLS-safe.

One codebase should serve multiple tenants. Avoid client-specific forks.

Tenant data should remain isolated through:

- `organisation_id`
- memberships
- roles
- permissions
- enabled modules
- RLS policies

Tenant-specific behaviour should generally be controlled through configuration, module enablement, feature flags or reviewed migrations.

Feature flags now have a drafted database-backed foundation in migration 028. They are rollout/readiness controls only and must not replace modules, permissions, memberships or RLS.

Do not rename the repo, routes, folders or code identifiers casually just because the product brand is now EveryBatch.

Keep tenant-specific code config/feature-flag driven where possible.

Do not hardcode Clean Eats behaviour unless the task explicitly scopes it as Tenant 1 seed data, demo data or a temporary adapter, and document that choice.

Do not create cross-tenant data access. Use current organisation context, `organisation_id`, memberships, permissions, enabled modules and RLS.

Every tenant-owned table needs `organisation_id` and RLS unless a task explicitly documents why the table is global/reference data.

Do not add a module or major workspace without considering:

- `modules`
- `organisation_modules`
- user permissions
- route guards
- navigation visibility
- RLS for any tenant-owned data

Storage policies may require manual Supabase UI setup when SQL ownership or `storage.objects` policy management is constrained. Document exact manual policy expressions whenever this happens.

## Current Tenant Relationship

EveryBatch is the platform.

Clean Eats Hub is the first customer workspace.

Inside tenant workspaces, EveryBatch is now the primary product brand at the top of the sidebar, while tenant identity remains visible below it. Do not reintroduce the old bottom-left `Powered by EveryBatch` footer unless a later task explicitly changes the brand hierarchy. Current EveryBatch and tenant sidebar marks are temporary fallbacks until dedicated platform logo/icon and tenant logo/icon asset support is planned.

Brand asset planning is documented in:

```text
docs/166-brand-asset-logo-icon-storage-plan.md
```

The recommended direction is static reviewed EveryBatch logo/icon assets first, with tenant logo/icon assets extending the existing private `organisation-branding` bucket. Future dynamic platform asset management should be planned separately before adding schema or upload UI.

Task 167 replaces the temporary `app/icon.svg` fallback with the real EveryBatch PNG icon asset at `app/icon.png` and `app/apple-icon.png`, generated from `assets/brand/everybatch-icon.png`. Browser title formatting uses `Page Title - EveryBatch`.

## Task 168 Brand Asset Schema Foundation

Task 168 drafts migration `031_brand_asset_schema_foundation.sql` for future EveryBatch and tenant brand assets. It extends `organisation_branding` with clearer full-logo and icon storage fields while preserving `logo_url`, creates `platform_branding_assets` for platform asset metadata, and extends the existing private `organisation-branding` storage helper to support tenant-scoped logo, icon, login and email asset paths.

Migration 031 intentionally does not drop or create policies on `storage.objects`. Existing organisation-branding storage policies remain managed through Supabase Storage and should continue calling `public.can_access_organisation_branding_storage_path()`.

This is schema/storage foundation only. The migration is not applied by Codex. No upload UI, image processing, sidebar replacement, auth/RLS permission changes beyond the drafted table/storage policies, DNS/Vercel changes or business logic changes are included.

## Task 169 Tenant / Platform Logo + Icon Upload UI

Task 169 adds tenant full-logo and icon upload controls to Organisation Settings. Uploads use the existing private `organisation-branding` bucket with tenant-scoped paths under `{organisation_id}/logo/full-...` and `{organisation_id}/logo/icon-...`. The action requires `admin.organisation.manage`, validates PNG/JPG/WebP up to 5MB, stores private storage paths in `organisation_branding`, and does not use service-role keys.

The tenant sidebar now uses the full tenant logo in expanded mode and the tenant icon in collapsed mode, with name/initials fallbacks. `/platform/branding` is added as a conservative Platform Admin scaffold for `platform_branding_assets` metadata only; platform dynamic upload remains deferred.

## Task 170 Sell Price Management UI

Task 170 adds `/sell-prices` as the first tenant sell price management page for finished products. It uses the task 153 `finished_product_sell_prices` schema, requires `sell_prices.view` to read and `sell_prices.manage` to create/update/archive, and keeps mutations tenant-scoped through the current auth context.

Sell price actions validate finished product ownership/type, channel, currency, tax mode, source, dates and non-negative amounts. Archive is soft only. Duplicate active open-ended prices are blocked per finished product/channel, while draft prices can coexist as review candidates. Meal Margins only treats active, non-archived, open-ended sell prices as readiness inputs and still does not calculate final margins.

## Task 171 Meal Margins Real Calculation

Task 171 updates `/meal-margins` to show conservative read-only gross margin previews. It uses active finished product formulas, safe formula input costs, active current sell prices, AUD currency and known tax modes only.

Margin formulas are `gross_profit_amount = sell_price_amount - product_cost`, `gross_margin_percent = gross_profit_amount / sell_price_amount * 100` and `markup_percent = gross_profit_amount / product_cost * 100` when product cost is greater than zero. Draft or archived sell prices, unknown tax modes, missing formulas, missing input prices, component formula blockers and unit mismatches block calculation instead of producing fake margins.

No GST engine, tax normalisation, margin snapshots, Shopify sync, discount logic, subscription pricing, wholesale quoting, approval workflows, migrations or write actions are added.

## Task 186 Products Data Model QA Pass

Task 186 documents the current Products and Costings data model before deeper inventory and production work. Canonical tenant catalogue records are `internal_items`: ingredients and packaging use `item_type = ingredient` and `item_type = packaging`, components use `item_type = component`, and finished products use `item_type = finished_product`.

Supplier-facing records remain separate in `suppliers`, `supplier_aliases`, `supplier_items`, `supplier_item_mappings`, `purchase_documents`, `purchase_document_lines`, `price_observations` and `approved_supplier_prices`. Formulas use `formula_versions.output_internal_item_id` for outputs and `formula_lines.input_internal_item_id` for inputs. Sell prices live in `finished_product_sell_prices`, and Meal Margins only uses active, non-archived current sell prices.

Recipes are not a separate live table yet. `/recipes` is a scaffold/signpost to Components and Finished Products rather than fake saved recipe rows. Help/support page context now maps component, recipe, finished product, sell price and meal margin routes more specifically.

See:

```text
docs/186-products-data-model-qa-pass.md
```

## Task 187 Finished Product Data Entry Polish

Task 187 improves `/finished-products` and `/finished-products/[id]` so Finished Products read as real data-entry and review areas. The list now shows real data-backed formula, cost, sell price and margin readiness. The detail page shows core finished-product fields, setup readiness cards, safe support-ticket context, and links to formula management, Sell Prices, Meal Margins and Component Costs.

This task does not change formula calculations, Meal Margins calculations, Sell Price business rules, RLS, permissions, migrations, Supplier Invoice Intake, inventory, production, QA, auth/domain routing or Platform Admin logic. Production readiness remains future-only.

See:

```text
docs/187-finished-product-data-entry-polish.md
```

## Task 188 Component Formula Builder Polish

Task 188 improves `/components` and `/components/[id]` so Components read as prepared/intermediate batch outputs rather than generic formula rows. The list now uses component-first columns and clearer empty/create wording. The detail page shows component fields, readiness cards, safe support-ticket context, cost blocker links, formula-line helper text and future-only production/where-used messaging.

This task does not change formula calculations, Meal Margins calculations, Sell Price business rules, RLS, permissions, migrations, Supplier Invoice Intake, inventory, production, QA, auth/domain routing or Platform Admin logic. Component Costs support context now uses `moduleKey = component_costs`.

See:

```text
docs/188-component-formula-builder-polish.md
```

## Task 189 Finished Product Formula Builder Polish

Task 189 improves `/finished-products/[id]` so finished product formulas read as sellable meal/SKU setup rather than generic formula rows. The detail page now has clearer formula input language, grouped component/ingredient/packaging selectors, visible line cost hints, editable loss notes and direct links to Components, Component Costs, Ingredient Costs, Packaging Costs, Sell Prices and Meal Margins.

This task does not change formula calculations, Meal Margins calculations, Sell Price business rules, RLS, permissions, migrations, Supplier Invoice Intake, inventory, production, QA, auth/domain routing or Platform Admin logic. Support guide copy now better distinguishes component formulas from finished product formulas.

See:

```text
docs/189-finished-product-formula-builder-polish.md
```

## Task 190 Costing Snapshot Plan

Task 190 plans the future costing snapshot system before schema/UI work. The recommended v1 approach is a generic `costing_snapshots` header table with `snapshot_type` values for component cost, finished product cost and finished product margin, plus `costing_snapshot_lines` to copy formula input lines, price sources, supplier names, unit costs, line totals and blockers at the time of snapshot.

Snapshots should preserve live formula/price/sell price assumptions at a point in time so historical reporting does not move when approved supplier prices, formulas or sell prices change later. This task is docs-only and does not create migrations, permissions, RLS policies, UI, actions or calculation changes.

See:

```text
docs/190-costing-snapshot-plan.md
```

## Task 191 Costing Snapshot Schema Foundation

Task 191 drafts migration `034_costing_snapshot_schema_foundation.sql` for tenant-scoped locked costing snapshots. It creates `costing_snapshots` and `costing_snapshot_lines`, seeds `costing_snapshots.view`, `costing_snapshots.create` and `costing_snapshots.manage`, enables RLS and adds view/create/manage policies with platform-admin overrides.

Codex did not apply the migration; it was manually applied in Supabase before task 192. No snapshot UI, creation actions, reports, production links, formula calculation changes, Meal Margins calculation changes, Sell Prices business rule changes, Supplier Invoice Intake changes, auth/domain changes, Platform Admin logic changes or sample snapshot data were included in task 191.

See:

```text
docs/191-costing-snapshot-schema-foundation.md
```

## Task 192 Costing Snapshot UI v1

Task 192 adds the first controlled UI and server actions for costing snapshots after migration 034 was manually applied in Supabase. Components can create manual component cost snapshots, finished products can create manual cost or margin snapshots, both detail pages show recent snapshot history, and `/costing-snapshots/[id]` shows locked header/line values with blocked reasons.

Snapshot creation uses the authenticated Supabase server client and existing RLS/permissions: `costing_snapshots.view`, `costing_snapshots.create` and `costing_snapshots.manage`. Cost readiness and snapshots now normalise common unit labels and support safe metric kg/g and l/ml conversion. Unknown pack units such as bunch, box, carton, tray and bottle still block until a future UOM Conversion Foundation defines tenant/supplier-item-specific conversion rules.

No service-role key, schema migration, formula calculation schema change, Sell Prices rule change, Supplier Invoice Intake change, Production/Inventory logic or Platform Admin logic is added. Meal Margins remains a live preview and points users to finished product detail pages for locked snapshots.

See:

```text
docs/192-costing-snapshot-ui-v1.md
```

## Task 193 Inventory Receiving Workflow Plan

Task 193 plans the future real Goods Inwards / Inventory Receiving workflow before schema or UI work. The plan separates Supplier Invoice Intake/price approval from physical receiving, recommends receipt headers, receipt lines, inventory lots and stock movements for task 194, and defines a conservative Goods Inwards UI direction for task 195.

The plan recommends preserving physical receipt data even when pack-unit conversion is unknown, while preventing unknown pack units from becoming production-ready stock until UOM Conversion Foundation rules exist. It documents QA hold/release, traceability, Supplier Invoice Intake integration, permissions/RLS, Admin/Support impact and placeholder inventory copy to replace later.

No migrations, tables, receiving UI, stock movements, stock balances, Supplier Invoice Intake changes, costing snapshot changes, formula changes, Production/QA/Logistics changes, auth/domain changes, RLS changes, permission changes or packages are added.

See:

```text
docs/193-inventory-receiving-workflow-plan.md
```

## Task 194 Inventory Stock Movement Schema Foundation

Task 194 drafts migration `035_inventory_stock_movement_schema_foundation.sql` for the future Goods Inwards and inventory ledger foundation. It creates tenant-scoped `inventory_receipts`, `inventory_receipt_lines`, `inventory_lots` and `stock_movements`, seeds receipt/lot/movement permissions, grants conservative role permissions and enables RLS with no DELETE policies.

The schema preserves Supplier Invoice Intake as a separate invoice/price workflow. Receipt records may reference suppliers and purchase documents, but no stock movements are created from invoices automatically. `purchase_order_id` is intentionally omitted because `purchase_orders` does not exist yet. Future purchase order work can add a tenant-scoped reference.

Task 194 also adds `lib/inventory-movement-types.ts` for future receiving UI constants and labels. No receiving UI, posting actions, stock-on-hand summaries, purchase orders, QA workflows, production consumption, Supplier Invoice Intake changes, costing changes, auth/domain routing changes, service-role flows, sample data or migration application are included.

See:

```text
docs/194-inventory-stock-movement-schema-foundation.md
```

## Task 172 Support Domain And Auth-Gated Help Centre Plan

Task 172 plans future `support.everybatchmrp.com` as an authenticated EveryBatch Help Centre. It should serve user-facing module guides, workflow walkthroughs, troubleshooting, release notes and future tenant-scoped support tickets.

Support should use its own `support` app mode, require signed-in EveryBatch users, avoid exposing raw internal Codex task docs, and eventually respect tenant memberships, enabled modules/features and support roles. Platform admins/support staff should manage tickets through future Platform Admin support workflows; tenant users should use the support domain as the customer-facing help surface.

No support routes, support UI, middleware/domain routing, DNS/Vercel/Supabase settings, auth changes, schema, migrations, RLS, permissions, ticket tables, support storage or packages are added.

## Task 173 Support Domain Setup

Task 173 documents the real-world setup checklist for `support.everybatchmrp.com`: Vercel domain add, Cloudflare DNS, Supabase Auth redirect URL review, expected interim behaviour before support routes exist, post-scaffold smoke tests and rollback notes.

This task still does not build support routes, support UI, support tickets, support middleware enforcement, schema, migrations, RLS, permissions, DNS/Vercel/Supabase settings through code or packages. The support domain should not be described as a live Help Centre until task 174 or later creates an authenticated support scaffold.

Platform/admin surfaces should use EveryBatch branding.

EveryBatch brand constants live in:

```text
lib/platform-brand.ts
```

Use these constants for user-facing platform copy where appropriate. Do not make routing/domain decisions depend on them until tenant subdomain routing is explicitly implemented.

The first Help & Support menu links to future `support.everybatchmrp.com` paths through static constants only. It is not a support backend, ticketing system, route-specific guide engine or support impersonation flow.

Platform Admin should eventually live at:

```text
admin.everybatchmrp.com
```

Earlier `platform.everybatchmrp.com` references are legacy/optional planning language unless a later task deliberately retains that host.

Platform should not be treated as a normal tenant module long-term.

Avoid building platform-owner functionality into tenant UI unless a task explicitly says it is a temporary bridge.

Platform Admin should become the EveryBatch operator console. It should eventually manage tenants, tenant modules, tenant feature flags, support, billing, updates/release metadata, platform branding, platform users, support access sessions and system health.

Code updates remain outside Platform Admin through Codex, Git, Vercel deployment and reviewed Supabase SQL migration workflows.

Future support tickets from `support.everybatchmrp.com` or app Help menu should flow into Platform Admin Support Inbox.

Avoid building tenant operational features inside Platform Admin unless they are clearly oversight, provisioning or support workflows.

Tenant apps should be tenant-branded. Platform Admin should be EveryBatch-branded.

Platform Shell Separation v1 is implemented at:

```text
/platform
```

`/platform` and `/platform/tenants/cleaneats` now render inside a dedicated EveryBatch Platform shell instead of the tenant AppShell/sidebar. The future `admin.everybatchmrp.com` domain remains inactive until a reviewed routing/domain task connects it.

Platform Tenant Overview v1 now reads real platform metadata where available:

- organisations
- organisation settings
- organisation branding
- organisation modules
- feature flag overrides
- active membership counts

This overview remains read-only and does not fetch tenant operational data, create tenant management actions or change RLS.

Platform Tenant Module / Feature Flag Overview now adds read-only Clean Eats routes:

```text
/platform/tenants/cleaneats/modules
/platform/tenants/cleaneats/features
```

These pages inspect global module/feature registries and Clean Eats tenant state only. They do not provide enable/disable, toggle, provisioning or billing actions.

Platform Admin has been removed from the tenant workspace sidebar. It remains accessible through `/select-workspace` for platform admins and by direct guarded `/platform` access. Do not re-add Platform Admin as a tenant navigation module unless a future task explicitly reverses this decision.

Tenant Provisioning Plan is documented in:

```text
docs/136-tenant-provisioning-plan.md
```

Tenant provisioning must be platform-admin-only. New tenants must receive organisation, settings, branding, modules and feature flags safely. Platform must not be enabled as a tenant module. Provisioning should be previewed and auditable. Never create plaintext passwords in Platform Admin. Do not use destructive tenant data deletion as automatic rollback. Tenant-specific seeds must target an explicit slug/id.

Platform provisioning template foundation is documented in:

```text
docs/139-platform-provisioning-templates-foundation.md
```

Static provisioning definitions live in:

```text
lib/platform-provisioning-templates.ts
```

The read-only Platform Admin preview route is:

```text
/platform/tenants/provisioning
```

These templates cover tenant profiles, module packs, feature flag packs, default settings/branding and onboarding checklist categories. They are local configuration only. They do not call Supabase, create tenants, apply modules, invite users, configure domains or write checklist records.

New Tenant Wizard scaffold is documented in:

```text
docs/140-new-tenant-wizard-scaffold.md
```

The read-only wizard route is:

```text
/platform/tenants/new
```

It previews tenant identity, template/module pack, feature flag, settings/branding, first admin, onboarding checklist and review/provision steps. The provision button is disabled. Do not add tenant creation actions, Supabase writes, first-admin invites or domain provisioning unless a future task explicitly requests them.

Task 143 adds `/platform/tenants/onboarding` as a read-only Platform Admin checklist scaffold using the static onboarding template from task 139. It does not add checklist persistence, completion actions, invite actions, RLS changes or tenant app navigation changes.

Task 143 also adds `/platform/tenants` as the read-only All Tenants overview route. Platform Admin nav labels for Clean Eats module and feature pages are intentionally Clean Eats-specific until dynamic tenant module/feature pages exist.

Tenant Create Action v1 is documented in:

```text
docs/141-tenant-create-action-v1.md
```

`/platform/tenants/new` can now create foundation tenant records for platform admins after migration 029 is manually reviewed and applied. The action creates organisation, settings, branding, enabled modules and feature flag overrides only. It does not create auth users, profiles, memberships, first-admin invites, domains, billing/support records, onboarding records or operational starter data. Planned feature flags remain preview-only unless corresponding registry rows exist.

First tenant admin invite/membership planning is documented in:

```text
docs/142-first-tenant-admin-invite-membership-plan.md
```

Pure helper definitions live in:

```text
lib/platform-first-admin.ts
```

The read-only Platform Admin scaffold route is:

```text
/platform/tenants/first-admin
```

This scaffold does not create Auth users, profiles, memberships or invite emails. It blocks platform_admin and phase_1_demo_user as first tenant admin role choices in the pure validation helper.

Tenant sidebar accordion behaviour is documented in:

```text
docs/137-tenant-sidebar-accordion-behaviour-fix.md
```

Expandable tenant navigation should auto-expand only the active module on route changes. Manual expansion should behave as a single-open accordion. Platform Admin shell navigation is separate and should not be affected by tenant sidebar changes.

Platform Admin responsive layout is documented in:

```text
docs/138-platform-admin-responsive-layout-fix.md
```

Desktop Platform Admin keeps the left sidebar. Mobile/tablet Platform Admin should keep content near the top and expose Platform navigation through the compact `Platform menu` panel instead of rendering the full nav list above content.

Support access and impersonation must be explicit, scoped and auditable. Do not add invisible support impersonation.

## Task Discipline

Respect current task sequencing.

Do not add:

- database migrations unless specifically requested
- RLS changes unless specifically requested
- auth changes unless specifically requested
- route/domain changes unless specifically requested
- business logic beyond the requested scope
- Supplier Invoice Intake parser/commit changes unless specifically requested
- Platform Admin functionality unless specifically requested
- feature flag implementation unless specifically requested
- tenant subdomain routing unless specifically requested
- middleware or host-routing changes unless specifically requested
- user-facing Food Prod Hub wording

When a migration file is created or changed, final responses must include the full SQL migration contents.

## Check Fallback Reminder

Default requested checks are usually:

```text
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

If `pnpm` hangs or fails due package-manager shim/network verification, use local binaries:

```text
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
```

Do not repeatedly retry `pnpm` if the known shim issue appears.

## Task 144 Costings Subpages

Task 144 updates the Costings subpages to use real tenant-scoped data where available. Ingredient and Packaging Costs read internal items, supplier mappings and approved prices. Component Costs and Meal Margins read formula readiness data without inventing missing sell prices or broad costing rules. Price History reads real price observations and approved price context. No migrations or write actions are added.

Task 144 follow-up removes the duplicate Costings content hero/title so the app header is the only main page title. Legacy nested `/costings/*` subpage URLs redirect to the active top-level Costings subpage routes.

## Task 145 Formula Import Foundation

Task 145 creates a planning/static-helper foundation for component and finished product formula imports. It maps the Clean Eats staff workbook/CSV columns to `internal_items`, `formula_versions` and `formula_lines`, defines matching/validation/review stages and records that production methods/routes and production areas remain future schema work. No migrations, upload UI, parser actions, Supabase writes or Costings logic changes are added.

## Task 146 Component Formula Builder

Task 146 adds the first manual Component Formula Builder v1 on the existing `/components` and `/components/[id]` tenant routes, with `/products/components` compatibility redirects. It uses the current `internal_items`, `formula_versions`, `formula_lines` and `approved_supplier_prices` schema without a migration.

Reads require `formulas.view`. Create/edit/line actions require `formulas.manage`, derive `organisation_id` from the authenticated app context and respect current RLS. Line removal soft-archives `formula_lines.archived_at` because current formula RLS intentionally has no delete policy.

The builder does not add workbook import, finished product formula editing, production routes/methods, stock movements, unit conversion, sell price/margin logic, Supplier Invoice Intake changes or Platform Admin changes.

## Task 147 FCP/LCP Frontend Optimisation

Task 147 improves first paint and largest paint behaviour on `/dashboard`, `/organisation-settings`, `/suppliers` and `/platform` without changing schema, RLS, permissions, auth flow, middleware, tenant routing, Platform Admin provisioning, Supplier Invoice Intake logic or business rules.

The pass adds lightweight count-only summary helpers for Dashboard and Suppliers, streams lower-priority sections through server `Suspense` boundaries, defers Organisation Settings branding/logo form work behind a stable section fallback and separates the static Platform Admin hero from heavier tenant/platform metadata panels. Global search was inspected and left unchanged because it does not fetch until the user types.

## Task 148 Tenant Route Redirect Consistency

Task 148 adds tiny redirect pages for natural nested tenant URLs across Products, Production, Inventory, Admin and Tools so they land on the existing active top-level workspace routes. Costings and Components redirects from earlier tasks are preserved.

This is redirect-only. It does not move canonical pages, change tenant sidebar navigation, add middleware, activate tenant subdomain routing, change auth/permissions/RLS, change Platform Admin, change Supplier Invoice Intake logic, or change Costings/Formula Builder business logic. Facility/iPad compatibility aliases redirect to the existing `/facility-tasks` page because that is the current active route.

## Task 149 Tenant Page Heading Cleanup

Task 149 removes generic duplicated tenant page headings now that the persistent app header owns the main page title. Broad workspace pages start directly with summary cards, status badges, tables, forms or section cards instead of repeating titles such as Dashboard, Products, Inventory, Production, Suppliers, Modules or Supplier Invoice Intake in the content area.

Entity detail pages may still show the specific record name inside the content area when the app header uses a generic detail title such as Component Detail, Supplier Detail, Internal Item Detail, Stock Location Detail or Finished Product Detail. No routing, sidebar, auth, permissions, RLS, Platform Admin, Supplier Invoice Intake parser/commit, Costings or Formula Builder business logic changes are included.

## Task 150 Finished Product Formula Builder Plan

Task 150 plans the future Finished Product Formula Builder v1. It confirms the current `internal_items`, `formula_versions`, `formula_lines` and `approved_supplier_prices` foundation can support tenant-scoped finished product formulas without a migration.

Finished product formula outputs should use `internal_items.item_type = finished_product` and `formula_versions.formula_type = finished_product`. Lines should reference component, ingredient and packaging internal items through `formula_lines.input_internal_item_id`. Costing readiness remains conservative, and Meal Margins remain blocked until sell price storage and agreed margin rules exist. No write actions, forms, imports, migrations, Platform Admin changes, Supplier Invoice Intake changes or sidebar changes are included.

## Task 151 Finished Product Formula Builder

Task 151 adds the first manual Finished Product Formula Builder v1 on `/finished-products` and `/finished-products/[id]`. It uses the existing `internal_items`, `formula_versions`, `formula_lines` and `approved_supplier_prices` schema without a migration.

Reads require `formulas.view`. Create/edit/line actions require `formulas.manage`, derive `organisation_id` from authenticated app context and respect RLS. Lines can reference component, ingredient and packaging internal items. Finished product inputs, self references, archived items, unsupported item types and cross-tenant items are blocked. Line removal soft-archives `formula_lines.archived_at`.

Cost readiness is conservative: product estimated cost is shown only when all lines have safe cost sources and exact units, including active cost-ready component formulas for component inputs. Margin readiness remains pending because sell price storage and margin rules are not implemented. No import/upload, sell price management, margin engine, unit conversion engine, production tasks, iPad/facility workflow, QA checks, Supplier Invoice Intake changes or Platform Admin changes are included.

## Task 152 Sell Price Storage And Margin Readiness

Task 152 plans future sell price storage and margin readiness. It confirms current supplier pricing tables (`price_observations` and `approved_supplier_prices`) are cost-side only and should not store finished product sell prices.

Future sell prices should be tenant-scoped, channel-specific, currency-aware, tax-mode-aware and versioned/history-preserving. Meal Margins should combine finished product formula cost with sell price only when formula cost is ready, selected channel price is active/current, currency and tax basis are known and margin rules are agreed. No migrations, sell price actions, UI forms, Shopify sync, GST engine, margin engine, Platform Admin changes or tenant provisioning changes are included.

## Task 153 Sell Price Schema Foundation

Task 153 drafts migration `030_sell_price_schema_foundation.sql` for tenant-scoped `finished_product_sell_prices`, explicit `sell_prices.view` and `sell_prices.manage` permissions, conservative RLS policies and static TypeScript constants aligned with the database constraints.

The table stores finished product sell prices by channel and keeps them separate from supplier input costs. It uses a tenant-safe composite foreign key to `internal_items(organisation_id, id)`, with future sell price actions responsible for validating `internal_items.item_type = finished_product`. No sell price UI/actions, seed prices, Shopify sync, GST/tax engine, margin engine, Platform Admin changes, tenant provisioning changes or Supplier Invoice Intake changes are included.

## Task 154 Domain / App Mode Routing Foundation

Task 154 formalises passive domain/app-mode routing helpers. EveryBatch remains one repo, one Vercel project and one codebase, with future hostnames resolving to app modes rather than separate forks or builds.

Current mappings include `app.everybatchmrp.com` as `central_app`, `admin.everybatchmrp.com` as the preferred `platform_admin` host, `cleaneats.everybatchmrp.com` as `tenant_app` with tenant slug `cleaneats`, `support.everybatchmrp.com` as `support`, root EveryBatch domains as `marketing`, and localhost/Vercel deployment hosts as `local_dev` style fallbacks. No DNS, Vercel, Supabase Auth, middleware, production redirects, tenant subdomain activation, migrations, RLS, permissions, route moves or business logic changes are included.

## Task 155 Platform Admin App Mode Guarding

Task 155 adds lightweight middleware for the planned Platform Admin host. When the host resolves as `platform_admin`, `/` and tenant workspace routes redirect to `/platform`, while `/login`, `/select-workspace`, `/no-access`, `/platform/*`, assets and Next internals remain allowed.

Local development and Vercel deployment hosts remain permissive. `app.everybatchmrp.com` central app behaviour remains unchanged, including temporary `/platform` access while the admin domain is not live. Tenant app host enforcement for `cleaneats.everybatchmrp.com` remains deferred. No DNS, Vercel, Supabase Auth, database, migration, RLS, permission, tenant subdomain activation, route move or business logic changes are included.

## Task 156 Platform Admin Domain Setup

Task 156 documents the manual setup path for `admin.everybatchmrp.com`. The setup guide covers Vercel domain add steps, Cloudflare DNS requirements, Supabase Auth redirect URL review, signed-out/platform-admin/demo-user smoke tests and rollback notes.

No DNS, Vercel, Supabase Auth, database, migration, RLS, permission, tenant subdomain routing, Clean Eats host enforcement, route move, UI polish or business logic changes are included. `app.everybatchmrp.com` remains the live central app domain, and `platform.everybatchmrp.com` remains legacy/optional planning language only.

## Task 157 Platform Admin Brand/UI Polish

Task 157 applies the EveryBatch brand direction to the separated Platform Admin shell and `/platform` overview. Platform Admin now uses the EveryBatch Operator Console language, Food Manufacturing OS product line, dark green/lime platform palette and refined Platform Admin badges/cards. The Platform shell header uses the shared page-title helper so it shows the current Platform route title. Platform subpages no longer start with full-width dark hero blocks; they now use compact light context callouts, badges, summary cards, tables or forms so the persistent header is the single page header. The Platform Admin sidebar now follows the tenant app sidebar structure more closely with grouped icon-led rows, longest-route child active matching, single-open accordion behaviour and desktop collapse/expand behaviour, while the mobile Platform menu remains accessible and closes after live navigation clicks.

No tenant app shell, tenant navigation, auth, middleware, DNS, Vercel, Supabase, RLS, permission, migration, provisioning action or business module behaviour changes are included. The EB mark remains a temporary placeholder until a final EveryBatch logo/icon asset is provided.

## Task 158 Tenant Subdomain Routing v1

Task 158 activates the first Clean Eats tenant subdomain guard in code. `cleaneats.everybatchmrp.com` resolves as `tenant_app` with tenant slug `cleaneats`; `/` and `/platform/*` redirect to `/dashboard`, while tenant app routes, `/login`, `/select-workspace` and `/no-access` remain allowed.

This is static Clean Eats-only v1 routing. Middleware does not read Supabase sessions or query the database. `app.everybatchmrp.com`, `admin.everybatchmrp.com`, localhost and Vercel preview behaviour remain unchanged. No DNS, Vercel, Supabase Auth settings, schema, migration, RLS, permission, tenant provisioning, Platform Admin business logic, tenant sidebar or business module changes are included.

## Task 159 Multi-Domain Smoke Test and Redirect Hardening

Task 159 adds a multi-domain smoke-test checklist covering `app.everybatchmrp.com`, `admin.everybatchmrp.com`, `cleaneats.everybatchmrp.com` and localhost. It also hardens inactive tenant-looking subdomains so only the active Clean Eats tenant host can render tenant workspace routes in v1; other tenant subdomains allow public auth/static routes only and redirect app routes to `/login`.

The final task 159 routing fix redirects `app.everybatchmrp.com/platform` and `/platform/*` to the same path on `https://admin.everybatchmrp.com`, redirects `cleaneats.everybatchmrp.com/select-workspace` to `/dashboard`, and keeps localhost permissive for development. A local stale refresh-token login warning was documented as a known dev/session issue for future auth hardening if it recurs.

No DNS, Vercel, Supabase Auth, database, migration, RLS, permission, business logic, sidebar or design changes are included.

## Task 160 Live Multi-Domain Smoke Test Results

Task 160 records live signed-out/header smoke test results after deploying the domain routing work. `app.everybatchmrp.com` and `cleaneats.everybatchmrp.com` resolved and returned the expected redirects for central login, central Platform Admin redirect, Clean Eats tenant root, tenant workspace selector and tenant Platform Admin blocking.

`admin.everybatchmrp.com` did not resolve from the Codex environment during task 160, so admin-domain live checks are recorded as requiring manual verification in Luke's browser/network and Vercel/Cloudflare. `app.everybatchmrp.com/dashboard` returning `200` is documented as a temporary Clean Eats fallback behaviour, with task 161 queued for Central App Tenant Redirect Hardening. No code, DNS, Vercel, Supabase Auth, schema, migration, RLS, permission, business logic, sidebar or design changes are included.

## Task 161 Central App Tenant Redirect Hardening

Task 161 updates central-domain routing so `app.everybatchmrp.com` no longer renders tenant workspace routes directly. Central `/platform` routes redirect to `https://admin.everybatchmrp.com/platform...`; central tenant routes such as `/dashboard`, `/components` and `/finished-products` redirect to `/select-workspace?next=...`. The authenticated workspace selector and post-login destination helper then send tenant users to `https://cleaneats.everybatchmrp.com/...` and Platform Admin users to `https://admin.everybatchmrp.com/platform`, while localhost remains local/permissive.

The correct Platform Admin domain is `admin.everybatchmrp.com`; do not use `admin.everybatchmrp.com.au`. Middleware still performs no Supabase/session/database reads. No DNS, Vercel, Supabase Auth, schema, migration, RLS, permission, tenant provisioning, business logic, sidebar or design changes are included.

## Task 162 Live Domain Redirect QA Pass

Task 162 records live signed-out/header QA after task 161. `app.everybatchmrp.com/dashboard`, `/components` and `/finished-products` now redirect to `/select-workspace?next=...`; central `/platform` routes redirect to `https://admin.everybatchmrp.com/...`; `admin.everybatchmrp.com` resolves and blocks tenant routes by redirecting them to `/platform`; `cleaneats.everybatchmrp.com` allows tenant routes while redirecting `/select-workspace` and `/platform` to `/dashboard`.

No live redirect failures were found. Signed-in workspace selector clicks are documented for manual browser verification because they require real Supabase auth/session state. No code, DNS, Vercel, Supabase Auth, schema, migration, RLS, permission, business logic, sidebar or design changes are included.

## Task 163 Workspace Selector Live Domain QA / Polish

Task 163 lightly polishes the central workspace selector so each card shows workspace type, destination domain, short description, status and clearer action labels. Clean Eats shows `cleaneats.everybatchmrp.com`; Platform Admin shows `admin.everybatchmrp.com`. Safe `next` paths are preserved for Clean Eats tenant routes, Platform Admin preserves `/platform/...` paths, and localhost continues to use local paths.

The selector continues to validate workspace selections server-side. `next` values must be internal single-slash paths; protocol URLs and `//` paths are ignored so there is no open redirect path. No DNS, Vercel, Supabase Auth, database, migration, RLS, permission, tenant app business logic, Platform Admin business logic, sidebar or navigation changes are included.

## Task 174 Support Help Centre Scaffold

Task 174 creates the first authenticated EveryBatch support/help-centre scaffold. The support host now allows and rewrites `support.everybatchmrp.com/`, `/guides`, `/tickets`, `/contact`, `/release-notes` and `/troubleshooting` to internal `/support` routes, while `/platform`, `/dashboard`, tenant app routes and `/select-workspace` redirect to support home. Middleware still performs no Supabase, session or database reads.

The support routes use `requireAuth()` in the support layout, so any signed-in EveryBatch user can view the scaffold. The shell includes EveryBatch Help Centre branding, lightweight support navigation, workspace return links, the central workspace selector link and sign out. Guide, ticket, contact, release-note and troubleshooting pages are static scaffold pages only. No ticket tables, ticket actions, database-backed guide content, support-specific permissions, migrations, RLS changes, DNS/Vercel/Supabase setting changes or business logic changes are included.

The task 174 follow-up fix hardens host resolution so recognised direct request hosts such as `support.everybatchmrp.com` win over forwarded-host fallback metadata. This prevents support-domain `/platform` and tenant workspace paths from rendering the wrong app surface if proxy headers are shaped unexpectedly.

## Task 175 App Shell And Auth Page UI Cleanup

Task 175 cleans up visual regressions across `/login`, `/select-workspace` and the Platform Admin shell. Login and workspace selector desktop layouts now use balanced two-panel grids so brand and action panels align visually while mobile remains stacked.

The Platform Admin sidebar now has a tenant-shell-like account footer with Switch workspace and Sign out actions, a subtle collapse control beneath it and cleaner child submenu rows without repeated large icons or Live badges. Tenant app sidebar order, auth flow, workspace routing, Platform Admin business logic, support routing, database schema, migrations, RLS and permissions are unchanged.

## Task 176 Support Guides Static Content

Task 176 expands the authenticated support/help-centre area with static user-facing guide content. The shared static guide model now includes categories, slugs, titles, summaries, statuses, audiences, estimated read times, body sections and related links.

Available guides cover getting started, workspace selector/domains, Products, Costings, Formula Builder, Supplier Invoice Intake, Inventory and sign-in/access troubleshooting. Coming-soon guide cards cover Production, QA, Logistics, CRM, Reports, Support Tickets and Platform Admin for operators.

The support home now surfaces popular guides, the guide index groups cards by category and `/support/guides/[slug]` renders individual static guide pages. Troubleshooting and release notes now contain practical user-facing static content. No ticket persistence, database-backed guide content, MDX pipeline, migrations, auth/domain routing changes, RLS/permission changes or business logic changes are included.

## Task 177 Support Tickets Schema Foundation

Task 177 drafts migration `032_support_tickets_schema_foundation.sql` for the future EveryBatch support ticket foundation. It adds tenant-scoped `support_tickets`, `support_ticket_comments` and `support_ticket_events`, with customer/internal visibility on comments/events, support ticket value constraints, RLS policies and support ticket permission seeds.

Active tenant members can read/create/comment on customer-visible support records for their organisation. Platform admins can read/manage across tenants and access internal comments/events. No support ticket UI forms, Platform Admin inbox, attachments, emails, external integrations, sample ticket data, auth/domain routing changes, business logic changes or migration application are included.

## Task 178 Support Ticket UI

Task 178 adds the first customer-facing support ticket portal under `/support/tickets`. Signed-in users can choose an organisation context, view customer-visible tickets, create a support ticket, open ticket detail, add customer-visible comments and see customer-visible timeline events.

The UI uses the authenticated Supabase server client and existing RLS. It does not use service-role keys, does not show internal comments/events and does not build Platform Admin Support Inbox, internal notes UI, assignment/status management UI, attachments, email notifications, external integrations, schema changes, RLS changes or business logic changes.

## Task 179 Platform Admin Support Inbox

Task 179 adds the first Platform Admin Support Inbox under `/platform/support`, with detail pages at `/platform/support/[id]`. Platform admins can list tickets across tenants, filter by status/priority/category/tenant/search, update status/priority/category, assign or clear assignment, add customer-visible replies and add internal notes.

The inbox uses the authenticated Supabase server client and existing platform-admin RLS. It does not use service-role keys, does not add schema/RLS/permission changes and does not build attachments, emails, realtime, external integrations or customer-facing ticket UI again. Customer `/support/tickets/[id]` continues to show customer-visible comments/events only, so internal Platform Admin notes/events remain hidden from customers.

## Task 180 Support Ticket Polish And Permission QA

Task 180 polishes and QA-checks the full support ticket loop after tasks 177-179. Support home, troubleshooting and release notes now describe live workspace-linked ticket workflows. Customer ticket detail now shows clearer workspace context, support ticket metadata and success/warning/error feedback. Customer ticket actions log safe server-side Supabase error context when writes fail.

Platform support inbox filtering now ignores invalid tenant filter ids before querying Supabase, and inbox copy clarifies the customer-visible reply versus internal operator note model. The visibility model is confirmed: customer support pages query `visibility = customer` comments/events only, while Platform Admin support pages can show both customer-visible and internal records through existing platform-admin RLS.

No support ticket schema, migration, RLS, permission, auth/domain routing, Platform Admin route structure, external integration, email, realtime, attachment or business module change is included.

## Task 181 Support Ticket Status Workflow Polish

Task 181 defines the v1 support ticket lifecycle in shared TypeScript helpers. New customer tickets now start as `waiting_on_support`. Customer comments are blocked on closed tickets and otherwise move tickets to `waiting_on_support`, including resolved tickets where the customer still needs help.

Platform Admin customer-visible replies are blocked on closed tickets, move `open` and `waiting_on_support` tickets to `waiting_on_customer`, and leave `waiting_on_customer`, `planned` and `resolved` statuses unchanged. Internal notes remain allowed and do not change status.

Manual Platform Admin status changes set `resolved_at` or `closed_at` only when moving into those statuses and the timestamp is empty. Historical `resolved_at` and `closed_at` values are preserved when moving away from those statuses. No schema, migration, RLS, permission, auth/domain routing, notification, attachment, realtime, external integration or business module change is included.

## Task 182 Support Ticket Context-Aware Creation

Task 182 adds safe context-aware ticket creation. `lib/support-ticket-page-context.ts` maps known app paths to safe `related_path`, `related_module_key` and support ticket category defaults. The tenant app Help menu now includes `Report an issue on this page`, linking to local `/support/tickets/new` on localhost and `https://support.everybatchmrp.com/tickets/new` on production surfaces with safe query params.

The new ticket page accepts `relatedPath`, `moduleKey`, `category`, `priority`, `title` and existing `organisationId` params, displays a linked context card when present, and server actions re-sanitise path/module/category before writing. Customer and Platform support detail pages display related context, and Platform inbox rows show compact context hints.

No support ticket schema, migration, RLS, permission, auth/domain routing, notification, attachment, screenshot, browser metadata, external integration or business module change is included.

## Task 183 Support Inbox Search And Pagination Polish

Task 183 improves support ticket list usability without schema changes. `/platform/support` now uses safe page parsing, 25-ticket server-side pagination, count display, active filter chips, validated status/priority/category/tenant/module filters and bounded title/description search. Summary cards remain global Platform Admin inbox health counts rather than filter-bound counts.

Customer `/support/tickets` now has lightweight status/category/search filters, 25-ticket pagination, clearer empty states and related module/path context on ticket rows when present. Customer detail visibility remains unchanged: internal notes/events are still Platform Admin-only. No support ticket schema, migration, RLS, permission, auth/domain routing, notification, attachment, realtime, external integration or business module change is included.

## Task 184 Support Ticket Attachments Plan

Task 184 documents the future support ticket attachment architecture only. The recommended future design is a private `support-ticket-attachments` Supabase Storage bucket with paths shaped as `{organisation_id}/support-tickets/{ticket_id}/{attachment_id}/{safe_filename}`, plus a tenant-scoped `public.support_ticket_attachments` table with customer/internal visibility, scan status, soft archive status and composite ticket foreign keys.

The plan recommends customer-visible attachments for active tenant members and Platform Admin, internal-only attachments for Platform Admin only, signed URLs instead of public files, conservative v1 file limits, no `attachment_added` event until the event type check is deliberately expanded, and no attachment-specific permissions in v1 unless a real separation need appears. No attachment schema, migration, Storage bucket, Storage policy, RLS, permission, upload UI, support action, notification, external integration or business module change is included.

## Task 185 Support Ticket Attachments Foundation

Task 185 drafts migration `033_support_ticket_attachments_foundation.sql`. It creates private `support-ticket-attachments` bucket metadata, `public.support_ticket_attachments`, attachment indexes, RLS policies and `public.can_access_support_ticket_attachment_storage_path(...)` for future signed Storage access. It also adds `lib/support-ticket-attachment-types.ts` for bucket, limit, MIME, visibility, source, scan-status and attachment-status constants.

Migration 033 intentionally does not create direct `storage.objects` policies. Storage SELECT/INSERT policy expressions remain a reviewed/manual follow-up when upload/download UI is built. No upload UI, display UI, ticket action change, comment/event change, email, notification, realtime, scan worker, auth/domain routing, Platform Admin route, support guide promise, RLS bypass, service-role use or business module change is included.
