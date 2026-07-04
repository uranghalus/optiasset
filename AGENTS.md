<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OptiAsset — agent guide

## Dev commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (runs `next dev --turbo`) |
| Build | `npm run build` |
| Lint | `npm run lint` (eslint) |
| Seed DB | `npm run seed` (uses `tsx`) |
| Push schema + gen client | `npm run prisma:push` (runs `prisma db push && prisma generate`) |
| Docker dev | `npm run docker:dev` |

## Architecture

- **Auth**: [better-auth](https://better-auth.com) v1.5.6 with organization plugin, username plugin, admin plugin. Server: `lib/auth.ts` (better-auth instance). Client: `lib/auth-client.ts`. Session retrieval: `getServerSession()` from `lib/get-session.ts`.
- **Database**: MySQL/MariaDB via Prisma v7.5. Prisma client is generated at `generated/prisma/` (not default location). Uses `@prisma/adapter-mariadb` for a custom driver adapter. Config in `prisma.config.ts`.
- **Storage**: S3-compatible (MinIO) via `@aws-sdk/client-s3`. Server actions in `action/s3-action.ts` and `lib/s3-utils.ts`. Upload, delete, and presigned URL helpers.
- **UI**: Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn/ui "radix-lyra" style, `tw-animate-css`, lucide-react icons.
- **Schema validation**: Zod v4 in `schema/` directory (16 files).
- **Path alias**: `@/*` maps to repo root.

## Key conventions

- Server actions live in `action/` (21 files, one per domain).
- Zod schemas live in `schema/`, one per entity.
- shadcn components in `components/ui/`.
- Context providers in `context/`.
- Custom hooks in `hooks/`.
- Route groups: `(app)` for authenticated pages, `(auth)` for login.
- Prisma generated client is `.gitignore`d — must be regenerated after schema changes.
- Docker dev: `docker-compose.dev.yml` (mounts source, runs `npm run dev`). Production: `Dockerfile` (multi-stage, `node:24-alpine`).
