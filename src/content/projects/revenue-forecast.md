---
title: "A Monte Carlo bookings forecast"
group: platform
kinds: [data, revops]
order: 100
summary: "A simulation of every open and future deal climbing a stage ladder, 20,000 runs, where one data judgement moved the headline about threefold."
facts:
  - { label: "Runs", value: "20,000, fixed seed, about 12 seconds" }
  - { label: "Model", value: "stage-ladder Monte Carlo" }
  - { label: "Stack", value: "Python, DuckDB, Postgres" }
  - { label: "Accuracy", value: "within 10% of actual bookings; no formal back-test" }
diagram:
  type: ladder
  caption: "The stage ladder each simulated deal climbs, with the draws made at each rung."
  steps:
    - { label: "Lead", note: "Future deals enter here. Each month's count is a negative binomial draw scaled by rep capacity, and this stage too is gated by occupancy." }
    - { label: "Discovery", note: "A Bernoulli draw decides whether the deal sits in this stage at all. If it does, a Gamma draw sets how long." }
    - { label: "Validation", note: "The same occupancy and dwell draws apply. A skipped stage adds no time." }
    - { label: "Proposal", note: "Many deals skip this stage, which is why the occupancy draw matters." }
    - { label: "Negotiation", note: "The last open stage. Its dwell draw ends the deal's path to close." }
    - { label: "Won", note: "A winning deal books its value in the month it lands, or counts as spill into next year." }
demo: forecast
---

## The problem

Leadership wanted a bottom-up forecast of new bookings for the rest of the fiscal year. It had to start from Salesforce deals, both open and not yet created.

## What I built

A Monte Carlo simulation of deals moving up a five-stage ladder. It is close kin to a semi-Markov chain: a deal's path depends on its current stage, each stage holds it for a random time, and the simulation chains those holds from the current stage to close. It differs in one way: win or lose is drawn once, from the deal's current stage, not stage by stage. The transitions are the chance of winning from each stage and the chance of sitting in each later one. A Python script reads DuckDB marts, runs 20,000 times with a fixed seed and writes a snapshot to Postgres.

## How it works

Each run draws:

- Win probability from each stage comes from closed deals that reached it, drawn from Beta(won + 0.5, lost + 0.5), a Jeffreys prior.
- Dwell in each stage is a Gamma draw fitted to the days deals spent there.
- Occupancy is the chance a deal that passed a stage sat in it. A Bernoulli draw per stage means skipped stages add no time.
- Deal size is lognormal, fitted to won deals, for open deals with no amount.
- New deals per month follow a negative binomial scaled by rep capacity, with a six-month ramp for hires and a step to zero for leavers.

Two engines share these draws. The first takes every open deal, draws whether it ever wins from its current stage, and times only the winners, counting just the time left in its current stage. The second creates future deals and walks the winners up the full ladder.

Scenarios change pace only: balanced samples the full dwell distribution, fast uses each stage's 25th percentile, slow its 75th. The output is percentile bands, overall and by month. A freshness gate skips the run unless an upstream stamp has changed, and forces one run per local day.

## What went wrong

An earlier version forced every deal through all five stages and inflated cycle time. An audit found that closes between today and the next month's start were silently dropped. The freshness gate compared UTC dates and recomputed six times a night.

How I treated one administrative bulk-close batch moved the headline about threefold. I modelled three treatments: keep wins and drop the cleanup losses, keep both, or strip the batch.

I recommended one, wrote the choice and its size into the design, and leadership signed it off. The default drops swept losses that never reached the validation stage and counts later ones as real.

## What it proved

A forecast should show its biggest assumption, not bury it. In use it landed within 10% of actual bookings, close for a business with few, large deals, and the COO and CFO set budgets for coming quarters from it. I did not get to a formal back-test across a full year, so that figure is experience, not a study.
