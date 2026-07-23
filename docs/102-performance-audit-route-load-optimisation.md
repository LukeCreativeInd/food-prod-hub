# Performance Audit and Route Load Optimisation

## Status

Initial route load optimisation has been added for the current Clean Eats Hub app.

This task improves perceived loading behaviour and adds development-only timing diagnostics. It does not change Supabase schema, RLS, permissions, auth rules, Platform Admin behaviour, supplier parsers, Purchase Document commit logic, stock movement logic or business module logic.

## Routes With Loading Skeletons

Route-level loading states were added for:

- `/dashboard`
- `/inventory`
- `/purchase-documents`
- `/purchase-documents/[id]`

These loading states use a shared skeleton component so slow server-rendered route transitions show a structured placeholder instead of a blank wait.

## PDF Preview Deferral

The Purchase Document review page no longer creates a signed source-file URL on the initial page load.

Default behaviour:

- source file metadata remains visible
- extraction and review actions remain available
- no service-role key is used
- private storage remains private
- the source PDF preview is not embedded immediately

When a reviewer clicks **Show source preview**, the page reloads with `?preview=source`, creates a short-lived signed URL and shows:

- **Open source document**
- embedded PDF preview

This keeps the heavy private-storage preview out of the default route load while preserving reviewer access.

## Development Timing Diagnostics

Small development-only route timing logs were added for:

- app shell navigation context loading
- Purchase Document list loading
- Purchase Document review loading

The logs are guarded by `NODE_ENV !== "production"` and include only safe operational counts/timings such as:

- duration in milliseconds
- permission count
- enabled module count
- visible navigation group count
- purchase document count
- purchase document line count
- whether a signed source URL was requested

They do not log tokens, signed URLs, secrets or full business records.

## Baseline Routes To Watch

Use local timing, Vercel Speed Insights and Vercel Web Analytics to compare:

- `/dashboard`
- `/inventory`
- `/purchase-documents`
- `/purchase-documents/[id]`
- `/products`
- `/costing-overview`

Useful comparisons:

- first load after idle
- repeated warm load
- Luke/platform_admin route timing
- phase_1_demo_user route timing
- route timing before and after opening a PDF preview

## Behaviour Preserved

Preserved behaviour:

- auth guards remain in place
- permission guards remain in place
- demo user restrictions remain in place
- Tools navigation and Supplier Invoice Intake route remain unchanged
- Purchase Document upload/extract/review/commit remains review-first
- existing supplier parsers remain unchanged
- Products and Costings read-only data views remain unchanged
- formula workspaces remain unchanged
- RLS and storage policies remain unchanged

## Known Limits

This optimisation improves perceived route loading and removes one avoidable signed URL request from the default review page load.

It does not by itself solve:

- Vercel cold starts
- Vercel/Supabase region distance
- slow RLS query plans under production usage
- large future route data sets
- PDF rendering time after the reviewer explicitly opens the preview

## Next Recommended Steps

After deployment:

1. Compare Vercel Speed Insights route metrics before and after this change.
2. Use dev timing logs locally to identify route helper waterfalls.
3. Record route timing observations in the existing performance/hosting review notes.
4. Continue avoiding broad data queries in route-level server components.
