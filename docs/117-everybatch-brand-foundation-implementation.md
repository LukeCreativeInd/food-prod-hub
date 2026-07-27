# EveryBatch Brand Foundation Implementation

## Purpose

Task 117 begins applying EveryBatch as the real product/platform brand in user-facing platform areas while preserving Clean Eats Hub as Tenant 1 workspace branding.

This is a controlled brand foundation pass. It does not implement tenant subdomain routing, central tenant selector, Platform Admin separation, Help/Support menu, marketing site, middleware, database schema, RLS, permissions, navigation changes, package/repo rename, Supplier Invoice Intake changes or business workflows.

## Brand Constants Added

Added:

```text
lib/platform-brand.ts
```

It exports static platform brand constants:

- `PLATFORM_BRAND_NAME`
- `PLATFORM_BRAND_CATEGORY`
- `PLATFORM_BRAND_TAGLINE`
- `PLATFORM_PRIMARY_DOMAIN`
- `PLATFORM_APP_DOMAIN`
- `PLATFORM_SUPPORT_DOMAIN`
- `PLATFORM_ADMIN_DOMAIN`
- `PLATFORM_BRAND_DESCRIPTION`

These are static constants only. They do not control routing, domains, middleware or tenant resolution.

## Platform Versus Tenant Branding Rule

Platform/product layer:

- EveryBatch
- Food Manufacturing OS
- Every ingredient. Every process. Every batch.

Tenant workspace layer:

- Clean Eats Hub / Clean Eats Australia for Tenant 1
- tenant logo/name/theme in sidebar and workspace pages
- subtle Powered by EveryBatch where appropriate

Internal repo/build layer:

- Food Prod Hub can remain where clearly developer/internal
- new user-facing platform copy should avoid Food Prod Hub

## App Metadata

Root metadata now uses EveryBatch:

- title: EveryBatch
- description: Food Manufacturing OS for recipes, production, inventory, purchasing, QA and traceability.

This does not change tenant routing or page-level tenant context.

## Login/Public Branding

The login page now presents the platform/auth layer as EveryBatch:

- EveryBatch
- Food Manufacturing OS
- Sign in to your workspace
- Every ingredient. Every process. Every batch.

It still notes that Clean Eats Hub is Tenant 1 during the foundation build.

No central login domain, tenant selector, subdomain-specific login, sign-up flow or password reset changes were added.

## Tenant Shell Branding

Tenant shell branding remains tenant-led:

- tenant logo/name still comes from tenant branding/presentation helpers
- tenant colours still drive the app shell
- Clean Eats Hub remains the Tenant 1 workspace

A subtle sidebar footer now says:

```text
Powered by EveryBatch
```

This is a platform trust-layer signal, not a replacement for tenant branding.

## Platform/Admin Copy

Platform-facing copy now uses EveryBatch language where appropriate:

- EveryBatch operator console
- EveryBatch control centre
- future `platform.everybatchmrp.com` direction

The existing Platform Admin route and functionality are unchanged. Platform is not separated yet.

## User-Facing Food Prod Hub Reduction

This task reduces new platform-facing wording away from Food Prod Hub.

Food Prod Hub remains acceptable in:

- internal repo/project references
- historical docs
- docs that explicitly explain old/current naming

It should not be newly introduced as the public product/platform brand.

## Non-Goals

This task does not build:

- tenant subdomain routing
- central tenant selector
- Platform Admin separation
- Help/Support menu
- support knowledge base
- marketing site
- global search changes
- notification system
- new CRUD/workflows
- package/repo rename
- database migrations

## Follow-Ups

Recommended follow-ups remain:

- Help/Support menu foundation
- login branding split
- tenant subdomain routing implementation
- Platform Admin separation implementation
- EveryBatch marketing site planning
- support knowledge base planning

Completed follow-up:

- Task 118 moves current workspace titles into the persistent app header and compacts redundant in-content headers.

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
