---
title: "How one person kept it honest"
group: platform
kinds: [infra, security]
order: 210
summary: "The habits behind about 200,000 lines built alone: tests from 73 to about 7,000, append-only migrations, a fixed ladder for production writes."
facts:
  - { label: "Code", value: "about 200,000 lines of TypeScript, Python and SQL" }
  - { label: "Tests", value: "73 to about 7,000 in under five months" }
  - { label: "Migrations", value: "about 220, append-only" }
  - { label: "Write-ups", value: "13 post-mortems, about 230 debriefs" }
diagram:
  type: flow
  caption: "The ladder every production data write climbed, in order."
  steps:
    - { label: "Write the rollback file", note: "Before anything changes, save the current values so every row can be put back." }
    - { label: "Dry run", note: "Run the full change without writing, and read what it would do." }
    - { label: "Three-row canary", note: "Apply the change to three rows only." }
    - { label: "Verify by query", note: "Read the three rows back from the database, not from the script's own log." }
    - { label: "Full run", note: "Apply the change to the rest." }
    - { label: "Count check", note: "Count the result per value and confirm it matches the plan." }
---

## The problem

I built and ran the platform alone for a sales team. There was no second engineer to catch a mistake and no CI server to run checks. Every safeguard had to be a habit or a tool I would actually use.

## What I built

A set of gates and records. Tests grew from 73 to about 7,000 in under five months. The schema grew through about 220 append-only migrations. Each production change got a debrief, and each real incident a post-mortem.

## How it works

The migration runner applies each file and its ledger row in one transaction, under an advisory lock, and stops at the first failure. A shipped migration is never edited or renumbered, even when two sessions produced the same number, because an edited file would be applied again. Migrations not ready to ship wait outside the folder, since the ship command applies everything pending.

Changes to auth, row-level security, migrations, production writes, money-adjacent numbers or new scheduled jobs pass a "defend the diff" gate: I explain the diff cold, covering what it does, why it is safe, how I verified it and how to roll it back. A waiver is allowed, but the walkthrough is owed within 48 hours.

For high-stakes work I ran independent reviews by different model families, never shown each other's findings. A debrief records why, the trace with verbatim commands, files changed, verification of the artifact rather than the log, rollback, blast radius, and a teach-back section that only I write.

## What went wrong

With no CI, the gates (type check, lint, tests, evals) ran only when I ran them. Worse, schema tests skipped silently when no database URL was set, so a worktree without the env file switched off those fences without a word.

Backups failed the same way. Twice a full disk truncated a database dump, and both were counted as done. At the low point the disk had 227 MB free.

Now a dump writes to a temporary file that is renamed only after it lists cleanly in the restore tool, a free-space check runs first, two copies stay local and 14 dailies go to Drive. Free space went from 227 MB to 190 GB.

## What it proved

Discipline is a record, not a feeling: 13 post-mortems and about 230 debriefs, each with a trace someone else could follow. A check that can pass without running is worse than no check, and I found that more than once.
