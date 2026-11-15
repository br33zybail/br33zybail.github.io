---
title: "A read-only SQL tool for the model"
group: platform
kinds: [ai, security]
order: 30
summary: "A SQL tool behind five walls. Adversarial passes kept breaking the text scanner, and the walls Postgres enforces held."
facts:
  - { label: "Walls", value: "five, from text scanner to audit row" }
  - { label: "Timeout", value: "8 seconds, read-only" }
  - { label: "Grants", value: "SELECT on 68 relations, default deny" }
  - { label: "Adversarial passes", value: "five" }
diagram:
  type: flow
  caption: "The five walls a model-written query passes, in order."
  steps:
    - { label: "Text scanner", note: "A hand-written scanner rejects writes and extra statements. It is the cheapest wall and the weakest." }
    - { label: "Narrow session", note: "A read-only transaction with an 8-second timeout switches to a narrow role. The extended protocol makes Postgres refuse a second statement." }
    - { label: "Grants", note: "The role can SELECT 68 relations and nothing else, with walls on columns and functions." }
    - { label: "Plan check", note: "EXPLAIN lists the relations the plan touches, and any on the deny list stops the query." }
    - { label: "Bounded result", note: "Rows come back capped, and every call writes an audit row." }
---

## The problem

Search tools cannot count or sum across tables. For questions that need arithmetic, the chat assistant had to write SQL. But the same database held private calls and each rep's book, and whatever text a model reads can steer the SQL it writes.

## What I built

A read-only `query_sql` tool. It runs under the asking user's own row-level security, so it can never show more than that user could see in the app. The code builds the schema card the model reads from the role's grants, so it lists only what the role may touch.

A deep mode allows up to 12 turns and adds a verify turn. The role, its grants and the column and function walls live in numbered migrations, like any other schema change.

## How it works

A query must pass five walls:

- A text scanner that rejects writes and more than one statement.
- A read-only transaction with an 8-second timeout, switched by `SET LOCAL ROLE` to a narrow role and sent over the extended query protocol, so Postgres itself refuses a second statement.
- Grants: SELECT only, on 68 relations, default deny, with column and function walls.
- An EXPLAIN check of the plan's relations against a deny list.
- Bounded results and an audit row for every call.

## What went wrong

I ran five adversarial passes against the tool. They kept breaking the text scanner. Three reviews in a row each found a real bypass in its lexer. The protocol and the grants held.

That changed how I rank the walls. A hand-written SQL lexer is the weakest wall, because it guesses how Postgres will parse text. Postgres itself enforces the protocol and the grants, and it does not guess. The scanner stays as a fast early refusal, but the boundary is the role.

## What it proved

I checked the row-level security path end to end. A book-scoped caller saw only a small fraction of the rows an admin saw. A model can write SQL against sensitive data if the database, not the model or a regex, decides what it may read.
