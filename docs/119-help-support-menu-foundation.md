# Help / Support Menu Foundation

## Purpose

Task 119 adds the first EveryBatch Help & Support menu to the persistent app header.

This is a lightweight linkout foundation only. It does not build a knowledge base, support ticket system, support database, notification centre, support roles, support impersonation, route-specific documentation engine or in-app support workflow.

## Support Domain Target

Target support domain:

```text
support.everybatchmrp.com
```

Added static URL constants in:

```text
lib/platform-brand.ts
```

The support URL paths are placeholders for the future support site:

- `https://support.everybatchmrp.com/knowledge-base`
- `https://support.everybatchmrp.com/module-guides`
- `https://support.everybatchmrp.com/support`
- `https://support.everybatchmrp.com/contact`

The app links to those target URLs, but it does not create or host those support pages.

Task 172 adds [Support Domain And Auth-Gated Help Centre Plan](172-support-domain-auth-gated-help-centre-plan.md), which defines the future authenticated support-domain purpose, guide IA, ticket model and setup sequence. The Help menu remains a linkout placeholder until support routing is implemented.

## Header Menu

Added:

```text
components/help-support-menu.tsx
```

The menu appears in the top header between global search and the notification placeholder.

Menu links:

- Knowledge Base
- Module Guides
- Submit Support Ticket
- Contact Support

All links open in a new tab with `rel="noopener noreferrer"`.

## Contextual Help Foundation

The menu uses the static page title helper from task 118 to show the current page name, for example:

```text
Current page: Dashboard
```

It also notes that page-specific guides are coming soon.

This does not add route-to-guide mapping, database lookups, support content, or module-specific help logic.

## Accessibility And Theme Notes

The menu:

- has an accessible Help and Support button label
- supports Escape close
- closes on outside click
- uses tenant theme tokens for light/dark readability
- does not add data fetching
- does not call auth, Supabase, server actions or route handlers

## Non-Goals

This task does not add:

- knowledge base site
- ticket forms
- ticket database
- support audit logs
- support roles or permissions
- support impersonation
- notification backend
- global search changes
- tenant subdomain routing
- login changes
- Platform Admin functionality
- Supplier Invoice Intake changes

## Follow-Ups

Future tasks can separately plan:

- actual support site routing/content
- module guide publishing
- support ticket workflow
- page-to-guide mapping
- support/help analytics
- support-mode/admin access rules if ever needed

## Migration Notes

No SQL migration was created.

No manual Supabase setup is required for this task.
