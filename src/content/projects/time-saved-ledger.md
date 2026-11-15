---
title: "A ledger of hours saved"
group: platform
kinds: [data, revops]
order: 180
summary: "An estimate of hours the platform gave back, built to undercount: coefficients below published sources, a daily cap, history that self-repairs."
facts:
  - { label: "Estimate", value: "about 733 hours, 28 users, about five months" }
  - { label: "First rollup", value: "about 175 hours over 70 days" }
  - { label: "Daily cap", value: "120 minutes per user" }
  - { label: "Recompute", value: "trailing 45 days, one transaction" }
diagram:
  type: flow
  caption: "How a user action becomes minutes on the home tile."
  steps:
    - { label: "Record the event", note: "A beacon accepts only a closed set of actions, and the actor comes from the server session." }
    - { label: "Apply a coefficient", note: "Each event type has a minute value set below its published source and kept in code." }
    - { label: "Cap the day", note: "No user can earn more than 120 minutes a day; above that, minutes shrink in proportion." }
    - { label: "Recompute nightly", note: "A queued job rebuilds the trailing 45 days in one transaction, so a fixed coefficient repairs history." }
    - { label: "Render from one file", note: "The home tile and the explainer page read the same constants, so their figures cannot drift apart." }
---

## The problem

A claim about time saved is easy to inflate and hard to check. I wanted a figure for the platform that I could defend line by line, which meant building it to undercount and showing the working.

## What I built

A ledger that turns user actions into estimated minutes saved, rolled up per user per day and per team per day. A tile on the home page shows the total, and an explainer page shows every coefficient behind it.

## How it works

Each event type has a coefficient in minutes, set below its published source and kept in code. A chat answer earns 1.5 minutes per cited document, capped at 12, plus 2 for each extra source system. A draft sent from the platform earns 12 minutes; a draft generated and not sent earns 6.

A contact search earns 2. Measured and estimated minutes are stored in separate columns. Against published benchmarks, the headline came out at about 23 cents on the dollar.

Each user is capped at 120 minutes a day, cut back in proportion above that. Engagement events come through a beacon route that accepts only a closed set of actions. The actor is always taken from the server session, never from the request body.

The rollup is a nightly queued job that recomputes the trailing 45 days in one transaction. I chose recompute over incremental updates on purpose: when I correct a coefficient, the next run repairs history instead of leaving old rows at the old rate. The ledger tables are read-only to the app role, and the migration checks that itself.

The home tile and the explainer page render from the same constants file. If a coefficient changes, both change, and nobody can quote a figure the explainer does not support.

I never built a per-person leaderboard. The ledger measures the platform, not the people using it.

## What it proved

The first full rollup measured about 175 hours over 70 days, with about 6% of user-days held at the cap. Over about five months the estimate reached about 733 hours returned to 28 users.

It is an estimate, not a measurement. What makes it worth quoting is that every minute traces to a constant in code, set low on purpose, and one fix to a constant corrects the last 45 days on the next nightly run.
