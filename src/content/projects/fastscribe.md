---
title: "FastScribe: transcription on my own GPU"
group: fastscribe
kinds: [ai, infra]
order: 300
summary: "A free audio-to-text service on open speech models, run by GPU workers on a home server that opens no inbound port."
facts:
  - { label: "Stack", value: "Next.js, Supabase, R2, Stripe, whisper.cpp" }
  - { label: "Tests", value: "752 web, 180 worker, all passing" }
  - { label: "Commits", value: "370 on the product" }
  - { label: "Sitemap", value: "122 pages" }
diagram:
  type: flow
  caption: "One file, from the upload button to a finished transcript."
  steps:
    - { label: "Upload to R2", note: "The browser sends the file straight to Cloudflare R2 with a presigned PUT. No file bytes pass through Vercel." }
    - { label: "Job row in Postgres", note: "The API checks the stored object's real size against the quota, then inserts a job into a Postgres table that serves as the queue." }
    - { label: "Worker takes a lease", note: "A Python worker on the home server polls outward and claims the job with a lease. Nothing connects in, so no port is open." }
    - { label: "whisper.cpp on the GPU", note: "large-v3-turbo runs on an RTX 3090 Ti. Silero VAD gates silence and a per-language table picks the model file." }
    - { label: "Transcript saved", note: "The write succeeds only while the job is still marked processing. Then the audio is deleted." }
links:
  - { label: "thefastscribe.com", href: "https://thefastscribe.com" }
shots: [fastscribe-home-top.png, fastscribe-transcribe.png, fastscribe-pricing.png]
---

## The problem

People who transcribe now and then often do not want to send their audio to a third-party AI service. Open speech models are good enough, but they need a GPU and a pipeline around it. I wanted a service that does the first file free, with no account, and keeps audio no longer than the job takes.

## What I built

FastScribe turns audio and video into timestamped transcripts in TXT, SRT, VTT and DOCX, with optional speaker labels. I built it alone, started on 3 July 2026 and launched three days later. The web app is Next.js on Vercel, with Supabase for Postgres and auth, Cloudflare R2 for files and Stripe for a monthly plan and pay-per-upload credits. Transcription runs on whisper.cpp on an RTX 3090 Ti in a server at my home.

The product now has 370 commits, 752 passing web tests in 74 files, 180 passing worker tests, 25 forward SQL migrations in the repo and 122 pages in its sitemap.

## How it works

The browser uploads straight to R2, so file bytes never cross Vercel. The API checks the stored object's real size against the quota and inserts a job into a Postgres table that serves as the queue. Workers on the home server poll outward and claim jobs with a lease, so the server opens no inbound port.

Silero VAD stops the model inventing words in silence. Completing or failing a job requires `status='processing'`, so a worker that lost its lease cannot undo a transcript another worker finished. The audio is deleted once the transcript is ready. The transcript text is kept, seven days on the free plan and for good on Pro, and the privacy page says so.

## What went wrong

Completion emails failed silently from launch. The email account had no verified domain, and the code swallowed send errors by design. I found it two days in, rewrote the mailer as plain SMTP, set up DKIM and DMARC, and probed real signup and completion mail on production. Then a localhost site URL in config put dead links in completion emails for 17 days, until I added a startup guard.

Whisper also ran without a language flag at first, so every file came out as English. And three coding sessions once each took the same next migration number. Git saw no conflict because the file names differed, but two migrations redefined the same function. I now rebase any migration that redefines a function onto what is live.

## What it proved

One person can run auth, billing, a queue and GPU workers from a home server with no open port. The costly bugs were silent ones, and the fix that held was checking the real outcome on production, not the exit code.
