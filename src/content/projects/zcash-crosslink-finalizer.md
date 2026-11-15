---
title: "Running a Zcash Crosslink finalizer"
group: zcash
kinds: [infra, security]
order: 500
summary: "Running a finalizer on the Crosslink testnet through forks, stalls and a double-sign of my own making, plus one merged upstream fix."
facts:
  - { label: "Upstream", value: "1 merged pull request (#60), 1 open (#59)" }
  - { label: "Network", value: "Zcash Crosslink testnet" }
  - { label: "Hardware", value: "one AMD EPYC server, RTX 3090 Ti" }
  - { label: "Tooling", value: "private scripts, not open source" }
diagram:
  type: flow
  caption: "How a fork gets caught and healed, drawn from the July and October incidents."
  steps:
    - { label: "Check the live tip", note: "Compare the node's tip with a reference that is moving now, never a pinned checkpoint. Page if the node has no peers." }
    - { label: "Stop the miner", note: "One fail-closed reference has sole authority to stop mining. The block explorer is never trusted for this." }
    - { label: "Contain the branch", note: "A guard keeps the node off the minority branch until finality resumes or I restore state." }
    - { label: "Restore known state", note: "Restore a saved state from before the fork." }
    - { label: "Resync and verify", note: "Resync from peers until the block hash matches the network." }
links:
  - { label: "Merged: pull request #60", href: "https://github.com/ShieldedLabs/crosslink_monolith/pull/60" }
  - { label: "Open: pull request #59", href: "https://github.com/ShieldedLabs/crosslink_monolith/pull/59" }
timeline:
  - { date: "2026-07-08", label: "Self-fork, about 18 hours", note: "The miner mined alone while one watcher checked a pinned checkpoint and another read a frozen source. Every check now compares against a source that is moving." }
  - { date: "2026-07-18", label: "Double-signing, 4.7 days", note: "An orphaned test process held the finalizer key. A guard now pages if any process outside the production unit holds that directory." }
  - { date: "2026-08-24", label: "Pull request #60 merged", note: "Upstream fix for future-dated testnet block-template timestamps." }
  - { date: "2026-09-16", label: "Restart every two hours", note: "Block serving starved the BFT loop while a cache never cleared. Memory grew until the watchdog restarted the node." }
  - { date: "2026-10-15", label: "Seven-hour outage", note: "The node came back on a private chain. I restored known state, resynced from peers and added a no-peers page." }
---

## The problem

Zcash Crosslink, by Shielded Labs, adds a finality layer to proof of work: miners make blocks and a roster of finalizers votes to make them final. A finalizer on the wrong branch, signing twice or stalled, harms the testnet. I wanted to run one well and fix what I could upstream.

## What I built

I run a finalizer and a miner on one EPYC server. Upstream I have one merged pull request, #60, which stopped the node future-dating testnet block-template timestamps: it now offers a minimum-difficulty template only once the time is past the consensus threshold, not two block spacings early. One more, #59, is open; it lets the built-in miner run several solver threads and cancels the others once one wins. I also posted soak results and heap-profile evidence on two pull requests by another contributor.

My watchers, staking bot and fork-heal tooling are private scripts, not open source.

## How it works

Every check compares my tip with a source that is moving now. A July self-fork taught me that: my miner mined alone for about 18 hours while one watcher checked a pinned checkpoint and another read a frozen source. On disagreement, mining stops, a guard holds the node off the minority branch, and I restore known state and resync until the hash matches.

## What went wrong

From 18 to 22 July, an orphaned process from a smoke test shared the production cache directory, so it held the finalizer key and double-signed for 4.7 days. I killed it and added a guard that pages if any node process outside the production unit holds that directory. Its first version paged falsely for a day.

On 16 September I found why the node restarted every two hours. Block serving shares a loop with the BFT engine and starved it, while a serialized-block cache never cleared, so memory grew about 0.5 GB a minute until my watchdog restarted the node at 64 GB.

On 15 October a seven-hour WAN outage left the node on a private chain. I restored the pre-upgrade state, resynced from peers until the hash matched, and added a no-peers page.

Dense blocks took about 5 seconds each to sync in the wallet, while the indexer served 64 of them in 0.24 seconds, so the wallet scan was the bottleneck. And the CipherScan explorer serves stale orphan records after reorgs; one tripped my miner watchdog and cost about 2.5 hours of mining, so it is never a fork oracle.

## What it proved

Four earlier pull requests of mine did not land: upstream's own design replaced two, a rewrite made one obsolete, and one duplicated an open PR I should have found. An unreviewed pull request holds no place in a queue. #60 led with measured evidence and merged the next day.
