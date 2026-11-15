---
title: "A job queue in a Postgres table"
group: platform
kinds: [infra, data]
order: 40
summary: "45 kinds of scheduled job on one Postgres table and a five-minute wake-up, and the starvation bug that came back after the first fix."
facts:
  - { label: "Job kinds", value: "45, plus one row per user agent" }
  - { label: "Wake-up", value: "launchd, every 5 minutes" }
  - { label: "Slots", value: "3 at once, set by memory" }
  - { label: "Post-mortems", value: "two starvation incidents" }
diagram:
  type: flow
  caption: "One tick of the dispatcher, from wake-up to reschedule."
  steps:
    - { label: "Wake", note: "launchd starts the dispatcher every five minutes. There is no daemon and no cron parser." }
    - { label: "Claim with a lease", note: "The dispatcher claims due rows with SKIP LOCKED and a lease longer than any watchdog, so overlapping ticks cannot run a task twice." }
    - { label: "Look up the command", note: "The registry file, not the database, decides what runs. An unknown kind fails closed." }
    - { label: "Run under a watchdog", note: "Each run is a child process with a wall-clock limit per kind. The tick claims again as soon as a slot frees up." }
    - { label: "Reschedule or park", note: "Success moves the due time by the cadence. Failure walks a backoff ladder, and the fifth failure parks the row and sends a Slack DM." }
---

## The problem

The first scheduler was one hourly orchestrator that ran 32 steps in order under launchd. In June an unbounded Slack sweep ran for 11 hours, and every source went stale overnight because nothing behind it could start. After that, each step got a watchdog of 25 minutes, 30 for Slack. But every step still ran on the same hourly beat, fire and forget, with no retries and no alert on repeated failure.

## What I built

A durable queue in Postgres. launchd stays the only scheduler and wakes a dispatcher every five minutes. One table holds a row per job kind with due time, priority, attempts and a lease. A second holds a row per run with outcome, output tail and duration.

It carries 45 kinds of job, from scheduled email sends every tick to weekly ingests. Each user-built agent, a saved prompt on a timezone-aware schedule, is one queue row capped at six turns and a ten-minute watchdog.

## How it works

The lease is the longest kind timeout plus five minutes, taken from the registry so it can never be shorter than a watchdog. Three slots run at once. That limit is a memory decision: wide fan-out had exhausted the machine before.

The dispatcher never builds a command from a database row. If a stored value differs from the registry, the registry wins and the dispatcher logs the drift.

I kept the old orchestrator lines as comments, as the rollback path. A test parses the old file and fails unless every queued kind runs the same command as its old line, character for character. It also asserts that irreversible lanes stay commented until a human runs them once by hand.

The ordered core of Salesforce and ingest steps still ran on the hourly orchestrator. Moving it as one queued kind was planned, not done.

## What went wrong

On 31 October two always-due urgent kinds filled every slot. My first fix rested on an invariant that was wrong. On 2 November the same starvation came back one lane down, and nothing below normal priority ran for 43 hours.

Priority decides order, not whether a kind holds a slot. Cadence does. The real fix was a test that adds up how many runs each kind asks for per tick and keeps the total below the claim limit, with margin. I also let a tick claim again as runs finish, moved housekeeping to every 15 minutes, raised the limit from two to three, and added a warning for any due row left unclaimed for 15 minutes.

## What it proved

A table, a lease and a five-minute wake-up ran 45 kinds of job without a queue service. The test that mattered pinned the capacity invariant, not the shape of the last incident.
