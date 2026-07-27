# Login Redirect To Workspace Selector

## Purpose

Task 128 updates the existing login flow to use the workspace options foundation from task 126 and the tenant selector route from task 127.

The login flow now chooses a safe transitional destination after successful sign-in.

Tenant subdomain redirects are still not active.

## Files Added

Added:

```text
app/api/auth/post-login-destination/route.ts
```

This internal route returns the current signed-in user's safe post-login destination.

## Files Changed

Changed:

```text
app/login/login-form.tsx
app/login/page.tsx
```

## Login Redirect Rules

After a successful email/password sign-in, the login form asks the server for the post-login destination.

Current transitional rules:

| User state | Destination |
| --- | --- |
| One active tenant workspace, not platform admin | `/dashboard` |
| Multiple active tenant workspaces | `/select-workspace` |
| `platform_admin` with tenant workspace(s) | `/select-workspace` |
| `platform_admin` with no tenant workspaces | `/platform` |
| No active workspaces and not `platform_admin` | `/no-access` |

The same destination rules now apply when an already signed-in user visits:

```text
/login
```

## Safe Internal Destination Allowlist

The internal post-login destination route only allows:

```text
/dashboard
/select-workspace
/platform
/no-access
```

If a helper ever returns anything outside that set, the API falls back to:

```text
/dashboard
```

This prevents accidental external redirects or open redirect behaviour.

## Selector Compatibility

`/select-workspace` remains unchanged.

Current selector behaviour:

- Clean Eats workspace selection validates server-side and redirects to `/dashboard`.
- Platform Admin Console card links to `/platform`.
- invalid workspace selections stay on `/select-workspace` with a safe error message.

## Tenant Subdomain Routing Status

This task does not redirect to:

```text
cleaneats.everybatchmrp.com
```

Future tenant subdomain routing can switch the tenant destination after host routing is reviewed and implemented.

## Security Notes

The login redirect flow:

- uses authenticated server context after sign-in
- uses `getCurrentUserWorkspaceOptions()`
- does not use service-role keys
- does not trust client-submitted `organisation_id`
- does not accept arbitrary `returnTo`
- does not redirect to external hosts
- does not bypass RLS
- returns only safe internal app routes

## Non-Goals

This task does not add:

- tenant subdomain redirects
- middleware host routing
- tenant-specific login
- workspace switcher in app header
- Platform Admin domain separation
- invite/password reset changes
- tenant provisioning
- domain management UI
- database migrations
- RLS or permission changes

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
