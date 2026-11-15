---
title: "Hard stops on AI-drafted sales email"
group: platform
kinds: [ai, revops, security]
order: 80
summary: "AI drafts that cannot be sent word for word, a block that fails closed, and a cheaper model that checks who really said what."
facts:
  - { label: "Verbatim send", value: "refused with HTTP 422" }
  - { label: "Attribution check", value: "Sonnet writes, Haiku verifies" }
  - { label: "Scheduled send", value: "replays the stored request, never resends" }
  - { label: "Tests at rich-text ship", value: "778" }
diagram:
  type: flow
  caption: "The gates an AI draft passes on its way out."
  steps:
    - { label: "Inactive check", note: "A contact marked inactive in Salesforce blocks the draft. A database error blocks it too." }
    - { label: "Label the speakers", note: "Every context line names who said it, from Gong participants and the email owner, with the sender marked." }
    - { label: "Generate and verify", note: "Sonnet writes the draft. Haiku checks that the draft does not credit the sender with a colleague's conversation." }
    - { label: "Rep edits", note: "The send route compares plain text with the AI draft. An unedited draft gets HTTP 422." }
    - { label: "Send or schedule", note: "A scheduled send stores the raw request, and a worker replays it through the same send function." }
---

## The problem

Reps wanted AI to draft their outreach. The risks were plain: an email sent with no human read, an email to someone who had left, and a draft that cited a conversation the rep never had.

## What I built

Gates in code, not in the prompt. An AI draft cannot be sent word for word: the send route returns HTTP 422. It compares the plain-text form of the message with the draft, so bolding one word does not get past it. Rich text is a small typed document rebuilt on the server, with no HTML sanitizer and no raw HTML injection.

A contact marked inactive in Salesforce blocks draft generation, the composer, the send route and the queue scorer. I also changed one policy on purpose. Salesforce's Email Opt Out is a marketing unsubscribe, so it stopped blocking one-to-one outreach.

Before the change I found every enforcement point with grep, six sites and the bounce lane. A hard bounce sets both flags, so a bounced address stays blocked.

## How it works

Drafts drew on prior conversations, and the model would credit the sending rep with a colleague's call or email. Every context line now carries the speaker, taken from Gong participants and the email owner, with the sender marked. A prompt rule covers it, and a verifier lane checks it: Sonnet generates, a cheaper Haiku model verifies. I used drafts already confirmed bad as the live proof.

Gmail has no scheduled send, so a scheduled row stores the composer's raw request. A worker every five minutes claims due rows with one `FOR UPDATE SKIP LOCKED` update and replays them through the same send function. A row stuck in "sending" fails and is never resent.

## What went wrong

The inactive check first wrapped its query in a catch that returned an empty list. A database fault read as "nobody is inactive", and the hard stop became a hole. It now fails closed: a query error becomes an explicit 422.

Tracking was wrong in two ways. Bounces counted as replies, and I repaired the dozens of drafts and emails affected. Reps opened their own sent mail, and about a quarter of the opens counted as human were bursts from the sender. Reply detection now skips bounces and auto-replies, and open tracking sets aside the sender's own opens.

## What it proved

A permissive default on a hard stop is a hole. Rules that must hold belong in code that refuses, with tests, and the prompt only helps.
