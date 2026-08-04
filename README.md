# EveryBatch / Clean Eats Hub

EveryBatch is a Food Manufacturing OS for modern food manufacturers. Clean Eats Hub is Tenant 1/customer workspace and currently guides the first platform foundation work. Food Prod Hub remains the internal repo/project name for now.

## Project Overview

The platform is intended to support food manufacturers with one operating hub and modular workflows. Clean Eats is Client 1, but the codebase should be planned so future clients can use configurable modules without client-specific forks.

The current app includes the foundation for an internal operations hub: app shell, grouped module navigation, Tailwind CSS styling, Supabase auth/RLS foundations, real data scaffolds and conservative first-pass costing/margin previews. Broader production business logic, automation and complex operational workflows remain intentionally scoped for later reviewed tasks.

## EveryBatch Brand Direction

EveryBatch is now the real platform/product brand. Food Prod Hub remains the internal repo/project name for now, and Clean Eats Hub is Tenant 1/customer workspace powered by EveryBatch.

Purchased domains:

- `everybatchmrp.com`
- `everybatchmrp.com.au`
- `everybatch.com.au`

Target domain architecture:

- `everybatchmrp.com` for the future public marketing site
- `app.everybatchmrp.com` for central login and workspace selection
- `cleaneats.everybatchmrp.com` for the Clean Eats tenant workspace
- `admin.everybatchmrp.com` for Platform Admin
- `support.everybatchmrp.com` for Support and Help Centre

Start with the [current chat handover](docs/CHAT_HANDOVER_CURRENT.md), then the official [Tasks 225-348 roadmap](docs/225-348-official-roadmap.md), [Codex task standards](docs/CODEX_TASK_STANDARDS.md), [Master Handbook](docs/EVERYBATCH_MASTER_HANDBOOK.md), [Engineering Operations](docs/EVERYBATCH_ENGINEERING_OPERATIONS.md), [Capability Matrix](docs/CURRENT_PLATFORM_CAPABILITY_MATRIX.md), [Source-of-Truth Matrix](docs/MODULE_SOURCE_OF_TRUTH_MATRIX.md), [Decision Log](docs/DECISION_LOG.md) and [Task Index](docs/TASK_INDEX.md). The [original architect dossier](docs/history/ORIGINAL_ARCHITECT_MEMORY_DOSSIER.md) and earlier roadmaps are non-canonical historical evidence only.

## Current Status

- Latest completed task after the current changeset is committed: Task 230, Delivery Zones, Calendars and Production-Date Architecture
- Task 223A commit: `a8c2761`
- Task 223B commit: `f8f576603d97732d9fa1f29702fec78fccb05036`
- Task 224 commit: `8b8e94a87f6e94fef78c05317f87cad4bb01caea`
- Task 225 commit: `82a81613556c311198449670b0425106f062a4ef`
- Task 226 commit: `36d53894579e0e8762d7ed441187e5c23552678e` (`Decide facility architecture`)
- Task 227 commit: `fa59c928f8f94a2c320f53144c36d632a140e74c` (`Define commerce manufacturing architecture`)
- Task 228 commit: `bdd50b0d5890ea58306406d25854adc2d6d32c6c` (`Define order intake and demand architecture`)
- Task 229 commit: `800591a2947fa25f5675f80bc70a6473138ec126` (`Plan Shopify app architecture and security`)
- Task 230 suggested commit title: `Define delivery and production calendar architecture`; exact hash to be backfilled by the first task approved after Architecture Gate 1
- Review Gate 0 is closed; the [Tasks 225-348 roadmap](docs/225-348-official-roadmap.md) is authoritative
- Current project stage: Architecture Gate 1 review; no implementation task is approved until Luke/product-architect review
- Tasks 226-230 form the completed architecture phase; Task 231 remains blocked
- Task 226 selects organisation-owned facilities with selective direct operational-root ownership and stable parent derivation; no facility schema or UI is implemented
- Task 227 selects a staged external-business and accepted contract-manufacturing relationship model: CEA/CEW remain Clean Eats-owned, Made Active remains externally owned, and no commerce schema or connector is implemented
- Task 228 selects provider-neutral source evidence plus versioned interpretation/contributions, recalculable live demand, reviewed demand, immutable frozen snapshots, explicit deltas and source-to-plan traceability; no commerce or demand schema/runtime is implemented
- Task 229 selects a publicly distributed, App-Store-reviewed Shopify app with initial limited visibility where current policy permits, a minimal embedded merchant surface plus EveryBatch operations, Shopify-managed installation, expiring offline credentials, least-privilege read-only Phase 1 scopes, verified asynchronous webhooks and mandatory reconciliation; no app, schema or connector is implemented
- Task 230 selects organisation-owned exact-postcode zones, separate customer delivery services and Logistics carriers, immutable effective-dated delivery/production calendars, connection-specific Zapiet parsing and versioned facility/production-date assignments; no zone, calendar, parser or engine is implemented
- Commerce business status and technical health remain separate; provider/store identity cannot rely on order prefix, display label or domain alone
- Earlier roadmaps remain preserved as superseded historical evidence
- The app shell now contains a mix of real operational foundations and explicitly honest future/empty workspaces
- Design direction is Clean Eats-inspired while platform planning remains reusable
- Documentation has been added for product direction, architecture, roadmap, development standards, release process, discovery notes, and Codex working rules
- Supabase Auth helper foundation and basic login/logout UI exist
- First admin setup instructions exist, but no users or memberships are created by the app yet
- Auth context helpers can resolve profile, Clean Eats membership, organisation and permissions after manual setup exists
- Dashboard includes a small auth context status card for setup verification
- Basic Supabase Auth route protection is enabled for app pages
- `/login` uses a standalone public auth layout; protected pages use the app shell/sidebar
- Protected app pages require a valid profile, active Clean Eats membership, and active organisation context
- Selected admin/configuration routes now require matching view permissions
- Sidebar hides selected admin/configuration links when matching permissions are missing
- Sidebar hides module links when the current organisation does not have that module enabled
- Auth/navigation foundation review is complete; detailed RLS planning has started
- RLS helper functions have been created and manually applied
- First foundation RLS SELECT policies have been manually applied and tested successfully
- RLS helper function search path hardening has been manually applied and tested successfully
- Roles/permissions RLS SELECT policies have been manually applied and tested successfully
- Audit logs RLS SELECT policy has been manually applied and tested successfully
- All current public database tables now have RLS enabled
- RLS foundation review is complete; the next recommended build phase is Products/UI Foundation
- Products/UI Foundation planning has been added for the next visible build phase
- First global visual polish pass has been added for app shell, login, dashboard and placeholder pages
- Sidebar follow-up refinements now use a light mockup-aligned shell with expandable module sections
- Sidebar navigation now separates Production, Inventory, QA, Logistics, CRM and Reports into top-level modules
- Sidebar duplicate overview child links have been removed; parent modules now act as overview links
- Products module UI skeleton has been added using sample data only
- Staff review pack for the Products/UI foundation has been prepared
- Staff meeting outcomes now prioritise Phase 1 demo modules for Products, Costings, Production and Inventory
- Costings module UI skeleton has been added using sample data only
- Costings demo pages now include Ingredient Costs, Packaging Costs and Component Costs
- Products navigation now follows the staff meeting data order: Suppliers, Ingredients, Packaging, Components, Recipes, Finished Products
- Production module UI skeleton has been added with report, plan, task and facility/iPad previews
- Inventory module UI skeleton has been added with goods inwards, batch, movement, purchasing and BOM/traceability previews
- Dashboard has been refreshed as the Phase 1 demo landing page for staff review
- Demo/test user access planning has been added before any staff demo user is created
- Phase 1 demo user role seed migration has been drafted for review
- Module-level permission-aware navigation has been added for non-admin modules
- Module-level route permission guards now align direct URL access with sidebar visibility
- Demo/test user manual setup guide has been added for controlled Supabase setup
- Staff demo review round has been documented for Phase 1 feedback
- Staff feedback capture and Phase 1 review tracker has been added
- Performance and hosting architecture review has been added for Vercel/Supabase planning
- Auth context and navigation query audit has been added for performance optimisation planning
- Auth context query flow now uses request-level caching to reduce duplicate protected-route lookups
- Hosting region and Vercel/Supabase configuration checklist has been added before hosting decisions
- Vercel Speed Insights instrumentation has been added for deployed performance metrics
- Module registry alignment review has been added before master admin module controls
- Module registry cleanup plan recommends no immediate DB cleanup before master admin planning
- Master Admin Portal planning has been added for future platform/global tenant management
- Read-only Platform Admin skeleton has been added at `/platform`
- Read-only Clean Eats tenant detail skeleton has been added at `/platform/tenants/cleaneats`
- Tenant creation and provisioning planning has been added before any create/edit tenant flows are built
- Billing and subscription planning has been added before any payment provider or billing UI work
- Commercial platform architecture and domain model planning has been added before domain/routing changes
- Naming and brand direction planning has been added before domain checks, logo work or public website branding
- Platform Admin v1 build planning has been added before further Platform Admin functionality
- Platform Admin v1 design polish has been applied to `/platform` and `/platform/tenants/cleaneats`
- Purchase Document Intake v1 foundation has been drafted for reviewed supplier invoice onboarding
- Purchase Document Intake now has real saved document list, Cammaroto sample creation and review-progress save actions
- Purchase Document Intake now has a controlled Cammaroto sample commit flow for reviewed supplier/item/price reference records
- Purchase Document Intake wording has been generalised and action/loading feedback has been added
- Generic invoice extraction and commit planning has been added before building upload, OCR or generic commit automation
- Purchase Document upload and extraction foundation has been added with private storage planning and reviewed upload flow
- Cammaroto extraction now handles supplier-specific embedded PDF text decoding and remains review-first
- Purchase Document extraction now has a parser registry and unknown-invoice diagnostics for future supplier parsers
- Melbourne Produce Merchants invoice extraction has been added as the second supplier-specific parser, with repeat Fresho invoice support for `F56478121`
- Generic Purchase Document commit now supports reviewed supported-parser documents, including Cammaroto and Melbourne Produce, without creating stock movements
- Del-Re National Food Group invoice extraction has been added as the third supplier-specific parser
- Pacific Meat Sales invoice extraction has been added with a narrow no-text PDF filename fallback for known invoice `928733`
- Alba Cheese invoice extraction has been added as a supplier-specific parser for known invoice `SO148136`
- Grange Meat Co invoice extraction has been added for known invoice `349708`, with delivery/comment lines excluded from ingredient costing
- Il Nonno invoice extraction has been added for known invoice `INV-6136`, with delivery-note duplicate lines excluded
- Supplier Invoice Intake now lives under the new Tools module while keeping the `/purchase-documents` route
- Performance route loading skeletons and deferred Purchase Document source PDF preview loading have been added for `/dashboard`, `/inventory` and Supplier Invoice Intake routes
- Products now has a real read-only operational dashboard using tenant supplier, catalogue, internal item, price and formula data
- Suppliers now support basic manual create/edit for authorised users while demo users remain read-only
- Ingredients and Packaging now support basic manual internal item create/edit for authorised users while demo users remain read-only
- Inventory Locations foundation has been drafted with tenant-scoped location records and real Stock Locations list/create/detail UI
- Costings dashboard now shows real read-only price coverage, recent price records and formula readiness summaries
- Costings subpages now show real tenant-scoped ingredient, packaging, formula and price observation data where available
- Legacy nested Costings subpage URLs now redirect to the active top-level Costings routes, and duplicate Costings content headings have been removed
- Component / Formula Import Foundation planning now maps Clean Eats staff workbook columns to the current formula schema before any upload/parser/import work
- Production dashboard now shows real read-only setup readiness from locations, formulas and internal item data where available
- App shell, navigation order and tenant branding have been polished as UI Overhaul v2 Part A
- Dashboard, cards, Inventory overview, source document wording and invoice review table wrapping have been polished as UI Overhaul v2 Part B
- Organisation Settings now includes tenant logo URL, theme colour and light/dark mode management as UI Overhaul v2 Part C
- Organisation Settings now supports private tenant logo upload/remove and completed branding controls as UI Overhaul v2 Part D
- Speed and performance overhaul has started with app-shell context consolidation, permission-call cleanup and targeted route/RLS indexes
- Loading and route transition UX now keeps the protected app shell visible and uses compact centred branded workspace loaders instead of large full-page skeleton grids
- Global search foundation has been added to the top header with tenant-scoped, permission-aware grouped results, including supplier item searches through confirmed internal item mappings
- EveryBatch brand and domain architecture has been documented before any code/domain/routing changes
- Multi-tenant platform architecture and update strategy has been documented before feature flags, tenant subdomains or Platform Admin separation are implemented
- Platform Admin separation has been planned before moving Platform out of the tenant app shell
- Tenant subdomain routing has been planned before middleware, domain configuration or login routing changes are implemented
- EveryBatch brand foundation has been applied to platform metadata, login/auth copy, subtle tenant shell trust-layer wording and Platform Admin copy
- App header titles now appear in the persistent top bar, and major workspace page headers have been compacted to reduce wasted content space
- The app header now includes a Help & Support menu linking to future EveryBatch support resources
- The login page now uses reusable EveryBatch platform/tenant branding components while preserving the existing auth behaviour
- Feature flag foundation has been drafted with global registry, Clean Eats overrides, RLS policies and server-side helpers
- EveryBatch domain setup and environment planning now records `app.everybatchmrp.com` as live while holding root, tenant, platform and support domains
- `app.everybatchmrp.com` is live and validated in Vercel with Cloudflare DNS active and login/dashboard smoke tests passed
- Tenant resolver foundation helpers now parse EveryBatch hostnames and prepare tenant slug lookup without activating host-based routing
- Central login and tenant selector planning now defines future post-login workspace selection, platform-admin access and safe redirect rules
- Workspace options helper foundation now prepares server-side workspace choices and post-login destination guidance without changing login redirects
- Tenant selector UI foundation has been added at `/select-workspace` with EveryBatch branding and server-validated workspace choices
- Login now redirects through workspace destination rules, sending multi-workspace/platform users to `/select-workspace` while keeping tenant routing internal
- Authenticated tenant app users can now choose workspaces from the sidebar account menu, with `/select-workspace` retained as the central selector.
- Multi-tenant smoke test checklist has been added for domain, login, selector, permissions, RLS, feature flag, release and rollback checks
- Platform Admin information architecture has been documented before shell separation, tenant overview, support, billing or provisioning work
- Platform Admin now uses a separate EveryBatch-branded shell at `/platform`, while tenant workspaces keep the tenant app shell
- Platform Admin now shows real tenant metadata, module counts, feature flag override counts and membership counts where available
- Platform Admin now includes read-only Clean Eats module and feature flag overview pages
- Platform Admin has been removed from the tenant workspace sidebar and remains accessible through `/select-workspace` or direct `/platform`
- Tenant provisioning has been planned before building new tenant creation, module setup, feature flag setup or first-admin invite flows
- Tenant sidebar expandable modules now use accordion-style behaviour so route changes keep only the active module open
- Platform Admin now uses a compact collapsed mobile menu below desktop widths instead of stacking the full navigation above content
- Platform provisioning templates now provide static tenant, module, feature flag, settings, branding and onboarding checklist definitions with a read-only Platform Admin preview
- Platform Admin now includes a read-only New Tenant Wizard scaffold at `/platform/tenants/new` with disabled provisioning actions
- Tenant Create Action v1 now lets platform admins create foundation tenant records only, after applying the reviewed platform-admin insert policy migration
- First tenant admin invite and membership planning now has pure validation helpers and a read-only Platform Admin scaffold
- Platform Admin now includes a read-only Tenant Onboarding Checklist scaffold at `/platform/tenants/onboarding`
- Platform Admin now includes a read-only All Tenants route at `/platform/tenants`, with Clean Eats-specific module/feature nav labels where pages are still Clean Eats-only
- Purchase Document Review UI has been compacted for larger invoices with expandable line details
- Purchase Document commit now has clearer pending feedback and development timing diagnostics
- Repeat invoice and price change behaviour has been documented and surfaced for reviewed Cammaroto records
- Products and Costings now include read-only real-data views for committed Purchase Document Intake supplier, item and price records
- Vercel Web Analytics instrumentation has been added for deployed route/page-view analytics
- Phase 1 demo real-data read access has been drafted so demo users can view Products/Costings supplier and price records after manual migration application
- Read-only supplier and internal item detail pages have been added for Purchase Document Intake records
- Component and formula data model planning has been added before building formula schema or UI
- Staff formula collection template planning has been added before creating CSV/XLSX collection files
- Staff formula collection CSV templates have been added for Clean Eats component, product, method and area data capture
- Component formula schema foundation has been drafted for reviewed `formula_versions` and `formula_lines` migration
- First read-only Component Formula UI scaffold has been added at `/components` and `/components/[id]`
- First read-only Finished Product Formula UI scaffold has been added at `/finished-products` and `/finished-products/[id]`
- Formula import planning has been added before building staff template import, review or commit flows
- Component Formula Builder v1 now supports manual component formula creation, header editing and line management using current formula tables
- Tenant workspace page headings have been cleaned up so the persistent app header is the single main page title, while entity detail pages can still show the specific record name in content
- Finished Product Formula Builder planning now confirms the current formula schema can support manual finished product formulas without a migration, while sell price and margin calculations remain future work
- Finished Product Formula Builder v1 now supports manual finished product formula creation, header editing and line management using component, ingredient and packaging internal items
- Sell price storage and margin readiness planning now separates future finished product sell prices from supplier input costs before any margin engine is built
- Sell Price Schema Foundation has been drafted with tenant-scoped finished product sell price storage, explicit sell price permissions and conservative RLS policies
- Domain/app-mode routing foundation now maps EveryBatch marketing, central app, Platform Admin, tenant, support, local dev and preview hosts without activating production redirects
- Platform Admin app-mode guarding now prevents tenant workspace routes from rendering on the planned admin host while keeping local/dev and central app behaviour unchanged
- Platform Admin domain setup has been documented for `admin.everybatchmrp.com`, including Vercel, Cloudflare, Supabase Auth, smoke test and rollback checklists
- Platform Admin brand/UI polish now applies EveryBatch Operator Console language, current-route header titles, compact subpage context callouts, the platform green/lime palette and tenant-app-style grouped accordion/collapsible sidebar structure to the separated `/platform` shell
- Clean Eats tenant subdomain routing v1 now guards `cleaneats.everybatchmrp.com` in code, allowing tenant app routes while redirecting `/` and `/platform/*` to `/dashboard`
- Multi-domain smoke testing and redirect hardening now documents app/admin/tenant/localhost expected behaviour, redirects central `/platform` routes to the admin domain and blocks inactive tenant-looking subdomains from rendering app pages before activation
- Live multi-domain smoke test results have been recorded for app/Clean Eats domains, with admin-domain DNS resolution marked for manual verification and central dashboard hardening queued as task 161
- Central app tenant redirect hardening now prevents `app.everybatchmrp.com` tenant workspace routes from rendering Clean Eats directly and sends workspace selections to the correct tenant/admin domains
- Live domain redirect QA after task 161 confirms central, admin and Clean Eats signed-out redirects are behaving as expected; signed-in selector clicks remain marked for manual browser verification
- Workspace selector live-domain polish now makes tenant/admin destination domains explicit and preserves safe next paths for Clean Eats and Platform Admin selections
- Tenant app shell, login and metadata polish now puts EveryBatch branding at the top of the tenant sidebar, moves account/workspace choices into the sidebar user menu, adds the EveryBatch app icon and syncs browser titles to the current route.
- Supabase auth cookies now use `.everybatchmrp.com` on live EveryBatch app/admin/tenant subdomains so login sessions can be shared between the central app, Clean Eats workspace and Platform Admin; localhost keeps default host-only cookies.
- Brand asset logo/icon storage planning now defines future EveryBatch platform logo/icon assets and tenant full-logo/icon assets before any schema, storage policy or upload UI changes.
- The real EveryBatch PNG icon is now used for app and Apple icons, and tenant/platform browser titles use the `Page Title - EveryBatch` format.
- Support domain setup has been documented for `support.everybatchmrp.com`, including Vercel, Cloudflare, Supabase Auth, interim behaviour, smoke tests and rollback notes.
- The first authenticated EveryBatch Support Help Centre scaffold now serves support landing, guides, tickets, contact, release notes and troubleshooting routes through the support app mode.
- Login, workspace selector and Platform Admin sidebar/footer UI have been cleaned up for better panel balance and less submenu clutter.
- Products data model QA now documents the current supplier/internal item/formula/sell-price relationships and removes misleading fake Recipes scaffold data.
- Finished Products now has clearer data-entry and review polish across formula, cost, sell price and margin readiness.
- Component Formula Builder now has clearer component-first list/detail polish, input-line guidance and component-cost blocker links.
- Finished Product Formula Builder now has clearer sellable-product formula input guidance, grouped component/ingredient/packaging inputs and cost/sell/margin blocker links.
- Costing Snapshot planning now defines how future locked component, finished product and margin cost records should preserve formulas, prices and assumptions over time.
- Costing Snapshot schema foundation has been drafted with tenant-scoped snapshot header/line tables, RLS policies and dedicated permissions for review.
- Costing Snapshot UI v1 now adds manual component cost, finished product cost and finished product margin snapshot creation, recent snapshot panels and locked snapshot detail pages.
- Cost readiness now normalises common unit labels and supports safe metric kg/g and l/ml conversion; pack units such as bunch, box and carton still need future UOM Conversion Foundation work.
- Inventory Receiving Workflow planning now defines the future Goods Inwards, receipt line, lot, stock movement, QA hold and traceability approach before schema/UI build work.
- Inventory Stock Movement schema foundation has been drafted with tenant-scoped receipt, receipt line, lot and stock movement ledger tables, RLS policies and inventory movement permissions for review.
- Goods Inwards Receiving UI v1 now supports manual draft receipts, receipt lines, posting, inventory lot creation and receipt stock movement ledger rows.
- Supplier Invoice to Receiving planning now defines how reviewed supplier invoice lines can become draft Goods Inwards suggestions without automatically posting stock.
- Supplier Invoice to Receiving v1 now creates draft Goods Inwards receipts from eligible reviewed/mapped invoice lines while keeping stock updates behind manual receipt posting.
- Goods Inwards line edit and posting hardening now supports draft header/line edits, posting preflight blockers, duplicate-post protection and clearer posted read-only states.
- Goods Inwards posting now uses a reviewed transaction-safe RPC foundation so lots, movements, line updates and receipt status update together after migration 038 is applied.
- Stock On Hand Summary planning now defines future inventory availability as a read-only view derived from posted stock movement ledger rows.
- Stock On Hand Summary UI v1 now adds `/stock-on-hand` as a real read-only Inventory page calculated from posted stock movements, with item/location/lot/unit grouping, held stock separation and mixed-unit warnings.
- Inventory Traceability Map planning now defines the future inbound and forward trace path from supplier invoice evidence through receiving, lots, movements, Stock On Hand, production and later dispatch/customer traceability.
- Inventory Traceability Map UI v1 now adds `/inventory-traceability` as a real read-only inbound trace map from supplier invoice evidence or manual Goods Inwards receiving through receipt lines, lots, stock movements and Stock On Hand context.
- Stock Adjustment/Reversal planning now defines how future stock corrections should write new ledger movements instead of editing posted receipts, lots or historical stock movements.
- Production Batch Planning schema foundation has been drafted with tenant-scoped production plans, plan lines, production batches, batch inputs and production areas for review before the first real Production Plan UI.
- Production Plan UI v1 now uses real planning records for plan list, draft creation, plan detail, planned output lines and planned batch headers without reserving or consuming stock.
- Phase 1 Operational Review Pack now summarises tasks 001-199, separates real vs scaffolded areas, records Clean Eats data requirements and sets task standards plus a 201-250 roadmap for the next build phase.
- Phase 2 Module Integration Map now documents how QA, Logistics, Reports and CRM should connect to Phase 1 source-of-truth records without duplicating Products, Inventory, Production, Costings, Support or Audit Log data.
- UOM Conversion Foundation planning now defines safe global metric conversions versus tenant/item/supplier-specific pack conversions before schema or UI work begins.
- UOM Conversion Schema Foundation has been drafted with tenant-scoped conversion rules, permissions, RLS policies and TypeScript constants for review before UI/workflow integration.
- QA Module Deep Planning now defines the QA workspace, receiving QA checks, future template/check records and lot-first hold/release boundaries before any QA schema or UI build.
- QA Module Navigation + Scaffold v1 replaces the old QA placeholder pages with the approved QA workspace structure and honest empty states only.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase

## How To Run Locally

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase project values when they are available.

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If `pnpm` asks you to approve dependency build scripts, review the listed packages and approve them according to your local development policy.

## Documentation

- [Product vision](docs/01-product-vision.md)
- [Platform architecture](docs/02-platform-architecture.md)
- [Module roadmap](docs/03-module-roadmap.md)
- [Development standards](docs/04-development-standards.md)
- [Release process](docs/05-release-process.md)
- [Clean Eats discovery notes](docs/06-clean-eats-discovery-notes.md)
- [Codex working rules](docs/07-codex-working-rules.md)
- [Tenant / organisation architecture](docs/08-tenant-organisation-architecture.md)
- [Database foundation plan](docs/09-database-foundation-plan.md)
- [Supabase / auth plan](docs/10-supabase-auth-plan.md)
- [First database migrations plan](docs/11-first-database-migrations-plan.md)
- [Backend foundation review](docs/12-backend-foundation-review.md)
- [Auth and RLS planning](docs/13-auth-and-rls-planning.md)
- [Auth implementation checklist](docs/14-auth-implementation-checklist.md)
- [Auth helper foundation](docs/15-auth-helper-foundation.md)
- [Login and logout UI](docs/16-login-and-logout-ui.md)
- [First admin setup](docs/17-first-admin-setup.md)
- [Profile, membership and organisation helpers](docs/18-profile-membership-organisation-helpers.md)
- [Auth context status](docs/19-auth-context-status.md)
- [Basic route protection](docs/20-basic-route-protection.md)
- [Public auth and protected app layouts](docs/21-public-auth-and-protected-app-layouts.md)
- [Membership-aware route guard](docs/22-membership-aware-route-guard.md)
- [Admin permission route guard](docs/23-admin-permission-route-guard.md)
- [Permission-aware sidebar](docs/24-permission-aware-sidebar.md)
- [Enabled-module-aware navigation](docs/25-enabled-module-aware-navigation.md)
- [Auth and navigation foundation review](docs/26-auth-and-navigation-foundation-review.md)
- [RLS planning](docs/27-rls-planning.md)
- [RLS helper functions](docs/28-rls-helper-functions.md)
- [First RLS policies plan](docs/29-first-rls-policies-plan.md)
- [Foundation RLS SELECT policies](docs/30-foundation-rls-select-policies.md)
- [Foundation RLS applied review](docs/31-foundation-rls-applied-review.md)
- [Roles and permissions RLS planning](docs/32-roles-permissions-rls-planning.md)
- [RLS helper function search path fix](docs/33-rls-helper-function-search-path-fix.md)
- [Roles and permissions RLS SELECT policies](docs/34-roles-permissions-rls-select-policies.md)
- [Roles and permissions RLS applied review](docs/35-roles-permissions-rls-applied-review.md)
- [Audit logs RLS planning](docs/36-audit-logs-rls-planning.md)
- [Audit logs RLS SELECT policy](docs/37-audit-logs-rls-select-policy.md)
- [Audit logs RLS applied review](docs/38-audit-logs-rls-applied-review.md)
- [RLS foundation complete review and next phase](docs/39-rls-foundation-complete-review-and-next-phase.md)
- [Products/UI foundation plan](docs/40-products-ui-foundation-plan.md)
- [Global visual direction polish](docs/41-global-visual-direction-polish.md)
- [Products module UI skeleton](docs/42-products-module-ui-skeleton.md)
- [Staff review pack for Products/UI foundation](docs/43-staff-review-pack-products-ui.md)
- [Staff meeting outcomes and Phase 1 demo plan](docs/44-staff-meeting-outcomes-phase-1-demo-plan.md)
- [Costings module UI skeleton](docs/45-costings-module-ui-skeleton.md)
- [Production module UI skeleton](docs/46-production-module-ui-skeleton.md)
- [Inventory module UI skeleton](docs/47-inventory-module-ui-skeleton.md)
- [Phase 1 dashboard refresh](docs/48-phase-1-dashboard-refresh.md)
- [Demo/test user access plan](docs/49-demo-test-user-access-plan.md)
- [Phase 1 demo user role](docs/50-phase-1-demo-user-role.md)
- [Module-level permission-aware navigation](docs/51-module-level-permission-aware-navigation.md)
- [Demo/test user manual setup](docs/52-demo-test-user-manual-setup.md)
- [Staff demo review round](docs/53-staff-demo-review-round.md)
- [Staff feedback capture and Phase 1 review tracker](docs/54-staff-feedback-capture-phase-1-review-tracker.md)
- [Performance and hosting architecture review](docs/55-performance-and-hosting-architecture-review.md)
- [Auth context and navigation query audit](docs/56-auth-context-navigation-query-audit.md)
- [Auth context query optimisation](docs/57-auth-context-query-optimisation.md)
- [Hosting region and Vercel/Supabase configuration check](docs/58-hosting-region-vercel-supabase-check.md)
- [Vercel Speed Insights](docs/59-vercel-speed-insights.md)
- [Module registry alignment review](docs/60-module-registry-alignment-review.md)
- [Module registry cleanup plan](docs/61-module-registry-cleanup-plan.md)
- [Master Admin Portal planning](docs/62-master-admin-portal-planning.md)
- [Platform Admin read-only skeleton](docs/63-platform-admin-read-only-skeleton.md)
- [Platform tenant detail read-only skeleton](docs/64-platform-tenant-detail-read-only-skeleton.md)
- [Tenant creation and provisioning plan](docs/65-tenant-creation-and-provisioning-plan.md)
- [Billing and subscription planning](docs/66-billing-and-subscription-planning.md)
- [Commercial platform architecture and domain model](docs/67-commercial-platform-architecture-domain-model.md)
- [Naming and brand direction planning](docs/68-naming-and-brand-direction-planning.md)
- [Platform Admin v1 build plan](docs/69-platform-admin-v1-build-plan.md)
- [Platform Admin v1 design polish](docs/70-platform-admin-v1-design-polish.md)
- [Purchase Document Intake v1 foundation](docs/71-purchase-document-intake-v1-foundation.md)
- [Purchase Document upload and review actions](docs/72-purchase-document-upload-review-actions.md)
- [Cammaroto sample commit flow](docs/73-cammaroto-sample-commit-flow.md)
- [Purchase Document Intake generalisation UX polish](docs/74-purchase-document-intake-generalisation-ux-polish.md)
- [Generic invoice extraction and commit planning](docs/75-generic-invoice-extraction-and-commit-planning.md)
- [Purchase Document upload and extraction foundation](docs/76-purchase-document-upload-extraction-foundation.md)
- [Purchase Document extraction prototype](docs/77-purchase-document-extraction-prototype.md)
- [Repeat invoice and price change behaviour](docs/78-repeat-invoice-price-change-behaviour.md)
- [Products and Costings real data views](docs/79-products-costings-real-data-views.md)
- [Vercel Web Analytics](docs/80-vercel-web-analytics.md)
- [Phase 1 demo real data read access](docs/81-phase-1-demo-real-data-read-access.md)
- [Supplier and internal item detail pages](docs/82-supplier-internal-item-detail-pages.md)
- [Component and formula data model planning](docs/83-component-formula-data-model-planning.md)
- [Staff formula collection template planning](docs/84-staff-formula-collection-template-planning.md)
- [Staff formula collection templates](docs/85-staff-formula-collection-templates.md)
- [Component formula schema foundation](docs/86-component-formula-schema-foundation.md)
- [First Component Formula UI scaffold](docs/87-first-component-formula-ui-scaffold.md)
- [First Finished Product Formula UI scaffold](docs/88-first-finished-product-formula-ui-scaffold.md)
- [Formula import planning](docs/89-formula-import-planning.md)
- [Multi-supplier parser registry and unknown invoice diagnostics](docs/90-multi-supplier-parser-registry-diagnostics.md)
- [Melbourne Produce Merchants parser](docs/91-melbourne-produce-parser.md)
- [Generic Purchase Document commit flow](docs/92-generic-purchase-document-commit-flow.md)
- [Del-Re National Food Group parser](docs/93-del-re-parser.md)
- [Purchase Document Review UI compaction](docs/94-purchase-document-review-ui-compaction.md)
- [Purchase Document commit performance feedback](docs/95-purchase-document-commit-performance-feedback.md)
- [Pacific Meat Sales parser](docs/97-pacific-meats-parser.md)
- [Alba Cheese parser](docs/98-alba-cheese-parser.md)
- [Grange Meat Co parser](docs/99-grange-meat-parser.md)
- [Il Nonno parser](docs/100-il-nonno-parser.md)
- [Tools module and Supplier Invoice Intake](docs/101-tools-module-supplier-invoice-intake.md)
- [Performance audit and route load optimisation](docs/102-performance-audit-route-load-optimisation.md)
- [Products module real dashboard](docs/103-products-module-real-dashboard.md)
- [Suppliers manual create/edit foundation](docs/104-suppliers-manual-create-edit-foundation.md)
- [Internal items manual create/edit foundation](docs/105-internal-items-manual-create-edit-foundation.md)
- [Inventory locations foundation](docs/106-inventory-locations-foundation.md)
- [Costings dashboard real data summary](docs/107-costings-dashboard-real-data-summary.md)
- [Costings subpages real data pass](docs/144-costings-subpages-real-data-pass.md)
- [Component / Formula Import Foundation Plan](docs/145-component-formula-import-foundation-plan.md)
- [Component / Formula Builder v1](docs/146-component-formula-builder-v1.md)
- [FCP/LCP frontend optimisation pass](docs/147-fcp-lcp-frontend-optimisation-pass.md)
- [Tenant route redirect consistency](docs/148-tenant-route-redirect-consistency.md)
- [Tenant page heading cleanup](docs/149-tenant-page-heading-cleanup.md)
- [Finished Product Formula Builder Plan](docs/150-finished-product-formula-builder-plan.md)
- [Finished Product Formula Builder v1](docs/151-finished-product-formula-builder-v1.md)
- [Sell Price Storage And Margin Readiness Plan](docs/152-sell-price-storage-and-margin-readiness-plan.md)
- [Sell Price Schema Foundation](docs/153-sell-price-schema-foundation.md)
- [Domain / App Mode Routing Foundation](docs/154-domain-app-mode-routing-foundation.md)
- [Platform Admin App Mode Guarding](docs/155-platform-admin-app-mode-guarding.md)
- [Platform Admin Domain Setup](docs/156-platform-admin-domain-setup.md)
- [Platform Admin Brand/UI Polish](docs/157-platform-admin-brand-ui-polish.md)
- [Tenant Subdomain Routing v1](docs/158-tenant-subdomain-routing-v1.md)
- [Multi-Domain Smoke Test and Redirect Hardening](docs/159-multi-domain-smoke-test-and-redirect-hardening.md)
- [Live Multi-Domain Smoke Test Results](docs/160-live-multi-domain-smoke-test-results.md)
- [Central App Tenant Redirect Hardening](docs/161-central-app-tenant-redirect-hardening.md)
- [Live Domain Redirect QA Pass](docs/162-live-domain-redirect-qa-pass.md)
- [Workspace Selector Live Domain QA / Polish](docs/163-workspace-selector-live-domain-qa-polish.md)
- [Tenant App Shell, Login and Metadata Polish](docs/165-tenant-app-shell-login-metadata-polish.md)
- [Brand Asset Logo/Icon Storage Plan](docs/166-brand-asset-logo-icon-storage-plan.md)
- [EveryBatch Icon + Tenant Metadata Fix](docs/167-everybatch-icon-tenant-metadata-fix.md)
- [Brand Asset Schema Foundation](docs/168-brand-asset-schema-foundation.md)
- [Tenant / Platform Logo + Icon Upload UI v1](docs/169-tenant-platform-logo-icon-upload-ui-v1.md)
- [Sell Price Management UI v1](docs/170-sell-price-management-ui-v1.md)
- [Meal Margins Real Calculation v1](docs/171-meal-margins-real-calculation-v1.md)
- [Support Domain And Auth-Gated Help Centre Plan](docs/172-support-domain-auth-gated-help-centre-plan.md)
- [Support Domain Setup](docs/173-support-domain-setup.md)
- [Support Help Centre Scaffold](docs/174-support-help-centre-scaffold.md)
- [App Shell And Auth Page UI Cleanup](docs/175-app-shell-auth-page-ui-cleanup.md)
- [Support Guides Static Content v1](docs/176-support-guides-static-content-v1.md)
- [Support Tickets Schema Foundation](docs/177-support-tickets-schema-foundation.md)
- [Support Ticket UI v1](docs/178-support-ticket-ui-v1.md)
- [Platform Admin Support Inbox v1](docs/179-platform-admin-support-inbox-v1.md)
- [Support Ticket Polish and Permission QA](docs/180-support-ticket-polish-permission-qa.md)
- [Support Ticket Status Workflow Polish](docs/181-support-ticket-status-workflow-polish.md)
- [Support Ticket Context-Aware Creation](docs/182-support-ticket-context-aware-creation.md)
- [Support Inbox Search and Pagination Polish](docs/183-support-inbox-search-pagination-polish.md)
- [Support Ticket Attachments Plan](docs/184-support-ticket-attachments-plan.md)
- [Support Ticket Attachments Foundation](docs/185-support-ticket-attachments-foundation.md)
- [Products Data Model QA Pass](docs/186-products-data-model-qa-pass.md)
- [Finished Product Data Entry Polish](docs/187-finished-product-data-entry-polish.md)
- [Component Formula Builder Polish](docs/188-component-formula-builder-polish.md)
- [Finished Product Formula Builder Polish](docs/189-finished-product-formula-builder-polish.md)
- [Costing Snapshot Plan](docs/190-costing-snapshot-plan.md)
- [Costing Snapshot Schema Foundation](docs/191-costing-snapshot-schema-foundation.md)
- [Costing Snapshot UI v1](docs/192-costing-snapshot-ui-v1.md)
- [Inventory Receiving Workflow Plan](docs/193-inventory-receiving-workflow-plan.md)
- [Inventory Stock Movement Schema Foundation](docs/194-inventory-stock-movement-schema-foundation.md)
- [Goods Inwards Receiving UI v1](docs/195-goods-inwards-receiving-ui-v1.md)
- [Supplier Invoice to Receiving Plan](docs/196-supplier-invoice-to-receiving-plan.md)
- [Supplier Invoice to Receiving v1](docs/197-supplier-invoice-to-receiving-v1.md)
- [Goods Inwards Line Edit And Posting Hardening](docs/205-goods-inwards-line-edit-posting-hardening.md)
- [Goods Inwards Posting RPC Plan](docs/206-goods-inwards-posting-rpc-plan.md)
- [Goods Inwards Posting RPC Foundation](docs/207-goods-inwards-posting-rpc-foundation.md)
- [Stock On Hand Summary Plan](docs/208-stock-on-hand-summary-plan.md)
- [Stock On Hand Summary UI v1](docs/209-stock-on-hand-summary-ui-v1.md)
- [Inventory Traceability Map Plan](docs/210-inventory-traceability-map-plan.md)
- [Inventory Traceability Map UI v1](docs/211-inventory-traceability-map-ui-v1.md)
- [Stock Adjustment/Reversal Plan](docs/212-stock-adjustment-reversal-plan.md)
- [QA Module Deep Planning](docs/213-qa-module-deep-planning.md)
- [QA Module Navigation + Scaffold v1](docs/214-qa-module-navigation-scaffold-v1.md)
- [Production Batch Planning Data Model](docs/198-production-batch-planning-data-model.md)
- [Production Plan UI v1](docs/199-production-plan-ui-v1.md)
- [Phase 1 Operational Review Pack](docs/200-phase-1-operational-review-pack.md)
- [Phase 2 Module Integration Map](docs/201-phase-2-module-integration-map.md)
- [UOM Conversion Foundation Plan](docs/202-uom-conversion-foundation-plan.md)
- [UOM Conversion Schema Foundation](docs/203-uom-conversion-schema-foundation.md)
- [UOM Conversion UI v1](docs/204-uom-conversion-ui-v1.md)
- [Tasks 225-348 official roadmap (active)](docs/225-348-official-roadmap.md)
- [Tasks 223-276 revised roadmap (historical)](docs/223-276-revised-roadmap.md)
- [Roadmap and project context realignment](docs/223-roadmap-project-context-realignment.md)
- [Codex task standards](docs/CODEX_TASK_STANDARDS.md)
- [Tasks 201-250 historical roadmap (superseded after Task 222)](docs/201-250-next-roadmap.md)
- [Task prompt template for 201+](docs/task-prompt-template-201-plus.md)
- [Production dashboard real data scaffold](docs/108-production-dashboard-real-data-scaffold.md)
- [App shell, navigation and branding](docs/109a-app-shell-navigation-branding.md)
- [Dashboard, card and page polish](docs/109b-dashboard-card-ui-polish.md)
- [Admin theme and logo management](docs/109c-admin-theme-logo-management.md)
- [Branding controls completion](docs/109d-branding-controls-completion.md)
- [Speed and performance overhaul](docs/110-speed-performance-overhaul.md)
- [Loading UX and route transition polish](docs/111-loading-ux-route-transition-polish.md)
- [Global search foundation](docs/112-global-search-foundation.md)
- [EveryBatch brand and domain architecture](docs/113-everybatch-brand-domain-architecture.md)
- [EveryBatch implementation roadmap](docs/113-everybatch-implementation-roadmap.md)
- [Multi-tenant platform architecture and update strategy](docs/114-multi-tenant-platform-architecture-update-strategy.md)
- [Platform Admin separation plan](docs/115-platform-admin-separation-plan.md)
- [Tenant subdomain routing plan](docs/116-tenant-subdomain-routing-plan.md)
- [EveryBatch brand foundation implementation](docs/117-everybatch-brand-foundation-implementation.md)
- [App header and page title layout refactor](docs/118-app-header-page-title-layout-refactor.md)
- [Help / Support menu foundation](docs/119-help-support-menu-foundation.md)
- [Login branding split](docs/120-login-branding-split.md)
- [Feature flag foundation](docs/121-feature-flag-foundation.md)
- [EveryBatch domain setup and environment plan](docs/122-everybatch-domain-setup-environment-plan.md)
- [app.everybatchmrp.com domain connection notes](docs/123-app-domain-connection-notes.md)
- [Tenant resolver foundation](docs/124-tenant-resolver-foundation.md)
- [Central login and tenant selector plan](docs/125-central-login-tenant-selector-plan.md)
- [Workspace options helper foundation](docs/126-workspace-options-helper-foundation.md)
- [Tenant selector UI foundation](docs/127-tenant-selector-ui-foundation.md)
- [Login redirect to workspace selector](docs/128-login-redirect-to-workspace-selector.md)
- [Workspace switcher foundation](docs/129-workspace-switcher-foundation.md)
- [Multi-tenant smoke test checklist](docs/130-multi-tenant-smoke-test-checklist.md)
- [Platform Admin information architecture](docs/131-platform-admin-information-architecture.md)
- [Platform shell separation v1](docs/132-platform-shell-separation-v1.md)
- [Platform tenant overview v1](docs/133-platform-tenant-overview-v1.md)
- [Platform tenant module and feature flag overview](docs/134-platform-tenant-module-feature-overview.md)
- [Remove Platform from tenant navigation](docs/135-remove-platform-from-tenant-navigation.md)
- [Tenant provisioning plan](docs/136-tenant-provisioning-plan.md)
- [Tenant sidebar accordion behaviour fix](docs/137-tenant-sidebar-accordion-behaviour-fix.md)
- [Platform Admin responsive layout fix](docs/138-platform-admin-responsive-layout-fix.md)
- [Platform provisioning templates foundation](docs/139-platform-provisioning-templates-foundation.md)
- [New Tenant Wizard scaffold](docs/140-new-tenant-wizard-scaffold.md)
- [Tenant Create Action v1](docs/141-tenant-create-action-v1.md)
- [First tenant admin invite / membership plan](docs/142-first-tenant-admin-invite-membership-plan.md)
- [Tenant Onboarding Checklist foundation](docs/143-tenant-onboarding-checklist-foundation.md)
- [Codex project context](docs/CODEX_PROJECT_CONTEXT.md)

## Database Migrations

Reviewed SQL migration and seed files live in `supabase/migrations`. They are committed for review before being applied to Supabase, including tenant foundation, organisation settings, branding migrations, costing snapshots, support tickets and inventory stock movement foundation.

The first backend foundation block is summarised in [Backend foundation review](docs/12-backend-foundation-review.md).

The next security phase is planned in [Auth and RLS planning](docs/13-auth-and-rls-planning.md).

The practical auth build sequence is tracked in [Auth implementation checklist](docs/14-auth-implementation-checklist.md).

The initial auth helper structure is documented in [Auth helper foundation](docs/15-auth-helper-foundation.md).

The basic auth entry points are documented in [Login and logout UI](docs/16-login-and-logout-ui.md).

Manual first admin setup is documented in [First admin setup](docs/17-first-admin-setup.md).

Auth context helper behaviour is documented in [Profile, membership and organisation helpers](docs/18-profile-membership-organisation-helpers.md).

The dashboard verification card is documented in [Auth context status](docs/19-auth-context-status.md).

Basic route protection is documented in [Basic route protection](docs/20-basic-route-protection.md).

The public auth/protected app layout split is documented in [Public auth and protected app layouts](docs/21-public-auth-and-protected-app-layouts.md).

Membership-aware app access is documented in [Membership-aware route guard](docs/22-membership-aware-route-guard.md).

Admin/configuration permission guarding is documented in [Admin permission route guard](docs/23-admin-permission-route-guard.md).

Permission-aware navigation visibility is documented in [Permission-aware sidebar](docs/24-permission-aware-sidebar.md).

Enabled-module-aware navigation is documented in [Enabled-module-aware navigation](docs/25-enabled-module-aware-navigation.md).

The auth/navigation foundation checkpoint is summarised in [Auth and navigation foundation review](docs/26-auth-and-navigation-foundation-review.md).

The staged Row Level Security plan is documented in [RLS planning](docs/27-rls-planning.md).

The drafted RLS helper function migration is documented in [RLS helper functions](docs/28-rls-helper-functions.md).

The first staged foundation RLS policy plan is documented in [First RLS policies plan](docs/29-first-rls-policies-plan.md).

The first foundation RLS SELECT policy migration is documented in [Foundation RLS SELECT policies](docs/30-foundation-rls-select-policies.md).

The applied first foundation RLS checkpoint is documented in [Foundation RLS applied review](docs/31-foundation-rls-applied-review.md).

Roles and permissions RLS planning is documented in [Roles and permissions RLS planning](docs/32-roles-permissions-rls-planning.md).

RLS helper function search path hardening is documented in [RLS helper function search path fix](docs/33-rls-helper-function-search-path-fix.md).

Roles and permissions RLS SELECT policies are documented in [Roles and permissions RLS SELECT policies](docs/34-roles-permissions-rls-select-policies.md).

The applied roles/permissions RLS checkpoint is documented in [Roles and permissions RLS applied review](docs/35-roles-permissions-rls-applied-review.md).

Audit logs RLS planning is documented in [Audit logs RLS planning](docs/36-audit-logs-rls-planning.md).

Audit logs RLS SELECT policy is documented in [Audit logs RLS SELECT policy](docs/37-audit-logs-rls-select-policy.md).

The applied audit logs RLS checkpoint is documented in [Audit logs RLS applied review](docs/38-audit-logs-rls-applied-review.md).

The completed RLS foundation and recommended next build phase are documented in [RLS foundation complete review and next phase](docs/39-rls-foundation-complete-review-and-next-phase.md).

The Phase 3 Products/UI Foundation plan is documented in [Products/UI foundation plan](docs/40-products-ui-foundation-plan.md).

The first global visual polish pass is documented in [Global visual direction polish](docs/41-global-visual-direction-polish.md).

The Products module UI skeleton is documented in [Products module UI skeleton](docs/42-products-module-ui-skeleton.md).

The Products/UI staff review pack is documented in [Staff review pack for Products/UI foundation](docs/43-staff-review-pack-products-ui.md).

The staff meeting outcomes and Phase 1 demo build direction are documented in [Staff meeting outcomes and Phase 1 demo plan](docs/44-staff-meeting-outcomes-phase-1-demo-plan.md).

The Costings module UI skeleton is documented in [Costings module UI skeleton](docs/45-costings-module-ui-skeleton.md).

The Production module UI skeleton is documented in [Production module UI skeleton](docs/46-production-module-ui-skeleton.md).

The Inventory module UI skeleton is documented in [Inventory module UI skeleton](docs/47-inventory-module-ui-skeleton.md).

The Phase 1 dashboard refresh is documented in [Phase 1 dashboard refresh](docs/48-phase-1-dashboard-refresh.md).

The demo/test user access plan is documented in [Demo/test user access plan](docs/49-demo-test-user-access-plan.md).

The Phase 1 demo user role seed is documented in [Phase 1 demo user role](docs/50-phase-1-demo-user-role.md).

Module-level permission-aware navigation is documented in [Module-level permission-aware navigation](docs/51-module-level-permission-aware-navigation.md).

The demo/test user manual setup guide is documented in [Demo/test user manual setup](docs/52-demo-test-user-manual-setup.md).

The staff demo review round is documented in [Staff demo review round](docs/53-staff-demo-review-round.md).

The staff feedback capture and Phase 1 review tracker is documented in [Staff feedback capture and Phase 1 review tracker](docs/54-staff-feedback-capture-phase-1-review-tracker.md).

The performance and hosting architecture review is documented in [Performance and hosting architecture review](docs/55-performance-and-hosting-architecture-review.md).

The auth context and navigation query audit is documented in [Auth context and navigation query audit](docs/56-auth-context-navigation-query-audit.md).

The auth context query optimisation pass is documented in [Auth context query optimisation](docs/57-auth-context-query-optimisation.md).

The hosting region and configuration checklist is documented in [Hosting region and Vercel/Supabase configuration check](docs/58-hosting-region-vercel-supabase-check.md).

Vercel Speed Insights instrumentation is documented in [Vercel Speed Insights](docs/59-vercel-speed-insights.md).

Module registry alignment is documented in [Module registry alignment review](docs/60-module-registry-alignment-review.md).

Module registry cleanup planning is documented in [Module registry cleanup plan](docs/61-module-registry-cleanup-plan.md).

Master Admin Portal planning is documented in [Master Admin Portal planning](docs/62-master-admin-portal-planning.md).

The first read-only Platform Admin skeleton is documented in [Platform Admin read-only skeleton](docs/63-platform-admin-read-only-skeleton.md).

The first read-only Platform Admin tenant detail skeleton is documented in [Platform tenant detail read-only skeleton](docs/64-platform-tenant-detail-read-only-skeleton.md).

Future tenant creation and provisioning is planned in [Tenant creation and provisioning plan](docs/65-tenant-creation-and-provisioning-plan.md).

Future billing and subscription handling is planned in [Billing and subscription planning](docs/66-billing-and-subscription-planning.md).

The future commercial platform/domain model is planned in [Commercial platform architecture and domain model](docs/67-commercial-platform-architecture-domain-model.md).

Future naming and brand direction is planned in [Naming and brand direction planning](docs/68-naming-and-brand-direction-planning.md).

Platform Admin v1 scope is planned in [Platform Admin v1 build plan](docs/69-platform-admin-v1-build-plan.md).

Platform Admin v1 design polish is documented in [Platform Admin v1 design polish](docs/70-platform-admin-v1-design-polish.md).

Purchase Document Intake v1 foundation is documented in [Purchase Document Intake v1 foundation](docs/71-purchase-document-intake-v1-foundation.md).

Purchase Document upload and review actions are documented in [Purchase Document upload and review actions](docs/72-purchase-document-upload-review-actions.md).

The controlled Cammaroto sample commit flow is documented in [Cammaroto sample commit flow](docs/73-cammaroto-sample-commit-flow.md).

Purchase Document Intake generalisation and action feedback polish is documented in [Purchase Document Intake generalisation UX polish](docs/74-purchase-document-intake-generalisation-ux-polish.md).

Generic invoice extraction and commit planning is documented in [Generic invoice extraction and commit planning](docs/75-generic-invoice-extraction-and-commit-planning.md).

Purchase Document upload and extraction foundation is documented in [Purchase Document upload and extraction foundation](docs/76-purchase-document-upload-extraction-foundation.md).

Purchase Document extraction prototype is documented in [Purchase Document extraction prototype](docs/77-purchase-document-extraction-prototype.md).

Repeat invoice and price change behaviour is documented in [Repeat Invoice and Price Change Behaviour](docs/78-repeat-invoice-price-change-behaviour.md).

Support Guides Static Content v1 is documented in [Support Guides Static Content v1](docs/176-support-guides-static-content-v1.md).

Support Tickets Schema Foundation is documented in [Support Tickets Schema Foundation](docs/177-support-tickets-schema-foundation.md).

Support Ticket UI v1 is documented in [Support Ticket UI v1](docs/178-support-ticket-ui-v1.md).

Platform Admin Support Inbox v1 is documented in [Platform Admin Support Inbox v1](docs/179-platform-admin-support-inbox-v1.md).

Support Ticket Polish and Permission QA is documented in [Support Ticket Polish And Permission QA](docs/180-support-ticket-polish-permission-qa.md).

Support Ticket Status Workflow Polish is documented in [Support Ticket Status Workflow Polish](docs/181-support-ticket-status-workflow-polish.md).

Support Ticket Context-Aware Creation is documented in [Support Ticket Context-Aware Creation](docs/182-support-ticket-context-aware-creation.md).

Support Inbox Search and Pagination Polish is documented in [Support Inbox Search And Pagination Polish](docs/183-support-inbox-search-pagination-polish.md).

Support Ticket Attachments Plan is documented in [Support Ticket Attachments Plan](docs/184-support-ticket-attachments-plan.md).

Support Ticket Attachments Foundation is documented in [Support Ticket Attachments Foundation](docs/185-support-ticket-attachments-foundation.md).

QA Schema Foundation is documented in [QA Schema Foundation](docs/215-qa-schema-foundation.md).

Receiving QA Checks UI v1 is documented in [Receiving QA Checks UI v1](docs/216-receiving-qa-checks-ui-v1.md).

Logistics Module Deep Planning is documented in [Logistics Module Deep Planning](docs/218-logistics-module-deep-planning.md).

Logistics Navigation + Scaffold v1 is documented in [Logistics Navigation + Scaffold v1](docs/219-logistics-navigation-scaffold-v1.md).

Dispatch Manifest Schema Foundation is documented in [Dispatch Manifest Schema Foundation](docs/220-dispatch-manifest-schema-foundation.md).

Dispatch Manifest UI v1 is documented in [Dispatch Manifest UI v1](docs/221-dispatch-manifest-ui-v1.md).

Carrier Configuration Foundation is documented in [Carrier Configuration Foundation](docs/222-carrier-configuration-foundation.md).

## Current Scope

- Clean internal app shell with grouped module navigation
- Placeholder pages for the Clean Eats Hub modules
- Green and white Clean Eats-style visual foundation
- Supabase client/server auth helper foundation
- Basic Supabase Auth login/logout UI
- Basic app route protection for signed-in users
- Membership-aware app access for protected pages
- Permission-aware route protection for selected admin/configuration pages
- Permission-aware sidebar visibility for selected admin/configuration links
- Enabled-module-aware sidebar visibility for tenant modules
- SQL helper functions for future reviewed RLS policies
- Applied first foundation RLS SELECT policies for tenant/auth context reads
- Applied roles/permissions RLS SELECT policies for permission reference reads
- Applied audit logs RLS SELECT policy for platform-admin traceability reads
- Purchase Document Intake read/write actions for saved review records only
- Controlled Cammaroto sample commit flow for reviewed supplier, item, mapping and price reference records
- Tenant-scoped Purchase Document file upload foundation with private storage migration draft
- Controlled Purchase Document extraction prototype for uploaded text-based Cammaroto PDFs
- Repeat Cammaroto invoice matching and price-change indicators for reviewed intake lines
- Tenant-scoped inventory location master records with read/create/edit UI only
- Read-only Costings dashboard summary using approved supplier prices, price observations and formula readiness indicators
- Read-only Meal Margins gross margin preview using cost-ready formulas and active current sell prices only
- Read-only Production dashboard scaffold using inventory locations, formulas and internal item setup signals
- Tenant-scoped, permission-aware global search across accessible pages and current core records
- Frontend FCP/LCP optimisation pass for Dashboard, Organisation Settings, Suppliers and Platform routes
- Consistent tenant nested-route redirects for natural Products, Production, Inventory, Admin and Tools URLs
- Authenticated support/help-centre scaffold for `support.everybatchmrp.com` and local `/support` routes
- Static authenticated support guides for getting started, domains, Products, Costings, Formula Builder, Supplier Invoice Intake, Inventory and access troubleshooting
- Drafted support ticket schema foundation with tenant-scoped tickets, customer/internal comments, ticket events, RLS and support ticket permission seeds
- Customer-facing support ticket portal for listing tickets, creating tickets, viewing details and adding customer-visible comments
- Platform Admin support inbox for cross-tenant ticket review, filters, status/priority/category updates, assignment, customer replies and internal notes
- Support ticket polish and permission QA confirming customer/internal visibility, clearer support states and no required schema/RLS/permission changes
- Support ticket status workflow polish for waiting-on-support, waiting-on-customer, resolved and closed ticket behaviour
- Context-aware support ticket creation from the app Help menu with safe related page/module defaults
- Platform Admin support inbox pagination/search/filter polish and customer ticket list filter polish
- Planned support ticket attachment architecture covering private storage, tenant-scoped paths, visibility/RLS, file limits and rollout sequencing
- Drafted support ticket attachment foundation with private bucket metadata, tenant-scoped attachment table, helper function, RLS policies and TypeScript constants
- Drafted tenant-scoped QA schema foundation with templates, immutable versions, checks, results, reviews, approvals, amendments, full-lot holds, append-only hold events, granular QA permissions and RLS
- Added Receiving QA Checks UI v1 for real Goods Inwards-linked QA checks, typed result capture, completion and review decisions without inventory hold/release effects
- Added QA Hold & Release inventory link for formal full-lot holds/releases, Stock On Hand held/available derivation through a narrow availability helper, and traceability visibility without changing stock movement quantities
- Planned the future Logistics module for dispatch runs, manifests, carrier/export handoffs, delivery issues, carton planning and Detrack readiness without adding routes, schema or behaviour
- Added the Logistics workspace scaffold with Dispatch Runs, Manifests, Carrier Exports and Delivery Issues routes using honest empty states only
- Drafted the Dispatch/Manifest schema foundation migration with tenant-owned carrier, dispatch run, delivery, manifest snapshot and carrier export tables plus granular Logistics permissions and RLS. Direct writes are restricted to draft operational/manifest records and pending exports; snapshot insertion and lifecycle outcomes remain closed until controlled task 221 workflows. No operational Logistics UI, carrier export generation, integrations, stock movements or seed data is included
- Added the first real Dispatch Manifest workflow with tenant-scoped draft editing, deterministic validation, explicit readiness before manifest creation/generation, authoritative numbering, atomic immutable snapshots and controlled dispatch/cancellation rules. QA and Logistics parent links now own their dashboard destinations without duplicate dashboard submenu entries; carrier exports, delivery issues, orders, Inventory, QA, Production and external integrations remain disconnected
- Added tenant carrier and service configuration using the existing Logistics schema and granular permissions. Active choices feed carrier-scoped draft dispatch selectors, service archive remains soft and history-safe, and Carrier Exports remains disconnected without credentials, files or provider calls. Applied migration 044 splits the defective shared carrier/service identity trigger into table-appropriate trigger functions without changing RLS, permissions or operational data
- Recovered local migration 040 for already-live ledger/snapshot immutability triggers, marked Batch Receiving and Purchasing as preview/sample Inventory workspaces, and corrected Costings copy for active formula costing, Costing Snapshots and Meal Margins. Leaked Password Protection must not be described as disabled without live evidence; its live setting and older warning-era documentation are pending the approved Task 343 External-Tenant Security Review or another explicitly approved live verification
- Realigned the active roadmap at Task 223, established permanent Codex task standards, and retained the old Tasks 201-250 sequence as clearly superseded historical context
- Task 223A (`a8c2761`) establishes the living knowledge system. Task 223B (`f8f576603d97732d9fa1f29702fec78fccb05036`) defines the production-replacement direction. Task 224 (`8b8e94a87f6e94fef78c05317f87cad4bb01caea`) adds the matched evidence audit. Task 225 (`82a81613556c311198449670b0425106f062a4ef`) closes Review Gate 0. Tasks 226-230 complete facility, commerce, demand, Shopify and delivery/calendar architecture; Task 229 is committed at `800591a2947fa25f5675f80bc70a6473138ec126`. Architecture Gate 1 review is current and Task 231 remains blocked.

Shopify architecture and security planning is documented in [Shopify App Architecture and Security Plan](docs/229-shopify-app-architecture-security-plan.md), with the [Official Source Register](docs/SHOPIFY_OFFICIAL_SOURCE_REGISTER.md), [Connector Threat Model](docs/SHOPIFY_CONNECTOR_THREAT_MODEL.md), [Connection Lifecycle and Readiness Model](docs/SHOPIFY_CONNECTION_LIFECYCLE_AND_READINESS_MODEL.md), and [Data Scope and Privacy Matrix](docs/SHOPIFY_DATA_SCOPE_AND_PRIVACY_MATRIX.md). These are architecture records only: the Shopify app is not registered, reviewed, installed or connected, and no protected customer data has been imported.

Delivery and production-calendar architecture is documented in [Task 230](docs/230-delivery-zones-calendars-production-date-architecture.md), the [Ownership Matrix](docs/DELIVERY_CALENDAR_AND_PRODUCTION_DATE_OWNERSHIP_MATRIX.md), [Rule Model](docs/DELIVERY_AND_PRODUCTION_CALENDAR_RULE_MODEL.md), and [Architecture Gate 1 Review Package](docs/ARCHITECTURE_GATE_1_REVIEW_PACKAGE.md). No facility, zone, postcode, calendar, parser, Production Demand or customer-facing Shopify calendar implementation exists.

No broad costing engine, GST/tax normalisation, production business logic, audit log write policies, OCR, AI extraction, purchase orders, automatic invoice-to-stock posting, stock movement reversal behavior, partial QA holds or full NC/CA workflow has been added.
