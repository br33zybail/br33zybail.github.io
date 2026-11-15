---
title: "Company data in your own AI assistant"
group: platform
kinds: [ai, security, infra]
order: 50
summary: "A read-only MCP endpoint, with the app as its own OAuth server and about 70 lines of hand-written JSON-RPC, that keeps each person's access."
facts:
  - { label: "Protocol", value: "MCP over about 70 lines of JSON-RPC, no SDK" }
  - { label: "Auth", value: "own OAuth server, PKCE, rotating refresh tokens" }
  - { label: "Tools", value: "11 read tools, 2 budgeted lanes" }
  - { label: "Registered for", value: "claude.ai" }
diagram:
  type: flow
  caption: "What happens to one tool call from a colleague's assistant."
  steps:
    - { label: "OAuth sign-in", note: "The assistant finds the app through discovery documents and signs in with PKCE. Codes are single use, and the database keeps only token hashes." }
    - { label: "Rebuild the session", note: "Every request rebuilds the session from the user row, with the person's real role and active flag." }
    - { label: "Claim spend", note: "Budgeted lanes claim their cost with a conditional upsert before the upstream call is made." }
    - { label: "Run the tool", note: "Tools read the same views the app reads, so the same access rules decide what comes back." }
    - { label: "Log the outcome", note: "The log keeps the tool and the outcome, never the arguments or the results." }
---

## The problem

Colleagues wanted to ask about company data from their own AI assistant, not only from the platform's chat. That is only safe if the assistant sees exactly what the person sees in the app, cannot write anything, and spends nothing from the company's API key.

## What I built

A read-only remote MCP endpoint, registered as a connector for claude.ai. It offers eleven read tools, such as company search, opportunities, call transcripts, objections, competitor mentions, win and loss analysis and a search across all sources. Two lanes reach outside the corpus on a budget: a ZoomInfo contact search that never returns email or phone, and a web reader whose content the tools treat as untrusted evidence, never as instructions.

No Salesforce write tool exists at all. I left Slack search out because the Slack archive had no row-level security. Each person's calls run on their own subscription.

## How it works

The app is its own OAuth authorization server. It serves the discovery documents, allows client registration only from claude.ai and claude.com, requires PKCE S256, and binds single-use codes to the challenge, resource and redirect. Refresh tokens last 30 days and rotate on every use, and each records the token it replaced, so the server catches a replayed one.

The database keeps only token hashes. I used no auth vendor and no MCP SDK; the JSON-RPC layer is about 70 lines I wrote by hand.

On every request the endpoint rebuilds the session from the user row and checks that the person is still active, so a book-scoped rep stays book-scoped. Each budgeted lane claims its spend before the upstream call, against caps of 30 ZoomInfo pages, 30 web requests and 3 MB per person per day. Each user gets 60 calls a minute.

## What went wrong

An early spec assumed a leader setting in the database would gate the Gong tables. Those tables had no row-level security at all. I moved the gate to the endpoint, and a test asserts the tool runner is never reached for a caller who fails it.

Later, colleagues' scheduled routines reported the connector dropping, while the server showed zero denials. Four refusal paths wrote nothing. My first diagnosis blamed a different local server.

I added a log line to every refusal path, raised the access token life from one hour to eight, and raised the request body cap from 8 KB to 64 KB. A longer token is safe here only because each request rechecks the user.

## What it proved

A small, hand-written protocol layer is enough when the security lives in the session and the database. A refusal that leaves no record looks like a network fault.
