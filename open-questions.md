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

- **Confirmed 2026-11-11:** a subscription is a channel address in the account's `subscriptions` list (`useSubscribe` in bitsocial-react-hooks), kept by the browser's Bitsocial account; subscribing publishes nothing, so it works before sign-in.
- The bell next to Subscribed (notify me of this channel's new posts) is an on/off per channel, kept in the browser for now. It belongs in the account next to `subscriptions`, which is a bitsocial-react-hooks change.
- What does the default "subscriptions feed" aggregation look like purely peer-to-peer, and at what channel count does it need an RPC or indexer to stay fast?
- Notifications for new uploads: pubsub subscription per channel, polling, RPC push?

## Channel Posts and Playlists

**Decided 2026-11-11, for now:** a channel post with a playable source is a video and any other post is a feed post, shown in the Posts tab ([video-sources.md](video-sources.md#videos-and-feed-posts)). Remaining:

- Should the video post BSIP mark videos explicitly, so that a post is a video when it carries `comment.sources`, and a feed post can share a video link without becoming one? Existing posts with only a playable `link` would need to stay videos.
- The WeTube channel configuration sets `requirePostLink`, which rejects text-only posts. Drop it so owners can post text, as on YouTube, or keep it and allow only image and link posts?
- Channel playlists: a post that lists video CIDs (a third kind of post), metadata the owner edits on the community, or something else? The Playlists tab is empty until this is decided.
- Subscriber counts: Bitsocial has no count of a channel's subscribers, since subscribing is local. Does one come from the WeTube index, from opt-in pubsub announcements, or not at all? The channel page shows "? subscribers".
- Video counts: the channel page counts videos only when the community's preloaded page holds every post. Larger channels need a count from the index, or a per-kind count in community stats once videos are marked explicitly.

## Discovery Beyond Categories

**Decided 2026-11-11: categories are community lists (BSIP-15) for reviewed membership, fetched at runtime, with channels ranked live by pubsub voting (BSIP-18); WeTube uses no BSIP-19 directories.** See [curation-and-discovery.md](curation-and-discovery.md#categories-community-lists-ranked-by-users).


**Decided: search and recommendations come from switchable providers, separate from the node RPC** (bitsocial-algorithms' decision), with a Forge-run WeTube index as the default; viewers can switch or turn them off — see [curation-and-discovery.md](curation-and-discovery.md#search-related-videos-and-feeds-come-from-providers). Remaining:

- Naming and public face of the index: a WeTube Archive site like 5archive, or an API only?
- Which signals the default algorithm uses, given that view counts and watch time come from opt-in providers.

## Monetization Details

- Memberships/subscriptions on Bitsocial Chain: gated content (members-only videos via token-gated challenge?), badges, recurring payments?
- Superchat-style paid comments during premieres/live?
- Standard revenue-sharing splits between creator ↔ client ↔ RPC when an RPC-served view generates ad revenue — protocol convention or pure bilateral deals?
- Privacy: tipping links wallet history to social identity; Bitsocial Chain's design notes call for room for privacy systems (stealth addresses, shielded pools). What does WeTube default to?

## Live Streaming

- Undecided, but the lean is: **live streams would be embedded the same way as videos, if possible** — a "live" post whose source list points at live embeds (owner's own RTMP/HLS endpoints, third-party live hosts, WebRTC/peer-to-peer experiments), then flips to VOD mirror sources after the stream ends. Whether that's feasible in v1, and whether live chat maps onto community comments over pubsub, needs investigation.

## Naming and Branding

- Channel identity: encourage `.bso` names (`alice.bso`) as the canonical channel handle from day one?
- Verification/impersonation: **Proposed 2026-11-18:** `.bso` ownership is not enough. Channels prove outside identities (YouTube, domains, X) by cross-linking, verifier providers check the proofs, and visibility and the tip button follow verification ([curation-and-discovery.md](curation-and-discovery.md#channel-identity-and-impersonation)). Remaining:
  - The proof format: the bare public key in the YouTube description, or a signed statement naming both the channel and the outside account? Which outside identities does the default verifier support first?
  - How verifiers publish their results (a BSIP, so every Bitsocial client shows the same checks?), and how often they recheck, since a creator can remove the key later.
  - How the client marks an unverified channel whose name or avatar copies a verified one, and whether default search and feeds leave such copies out instead of only ranking them lower.
  - Where "claim your channel" imports run (Forge, the creator's own node), how they keep up with new YouTube uploads, and whether they also mirror the files elsewhere so the videos survive a YouTube ban.
  - Whether providers detect reuploads by their content, which overlaps with the content-hash question in [Source Health and Trust](#source-health-and-trust).
