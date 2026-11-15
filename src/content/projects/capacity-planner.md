---
title: "Capacity planner and activity tracker"
group: platform
kinds: [revops, data]
order: 200
summary: "A hiring model that reruns on every slider tick, built so no rate is applied twice, plus an hourly tracker of rep activity."
facts:
  - { label: "Model", value: "pure TypeScript, runs in browser and server" }
  - { label: "Tracker", value: "hourly, six sources" }
  - { label: "Hourly runs", value: "hundreds, no failures" }
diagram:
  type: flow
  caption: "The order of the capacity model's calculation."
  steps:
    - { label: "Start from target", note: "The leader sets a bookings target and the planning assumptions on sliders." }
    - { label: "Reps needed", note: "Target divided by quota times attainment, with a haircut." }
    - { label: "SDR demand", note: "SDR count is driven by the pipeline the reps need." }
    - { label: "Coverage gate", note: "Raw open pipeline is compared with remaining target divided by win rate." }
    - { label: "Ramp warning", note: "The model warns when new hires cannot ramp in time to count." }
---

## The problem

A hiring plan works back from a bookings target through quota, attainment, pipeline and ramp. Each step is easy to get wrong, and a leader needs to see the answer move as each assumption changes.

## What I built

A capacity planner in the platform. The model is one pure, isomorphic module, so the same code runs on the server and in the browser on every slider tick, with no round trip.

## How it works

Reps needed is the target divided by quota times attainment, with a haircut. SDR demand follows from the pipeline those reps need. A coverage gate compares raw open pipeline with the remaining target divided by win rate. A ramp warning appears when new hires would not be productive in time.

## What went wrong

An early version nearly doubled the reps it said were needed. It seeded the target from the sum of quotas and then divided by attainment again, though quota already builds in over-assignment.

It also invented a pipeline gap by comparing expected value, where win rate is already applied, with target over win rate. That applied win rate twice. The coverage gate now uses raw open pipeline.

The activity tracker had its own faults. It ingests every hour from six sources: Salesforce, Calendar, Gong, Gmail, contact search and chat usage. I fixed three counting defects in it. One shows the kind: "meetings held" counted invitations until I required the person to have spoken.

## What it proved

Never apply a factor that an input already contains: quota already holds over-assignment, and expected value already holds win rate. Because the model is pure, each of these rules can be checked by a plain unit test with no database. The tracker, for its part, logged hundreds of hourly runs with no failures.
