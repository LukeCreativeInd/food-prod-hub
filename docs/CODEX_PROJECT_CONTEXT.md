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
- `platform.everybatchmrp.com` for future Platform Admin
- `support.everybatchmrp.com` for support and knowledge base

Current domain setup:

- `app.everybatchmrp.com` is live and validated in Vercel
- Cloudflare DNS is active with `CNAME app -> b560eb64065fe2f1.vercel-dns-017.com`
- Cloudflare proxy remains DNS only
- the Vercel production URL currently redirects to `app.everybatchmrp.com`, but remains available in Vercel if needed
- login and dashboard smoke tests passed on `app.everybatchmrp.com`
- do not point `everybatchmrp.com` root to the tenant app; reserve it for marketing or a coming-soon page
- do not connect `cleaneats.everybatchmrp.com` until tenant workspace host routing is implemented
- do not connect `platform.everybatchmrp.com` until Platform Admin domain routing is explicitly implemented
- do not connect `support.everybatchmrp.com` until the support/knowledge-base target exists
- do not change Vercel, DNS, Supabase Auth redirect URLs or env vars from a code task without explicit user instruction

Task 123 domain connection is complete. `app.everybatchmrp.com` is the first stable EveryBatch app/login URL.

Tenant subdomain routing target:

- `app.everybatchmrp.com` is the central login / tenant selector.
- `{tenant_slug}.everybatchmrp.com` is the tenant workspace pattern.
- `cleaneats.everybatchmrp.com` is the target Clean Eats workspace.
- `platform.everybatchmrp.com` is Platform Admin.
- `support.everybatchmrp.com` is support/help.

Do not implement host-based tenant routing casually. Follow the task 116 routing plan first.

Never trust client-provided `organisation_id`.

Host-derived tenant slug must be verified server-side against `organisations.slug`.

Tenant resolver foundation helpers live in:

```text
lib/tenant-resolver.ts
```

They parse EveryBatch hostnames and provide a server tenant lookup helper, but they are not wired into routing, middleware, auth redirects or app shell context yet.

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
platform.everybatchmrp.com
```

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

`/platform` and `/platform/tenants/cleaneats` now render inside a dedicated EveryBatch Platform shell instead of the tenant AppShell/sidebar. The future `platform.everybatchmrp.com` domain remains inactive until a reviewed routing/domain task connects it.

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

Tenant sidebar accordion behaviour is documented in:

```text
docs/137-tenant-sidebar-accordion-behaviour-fix.md
```

Expandable tenant navigation should auto-expand only the active module on route changes. Manual expansion should behave as a single-open accordion. Platform Admin shell navigation is separate and should not be affected by tenant sidebar changes.

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
