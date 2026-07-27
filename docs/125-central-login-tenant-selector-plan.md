# Central Login And Tenant Selector Plan

## Planning Status

Task 125 is documentation and planning only.

No app code, routes, middleware, auth/login code, database schema, migrations, RLS policies, permissions, navigation, branding UI, Platform Admin separation, Vercel/domain configuration, environment variables, package metadata or dependencies are changed by this task.

## Current State

EveryBatch is the platform/product brand.

Clean Eats Hub is Tenant 1/customer workspace.

Food Prod Hub remains the internal repository/project name only.

Current behaviour:

- `/login` exists and uses EveryBatch central-login styling.
- signed-in users visiting `/login` are currently redirected to `/dashboard`.
- `app.everybatchmrp.com` is planned as the central login and future tenant selector domain.
- tenant resolver helpers exist in `lib/tenant-resolver.ts`, but they are not wired into routing, middleware, auth redirects or app shell context yet.
- tenant subdomain routing is not active.
- tenant selector UI does not exist yet.
- Platform Admin still exists inside the current app while future separation is planned.

This is acceptable while Clean Eats remains the only active tenant workspace.

## Target Central Login Behaviour

Target route:

```text
app.everybatchmrp.com/login
```

The central login should show EveryBatch branding, not tenant-specific branding by default.

Recommended central login copy:

```text
EveryBatch
Food Manufacturing OS
Sign in to your workspace
Every ingredient. Every process. Every batch.
```

After successful Supabase Auth login, the app should:

1. load the authenticated user.
2. fetch active workspace memberships for that user.
3. check whether the user is a `platform_admin`.
4. decide the safest post-login destination.
5. redirect or show the workspace selector.

Short-term transition:

- one-tenant users may continue to land on `/dashboard` until tenant routing is active.

Target final behaviour:

- one-tenant users redirect to `https://{tenant_slug}.everybatchmrp.com/dashboard`.
- multi-tenant users see the tenant selector.
- platform-only users see or enter the Platform Admin option.
- users with no active workspace access see a no-access state with support guidance.

## Tenant Selector Behaviour

Future route concept:

```text
/select-workspace
```

Alternative route:

```text
/workspaces
```

The tenant selector should be EveryBatch-branded and should list only server-validated workspace options.

Recommended selector copy:

```text
Choose your workspace
Select the EveryBatch workspace you want to open.
Continue to workspace
Platform Admin Console
```

Each tenant option can show:

- tenant logo or placeholder
- organisation display name
- tenant slug
- tenant status where useful
- user role/access level
- primary continue action

Clean Eats example:

```text
Continue to Clean Eats Hub
```

The selector should also include:

- logout option
- support link
- no workspace access guidance
- Platform Admin option when the user is `platform_admin`

Clicking a tenant must validate the selected workspace server-side before redirecting.

Do not trust a client-submitted tenant id, tenant slug or organisation id on its own.

## User Cases

| User case | Target behaviour |
| --- | --- |
| One active tenant membership | Redirect after login to that tenant workspace. Transitional destination can remain `/dashboard` until tenant subdomain routing is active. |
| Multiple active tenant memberships | Show tenant selector and let the user choose from active memberships only. |
| `platform_admin` only | Show or enter Platform Admin option. Long term destination is `platform.everybatchmrp.com`. |
| `platform_admin` plus tenant memberships | Show Platform Admin option and tenant workspace options. User chooses the intended context. |
| No active memberships and not `platform_admin` | Show no active workspace state with support link. Do not show tenant data. |
| Inactive membership | Do not offer the workspace as active. Show unavailable/no-access messaging if directly requested. |
| Suspended or paused tenant | Do not open the workspace normally. Show paused/unavailable messaging or hide from active options depending future policy. |
| Archived tenant | Do not open or list as an active workspace. |
| Wrong tenant URL | Require membership for the host-derived tenant. If invalid, show no access or return to selector. |
| Already signed in and visits central login | Redirect to one workspace, Platform Admin or selector based on current validated options. |
| Signed out and visits tenant URL | Show tenant-specific login later, or redirect to central login with a safe intended destination. |
| Signed out and visits platform URL | Show central/platform login path and require `platform_admin` after login. |

## Future Tenant-Specific Login

Future tenant login example:

```text
cleaneats.everybatchmrp.com/login
```

Tenant-specific login should show:

- Clean Eats Hub branding
- tenant logo/theme if available
- `Powered by EveryBatch`
- login form

After login:

- if the user has active Clean Eats membership, redirect to the Clean Eats dashboard.
- if the user does not belong to Clean Eats but has other active tenants, offer central tenant selector.
- if the user has no active memberships, show no-access/support guidance.
- if the tenant is inactive, suspended or archived, do not open the workspace.

Tenant-specific login should not allow the browser to choose an arbitrary organisation id. The host-derived tenant slug must be resolved and verified server-side.

This is not implemented in task 125.

## Platform Admin Login

Target Platform Admin domain:

```text
platform.everybatchmrp.com
```

Recommended approach:

1. Build central login and tenant selector first.
2. Show Platform Admin as an option for `platform_admin` users.
3. Later, allow direct `platform.everybatchmrp.com/login` to use central auth and return to Platform Admin.

Platform Admin access must require `platform_admin`.

Platform Admin should not be treated as a normal tenant module long term.

Future Platform Admin actions should be audited where appropriate.

## Redirect And Security Rules

Redirect handling must avoid open redirects.

Rules:

- accept only relative app paths or explicitly approved EveryBatch domains.
- do not accept arbitrary `returnTo` URLs.
- preserve intended destination through a reviewed safe redirect helper.
- validate tenant slug server-side before redirecting to a tenant workspace.
- validate active membership server-side before opening a tenant workspace.
- do not trust client-provided `organisation_id`.
- do not use service-role keys in login, selector or client-facing routing flows.
- do not expose cross-tenant workspace names beyond what the signed-in user is allowed to see.
- keep RLS as the final data-access guard.
- Platform Admin support access to tenant context must be explicit, scoped and auditable later.

Allowed redirect examples:

```text
/dashboard
/select-workspace
https://cleaneats.everybatchmrp.com/dashboard
https://platform.everybatchmrp.com
```

Disallowed redirect examples:

```text
https://unknown.example.com
//evil.example.com
javascript:...
https://everybatchmrp.com.evil.example.com
```

## Data And Helper Requirements

Future helpers likely needed:

- `getUserActiveMemberships(userId)`
- `getUserWorkspaceOptions(userId)`
- `getPostLoginDestination(userId, requestedDestination?)`
- `validateWorkspaceSelection(userId, tenantSlug)`
- `isAllowedRedirectTarget(target)`
- `resolveTenantFromHost()` using task 124 resolver foundations
- `getTenantBrandingForLogin(tenantSlug)` later

Potential workspace option data:

- organisation id
- organisation slug
- organisation display name
- organisation status
- membership role key
- membership access level
- tenant logo URL
- tenant theme preview
- whether the user is `platform_admin`

Existing data foundations:

- `public.profiles`
- `public.organisations`
- `public.organisation_memberships`
- `public.roles`
- `public.permissions`
- `public.organisation_branding`
- `platform_admin` role
- membership `status`
- membership `access_level`

## Transitional Implementation Phases

### Phase 1 - Plan

Create this planning document.

No app behaviour changes.

### Phase 2 - Workspace Options Helper

Add a server helper that returns active tenant memberships and Platform Admin status for the current authenticated user.

Do not change login redirects yet.

Status:

- Task 126 adds `lib/workspace-options.ts` with server-side workspace option, platform-admin detection, default destination and workspace selection validation helpers.
- The helpers are not wired into `/login` or any route redirects yet.

### Phase 3 - Tenant Selector UI

Add `/select-workspace` or `/workspaces`.

List validated workspaces and Platform Admin option.

Keep current domain/routes while tenant subdomain routing remains inactive.

Status:

- Task 127 adds `/select-workspace` as the first EveryBatch-branded tenant selector UI foundation.
- Workspace selection validates server-side and redirects to the current transitional `/dashboard` destination.
- The route is not wired into `/login` automatically yet.

### Phase 4 - Login Redirect Update

After login:

- one active tenant user goes to dashboard.
- multi-tenant user goes to selector.
- platform-only user goes to Platform Admin.
- no-access user sees no active workspace state.

### Phase 5 - Tenant Subdomain Routing

Switch tenant selection destination to:

```text
https://{tenant_slug}.everybatchmrp.com/dashboard
```

Use the task 124 tenant resolver.

### Phase 6 - Tenant-Specific Login

Add tenant-branded login at:

```text
{tenant_slug}.everybatchmrp.com/login
```

Validate tenant membership after auth.

### Phase 7 - Platform Domain Handling

Complete `platform.everybatchmrp.com` shell/login handling and separate Platform Admin from normal tenant workspace UI.

## Non-Goals

Task 125 does not implement:

- tenant selector route
- login redirect changes
- tenant subdomain routing
- middleware
- Platform Admin domain routing
- tenant-specific login
- auth provider changes
- password reset changes
- invite flow changes
- database migrations
- RLS policy changes
- permission changes
- navigation changes
- Vercel or DNS setup
- Supabase Auth redirect URL changes

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this planning task.
