# Public Auth and Protected App Layouts

## Status

The public login screen has been separated from the protected app shell.

This is a layout structure cleanup only. It does not add RLS, database migrations, middleware, permission-based route restrictions, business module logic or live module data queries.

## Layout Structure Changed

The root app layout now provides only the shared document shell and global background.

The protected application shell has been moved into:

- `components/app-shell.tsx`

`AppShell` renders:

- Existing sidebar.
- Existing navigation.
- Existing main content area.
- Existing logout button in the sidebar.

The login page does not use `AppShell`, so it renders as a standalone public auth screen.

## Public Routes

Public auth route:

- `/login`

`/login` still checks whether a Supabase Auth user is already signed in. Signed-in users are redirected to `/dashboard`.

## Protected App Shell Routes

Protected app routes keep the existing sidebar/app shell, including:

- `/`
- `/dashboard`
- `/organisation-settings`
- `/modules`
- `/users`
- `/integrations`
- Existing product/module placeholder page URLs
- Production, costing, inventory, purchasing, QA, reports, CRM, logistics and wholesale placeholder URLs

Custom dashboard/admin pages render inside `AppShell` directly.

Module placeholder pages render inside `AppShell` through the shared `PlaceholderPage` component.

## Why `/login` Has No Sidebar

The login page is a public auth screen. Showing module navigation and a logout control on the login screen made it look like the user was already inside the app.

Keeping `/login` standalone makes the auth entry point clearer while preserving the app shell for signed-in app pages.

## Route Protection Preserved

Basic route protection still uses:

- `requireAuth()`

Protected pages still redirect unauthenticated users to:

- `/login`

Update: protected app layout pages now use membership-aware access where appropriate. Users with missing profile, membership or organisation context are sent to `/access-issue`.

Permission enforcement is still not added.

## Intentionally Not Changed

- No RLS policies.
- No middleware.
- No permission-based route gates.
- No membership-aware route guard.
- No sidebar redesign.
- No dashboard redesign.
- No module placeholder content changes.
- No production, costing, inventory or QA business data queries.
- No service-role key usage.

## Next Recommended Step

The next recommended planning step is membership-aware route guard or permission-aware route planning.

That should define how profile, membership, organisation and permission checks are applied before enabling RLS broadly.

## RLS Reminder

RLS is still not enabled. It should remain deferred until route protection, membership context and permission enforcement are tested carefully.
