---
title: "Nightly grader for practice pitches"
group: platform
kinds: [ai, infra]
order: 140
summary: "Practice pitches transcribed locally and graded overnight. Any quote the model cites must be found in the transcript, or it is dropped."
facts:
  - { label: "Transcription", value: "local whisper, about 7x realtime" }
  - { label: "Graded", value: "62 recordings" }
  - { label: "Tests", value: "644" }
diagram:
  type: flow
  caption: "One recording's path from the Slack channel to a posted grade."
  steps:
    - { label: "Sweep the channel", note: "A queued job picks up new pitch recordings posted in Slack, five per tick." }
    - { label: "Transcribe locally", note: "whisper runs on the machine, so the audio never leaves it. A no-speech gate stops empty clips here." }
    - { label: "Measure delivery", note: "Deterministic code computes delivery metrics from the timed transcript." }
    - { label: "Judge the rubric", note: "A model grades ten rubric lines, each with a quote and a timestamp." }
    - { label: "Verify quotes", note: "Each quote is matched literally, then tolerantly. An unverified quote is dropped; the judgment stays." }
    - { label: "Post once", note: "An outbox row with a lease posts the grade, and a reconcile step makes sure it posts exactly once." }
---

## The problem

Reps recorded practice pitches and posted them in a Slack channel for a human grader. I wanted every pitch to also get a specific grade by the next morning, with evidence a rep could check against the recording.

## What I built

A nightly sweep that finds new recordings, transcribes them on the local machine with whisper, measures delivery, and has a model grade the content against a ten-line rubric. The grade goes back to Slack. It graded 62 recordings, and the code carries 644 tests.

## How it works

Transcription is local, at about seven times realtime. A no-speech gate stops silent or empty clips before any model sees them. Delivery metrics come from plain code over the timed transcript, so they are the same every run.

The model judges each rubric line and must cite a quote with a timestamp. I then check each quote against the transcript, first as a literal match and then with a tolerant one. If a quote cannot be found, I drop the quote but keep the judgment. A rep never sees a quote the model made up, and a fair judgment is not lost because the model paraphrased.

Posting goes through an outbox. A row is leased before the post, and a reconcile step checks what reached Slack, so a crash between "posted" and "recorded" cannot post twice.

## What went wrong

For a while every run reported "ok" while recordings failed. The scheduler's PATH did not include the Homebrew directory, so ffmpeg was missing and every decode failed. The run summary counted runs, not results, so it looked healthy. I set the PATH and changed the summary to count rows that had used up their attempts, so a run that grades nothing now says so.

## What it proved

A model grade is worth showing only when code checks its evidence. With quote verification, no quote reaches the rep that the transcript does not contain.

One question stayed open. Calibration against the human grader was still undecided, so I treat the grades as consistent and checkable, not as proven equal to a person.
