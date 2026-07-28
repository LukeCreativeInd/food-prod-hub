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
- `admin.everybatchmrp.com.au` for future Platform Admin
- `support.everybatchmrp.com` for support and knowledge base

Current domain setup:

- `app.everybatchmrp.com` is live and validated in Vercel
- Cloudflare DNS is active with `CNAME app -> b560eb64065fe2f1.vercel-dns-017.com`
- Cloudflare proxy remains DNS only
- the Vercel production URL currently redirects to `app.everybatchmrp.com`, but remains available in Vercel if needed
- login and dashboard smoke tests passed on `app.everybatchmrp.com`
- do not point `everybatchmrp.com` root to the tenant app; reserve it for marketing or a coming-soon page
- do not connect `cleaneats.everybatchmrp.com` until tenant workspace host routing is implemented
- do not connect `admin.everybatchmrp.com.au` until Platform Admin domain routing is explicitly implemented
- do not connect `support.everybatchmrp.com` until the support/knowledge-base target exists
- do not change Vercel, DNS, Supabase Auth redirect URLs or env vars from a code task without explicit user instruction

Task 123 domain connection is complete. `app.everybatchmrp.com` is the first stable EveryBatch app/login URL.

Tenant subdomain routing target:

- `app.everybatchmrp.com` is the central login / tenant selector.
- `{tenant_slug}.everybatchmrp.com` is the tenant workspace pattern.
- `cleaneats.everybatchmrp.com` is the target Clean Eats workspace.
- `admin.everybatchmrp.com.au` is the preferred Platform Admin target.
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
- Authenticated app shell users have a `Switch workspace` entry in the user dropdown that links to `/select-workspace`.

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

Inside tenant workspaces, tenant branding should remain prominent. EveryBatch can appear as a subtle trust layer, such as "Powered by EveryBatch".

Platform/admin surfaces should use EveryBatch branding.

EveryBatch brand constants live in:

```text
lib/platform-brand.ts
```

Use these constants for user-facing platform copy where appropriate. Do not make routing/domain decisions depend on them until tenant subdomain routing is explicitly implemented.

The first Help & Support menu links to future `support.everybatchmrp.com` paths through static constants only. It is not a support backend, ticketing system, route-specific guide engine or support impersonation flow.

Platform Admin should eventually live at:

```text
admin.everybatchmrp.com.au
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

`/platform` and `/platform/tenants/cleaneats` now render inside a dedicated EveryBatch Platform shell instead of the tenant AppShell/sidebar. The future `admin.everybatchmrp.com.au` domain remains inactive until a reviewed routing/domain task connects it.

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

Current mappings include `app.everybatchmrp.com` as `central_app`, `admin.everybatchmrp.com.au` as the preferred `platform_admin` host, `cleaneats.everybatchmrp.com` as `tenant_app` with tenant slug `cleaneats`, `support.everybatchmrp.com` as `support`, root EveryBatch domains as `marketing`, and localhost/Vercel deployment hosts as `local_dev` style fallbacks. No DNS, Vercel, Supabase Auth, middleware, production redirects, tenant subdomain activation, migrations, RLS, permissions, route moves or business logic changes are included.

## Task 155 Platform Admin App Mode Guarding

Task 155 adds lightweight middleware for the planned Platform Admin host. When the host resolves as `platform_admin`, `/` and tenant workspace routes redirect to `/platform`, while `/login`, `/select-workspace`, `/no-access`, `/platform/*`, assets and Next internals remain allowed.

Local development and Vercel deployment hosts remain permissive. `app.everybatchmrp.com` central app behaviour remains unchanged, including temporary `/platform` access while the admin domain is not live. Tenant app host enforcement for `cleaneats.everybatchmrp.com` remains deferred. No DNS, Vercel, Supabase Auth, database, migration, RLS, permission, tenant subdomain activation, route move or business logic changes are included.

## Task 156 Platform Admin Domain Setup

Task 156 documents the manual setup path for `admin.everybatchmrp.com.au`. The setup guide covers Vercel domain add steps, Cloudflare DNS requirements, Supabase Auth redirect URL review, signed-out/platform-admin/demo-user smoke tests and rollback notes.

No DNS, Vercel, Supabase Auth, database, migration, RLS, permission, tenant subdomain routing, Clean Eats host enforcement, route move, UI polish or business logic changes are included. `app.everybatchmrp.com` remains the live central app domain, and `platform.everybatchmrp.com` remains legacy/optional planning language only.

## Task 157 Platform Admin Brand/UI Polish

Task 157 applies the EveryBatch brand direction to the separated Platform Admin shell and `/platform` overview. Platform Admin now uses the EveryBatch Operator Console language, Food Manufacturing OS product line, dark green/lime platform palette and refined Platform Admin badges/cards. The Platform shell header uses the shared page-title helper so it shows the current Platform route title. Platform subpages no longer start with full-width dark hero blocks; they now use compact light context callouts, badges, summary cards, tables or forms so the persistent header is the single page header. The Platform Admin sidebar now follows the tenant app sidebar structure more closely with grouped icon-led rows, longest-route child active matching, single-open accordion behaviour and desktop collapse/expand behaviour, while the mobile Platform menu remains accessible and closes after live navigation clicks.

No tenant app shell, tenant navigation, auth, middleware, DNS, Vercel, Supabase, RLS, permission, migration, provisioning action or business module behaviour changes are included. The EB mark remains a temporary placeholder until a final EveryBatch logo/icon asset is provided.

## Task 158 Tenant Subdomain Routing v1

Task 158 activates the first Clean Eats tenant subdomain guard in code. `cleaneats.everybatchmrp.com` resolves as `tenant_app` with tenant slug `cleaneats`; `/` and `/platform/*` redirect to `/dashboard`, while tenant app routes, `/login`, `/select-workspace` and `/no-access` remain allowed.

This is static Clean Eats-only v1 routing. Middleware does not read Supabase sessions or query the database. `app.everybatchmrp.com`, `admin.everybatchmrp.com.au`, localhost and Vercel preview behaviour remain unchanged. No DNS, Vercel, Supabase Auth settings, schema, migration, RLS, permission, tenant provisioning, Platform Admin business logic, tenant sidebar or business module changes are included.

## Task 159 Multi-Domain Smoke Test and Redirect Hardening

Task 159 adds a multi-domain smoke-test checklist covering `app.everybatchmrp.com`, `admin.everybatchmrp.com.au`, `cleaneats.everybatchmrp.com` and localhost. It also hardens inactive tenant-looking subdomains so only the active Clean Eats tenant host can render tenant workspace routes in v1; other tenant subdomains allow public auth/static routes only and redirect app routes to `/login`.

The final task 159 routing fix redirects `app.everybatchmrp.com/platform` and `/platform/*` to the same path on `https://admin.everybatchmrp.com.au`, redirects `cleaneats.everybatchmrp.com/select-workspace` to `/dashboard`, and keeps localhost permissive for development. A local stale refresh-token login warning was documented as a known dev/session issue for future auth hardening if it recurs.

No DNS, Vercel, Supabase Auth, database, migration, RLS, permission, business logic, sidebar or design changes are included.

## Task 160 Live Multi-Domain Smoke Test Results

Task 160 records live signed-out/header smoke test results after deploying the domain routing work. `app.everybatchmrp.com` and `cleaneats.everybatchmrp.com` resolved and returned the expected redirects for central login, central Platform Admin redirect, Clean Eats tenant root, tenant workspace selector and tenant Platform Admin blocking.

`admin.everybatchmrp.com.au` did not resolve from the Codex environment during task 160, so admin-domain live checks are recorded as requiring manual verification in Luke's browser/network and Vercel/Cloudflare. `app.everybatchmrp.com/dashboard` returning `200` is documented as a temporary Clean Eats fallback behaviour, with task 161 queued for Central App Tenant Redirect Hardening. No code, DNS, Vercel, Supabase Auth, schema, migration, RLS, permission, business logic, sidebar or design changes are included.
