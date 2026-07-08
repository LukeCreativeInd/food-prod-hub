# Food Prod Hub / Clean Eats Hub

Food Prod Hub is a modular food manufacturing operations platform. Clean Eats Hub is the first client implementation and currently guides the first platform foundation work.

## Project Overview

The platform is intended to support food manufacturers with one operating hub and modular workflows. Clean Eats is Client 1, but the codebase should be planned so future clients can use configurable modules without client-specific forks.

The current app includes the foundation for an internal operations hub: app shell, grouped module navigation, placeholder pages, Tailwind CSS styling, and Supabase environment placeholders. Business logic, authentication, database schema, costing calculations, and complex Supabase behavior are intentionally not implemented yet.

## Current Status

- Current phase: Platform foundation
- App shell and placeholder module pages exist
- Design direction is Clean Eats-inspired while platform planning remains reusable
- Documentation has been added for product direction, architecture, roadmap, development standards, release process, discovery notes, and Codex working rules
- Supabase Auth helper foundation exists, but login and route protection are not implemented yet

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase

## How To Run Locally

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase project values when they are available.

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If `pnpm` asks you to approve dependency build scripts, review the listed packages and approve them according to your local development policy.

## Documentation

- [Product vision](docs/01-product-vision.md)
- [Platform architecture](docs/02-platform-architecture.md)
- [Module roadmap](docs/03-module-roadmap.md)
- [Development standards](docs/04-development-standards.md)
- [Release process](docs/05-release-process.md)
- [Clean Eats discovery notes](docs/06-clean-eats-discovery-notes.md)
- [Codex working rules](docs/07-codex-working-rules.md)
- [Tenant / organisation architecture](docs/08-tenant-organisation-architecture.md)
- [Database foundation plan](docs/09-database-foundation-plan.md)
- [Supabase / auth plan](docs/10-supabase-auth-plan.md)
- [First database migrations plan](docs/11-first-database-migrations-plan.md)
- [Backend foundation review](docs/12-backend-foundation-review.md)
- [Auth and RLS planning](docs/13-auth-and-rls-planning.md)
- [Auth implementation checklist](docs/14-auth-implementation-checklist.md)
- [Auth helper foundation](docs/15-auth-helper-foundation.md)

## Database Migrations

Reviewed SQL migration and seed files live in `supabase/migrations`. They are committed for review before being applied to Supabase, including tenant foundation, organisation settings, and branding migrations.

The first backend foundation block is summarised in [Backend foundation review](docs/12-backend-foundation-review.md).

The next security phase is planned in [Auth and RLS planning](docs/13-auth-and-rls-planning.md).

The practical auth build sequence is tracked in [Auth implementation checklist](docs/14-auth-implementation-checklist.md).

The initial auth helper structure is documented in [Auth helper foundation](docs/15-auth-helper-foundation.md).

## Current Scope

- Clean internal app shell with grouped module navigation
- Placeholder pages for the Clean Eats Hub modules
- Green and white Clean Eats-style visual foundation
- Supabase client/server auth helper foundation

No costing logic, login UI, route protection, RLS policies, app database queries, or complex Supabase behavior has been added.
