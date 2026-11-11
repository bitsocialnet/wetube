# Curation and Discovery

No global admins and no global rules does not mean no curation. It means curation is decentralized, competitive, and replaceable — the same model 5chan uses for its default board directories.

## The Problem

YouTube's homepage, search, and recommendations are one company's opinion, applied to everyone, optimized for that company's revenue. Removing the company can't mean removing discovery: a video app where you can only find channels by pasting public keys is not a YouTube alternative.

## Categories: Community Lists Ranked by Users

The home page shows popular channels by category, in the chip bar at the top (Music, Science, Funny…). A category is not a [BSIP-19](https://bsips.bitsocial.net/bsip-19) directory: a directory resolves to one winning community, the way 5chan's `/biz/` opens one board, while a category shows videos from many channels at once. WeTube therefore uses no directories.

**Each category is a community list** ([BSIP-15](https://bsips.bitsocial.net/bsip-15)): a signed, immutable record, addressed by its CID, that lists channels with metadata (title, description, tags, languages, SFW). Decided 2026-11-11:

- **Votes rank the channels, live.** Each category has a pubsub voting contest ([BSIP-18](https://bsips.bitsocial.net/bsip-18), `bitsocialnet/pubsub-voting`): eligible holders vote for channels, peers merge the signed ballots, and every client computes the same tally. The client orders a category's channels by the current tally, so the ranking changes as votes come in, with no new list and no release. No server tallies and no peer can drop votes an honest peer holds.
- **A reviewed list decides who is in.** The community list is the category's membership: the channels the ranking is allowed to show. A list cannot change after publishing, so adding or removing a channel publishes a new list with a new CID. The client learns the current CID at runtime from the `wetube` lists in `bitsocialnet/lists`, the way 5chan and Seedit refetch their directory files about once an hour, and ships a copy for when that fetch fails. Updating a category is a reviewed change to that file, never an app release. The developers can veto a channel (illegal content, spam) or add one by hand (a launch partner).
- **Nominations come from votes.** A vote for a channel that is not in the list counts as a nomination. Channels with enough nominations are added in the next reviewed update.
- **Defaults are not a prison.** Anyone can publish competing lists or run a competing contest, and a viewer can switch to another curator's lists in the settings.

Why membership is reviewed instead of decided by votes alone: categories are what every new viewer sees on the home page. If votes alone decided membership, whoever can farm eligible votes could put anything, illegal content included, in front of every client, and that is the risk BSIP-15 removes by making lists immutable. A runtime pointer to the current list keeps that review while dropping releases: the pointer is the WeTube team's own lists file, the same trust a viewer already gives the app's code. BSIP-15's rule that clients never follow one list to a newer one on their own is about a list record pointing to its successor, which this does not do.

Still open: whether a nomination past a threshold should join automatically after a waiting period unless vetoed, who is eligible to vote (a pass like 5chan's, or token holders), and how many channels a category shows.

## Search, Related Videos and Feeds Come From Providers

YouTube's recommendation algorithm is its real power: it decides what billions of people watch, and no one outside the company can inspect or replace it. WeTube treats search and recommendations as replaceable services, following the Bitsocial-wide decision in [bitsocial-algorithms](https://github.com/bitsocialnet/bitsocial-algorithms/blob/master/DECISION.md): providers discover and rank; they do not own identities, posts, or client policy. Planned 2026-11-11:

- **One setting per capability, each a list of providers**, like [view providers](views.md): a **search provider** for the search bar, and a **recommendation provider** for the home feed ("For you"), the related column next to the player and "up next". Viewers can pick another provider or algorithm, add their own, or turn recommendations off.
- **Recommendations explain themselves.** Each one carries its reason ("Popular in Music", "From a channel you watched") and the algorithm's name and version.
- **No watch history on servers by default.** The client keeps its history and sends only what one request needs; history kept by a provider is opt-in, with reset and export.
- **The provider-free floor.** Without any provider WeTube still works: the home page shows the categories ranked by votes, the related column shows the channel's and the categories' videos (what it does today), and search matches the videos already loaded. A provider outage only weakens those surfaces.

**What Forge runs.** A WeTube index: an instance of [bitsocial-indexer](https://github.com/bitsocialnet/bitsocial-indexer), like 5archive and Seedit Archive, that crawls the channels in WeTube's category lists. It serves the search bar, candidates for related videos, the view counts, and server-rendered video pages so search engines find WeTube videos. A Forge recommendation provider ranks on top of it as the default.

It is **not part of Forge RPC**. Forge RPC hosts nodes, the channels and profiles people own; a recommendation provider only reads public data. Switching algorithms must never move someone's node, which is why bitsocial-algorithms rejects coupling the two. Forge can run both and the client can offer them as one preset, but they stay separate settings.

## Layers of Discovery

1. **Categories** — community lists (BSIP-15) ranked by users' pubsub votes (BSIP-18) and reviewed by the developers, shipped as the client default.
2. **Provider feeds** — search, related videos and recommendation feeds from switchable providers, as above.
3. **Cross-client discovery** — WeTube channels are ordinary Bitsocial communities, so they surface in other Bitsocial apps, directories, and search engines (e.g. crawler-based indexers), and vice versa.
4. **Direct addresses** — a channel's public key or `.bso` name works forever, independent of every list. Being dropped from a category never unhosts a channel; it only changes one list's opinion of it.

## Moderation Without Global Admins

- **In a channel:** the channel owner is the only moderator. Their channel, their rules.
- **Across channels:** there is nothing to moderate globally, only to *curate*. Lists choose which channels to include; clients choose which lists to ship as defaults; users choose which clients and lists to use. Objectionable channels can lose every listing and still exist — reachable only by direct address, hosted only by their owner.

This is the same separation Bitsocial applies everywhere: hosting is uncensorable, visibility is earned.
