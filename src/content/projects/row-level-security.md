---
title: "Row-level security on every request"
group: platform
kinds: [security, data]
order: 60
summary: "Per-request Postgres row-level security, and five ways it failed: a deny-list, default grants, a missing field, a sequence and a superuser test."
facts:
  - { label: "Session settings", value: "four, transaction-local" }
  - { label: "Fence for private calls", value: "11 migrations, 9 views" }
  - { label: "Grants test", value: "every relation listed as allowed or denied" }
diagram:
  type: flow
  caption: "How one request reaches only the rows its user may see."
  steps:
    - { label: "Resolve the session", note: "In production the resolver fails closed. No session means no query." }
    - { label: "Set four settings", note: "A withSession wrapper sets user email, role, org id and leader flag with SET LOCAL inside the transaction." }
    - { label: "Allow-list check", note: "Policies call one allow-list helper for org-wide reads, so an unknown or empty role sees nothing extra." }
    - { label: "Views as doors", note: "The app role has no grant on sensitive tables. It reads them only through views that apply the same checks." }
    - { label: "Same empty shape", note: "A lookup of an id the user cannot see returns the normal empty result, so nothing reveals that it exists." }
---

## The problem

Reps should see their own book, leaders more, and private calls only their owners. The app, the chat assistant, the SQL tool and the MCP connector all read one Postgres database, so the rule had to live in the database.

## What I built

Every query goes through one door. A `withSession` wrapper sets four transaction-local settings: user email, role, org id and a leader flag. Policies read them.

Views re-assert `security_invoker` on every `CREATE OR REPLACE VIEW`, because without it row-level security silently stops applying. Tests connect as the real app role and first assert it is not a superuser and cannot bypass row-level security.

## How it works

The session resolver fails closed in production. The low-level `query()` still keeps an admin default for ingest scripts, a documented hazard: a map page once called it without a session and showed a rep the whole org's book. Account-keyed lanes that have no policies of their own look the account up under the request session first. An id the user cannot see returns the normal empty shape, so there is no existence oracle.

## What went wrong

The map leak was the first failure. Five more followed.

Most users had a role that granted full visibility by default. The helper that decided org-wide reads was a deny-list, and it returned true for an anonymous session: with no settings at all, every account was readable. I replaced it with an allow-list helper, so only roles named on the list get org-wide reads.

Default privileges handed the app role every new table. The same defect came back three times, so I wrote a grants ledger test that lists every relation in the schema as allowed or denied, with a reason.

Owner-restricted Gong calls were readable by everyone, because the sync never requested the privacy field. The fix took 11 migrations. I revoked the raw Gong tables from the app role and made nine owner-aware views the only door; non-attendees get a de-identified summary checked by a leak test.

The tests had looked flawless because they ran as a superuser. Driving the real tools as the app role found a broken view. Later one leak test could no longer fail, so I rewrote the leak tests to assert invariants against a table of mutations.

Sequence USAGE leaked the running row counts of fenced tables. I revoked it.

## What it proved

Row-level security holds only when every path uses the real role. A test that runs as the owner proves nothing, and a deny-list fails open on input nobody planned for.
