# Live Multi-Domain Smoke Test Results

Task 160 records live smoke test results after the recent EveryBatch domain routing work.

This is documentation only. It does not change DNS, Vercel, Supabase Auth, database schema, migrations, RLS, permissions, Platform Admin logic, tenant app logic, sidebars, design or packages.

Test date: 28 July 2026

Task 161 supersedes the temporary central dashboard caveat recorded here. After task 161, `app.everybatchmrp.com/dashboard` should redirect through `/select-workspace?next=%2Fdashboard` instead of rendering the Clean Eats fallback workspace.

## Domains Tested

| Domain | Purpose |
| --- | --- |
| `app.everybatchmrp.com` | Central login and workspace selector gateway. |
| `admin.everybatchmrp.com` | Platform Admin. |
| `cleaneats.everybatchmrp.com` | Clean Eats tenant workspace. |
| `localhost` | Permissive local development. |

## Expected Behaviour

Central app:

| URL | Expected |
| --- | --- |
| `https://app.everybatchmrp.com/login` | Loads central login. |
| `https://app.everybatchmrp.com/select-workspace` | Loads workspace selector when signed in; redirects to login when signed out. |
| `https://app.everybatchmrp.com/dashboard` | After task 161, redirects to `/select-workspace?next=%2Fdashboard`. |
| `https://app.everybatchmrp.com/platform` | Redirects to `https://admin.everybatchmrp.com/platform`. |
| `https://app.everybatchmrp.com/platform/tenants` | Redirects to `https://admin.everybatchmrp.com/platform/tenants`. |

Platform Admin:

| URL | Expected |
| --- | --- |
| `https://admin.everybatchmrp.com` | Redirects to `/platform`. |
| `https://admin.everybatchmrp.com/login` | Loads login. |
| `https://admin.everybatchmrp.com/platform` | Loads Platform Admin after auth. |
| `https://admin.everybatchmrp.com/dashboard` | Redirects to `/platform`. |
| `https://admin.everybatchmrp.com/components` | Redirects to `/platform`. |
| `https://www.admin.everybatchmrp.com` | Only works if a `www.admin` host is intentionally configured. |

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
| `http://localhost:3000/login` | Loads login. |
| `http://localhost:3000/dashboard` | Allowed for development. |
| `http://localhost:3000/platform` | Allowed for development, then existing auth guards apply. |

## Live Header Results

These results were captured with live HTTPS header checks from Codex. They cover signed-out/public behaviour only and do not replace signed-in browser smoke testing.

| Domain | Path | Expected | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `app.everybatchmrp.com` | `/` | Redirect to login or central app entry | `307 -> /login` | Pass | Signed-out root redirects to login. |
| `app.everybatchmrp.com` | `/login` | Login loads | `200` | Pass | Central login reachable. |
| `app.everybatchmrp.com` | `/select-workspace` | Signed-out redirects to login | `307 -> /login` | Pass | Workspace selector remains behind auth. |
| `app.everybatchmrp.com` | `/dashboard` | Temporary Clean Eats fallback may load | `200` | Superseded by task 161 | Task 161 changes this expected behaviour to `/select-workspace?next=%2Fdashboard`. |
| `app.everybatchmrp.com` | `/platform` | Redirect to admin domain | `307 -> https://admin.everybatchmrp.com/platform` | Pass | Platform Admin is no longer served from central app. |
| `app.everybatchmrp.com` | `/platform/tenants` | Redirect preserving path to admin domain | `307 -> https://admin.everybatchmrp.com/platform/tenants` | Pass | Path suffix preserved. |
| `admin.everybatchmrp.com` | `/` | Redirect to `/platform` | DNS did not resolve from Codex environment | Needs manual check | Verify Vercel/Cloudflare DNS and SSL from Luke's browser/network. |
| `admin.everybatchmrp.com` | `/login` | Login loads | DNS did not resolve from Codex environment | Needs manual check | Same DNS resolution caveat. |
| `admin.everybatchmrp.com` | `/platform` | Platform Admin after auth | DNS did not resolve from Codex environment | Needs manual check | Same DNS resolution caveat. |
| `admin.everybatchmrp.com` | `/dashboard` | Redirect to `/platform` | DNS did not resolve from Codex environment | Needs manual check | Same DNS resolution caveat. |
| `admin.everybatchmrp.com` | `/components` | Redirect to `/platform` | DNS did not resolve from Codex environment | Needs manual check | Same DNS resolution caveat. |
| `www.admin.everybatchmrp.com` | `/` | Optional only if configured | DNS did not resolve from Codex environment | Informational | No issue if `www.admin` is not configured. |
| `cleaneats.everybatchmrp.com` | `/` | Redirect to `/dashboard` | `307 -> /dashboard` | Pass | Tenant root selects Clean Eats workspace. |
| `cleaneats.everybatchmrp.com` | `/login` | Login loads | `200` | Pass | Tenant login route reachable. |
| `cleaneats.everybatchmrp.com` | `/dashboard` | Tenant app allowed | `200` | Pass | Signed-out/header check reaches route; browser auth state may redirect as needed. |
| `cleaneats.everybatchmrp.com` | `/components` | Existing auth guard handles signed-out users | `307 -> /login` | Pass | Tenant host allowed route; app auth guard redirects signed-out user. |
| `cleaneats.everybatchmrp.com` | `/finished-products` | Existing auth guard handles signed-out users | `307 -> /login` | Pass | Tenant host allowed route; app auth guard redirects signed-out user. |
| `cleaneats.everybatchmrp.com` | `/select-workspace` | Redirect to `/dashboard` | `307 -> /dashboard` | Pass | Tenant host does not show generic workspace selector. |
| `cleaneats.everybatchmrp.com` | `/platform` | Redirect to `/dashboard` | `307 -> /dashboard` | Pass | Platform Admin does not render on tenant host. |

## Signed-In Browser Tests To Complete

Platform admin:

- [ ] Login via `https://app.everybatchmrp.com/login`.
- [ ] Workspace selector shows Clean Eats workspace and Platform Admin Console.
- [ ] Opening Platform Admin sends user to `https://admin.everybatchmrp.com/platform`.
- [ ] `https://cleaneats.everybatchmrp.com/dashboard` loads Clean Eats workspace.
- [ ] `https://cleaneats.everybatchmrp.com/platform` redirects to `/dashboard`.

Tenant/demo user:

- [ ] Login succeeds from allowed URLs.
- [ ] `https://cleaneats.everybatchmrp.com/dashboard` loads for authorised tenant users.
- [ ] `https://cleaneats.everybatchmrp.com/components` follows existing permission/module rules.
- [ ] Platform Admin remains blocked for non-platform users.

Admin domain:

- [ ] Confirm `admin.everybatchmrp.com` resolves in the intended live browser/network.
- [ ] Confirm Vercel shows the domain as valid.
- [ ] Confirm Cloudflare DNS points to the Vercel target.
- [ ] Confirm SSL is valid.

## Superseded Temporary Behaviour

`https://app.everybatchmrp.com/dashboard` may still load the Clean Eats tenant workspace because Clean Eats is the current dev/default fallback tenant.

Task 161 hardens the central app dashboard route:

- single tenant user -> tenant subdomain dashboard
- multiple workspaces -> `app.everybatchmrp.com/select-workspace`
- platform admin -> `admin.everybatchmrp.com/platform` when Platform Admin is selected
- signed-out user -> login

## Known Local / Dev Warning

During local testing, `/login` may briefly show:

```text
Invalid Refresh Token: Refresh Token Not Found
```

This appears to be a stale local Supabase session/cookie condition. In the observed case, login then worked and the warning disappeared.

No auth logic was changed for task 160. If this keeps recurring, a future auth hardening task should catch stale refresh-token errors and clear stale session/cookies gracefully.

## Follow-Up Tasks

- 161 — Central App Tenant Redirect Hardening completed in code after these live results were recorded
- Future — dynamic tenant domain management with reviewed tenant domain records
- Future — tenant-specific login styling
- Future — branded no-access and 404 pages

## Migration Notes

No SQL migration was created or changed.
