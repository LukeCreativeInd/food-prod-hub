# Global Search Foundation

## Purpose

Task 112 turns the top header search placeholder into a basic global search for the Clean Eats Hub app shell.

It is a lightweight foundation only. It does not add an external search service, full-text search indexes, OCR, PDF content search, advanced filters, saved searches, create/edit actions, stock movements, purchase orders, production planning, costing rollups, Supplier Invoice Intake parser changes or Platform Admin changes.

Future user-facing platform naming should align with EveryBatch. Search remains scoped to the current tenant workspace and should continue to respect tenant-specific branding, modules and permissions.

## What Was Added

Added a reusable header search control:

```text
components/global-search.tsx
```

Added a server API endpoint:

```text
app/api/global-search/route.ts
```

Added a server-side search helper:

```text
lib/global-search.ts
```

The existing header search placeholder in `components/app-shell.tsx` now renders the functional search control.

## Search UI

The header search now supports:

- click to open
- `Cmd+K` on Mac or `Ctrl+K` elsewhere
- debounced searching after 2 or more characters
- grouped result sections
- loading state
- empty state
- click-to-navigate results
- Enter to open the first result when available
- Escape to close

Search closes after navigation and preserves the normal app shell.

## Search Scope

The foundation search covers:

- Pages from the accessible navigation registry
- Suppliers
- Products / Internal Items
- Supplier Catalogue Items
- Stock Locations
- Costings / Prices
- Supplier Invoice Intake Documents
- Formulas

Purchase document search only searches document-level fields such as invoice number, filename, supplier/source names and status. It does not search uploaded PDF contents, extracted invoice text or purchase document lines yet.

Costings search includes current approved supplier prices and lightweight recent price observations. It matches through linked internal item and supplier item fields, not raw invoice line text.

Supplier Catalogue Item search also checks confirmed supplier-item mappings, so searches for canonical internal item names such as Chicken Thigh can return the linked supplier-facing catalogue rows even when the supplier description uses different wording.

## Permission Model

Search derives context server-side.

The browser only sends the text query. The search helper resolves:

- current authenticated user
- current profile/membership/organisation context
- active organisation id
- current permission keys
- current enabled module keys

The client does not send an organisation id, role key, permission list or module list.

## Tenant Safety

All data queries are scoped to the current organisation id resolved on the server.

The helper also relies on existing Supabase RLS policies. If RLS blocks a query, that group returns no results rather than exposing data.

## Module And Access Behaviour

Pages are built from `lib/navigation.ts` and filtered through the same permission/module metadata used by the app shell.

Entity groups are also gated:

- Products/Internal Items and Supplier Catalogue Items require the Products module and `supplier_items.view`, matching the Products real-data pages and current RLS policies.
- Inventory locations require the Inventory module and `inventory.view`.
- Supplier Invoice Intake documents require the Tools module and `purchase_documents.view`.
- Costings/prices require the Costings module and `costings.view`.
- Formulas require the Products module and `formulas.view` or `products.view`.

Admin and Platform pages only appear when the current user can see those navigation entries.

## Demo User Behaviour

The Phase 1 demo user can search visible read-only product, costing, production and inventory data according to the permissions already granted.

The demo user does not receive Supplier Invoice Intake document results because the demo role does not have `purchase_documents.view`.

The demo user does not receive Admin or Platform page results unless future permissions explicitly allow those routes.

## Performance Safeguards

The first version keeps search intentionally small:

- 2-character minimum query
- 300 ms client debounce
- no query until the search UI has input
- result limits per group
- small selected field lists only
- no source document signed URLs
- no PDF or extracted text search
- one consolidated server search helper per request
- current organisation and permission context resolved server-side

No SQL indexes were added in this task. Existing indexes from recent performance work remain unchanged.

## Known Limitations

- Ranking is simple matching, not fuzzy search.
- Keyboard navigation is limited to Escape and Enter for the first result.
- Costing and formula result matching is intentionally lightweight.
- Purchase document line text and extracted invoice text are not searchable.
- There is no recent-search or saved-search behaviour.
- Search result groups are read-only navigation targets only.

## Future Follow-Ups

- Add richer keyboard navigation and highlighted result selection.
- Consider full-text indexes only after real search usage identifies a need.
- Add invoice line/extracted text search as a separate reviewed task.
- Add advanced filters for supplier, item type, module and status if staff usage calls for them.
- Add recent searches if the search interaction becomes a frequent workflow.

## Verification Expectations

After implementation:

- `/dashboard` keeps the normal app shell and header search.
- `Cmd+K` / `Ctrl+K` opens search.
- 1-character queries do not call the search endpoint.
- 2+ character queries return grouped results when data is visible.
- clicking a result navigates with normal client routing.
- hidden module/admin/platform results remain hidden.
- Supplier Invoice Intake documents remain hidden for users without `purchase_documents.view`.

## Migration Notes

No SQL migration was created.

No Supabase setup is required for this task.
