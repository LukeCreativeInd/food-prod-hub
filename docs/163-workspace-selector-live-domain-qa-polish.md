# Workspace Selector Live Domain QA / Polish

Task 163 verifies and lightly polishes the central EveryBatch workspace selector now that live app, admin and tenant domains are active.

This task does not change DNS, Vercel, Supabase Auth, database schema, migrations, RLS, permissions, tenant provisioning, Platform Admin business logic, tenant app business logic, sidebars, navigation order, design systems or packages.

## Purpose

The workspace selector belongs on:

- `app.everybatchmrp.com`
- localhost for development

The selector decides which EveryBatch surface the signed-in user should open:

- Clean Eats tenant workspace
- EveryBatch Platform Admin

Tenant subdomains should not show the generic selector because the tenant is already selected by the host.

## Domain Destinations

| Workspace option | Type | Destination |
| --- | --- | --- |
| Clean Eats Hub | Tenant workspace | `cleaneats.everybatchmrp.com` |
| EveryBatch Platform Admin | Operator console | `admin.everybatchmrp.com` |

On localhost, destinations remain local:

- Clean Eats -> `/dashboard` or preserved local tenant path
- Platform Admin -> `/platform`

## UX Polish Added

The selector cards now show:

- workspace name
- workspace type
- destination domain
- short description
- status badge
- clearer action labels

Clean Eats card:

- Label: Clean Eats Hub
- Type: Tenant workspace
- Destination: `cleaneats.everybatchmrp.com`
- Description: Open the Clean Eats production, inventory, products and costings workspace.
- Button: Open Clean Eats

Platform Admin card:

- Label: EveryBatch Platform Admin
- Type: Operator console
- Destination: `admin.everybatchmrp.com`
- Description: Manage tenants, provisioning, modules, feature flags and platform operations.
- Button: Open Platform Admin

The page context now explains that tenant workspaces open on their own tenant domains and that destinations are built from known EveryBatch domains.

## Next Path Preservation

Safe `next` paths continue through the selector.

Expected behaviour:

| Starting URL | Clean Eats selection destination |
| --- | --- |
| `https://app.everybatchmrp.com/select-workspace` | `https://cleaneats.everybatchmrp.com/dashboard` |
| `https://app.everybatchmrp.com/select-workspace?next=%2Fdashboard` | `https://cleaneats.everybatchmrp.com/dashboard` |
| `https://app.everybatchmrp.com/select-workspace?next=%2Fcomponents` | `https://cleaneats.everybatchmrp.com/components` |
| `https://app.everybatchmrp.com/select-workspace?next=%2Ffinished-products` | `https://cleaneats.everybatchmrp.com/finished-products` |

Platform Admin behaviour:

| Starting URL | Platform Admin selection destination |
| --- | --- |
| `https://app.everybatchmrp.com/select-workspace` | `https://admin.everybatchmrp.com/platform` |
| `https://app.everybatchmrp.com/select-workspace?next=%2Fplatform%2Ftenants` | `https://admin.everybatchmrp.com/platform/tenants` |
| `https://app.everybatchmrp.com/select-workspace?next=%2Fcomponents` | `https://admin.everybatchmrp.com/platform` |

Tenant next paths do not change the Platform Admin destination.

## Open Redirect Protection

The selector only accepts internal `next` values that:

- are strings
- begin with a single `/`
- do not begin with `//`

Rejected examples:

- `https://evil.com`
- `//evil.com`
- empty values
- relative values without a leading slash

Final cross-domain destinations are built from known constants only:

- `admin.everybatchmrp.com`
- `{tenant_slug}.everybatchmrp.com`

The selected workspace is still validated server-side before redirecting.

## Domain Behaviour

Confirmed existing rules:

- `cleaneats.everybatchmrp.com/select-workspace` redirects to `/dashboard`.
- `cleaneats.everybatchmrp.com/platform` redirects to `/dashboard`.
- `app.everybatchmrp.com/dashboard` redirects to `/select-workspace?next=%2Fdashboard`.
- `app.everybatchmrp.com/components` redirects to `/select-workspace?next=%2Fcomponents`.
- `app.everybatchmrp.com/platform` redirects to `https://admin.everybatchmrp.com/platform`.

`admin.everybatchmrp.com/select-workspace` remains safe under the existing design. Platform admins normally use `admin.everybatchmrp.com/platform`.

## Manual QA Steps

Live signed-out header checks:

| URL | Actual | Status | Notes |
| --- | --- | --- | --- |
| `https://app.everybatchmrp.com/select-workspace` | `307 -> /login` | Pass | Selector remains behind auth. |
| `https://app.everybatchmrp.com/select-workspace?next=%2Fcomponents` | `307 -> /login` | Pass | Signed-in browser QA is needed for card click destination. |
| `https://app.everybatchmrp.com/select-workspace?next=%2Ffinished-products` | `307 -> /login` | Pass | Signed-in browser QA is needed for card click destination. |
| `https://app.everybatchmrp.com/select-workspace?next=https://evil.com` | `307 -> /login` | Pass | Signed-out route stays behind auth; unsafe next values are ignored by server-side selector logic. |
| `https://app.everybatchmrp.com/select-workspace?next=//evil.com` | `307 -> /login` | Pass | Signed-out route stays behind auth; unsafe next values are ignored by server-side selector logic. |
| `https://app.everybatchmrp.com/dashboard` | `307 -> /select-workspace?next=%2Fdashboard` | Pass | Central app does not render tenant dashboard directly. |
| `https://app.everybatchmrp.com/components` | `307 -> /select-workspace?next=%2Fcomponents` | Pass | Central app does not render tenant components directly. |
| `https://app.everybatchmrp.com/platform` | `307 -> https://admin.everybatchmrp.com/platform` | Pass | Platform Admin separated from central app. |
| `https://cleaneats.everybatchmrp.com/select-workspace` | `307 -> /dashboard` | Pass | Tenant host does not show generic selector. |
| `https://admin.everybatchmrp.com/select-workspace` | `307 -> /login` | Pass | Selector remains behind auth on admin host. |

Signed-in platform admin:

- [ ] Visit `https://app.everybatchmrp.com/select-workspace`.
- [ ] Confirm Clean Eats card shows destination `cleaneats.everybatchmrp.com`.
- [ ] Confirm Platform Admin card shows destination `admin.everybatchmrp.com`.
- [ ] Select Clean Eats and confirm it opens `https://cleaneats.everybatchmrp.com/dashboard`.
- [ ] Select Platform Admin and confirm it opens `https://admin.everybatchmrp.com/platform`.

Path preservation:

- [ ] Visit `https://app.everybatchmrp.com/select-workspace?next=%2Fcomponents`.
- [ ] Select Clean Eats and confirm it opens `https://cleaneats.everybatchmrp.com/components`.
- [ ] Visit `https://app.everybatchmrp.com/select-workspace?next=%2Ffinished-products`.
- [ ] Select Clean Eats and confirm it opens `https://cleaneats.everybatchmrp.com/finished-products`.
- [ ] Visit `https://app.everybatchmrp.com/select-workspace?next=%2Fplatform%2Ftenants`.
- [ ] Select Platform Admin and confirm it opens `https://admin.everybatchmrp.com/platform/tenants`.

Open redirect checks:

- [ ] Visit `https://app.everybatchmrp.com/select-workspace?next=https://evil.com`.
- [ ] Confirm no external destination is shown or used.
- [ ] Visit `https://app.everybatchmrp.com/select-workspace?next=//evil.com`.
- [ ] Confirm no external destination is shown or used.

Local development:

- [ ] `http://localhost:3000/select-workspace` keeps Clean Eats local.
- [ ] `http://localhost:3000/select-workspace?next=%2Fcomponents` keeps Clean Eats local at `/components`.
- [ ] Platform Admin opens `/platform` locally.

## Known Follow-Ups

- future dynamic tenant domain lookup
- future reviewed `tenant_domains` table
- future tenant-specific login branding
- future central gateway UX polish
- future stale Supabase refresh-token cleanup if the local warning recurs

## Migration Notes

No SQL migration was created or changed.
