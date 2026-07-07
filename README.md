# Clean Eats Hub

Internal food operations platform for Clean Eats.

This is the Hub foundation. It includes the app shell, grouped module navigation, placeholder pages, Tailwind CSS styling, and Supabase environment placeholders. Business logic, authentication, database schema, and costing calculations are intentionally not implemented yet.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase

## Getting Started

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

## Current Scope

- Clean internal app shell with grouped module navigation
- Placeholder pages for the Clean Eats Hub modules
- Green and white Clean Eats-style visual foundation
- Supabase client environment placeholders

No costing logic, database schema, authentication, or complex Supabase behavior has been added.
