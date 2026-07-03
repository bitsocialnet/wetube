# WeTube

**WeTube is a future YouTube alternative built on Bitsocial.** Every channel is a Bitsocial community owned and hosted by its creator, videos are censorship-resistant through redundant embed sources, curation happens through decentralized voting, and monetization runs on Bitsocial Chain — with no giant corporation that can ban channels, no global admins, and no global rules.

WeTube is part of [Phase 5 of the Bitsocial master plan](https://bitsocial.net/#master-plan-phase-5): decentralize all social media. Phase 5 explicitly names "creator video and a credible YouTube alternative" as one of the formats Bitsocial apps will rival. WeTube is that app.

> **Status: vision stage.** This repository reserves the name — development targets Phase 5. These documents describe the product vision and architecture; nothing here is built yet. WeTube depends on infrastructure from earlier master plan phases (public RPCs, Bitsocial Chain, pubsub voting).

## The Thesis

YouTube is a single company that hosts every video, ranks every video, monetizes every video, and can delete any channel at will. Creators build audiences of millions on infrastructure they do not control and can lose overnight.

WeTube splits YouTube into its parts and decentralizes each one:

| YouTube function | WeTube equivalent |
|---|---|
| Channel | A Bitsocial community, owned by a cryptographic key the creator holds |
| Channel hosting | The creator's own full node, or a non-custodial public RPC (e.g. Forge RPC) |
| Video hosting | A list of redundant embed sources per video (web embeds, IPFS, WebTorrent) |
| Comments, likes, dislikes | Bitsocial replies and votes, seeded by users peer-to-peer |
| View counts | Open problem — likely aggregated from each embed source's counter by competing RPC/indexer aggregators |
| Homepage / trending | Client directories curated by decentralized pubsub voting |
| Recommendation algorithm | Provided by competing public RPCs; users can switch it or turn it off |
| Monetization | Bitsocial Chain: tipping, revenue sharing; ads run by RPCs or by channel owners themselves |
| Terms of service, global bans | None. Each channel sets its own rules; no one can set rules for all channels |

The key insight: **Bitsocial does not need to host video files to make video censorship-resistant.** It only needs to host the *list of sources* for each video — and that list is text, which is exactly what the Bitsocial protocol already makes censorship-resistant. See [video-sources.md](video-sources.md).

## What Makes a Channel Unbannable

A WeTube channel is a Bitsocial community: addressed by a public key, hosted by the owner's node, and moderated only by the owner. There is no registrar, platform, or admin above the channel owner. The owner can:

- run their own full node for maximum censorship resistance, or use a public RPC like Forge RPC (non-custodial — they can exit to self-hosting at any time),
- post videos that no one else can take down,
- moderate comments under their own videos, under their own rules,
- monetize however they want — their channel is effectively their own site.

Viewers connect to channels purely peer-to-peer, exactly like 5chan users connect to boards. And because channels are ordinary Bitsocial communities, they are browsable from other Bitsocial clients too (Seedit, 5chan, the flagship app) — WeTube just renders them as a video experience.

## Documents

- [how-it-works.md](how-it-works.md) — architecture: channels as communities, nodes, RPCs, the posting model
- [video-sources.md](video-sources.md) — the embed source list: how videos stay up without Bitsocial hosting them
- [curation-and-discovery.md](curation-and-discovery.md) — directories, pubsub voting, discovery without a global algorithm
- [monetization.md](monetization.md) — tipping, revenue sharing, and ads via Bitsocial Chain and RPCs
- [open-questions.md](open-questions.md) — design decisions not yet made

## License

[GPL-3.0-or-later](LICENSE)

## Ecosystem Context

- Bitsocial protocol docs: https://bitsocial.net
- Pubsub voting (curation layer): `bitsocialnet/pubsub-voting`
- Bitsocial Chain (economic layer): `bitsocialnet/bitsocial-chain` and https://bitsocial.net/chain
- Sibling clients: 5chan (imageboard), Seedit (forum)
