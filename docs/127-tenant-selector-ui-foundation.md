# Tenant Selector UI Foundation

## Purpose

Task 127 adds the first EveryBatch workspace selector UI.

The selector prepares the future central login flow without changing the current login redirect behaviour.

## Route Added

Added:

```text
/select-workspace
```

Files added:

```text
app/select-workspace/page.tsx
app/select-workspace/actions.ts
```

The route lives outside the tenant app route group, so it does not render the normal tenant AppShell/sidebar.

## Route Behaviour

`/select-workspace`:

- uses `getCurrentUserWorkspaceOptions()`
- redirects signed-out users to `/login`
- shows EveryBatch-branded central selector UI for signed-in users
- shows workspace cards for active tenant memberships
- shows Platform Admin Console option for `platform_admin` users
- shows a no-workspace state when the user has no active workspaces and is not `platform_admin`

This route is a central app/login-flow surface, not a tenant workspace surface.

## Workspace Card Behaviour

Each workspace card shows:

- workspace name
- tenant slug
- role key
- access level
- organisation status
- tenant logo if a safe public/display URL is available
- clean initials placeholder otherwise
- Continue action

Selecting a workspace posts to a server action.

For the current transitional state, a valid tenant selection redirects to:

```text
/dashboard
```

Future target after tenant subdomain routing:

```text
https://{tenant_slug}.everybatchmrp.com/dashboard
```

The future target is preserved in helper destination metadata, but it is not used for redirects yet.

## Server-Side Validation

Workspace selection uses:

```text
validateWorkspaceSelection()
```

The server action:

- receives the selected tenant slug
- validates the selection server-side
- redirects only after validation
- keeps invalid selections on `/select-workspace` with a safe error state

It does not trust client-submitted organisation ids.

It does not use service-role keys.

It does not bypass RLS.

## Platform Admin Option

When `isPlatformAdmin` is true, the selector shows:

```text
Platform Admin Console
```

The card links to:

```text
/platform
```

Platform Admin is still guarded by the existing app protections.

This task does not split Platform Admin to `platform.everybatchmrp.com`.

## No Workspace State

If a signed-in user has no active tenant workspaces and is not a platform admin, the selector shows:

```text
No active workspace found
```

It includes:

- support link
- sign out option

No tenant data is shown in the no-workspace state.

## Login Behaviour Preserved

The current `/login` route still redirects signed-in users to:

```text
/dashboard
```

This task does not force users through `/select-workspace` after login.

Future login redirect updates can use the selector once the flow has been tested.

## Tenant Subdomain Routing Status

Tenant subdomain routing is not active.

This task does not redirect to:

```text
cleaneats.everybatchmrp.com
```

Future work will switch valid tenant selections to tenant subdomain destinations after host routing is reviewed and implemented.

## Non-Goals

This task does not add:

- tenant subdomain routing
- middleware host routing
- login redirect changes
- tenant-specific login
- Platform Admin shell split
- workspace switcher in the app header
- invite/password reset changes
- tenant provisioning
- domain management UI
- database migrations
- RLS or permission changes

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
