# AGENTS.md — Newshelf

## Mission
Newshelf is a dedicated inbox and reader for newsletters. The MVP must let a user sign up, receive a unique inbound email address, receive a real newsletter through Resend, process it safely, show it in an inbox, and read it in a clean reader.

## Source of truth
Before changing code, read:
1. `AGENTS.md`
2. `docs/PRODUCT.md`
3. `docs/MVP.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DATA_MODEL.md`
6. `docs/SECURITY.md`

If code and docs disagree, stop and call out the conflict rather than silently changing product or architecture decisions.

## MVP stack
- Next.js + React + TypeScript (strict)
- pnpm
- Vercel
- Supabase: PostgreSQL, Auth, Storage
- Drizzle ORM (provisional but preferred for MVP)
- Resend Inbound Email
- Supabase Queues / pgmq for durable processing
- Zod for boundary validation
- Vitest for unit/integration tests
- Playwright for critical E2E flows

Do not replace these technologies without an explicit architecture decision.

## Working rules
- Implement only the requested MVP issue(s).
- Do not pre-build future features.
- Prefer simple, explicit code over generic frameworks and premature abstractions.
- Keep domain logic out of React components and route handlers when practical.
- Webhook handlers must validate, persist/enqueue, and return quickly. They must not perform full newsletter processing.
- Preserve raw inbound email data so failed or old messages can be reprocessed.
- Treat provider webhooks as at-least-once delivery. All inbound processing must be idempotent.
- Every user-owned query must enforce ownership. Cross-user access is a critical vulnerability.
- Never render untrusted inbound HTML without sanitization.
- Never log secrets, auth tokens, webhook secrets, or full sensitive payloads unnecessarily.
- Database changes require migrations.
- Add or update tests for behavior changed by the task.
- Avoid unrelated refactors.

## Module boundaries
Expected top-level modules:
- `auth`
- `inbound-email`
- `newsletters`
- `issues`
- `reader`
- `search`

Jobs live under `src/jobs`. Database schema/migrations live under `src/db`.

## Required checks
Before marking an implementation complete, run the relevant commands, normally:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run relevant Playwright tests for changes that affect critical user flows.

Never claim a check passed unless it was actually executed successfully.

## Task workflow
For non-trivial tasks:
1. Read the relevant docs and code.
2. State a short implementation plan before editing.
3. Implement only the requested scope.
4. Add/update tests.
5. Run checks.
6. Report changed files, tests/checks executed, assumptions, and unresolved risks.

For review-only tasks, do not modify files unless explicitly asked.

## Definition of done
An issue is done only when:
- Acceptance criteria in `docs/MVP.md` are met.
- Relevant tests exist and pass.
- Typecheck/lint pass.
- Production build passes when applicable.
- No known critical security or authorization issue was introduced.
- Documentation is updated if behavior or architecture changed.

## Explicit non-goals for MVP
Do not add unless a task explicitly changes scope:
- AI summaries/chat/embeddings
- RSS ingestion
- native mobile apps
- browser extensions
- highlights/notes
- folders/tags/collections
- recommendations/social features
- billing/payments
- outbound email client functionality
- Elasticsearch/vector databases
- microservices/Kubernetes/Kafka
