---
title: "Buying signals and an evidence ledger"
group: platform
kinds: [ai, data, revops]
order: 120
summary: "Ranked prospect signals where no source may claim a confidence: typed observations with receipts, weighted in code and scored at read time."
facts:
  - { label: "Stack", value: "Postgres, DuckDB, TypeScript, Haiku" }
  - { label: "Signal half-life", value: "90 days" }
  - { label: "Score ceiling", value: "0.97, noisy-OR" }
diagram:
  type: flow
  caption: "Two feeders into one Signals page: an evidence ledger for known accounts, and fit times trigger for new companies."
  steps:
    - { label: "Record observations", note: "Miners append typed rows, each with a receipt that points to its source. None carries a confidence." }
    - { label: "Weigh in code", note: "Weights live in code, so changing one needs no backfill." }
    - { label: "Score at read time", note: "Noisy-OR combines the evidence, capped at 0.97, cut to 0.25 by a live contradiction, halved after 12 months." }
    - { label: "Fit times trigger", note: "Separately, for companies not yet in the CRM, hard-gated fit is multiplied by a decaying trigger score to give priority." }
    - { label: "Rank the cards", note: "Cards show a rule-written why-now line and sort by rank or by newest." }
---

## The problem

Reps needed to know which target companies to contact now, and why. The clues sat in many places: a public federal registry of companies in the target market, call transcripts, email, website visits and news. Each source covered only part of it, and none could be trusted to grade itself.

## What I built

A Signals page fed by several miners. Two pieces carry the design. One scores net-new target companies from the registry. The other is an evidence ledger for people and accounts already in the CRM.

## How it works

The fit score has hard gates on size and type of business, with the size floor taken from the spread of won deals. The trigger score sums weight times confidence times 0.5^(age/90 days) over recent events, capped at 100, so a signal loses half its weight every 90 days. Priority is fit multiplied by (1 + trigger/100), with every component kept for audit.

Rules, not a model, write the "why now" line. Companies already in the CRM are suppressed by registry number, and fuzzy matches go to a review queue.

The evidence ledger is append-only. Each row is a typed observation with a receipt. No producer emits a confidence.

Weights live in code, and the score is built at read time by noisy-OR, capped at 0.97. A live contradiction caps it at 0.25, and evidence older than a year counts half. Scores fall into three bands: Verified, Probable, Possible.

The verbal-intent miner reads transcripts through access-fenced views and pulls out five kinds of prospect intent. Every quote must appear verbatim in the transcript. Personal details become placeholders, and a cost budget and composite cursor bound each run. It is the only miner that spends model tokens per source row.

## What went wrong

The rollup flagged about 460 contradiction rows. They were not contradictions: they came down to about 100 job transitions, spread across many rows. A six-rung ladder now tells a real job change from title inflation.

Ranking by strength alone let a seven-month-old quote outrank yesterday's news, so I added a Ranked/Newest toggle and 7, 30 and 90-day chips. Rank still matters; it just no longer hides what is new.

One week the count of top-grade registry companies jumped by more than half. I proved the change came from the source, with three checks and a control rerun, and marked the weeks before and after as not comparable.

## What it proved

Keeping confidence out of the producers made the scores honest and cheap to change: one edit to a weight in code repairs every score on the next read. None of the three incidents was a code crash. Each was a question of what the data meant, and each was settled by checking the data.
