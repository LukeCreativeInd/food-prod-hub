# Food Prod Hub / Clean Eats Hub

Food Prod Hub is a modular food manufacturing operations platform. Clean Eats Hub is the first client implementation and currently guides the first platform foundation work.

## Project Overview

The platform is intended to support food manufacturers with one operating hub and modular workflows. Clean Eats is Client 1, but the codebase should be planned so future clients can use configurable modules without client-specific forks.

The current app includes the foundation for an internal operations hub: app shell, grouped module navigation, placeholder pages, Tailwind CSS styling, and Supabase environment placeholders. Business logic, authentication, database schema, costing calculations, and complex Supabase behavior are intentionally not implemented yet.

## Current Status

- Current phase: Platform foundation
- App shell and placeholder module pages exist
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

## Database Migrations

Reviewed SQL migration and seed files live in `supabase/migrations`. They are committed for review before being applied to Supabase, including tenant foundation, organisation settings, and branding migrations.

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

No costing calculations, broad production business logic, audit log write policies, OCR, storage-backed uploads, generic invoice commit automation, purchase orders, Goods Inwards receiving, or stock movement behavior has been added.
