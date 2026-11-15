---
title: "An evaluation suite for prompt changes"
group: platform
kinds: [ai]
order: 70
summary: "Six AI surfaces, three kinds of check and a free offline replay, under a rule that every prompt change needs a before and after run."
facts:
  - { label: "Surfaces", value: "six" }
  - { label: "Check modes", value: "structural, rubric, human" }
  - { label: "Offline replay", value: "zero model cost" }
  - { label: "Baseline", value: "62 of 62 checks, rubric mean 4.68 of 5" }
diagram:
  type: flow
  caption: "How one evaluation run turns cases into a result I can compare."
  steps:
    - { label: "Mine cases", note: "Cases come read-only from real questions, scrubbed to invented names, and a test asserts the scrub." }
    - { label: "Replay or go live", note: "Offline mode replays committed outputs at no cost. Live mode calls the real surface." }
    - { label: "Structural checks", note: "Each check states why it exists. A missing path in the output fails the check." }
    - { label: "Rubric grading", note: "A stronger model grades 0 to 5 through a forced tool call that throws on a wrong count of scores." }
    - { label: "Report, skips included", note: "Human checks wait for a person, and the report counts any case it did not measure as skipped, out loud." }
---

## The problem

The platform had six places where a model's output reached a rep: chat answers, outreach drafts, the choice of outreach branch, narrative summaries, write actions and structured answers. A prompt tweak that helped one case could break another, and I had no way to see it before reps did.

## What I built

An evaluation harness run with one command. I mined cases read-only from real questions and scrubbed them to invented names, and a test asserts the scrub held. A flag switches from offline replay to the live surfaces. The rule I worked under: no prompt or model change merges without a before and after run.

## How it works

Each case uses one or more of three check modes:

- Structural checks, each with a mandatory reason. A path missing from the output fails the check rather than passing it.
- Rubric checks, graded 0 to 5 by Claude Opus through a forced tool call. The call throws if the grader returns the wrong number of scores.
- Human checks, which are never auto-scored.

Offline replay runs the checks over committed outputs and costs nothing in tokens, so cost was never a reason to skip a run. The report counts any case it could not measure as skipped, out loud. A quiet skip would read as a pass.

The baseline run had 25 cases: 24 passed and one waited on a human. All 62 checks passed, the rubric mean was 4.68 out of 5 over 10 graded cases, and the run took about six minutes. The write-action surface had 15 more cases, 49 of 49 checks passing offline.

## What went wrong

The suite found a real defect soon after it existed. When the chat assistant ran out of its six-turn tool budget, it returned its own narration as the final answer. The fix was a structural check in code that forces a final synthesis turn, not a prompt change.

There was no CI server. The unit tests and the evaluation run were gates I ran by hand before a merge, and nothing enforced them but habit.

## What it proved

Prompt work needs the same before and after evidence as code. A free offline replay removes the cost of checking, and counting skips out loud keeps a green report from hiding work it never did.
