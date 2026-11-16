---
title: "A meeting brief on every calendar"
group: platform
kinds: [ai, revops]
order: 175
summary: "An overnight agent that reads the sales team's calendars and places a shadow invitation, with a full brief, beside each external meeting."
facts:
  - { label: "Runs", value: "overnight, midnight to 4am, then watches for late additions" }
  - { label: "Covers", value: "reps, SDRs, solutions engineers and the sales leader" }
  - { label: "Brief limit", value: "8,000 characters" }
  - { label: "Trigger", value: "an attendee from an outside domain" }
diagram:
  type: flow
  caption: "How a calendar entry becomes a brief the attendee reads before the meeting."
  steps:
    - { label: "Read the calendars", note: "Each night the agent reads the next day's calendars for every rep, SDR, solutions engineer and the sales leader." }
    - { label: "Keep external meetings", note: "A meeting qualifies when an attendee comes from an outside domain. Meetings that need no brief, such as calls with outside recruiters, are screened out." }
    - { label: "Gather the context", note: "The account overview, call links and summaries, CRM activity, recent Slack messages on a related deal, searched news, and enrichment for the outside attendees." }
    - { label: "Write the brief", note: "The sections are composed and trimmed to fit under 8,000 characters, most relevant first, with a short pulse on the relationship." }
    - { label: "Place the shadow", note: "A second invitation lands beside the real one, carrying the brief. The agent keeps watching for meetings added late at night." }
---

## The problem

Before a customer meeting, a rep had to look in five places: the CRM, the call recordings, Slack, the news and their own memory of who was coming. Most did some of it. The context existed in the platform's database, but nobody had time to pull it together at eight in the morning.

## What I built

An agent that does the preparation overnight. It reads the calendars of every account executive, SDR and solutions engineer, and of the sales leader. For each meeting with an outside party it creates a second calendar invitation, a shadow, beside the real one. The shadow carries a full brief, so the preparation sits where the person already looks.

## How it works

The run happens between midnight and 4am. After that the agent keeps monitoring, because people add meetings late at night and those need briefs too.

A meeting qualifies when an attendee's email comes from an outside domain. The brief is then built from everything the platform holds on that party:

- the account brief, a summary drawn from the unified database where every source meets
- links to past calls, each with its summary
- a summary of CRM activity
- recent Slack messages, when a deal is involved
- news found by web search
- enrichment for the outside attendees
- a "pulse" section that sums up the relationship

## What went wrong

Two problems took most of the work. The first was triage. An outside domain is a cheap signal and a noisy one: it also matches meetings that need no brief, such as calls with third-party recruiters. I had to keep refining which meetings earned a shadow.

The second was length. The brief has an 8,000 character cap, and there is always more context than fits. I kept adjusting what went in and in what order, so the most relevant material survived the cut.

## What it proved

The best place for context is where the person already is. Nobody had to open the platform to get the brief; it was on their calendar when they woke up. I have no measured figure for how often the briefs were read, so I claim only that the preparation was done for every qualifying meeting, every night.
