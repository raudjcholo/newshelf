# MVP.md — Newshelf Development Plan

## North-star flow

```text
Signup
  -> personal inbound address
  -> real newsletter email
  -> Resend
  -> verified webhook
  -> RawEmail persisted
  -> durable queue
  -> parse + sanitize + normalize
  -> Newsletter + Issue
  -> Inbox
  -> Reader
```

Do not prioritize secondary product features until this vertical slice works reliably.

# Milestone M1 — Foundation

## MVP-001 — Initialize Next.js/TypeScript project
Acceptance:
- Next.js app runs locally with pnpm.
- TypeScript strict mode enabled.
- Planned source directories can be introduced without unnecessary boilerplate.

## MVP-002 — Configure lint/typecheck/testing
Acceptance:
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` exist.
- Vitest has at least one smoke test.
- Formatting conventions are documented/configured.

## MVP-003 — Configure Supabase environments
Acceptance:
- Local/development configuration is documented.
- Environment variables are validated and secrets are not committed.
- Browser/server credential boundaries are explicit.

## MVP-004 — Configure Drizzle + PostgreSQL
Acceptance:
- Drizzle connects to Postgres.
- Migration generation/application workflow is documented and executable.

## MVP-005 — Implement initial DB schema
Acceptance:
- Tables for InboundAddress, RawEmail, Newsletter, Issue and IssueState exist.
- Foreign keys, ownership fields, uniqueness and core indexes are present.
- Migration applies cleanly to an empty database.

## MVP-006 — Implement Supabase authentication
Acceptance:
- User can sign up, sign in and sign out.
- Authenticated server routes can reliably resolve current user.

## MVP-007 — Implement protected app shell
Acceptance:
- App routes require authentication.
- Basic navigation shell exists without implementing future features.

## MVP-008 — Create inbound address on signup
Acceptance:
- New user receives a unique, non-user-ID-derived alias.
- Creation is idempotent if onboarding retries.

## MVP-009 — Display personal inbound address
Acceptance:
- Authenticated user can see and copy their address.
- User cannot retrieve another user's address.

## MVP-010 — Configure CI
Acceptance:
- Pull requests run lint, typecheck and tests.
- Build validation runs where practical.

## MVP-011 — Deploy preview/production to Vercel
Acceptance:
- Main branch has a working deployment.
- PR previews are available.
- Required environment variables are configured securely.

### M1 gate
A user can register, sign in, and see a unique Newshelf inbound address.

# Milestone M2 — Real email to Reader

## MVP-012 — Configure Resend inbound domain
Acceptance:
- Development/test inbound delivery works.
- Production inbound domain plan/config is documented.

## MVP-013 — Implement Resend webhook endpoint
Acceptance:
- Endpoint receives the expected inbound event.
- Payload validation exists.
- Full newsletter processing is not performed synchronously.

## MVP-014 — Verify webhook signatures
Acceptance:
- Valid webhook accepted.
- Invalid/missing signature rejected.
- Automated tests cover both.

## MVP-015 — Resolve inbound address to user
Acceptance:
- Recipient maps to exactly the correct active InboundAddress/user.
- Unknown/inactive recipients are handled safely.

## MVP-016 — Persist RawEmail
Acceptance:
- Inbound metadata and recoverable raw/provider data are stored.
- Record is associated with correct user/address.
- Sensitive raw data is not publicly exposed.

## MVP-017 — Implement webhook idempotency
Acceptance:
- Replaying the same provider message/event does not create duplicate RawEmail records or downstream Issues.
- Concurrency behavior is covered by a test or database constraint.

## MVP-018 — Enqueue PROCESS_EMAIL
Acceptance:
- Accepted RawEmail is queued durably.
- Queue message references stable internal IDs.
- Enqueue/retry behavior is observable.

## MVP-019 — Implement queue consumer
Acceptance:
- Consumer loads the RawEmail and transitions processing status safely.
- Duplicate delivery/retry is safe.
- Failure leaves the item retryable/diagnosable.

## MVP-020 — Fetch/parse inbound email
Acceptance:
- Provider/raw message becomes a normalized parsed representation.
- Common MIME/provider variants are supported.
- Parser failures are explicit rather than silently dropping content.

## MVP-021 — Extract HTML/text/metadata
Acceptance:
- Subject, sender, recipients, received date, HTML and text are extracted when available.
- Sensible fallback exists when HTML is missing.

## MVP-022 — Implement HTML sanitizer
Acceptance:
- Active/dangerous content is removed according to `SECURITY.md`.
- Sanitizer tests include malicious fixtures.
- Reader never receives raw unsanitized HTML.

## MVP-023 — Identify/create Newsletter
Acceptance:
- Issue can be grouped into a deterministic user-owned Newsletter.
- Repeated issues from the same sender do not create needless duplicates.
- Grouping logic is isolated so it can improve later.

## MVP-024 — Create Issue
Acceptance:
- One Issue is created per RawEmail at most.
- Issue stores sanitized HTML and text fallback.
- RawEmail transitions to processed only after successful product creation.

## MVP-025 — Handle processing failures/retries
Acceptance:
- Failures record safe diagnostic context.
- Retry cannot duplicate Issues.
- Permanently bad input can be identified for manual inspection without blocking unrelated jobs.

## MVP-026 — Implement Inbox query
Acceptance:
- Returns only current user's non-archived Issues.
- Ordered newest-first.
- Supports practical pagination/limit behavior.

## MVP-027 — Build Inbox UI
Acceptance:
- Shows newsletter identity, title, received/published time and read state.
- Loading, empty and error states exist at least minimally.

## MVP-028 — Build Issue Reader
Acceptance:
- Authenticated owner can open an Issue.
- Sanitized content is readable on desktop/mobile.
- Images/links degrade safely.
- Another user cannot access it by guessing ID.

## MVP-029 — Mark Issue as read
Acceptance:
- Opening/reading an Issue sets `read_at` idempotently.
- Inbox reflects state.

### M2 gate — critical vertical slice
Manually send a real newsletter to a user's Newshelf address. It must be accepted, processed, appear in Inbox, open in Reader, and become read without manual database intervention.

Do not proceed to convenience features until this gate is reliable.

# Milestone M3 — MVP completeness

## MVP-030 — Unread state
Acceptance:
- User can explicitly mark an Issue unread/read.
- State is user-scoped.

## MVP-031 — Save Issue
Acceptance:
- User can toggle saved state.
- Operation is idempotent.

## MVP-032 — Archive Issue
Acceptance:
- User can archive/unarchive.
- Archived Issues leave normal Inbox.

## MVP-033 — Saved view
Acceptance:
- Shows only current user's saved Issues.
- Reader navigation remains authorized.

## MVP-034 — Archive view
Acceptance:
- Shows only current user's archived Issues.

## MVP-035 — Newsletter detail page
Acceptance:
- Shows newsletter metadata and its Issues for current user.
- No cross-user leakage.

## MVP-036 — Full-text search
Acceptance:
- Search title, newsletter metadata and issue text using Postgres-native search.
- Results are user-scoped.
- No external search/vector service added.

## MVP-037 — Empty/loading/error states
Acceptance:
- Core Inbox/Reader/Library/search surfaces have intentional states.
- Recoverable errors offer a reasonable retry/navigation path.

## MVP-038 — Responsive Reader
Acceptance:
- Reader is comfortable at common mobile and desktop widths.
- Wide sender HTML cannot destroy application layout.

## MVP-039 — Dark mode
Acceptance:
- Application shell and Reader support dark mode without making newsletter content unusable.

## MVP-040 — Onboarding
Acceptance:
- New user understands their personal address and how to use it to subscribe.
- Copy action is obvious.
- User can reach Inbox immediately.

# Release hardening

## MVP-041 — Parser fixture suite
Acceptance:
- Fixture set covers materially different real newsletter structures.
- Fixtures are anonymized/safe to commit where needed.
- Parser/sanitizer regressions fail automated tests.

## MVP-042 — Cross-user authorization tests
Acceptance:
- Automated tests cover Issue, state, newsletter, search and inbound-address isolation.
- Known cross-user access is a release blocker.

## MVP-043 — Webhook replay tests
Acceptance:
- Same webhook delivered repeatedly does not duplicate RawEmail/Issue.
- Relevant concurrency/retry case is tested.

## MVP-044 — XSS/security tests
Acceptance:
- Malicious HTML fixtures demonstrate removal/blocking of dangerous active content and URL schemes.
- Reader only renders sanitized content.

## MVP-045 — Critical E2E flow
Acceptance:
- Automated E2E covers signup/authenticated app basics and core Inbox -> Reader behavior.
- Inbound provider boundary may use a controlled test fixture/harness if real provider delivery is unsuitable for CI.

## MVP-046 — Logging/observability
Acceptance:
- Correlatable structured logs/events exist for inbound acceptance, queueing, processing success/failure.
- Logs avoid secrets/full raw bodies.

## MVP-047 — Production configuration
Acceptance:
- Production env vars/secrets configured.
- Database migrations deployed safely.
- Inbound domain/webhook production settings verified.
- Reasonable resource/retry limits documented.

## MVP-048 — MVP release
Acceptance:
- M1, M2 and M3 gates pass.
- Security gate passes.
- Critical checks/build pass.
- A fresh test user can complete onboarding and receive/read a real newsletter without developer intervention.

# Explicit post-MVP backlog
Do not implement during MVP unless scope is intentionally revised:
- AI summaries/chat
- embeddings/semantic search
- RSS
- native apps
- browser extension
- notes/highlights
- folders/tags
- recommendations/social
- payments
- Gmail/Outlook historical import
- text-to-speech
