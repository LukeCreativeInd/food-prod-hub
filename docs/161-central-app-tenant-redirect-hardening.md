# Central App Tenant Redirect Hardening

Task 161 removes the temporary behaviour where `app.everybatchmrp.com/dashboard` could render the Clean Eats tenant workspace.

This task does not change DNS, Vercel, Supabase Auth, database schema, migrations, RLS, permissions, tenant provisioning, Platform Admin business logic, tenant app business logic, sidebars, design or packages.

Task 162 records live redirect QA after this hardening. See [Live Domain Redirect QA Pass](162-live-domain-redirect-qa-pass.md).

Task 163 polishes the central workspace selector cards and documents live-domain destination behaviour. See [Workspace Selector Live Domain QA / Polish](163-workspace-selector-live-domain-qa-polish.md).

Task 165 adds inline workspace choices to the tenant sidebar account menu while preserving these central-app redirect rules.

## Correct Domains

| Domain | Purpose |
| --- | --- |
| `app.everybatchmrp.com` | Central login and workspace selector gateway. |
| `admin.everybatchmrp.com` | Platform Admin. |
| `cleaneats.everybatchmrp.com` | Clean Eats tenant workspace. |
| `localhost` | Permissive local development. |

Do not use `admin.everybatchmrp.com.au` for Platform Admin routing.

## Issue

Before this task, the central app domain could still render tenant workspace pages directly because Clean Eats was the development/default fallback tenant.

That meant:

- `app.everybatchmrp.com/dashboard` could return the Clean Eats dashboard.
- `app.everybatchmrp.com/components` could attempt to render tenant workspace pages.

The central app should act as a gateway only. Tenant workspaces should render from tenant subdomains.

## Final Central Gateway Rule

On `app.everybatchmrp.com`:

- `/login` remains allowed.
- `/select-workspace` remains allowed.
- `/platform` redirects to `https://admin.everybatchmrp.com/platform`.
- `/platform/*` redirects to the same path on `https://admin.everybatchmrp.com`.
- tenant workspace routes redirect to `/select-workspace?next=...`.

Middleware does not read Supabase session, profile, membership or organisation data. It only performs host/path redirects that are safe without authentication state.

## Tenant Route Redirect Behaviour

Central app tenant routes include:

- `/dashboard`
- `/suppliers`
- `/ingredients`
- `/packaging`
- `/components`
- `/recipes`
- `/finished-products`
- `/costings`
- `/ingredient-costs`
- `/packaging-costs`
- `/component-costs`
- `/meal-margins`
- `/price-history`
- `/production-report`
- `/production-plan`
- `/production-areas`
- `/production-tasks`
- `/facility-tasks`
- `/inventory`
- `/goods-inwards`
- `/batch-receiving`
- `/stock-locations`
- `/stock-movements`
- `/purchasing`
- `/bom-traceability`
- `/purchase-documents`
- `/organisation-settings`
- `/users`
- `/modules`
- `/integrations`

Examples:

| Central app URL | Redirect |
| --- | --- |
| `https://app.everybatchmrp.com/dashboard` | `/select-workspace?next=%2Fdashboard` |
| `https://app.everybatchmrp.com/components` | `/select-workspace?next=%2Fcomponents` |
| `https://app.everybatchmrp.com/finished-products` | `/select-workspace?next=%2Ffinished-products` |

After that, the server-side workspace selector decides the correct authenticated destination.

## Workspace Selector Domain Redirects

On `app.everybatchmrp.com`:

- Clean Eats workspace selection redirects to `https://cleaneats.everybatchmrp.com/dashboard`.
- If a safe `next` path is present, Clean Eats redirects to that path on the tenant subdomain.
- Platform Admin selection redirects to `https://admin.everybatchmrp.com/platform`.

Examples:

| Selector context | Destination |
| --- | --- |
| Clean Eats selected | `https://cleaneats.everybatchmrp.com/dashboard` |
| Clean Eats selected with `next=/components` | `https://cleaneats.everybatchmrp.com/components` |
| Platform Admin selected | `https://admin.everybatchmrp.com/platform` |

The selected workspace is still validated server-side. Client-provided slugs are not trusted without validation.

## Login Redirect Behaviour

After login:

- unauthenticated/no session -> `/login`
- no active workspace -> `/no-access`
- one tenant workspace -> tenant subdomain dashboard
- platform admin plus tenant workspace -> `/select-workspace`
- platform admin only -> `https://admin.everybatchmrp.com/platform`

On localhost, destinations remain local development paths.

## Tenant Subdomain Behaviour Preserved

On `cleaneats.everybatchmrp.com`:

- `/dashboard` still loads the tenant app after auth.
- `/select-workspace` redirects to `/dashboard`.
- `/platform` and `/platform/*` redirect to `/dashboard`.

## Platform Admin Behaviour Preserved

On `admin.everybatchmrp.com`:

- `/platform` and `/platform/*` are allowed, then existing auth/platform guards apply.
- `/dashboard` redirects to `/platform`.
- tenant workspace routes do not render.

## Localhost Exception

Localhost and local/private development hosts remain permissive:

- `/dashboard` remains local.
- `/platform` remains local.
- `/components` remains local.

This keeps development and preview work practical.

## Future Work

- Add database-backed tenant domain lookup.
- Add a reviewed `tenant_domains` table.
- Support arbitrary tenant subdomains after tenant-domain records exist.
- Add tenant-aware central gateway UX for multiple workspaces.
- Add tenant-specific login styling.

## Migration Notes

No SQL migration was created or changed.
