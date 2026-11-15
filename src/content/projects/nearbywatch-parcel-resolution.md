---
title: "Matching city records to parcels"
group: nearbywatch
kinds: [data, ai]
order: 410
summary: "A five-rung ladder that ties free-text city records to county parcels in PostGIS, behind a precision gate set before the run."
facts:
  - { label: "Parcels", value: "286,753" }
  - { label: "Gate result", value: "98 of 98 alert-eligible rows correct" }
  - { label: "Alert threshold", value: "confidence 0.90" }
  - { label: "Recall", value: "0.934, every miss area-only" }
diagram:
  type: ladder
  caption: "Each rung runs only if the one above found no answer. Shares are best method per item over 27,906 items on 15 November 2026."
  steps:
    - { label: "Exact address", note: "Normalize the address and match the parcel's situs address. A unique hit scores 1.0. 65.5% of items." }
    - { label: "Fuzzy trigram", note: "Accept at similarity 0.93 or more with a clear lead over the runner-up. 0.03% of items." }
    - { label: "LLM picks", note: "A model chooses among candidates. The code sets confidence to 0.85, below the alert bar. 2.7% of items." }
    - { label: "Geocode boost", note: "A Census geocode within 30 m adds 0.10. It never subtracts. 2.2% of items." }
    - { label: "Area only", note: "After a retry on the descriptive tail, the item ties to an area and never fires an address alert. 29.5% of items." }
---

## The problem

"Near my address" is a radius query, and a radius query needs a point. City records give addresses as free text, with suite numbers, typos or no address at all. A wrong link is worse than none, because it would send someone an alert about a project that is not near them.

## What I built

A resolver in PostGIS that ties each item to one of 286,753 county parcels, or admits it can only place the item in an area. Across 27,906 relevant items on 15 November 2026, counting each item by its strongest method, 65.5% matched exactly, 29.5% stayed area-only, 2.7% were model picks, 2.2% had a pick confirmed by the geocoder and 0.03% matched fuzzily. The full run on 16 July resolved all 23,535 items then in the corpus with zero failures, 69.9% exact; the corpus and the counting method have changed since.

## How it works

The ladder stops at the first rung that answers. An exact match scores 1.0, and a trigram match needs similarity 0.93 with a clear lead. Otherwise a model chooses, and the code, not the model, sets its confidence to 0.85. A Census geocode that agrees within 30 metres adds 0.10. It never demotes, because Census points are accurate only to the street block and a demotion rule punished correct matches about 10% of the time. Only rows at 0.90 or more can fire an alert. I chose 0.90 over 0.96, which would have limited alerts to exact and fuzzy matches.

I set the gate before the run: 115 labeled rows, precision of at least 0.98 overall and on the hard, non-exact path, at least 8 hard-path rows and zero errors. It passed with 98 of 98 alert-eligible rows correct, 13 of 13 on the hard path and recall 0.934. All 7 misses fell to area-only, never to a wrong parcel.

## What went wrong

A final review found that my first "precision 1.0" came entirely from exact matches. The golden rows held no model or geocode cases, because permit labels required exact address equality. I added 15 hand-labeled rows from the boosted pool and the hard-path term. Of 561 boosted rows, I hand-checked ten far near-ties, and all ten were right.

The agenda splitter merged headings. It expected "On Consent" on the item line, so items led by a bill number ran into the previous item and caused 11 extraction failures. Fixtures from real agendas fixed it and recovered 13 items. And the permit check over-counted, because the city's feed publishes about 26 duplicate rows. The database was right; my counter was wrong.

## What it proved

A precision figure means little until the test set holds the hard cases. A ladder that can answer "area only" lets the resolver decline rather than guess.
