---
title: "My Day, the reps' home page"
group: platform
kinds: [revops, ai]
order: 170
summary: "The reps' home page: one model-written greeting a day, and a work queue built by plain rules so it changes only when the data does."
facts:
  - { label: "Greeting", value: "Haiku, forced tool, cached per user per day" }
  - { label: "Outreach queue", value: "five rows per rep, 48-hour expiry" }
  - { label: "Cadence build", value: "29 commits, about 220 new tests" }
diagram:
  type: flow
  caption: "What a rep sees, top to bottom, when they open the platform."
  steps:
    - { label: "Greeting", note: "A short narrative from Haiku through a forced tool, with account references, written once per user per day." }
    - { label: "One queue", note: "Meetings, overdue follow-ups, suggested outreach, tasks and forecast hygiene, merged and ordered by rules." }
    - { label: "What changed", note: "Warm signals, pipeline moves in the last 48 hours, and replies that came in overnight." }
    - { label: "Edit in place", note: "A rep can change a forecast field inline, and the platform writes it back to Salesforce." }
screen: myday
---

## The problem

A rep's work was spread over the calendar, Salesforce tasks, email, call notes and the forecast. I wanted one page that answered two questions each morning: what to do first today, and what moved since yesterday.

## What I built

My Day, the platform's home page. It opens with a short greeting, then one work queue, then a "what changed" panel, with collapsible panels below for the rest.

## How it works

The greeting is the only part of the page a model writes for that view; the queue's order comes from rules. Haiku writes it through a forced tool that returns account references, and the result is cached once per user per day, so opening the page again costs nothing and reads the same.

The queue is deterministic. It merges meetings, overdue follow-ups, suggested outreach, tasks and forecast hygiene into one ordered list. "What changed" shows warm marketing signals, pipeline moves in the last 48 hours, and overnight replies. Forecast fields can be edited inline, and the edit is written back to Salesforce.

Suggested outreach comes from a scoring job with four triggers. It caps each rep at five rows, writes a Sonnet draft for the top three only, and expires every suggestion after 48 hours, so the list cannot fill with stale ideas.

I also designed and built cadences, the follow-up sequences behind some queue items:

- Steps are completion-driven: step N+1 exists only after step N is done, due N working days later.
- Each step produces a draft for the rep, not an automatic send.
- A contact can be in one active cadence at a time, with a 30-day block on re-entry.
- A cadence pauses on an out-of-office reply, and pauses for the whole account when another contact there replies.

The cadence build took 29 commits and about 220 new tests. Cadences live alongside Salesforce tasks on the platform's task page.

## What went wrong

I built cadences task by task with subagents, then reviewed the whole branch at the end. That review found one critical and nine important issues that the task-level checks had let through.

This entry is also thinner than the others on results. Cadences had no measured outcomes yet: I can show how they behave, not whether they helped. I have no recorded usage figures for the page itself.

## What it proved

Keep the model to the one place where its writing adds something, and make everything a rep acts on reproducible. The greeting can vary; the queue gives the same answer every time the page opens.
