# Permission-Aware Sidebar

## Status

The sidebar now hides selected admin/configuration links when the current signed-in app user does not have the matching view permission.

This is a navigation visibility improvement only. Route guards remain the real access control.

Update: sidebar visibility now also considers enabled tenant modules. See [Enabled-Module-Aware Navigation](25-enabled-module-aware-navigation.md).

## What Changed

Admin navigation items now carry a `requiredPermission` value in `lib/navigation.ts`.

The protected `AppShell` reads the current user's active permission keys on the server and passes filtered navigation groups into the client sidebar.

Empty navigation groups are hidden after filtering.

## Permission-Filtered Links

| Sidebar link | Route | Required permission |
| --- | --- | --- |
| Organisation Settings | `/organisation-settings` | `admin.organisation.view` |
| Users | `/users` | `admin.users.view` |
| Modules | `/modules` | `admin.modules.view` |
| Integrations | `/integrations` | `admin.integrations.view` |

For Luke/platform admin, all admin links should still show.

## Security Note

Hidden links are UX only.

Access is still enforced by route guards:

- `requireAppAccess()`
- `requirePermissionAccess(permissionKey)`

A user without an admin permission may not see the sidebar link, and direct navigation to the route will still redirect to `/no-access`.

## Links Intentionally Left Permission-Unfiltered

For now, these remain permission-visible after app access is granted when their modules are enabled:

- Dashboard
- Products links
- Costings links
- Operations links
- Quality-related placeholder links
- Business links
- Reports

Broader module permission filtering will come later.

## RLS Reminder

RLS is still not enabled. Sidebar visibility is an app-level UX step only.

## Next Recommended Step

The next recommended step is enabled-module-aware navigation or broader permission route planning.
