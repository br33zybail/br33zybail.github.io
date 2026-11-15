---
title: "Account briefs where every sentence cites"
group: platform
kinds: [ai]
order: 90
summary: "Nightly account briefs with a citation on every sentence and a judge that strikes, never rewrites. I missed the strike-rate bar and kept it."
facts:
  - { label: "Prototype", value: "12 accounts for $9.89" }
  - { label: "Strike rate", value: "106 of 954 sentences, 11.1%" }
  - { label: "Planted lies caught", value: "Haiku 14 then 13 of 15, Sonnet 15 of 15" }
  - { label: "Spend caps", value: "$10 a night, $150 a month" }
diagram:
  type: flow
  caption: "How one account brief is written, checked and kept."
  steps:
    - { label: "Gather sources", note: "The pipeline collects the account's evidence and gives each source a token the model cannot invent." }
    - { label: "Write with tokens", note: "The model writes the brief, and every sentence must carry a source token." }
    - { label: "Code checks", note: "Code checks run before any model judges: each sentence needs a citation, and each citation must be a token it was given." }
    - { label: "Judge strikes", note: "A Sonnet judge reads each sentence against its sources and strikes unsupported ones. It never rewrites." }
    - { label: "Batch and cap", note: "The nightly run uses the half-price batch API under a per-night and per-month spend cap." }
screen: brief
---

## The problem

Reps wanted a short written brief on each account, refreshed nightly. A brief like that is worse than none if any sentence is invented, and no rep has time to check every line against the calls and emails behind it.

## What I built

A nightly brief pipeline where every sentence cites its source. I designed it in October, proved it on a prototype, and ran it as a phase machine in the job queue, writing at night and judging in a second batch. The nightly run uses the Message Batches API at half price, with caps of $10 a night and $150 a month.

## How it works

Sources reach the model as tokens it cannot invent. A sentence can cite only a token that exists in its own evidence. Code checks come first: a sentence needs a citation, and the citation must be one of the tokens it was given.

Then a judge model reads each sentence against its sources and strikes the ones they do not support. The judge never rewrites.

To choose the judge, I planted 15 false sentences and counted catches. Haiku caught 14, then 13 after tightening. Sonnet caught all 15. The requirement was every plant, so the judge moved to Sonnet.

## What went wrong

The prototype on 12 accounts cost $9.89. The judge cut 106 of 954 sentences, 11.1%, against a bar of under 10%. I missed the bar and did not loosen it. I reported the miss with the number.

A review of the whole milestone, not just the last diff, found a leak: a fence on call-tone data that inverted under row-level security. I pinned the fix with a test that runs as the real app role, not as the owner.

## What it proved

Citations are only worth something if the model cannot make them up and a separate check can strike what they do not support. The planted-falsehood test turned the choice of judge model into a measurement. Keeping the bar after missing it is what makes the bar mean anything.
