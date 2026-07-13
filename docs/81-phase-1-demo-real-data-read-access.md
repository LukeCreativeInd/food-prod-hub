# Phase 1 Demo Real Data Read Access

## Status

Migration 021 has been drafted for manual Supabase review/application.

This step allows the Clean Eats Phase 1 demo role to view read-only real supplier, item and price data inside Phase 1 Products and Costings pages.

It does not grant Purchase Document Intake access, upload, review, commit, admin, platform, QA, logistics, CRM, reports, write/manage permissions or service-role access.

## Business Decision

The Phase 1 demo user should be able to test the first Clean Eats modules with real read-only records created by reviewed Purchase Document Intake commits.

The intended demo scope remains:

- Dashboard
- Products
- Costings
- Production
- Inventory

Sensitive intake and administration areas remain blocked.

## Migration

Created:

```text
supabase/migrations/021_grant_phase_1_demo_real_data_read_permissions.sql
```

The migration grants only:

- `supplier_items.view`
- `supplier_prices.view`

to:

- `phase_1_demo_user`

It uses an idempotent `insert into public.role_permissions ... on conflict do nothing` pattern.

## What The Demo User Can See After Applying

After the migration is manually applied, the Phase 1 demo user should be able to access:

- `/dashboard`
- `/products`
- `/suppliers`
- `/ingredients`
- `/packaging`
- `/costing-overview`
- `/ingredient-costs`
- `/price-history`
- existing visible Production pages
- existing visible Inventory pages except Purchase Documents

Expected read-only real data examples after a Cammaroto commit:

- Cammaroto supplier data in `/suppliers`
- `Chicken Thigh` in `/ingredients`
- approved current supplier price in `/ingredient-costs`
- current price and price observation data in `/price-history`

`CTNS` / `CARTONS` remains informational and should not appear in Ingredients, Packaging or Ingredient Costs.

## What Remains Blocked

The Phase 1 demo user should still be blocked from:

- `/purchase-documents`
- `/purchase-documents/[id]`
- invoice upload
- invoice extraction
- invoice review
- invoice commit
- `/platform`
- Admin pages
- QA
- Logistics
- CRM
- Reports

The role is not granted:

- `purchase_documents.view`
- `purchase_documents.upload`
- `purchase_documents.review`
- `purchase_documents.commit`
- `supplier_items.manage`
- `supplier_prices.manage`
- admin permissions
- platform permissions

## RLS Approach

RLS is not changed.

Existing policies continue to enforce:

- active tenant membership
- `supplier_items.view` for supplier, alias, supplier item, internal item and mapping reads
- `supplier_prices.view` for price observation and approved supplier price reads
- `purchase_documents.view` for purchase document and purchase document line reads

Because the demo role does not receive `purchase_documents.view`, raw uploaded documents, document lines and intake actions remain hidden.

Some optional source document labels/counts may stay hidden by RLS for the demo user. That is acceptable because Purchase Document Intake is intentionally blocked.

## Testing Checklist

After manually applying Migration 021:

Platform admin:

- can still access Purchase Documents
- can still access Platform Admin
- can still access Products/Costings real data

Phase 1 demo user:

- can access `/dashboard`
- can access `/suppliers`
- can access `/ingredients`
- can access `/packaging`
- can access `/ingredient-costs`
- can access `/price-history`
- sees real read-only supplier/internal item/price data
- cannot access `/purchase-documents`
- cannot access `/purchase-documents/[id]`
- cannot upload, extract, review or commit invoices
- cannot access `/platform`
- cannot access Admin, QA, Logistics, CRM or Reports
- cannot create, edit or delete supplier/item/price records

Signed out:

- protected pages redirect to `/login`

## Manual Application

Do not apply this migration automatically from Codex.

Review and apply `supabase/migrations/021_grant_phase_1_demo_real_data_read_permissions.sql` manually in Supabase, then test the demo role.
