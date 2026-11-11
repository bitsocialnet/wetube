# Open Questions

Design decisions not yet made. These are the questions to answer before WeTube moves from vision to spec.

## View Counts

**Decided 2026-11-11: view providers** that viewers can reorder, turn off or add to, like 5chan's stats providers, with Forge running the default. Providers may also report the embed hosts' own counters. The plan is in [views.md](views.md). Remaining:

- What counts as a view: a fixed watch time (about 30 seconds), a share of the video, or both?
- Which anti-inflation methods the default provider uses, and how it publishes them.
- Should a viewer be able to opt in to signed views, for providers that weight views by account age or reputation?

## Video Post Schema

**Decided: the video post schema should be standardized as a BSIP** (Application category), so all Bitsocial clients render video posts consistently instead of a raw link list. **Decided 2026-11-11:** until then, `link` is the primary source and a `Mirrors:` list in the editable `content` adds more; the BSIP will propose an author-editable `comment.sources` field, not `gallery` or `links` (reasons in [video-sources.md](video-sources.md#the-post-format-now-and-in-the-bsip)). Remaining details for the BSIP draft:
- What metadata does a video post carry — thumbnail (image link or IPFS CID?), duration, resolution/variants per source, subtitles/captions?
- Should the schema distinguish source *types* (web embed, IPFS, WebTorrent) so clients can order fallbacks intelligently, or is a flat ordered list enough?

## Source Health and Trust

- Do clients verify that different sources contain the *same* video (e.g. a content hash the embeds should match), or is the owner trusted since it's their channel?
- How do clients report dead sources back to the owner without a central telemetry service? (Detection is decided: the client checks YouTube, Vimeo and PeerTube sources against the host's oEmbed or API before playing them.)
- Can viewers propose mirror sources for a video (owner-approved), so the community helps keep videos alive?

## Likes, Dislikes, and Rankings

**Decided: likes/dislikes are plain Bitsocial community votes** (owner's node tallies, seeded with the post). Pubsub voting is reserved for ranking channels in categories. Remaining:

- Does WeTube show dislike counts (YouTube removed them; WeTube plausibly shouldn't hide them)?
- What sybil resistance applies to video votes, given channels choose their own challenge configs?

## Subscriptions and Feeds

- Subscriptions are presumably local/account state (a list of channel addresses in the user's Bitsocial account), synced the way other Bitsocial clients sync account data — confirm.
- What does the default "subscriptions feed" aggregation look like purely peer-to-peer, and at what channel count does it need an RPC or indexer to stay fast?
- Notifications for new uploads: pubsub subscription per channel, polling, RPC push?

## Discovery Beyond Categories

**Decided 2026-11-11: categories are community lists (BSIP-15) ranked by pubsub voting (BSIP-18), reviewed by the developers; WeTube uses no BSIP-19 directories.** See [curation-and-discovery.md](curation-and-discovery.md#categories-community-lists-ranked-by-users).


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
- Verification/impersonation: with no global admin there's no verified badge — is `.bso` ownership plus category reputation enough?
