# Workspace Options Helper Foundation

## Purpose

Task 126 adds a server-side helper foundation for future central login and tenant selector behaviour.

The helper answers:

- which active EveryBatch tenant workspaces the signed-in user can access
- whether the signed-in user is a `platform_admin`
- which default post-login destination should be used later
- what safe metadata a future tenant selector will need

This task does not change login redirect behaviour.

## Files Added

Added:

```text
lib/workspace-options.ts
```

## Helper Functions

The helper exports:

- `getCurrentUserWorkspaceOptions()`
- `getWorkspaceOptionsForProfile(profileId)`
- `getDefaultPostLoginDestination(workspaceOptions)`
- `validateWorkspaceSelection(selection)`

These helpers use the authenticated Supabase server client.

They do not use service-role keys and do not bypass RLS.

## Data Returned

`getCurrentUserWorkspaceOptions()` returns:

- current user id, or `null` when signed out
- authenticated state
- `isPlatformAdmin`
- active workspace options
- default destination guidance

Each workspace option includes:

- organisation id
- tenant slug
- organisation display name
- workspace display name
- role key
- access level
- organisation status
- membership status
- logo URL when readable
- theme mode when readable

Logo values are returned only as stored/readable metadata. The helper does not generate signed URLs.

## Default Destination Rules

The helper computes destination guidance only. It does not redirect.

Rules:

| Case | Destination type | Current href | Future target |
| --- | --- | --- | --- |
| Signed out | `no_access` | `/login` | central login |
| One active tenant workspace, not platform admin | `tenant` | `/dashboard` | `https://{tenant_slug}.everybatchmrp.com/dashboard` |
| Multiple active tenant workspaces | `selector` | `/select-workspace` | tenant selector |
| `platform_admin` with no tenant workspaces | `platform` | `/platform` | `https://platform.everybatchmrp.com` |
| `platform_admin` with tenant workspaces | `selector` | `/select-workspace` | selector with Platform Admin option |
| No active workspaces and not platform admin | `no_access` | `/no-access` | no workspace access state |

`/select-workspace` is a planned route. It is not created by this task.

## Platform Admin Handling

The current data model represents roles through organisation memberships.

For now, `isPlatformAdmin` is detected from active membership rows where:

```text
role_key = platform_admin
```

This matches the current auth, membership and RLS foundations.

Long term, Platform Admin may separate further as `platform.everybatchmrp.com` becomes its own operator console.

## Workspace Selection Validation

`validateWorkspaceSelection(selection)` prepares future selector submit handling.

It validates that:

- a user is signed in
- the requested tenant matches one of the user's active workspace options, or
- the user is `platform_admin` and the tenant slug resolves through the tenant resolver

It returns validation results and destination guidance.

It does not redirect.

It does not trust client-submitted `organisation_id` by itself.

## Security Rules

Important rules preserved:

- no service-role key usage
- no RLS bypass
- no client-trusted organisation id
- active memberships only
- active, non-archived organisations only where available
- no signed URL generation
- no cross-tenant data beyond what RLS allows
- no route-wide app shell calls added
- no open redirect helper added yet

The future selector action must revalidate workspace selection server-side before redirecting.

## Why Login Redirect Is Not Changed Yet

The current login route still redirects signed-in users to:

```text
/dashboard
```

That behaviour is intentionally preserved.

The workspace helper is a foundation for the next implementation steps:

1. add selector UI
2. update login post-auth destination rules
3. activate tenant subdomain routing later

Changing login redirects before the selector route exists would create avoidable dead ends.

## Example Outcomes

| Example user | Helper outcome |
| --- | --- |
| Clean Eats-only user | one workspace, default tenant destination `/dashboard` with future Clean Eats subdomain target |
| Platform admin with Clean Eats membership | platform admin true, selector destination so the user can choose tenant or Platform Admin later |
| Platform admin only | platform destination `/platform` |
| No active workspace | no-access destination `/no-access` |

## Future Tasks

Recommended next tasks:

- build `/select-workspace`
- add server action for workspace selection
- update login redirect to use `getDefaultPostLoginDestination()`
- add safe redirect target helper
- activate tenant subdomain destinations after routing is ready
- handle tenant-branded login later

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
