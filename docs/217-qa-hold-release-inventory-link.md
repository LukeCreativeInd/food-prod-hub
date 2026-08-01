# QA Hold/Release Inventory Link

Task 217 adds the first formal QA-driven inventory availability workflow.

## What changed

- Created migration `041_qa_hold_release_inventory_link.sql`.
- Added controlled RPCs/helpers for availability, placement and release:
  - `public.get_inventory_lot_qa_hold_availability(uuid[])`
  - `public.place_qa_inventory_lot_hold(...)`
  - `public.release_qa_inventory_lot_hold(...)`
- Replaced the `/qa/holds` scaffold with real hold list/detail/new routes.
- Added a formal hold action from Receiving QA when a posted line has a real inventory lot and a result recommends hold review.
- Updated Stock On Hand so active or release-requested formal QA holds remove the full lot from available quantity without changing physical quantity.
- Updated Inventory Traceability and Goods Inwards to show linked formal QA hold context.

## Source-of-truth boundaries

- QA owns `qa_holds` and append-only `qa_hold_events`.
- Inventory owns `inventory_lots` and `stock_movements`.
- Stock On Hand remains derived from posted stock movement ledger rows plus formal QA hold state.
- Physical stock quantity is not changed by hold or release.
- Historical Goods Inwards, inventory lot and stock movement records are not edited by this task.

## RPC security

The write RPCs use `SECURITY DEFINER` because task 215 intentionally left `qa_holds` and `qa_hold_events` without direct authenticated INSERT/UPDATE policies. The Stock On Hand availability helper also uses `SECURITY DEFINER` as a narrow read boundary so inventory-authorised users receive correct held/available results without being granted detailed QA hold visibility.

All functions:

- use `set search_path = public`;
- contain no dynamic SQL;
- derive actor profile with `public.current_profile_id()`;
- derive organisation from the selected lot or hold;
- require active organisation membership;
- revoke execute from `public` and `anon`;
- grant execute to `authenticated` only.

`get_inventory_lot_qa_hold_availability(uuid[])` requires `stock_movements.view` and returns only `inventory_lot_id`, `is_held` and `active_hold_status`. It deliberately does not expose hold reason, notes, source QA records, actors or event history.

The placement/release RPCs require `qa.holds.place` or `qa.holds.release` and validate same-tenant source QA records. Lot/hold lookup first filters to active-member records, so an inaccessible other-tenant id is indistinguishable from not found.

## Included

- Full inventory-lot hold placement.
- Full inventory-lot release.
- Existing open-hold duplicate protection.
- Linked Receiving QA source validation.
- Append-only hold event creation.
- Stock On Hand held/available split from formal hold state.
- Traceability visibility for hold source, status and event timeline.

## Not Included

- Partial quantity holds.
- Receipt-header holds.
- Location-wide holds.
- Production-batch or finished-output holds.
- Dispatch blocking.
- Disposal, return or rejection stock movement workflows.
- Stock adjustment or reversal implementation.
- NC/CA operational tables or workflows.
- Production consumption/output stock movement logic.
- Direct client writes to `qa_holds` or `qa_hold_events`.
- Broad `qa.holds.view` grants to inventory-only roles or demo users.

## Smoke Checks

Before applying migration 041:

```sql
select proname, prosecdef
from pg_proc
join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
where nspname = 'public'
  and proname in (
    'get_inventory_lot_qa_hold_availability',
    'place_qa_inventory_lot_hold',
    'release_qa_inventory_lot_hold'
  );
```

After applying migration 041:

```sql
select routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'get_inventory_lot_qa_hold_availability',
    'place_qa_inventory_lot_hold',
    'release_qa_inventory_lot_hold'
  );
```

```sql
select grantee, routine_name, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name in (
    'get_inventory_lot_qa_hold_availability',
    'place_qa_inventory_lot_hold',
    'release_qa_inventory_lot_hold'
  )
order by routine_name, grantee;
```

Expected:

- `authenticated` has execute.
- `anon` and `public` do not have execute.
- No new storage policies, table grants or direct QA hold write policies are created.
- Stock On Hand roles with `stock_movements.view` can resolve held/available state without `qa.holds.view`.

## Manual Retest

1. Post a Goods Inwards receipt with at least one inventory lot.
2. Complete a Receiving QA check with a result that recommends hold review.
3. Open the Receiving QA detail page and place a formal hold.
4. Confirm `/qa/holds` lists the hold.
5. Confirm `/stock-on-hand` shows physical quantity unchanged and held quantity populated.
6. Confirm `/inventory-traceability` links the hold and Receiving QA source.
7. Release the hold from `/qa/holds/[id]`.
8. Confirm Stock On Hand availability returns without a new stock movement.

## Next

Task 218 should not expand this into stock adjustments, reversals, disposal, NC/CA or production stock consumption unless explicitly requested. The next safe increment is a focused QA hold QA pass or a reviewed stock adjustment/reversal task.
