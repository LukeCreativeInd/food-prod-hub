# Workspace Switcher Foundation

## Purpose

Task 129 adds a simple workspace switch entry inside the authenticated app UI.

The goal is to let signed-in users return to:

```text
/select-workspace
```

from inside the current app shell.

## UI Added

The top-right user dropdown in the authenticated app shell now includes:

```text
Switch workspace
```

Target:

```text
/select-workspace
```

The entry appears above `Sign out`.

## Visibility Rule

The switch entry is shown to authenticated app-shell users.

This intentionally avoids adding another route-wide workspace-options query to the app shell.

Long term, the entry can become conditional when workspace options are already available in a shared app context without extra query cost.

## Behaviour

Current behaviour:

- clicking `Switch workspace` opens `/select-workspace`
- `/select-workspace` validates workspace choices server-side
- selecting Clean Eats routes to `/dashboard`
- Platform Admin option routes to `/platform`
- no tenant subdomain redirects occur

## Platform Admin Context

Platform Admin still exists inside the current app structure.

When the user menu is present, `Switch workspace` remains the way back to the central workspace selector.

This task does not split Platform Admin to:

```text
platform.everybatchmrp.com
```

## Performance And Security Notes

This task:

- does not add route-wide workspace option queries
- does not use service-role keys
- does not trust client-provided organisation ids
- does not add external redirects
- uses the existing internal `/select-workspace` route
- keeps workspace validation inside the selector server action

## Non-Goals

This task does not add:

- workspace switcher modal
- tenant subdomain redirects
- middleware host routing
- tenant-specific login
- Platform Admin domain separation
- tenant provisioning
- workspace management UI
- user account settings overhaul
- billing/account switcher
- database migrations
- RLS or permission changes

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
