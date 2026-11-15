---
title: "FastScribe pages built from data"
group: fastscribe
kinds: [data, revops]
order: 340
summary: "122 pages from dynamic routes, a link graph tested so no page is an orphan, Spanish pages with hreflang, and guides built on measurements."
facts:
  - { label: "Pages in sitemap", value: "122" }
  - { label: "Link clusters", value: "16" }
  - { label: "Guides", value: "21, two built on my own benchmarks" }
  - { label: "Spanish pages", value: "5, with full hreflang" }
diagram:
  type: flow
  caption: "How a landing page goes from an entry to a linked, tested, indexed page."
  steps:
    - { label: "Entry", note: "A landing page starts as an entry with a slug. A dynamic route renders it, in English under /s/ or Spanish under /es/s/." }
    - { label: "Cluster links", note: "The link graph places the page in a cluster. It links to the next few pages and receives links from the previous few." }
    - { label: "Locale tags", note: "One shared helper writes the hreflang set (en, es, x-default) for pages that exist in both languages." }
    - { label: "Tests", note: "Tests fail if a page lacks an inbound link or three outbound links, if a title runs long, or if hreflang pairs do not point at each other." }
    - { label: "Deploy and ping", note: "A push to main deploys to production and pings IndexNow." }
links:
  - { label: "thefastscribe.com", href: "https://thefastscribe.com" }
---

## The problem

A free utility finds its users through search. That means many pages, each aimed at one narrow use, and pages like that decay: they fall out of date with the product, lose their links and drift apart in style. I wanted the page set held to the same standard as code, with tests.

## What I built

The live sitemap lists 122 URLs: 21 guides, 14 tools, 73 English landing pages, 5 Spanish landing pages, their indexes and seven core pages. Landing pages render from entries through dynamic slug routes, so a new page is mostly data.

The guides I value most rest on my own measurements: a whisper speed benchmark and a 12-language accuracy benchmark. Comparison guides for Otter, Rev and TurboScribe attribute every competitor number to the competitor, as their claim.

## How it works

A link graph module defines 16 clusters. Membership is symmetric, so links are reciprocal: each page links to the next few pages in its cluster and receives links from the previous few, and slugs that do not resolve are dropped. Tests assert that every page has at least one inbound link and three outbound. Other tests cap the meaningful part of each title at 55 characters, after I rewrote 40 titles.

The Spanish pages use a parallel `/es/s/[slug]` route. One shared helper writes the full hreflang set for both languages, a test checks that each pair points back at the other, and the pages set `og:locale` to `es_LA`. A review for native register caught two sentences that read as translated.

Page art comes from image models on my own GPU, Z-Image Turbo for stills and Wan 2.2 for video loops, with some polish passes through xAI's Grok Imagine. I re-arted 101 pages in one day. Alt text says "Painted illustration", never "hand-painted". Every push to main deploys and pings IndexNow.

## What went wrong

After speaker labels shipped, twelve pages still said FastScribe did not offer them. Prose copy drifts from the product unless something checks it, and I found and fixed all twelve in one sweep.

I also added an `llms.txt` file, named rules for AI crawlers and JSON-LD aimed at AI search. My own notes record that `llms.txt` and the extra JSON-LD do close to nothing for AI citations. I list them here as work done, not as a result.

## What it proved

A page set this size stays correct when its rules are tests: no orphan pages, reciprocal hreflang, titles that fit. The guides built on real data are the pages I can stand behind. I make no traffic claims for any of it.
