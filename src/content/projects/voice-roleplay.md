---
title: "Voice role-play with an AI prospect"
group: platform
kinds: [ai]
order: 130
summary: "Spoken practice against an AI prospect for each pipeline stage, seeded from real call moments and graded on a five-part rubric through a forced tool."
facts:
  - { label: "Models", value: "Haiku judges, Sonnet seeds, ElevenLabs voice" }
  - { label: "Rubric", value: "five dimensions, 0 to 5 each" }
  - { label: "Tests", value: "279 to 294 in the stage fix" }
diagram:
  type: flow
  caption: "How a practice session is built, run and graded."
  steps:
    - { label: "Mine seed quotes", note: "Real call moments are joined to the CRM stage the deal was in on the call date." }
    - { label: "Judge topical fit", note: "A Haiku judge checks that each quote is about what that stage is about, not just dated inside it." }
    - { label: "Pick a hidden cue", note: "A hash of a client seed decides whether this session carries a product cue, so every stateless turn agrees." }
    - { label: "Talk to the prospect", note: "The rep speaks; the AI prospect answers in a stock voice chosen from a server-side allow-list." }
    - { label: "Grade by forced tool", note: "The grader must return five scores through a tool call, one per rubric dimension." }
screen: roleplay
---

## The problem

A buyer in discovery raises different things from a buyer in negotiation. Practice is only useful if it sounds like the stage the rep is about to face, and if the grade is consistent from one session to the next.

## What I built

Voice role-play against an AI prospect, one scenario per pipeline stage. The rep talks, the prospect answers aloud, and at the end a grader scores the conversation on five dimensions: acknowledge, reframe, evidence, stay on frame, and close the loop. Each runs 0 to 5, for a maximum of 25. The grader must answer through a forced tool, and the rubric, the grader and the role-play prompt are kept in lockstep as three sources that change together.

## How it works

Seed quotes come from real call moments, joined to the CRM stage the deal held on the call date. That join is ground truth, not a model's guess. Haiku only judges whether a moment is worth practising, and any Sonnet-written seed goes through a reviewer queue.

About one session in three carries a hidden product cue. A hash (FNV-1a) of a client seed picks it, so the stateless turns of one session all agree.

The prospect's product knowledge is clipped to published pages only. Drafts are excluded, because a shared cache slot and a leader's wider access would otherwise leak them. A missed cue shows up under "what to improve", with no score penalty.

The client sends a persona key, never a voice id. The server maps ten persona archetypes to an allow-list of stock ElevenLabs voices, and a budget guard reads live remaining credits. I declined to clone voices from real call audio on consent grounds.

## What went wrong

After launch a rep said the stages felt the same. The cause was in the corpus, not the prompt. Stage labels came from CRM timestamps, not from what was said, and one stage had 144 quotes against thousands for others.

I added a Haiku topical-fit judge, backfilled about 14,000 rows, blended in two AI seeds per session, raised generation to 24 per stage, and gave each stage its own opening move and arc. The share of seed quotes passing the judge ran from 26% to 88% depending on the stage.

A second fault was worse. A smoke test of the corpus scoring silently ran as the database superuser. The script runner hoisted an import above the line that read the environment file, so its row-level security checks passed for the wrong reason. The rule I kept: a security test first asserts which role it runs as.

## What it proved

Confirm which layer a complaint lives in before changing anything. "The stages feel the same" read like a prompt problem and was a labelling problem.
