---
title: "Chat that answers only from cited data"
group: platform
kinds: [ai, data]
order: 20
summary: "A chat assistant that answers only from tool results, and the search fix that took an acronym query from zero rows to eight."
facts:
  - { label: "Tools", value: "about 29 database tools" }
  - { label: "Transcript lines", value: "about 570,000, searched in 2 ms" }
  - { label: "Re-embed", value: "about 560,000 rows, 14 sources, about $6" }
  - { label: "Stack", value: "Claude, Postgres, Voyage embeddings" }
diagram:
  type: flow
  caption: "How a question becomes a cited answer after the recall fix."
  steps:
    - { label: "Clean the terms", note: "Stop words and punctuation go, but the term list is never left empty." }
    - { label: "Match any group", note: "One builder writes both WHERE and ORDER BY. Rows match on any term group and rank by how many groups they hit." }
    - { label: "Semantic floor", note: "Strong matches need 0.45. Failing that, the best three above 0.36 come back tagged weak: a lead, never proof." }
    - { label: "Answer from tools", note: "The model may state only what tool rows say, and may cite only ids present on those rows." }
    - { label: "Stamp citations", note: "Code checks and stamps each citation. It does not trust the model's markers." }
---

## The problem

Reps asked free-form questions across calls, accounts, email and Slack. The first search split a query into at most six tokens, joined them with AND as ILIKE filters and sorted by date. Acronyms and punctuation returned nothing, and the assistant then said with confidence that a thing did not exist.

## What I built

A chat assistant on Claude with about 29 database tools. The system prompt, exported so tests can pin it, tells the model to answer only from tool results and to cite only ids that appear on returned rows. Code stamps the citations rather than trusting the model's markers.

## How it works

I found the root cause by replaying the model's own SQL and the sources stored with each message. The fix cleans terms without ever emptying the query, builds WHERE and ORDER BY from one source so they cannot disagree, matches with OR and ranks by groups matched, and adds a two-tier semantic floor. Account and contact lookups stay strict AND on purpose.

A smoke harness measured it. An acronym query went from 0 rows to 8, with 4 on topic. A paraphrase went from 1 row with none on topic to 8 strong hits with 7 on topic. Exact-match probes did not change.

Chat could see only a call's title and a 200-character summary, so I built transcript search. A table of utterances holds about 570,000 transcript lines from several thousand calls, with a generated tsvector, a GIN index and a trigram index. A full-text probe takes 2 ms.

I then re-embedded every source on Voyage, about 560,000 rows across 14 sources for about $6, built the HNSW index after the insert, and cut over by renaming tables in one transaction. The old table stayed for rollback.

## What went wrong

When the six-turn tool budget ran out, the assistant returned its own narration as the answer. The new evaluation suite caught it, and the fix is a structural check that forces a final synthesis turn. A "couldn't compose" fallback reproduced only once I wrapped the streaming call, because per-call usage was not logged.

Under pushback the model would sometimes drop a correct, grounded answer and agree with the user. The prompt now says to re-check the source before any agreement.

## What it proved

Grounding has to live in code and tests, not only in the prompt. The recall fix worked because I replayed real failures first and measured before and after, rather than tuning by feel.
