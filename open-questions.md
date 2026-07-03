# Open Questions

Design decisions not yet made. These are the questions to answer before WeTube moves from vision to spec.

## View Counts — The Biggest Open Question

Counting views is not possible on pure peer-to-peer as far as we know. Views are the one YouTube primitive with no obvious Bitsocial equivalent:

- A "view" is not a signed user action like a vote or a comment — it's passive, and viewers have no reason to broadcast it. Even if clients emitted signed view events, they would be sybil-cheap to inflate and would leak watch history.
- Peer-to-peer playback (IPFS, WebTorrent) has no server that could count anything.

The current best guess is that view counts would have to come from **a views aggregator that reads the counter from each embed source** — most video hosts already expose per-video view counts, so an aggregator could sum them across a video's source list. Open sub-questions:

- Who runs the aggregator? Natural fit: public RPCs and indexers, competing on it like they compete on feed algorithms — so counts are estimates from competing aggregators, not a single truth.
- How do counts from IPFS/WebTorrent playback get captured at all (they likely don't — undercounting the most decentralized sources)?
- Does the client display an aggregate number, a per-source breakdown, or a "≥ N" floor with a tooltip explaining the methodology?
- Can aggregated counts be attested/signed by the aggregator so other clients can reuse them without re-crawling?
- Should rankings (directories, algorithms) use views at all, or lean on votes and comments, which are native and verifiable?

This is genuinely unsolved — it needs its own design doc before WeTube specs out.

## Video Post Schema

**Decided: the video post schema should be standardized as a BSIP** (Application category), so all Bitsocial clients render video posts consistently instead of a raw link list. Remaining details for the BSIP draft:

- How are embed sources encoded in a community post? A dedicated post field (client-agnostic) vs. structured content in the post body?
- What metadata does a video post carry — thumbnail (image link or IPFS CID?), duration, resolution/variants per source, subtitles/captions?
- Should the schema distinguish source *types* (web embed, IPFS, WebTorrent) so clients can order fallbacks intelligently, or is a flat ordered list enough?

## Source Health and Trust

- Do clients verify that different sources contain the *same* video (e.g. a content hash the embeds should match), or is the owner trusted since it's their channel?
- How do clients detect and report dead sources back to the owner without a central telemetry service?
- Can viewers propose mirror sources for a video (owner-approved), so the community helps keep videos alive?

## Likes, Dislikes, and Rankings

**Decided: likes/dislikes are plain Bitsocial community votes** (owner's node tallies, seeded with the post). Pubsub voting is reserved for directory/curation slots. Remaining:

- Does WeTube show dislike counts (YouTube removed them; WeTube plausibly shouldn't hide them)?
- What sybil resistance applies to video votes, given channels choose their own challenge configs?

## Subscriptions and Feeds

- Subscriptions are presumably local/account state (a list of channel addresses in the user's Bitsocial account), synced the way other Bitsocial clients sync account data — confirm.
- What does the default "subscriptions feed" aggregation look like purely peer-to-peer, and at what channel count does it need an RPC or indexer to stay fast?
- Notifications for new uploads: pubsub subscription per channel, polling, RPC push?

## Discovery Beyond Directories

**Decided: recommendation algorithms come from public RPCs, and users can switch between them** (or turn them off), the same model as the flagship Bitsocial app — see [curation-and-discovery.md](curation-and-discovery.md). Remaining:

- Search: rely on neutral crawler/indexers (bitsocial-indexer style) with WeTube-specific ranking, or ship a dedicated video search instance?
- What does the client show with no RPC connected — pure client-side "up next" from subscribed/related channels?

## Monetization Details

- Memberships/subscriptions on Bitsocial Chain: gated content (members-only videos via token-gated challenge?), badges, recurring payments?
- Superchat-style paid comments during premieres/live?
- Standard revenue-sharing splits between creator ↔ client ↔ RPC when an RPC-served view generates ad revenue — protocol convention or pure bilateral deals?
- Privacy: tipping links wallet history to social identity; Bitsocial Chain's design notes call for room for privacy systems (stealth addresses, shielded pools). What does WeTube default to?

## Live Streaming

- Undecided, but the lean is: **live streams would be embedded the same way as videos, if possible** — a "live" post whose source list points at live embeds (owner's own RTMP/HLS endpoints, third-party live hosts, WebRTC/peer-to-peer experiments), then flips to VOD mirror sources after the stream ends. Whether that's feasible in v1, and whether live chat maps onto community comments over pubsub, needs investigation.

## Naming and Branding

- Channel identity: encourage `.bso` names (`alice.bso`) as the canonical channel handle from day one?
- Verification/impersonation: with no global admin there's no verified badge — is `.bso` ownership plus directory reputation enough?
