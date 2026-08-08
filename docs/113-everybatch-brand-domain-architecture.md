# EveryBatch Brand And Domain Architecture

> **Task 242 multi-surface update:** Tenant App, Platform Admin, Support / Help Centre and Public / Marketing share EveryBatch brand language but retain purpose-specific information architecture and authority. Future public claims must be reconstructable from implemented or approved capability; technical implementation detail is translated into grounded product meaning rather than copied as marketing language.

> **Task 243 UX direction:** Shared brand tokens, status semantics, controls, icon language and accessibility connect the four surfaces. Their navigation, density, content model and data boundaries remain distinct. Public capability language and screenshots must be traceable to implemented or approved evidence and contain no tenant data.

## Planning Status

Task 113 is documentation and planning only.

No app code, routes, database schema, RLS policies, permissions, migrations, Vercel settings, Supabase settings, tenant subdomain routing, marketing site, login UI or Platform Admin implementation is changed by this task.

## Brand Decision

The real product/platform brand is:

```text
EveryBatch
```

Brand line:

```text
Food Manufacturing OS
```

Core tagline:

```text
Every ingredient. Every process. Every batch.
```

EveryBatch should be positioned as the operating system for modern food manufacturers.

The product promise is to connect recipes, production, inventory, purchasing, QA and traceability in one purpose-built food manufacturing platform.

## Product Name Versus Domain And Category Wording

The public product brand should be `EveryBatch`, not `EveryBatch MRP`.

`MRP` is useful for:

- domain availability
- SEO/category context
- commercial explanation
- search intent around manufacturing software

Public wording can say:

```text
EveryBatch is a food manufacturing MRP platform...
```

Visual/product branding should stay clean as:

```text
EveryBatch
```

## Purchased Domains

Primary domain:

```text
everybatchmrp.com
```

Additional purchased domains:

```text
everybatchmrp.com.au
everybatch.com.au
```

These domains protect the Australian market and give the product a practical commercial domain even though `everybatch.com` is unavailable.

## Deferred Domains

Deferred or not purchased due cost:

```text
everybatch.io
everybatchmrp.app
```

Important availability note:

```text
everybatch.com is not available
```

Future planning should not assume access to `everybatch.com`.

## Platform Relationship

Current naming relationship:

| Name | Role |
| --- | --- |
| EveryBatch | Real product/platform brand |
| Clean Eats Hub | Tenant 1/customer workspace powered by EveryBatch |
| Food Prod Hub | Internal repo/build/project name to phase out from user-facing UI over time |
| Food Operations Hub | Older/internal concept language only |

Clean Eats should remain Tenant 1 and the first customer workspace.

Food Prod Hub can remain the repository/project name for now. It should not be newly introduced as user-facing product wording.

## Target Brand Positioning

EveryBatch is the operating system for modern food manufacturers.

Key positioning points:

- purpose-built for food manufacturing
- connects recipes, production, inventory, purchasing, QA and traceability
- designed around operational visibility
- supports compliance and repeatable production
- covers every ingredient, every process and every batch
- avoids generic bloated ERP positioning

## Target Domain Architecture

### Marketing Site

```text
everybatchmrp.com
```

Purpose:

- public website
- product marketing
- SEO
- book demo
- explain modules and features
- case studies
- pricing later
- public resources

### Australian Redirects

```text
everybatchmrp.com.au
everybatch.com.au
```

Purpose:

- redirect to `everybatchmrp.com`
- protect Australian market/brand coverage
- potentially use `everybatch.com.au` as an Australia-specific landing page later

### Central App Login

```text
app.everybatchmrp.com
```

Purpose:

- central login
- tenant selector for users belonging to multiple tenants
- redirect to the correct tenant subdomain after login
- EveryBatch-branded platform login

### Tenant Workspace

```text
cleaneats.everybatchmrp.com
```

Purpose:

- Clean Eats tenant/customer portal
- app workspace after login
- tenant-specific modules, data and branding
- tenant logo/name in app shell

Future examples:

```text
madeactive.everybatchmrp.com
freshsupplyco.everybatchmrp.com
customername.everybatchmrp.com
```

### Platform Admin

```text
admin.everybatchmrp.com
```

Purpose:

- separate internal platform admin site/shell
- tenant management
- module management
- feature flags
- billing/subscription later
- tenant domains/subdomains
- platform users
- support visibility
- system health
- rollout/update management

Current state:

- Platform currently exists as a guarded `/platform` shell in the same app.
- This is acceptable during early development.
- Long term, Platform should separate into `admin.everybatchmrp.com`.
- Earlier `platform.everybatchmrp.com` references are legacy/optional planning language.

### Support And Knowledge Base

Preferred support domain:

```text
support.everybatchmrp.com
```

Purpose:

- knowledge base
- how-to docs
- module guides
- submit support ticket
- contact support
- contextual help links from inside the app later

Alternative:

```text
knowledgebase.everybatchmrp.com
```

Recommendation:

Use `support.everybatchmrp.com` because it is shorter, clearer and avoids relying on unavailable `everybatch.com`.

## Login Branding Rules

### Central Login

Route target:

```text
app.everybatchmrp.com/login
```

Should show:

- EveryBatch logo
- Food Manufacturing OS
- "Sign in to your workspace"
- EveryBatch platform branding
- no tenant-specific branding until a tenant is selected or resolved

Task 120 makes this the current default `/login` visual mode while keeping the existing route and auth behaviour.

### Tenant Login

Route target:

```text
cleaneats.everybatchmrp.com/login
```

Should show:

- Clean Eats logo/name
- Clean Eats Hub
- Powered by EveryBatch
- EveryBatch trust layer/footer
- tenant-specific domain context

Task 120 prepares reusable visual components for tenant login mode, but tenant host detection and tenant-specific routing remain future work.

### In-App Tenant Shell

Route target:

```text
cleaneats.everybatchmrp.com
```

Should show:

- tenant logo/name in sidebar/header
- user belongs to the Clean Eats workspace
- support/help link to EveryBatch support
- subtle Powered by EveryBatch treatment where appropriate

EveryBatch should not dominate the tenant workspace. The customer should feel they are working inside their own operational hub.

### Platform Admin

Route target:

```text
admin.everybatchmrp.com
```

Should show:

- EveryBatch branding
- platform/admin visual style
- no tenant-specific shell except when viewing tenant detail pages

When viewing tenant detail pages, the UI should clearly distinguish platform-admin context from tenant-user context.

## Tenant Workspace Branding Rules

Tenant workspaces should use:

- tenant logo/name
- tenant colour palette
- tenant module enablement
- tenant-specific settings
- tenant-scoped data via `organisation_id`
- RLS-backed access boundaries

EveryBatch should appear as the platform trust layer, not as the main workspace brand.

Suggested tenant workspace footer/helper wording:

```text
Powered by EveryBatch
```

This should be subtle.

## Brand And Design Direction

Use the EveryBatch concept board direction:

- deep green
- Clean Eats/EveryBatch green
- lime accent
- off-white background
- dark ink/navy/green text
- Inter typography
- clean SaaS cards
- operational command centre feel

Suggested palette:

| Token | Colour |
| --- | --- |
| Deep green | `#0F2E23` |
| Primary green | `#176B3D` or current `#176B3A` |
| Lime accent | `#8CC63F` or current `#A7D129` |
| Pale green | `#E8F5E9` |
| Light background | `#F2F4F7` |
| Dark ink | `#1F2937` |

Current Clean Eats tenant defaults can remain:

| Token | Colour |
| --- | --- |
| primary | `#176B3A` |
| accent | `#A7D129` |
| success | `#15803D` |
| warning | `#B7791F` |
| danger | `#B91C1C` |
| info | `#0369A1` |

EveryBatch should eventually have its own platform brand palette separate from tenant branding.

## Product Architecture Language

Preferred language:

- modules are top-level app areas
- workspaces/submodules sit inside modules
- tenant-specific modules can exist
- enabled modules are controlled per tenant
- feature flags/settings should control tenant-specific capabilities
- one codebase should serve multiple tenants
- tenants have isolated data via `organisation_id` and RLS
- updates should be global by default but guarded by migrations, feature flags and module enablement

Current module order:

1. Dashboard
2. Inventory
3. Products
4. Costings
5. Production
6. QA
7. Logistics
8. CRM
9. Reports
10. Tools
11. Admin
12. Platform

## Current Key Modules And Workspaces

Products:

- Suppliers
- Ingredients
- Packaging
- Components
- Recipes
- Finished Products

Costings:

- Ingredient Costs
- Packaging Costs
- Component Costs
- Meal Margins
- Price History

Production:

- Production Report
- Production Plan
- Production Areas
- Production Tasks
- Facility/iPad View

Inventory:

- Goods Inwards
- Batch Receiving
- Stock Locations
- Stock Movements
- Purchasing
- BOM / Traceability

Tools:

- Supplier Invoice Intake

## Help And Support Menu

Task 119 adds the first app header Help & Support menu as a linkout foundation.

Dropdown links:

- Visit Knowledge Base
- Module Guides
- Submit Support Ticket
- Contact Support

Target domain:

```text
support.everybatchmrp.com
```

The linked support paths are future support-site placeholders. No knowledge base, ticketing backend or support workflow is implemented in the app yet.

## Notes For Future Implementation

Future implementation tasks should be reviewed separately and kept scoped:

- do not rename the repo casually
- do not change deployed domains in code until the domain routing plan is reviewed
- do not split Platform Admin until auth, route, layout and support-mode implications are documented
- do not replace tenant branding with EveryBatch branding inside tenant workspaces
- do not add marketing site code inside the app until a separate marketing-site plan exists
- do not change login branding until central versus tenant login rules are implemented deliberately
- preserve RLS, membership and module-enable gates during all branding/domain work

## Task 117 Brand Foundation Implementation

Task 117 adds static EveryBatch brand constants and applies EveryBatch to platform metadata, login/auth copy, subtle tenant shell trust-layer wording and Platform Admin copy.

It does not implement domain routing, central tenant selector, Platform Admin separation or marketing/support surfaces.

## Task 154 Domain / App Mode Routing Foundation

Task 154 updates the domain/app-mode foundation so one EveryBatch codebase can serve future marketing, central app, Platform Admin, tenant workspace, support, local development and preview modes.

Current preferred Platform Admin host is `admin.everybatchmrp.com`. Earlier `platform.everybatchmrp.com` references remain legacy/optional planning language unless deliberately retained later.

No DNS, Vercel, Supabase Auth, middleware, production redirect or tenant subdomain activation changes are made by task 154.

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
