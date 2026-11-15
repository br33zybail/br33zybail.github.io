---
title: "Nightly review of late-stage deals"
group: platform
kinds: [ai, revops]
order: 150
summary: "A nightly dossier for each late-stage deal, graded factor by factor with cited quotes, where an unknown factor is left out of the score."
facts:
  - { label: "Models", value: "Haiku extracts, Sonnet grades" }
  - { label: "Factors", value: "seven, each met, partial, missing or unknown" }
  - { label: "Build", value: "twelve test-first tasks, two independent reviews" }
diagram:
  type: flow
  caption: "How one open deal becomes a graded dossier each night."
  steps:
    - { label: "Extract per call", note: "A small model pulls facts from each new call on the deal, tracked by a text watermark." }
    - { label: "Grade seven factors", note: "A larger model grades each factor met, partial, missing or unknown, citing a quote." }
    - { label: "Score what is known", note: "The composite is (met + 0.5 x partial) / graded. Unknown factors are left out." }
    - { label: "Split the views", note: "Leaders see a ranking across deals. Reps see only their own checklist." }
    - { label: "Guard the budget", note: "A monthly token budget pauses the pipeline loudly when it is spent." }
---

## The problem

The facts that show whether a late-stage deal is ready sit in its recorded calls, often many of them. I wanted every open deal checked against the same seven factors each night, with the evidence attached, and shown to leaders and reps in the form each could use.

## What I built

A nightly job that writes a dossier for every open late-stage deal. It reads the deal's calls, grades seven readiness factors, and shows the result two ways: a ranking for leaders and a checklist for reps.

## How it works

Work is split between two model sizes. Haiku extracts facts from each call once. Sonnet then grades the seven factors over those facts, marking each met, partial, missing or unknown, and must cite a quote for its grade.

The composite is (met + 0.5 x partial) divided by the number of graded factors. Unknown is left out of both sides. A factor nobody has discussed yet should not count against a deal as if it had been discussed and failed.

Leaders see the composite and a ranking across deals. Reps see a checklist for their own deal, with no composite and no cross-deal ranking. The same grades serve both, but a rep is shown what to do next, not where they stand against colleagues.

A monthly token budget guards the whole job. When it runs out, the pipeline pauses and says so instead of quietly spending more.

I built it from a written spec as twelve test-first tasks, then had two reviewers from different model families review it, and fixed what they found in one bundled pass. Neither review saw the other's findings, so agreement between them meant something.

## What went wrong

The job re-extracted the same call on every run. The watermark that marked "done up to here" passed through a JavaScript Date, which keeps milliseconds. Postgres stores microseconds.

So the saved watermark was always a little earlier than the newest call, and that call looked new on every run. About 22% of calls had timestamps with sub-millisecond parts.

I made watermarks text from end to end, so they never pass through a Date. I also added limits so the next bug of this kind cannot run forever: one full pass per day, a cap on attempts with a loud freeze, a quarantine for calls that keep failing, and the monthly token budget.

## What it proved

Incremental model jobs need two things: a cursor that round-trips exactly, and a bound on damage when it does not. The fix was one type change. The limits were the real lesson, because they would have turned a silent nightly cost into a visible stop.
