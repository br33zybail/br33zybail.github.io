---
title: "Model gateway and model races"
group: workstation
kinds: [ai, infra]
order: 600
summary: "A home AI stack that routes work by role across local and cloud models, and races that showed bigger models losing on some tasks."
facts:
  - { label: "CPU", value: "AMD EPYC 7702P, 64 cores" }
  - { label: "GPU", value: "RTX 3090 Ti, 24 GB" }
  - { label: "RAM", value: "over 200 GB" }
  - { label: "Gateway", value: "LiteLLM, routes by role name" }
diagram:
  type: flow
  caption: "How one piece of work moves through the stack."
  steps:
    - { label: "Head splits by shape", note: "Claude Code splits a task by its distinct shapes. Small tasks stay inline; larger ones get one head and three to five workers." }
    - { label: "Call a role", note: "Each worker calls a role name such as tool-fast, never a model name." }
    - { label: "Gateway picks a model", note: "LiteLLM maps the role to a local Ollama model, OpenRouter or xAI, with a fallback chain. Roles for customer data stay local and fail closed." }
    - { label: "Second family reviews", note: "For high-stakes work, reviewers from two model families check the result without seeing each other's answers." }
---

## The problem

Many capable models are cheap or free, and public rankings say little about my tasks. I wanted each piece of work on the cheapest model that does it right, private data off the cloud, and model changes made only on evidence.

## What I built

The hardware is one server: a 64-core AMD EPYC 7702P, over 200 GB of RAM and an RTX 3090 Ti with 24 GB. A LiteLLM gateway on localhost maps role names to local Ollama models, OpenRouter or xAI, with fallback chains. Claude Code acts as the head and calls workers by role. Customer-data roles run only on local models, with no fallback chain, so they fail closed. No model joins a role without a race on fixtures that execute its code; regex grading misled me early.

## How it works

The races found, on small samples:

- On a task with an explicit function-stub contract, small models such as gpt-oss-20b passed while GLM-5.2, DeepSeek and MiMo all scored 0.
- GLM-5.2 went 3 for 3 at $0.047, while two gpt-5.6 variants cost 5.8 and 16 times as much, and the "pro" variants spent 3 to 5 times the reasoning tokens for worse pass rates.
- A higher reasoning-effort setting lost an audit task, 0.667 against 1.0, on n=2.
- The head lane solved the audit but missed the stub contract by building a class, so head ability and worker ability need separate tests.
- In a fresh-session probe, dual-family review caught a lock race that one family missed.

One model scored 11 of 11 and then 0 of 11 on the same prompt, so I treat a single run as no verdict.

Local hybrid search covers the machine's own notes and repos: SQLite FTS5 for BM25 plus local embeddings, fused by reciprocal rank. A daily job proposes memory updates but never applies them; two of three model-written candidates I checked were made up. A cron job reads temperatures, fans and ECC counts every two minutes and pages after three breaches in a row.

## What went wrong

My session-capture hook sent a pasted passphrase and a live API key to a free cloud model and into the search index, because redaction matched key prefixes only. I rotated both and rebuilt redaction, which now catches 19 secret shapes in tests and leaves 13 harmless strings alone.

Alerts failed too. Per-hit ECC pages used up the push service's 250 messages a day per IP and silenced every channel until midnight UTC. I replaced them with a 30-minute rollup, then found node alert loops spending the same quota and gave them cooldowns.

## What it proved

On my tasks, size and effort did not buy quality; task shape decided. And an alert channel is a shared budget, so every sender needs a limit.
