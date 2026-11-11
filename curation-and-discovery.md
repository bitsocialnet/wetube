# Curation and Discovery

No global admins and no global rules does not mean no curation. It means curation is decentralized, competitive, and replaceable — the same model 5chan uses for its default board directories.

## The Problem

YouTube's homepage, search, and recommendations are one company's opinion, applied to everyone, optimized for that company's revenue. Removing the company can't mean removing discovery: a video app where you can only find channels by pasting public keys is not a YouTube alternative.

## Categories: Community Lists Ranked by Users

The home page shows popular channels by category, in the chip bar at the top (Music, Science, Funny…). A category is not a [BSIP-19](https://bsips.bitsocial.net/bsip-19) directory: a directory resolves to one winning community, the way 5chan's `/biz/` opens one board, while a category shows videos from many channels at once. WeTube therefore uses no directories.

**Each category is a community list** ([BSIP-15](https://bsips.bitsocial.net/bsip-15)): a signed, immutable record, addressed by its CID, that lists channels with metadata (title, description, tags, languages, SFW). Decided 2026-11-11:

- **Users rank the channels.** Each category has a pubsub voting contest ([BSIP-18](https://bsips.bitsocial.net/bsip-18), `bitsocialnet/pubsub-voting`): eligible holders vote for channels, peers merge the signed ballots, and every client computes the same tally. No server tallies and no peer can drop votes an honest peer holds.
- **The developers review what ships.** A list cannot change after publishing, so a new ranking is a new list with a new CID, and clients never move to a newer list on their own. The WeTube developers publish the default lists from the tallies and review each revision before the client ships its CID: they can veto a channel (illegal content, spam) or add one by hand (a launch partner).
- **Defaults are not a prison.** Anyone can publish competing lists or run a competing contest, and a viewer can switch to another curator's lists in the settings.

Still open: how often a tally becomes a new revision, who is eligible to vote (a pass like 5chan's, or token holders), and how many channels a category shows.

## Recommendation Algorithms Come From Public RPCs

YouTube's recommendation algorithm is its real power: it decides what billions of people watch, and no one outside the company can inspect or replace it. WeTube inverts this, following the same model as the flagship Bitsocial app:

- **Public RPCs provide optional feed/recommendation algorithms** — homepage feeds, "up next" suggestions, trending lists. This is a Phase 5 theme of the master plan: multiple public RPCs competing with each other on optional feed algorithms.
- **Users can change the algorithm.** Switching recommendation algorithms is a settings choice, like switching RPCs — pick a different provider's algorithm, or turn recommendations off entirely and browse only subscriptions and categories.
- **Algorithms compete on merit.** An RPC whose algorithm buries content users want loses those users to a competing RPC. There is no algorithm monopoly because there is no distribution monopoly.
- **No RPC required.** Without an RPC, the client still works: subscriptions, categories, and direct addresses are all peer-to-peer. The algorithm is a layer users opt into, not a gate they pass through.

## Layers of Discovery

1. **Categories** — community lists (BSIP-15) ranked by users' pubsub votes (BSIP-18) and reviewed by the developers, shipped as the client default.
2. **RPC feed algorithms** — switchable recommendation feeds from competing public RPCs, as above.
3. **Cross-client discovery** — WeTube channels are ordinary Bitsocial communities, so they surface in other Bitsocial apps, directories, and search engines (e.g. crawler-based indexers), and vice versa.
4. **Direct addresses** — a channel's public key or `.bso` name works forever, independent of every list. Being dropped from a category never unhosts a channel; it only changes one list's opinion of it.

## Moderation Without Global Admins

- **In a channel:** the channel owner is the only moderator. Their channel, their rules.
- **Across channels:** there is nothing to moderate globally, only to *curate*. Lists choose which channels to include; clients choose which lists to ship as defaults; users choose which clients and lists to use. Objectionable channels can lose every listing and still exist — reachable only by direct address, hosted only by their owner.

This is the same separation Bitsocial applies everywhere: hosting is uncensorable, visibility is earned.
