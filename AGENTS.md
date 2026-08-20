<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Lint (must pass pre-commit) | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |
| Tests | `npm run test` |
| Tests (watch) | `npm run test:watch` |
| Prisma generate | `npm run prisma:generate` |
| Prisma migrate | `npm run prisma:migrate` |
| Prisma db push | `npm run prisma:push` |

Pre-commit hook runs `npm run lint`. Commit messages are enforced by commitlint (conventional commits).

## Commit conventions

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`, `build`, `revert`. Subject must not be empty, must be lowercase.

## Prisma

Schema is in `prisma/schema.prisma`. The generated client output is non-standard — it lives at `lib/generated/prisma`, not the default `node_modules`. Import it as:

```ts
import { prisma } from "@/lib/prisma"; // singleton wrapper
// or directly:
import { PrismaClient } from "./generated/prisma/client";
```

The project uses `@prisma/adapter-pg` (driver adapter pattern) for Supabase Postgres. The singleton in `lib/prisma.ts` caches the client on `globalThis` in dev to avoid connection pool exhaustion during hot reload.

## Testing

Vitest with jsdom. `globals: true` in config — `describe`, `it`, `expect` are available globally, no imports needed. Setup file: `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`.

## Path alias

`@/*` maps to the project root (configured in `tsconfig.json`).

## ESLint

ESLint 9 flat config. `components/ui/**` files have relaxed rules (no-explicit-any off, react-compiler off, set-state-in-effect off).

## Key architecture

- **Next.js 16 App Router** with `output: "standalone"` in `next.config.ts`
- **Clerk** for auth (`@clerk/nextjs`). Admin routes protected by middleware checking `ADMIN_USER_ID` env var against `auth().userId`.
- **Supabase** for image storage (not Postgres — DB is raw Supabase-hosted Postgres via Prisma). Upload uses a `main-bucket`.
- **Anthropic shopping assistant** — agentic tool-use loop in `app/api/assistant/route.ts`. Set `MOCK_ANTHROPIC="true"` in `.env` to test without API credits. See `docs/AGENTIC_AI.md` for details.
- **Server actions** in `utils/actions.ts` — all DB mutations go through here, validated with Zod schemas from `utils/schema.ts`.
- **shadcn/ui** components in `components/ui/`. Theme: New York style, Zinc palette, CSS variables.
- Remote image hostnames in `next.config.ts`: `images.pexels.com`, `img.clerk.com`, `orduvdboqsuhpjmfdyhm.supabase.co`. Add new hosts there if needed.

## Incomplete pages

`/cart`, `/favorites`, `/orders`, `/reviews` have route stubs but no implementation yet.
