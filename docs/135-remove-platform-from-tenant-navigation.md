# Remove Platform From Tenant Navigation

## Purpose

Task 135 removes Platform Admin from the Clean Eats tenant workspace sidebar.

Platform Admin now has its own EveryBatch-branded shell at:

```text
/platform
```

It should not appear as a normal tenant module inside the Clean Eats workspace.

## What Changed

Updated tenant navigation source:

```text
lib/navigation.ts
```

Removed the tenant sidebar root item:

```text
Platform -> /platform
```

No Platform route, guard, permission or page was removed.

## Platform Access Preserved

Platform Admin remains accessible through:

- `/select-workspace` Platform Admin Console card for platform admins
- direct `/platform` URL for platform admins

Existing Platform routes remain:

```text
/platform
/platform/tenants/cleaneats
/platform/tenants/cleaneats/modules
/platform/tenants/cleaneats/features
```

## Tenant App Behaviour

Tenant workspace navigation no longer shows Platform.

Other tenant navigation groups remain unchanged:

- Dashboard
- Inventory
- Products
- Costings
- Production
- QA
- Logistics
- CRM
- Reports
- Tools
- Admin

Tenant global search, Help menu, user menu, tenant branding and Supplier Invoice Intake are unchanged.

## Security And Data Notes

No changes were made to:

- database schema
- migrations
- RLS
- permissions
- module records
- Platform Admin guards
- login redirects
- workspace selector
- tenant subdomain routing

Demo/non-platform users remain blocked from Platform Admin through the existing access rules.

## Future Domain

The future Platform Admin domain remains planned:

```text
platform.everybatchmrp.com
```

It is not connected or activated by this task.
