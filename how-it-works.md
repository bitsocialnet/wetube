# How WeTube Works

WeTube is a Bitsocial client, like 5chan or Seedit. It does not introduce a new protocol. It applies the existing Bitsocial primitives — communities, peer-to-peer pubsub, challenges, votes, replies — to the shape of a video platform.

## Channels Are Communities

Every WeTube channel is a Bitsocial community:

- **Addressed by a public key**, not a domain name. No registrar or DNS provider can seize it. A channel can additionally register a human-readable `.bso` name (e.g. `alice.bso`) on Bitsocial Chain.
- **Hosted by the channel owner.** The owner runs a full node (a lightweight community node — Raspberry Pi class, not a blockchain node) or uses a public RPC.
- **Moderated by the channel owner alone.** The owner sets the challenge config for comments, deletes comments under their own videos, and answers to no global admin, because there isn't one.

Because channels are ordinary communities, they carry across clients. A WeTube channel can be opened in Seedit as a forum, or listed in another app's directory. The community is the network effect; WeTube is one lens on it.

## The Posting Model: Only the Owner Posts

This is the main difference from clients like 5chan, where anyone passing the challenge can post to a board. In a WeTube channel:

- **Only the channel owner can create posts.** A post is a video (see [video-sources.md](video-sources.md) for what a video post contains).
- **Anyone can comment** underneath a video, subject to the channel's anti-spam challenge, exactly like replying in any Bitsocial community.
- **Anyone can like or dislike** videos and comments using Bitsocial's native community votes — tallied by the owner's node and seeded with the post. (Pubsub voting is a separate system, used only for directory curation.)

This maps 1:1 to YouTube's structure — channel uploads, viewer comments, likes and dislikes — using primitives the protocol already has. Enforcement is simply community configuration: the owner's node rejects top-level posts from anyone but the owner.

## Connecting: Pure Peer-to-Peer, With an RPC Escape Hatch

Viewers connect to channels the same way 5chan users connect to boards:

1. The client resolves the channel address (public key or `.bso` name) to provider peers via HTTP routers.
2. It fetches the channel's metadata and latest posts from peers by content hash.
3. It subscribes to the channel's pubsub topics for live updates, and publishes comments and votes over pubsub.

No server sits between the viewer and the channel. For users who don't want to run peer-to-peer connections directly (mobile, low-power devices), **public RPCs like Forge RPC provide full node access in a non-custodial way**: the RPC does the peer-to-peer work, but the user keeps their keys and can exit to their own full node — or a competing RPC — at any time. Convenience is rented; ownership is not surrendered.

## Seeding: Users Keep Channels Alive

A video post, its embed source list, its likes and dislikes, and its comments are all Bitsocial content — text and metadata, addressed by hash. Users who load a channel can seed it back to the network, like BitTorrent. Even if the channel owner's node goes offline, the channel's existing content remains available as long as peers seed it. A video post doesn't get "taken down"; at worst it stops being updated.

## What the Owner Controls vs. What They Don't

| Owner controls | Owner does not control |
|---|---|
| What videos are posted | Whether users seed and re-share existing content |
| The embed source list of each video (updatable any time) | Votes already cast by users |
| Comment moderation and challenge config in their channel | Other channels, or any global rule |
| Their channel's monetization (see [monetization.md](monetization.md)) | Directory rankings (decided by voting — see [curation-and-discovery.md](curation-and-discovery.md)) |

There are no global admins and no global rules. Each channel is like the owner's own site: they can do whatever they want with it — and nothing to anyone else's.
