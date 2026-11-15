---
title: "A revenue platform built by one person"
group: platform
kinds: [ai, data, revops]
order: 10
summary: "A Postgres copy of the sales stack, refreshed hourly, with a Next.js app, agents and evaluations on top. Built and run alone in six months."
facts:
  - { label: "Built", value: "alone, late May to November 2026" }
  - { label: "Size", value: "about 200,000 lines of TypeScript, Python and SQL" }
  - { label: "Tests", value: "about 7,000 automated tests" }
  - { label: "Migrations", value: "about 220" }
diagram:
  type: flow
  caption: "How data moves from the sales tools to the people who use it."
  steps:
    - { label: "Sources", note: "Salesforce, Gong, HubSpot, Gmail, Google Calendar, Slack, Dialpad, ZoomInfo search and news." }
    - { label: "Hourly mirror", note: "Scripts pull changes with watermarks and upserts. Each step runs under a watchdog and records its state." }
    - { label: "Postgres with RLS", note: "One door sets four session settings per request. Row-level security policies read them and scope the rows." }
    - { label: "Next.js app", note: "The app reads Postgres at request time as a role that is not a superuser, so the policies always apply." }
    - { label: "Agents and MCP", note: "A Postgres job queue runs scheduled agents. Colleagues' own AI assistants read through an MCP connector under the same rules." }
shots: [study-queue.png, study-account-dashboard.png]
shotsNote: "Design studies from my model panel, with a made-up brand and fictional data. They are not production screens."
---

## The problem

The sales team at a Series C software company kept its facts in many tools: Salesforce for deals, Gong for calls, HubSpot for marketing, Gmail and Google Calendar for contact, Slack for talk. A rep preparing for a call had to search each one. Leaders had no single place to ask how the pipeline was moving.

## What I built

From late May to November 2026 I built a revenue-intelligence platform for reps and leaders, alone. Hourly scripts copy every source into one Postgres database. A Next.js app sits on top, with a chat assistant, scheduled agents, an evaluation suite and an MCP connector.

At an audit in mid-June the repo had no automated tests. By the end it held about 200,000 lines of code, about 7,000 tests and about 220 migrations.

The app has five areas:

- Today: a morning briefing, tasks, email cadences and notes.
- Queue: a ranked list of who to contact next.
- Accounts: search, an activity explorer, a page per company, a map, buying signals and contact search.
- Coach: a playbook, role-play practice and a nightly digest.
- Operate: leader dashboards for conversion, forecast, capacity and territory, gated on the server, because hiding a link is not security.

## How it works

Every query goes through one database door, a `withSession` wrapper that sets the user, role, org and leader flag as transaction-local settings. Row-level security reads them, so a rep sees their own book and a leader sees more. The app connects as a role that is not a superuser, and the import scripts connect as the owner.

A job queue in a Postgres table runs 45 kinds of scheduled work. Claude Haiku runs classifiers and judges, and Sonnet writes summaries and drafts.

## What went wrong

The whole platform ran on one Mac: Postgres.app, launchd for scheduling, and a Tailscale Funnel for the public address. That was the weak point.

A macOS update left Postgres down. One public funnel ingress stopped relaying, so half of requests failed while every local check said up. A build agent deleted the live server's build directory, causing a 30 to 60 minute outage. A full disk truncated two nightly dumps that were still counted as done.

I wrote 13 post-mortems and about 230 debriefs. The funnel failure left an hourly probe of every public ingress through public DNS. The disk failure left backups that take their final name only after `pg_restore` can read them.

## What it proved

One person can build and run a platform of this size when tests, written plans and written root causes keep pace with the code. The code held up better than the hosting. The lasting fix is an always-on server, not a laptop that must stay awake.
