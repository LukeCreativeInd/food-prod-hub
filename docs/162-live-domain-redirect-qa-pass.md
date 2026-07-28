# Live Domain Redirect QA Pass

Task 162 records live redirect QA after task 161 central app tenant redirect hardening.

This task is documentation-first. It does not change DNS, Vercel, Supabase Auth, database schema, migrations, RLS, permissions, tenant provisioning, Platform Admin business logic, tenant app business logic, sidebars, design or packages.

Test date: 28 July 2026

## Final Domain Map

| Domain | Purpose |
| --- | --- |
| `app.everybatchmrp.com` | Central login and workspace selector gateway. |
| `admin.everybatchmrp.com` | Platform Admin. |
| `cleaneats.everybatchmrp.com` | Clean Eats tenant workspace. |
| `localhost` | Permissive local development. |

The correct Platform Admin domain is `admin.everybatchmrp.com`. Do not use `admin.everybatchmrp.com.au`.

## QA Purpose

This QA pass checks that:

- central app tenant routes no longer render Clean Eats directly
- central Platform routes redirect to the Platform Admin domain
- Platform Admin blocks tenant workspace routes
- Clean Eats tenant host blocks Platform Admin routes
- Clean Eats tenant host skips the generic workspace selector
- localhost remains development-friendly

## Expected Redirect Matrix

Central app:

| URL | Expected |
| --- | --- |
| `https://app.everybatchmrp.com/login` | Loads central login. |
| `https://app.everybatchmrp.com/select-workspace` | Redirects to login when signed out; loads selector when signed in. |
| `https://app.everybatchmrp.com/dashboard` | Redirects to `/select-workspace?next=%2Fdashboard`. |
| `https://app.everybatchmrp.com/components` | Redirects to `/select-workspace?next=%2Fcomponents`. |
| `https://app.everybatchmrp.com/finished-products` | Redirects to `/select-workspace?next=%2Ffinished-products`. |
| `https://app.everybatchmrp.com/platform` | Redirects to `https://admin.everybatchmrp.com/platform`. |
| `https://app.everybatchmrp.com/platform/tenants` | Redirects to `https://admin.everybatchmrp.com/platform/tenants`. |

Platform Admin:

| URL | Expected |
| --- | --- |
| `https://admin.everybatchmrp.com` | Redirects to `/platform`. |
| `https://admin.everybatchmrp.com/login` | Loads login or redirects safely if already signed in. |
| `https://admin.everybatchmrp.com/platform` | Loads Platform Admin after auth. |
| `https://admin.everybatchmrp.com/dashboard` | Redirects to `/platform`. |
| `https://admin.everybatchmrp.com/components` | Redirects to `/platform`. |

Clean Eats tenant:

| URL | Expected |
| --- | --- |
| `https://cleaneats.everybatchmrp.com` | Redirects to `/dashboard`. |
| `https://cleaneats.everybatchmrp.com/login` | Loads login. |
| `https://cleaneats.everybatchmrp.com/dashboard` | Loads Clean Eats tenant app after auth. |
| `https://cleaneats.everybatchmrp.com/components` | Loads after auth and permission checks. |
| `https://cleaneats.everybatchmrp.com/finished-products` | Loads after auth and permission checks. |
| `https://cleaneats.everybatchmrp.com/select-workspace` | Redirects to `/dashboard`. |
| `https://cleaneats.everybatchmrp.com/platform` | Redirects to `/dashboard`. |

Localhost:

| URL | Expected |
| --- | --- |
| `http://localhost:3000/dashboard` | Allowed locally. |
| `http://localhost:3000/platform` | Allowed locally, then existing auth guard applies. |
| `http://localhost:3000/select-workspace` | Allowed locally, then existing auth guard applies. |

## Live Signed-Out Header Results

These results were captured from live HTTPS header checks. They verify signed-out/public redirect behaviour only.

| Domain | Path | Expected | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `app.everybatchmrp.com` | `/login` | Login loads | `200` | Pass | Central login reachable. |
| `app.everybatchmrp.com` | `/select-workspace` | Signed-out redirects to login | `307 -> /login` | Pass | Selector remains behind auth. |
| `app.everybatchmrp.com` | `/dashboard` | Redirect to selector with next path | `307 -> /select-workspace?next=%2Fdashboard` | Pass | Clean Eats no longer renders directly from central domain. |
| `app.everybatchmrp.com` | `/components` | Redirect to selector with next path | `307 -> /select-workspace?next=%2Fcomponents` | Pass | Clean Eats component route no longer renders directly from central domain. |
| `app.everybatchmrp.com` | `/finished-products` | Redirect to selector with next path | `307 -> /select-workspace?next=%2Ffinished-products` | Pass | Path preservation works. |
| `app.everybatchmrp.com` | `/platform` | Redirect to admin domain | `307 -> https://admin.everybatchmrp.com/platform` | Pass | Platform Admin separated from central app. |
| `app.everybatchmrp.com` | `/platform/tenants` | Redirect preserving path to admin domain | `307 -> https://admin.everybatchmrp.com/platform/tenants` | Pass | Path suffix preserved. |
| `admin.everybatchmrp.com` | `/` | Redirect to `/platform` | `307 -> /platform` | Pass | Admin domain now resolves from Codex environment. |
| `admin.everybatchmrp.com` | `/login` | Login loads | `200` | Pass | Admin login route reachable. |
| `admin.everybatchmrp.com` | `/platform` | Existing auth guard handles signed-out user | `307 -> /login` | Pass | Middleware allows Platform route; auth guard redirects signed-out user. |
| `admin.everybatchmrp.com` | `/dashboard` | Redirect to `/platform` | `307 -> /platform` | Pass | Tenant dashboard does not render on admin host. |
| `admin.everybatchmrp.com` | `/components` | Redirect to `/platform` | `307 -> /platform` | Pass | Tenant components do not render on admin host. |
| `cleaneats.everybatchmrp.com` | `/` | Redirect to `/dashboard` | `307 -> /dashboard` | Pass | Tenant host selects Clean Eats workspace. |
| `cleaneats.everybatchmrp.com` | `/login` | Login loads | `200` | Pass | Tenant login route reachable. |
| `cleaneats.everybatchmrp.com` | `/dashboard` | Tenant app allowed | `200` | Pass | Tenant dashboard route allowed. |
| `cleaneats.everybatchmrp.com` | `/components` | Existing auth guard handles signed-out user | `307 -> /login` | Pass | Tenant route allowed; app auth guard redirects signed-out user. |
| `cleaneats.everybatchmrp.com` | `/finished-products` | Existing auth guard handles signed-out user | `307 -> /login` | Pass | Tenant route allowed; app auth guard redirects signed-out user. |
| `cleaneats.everybatchmrp.com` | `/select-workspace` | Redirect to `/dashboard` | `307 -> /dashboard` | Pass | Tenant host does not show generic selector. |
| `cleaneats.everybatchmrp.com` | `/platform` | Redirect to `/dashboard` | `307 -> /dashboard` | Pass | Platform Admin does not render on tenant host. |

## Workspace Selector QA

These behaviours require signed-in browser testing because the selector validates Supabase auth, profile and memberships server-side.

| Scenario | Expected | Status | Notes |
| --- | --- | --- | --- |
| Visit `https://app.everybatchmrp.com/select-workspace` as `platform_admin` | Shows Clean Eats workspace and Platform Admin Console | Manual check needed | Header checks only confirm signed-out redirect. |
| Select Clean Eats from central selector | Redirects to `https://cleaneats.everybatchmrp.com/dashboard` | Manual check needed | Uses validated server action destination. |
| Visit `https://app.everybatchmrp.com/components` as signed-in user | Redirects to selector with `next=/components` | Header check passed for redirect | Manual selector click should preserve the next path. |
| Select Clean Eats after `next=/components` | Redirects to `https://cleaneats.everybatchmrp.com/components` | Manual check needed | Path is preserved through hidden `next` input. |
| Select Platform Admin from central selector | Redirects to `https://admin.everybatchmrp.com/platform` | Manual check needed | Localhost remains `/platform`. |

## Localhost QA

Localhost was not changed by task 162. It remains intentionally permissive for development:

- `/dashboard` stays local.
- `/platform` stays local, then existing auth guards apply.
- `/select-workspace` stays local, then existing auth guards apply.

## Known Issues

No live redirect failures were found in this QA pass.

Known development caveat:

- stale local Supabase refresh-token cookies can briefly show `Invalid Refresh Token: Refresh Token Not Found` on login. If it recurs, a future auth hardening task should clear stale session/cookies gracefully.

## Follow-Up Tasks

- future dynamic tenant domain lookup
- future reviewed `tenant_domains` table
- future app-domain marketing/coming-soon split if needed
- future tenant-specific login branding
- future central gateway UX polish
- future signed-in browser QA after any Supabase Auth redirect URL changes

## Migration Notes

No SQL migration was created or changed.
