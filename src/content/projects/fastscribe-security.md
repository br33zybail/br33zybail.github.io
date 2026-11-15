---
title: "Security audit of FastScribe"
group: fastscribe
kinds: [security]
order: 330
summary: "Three waves of fixes from an independent audit: a read guard that fails closed, quota by real object size and an enforced CSP."
facts:
  - { label: "Audit", value: "4 parallel AI agents, 11-item checklist" }
  - { label: "Credit race test", value: "20 parallel spends on a balance of 5 gave 5" }
  - { label: "Live headers", value: "enforced CSP, HSTS, X-Frame-Options DENY" }
  - { label: "Anonymous upload with no token", value: "403" }
diagram:
  type: ladder
  caption: "The server-side checks a file meets on its way from upload to a transcript read."
  steps:
    - { label: "Bot check", note: "An anonymous upload must carry a Turnstile token. A live probe without one gets a 403." }
    - { label: "Hourly upload cap", note: "Presigned upload URLs are capped per identity per hour, counted in a table only the service role can touch." }
    - { label: "Real object size", note: "The server reads the stored object's size from R2 and charges quota by that, not by what the client declared." }
    - { label: "Credit spend", note: "One Postgres function checks the credit balance and inserts the job under a single advisory lock." }
    - { label: "Read guard", note: "Transcript reads fail closed. Pages whose URL is the secret carry no analytics, under an enforced CSP." }
links:
  - { label: "thefastscribe.com", href: "https://thefastscribe.com" }
---

## The problem

FastScribe holds people's recordings and transcripts, takes payments and lets anyone upload one file without an account. That gives an attacker three ways in: transcript links, quotas a client can lie about, and anonymous uploads that burn GPU time. I had built the product fast, so on 26 July 2026 I ran an independent audit of it.

## What I built

Four AI review agents worked in parallel from an 11-item checklist. They confirmed several areas clean: no secrets in the browser bundle, no SQL injection or XSS, sound route authorization, no error leakage and server-side duration caps. The rest became three waves of fixes. The first made the transcript read guard fail closed and added a content security policy. The second stopped quota from trusting the client. The third hardened the Stripe webhook with a payment-status gate, a downgrade on past_due, a unique customer id and an event-ordering guard, and replaced stored IPs with peppered hashes plus a migration that scrubbed the old rows.

## How it works

An anonymous upload must carry a Turnstile token. Presigned upload URLs are capped per identity per hour: 10 anonymous, 30 free, 120 Pro. Before charging quota, the server reads the object's real size from R2 with a HeadObject call, which closed a loop where a client could declare a small file and send a large one.

Paid credits live in a ledger with row-level security on and no policies, so only the service role can read it. One Postgres function checks the balance and inserts the job under one advisory lock. In a test, 20 parallel spends against a balance of 5 produced exactly 5 jobs. Five review rounds on that ledger found more than 30 bugs.

I ran the content security policy report-only first and switched it to enforced after a headless walk through the production flows logged zero refusals. Users can erase their own data: one endpoint deletes a transcript, another the whole account, both behind a same-origin CSRF check.

## What went wrong

Password reset was half built: the emails went out, but nothing consumed the link. When I built the confirm route with an open-redirect guard, review showed my string checks lost to the URL parser on input like `/\evil.com`. Separately, a worker retry storm got the database IP circuit-broken, after which I rotated the database password and enforced SSL.

## What it proved

The prompt-injection audit I later ran across my products found nothing to fix here, because FastScribe makes no LLM calls. The risk sat in plain web paths. Checks that run on the server and fail closed held up; the check that trusted the client did not.
