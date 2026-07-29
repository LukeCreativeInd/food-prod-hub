# App Shell And Auth Page UI Cleanup

Task 175 cleans up visual regressions across the EveryBatch auth pages and Platform Admin shell.

This task does not change database schema, migrations, RLS, permissions, Supabase Auth settings, DNS/Vercel settings, middleware/domain routing, workspace selection rules, tenant provisioning actions, Platform Admin business logic, tenant app business logic, Supplier Invoice Intake, Costings, Formula, Sell Price, Margins or packages.

## Login Layout Cleanup

`/login` now uses a balanced desktop grid where the EveryBatch brand panel and login form card stretch to the same visual row height.

The cleanup:

- removes competing large panel min-heights
- keeps the desktop panels visually balanced
- keeps the form card compact and centred
- keeps mobile stacked and usable
- preserves the existing login form and auth behaviour

## Workspace Selector Layout Cleanup

`/select-workspace` now uses the same balanced desktop panel approach.

The cleanup:

- keeps the green EveryBatch brand panel aligned with the white workspace selector card
- avoids the brand panel towering over the workspace cards
- preserves workspace cards, destination domains and server-side workspace validation
- preserves Clean Eats and Platform Admin selection behaviour
- keeps mobile stacked and usable

## Platform Admin Sidebar Footer

The Platform Admin sidebar footer now more closely matches the tenant shell pattern.

The cleanup:

- adds a bottom-left Platform Admin account block
- keeps Switch workspace and Sign out inside the account menu
- places the collapse control underneath the account block
- keeps collapsed sidebar mode compact
- leaves mobile Platform menu behaviour intact

The account block uses safe fallback labels only:

- Platform Admin
- Operator console

No new profile, role or backend queries were added.

## Platform Admin Submenu Cleanup

Platform Admin child submenu rows are now cleaner and less visually heavy.

The cleanup:

- keeps icons on top-level/group rows
- removes repeated large icons from child rows
- removes repeated Live badges from child rows
- keeps a subtle dot/active state for child links
- keeps Soon labels only for disabled child rows
- preserves accordion, collapsed-sidebar and mobile menu behaviour

## Behaviour Preserved

- `/login` still works
- `/select-workspace` still works
- workspace selection routing is unchanged
- `/platform` still works for authorised Platform Admin users
- `/dashboard` and tenant app navigation are unchanged
- `/support` routes are unchanged
- no migrations were created

## Follow-Ups

- Replace temporary EB text mark with final EveryBatch logo/icon assets when available.
- Consider showing real Platform Admin user identity in the sidebar account block after profile display rules are reviewed.
