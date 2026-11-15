---
title: "Customer metrics that tie out"
group: platform
kinds: [data]
order: 190
summary: "Customer metrics rebuilt locally from raw rows and checked every organisation-week against the official query, with guards against an empty pull."
facts:
  - { label: "Definitions", value: "15 metrics over 3 grains, as code" }
  - { label: "Tie-out", value: "hundreds of organisation-weeks, zero misses" }
  - { label: "Source", value: "the BI tool's SQL API" }
diagram:
  type: flow
  caption: "How raw rows become metrics that are proven to match the official numbers."
  steps:
    - { label: "Plan the chunks", note: "A histogram of the source decides how to split the pull into chunks." }
    - { label: "Pull raw rows", note: "Row-level facts come through the BI tool's SQL API, chunk by chunk." }
    - { label: "Derive locally", note: "Metric definitions live in code and run over the raw rows in Postgres." }
    - { label: "Tie out", note: "Each organisation-week is compared with the official query. A miss is a failure, not a warning." }
    - { label: "Guard the swap", note: "A pull that found nothing, or shrank sharply, rolls back instead of replacing good data." }
---

## The problem

The platform showed customer metrics on its success pages. The official figures lived in a BI tool. I wanted the raw rows in Postgres, the metrics derived there where the platform could use them, and proof on every run that they matched the official figures.

## What I built

A metric ledger. It pulls row-level facts from the BI tool's SQL API, derives 15 metrics over three grains in code, and ties every organisation-week out against the official query.

## How it works

A histogram of the source plans the chunks before any pull, and the metrics are computed locally from what comes down. Definitions are code, not dashboard settings, so a change to one goes through the same tests and review as any other code.

The tie-out compares each organisation-week with the official query. On the first scratch ingest every organisation-week matched. Later runs covered hundreds of complete organisation-weeks with zero misses, and the nightly run ties out in full.

## What went wrong

A timestamp with no zone was parsed as local time, which moved some rows into the wrong week. The tie-out caught it. I switched to a UTC parse and added an assert that each row lands in the week it claims.

The source restates history between snapshots. My first design carried forward chunks already pulled, which is unsound when old rows can change. I dropped the carry-forward.

The worst case came during a rewrite of the warehouse. A pull returned zero rows, and the ledger replaced good data with nothing. I added three guards:

- abort when the plan finds zero rows to pull;
- roll back if the new data holds zero records;
- require the newest partition to hold at least 90% of the smallest of the three before it.

## What it proved

A tie-out is the cheapest test there is for derived numbers: the official answer already exists, so compare against it every time. It caught the time-zone bug. The empty pull taught the other half: a check on whether numbers match is not a check on whether data arrived, and that needs its own guards.
