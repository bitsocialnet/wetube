# Curation and Discovery

No global admins and no global rules does not mean no curation. It means curation is decentralized, competitive, and replaceable — the same model 5chan uses for its default board directories.

## The Problem

YouTube's homepage, search, and recommendations are one company's opinion, applied to everyone, optimized for that company's revenue. Removing the company can't mean removing discovery: a video app where you can only find channels by pasting public keys is not a YouTube alternative.

## Directories via Pubsub Voting

WeTube's default channel directories — the "homepage" categories a fresh user sees — are curated by **decentralized pubsub voting** (`bitsocialnet/pubsub-voting`), the same system that powers 5chan's competitive default directories:

- Voting is trustless and leaderless: signed votes propagate over libp2p pubsub as a merge-only CRDT, so no server tallies results and no peer can subtract votes an honest peer holds.
- Votes are off-chain and gasless; sybil resistance is anchored to token-gated eligibility (as with the 5chan Pass), configurable per directory.
- Channels compete for directory slots; the highest-voted channels are what the default client shows.

The result: WeTube's "front page" is decided by its users, not by WeTube. And because voting criteria are encoded in the topic itself, anyone can fork the criteria and run a competing directory — the default is not a prison.

## Recommendation Algorithms Come From Public RPCs

YouTube's recommendation algorithm is its real power: it decides what billions of people watch, and no one outside the company can inspect or replace it. WeTube inverts this, following the same model as the flagship Bitsocial app:

- **Public RPCs provide optional feed/recommendation algorithms** — homepage feeds, "up next" suggestions, trending lists. This is a Phase 5 theme of the master plan: multiple public RPCs competing with each other on optional feed algorithms.
- **Users can change the algorithm.** Switching recommendation algorithms is a settings choice, like switching RPCs — pick a different provider's algorithm, or turn recommendations off entirely and browse only subscriptions and directories.
- **Algorithms compete on merit.** An RPC whose algorithm buries content users want loses those users to a competing RPC. There is no algorithm monopoly because there is no distribution monopoly.
- **No RPC required.** Without an RPC, the client still works: subscriptions, directories, and direct addresses are all peer-to-peer. The algorithm is a layer users opt into, not a gate they pass through.

## Layers of Discovery

1. **Default directories** — pubsub-voted channel listings by category, shipped as the client default.
2. **RPC feed algorithms** — switchable recommendation feeds from competing public RPCs, as above.
3. **Cross-client discovery** — WeTube channels are ordinary Bitsocial communities, so they surface in other Bitsocial apps, directories, and search engines (e.g. crawler-based indexers), and vice versa.
4. **Direct addresses** — a channel's public key or `.bso` name works forever, independent of every directory. Deplatforming from a directory never unhosts a channel; it only affects one list's opinion of it.

## Moderation Without Global Admins

- **In a channel:** the channel owner is the only moderator. Their channel, their rules.
- **Across channels:** there is nothing to moderate globally, only to *curate*. Directories choose what to list; clients choose which directories to ship as defaults; users choose which clients and directories to use. Objectionable channels can lose every listing and still exist — reachable only by direct address, hosted only by their owner.

This is the same separation Bitsocial applies everywhere: hosting is uncensorable, visibility is earned.
