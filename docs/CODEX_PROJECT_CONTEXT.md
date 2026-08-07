# Codex Project Context

## Current Roadmap And Execution Standard

The active sequence is [EveryBatch Official Roadmap - Tasks 225-348](./225-348-official-roadmap.md). Task 237 is production accepted at `13a5f1b4aca93f0f2fbb38dd256ec5968044ef67` (`Build demand review and freeze workflow`) and deployment `dpl_B7GLzEp5a65YArgHfJRdmciJ2rhy`. Migrations 053-055 are live/registered and immutable. Full rollback-only lifecycle, real independent-session concurrency and production browser verification passed with zero operational residue. Task 238 is committed at `e23024761f1197997b100a4e26cd401c0f19330a` (`Decide production import ownership`). Task 239 is committed at `cf2a495786a6efd9cf87372496fcfc71ec766fec` (`Decide production knowledge ownership`). Task 240 is documentation-complete and uncommitted; Task 241 follows only after Task 240 review and commit. Stock On Hand and marketing DNS remain separate.

Current onboarding begins with [Current Chat Handover](./CHAT_HANDOVER_CURRENT.md), then the [official roadmap](./225-348-official-roadmap.md), task standards, [Master Handbook](./EVERYBATCH_MASTER_HANDBOOK.md), [Engineering Operations](./EVERYBATCH_ENGINEERING_OPERATIONS.md), current capability/source-of-truth matrices, Decision Log and Task Index. The preserved original architect dossier and earlier roadmaps are historical evidence, not current implementation authority.

All numbered work follows [Codex Task Standards](./CODEX_TASK_STANDARDS.md). Confirm the branch and working tree before edits, preserve strict scope, review documentation impacts, and do not change or apply migrations without the task-specific approval required by those standards.

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

Current domain roles:

- `everybatchmrp.com` for the future public marketing website
- `app.everybatchmrp.com` for central login and workspace selection
- `cleaneats.everybatchmrp.com` for the Clean Eats tenant workspace
- `admin.everybatchmrp.com` for Platform Admin
- `support.everybatchmrp.com` for Support and Help Centre

Current domain setup:

- `app.everybatchmrp.com` is live and validated in Vercel
- Cloudflare DNS is active with `CNAME app -> b560eb64065fe2f1.vercel-dns-017.com`
- Cloudflare proxy remains DNS only
- the Vercel production URL currently redirects to `app.everybatchmrp.com`, but remains available in Vercel if needed
- login and dashboard smoke tests passed on `app.everybatchmrp.com`
- do not point `everybatchmrp.com` root to the tenant app; reserve it for marketing or a coming-soon page
- `cleaneats.everybatchmrp.com` is the Clean Eats tenant host
- `admin.everybatchmrp.com` is the separated Platform Admin host
- `support.everybatchmrp.com` is the Support and Help Centre host
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

## Task 195 Goods Inwards Receiving UI v1

Task 195 builds the first manual Goods Inwards receiving workflow using the task 194 schema after migration 035 was manually applied. `/goods-inwards` now lists real receipt rows, `/goods-inwards/new` creates draft receipts and `/goods-inwards/[id]` supports manual line entry, draft cancellation and receipt posting for authorised users.

Posting a draft receipt creates `inventory_lots` and `stock_movements` rows, then marks the receipt posted. V1 posting is sequential Supabase writes after pre-validation, not a database transaction/RPC yet. Lines needing unknown unit conversion or marked rejected block posting. Held lines post as on-hold lots.

`/stock-movements` now shows real recent ledger rows or a real empty state. Supplier Invoice Intake remains separate and does not create receipts or stock automatically. No SQL migrations, purchase orders, barcode scanning, QA checklist workflow, production consumption, stock-on-hand summaries, costing changes, approved supplier price changes, auth/domain changes, Platform Admin changes, service-role flows or packages are included.

Support guide, troubleshooting and release-note copy now mention Goods Inwards basics. Existing support ticket page context already maps Goods Inwards and stock movements to Inventory.

See:

```text
docs/195-goods-inwards-receiving-ui-v1.md
```

## Task 196 Supplier Invoice To Receiving Plan

Task 196 plans the future bridge from reviewed Supplier Invoice Intake lines into Goods Inwards draft receipt suggestions. The plan keeps the separation explicit: invoice approval creates commercial price/catalogue knowledge, while receiving records physical stock and only posting a reviewed receipt creates inventory lots and stock movement ledger rows.

The recommended v1 uses existing links: `inventory_receipts.purchase_document_id`, `inventory_receipt_lines.purchase_document_line_id`, `supplier_item_id` and `internal_item_id`. It requires eligible mapped stock-like invoice lines, a user-selected default stock location and duplicate prevention based on existing non-archived receipt lines. Unknown pack conversions should create `needs_conversion` draft lines and continue blocking posting until UOM rules exist.

No migrations, UI, receiving suggestions, parser changes, approved price changes, stock posting changes, RLS/permission changes, Platform Admin changes, Support UI changes or packages are added.

See:

```text
docs/196-supplier-invoice-to-receiving-plan.md
```

## Task 197 Supplier Invoice To Receiving v1

Task 197 adds the first review-driven bridge from Supplier Invoice Intake to Goods Inwards. Purchase document detail pages now show a Goods Inwards panel with real eligibility counts, skipped-line reasons, existing linked receipt links, a required default stock location selector and a `Create Goods Inwards draft` action.

The server action creates only `inventory_receipts` draft headers and `inventory_receipt_lines` draft lines. Receipts link to `purchase_document_id`, lines link to `purchase_document_line_id`, and duplicate prevention skips invoice lines that are already linked to non-archived receipt lines. Goods Inwards detail/list pages now mark source invoice receipts.

No inventory lots, stock movements, parser changes, approved supplier price changes, purchase orders, UOM conversion tables, RLS/permission changes, Platform Admin changes, domain changes or packages are added. Goods Inwards posting remains the only step that creates lots and stock movement ledger rows.

See:

```text
docs/197-supplier-invoice-to-receiving-v1.md
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

## Task 198 Production Batch Planning Data Model

Task 198 drafts migration `036_production_batch_planning_schema_foundation.sql` for tenant-scoped production planning. It adds `production_areas`, `production_plans`, `production_plan_lines`, `production_batches` and `production_batch_inputs`, plus production planning permissions, RLS policies, comments, indexes and TypeScript status constants.

This is schema foundation only. It does not build Production Plan UI, production task execution, iPad/facility workflows, stock consumption, production stock movements, QA checks, logistics, reports, UOM conversion tables, supplier invoice changes or Goods Inwards posting changes. Task 199 should replace misleading production demo content with real empty states and real data from these tables after the migration is reviewed and applied.

## Task 199 Production Plan UI v1

Task 199 replaces the fake `/production-plan` demo surface with real production planning UI. Users with the right permissions can view production plans, create a draft plan, open plan detail, add planned finished product/component output lines and create planned production batch headers.

This remains planning-only. It does not reserve or consume stock, create inventory lots, create `stock_movements`, create production output stock, generate production tasks, build tablet/facility execution, generate batch inputs, change Goods Inwards/Supplier Invoice Intake/costing/formula logic, alter RLS/permissions, or add packages. Support guide, troubleshooting and release-note text now mention Production Plan UI v1.

## Task 200 Phase 1 Operational Review Pack

Task 200 creates the Phase 1 Operational Review Pack after tasks 001-199. It records what EveryBatch / Clean Eats Hub can demonstrate now, what is real versus scaffolded, what Clean Eats data is still required, the critical operational gaps before a live cutover, manual testing coverage, risks and hardening priorities.

Task 200 also adds the 201-250 roadmap and a reusable task prompt template for future work. From task 201 onward, prompts should explicitly cover Admin + Support impact, cross-module impact, dummy/demo cleanup, permission/RLS impact, data model impact, support guide/troubleshooting/release-note impact and smoke checks. If any SQL migration file is created or changed, the final Codex response must paste the full SQL under `FULL SQL MIGRATION CONTENTS`.

This is documentation only. No UI, schema, migration, RLS, permission, auth/domain routing, DNS/Vercel/Supabase setting, business logic or package changes are included.

## Task 201 Phase 2 Module Integration Map

Task 201 documents how QA, Logistics, Reports and CRM should connect into the Phase 1 operational foundation. The map confirms that Products/internal items, Supplier Invoice Intake, Goods Inwards, inventory lots, stock movements, Production Plans/Batches and Costing Snapshots remain source-of-truth records, while QA, Logistics, Reports and CRM should attach to or read from those records instead of duplicating them.

The task records QA, Logistics, Reports and CRM integration maps, a cross-module lifecycle from supplier invoice to future dispatch/reporting, permission and Platform Admin impact, Support Help Centre/troubleshooting/release-note impact and scaffold/demo cleanup findings for QA, Logistics, Reports, CRM, Production Report, Production Tasks and Facility/iPad surfaces.

This was the Task 201 sequencing recommendation at the time. It is now historical: Tasks 201-222 are complete and [EveryBatch Official Roadmap - Tasks 225-348](./225-348-official-roadmap.md) is the active source for task order. The 201+ prompt template includes source-of-truth impact checks. No UI, schema, migration, RLS, permission, auth/domain routing, business logic or package changes were included by Task 201.

## Task 202 UOM Conversion Foundation Plan

Task 202 documents the UOM Conversion Foundation before schema or UI work. The plan confirms that global metric conversions such as kg/g and l/ml can remain safe in code, while pack units such as bunch, box, carton, bottle, bag, tub, tray and packet must not be guessed.

The recommended future model is tenant-scoped `uom_conversion_rules` with rule scopes for tenant, internal item and supplier item. Matching priority should prefer supplier-item-specific rules, then internal-item-specific rules, then tenant generic rules, then global metric conversion, then blocked/no conversion. The plan covers conversion math, direct/reverse conversion handling, source/review metadata, permissions/RLS planning, UI placement under Products, Admin/Support impact, cross-module impact, audit/reporting considerations and risks/controls.

No UI, schema, migration, RLS, permission, unit conversion helper, costing, Goods Inwards, Supplier Invoice Intake, production planning, auth/domain routing, business logic or package changes are included.

## Task 203 UOM Conversion Schema Foundation

Task 203 drafts migration `037_uom_conversion_schema_foundation.sql`. It creates tenant-owned `uom_conversion_rules`, seeds `uom_conversions.view`, `uom_conversions.create` and `uom_conversions.manage`, grants conservative role permissions, enables RLS and adds SELECT/INSERT/UPDATE policies. No DELETE policy or sample conversion data is included.

The schema supports tenant, internal-item and supplier-item rule scopes, status/confidence/source metadata, effective dates, reviewed conversion math, `allow_reverse`, same-tenant foreign keys, duplicate active open-ended rule prevention and soft archive semantics. Tenant users with create permission can insert draft rules only; activation/update/archive require manage permission or platform admin.

`lib/uom-conversion-types.ts` adds constants, labels and type guards for future UI/actions, and support ticket page context now recognises future `/uom-conversions` routes as Products-category context. This task does not build UI, add sidebar navigation, update unit conversion helper logic, apply DB rules to costing/receiving/production, alter auth/domain routing, change business logic or add packages.

## Task 204 UOM Conversion UI v1

Task 204 adds the first tenant-facing UOM Conversion UI at `/uom-conversions`, `/uom-conversions/new` and `/uom-conversions/[id]`. The Products sidebar now includes a permission-aware UOM Conversions item for users with `uom_conversions.view`.

The UI lists real tenant conversion rules, provides a real empty state, creates draft rules, calculates `conversion_factor` from source/target quantities, validates same-tenant internal item/supplier/supplier item references, and lets manage users edit, activate, deactivate or archive rules. Duplicate active open-ended rules show a friendly message. There is no delete action and no fake/sample conversion data.

Support impact is now user-facing: the Help Centre includes a UOM Conversion basics guide, troubleshooting entries for conversion blockers and duplicate active rules, a release note, and support ticket context mapping for UOM pages. No Platform Admin routes, feature flags, RLS, permissions, costing calculations, Supplier Invoice Intake logic, Goods Inwards posting, stock movements, production planning, auth/domain routing or packages changed.

## Task 205 Goods Inwards Line Edit And Posting Hardening

Task 205 improves Goods Inwards draft review before stock posting. Draft receipt headers can now be edited on receipt detail, draft receipt lines can be edited on the dedicated `/goods-inwards/[id]/lines/[lineId]/edit` route, invoice-linked receipt lines preserve their `purchase_document_line_id`, and cancelled lines remain excluded from posting.

Receipt detail now shows a real posting preflight summary with active, ready, blocked, held, rejected and conversion-required counts plus line-level blocker reasons. Posting revalidates draft status, active line readiness, conversion blockers, rejected QA lines and duplicate lot/movement indicators before creating inventory lots and stock movement rows. Posted receipts are read-only and explain that future corrections should use reversal/adjustment workflows.

This task does not add migrations, change RLS/permissions, integrate database UOM rules into posting, alter Supplier Invoice Intake parsing, auto-post stock from invoices, build purchase orders, QA checklists, stock-on-hand reports, production consumption/output, auth/domain routing or packages. Support guide, troubleshooting and release notes now mention draft edits, posting blockers and posted receipt locking.

## Task 206 Goods Inwards Posting RPC Plan

Task 206 is docs/planning only. It creates the blueprint for replacing sequential Goods Inwards posting writes with `public.post_inventory_receipt(p_receipt_id uuid)` in task 207. The planned RPC should validate and lock the receipt/lines, enforce active tenant membership plus `inventory_receipts.post`, create inventory lots and stock movements, update receipt lines and receipt header inside one Postgres transaction, and return structured result/error data.

Correct live domains remain `app.everybatchmrp.com` for central login/workspace selection, `admin.everybatchmrp.com` for Platform Admin, `cleaneats.everybatchmrp.com` for Clean Eats tenant workspace and `support.everybatchmrp.com` for authenticated support. Do not use `admin.everybatchmrp.com.au`.

Task 206 does not create migrations, change app posting code, change RLS/permissions, change UOM integration, alter Supplier Invoice Intake, build stock-on-hand, change production/costing/formula behaviour, alter Admin/Support workflows or add packages.

## Task 207 Goods Inwards Posting RPC Foundation

Task 207 implements migration `038_goods_inwards_posting_rpc.sql`, creating `public.post_inventory_receipt(p_receipt_id uuid)` as a transaction-safe `jsonb` RPC for posting Goods Inwards receipts. The function uses `SECURITY DEFINER` with fixed `search_path = public`, no dynamic SQL and explicit tenant/permission checks before writing. It requires the current profile, `public.is_platform_admin()` or active tenant membership with `inventory_receipts.post`, and grants execute to `authenticated` only.

`postInventoryReceiptAction` now calls the RPC instead of performing sequential TypeScript writes. The RPC locks the receipt and active lines, blocks invalid states before writing, creates inventory lots and receipt stock movement ledger rows, updates receipt lines to `received` or `held`, and marks the receipt `posted` inside one transaction. Already-posted retry/double-click calls return a controlled `already_posted` result without duplicate stock.

No Supplier Invoice Intake parsing, Supplier Invoice to Receiving draft creation, purchase orders, barcode scanning, QA checklist workflows, production stock movements, stock-on-hand summaries, UOM database conversion integration, costing/formula/Meal Margins logic, auth/domain routing, DNS/Vercel/Supabase settings, RLS/permission changes, Platform Admin routes or packages are changed. Support guide, troubleshooting and release-note wording now mention transaction-safe posting reliability.

## Task 208 Stock On Hand Summary Plan

Task 208 is docs/planning only. It creates `docs/208-stock-on-hand-summary-plan.md` as the implementation blueprint for future stock-on-hand summaries after Goods Inwards posting moved to the transaction-safe RPC in task 207.

The plan confirms `stock_movements` as the append-like inventory ledger and primary quantity source for stock-on-hand, with `inventory_lots` providing traceability/status context, `inventory_receipts` and receipt lines acting as inbound source events, and supplier invoices remaining commercial evidence rather than stock source records. Stock-on-hand should be derived as read-only grouped totals from posted, non-archived stock movements and should not be manually edited.

The recommended next implementation path is task 209 Stock On Hand Summary UI v1 using direct server-side aggregation from `stock_movements` first, grouped by item/location/lot/unit and warning on mixed units. SQL views/RPCs/materialized summaries should wait until the UI shape or performance needs justify them. Task 208 does not create migrations, routes, UI, navigation, RLS/permission changes, Platform Admin changes, support workflow changes, stock posting changes, UOM integration, production/costing/formula changes or packages.

## Task 209 Stock On Hand Summary UI v1

Task 209 adds `/stock-on-hand` as the first read-only Stock On Hand page in the tenant Inventory workspace. The page uses direct server-side aggregation from posted, non-archived `stock_movements`, grouped by internal item, stock location, inventory lot and unit. It does not create migrations, SQL views, RPCs, materialized summaries or manual stock edit actions.

Stock On Hand v1 separates available, held and physical quantity using `inventory_lots` status and QA context. Mixed-unit items are flagged rather than silently converted, and UOM conversion database rules are not integrated yet. The Inventory sidebar now includes Stock On Hand, the page title helper maps `/stock-on-hand`, and support ticket page context maps the route to Inventory.

Support impact is limited to user-facing wording: Inventory guide, troubleshooting and release notes mention Stock On Hand. There are no Platform Admin route changes, tenant management changes, feature flag changes, RLS/permission changes, Supplier Invoice Intake changes, Goods Inwards posting changes, production/costing/formula changes, auth/domain changes or packages.

## Task 210 Inventory Traceability Map Plan

Task 210 is docs/planning only. It creates `docs/210-inventory-traceability-map-plan.md` as the implementation blueprint for future inventory traceability after Goods Inwards posting, stock movements and Stock On Hand are in place.

The plan separates the real inbound chain available now from future recall-grade forward traceability. Current traceability can read supplier invoice evidence, purchase document lines, Goods Inwards receipt lines, inventory lots, stock movements and Stock On Hand. Production records currently remain planning-only: production batch inputs do not consume lots or write outbound stock movements, and production outputs do not create produced lots or inbound stock movements yet.

The recommended route for a future real traceability screen is `/inventory-traceability`, with `/bom-traceability` either redirected or replaced later because it is currently sample/static. Task 211 is recommended as Inventory Traceability Map UI v1 using server-side TypeScript queries and no migration unless a real query/RLS blocker appears. Task 210 does not create UI, routes, migrations, views/RPCs, RLS/permission changes, stock posting changes, stock-on-hand changes, production stock movement logic, QA workflows, support release notes or packages.

## Task 211 Inventory Traceability Map UI v1

Task 211 adds `/inventory-traceability` as the first real read-only inbound traceability map in the tenant Inventory workspace. The page centres `inventory_lots` and shows surrounding supplier evidence, Goods Inwards receipt/line context, inventory lot data, stock movement ledger rows and Stock On Hand balance context.

Invoice-linked receiving is shown when the current role has `purchase_documents.view`; otherwise the page shows safe hidden-by-access messaging. Manual receiving is labelled as manual receiving instead of inventing invoice evidence. The route requires `stock_movements.view` and does not add migrations, SQL views, RPCs, writes, RLS/permission changes, Goods Inwards posting changes, Supplier Invoice Intake parsing changes, production usage, dispatch/customer traceability, recall workflow, UOM integration, costings/formula changes, Platform Admin changes or packages.

The old `/bom-traceability` and `/inventory/bom-traceability` sample/static scaffold routes now redirect to `/inventory-traceability`. Inventory navigation now shows Traceability after Stock On Hand. Support guide, troubleshooting, release notes and support ticket page context now mention Inventory Traceability.

## Task 212 Stock Adjustment/Reversal Plan

Task 212 is docs/planning only. It creates `docs/212-stock-adjustment-reversal-plan.md` as the blueprint for future stock corrections after Goods Inwards posting, Stock On Hand and Inventory Traceability are in place.

The plan keeps `stock_movements` as the append-only inventory ledger and recommends future `stock_adjustments` and `stock_adjustment_lines` source event tables. Corrections should create new posted movement rows rather than editing posted receipt lines, inventory lots or historical stock movement rows. Reversals should reference original movements/receipts/lines where possible, quantities should remain positive, and direction controls whether stock is added or subtracted.

Task 212 documents adjustment vs reversal vs status-only correction models, movement type and reason-code recommendations, lot/location validation, conservative permissions, future `/stock-adjustments` routes, a transaction-safe `post_stock_adjustment` RPC direction, Stock On Hand and Inventory Traceability impact, audit/compliance considerations, testing, rollback and performance deferral. No migrations, UI, routes, RLS/permission changes, Goods Inwards posting changes, Stock On Hand changes, Inventory Traceability changes, Supplier Invoice Intake changes, production/QA/logistics workflows, support release notes or packages are added.

## Task 213 QA Module Deep Planning

Task 213 is docs/planning only. It creates `docs/213-qa-module-deep-planning.md` as the blueprint for turning the QA area from generic placeholders into a real EveryBatch quality workspace.

The plan defines QA ownership boundaries, personas, future routes, a shared template/check/result model, receiving QA checks, production QA checks, daily/pre-op checks, temperature result handling, HACCP/CCP boundaries, future non-conformance/corrective-action concepts, QA document boundaries, conservative future permissions, audit events, Platform Admin impact, Support impact and cross-module source-of-truth rules.

The approved near-term sequence at Task 213 was QA planning, navigation, schema, Receiving Checks and Hold/Release across Tasks 213-217. Those tasks were subsequently completed. Full operational NC/CA schema and workflows remain deferred, and stock adjustment/reversal implementation remains parked. Task 213 itself added no migrations, UI, routes, navigation, app code, RLS/permission changes, support guides, release notes, auth/domain routing, business logic or packages.

## Task 214 QA Module Navigation + Scaffold v1

Task 214 replaced generic QA placeholders with the approved tenant QA workspace scaffold. Task 221 later removed the duplicate QA Dashboard child because the `/qa` parent owns that destination. The current QA submenu is Receiving Checks, Production Checks, Daily Checks and Hold & Release; later QA workspaces remain governed by the active roadmap.

The new QA routes are `/qa`, `/qa/receiving`, `/qa/production`, `/qa/daily`, `/qa/holds`, `/qa/non-conformance`, `/qa/corrective-actions` and `/qa/templates`. Old routes redirect: `/qa-checks` to `/qa/receiving`, `/qa-sign-offs` to `/qa` and `/qa-incidents` to `/qa/non-conformance`.

Task 214 uses existing `qa.view` access, permission-aware navigation and organisation-module visibility. It does not add schema, migrations, permissions, RLS policies, feature flags, QA records, check forms, template forms, Receiving Check actions, hold/release actions, Goods Inwards changes, Inventory changes, Stock On Hand changes, Inventory Traceability changes, Production changes, Platform Admin changes, Support Help Centre guides, troubleshooting content, release notes or packages. Task 215 remains next, task 216 owns operational Receiving Checks and task 217 owns formal full-lot hold/release availability control. Stock adjustment/reversal implementation remains parked.

## Task 215 QA Schema Foundation

Task 215 drafts `supabase/migrations/039_qa_schema_foundation.sql` as the first tenant-owned QA database foundation. It adds QA templates, immutable template versions, sections, items, check instances, results, reviews, approvals, amendments, full-inventory-lot hold records and append-only hold events.

The migration seeds granular QA permissions, maps the full set to `platform_admin`, `organisation_admin` and `qa_manager`, gives limited QA check/hold/report visibility to selected operational roles, and grants no new QA permissions to `phase_1_demo_user`. All QA tables are tenant-scoped with `organisation_id` and RLS policies use the existing `is_platform_admin`, `is_active_member`, `has_permission` and `current_profile_id` helper pattern.

Task 215 does not add QA UI, server actions, automatic receiving checks, sample QA templates, sample checks, fake Clean Eats QA data, evidence storage, NC/CA operational schema, Goods Inwards changes, inventory lot status changes, Stock On Hand changes, stock movements, Inventory Traceability changes, Production behaviour changes, Platform Admin actions, Support guide content, auth/domain/middleware changes or packages. Task 216 remains Receiving QA Checks UI v1, and task 217 remains the formal QA Hold/Release Inventory Link. Stock adjustment/reversal implementation remains parked.

## Audit Hardening Integration Pass Before Task 216

An unnumbered maintenance pass restores local repository history for already-live audit/ledger hardening in `supabase/migrations/040_ledger_snapshot_immutability_triggers.sql`. The migration defines fixed-search-path trigger functions and triggers that make `stock_movements` append-only, make `costing_snapshot_lines` immutable and allow `costing_snapshots` only the existing archive transition (`status = 'archived'` plus `archived_at`) without calculation/source rewrites.

Current write paths were checked for compatibility: Goods Inwards posting inserts stock movements through `post_inventory_receipt`, Stock On Hand and Inventory Traceability only read movements, Costing Snapshot creation inserts headers/lines, and snapshot archive updates only the permitted archive fields.

Batch Receiving and Purchasing are explicitly marked as preview/sample Inventory workspaces with navigation preview markers and persistent `Sample Data - Not Live` banners. The Costings landing copy states that formula costing, Costing Snapshots and real Meal Margin calculations are active where readiness inputs exist. Earlier context records Leaked Password Protection as enabled after the Supabase upgrade, while older warning-era references remain; the official roadmap schedules live-setting/documentation verification during Task 343 or another explicitly approved security review. Task 216 was subsequently completed.

## Task 216 Receiving QA Checks UI v1

Task 216 adds the first real Receiving QA workflow using the task 215 QA schema. `/qa/receiving` lists real tenant Receiving QA checks, `/qa/receiving/new` starts a check from a real Goods Inwards receipt or receipt line using an active template with a published current version, and `/qa/receiving/[id]` saves typed in-progress results, completes checks and records QA review decisions.

Receiving QA records reference Goods Inwards source records but do not alter receipt status, receipt line `qa_status`, inventory lot `qa_status` or stock movements. Task 217 now promotes eligible hold recommendations into formal full-inventory-lot QA holds through controlled RPCs.

The UI follows existing QA permissions: `qa.view`/`qa.checks.view` for reads, `qa.checks.create` for starting checks, `qa.checks.complete` for saving/completing results and `qa.reviews.manage` for review decisions. No migrations, fake QA templates/checks, Production QA, NC/CA workflows, evidence upload, service-role flows, auth/domain changes or packages are added.

## Task 217 QA Hold/Release Inventory Link

Task 217 drafts `supabase/migrations/041_qa_hold_release_inventory_link.sql` with controlled `SECURITY DEFINER` functions for Stock On Hand hold availability, full-inventory-lot QA hold placement and release. The functions use fixed `search_path = public`, contain no dynamic SQL, derive actor/organisation context, require active membership, revoke public/anon execute and grant authenticated execute only. The Stock On Hand helper requires `stock_movements.view` and returns only `inventory_lot_id`, `is_held` and `active_hold_status`, so inventory users do not need `qa.holds.view` to receive correct held/available quantities.

The `/qa/holds` workspace now lists real QA holds, `/qa/holds/new` places a full-lot hold against a posted lot, and `/qa/holds/[id]` shows hold detail, source context, append-only event timeline and release controls. Receiving QA detail can place a formal hold only when a result recommends hold review and a posted inventory lot exists.

Stock On Hand now derives held quantity from active/release-requested formal QA holds while preserving physical quantity from posted stock movements. Inventory Traceability and Goods Inwards show linked QA hold context. Task 217 does not create partial holds, receipt-header holds, stock movements, stock adjustments/reversals, disposal/return workflows, production consumption/output logic, NC/CA workflows, direct client hold writes, auth/domain changes or packages.

## Task 218 Logistics Module Deep Planning

Task 218 is docs/planning only. It creates `docs/218-logistics-module-deep-planning.md` as the blueprint for the future Logistics module covering dispatch runs, delivery manifests, carrier/export handoffs, delivery issues, delivery zones, carton planning and future Detrack readiness.

The plan keeps Logistics from duplicating source records owned by Inventory, QA, Production, CRM, Support or Audit Logs. Inventory remains the source of physical stock and movement history, QA remains the source of hold state, Production remains the source of plan/batch records, CRM/future order records should own customer/account data, and Logistics should own dispatch/manifest records plus historical manifest snapshots.

Task 218 did not add routes, UI, schema, migrations, permissions, RLS policies, feature flags, Support guide content, Platform Admin diagnostics, carrier integrations, stock movements, auth/domain changes, middleware changes, app behaviour or packages. Its recommended Tasks 219-221 were subsequently completed, followed by Task 222 Carrier Configuration Foundation.

## Task 219 Logistics Navigation + Scaffold v1

Task 219 replaced the single Logistics placeholder with an honest tenant Logistics workspace scaffold. Task 221 later removed the duplicate Logistics Dashboard child because the `/logistics` parent owns that destination. The current Logistics submenu is Dispatch Runs, Manifests, Carrier Exports and Delivery Issues.

The new scaffold routes are `/logistics`, `/logistics/dispatch-runs`, `/logistics/manifests`, `/logistics/carrier-exports` and `/logistics/delivery-issues`. Each route uses existing app shell behaviour and the existing `logistics.view` permission. No role mappings are changed, so users without `logistics.view`, including `phase_1_demo_user`, remain blocked by the existing no-access behaviour.

The pages were deliberately empty/foundation states at Task 219. They did not show fake dispatch runs, fake manifests, fake carriers, fake delivery issues, KPI counts, Detrack connection status, manifest generation actions, export downloads or issue creation workflows. Support ticket page context distinguished the Logistics subroutes while keeping the route related path. Task 219 added no schema, migrations, server actions, API routes, carrier integrations, manifest generation, dispatch stock movements, Platform Admin changes, Support guide content, auth/domain/middleware changes or packages. Tasks 220-222 subsequently delivered the approved schema, workflow and carrier configuration foundations.

## Task 220 Dispatch Manifest Schema Foundation

Task 220 created and applied `supabase/migrations/042_dispatch_manifest_schema_foundation.sql`, documented in `docs/220-dispatch-manifest-schema-foundation.md`. The migration creates the minimum tenant-owned Logistics foundation for carriers, carrier services, dispatch runs, dispatch deliveries, dispatch lines, manifests, immutable manifest delivery/line snapshots and carrier export history.

Every new Logistics table has `organisation_id`, tenant-safe foreign key boundaries and RLS enabled. Policies use the existing active membership, platform admin and permission helpers. No anon policies or DELETE policies are created. Direct operational writes are active draft-only, direct manifest writes are draft-only, direct carrier export writes are pending-only and Platform Admin follows the same state restrictions. Manifest snapshot tables expose SELECT only; their INSERT path is withheld until task 221 adds a reviewed atomic generation function. Generated/failed history, immutable identity/parent fields and tenant-safe actor references are protected by trigger helpers.

The migration seeds granular permissions for dispatch runs, manifests, carrier exports, logistics configuration and future delivery issues. `phase_1_demo_user`, `staff` and `tablet_user` receive no new task 220 Logistics permissions. Existing broad `logistics.view` and `logistics.manage` permissions remain unchanged.

At Task 220, delivery issue operational tables, delivery zones, Task 221 UI, atomic manifest generation/snapshot creation, controlled dispatch lifecycle transitions, carrier export outcomes/files, carrier integrations, Shopify/order imports, stock allocation, stock movements, QA/stock dispatch blocking and audit events remained future work. Task 221 subsequently delivered the controlled UI and workflow; the other listed integrations remain future work. Correct live domains remain `app.everybatchmrp.com`, `admin.everybatchmrp.com`, `cleaneats.everybatchmrp.com` and `support.everybatchmrp.com`; do not use `admin.everybatchmrp.com.au`.

## Task 221 Dispatch Manifest UI v1

Task 221 replaces the Dispatch Runs and Manifests scaffolds with a real tenant workflow and documents it in `docs/221-dispatch-manifest-ui-v1.md`. Users can create authoritative numbered draft runs, manage draft delivery/item snapshots, run deterministic Logistics validation, explicitly mark the run ready, create/reopen a ready-run manifest draft, atomically generate immutable manifest delivery/line snapshots, view history and then mark the run dispatched.

Applied migration `supabase/migrations/043_dispatch_manifest_workflow.sql` introduces the controlled RPCs, fixed-search-path security boundaries, one-active-draft manifest index and strengthened source locking after generation. It removes direct run-header and manifest-header INSERT policies so authoritative numbers and versions cannot be bypassed; no role permissions are broadened. The live workflow passed draft creation, blocked and successful validation, ready locking, manifest generation, cancellation protection and dispatch transition.

Manifest generation requires an active ready run, so migration 042 draft-parent triggers have already frozen ordinary delivery/line editing. Draft cancellation remains allowed; ready cancellation is allowed only before a generated manifest exists. Generated manifest detail reads immutable snapshot tables rather than mutable dispatch sources.

Task 221 also removes duplicate QA Dashboard and Logistics Dashboard submenu entries because the clickable `/qa` and `/logistics` parents own those destinations. The final QA submenu exposes Receiving Checks, Production Checks, Daily Checks and Hold & Release; the final Logistics submenu exposes Dispatch Runs, Manifests, Carrier Exports and Delivery Issues. Carrier exports and delivery issues remain foundation-only. No carrier/API/Shopify/order connection, customer master, delivery zone/driver workflow, Inventory allocation, stock movement, Production link, QA dispatch block, Support write, audit business event, fake operational data, Platform Admin change or package is added.

The post-runtime Task 221 correction makes blocked validation feedback warning-toned and action-specific, groups delivery fields for responsive entry, and adds clear manifest-to-run navigation. It changes no migration, RPC, RLS policy, permission mapping or lifecycle rule.

## Task 222 Carrier Configuration Foundation

Task 222 adds real protected tenant routes at `/logistics/carriers`, `/logistics/carriers/new` and `/logistics/carriers/[id]` using migration 042's existing carrier/service schema, RLS policies, actor triggers and granular `logistics_configuration.view/manage` permissions. Authorised managers can create, edit and deactivate carriers and services, while view-only roles receive real read-only pages without disabled write controls. Service soft archive works and carrier archive is blocked while active unarchived services remain. Focused runtime testing found migration 042's shared configuration identity trigger accessed the service-only `NEW.carrier_id` field during carrier updates. Applied migration 044 splits carrier and carrier-service identity triggers without changing table schema, RLS, permissions, lifecycle rules or data. No delete path, seed provider, credential, secret, integration or export generation is added.

Draft dispatch forms now show only active, unarchived carriers and carrier-scoped active services, with the same relationship revalidated server-side. Historical dispatch references are not rewritten and retain readable carrier/service labels for configuration viewers. Logistics dashboard and Carrier Exports link to configuration, while Carrier Exports remains disconnected and foundation-only. The Logistics sidebar order and submenu are unchanged. Platform Admin UI and Support content are unchanged; support ticket context now identifies the carrier list, create and entity routes.

No migration, permission mapping, RLS, package or unrelated module change is included. Deferred non-blocking UI consistency work is recorded, not implemented: plan short canonical secondary-workspace routes for QA/Logistics with redirects, and add visible app-shell-preserving loading states to QA/Logistics routes.

Task 222, Carrier Configuration Foundation, is complete and committed. Migrations 039, 040, 041, 042, 043 and 044 are applied.

## Task 223 Roadmap And Project Context Realignment

Task 223 was documentation-only. It created `docs/223-276-revised-roadmap.md` as the active roadmap at that checkpoint, created `docs/CODEX_TASK_STANDARDS.md` as the permanent execution standard, and marked the former Tasks 201-250 sequence as historical. Task 225 later superseded its roadmap authority.

At the Task 223 checkpoint, the active sequence was Tasks 223-247 with Tasks 248-276 directionally approved, and the then-numbered Task 228 Facility/iPad View was decision-gated. Task 225 later superseded that numbering with the official Tasks 225-348 roadmap. New ideas still enter the unnumbered Future/Pending Task Register and do not alter official numbering without Luke's approval.

Task 223 changes no application code, route, navigation, migration, database, RLS policy, permission, package, operational data or runtime behaviour.

## Task 223A EveryBatch Master Handover And Living Knowledge System

Task 223A preserves the complete original architect dossier behind a non-canonical notice and creates the permanent reconciled handbook, engineering manual, Task Index, Decision Log, concise handover, capability matrix and source-of-truth matrix. Repository and Git evidence supersede the dossier for current implementation, especially QA Tasks 213-217, Logistics Tasks 218-222, migration 044 and the current sequence.

Task 223A records future multi-facility direction without schema; the Phase 1 requirement to replace the Clean Eats Shopify/Zapiet/CSV/Production Report/printed-pack workflow after parity and staff validation; an installable but provider-agnostic Shopify/order-source direction; inventory-aware planning without false physical movement; yield/variance direction; required area-specific production execution with unresolved device technology; and unresolved Recipes/formula/method/instruction ownership.

Task 223B, Phase 1 Production Replacement and Roadmap Reassessment, is committed at `f8f576603d97732d9fa1f29702fec78fccb05036`. Task 224 is committed at `8b8e94a87f6e94fef78c05317f87cad4bb01caea`. Task 225 is committed at `82a81613556c311198449670b0425106f062a4ef`, closes Review Gate 0 and makes `docs/225-348-official-roadmap.md` authoritative. Task 226 is committed at `36d53894579e0e8762d7ed441187e5c23552678e`; Task 227 at `fa59c928f8f94a2c320f53144c36d632a140e74c`; Task 228 at `bdd50b0d5890ea58306406d25854adc2d6d32c6c`; Task 229 at `800591a2947fa25f5675f80bc70a6473138ec126`; and Task 230 at `f424817e99990f34447c4822d9d86330b13a38f9`. Migration `045` implements the approved facility foundation and was manually applied through SQL Editor; its live objects/backfill exist, while migration-history reconciliation and browser smoke testing remain explicit follow-ups.

## Task 223B Phase 1 Production Replacement And Roadmap Reassessment

Task 223B verifies that EveryBatch has real formula, UOM, Goods Inwards, Stock On Hand, Production plan/batch, Receiving QA/hold and Logistics foundations, while external demand intake, demand freeze/deltas, legacy calculation/instruction parity, inventory allocation/transfer/staging, production task execution and production consumption/output remain missing. Current Production Report, Production Tasks and Facility/iPad surfaces do not replace the daily legacy workflow.

Luke-confirmed context records the Shopify/Zapiet filter, CSV export, meal aggregation, aggregated CSV, older Production Report configuration and printed room copies. Task 223B did not have the external evidence. Task 224 subsequently inspected both source archives, three raw exports, two cleaned workbooks and the matched 22-page PDF. The fixture reconciles 3,626 raw units to 3,614 report units after 12 identified parent-pack exclusions, with no unexplained quantity variance. Source order, line, store and date provenance is absent or discarded before the report.

The durable success criterion is daily Clean Eats planning and floor execution in EveryBatch without the current production tools/global print-pack dependency, after calculation/instruction parity, real production-day comparison, staff validation, fallback/support and explicit retirement approval. The approved Tasks 226-268 sequence now governs that programme, with architecture, demand, materials and readiness gates. No migration or runtime behaviour changed in Tasks 223B-225; Task 231 later created and manually applied migration `045`.

Task 224 finds that a controlled data-transition workstream is likely for approved current formulas, methods and instructions, but legacy source constants are not canonical and must not be imported directly. Import planning, staging/parser, mapping/review and controlled apply remain unnumbered until ownership, current source data, duplicate/UOM/item handling and staff validation are approved.

## Task 224 Production Replacement Evidence Audit

Task 224 records stable source fingerprints, privacy classification, raw-to-cleaned and cleaned-to-PDF reconciliation, store-specific cleanup behaviour, report calculations and presentation, legacy rule ownership, transition restrictions and parity fixtures. It verifies a 22-page report with 26 recognised production meal rows and a final requirement of 3,614 units for the matched 3 August 2026 production day.

The audit does not approve legacy formulas, yields, water additions, batch rules, mappings, methods, instructions, room routing or report constants as EveryBatch master data. The official roadmap now sequences those unresolved decisions and implementations through Tasks 226-268; approval of the sequence does not approve any legacy value or implement any capability.

## Task 225 Review Gate 0 Approval And Official Realignment

Luke approved the official Tasks 225-348 roadmap. Task 225 is documentation/governance only, closes Review Gate 0 and preserves earlier roadmaps as historical evidence. Tasks 226-230 completed the architecture phase, and Luke approved Architecture Gate 1 through the Task 231 prompt. Demand Gate 2 follows Task 237, Materials Gate 3 follows Task 251 and Production Replacement Readiness/Review Gate 4 follows Task 268.

Roadmap changes remain allowed only through explicit Luke approval and synchronized living-document updates. Codex and the product architect may recommend additions, splits, merges or resequencing but cannot make them silently.

## Task 226 Facility And Site Architecture Decision

Task 226 selects selective direct facility ownership with derivation. `organisation_id` remains the tenant/security boundary; a facility is an organisation-owned physical operational scope and is not a storefront, brand, domain or manufacturing customer. Organisation-wide suppliers, internal items, formulas, UOM rules and other master data are not duplicated per facility.

Migration `045_facility_schema_foundation.sql` creates facility identity/defaults, attaches `inventory_locations` and `production_areas`, and backfills direct facility identity on `inventory_receipts`, `production_plans`, `production_batches` and `logistics_dispatch_runs`. Children derive facility through stable parents. Inventory lots derive current distribution from movement locations rather than one mutable lot facility. QA templates remain organisation-wide; execution derives facility from its operational source, with direct scope added later for independent daily/manual checks.

Clean Eats remains a single-facility tenant with an automatically resolved default and no selector friction. Applied migration `045` created `Clean Eats Manufacturing Facility`, code `MAIN`, timezone `Australia/Melbourne`, country `AU`, with address left null. It adds no facility UI or selector; browser smoke tests passed. Task 232 adds only the unapplied provider-neutral Commerce schema that may reference a same-tenant facility.

## Task 227 Commerce Connections And Contract Manufacturing Architecture

Task 227 selects a staged external-business and accepted contract-manufacturing relationship model without adding schema. Provider key plus provider-assigned stable store ID is the durable storefront identity; order prefixes, labels and domains are metadata. CEA and CEW are separate Clean Eats-owned connections. Made Active remains the owner of its storefront and initially uses a narrow external business/manufacturing-customer identity rather than being forced into a full EveryBatch tenant.

Externally owned actionable intake requires both store-owner consent and target-manufacturer acceptance. A later Made Active tenant conversion links the same external identity instead of rewriting connection, order or manufacturing history. Internal items/formulas remain manufacturer-owned; provider products remain external; mappings and bundle/exclusion interpretations are connection plus manufacturer scoped, approved by the manufacturer and history preserving.

Connection business status and technical health remain separate. A default target facility may be incomplete during onboarding but is required before actionable demand, and it must belong to the target manufacturer under Task 226. Customer data is minimised: Production receives manufacturing fields, Logistics receives reviewed delivery fields, CRM owns richer customer/account truth later, and Support/Platform Admin receive safe diagnostics only.

Task 227 added architecture only. Tasks 228-230 completed provider-neutral order/demand, Shopify security and calendar/routing architecture; Task 231 delivered the live facility prerequisite. Task 232 now drafts migration 046 with provider-neutral Commerce connection, authority and source-evidence tables/RLS, but no provider runtime, records, mappings or demand.

## Task 228 External Order Intake And Production Demand Architecture

Task 228 selects a deliberate source-evidence-plus-versioned-interpretation model without adding schema or runtime. Provider IDs and material observations are retained; a controlled current order/line projection supports operations without requiring full event sourcing. Exact event delivery and protected-data mechanics remain Task 229.

One source line may produce zero, one or many immutable interpretation/contribution revisions. Exact mapping and bundle/exclusion rule versions, source and contributed quantities, store/brand/channel/manufacturing-customer attribution, target organisation, facility and production date remain traceable. Excluded and unresolved lines remain visible. A selected-current contribution projection prevents historical revisions from being double counted.

Live demand is recalculable by organisation, facility, production date, internal item and compatible unit. Review captures a candidate/watermark and becomes stale on material changes. Freeze creates immutable snapshot headers, lines and source-contribution links. No ordinary unfreeze exists: pre-start corrections use controlled supersession, while post-freeze source changes become signed deltas with explicit decisions. Manual adjustments remain separate, authorised and reversible through append-only evidence. Production Plans consume frozen demand through explicit allocation links.

Production Demand must not contain broad customer PII. Platform Admin and Support receive only redacted operational diagnostics; later Logistics/CRM boundaries own delivery/contact and customer-account detail. Task 232 adds privacy-minimised source-order/line schema only. Production contributions, live/reviewed/frozen demand and plan links remain Tasks 236-237.

## Task 229 Shopify App Architecture And Security Plan

Task 229 uses current official Shopify documentation to select a publicly distributed, App-Store-reviewed production app capable of unrelated-merchant installation. The controlled initial rollout uses limited App Store visibility where current policy permits and may become fully visible only through later Luke approval. Custom distribution is rejected for production and separate development, staging and production registrations/configurations are required.

The selected experience is hybrid: a minimal embedded Shopify Admin surface handles merchant authorisation, claim/status/privacy and disconnect/reconnect, while EveryBatch owns manufacturer acceptance, facility, mappings, calendars, source exceptions and Production Demand. Made Active authorises its own store and receives no Clean Eats tenant membership. Shopify-managed installation, verified session tokens/token exchange and encrypted per-store expiring offline access/refresh credentials are the direction; persistent online tokens are not required for Phase 1.

Phase 1 proposes read-only `read_orders` and `read_products` only, with `read_all_orders` deferred unless an approved history window exceeds Shopify's default 60 days. Orders and order webhooks remain protected customer data even when direct fields are omitted. Name, email, phone, addresses and postcode/location are excluded until a proven later need, protected-data approval and legal/privacy confirmation.

GraphQL Admin API is primary, pinned to a suitable stable version at Task 233 start with quarterly governance, cost/error/userError handling and bulk queries only for justified backfills. Verified raw-body-HMAC webhooks commit durable jobs before fast acknowledgement; an asynchronous worker performs normalization/API calls. Duplicate, stale, missed and out-of-order events are handled through idempotency plus authoritative reconciliation. Raw payloads and bulk URLs are not retained unrestrictedly.

Task 233 implements the staged local foundation in this repository: dedicated `/api/integrations/shopify/*` routes on an allowlisted app host, environment-specific Shopify configuration templates, official `@shopify/shopify-api` `13.1.0`, GraphQL Admin API `2026-07`, application-key AES-GCM credentials behind service-role-only persistence, verified reference-only webhooks, durable database jobs and a bounded manual worker endpoint. The worker derives its environment only from trusted server configuration, fails closed when missing/invalid and passes it to service-role-only claim/completion RPCs that scope lease recovery and every mutation to that environment. Migrations 047 and 048 are live/registered. Post-deployment testing found that `/integrations` selected obsolete facility aliases and `/shopify` was not admitted as a tenant route; the pending correction uses `facilities.name`/`code`, structured safe readiness states and a read-only permission-gated tenant setup surface while preserving embedded Shopify session validation. The worker has no production scheduler; no Shopify app is registered, reviewed, installed or connected and no protected customer data has been imported.

## Task 230 Delivery Zones, Calendars And Production-Date Architecture

Task 230 selects organisation-owned zones with normalized exact-postcode membership as the initial deterministic resolver and explicit region/state metadata. Postcode remains optional restricted/protected input: trusted delivery-date/region evidence may support manufacturing assignment without retaining postcode where the published rule permits. Customer-facing delivery services remain separate from Logistics-owned carriers/carrier services and may map to them through effective-dated configuration.

Delivery and production calendars use reviewed, immutable published versions with explicit effective periods, recurring rules, exact-date exceptions, cutoffs, blackouts and manually reviewed holiday inputs. Production assignment is delivery-date-driven, supports several delivery dates/regions/storefronts feeding one production date/facility, and retains source/parser/rule/version evidence. Open assignments revise, reviewed demand stales and frozen demand never changes in place.

The current Clean Eats Monday/Tuesday/Thursday patterns are Luke-confirmed operating examples requiring staff validation before future tenant configuration; no postcode, cutoff, courier, service, holiday, capacity or Zapiet key is invented. Zapiet parsing is connection-specific and versioned. Capacity and customer-facing Shopify calendar replacement remain Future/Pending.

The Gate 1 package finds Tasks 226-230 coherent and recommends readiness for Luke/product-architect review with non-blocking evidence follow-ups. It does not approve the gate. Task 231 and all later implementation remain blocked; no schema, migration, code, route, permission, RLS, package, data or live system changed.

## Task 235 Delivery Configuration And Production Auth Correction

Task 235 is committed at `8d9059c31c11e7019bf610c031b3433cff7ee03b`. Migration 050 is live/registered as `20260805035435 delivery_calendar_production_date_foundation`; database verification passed and all delivery/Commerce/Shopify operational tables remained empty. The deployed Shopify and delivery routes rendered correctly before repeated authenticated navigation produced eight Supabase Auth `429 over_request_rate_limit` failures.

The root cause is request amplification, not delivery schema or tenant queries: production prefetch rendered seven Shopify workspace links, six configuration cards and dense shell navigation as independent Server Component requests, each of which correctly performed one network-backed `auth.getUser()` verification. Server client creation was not reused within a request, the browser helper created a new client per call, and Support alone used a host-only cookie instead of the shared `.everybatchmrp.com` session. The previous `getCurrentUser` also converted every Auth error into `null`, allowing a 429 to become false login, no-access or zero-data state.

The request-amplification correction is deployed at `9982a4ee41886702337afc6f3b80947d106155f3` and passed three complete authenticated production navigation cycles without Auth 429, false routing, zeroed summaries or session loss. One isolated `GET /` at `2026-08-05 23:59:00 UTC` then returned 500 with status 400/code null. Historical Vercel logs cannot identify its host, request kind, cookie presence or original Auth message. The strongest installed-client match is `AuthSessionMissingError` (`400`, no code), which the prior classifier omitted.

The final repository correction classifies exact missing/stale/expired session evidence as signed out; preserves 429/network/timeout/5xx as temporary; keeps malformed configuration/request evidence distinct; and leaves unknown 400 responses unexpected. Root requests now route deterministically before protected destinations: marketing to central login, central to workspace selection, tenant to Dashboard, Platform Admin to `/platform`, Support by internal rewrite, local/preview to Dashboard and unknown hosts to login. Protected destinations still perform verified Auth. Failure-only structured diagnostics contain no Auth message, cookie value, token, header or PII. RLS, active membership, exact permissions, cross-domain cookie scope, direct-route guards, host isolation and service-role boundaries remain unchanged. The correction subsequently passed production browser acceptance and unblocked Task 236.

## Task 236 Production Demand Contributions

Task 235 is production accepted across commits `8d9059c31c11e7019bf610c031b3433cff7ee03b`, `9982a4ee41886702337afc6f3b80947d106155f3` and `f57f2b14ac6774628c3bbb4f45dc7ffc1714dd8c`. Migration 050 is live/registered as `20260805035435 delivery_calendar_production_date_foundation` with zero operational rows.

Task 236 adds live/registered Migrations 051 and 052 plus the canonical `/production-demand` workspace. The model generates append-oriented source-line contributions only from approved direct or bundle outputs and a resolved delivery interpretation. Explicit exclusions produce no demand; missing, ambiguous, inactive-item, UOM and source-state evidence remains visible as safe issues. Current live demand is a stable projection grouped by organisation, facility, production date, internal item and exact UOM, with full source lineage retained in contribution history. Migration 052 preserves this model and only schema-qualifies the two pgcrypto fingerprint calls. The complete rollback-only suite and route-isolation browser acceptance passed and left all four operational tables empty.

The initial production deployment at `abede6d8596f4da9995c23586f0f70d55cb15efe` exposed a host-classification omission rather than a demand/runtime failure. Commit `f344b4ca9a5262b4e7d6967e6ec0c02b0cbe8021` added `/production-demand` once to the shared canonical list; deployment/browser verification passed across tenant, central, Platform Admin and Support hosts. Task 236 is production accepted.

Tenant recalculation is limited to active members with `production.manage`; reads require active membership and `production.view`. A separate service-role worker entry point exists for future trusted connector orchestration and is not used by tenant UI. The internal source-line generator remains closed. Task 237 now owns review/freeze/delta behavior while preserving Task 236 source and live-projection ownership.

## Task 237 Production Demand Review, Freeze and Delta

Migration 053 creates ten tenant tables: review headers, immutable lines/contribution/issue evidence, source-line commitment owners, external commitment context, cumulative delta versions/source/aggregate evidence and append-only events. One owner is enforced per organisation/source line. Review base contains only unowned contributions; base plus external context must reconcile to full live demand. Exact SHA-256 fingerprints include ownership identity/origin alongside deterministic evidence.

Every human mutation uses an authenticated `SECURITY DEFINER` RPC that derives actor/tenant evidence, requires active membership and `production.manage`, and exposes no client quantity/fingerprint/source-array input. Reads use existing `production.view`. New tables are RLS-enabled with authenticated SELECT-only grants and no Platform Admin or Support bypass. Demo remains read-only.

Freeze is irreversible and atomically claims base source lines in deterministic order. Owned lines remain with that review across scope movement; another review records them only as external context. Late unowned lines are claimed only by approved cumulative deltas. Live immutable Migration 053 closes the stale-evidence race with the shared organisation transaction barrier. Live immutable Migration 054 repaired the confirmed DISTINCT/casted-order `42P10` defect in freeze and delta approval. Freeze then failed atomically with PostgreSQL `42804` when the frozen-base ownership `SELECT DISTINCT` inferred its bare NULL as text for UUID column `first_approved_delta_version_id`; live immutable Migration 055 corrects that expression to `null::uuid`. Full production rollback-only lifecycle, real independent-session concurrency and browser verification passed. The disposable `task-237-concurrency-verification` Supabase branch was created with explicit approval, used only for synthetic evidence, never merged/rebased, and deleted after testing. Production remained clean. Task 237 is production accepted at `13a5f1b4aca93f0f2fbb38dd256ec5968044ef67`; Production Plan allocation remains deferred.

## Task 238 Tools And Production Import Ownership

Tools is a permanent mixed utility module with strict domain ownership boundaries. Supplier Invoice Intake is the current permanent utility and owns its document/extraction/commit evidence, while resulting suppliers, items, mappings and approved prices remain owned by Products or the commercial master consumed by Costings.

Future Production Data Import is a dedicated tenant-owned import/staging domain governed by Production and may be surfaced through Tools. It owns source metadata, parser runs, staged revisions, validation/mapping/review/apply/reconciliation evidence and retained import history. Parser code is platform implementation; tenant parser/source/retention configuration belongs to Tenant Admin. Controlled apply must use trusted target-domain mutation boundaries, so canonical Products records remain Products-owned and canonical Production records remain Production-owned. Platform Admin receives redacted readiness only; Support receives minimum necessary redacted diagnostics.

No Production import implementation, staging schema, parser, storage bucket, permission or Migration 056 exists. Task 238 is committed at `e23024761f1197997b100a4e26cd401c0f19330a`. Tasks 240-243 must preserve the ownership rules in `238-tools-module-review-production-import-ownership.md` and `TOOLS_AND_PRODUCTION_IMPORT_OWNERSHIP_MATRIX.md`.

## Task 239 Production Knowledge Ownership

Task 239 defines Formula/BOM as the Products-owned versioned composition of a Component or Finished Product. Recipe is a permission-aware presentation of approved Formula, compatible Production Method and linked Work Instruction versions, not a canonical table. Production owns independently versioned Methods, Method Steps and Work Instructions; execution records remain separate and later pin exact knowledge versions.

## Task 240 Approved Production Data Collection

Task 240 specifies one controlled multi-tab Clean Eats package, stable human transition keys, mandatory field provenance, separate workflow/evidence/confidence states, role-based collection responsibility, blocker-driven readiness and eight transition waves. Formula nominal output, process yield, batch envelope, Method, Work Instruction, QA linkage, Packaging context and water/process classification remain distinct. The workbook is evidence only. Task 241 may create tenant-owned staging after Task 240 commit; Formula apply waits for lifecycle hardening and Method/WI apply waits for Task 244. No importer, parser, upload, bucket, schema, data or Migration 056 exists.

Formula output quantity is a composition basis. Expected process yield/loss and process batch envelopes belong to Method Version; planned/actual quantities and actual consumption belong to Production execution evidence. The current Formula schema is directionally canonical but approval immutability, indirect-cycle prevention, child-version pinning and ambiguous `expected_yield_*` semantics require later hardening before imported approved/current Formulas are activated. No Method/WI schema or runtime behavior is added. See `239-formula-method-work-instruction-recipes-ownership-decision.md`, `PRODUCTION_KNOWLEDGE_CONCEPT_MODEL.md` and `FORMULA_METHOD_WORK_INSTRUCTION_RECIPE_OWNERSHIP_MATRIX.md`.
