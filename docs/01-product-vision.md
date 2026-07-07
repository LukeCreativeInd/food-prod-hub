# Product Vision

Food Prod Hub is a modular food manufacturing operations platform.

Clean Eats is Client 1.

The platform should be built for food manufacturers first, but designed so future clients can use configurable modules. The core idea is one login, one operating hub, and modular business workflows.

Clean Eats workflows should guide the first build, but the architecture should remain reusable for future tenants. Avoid hard-coding Clean Eats-specific logic where configurable rules would be better.

## Direction

- Build for real food manufacturing operations before generic business software.
- Treat Clean Eats as the first implementation, not the only implementation.
- Keep workflows modular so clients can enable the areas they need.
- Prefer tenant and module configuration over client-specific code.
- Keep shared platform concepts reusable across future tenants.
