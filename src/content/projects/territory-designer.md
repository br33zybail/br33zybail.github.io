---
title: "What-if territory designer"
group: platform
kinds: [data, revops]
order: 110
summary: "A sandbox that draws sales territories from account data, with a rebalance rule that provably ends and a flag proven not to change old output."
facts:
  - { label: "Stack", value: "TypeScript, Postgres, Leaflet" }
  - { label: "Run time", value: "under a second" }
  - { label: "Edge cut", value: "down 19% with the optimizer" }
  - { label: "Live changes", value: "separate canaried Salesforce update" }
diagram:
  type: flow
  caption: "How the designer turns accounts into named territories."
  steps:
    - { label: "Seed by account mass", note: "Starting points are spread so each sits in a dense part of the account map." }
    - { label: "Grow around centroids", note: "Regions grow in turn around running weighted centroids, so no region races ahead." }
    - { label: "Rebalance boundaries", note: "Accounts move across a border only when the move makes the sum of squared deviations fall, so the loop must end." }
    - { label: "Smooth for compactness", note: "A smoothing pass trims ragged edges without breaking balance." }
    - { label: "Name the shapes", note: "Reps are matched to regions by an exact minimum-cost assignment on distance from home." }
    - { label: "Fix stray lobes", note: "A flagged optimizer makes reciprocal swaps so every region stays one connected patch." }
screen: territory
---

## The problem

A new territory layout means owner changes in Salesforce, and a bad one moves real books. Leaders needed a place to try a layout before any rep's book moved, and a careful path for the change once a layout was chosen.

## What I built

A what-if sandbox in the platform. It draws regions from account data, assigns reps to them, and lets a leader edit the result on the map.

It never writes to Salesforce. Live changes went through a separate bulk update with a canary. The map beneath it geocodes accounts in three passes (US Census batch, then ZIP centroid, then a postal-area centroid) and applies filters before a 2,000-pin cap, while still showing the true count.

## How it works

The rule is shapes first, names second. Seeds are spread by account mass, and regions grow in a balanced way around running weighted centroids.

A boundary pass then moves m accounts from region j to a neighbour u only when dev_j > dev_u + m. Each such move makes the sum of squared deviations strictly fall, and that sum cannot fall forever, so the loop ends. A smoothing pass follows for compactness.

Only then are reps named. I matched them to regions by distance from home with an exact minimum-cost assignment: brute force for small sizes, the Hungarian algorithm above that.

A second stage, the connected-patch optimizer, fixes regions with stray lobes. It makes reciprocal swaps that move both lobes in one step. It sits behind a flag, and a golden hash test proves that flag-off output is byte-identical to the code before it.

## What went wrong

The plan's own pseudo-code held a rebalance rule that oscillated; writing the tests first exposed it. Later the optimizer found nothing to swap. I instrumented the zero-candidate case: none of about 2,000 candidates were connected on the corner-stripped graph, against about 250 on the physical graph. I was checking connectivity on one graph and measuring the cut on another, so I amended the design to give each graph its own job.

Owner reassignment ran as snapshot, three-row canary, verify by query, full run, per-value count check, rollback file. The canary still could not catch three malformed ids that came from a repair in the middle of the CSV. A canary tests the method, not every row.

## What it proved

Every region came out connected, two runs on the same input were byte-identical, compactness rose 6.2% over the first version, and a full run took under a second. With the optimizer on, edge cut fell 19% and rep-level spikes fell by about a fifth. The price was a wider spread in balance, which I judged right for a map people read by eye.
