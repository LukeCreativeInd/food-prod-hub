# Development Standards

## Scope Control

- Codex must not invent business rules.
- Codex must not build beyond the requested scope.
- Codex must not remove existing functionality unless instructed.
- If a business rule is unclear, ask before assuming.

## Engineering Standards

- Keep code modular and reusable.
- Prefer configuration over hard-coded business logic.
- Use TypeScript.
- Keep UI consistent with design system components.

## Completion Checks

Before completing tasks, run:

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm build`

After every task, explain the changed files.
