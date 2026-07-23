# Inventory Locations Foundation

## Status

The first tenant-owned Inventory Locations foundation has been drafted.

This task adds the database migration draft, real stock location list/create UI, a simple location detail/edit page and development timing diagnostics. It does not add stock balances, stock movements, goods inwards receiving, batch receiving, purchase orders, traceability, QA hold workflows, delete actions, Supplier Invoice Intake changes, Products CRUD changes, Platform Admin changes or navigation moves.

## Migration

Migration drafted:

- `supabase/migrations/024_inventory_locations_foundation.sql`

The migration creates:

- `public.inventory_locations`

The table is tenant-owned through `organisation_id` and references `public.organisations(id)`.

## Supported Fields

Inventory locations support:

- location code
- name
- location type
- area
- temperature zone
- status: active or inactive
- notes
- created/updated timestamps
- archived timestamp placeholder

Location codes are normalised by the app to uppercase key-safe values.

## Starter Clean Eats Locations

The migration seeds these Clean Eats starter locations idempotently:

- KITCHEN
- PREPACK
- PACKING
- COOLROOM
- FREEZER
- DRYSTORE
- GOODSIN
- DISPATCH
- QUARANTINE
- WASTE

These are master records only. They do not create stock quantities or operational transactions.

## Permission Behaviour

Read access uses the existing permission:

- `inventory.view`

Create/edit access uses the existing permission:

- `inventory.manage`

No new permissions are added.

The phase 1 demo user is expected to remain read-only because the demo role has `inventory.view` but not `inventory.manage`.

## RLS Behaviour

RLS is enabled on `public.inventory_locations`.

Policies allow:

- SELECT for platform admins or active organisation members with `inventory.view`
- INSERT for platform admins or active organisation members with `inventory.manage`
- UPDATE for platform admins or active organisation members with `inventory.manage`

No DELETE policy is created.

## UI Behaviour

The `/stock-locations` page now shows real tenant location records.

It includes:

- summary cards
- location directory
- create form for authorised users
- read-only restricted state for users without manage access

The `/stock-locations/[id]` page shows:

- location details
- edit form for authorised users
- read-only restricted state for users without manage access

## Tenant Safety

Tenant safety rules:

- `organisation_id` comes from the authenticated app context
- the client never submits `organisation_id`
- create checks for duplicate location code and duplicate name within the current organisation
- edit verifies the location belongs to the current organisation
- edit never changes `organisation_id`
- records are made inactive instead of deleted

## Performance Notes

Development-only timing diagnostics were added for:

- `inventory.locations-list`
- `inventory.location-detail`
- `inventory.location-create`
- `inventory.location-update`

The logs include safe counts/status/duration only and do not log secrets or sensitive auth data.

Route loading placeholders were added for the list and detail pages. They intentionally avoid the full app shell so they do not add extra protected-route/auth context work during loading.

## Non-Goals

Not included:

- stock balances
- stock movements
- goods inwards receiving
- batch receiving
- purchase orders
- stocktake/counting
- barcode scanning
- QA hold/release workflows
- production issue/return workflows
- traceability reports
- delete actions
- Supplier Invoice Intake changes
- Platform Admin changes

## Future Work

Future inventory work can connect these master locations to goods inwards, stock movements, production usage, batch traceability, stocktake workflows and QA hold/release handling after the table has been reviewed and applied.
