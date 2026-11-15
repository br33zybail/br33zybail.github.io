---
title: "Buyer emotion and a nightly coach"
group: platform
kinds: [ai, data]
order: 160
summary: "Tone of voice measured per call with the audio deleted after, and a nightly coach that only remembers what it can cite."
facts:
  - { label: "Models", value: "Haiku per utterance, Sonnet synthesis" }
  - { label: "Prosody summaries", value: "about 2,900 calls" }
  - { label: "Coach tests", value: "193" }
  - { label: "Access proof", value: "live checks as five identities" }
diagram:
  type: flow
  caption: "From a recorded call to an emotion trend, and from the day's evidence to a coach note."
  steps:
    - { label: "Classify utterances", note: "Haiku labels the emotion of each buyer utterance." }
    - { label: "Measure the voice", note: "A Python sidecar reads freshly signed audio, measures pitch, energy and rate, then the audio is deleted." }
    - { label: "Synthesise a trend", note: "Sonnet writes a per-call synthesis and a trend across the account's calls, with risk flags." }
    - { label: "Build a digest", note: "Each night, plain code gathers nine evidence streams for each rep into one digest." }
    - { label: "Write receipted notes", note: "One Haiku call reads the digest. Only memories that cite a source are saved, to tables only their owner can read." }
---

## The problem

A transcript records what a buyer said, not how they said it. A flat "sounds good" and a warm one read the same. Separately, the evidence a rep should act on each day was spread across calls, email and the CRM.

## What I built

Two related pieces. The first is a buyer emotion layer: each call gets an emotion reading per utterance, a synthesis, a trend across the account, and measured tone of voice. The second is a personal coach that runs each night for every rep and writes a short note from that rep's own evidence.

## How it works

Haiku classifies each buyer utterance. Sonnet writes the per-call synthesis and the account trend.

For tone of voice, the platform re-signs the call's audio link for that call only, and a Python sidecar measures pitch, energy and speaking rate. The audio is then deleted. Only the numbers stay. I built the layer on a scratch copy of the database before it touched production.

The coach is cheap by design. Plain code builds a digest from nine evidence streams, and one Haiku call reads it. The coach saves a memory only when it carries a receipt pointing to its source. Its tables are owner-only under row-level security, and I proved that live by querying as five different identities.

## What went wrong

About 18% of syntheses came back empty. It looked like truncation. It was not: the stop reason showed a tool call at a third of the token budget, and I traced the empty results to a missing required field.

About 45% of calls reported a talk ratio of exactly zero. That was a sentinel for "not measured", not a buyer who never spoke, so I treat it as missing. A speaker-role fix in the Gong data then recovered the buyer side on about half of all calls.

The coach's follow-up axis read zero. The cause was in how email threads logged in Salesforce were keyed. I re-keyed about 67,500 rows into about 40,500 threads, with a rollback file, and the axis came alive at 73 out of 100.

A later audit found the coach repeating itself: 61% of good runs said "nothing to flag", and 85% cited at least half the same sources as the night before. I designed fixes, including memory of the last note, but did not verify that all of them shipped.

## What it proved

Measure before trusting a model's silence. Each empty or zero value here had a mechanical cause in the data, and each was found by asking what the zero meant.
