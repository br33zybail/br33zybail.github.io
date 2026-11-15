---
title: "NearbyWatch: city records near an address"
group: nearbywatch
kinds: [data, ai]
order: 400
summary: "A nightly pipeline that turns Nashville council, planning and permit records into scored, parcel-linked items. The web app is not built yet."
facts:
  - { label: "Corpus", value: "32,100 items, growing nightly" }
  - { label: "Parcels", value: "286,753 in PostGIS" }
  - { label: "Tests", value: "210 pipeline tests passing" }
  - { label: "Status", value: "pipeline done, web app not built" }
diagram:
  type: flow
  caption: "The nightly run, from three city sources to scored items tied to parcels."
  steps:
    - { label: "Ingest three sources", note: "Council items from Legistar, permits from the city's ArcGIS service and Planning Commission agenda PDFs. Every write is an idempotent upsert." }
    - { label: "Split agenda PDFs", note: "Each planning agenda is cut into items at the On Consent marker. Zero items from a PDF exits nonzero." }
    - { label: "Extract and summarize", note: "An LLM extracts fields and writes a one-sentence summary for council and planning items. Permits use a SQL template." }
    - { label: "Golden-set gate", note: "Any change to prompts, extraction or taxonomy must pass a 95-item golden set before it runs." }
    - { label: "Score and resolve", note: "Each item gets an impact score from 1 to 5, then the resolver ties it to a county parcel or, failing that, an area." }
demo: map
shots: [nearbywatch-mock-landing.png, nearbywatch-mock-report.png]
shotsNote: "Design mock-ups for the web app, which is not built yet."
---

## The problem

The city decides rezonings, permits, variances and street closures in public, but the records sit in three systems that few people read. Someone who sees a rezoning sign on their street has no easy way to learn what is planned nearby. I wanted to tell anyone, at a consumer price, what the city is about to do near their address.

## What I built

A data pipeline for Nashville that pulls Metro Council items from Legistar, permits from the city's ArcGIS service and planning agenda PDFs. Each item gets a plain-English summary, an impact score and, where the text allows, a county parcel. The corpus holds 32,100 items today, 27,906 of them relevant, and grows each night. The pipeline has 210 passing tests.

The web app is not built. A scaffold, a typeahead API and design mockups exist. Nothing is live.

## How it works

Ingest writes every item with an idempotent upsert and keeps the raw document it came from, so a rerun is safe. A splitter cuts each planning agenda PDF into items at the "On Consent" marker and exits nonzero if a template change yields none.

Council and planning items go through my model gateway for field extraction and a one-sentence summary. Permits never touch a model; a SQL template handles them. Any change to prompts, extraction or taxonomy must pass a 95-item golden set: field accuracy of at least 0.9, no missed relevant items and zero errors. The last recorded run scored recall 1.0 and field accuracy 1.0.

Each item type has a default impact, such as 5 for a moratorium, 4 for a rezoning and 1 for a permit, which the model may move by at most one point. Gray-zone types such as easements are always flagged for review. Then the resolver ties each item to a parcel or an area. Cron runs the sync at 04:17 each night under a file lock, so it skips while a backfill runs.

## What went wrong

A prompt-injection audit found that when the model marked an item irrelevant but its title carried a planning case number, the item vanished without a trace. The fix, merged to main, sends those items to a catch-all land-use type flagged for review; the nightly job still runs from a branch without it. Two AI coding sessions once worked the same tree at once and interleaved commits; I reviewed every commit and now claim work before dispatching it. My first database lost its binaries when a temp directory was wiped, and I moved the data into a PostGIS container.

## What it proved

The rule I care about most is to fail closed on location. An item below the confidence bar never fires an address alert, because a wrong-address alert would end trust in the product. The source data has no hearing times at all, so the product will not invent any.
