# SECURITY.md — Newshelf MVP

Newshelf ingests hostile, externally supplied email content. Security requirements are part of product correctness, not optional hardening.

## Threat priorities
1. Cross-user data access
2. XSS / active content from newsletter HTML
3. Forged/replayed provider webhooks
4. Duplicate processing / inconsistent state
5. Abuse of public inbound addresses and resource exhaustion
6. Secret leakage through logs/errors

## User isolation
Every user-owned read/write must enforce ownership server-side. Never trust a route parameter or client-side filtering as authorization.

Required tests before MVP release:
- User A cannot read User B's Issue by ID.
- User A cannot mutate User B's IssueState.
- User A cannot list/search User B's content.
- Inbound address resolution cannot attach a message to the wrong user.

Use Supabase RLS where appropriate, but do not assume RLS compensates for unsafe service-role code. Server code using elevated credentials must still scope operations deliberately.

## Inbound webhook security
- Verify Resend webhook authenticity using the documented signing mechanism.
- Reject invalid signatures.
- Validate payloads with a strict schema (Zod).
- Enforce idempotency using stable provider identifiers.
- Treat replay as expected behavior, not an exceptional case.
- Return appropriate errors without exposing internals.
- Do not put secrets in URLs.

## HTML safety
Raw email HTML is untrusted.

Pipeline:

```text
untrusted HTML -> parse -> sanitize allowlist -> normalized safe HTML -> store/render
```

At minimum remove/block:
- `<script>`
- inline event handlers (`on*`)
- executable/unsafe embeds
- dangerous iframes
- forms and form submission behavior
- unsafe URL schemes such as `javascript:`
- unexpected active SVG/scriptable constructs

Do not rely on React escaping when intentionally rendering HTML. The sanitized representation must be the only HTML accepted by the Reader.

Where practical, external links should be treated as external/untrusted navigation. Do not silently execute sender-provided behavior.

## Raw message handling
- Raw payloads may contain personal data and tracking information.
- Restrict storage access to server-side processing paths.
- Do not expose raw MIME/payload URLs publicly.
- Avoid logging bodies/attachments.
- Use stable internal IDs in logs.

## Secrets
Secrets belong in environment/secret management, never committed to Git:
- Supabase service credentials
- Resend API/webhook secrets
- storage credentials
- any future provider credentials

`.env*` files containing real credentials must be ignored.

## Queue/job security
- Jobs must reference internal IDs rather than carrying full raw content when possible.
- Processing must verify ownership/relationships after loading records.
- Retries must be idempotent.
- A malformed email must fail that job, not crash unrelated processing.

## Resource abuse
Before public MVP release, establish reasonable limits for:
- inbound message size
- attachment handling
- processing retries
- HTML/content size stored/rendered
- inbound volume per address/user

Prefer rejecting or quarantining unsupported/extreme messages rather than allowing unbounded resource consumption.

## Dependencies
Keep parsing and sanitization dependencies maintained and minimal. Security-sensitive dependency upgrades should include regression tests against email fixtures.

## Security gate
MVP cannot ship until MVP-042 through MVP-045 pass, including cross-user authorization, replay/idempotency, XSS/sanitization and critical end-to-end tests.
