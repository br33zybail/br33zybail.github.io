---
title: "A panel of models redesigns the product"
group: platform
kinds: [ai]
order: 215
summary: "Five models drew 22 pages in two visual directions, one model argued both directions down, and I wrote up what to keep and what to leave."
facts:
  - { label: "Scope", value: "22 pages, 2 directions, 5 models" }
  - { label: "Logged spend", value: "about $25 over two days" }
  - { label: "Debate", value: "three rounds, ending in a third direction" }
  - { label: "Fixtures", value: "fictional data, made-up brands" }
diagram:
  type: flow
  caption: "How the panel ran, from brief to picks."
  steps:
    - { label: "Two directions", note: "I wrote two committed moods for the product: a calm one built on light and spacing, and a dense one built like an instrument." }
    - { label: "Structure briefs", note: "Three language models each wrote a page-by-page structure brief before anything was drawn." }
    - { label: "Generate", note: "Two models wrote working HTML and three drew images, for every page in both directions. Every call and its cost went to a manifest." }
    - { label: "Debate", note: "One model had to attack both moods at the scale of the whole product, then commit. It proposed a third: an evidence ledger with a scan state and a focus state." }
    - { label: "Second round", note: "The image models redrew the key screens against the new direction, on a dark ground and on a paper ground." }
    - { label: "Picks", note: "I ranked the results and wrote, for each, what to take and what not to." }
shots: [study-home.png, study-queue.png, study-territory.png, study-projection.png, study-practice.png, study-signals.png, panel-paper-queue.jpg, panel-seedream-home.jpg]
shotsNote: "Design studies from the panel. The first six are HTML written by one model and rendered as it wrote them; the last two are generated images, so their small text is garbled. All brands and data are fictional. None is the production screen."
---

## The problem

The platform's interface had grown one feature at a time. I wanted to see what it could look like as one system, and I did not trust a single model, or myself, to produce more than one idea. A model asked for a redesign gives its house style. Asking one model twice gives the same style twice.

## What I built

A script that ran a design panel. I wrote two visual directions as committed one-paragraph definitions, then had five models produce each of 22 pages in both. Two language models wrote working HTML. Three image models drew the same pages as pictures. A gallery page put every version of a page side by side, with arrow keys to move between them.

All fixtures were fictional and each model invented its own brand name, so nothing in the output came from the real system.

## How it works

Three language models first wrote structure briefs, so the drawing step started from an argued layout and not a blank page. The generation step then looped over pages, directions and models, wrote each result to disk and appended a line to a manifest with the model, the page and the measured cost. The manifest holds 288 records, and the logged spend comes to about $25 over two days in August 2026.

Then I ran a debate. Over three rounds one model had to say where each direction would fail a specific person: an analyst hunting exceptions across hundreds of accounts, a manager triaging risk, an executive who opens the product twice a week. It then had to commit. It rejected both and defined a third direction with two states of one workspace, one for scanning and one for a single item held open, and wrote each as a paragraph a designer could build from.

The image models redrew the key screens against that direction. In October I wrote up my picks: five to learn from, five to leave, and eight patterns that recurred in the best ones. A change shown as a field's old and new value, not a sentence about it. Rules and whitespace in place of cards. Colour spent only on the split between what waits on a person and what is settled.

## What went wrong

The run log is honest about failures. One image model was called on the wrong endpoint and returned an error every time until I fixed the route. Another returned server errors on its first pages. A guard rejected HTML that came back suspiciously short, which caught six truncated pages, and several long generations were cut off mid-stream. The manifest records each failure beside the successes, so the gallery shows a gap where a page is missing and not a broken render.

The generated images also taught a limit. They are good at composition and bad at text: the small type is garbled. They were useful for deciding what a screen should weigh, and useless as a specification.

## What it proved

Variety has to be forced. Different model families, two opposed directions and a debate that must attack before it commits gave me a range no single prompt would. One frame from the picks was taken up for the home page redesign. The rest stayed studies, and the picks end by naming the one screen worth building in both grounds to test with reps.
