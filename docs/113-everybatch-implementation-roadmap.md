# EveryBatch Implementation Roadmap

## Planning Status

This roadmap is documentation only.

It lists future implementation tasks after the EveryBatch brand/domain decision. It does not change app code, routes, domains, database schema, RLS, permissions, navigation, login pages, Platform Admin, Supplier Invoice Intake or deployment settings.

## 1. Implement EveryBatch Brand Foundation

Purpose:

- introduce EveryBatch as the platform/product brand in user-facing platform areas
- define platform-level brand tokens separate from tenant branding
- prepare shared copy rules for EveryBatch versus Clean Eats Hub

Non-goals:

- no repo rename
- no tenant branding replacement
- no domain/routing changes
- no marketing site build

Dependencies:

- EveryBatch brand/domain architecture
- current tenant branding controls
- agreed logo assets and visual rules

Likely code areas:

- app metadata/title templates
- login layout
- Platform Admin shell later
- shared brand constants later
- docs and README wording

Risks:

- confusing tenant workspace branding with platform branding
- introducing EveryBatch wording in places that should remain Clean Eats-specific
- prematurely renaming internal code paths

## 2. Tenant Subdomain Routing Plan

Purpose:

- define how `cleaneats.everybatchmrp.com` resolves to the Clean Eats organisation
- plan future tenant slug/subdomain handling
- document central app login to tenant workspace redirect flow

Non-goals:

- no routing implementation yet
- no middleware unless reviewed later
- no Vercel domain changes in this planning step
- no tenant provisioning automation

Dependencies:

- organisation slug model
- auth/session flow
- membership-aware route guard
- RLS tenant isolation
- Vercel custom domain setup plan

Likely code areas:

- Next.js request/host handling
- auth guard helpers
- tenant context helpers
- login redirect flow
- Vercel domain configuration later

Risks:

- cross-tenant leakage if host-derived tenant context is wrong
- login redirect loops
- confusing central login and tenant login responsibilities
- breaking local development if domain handling is too rigid

## 3. Platform Admin Separation Plan

Purpose:

- plan long-term separation of Platform Admin to `platform.everybatchmrp.com`
- define platform-owner shell separate from tenant app shell
- clarify support-mode tenant viewing
- document what belongs in Platform Admin versus tenant workspaces
- define implementation phases before moving code

Non-goals:

- no Platform Admin code movement yet
- no permission model changes
- no new platform CRUD
- no tenant impersonation/support mode until separately planned

Dependencies:

- platform admin access model
- `platform_admin` role
- Platform Admin v1 planning
- tenant detail skeleton
- future tenant provisioning plan

Likely code areas:

- Platform route group/layout
- platform-specific app shell
- route guards
- tenant detail pages
- support-mode indicators later

Risks:

- exposing platform controls inside tenant shell
- unclear support/admin context when viewing a tenant
- needing different navigation, search and help behaviours across shells

Status:

- Task 115 creates the Platform Admin separation plan.

## 4. App Header And Page Title Layout Refactor

Purpose:

- prepare top-level app header for tenant workspace context
- support future Help / Support, global search and workspace identity
- keep tenant name/logo visible without clutter

Non-goals:

- no dashboard redesign
- no navigation order changes
- no search scope expansion
- no notification centre

Dependencies:

- 109A app shell
- 111 loading boundary stability
- 112 global search foundation
- tenant branding helpers

Likely code areas:

- `components/app-shell.tsx`
- header/search/support components
- tenant presentation helpers
- page title patterns

Risks:

- destabilising the persistent app shell during loading
- duplicating tenant context queries
- overloading the header with too many controls

## 5. Help / Support Menu Foundation

Purpose:

- add a small support/help entry point in the app shell
- link to `support.everybatchmrp.com`
- prepare for knowledge base, module guides and support tickets

Non-goals:

- no support ticket backend
- no knowledge base implementation inside the app
- no chat widget
- no custom event tracking yet

Dependencies:

- support domain decision
- EveryBatch brand/domain architecture
- app header refactor if needed

Likely code areas:

- app shell header
- support/help component
- external link configuration later

Risks:

- linking to support pages before they exist
- making support appear tenant-owned rather than EveryBatch-owned
- cluttering the header

## 6. Login Page Branding Split

Purpose:

- separate central app login branding from tenant login branding
- prepare `app.everybatchmrp.com/login`
- prepare `cleaneats.everybatchmrp.com/login`

Non-goals:

- no auth provider changes
- no sign-up flow
- no password reset expansion unless separately scoped
- no tenant selector until planned

Dependencies:

- tenant subdomain routing plan
- EveryBatch brand assets
- current Supabase Auth login UI
- membership-aware app access

Likely code areas:

- login route/layout
- auth redirect helpers
- tenant resolution helper later
- app metadata/title templates

Risks:

- confusing users between platform login and tenant login
- redirect loops
- showing tenant branding before tenant context is reliably resolved

## 7. Marketing Site Planning

Purpose:

- plan public site at `everybatchmrp.com`
- define product messaging, modules, demo CTA and SEO structure
- decide whether marketing site lives in this repo or a separate project

Non-goals:

- no marketing site build yet
- no pricing page implementation
- no domain configuration in this step
- no analytics expansion beyond existing Vercel instrumentation

Dependencies:

- EveryBatch positioning
- product module copy
- demo booking process
- brand assets

Likely code areas:

- separate marketing app/project later
- shared brand docs
- Vercel project/domain config later

Risks:

- mixing marketing site concerns into the tenant app
- over-promising modules that are still foundations
- SEO copy that overuses "MRP" at the expense of the EveryBatch brand

## 8. Support Knowledge Base Planning

Purpose:

- plan `support.everybatchmrp.com`
- define knowledge base, module guides and support ticket pathway
- prepare future contextual app help links

Non-goals:

- no support backend
- no docs CMS selection
- no in-app ticket workflow
- no chatbot

Dependencies:

- support domain decision
- module guide structure
- staff support process
- future help menu

Likely code areas:

- external support site later
- app help menu links
- documentation structure

Risks:

- publishing support content before workflows stabilise
- creating duplicate docs across repo and support site
- confusing internal build docs with customer help docs

## 9. Multi-Tenant Update Strategy

Purpose:

- document how EveryBatch updates roll out to multiple tenants safely
- keep one codebase serving multiple tenants
- use modules, settings, feature flags and migrations to manage rollout

Non-goals:

- no feature flag UI yet
- no automated tenant provisioning
- no per-client forks
- no live migration execution

Dependencies:

- module registry
- organisation modules
- roles/permissions
- RLS foundation
- migration review process
- Platform Admin planning

Likely code areas:

- module enablement helpers
- feature flag helpers later
- Platform Admin controls later
- migration docs
- deployment/release process

Risks:

- custom client forks
- incomplete migration rollout checks
- enabling unfinished modules for a tenant
- leaking tenant-specific assumptions into shared code

## Recommended Sequence

1. Finalise EveryBatch brand assets and brand copy rules.
2. Complete Platform Admin separation planning before moving `/platform` code.
3. Plan tenant subdomain routing before changing route behaviour.
4. Implement EveryBatch brand foundation only after brand assets/copy rules are clear.
5. Refactor app header only after support/search/login needs are clear.
6. Build support/help links once support destination exists.
7. Split login branding once central versus tenant domain routing is understood.
8. Plan feature flags before tenant-specific beta rollouts.
9. Build tenant provisioning only after Platform Admin shell boundaries are clear.
10. Keep multi-tenant smoke tests ahead of future customer onboarding.

## Future Task Backlog Proposal

Do not renumber existing committed tasks. This is a proposed future roadmap:

- 115 Platform Admin Separation Plan
- 116 Tenant Subdomain Routing Plan
- 117 EveryBatch Brand Foundation Implementation
- 118 App Header and Page Title Layout Refactor
- 119 Help / Support Menu Foundation
- 120 Login Branding Split
- 121 Feature Flag Foundation
- 122 Platform Shell Separation v1
- 123 Tenant Provisioning Workflow v1
- 124 Tenant Module Management v1
- 125 Multi-tenant Smoke Test Checklist

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this roadmap.
