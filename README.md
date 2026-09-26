# Newshelf

Newshelf is a dedicated inbox and reader for newsletters.

Users receive a personal inbound address, subscribe to newsletters with it, and read incoming issues in a clean, focused interface rather than mixing them with normal email.

## MVP north star

A real newsletter sent from the internet to a Newshelf user's inbound address must reliably become a safe, readable Issue in that user's Inbox.

```text
Newsletter → Resend → webhook → RawEmail → queue → parser/sanitizer → Issue → Inbox → Reader
```

## Documentation
- `AGENTS.md` — instructions for Codex/agents
- `docs/PRODUCT.md` — product definition and scope
- `docs/MVP.md` — milestones, issues and acceptance criteria
- `docs/ARCHITECTURE.md` — system architecture and boundaries
- `docs/DATA_MODEL.md` — initial domain/data model
- `docs/SECURITY.md` — MVP security requirements

## Planned stack
Next.js + TypeScript, Vercel, Supabase (Postgres/Auth/Storage), Drizzle, Resend Inbound Email, Supabase Queues, Zod, Vitest and Playwright.

## Development principle
Build the critical vertical slice before secondary features. Do not implement Saved, Archive, Search, dark mode or other convenience features until a real inbound newsletter can travel end-to-end into the Reader.

## Local environment

Copy `.env.example` to `.env.local` and fill in values from the Supabase project dashboard. Variables prefixed with `NEXT_PUBLIC_` are intentionally browser-safe. `SUPABASE_SECRET_KEY` and both database URLs are server-only and must never be imported into client components or committed.

Use the Supabase transaction-pooler connection string for `SUPABASE_DATABASE_URL`. Runtime connections use a single application-side connection, require TLS, and disable prepared statements for transaction-pooler compatibility.

Use the direct connection string for `SUPABASE_MIGRATION_DATABASE_URL`. If the development network cannot reach Supabase's IPv6 direct endpoint, use the session-pooler connection string instead. Drizzle Kit loads `.env.local` first and `.env` second.

## Database workflow

- `pnpm db:generate` generates migrations in `src/db/migrations` from `src/db/schema`.
- `pnpm db:check` checks generated migrations for consistency.
- `pnpm db:migrate` applies pending migrations using `SUPABASE_MIGRATION_DATABASE_URL`.
- `pnpm db:studio` opens Drizzle Studio against the migration connection.

Migration commands require real development credentials. Review generated SQL before applying it, and never point local migration commands at production unintentionally.

## Authentication configuration

Authentication uses `@supabase/ssr` with cookie-based sessions. Browser and server clients use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `SUPABASE_SECRET_KEY` remains server-only and is not used for user authentication.

For local development, configure Supabase Authentication URL settings with:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/confirm`

If Confirm Email is enabled, update the Confirm signup email template link to:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm email</a>
```

With email confirmation enabled, signup displays a confirmation-required message and the confirmation route exchanges the token hash for a cookie-backed session. With confirmation disabled, signup creates the session immediately and redirects to the temporary `/account` verification page.
