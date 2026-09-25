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
