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

## Channel Identity and Impersonation

**Proposed 2026-11-18, not decided.**

Anyone can create a channel with a creator's name and avatar and repost their videos, and nothing at the hosting layer can stop it. Piracy alone is not the problem WeTube has to solve; it already happens on torrent sites and Telegram. The problem is impersonation: a copy that viewers mistake for the creator, which takes the creator's subscribers and tips and makes creators see WeTube as the scam. A post that only embeds the creator's YouTube video does little harm, since it plays on YouTube with YouTube's ads and the views count for the creator. The harm comes from copies rehosted under a fake identity.

Reserving names does not fix it. A `.bso` name is not proof of identity: anyone can register `mrbeast.bso` first, and no one can reserve names for creators in a decentralized name system. Holding names or money in a creator's name without their consent also backfires: in 2018 Brave accepted tips on behalf of YouTubers who had not signed up, and creators publicly called it a scam.

- **Proofs by cross-linking.** A channel lists the outside identities it claims: a YouTube channel, an X account, a domain. A claim counts only when the other side claims the channel back with an explicit statement that names the channel's public key as its own, for example a line in the YouTube channel's description or a DNS TXT record on the domain. A plain link to another channel, such as a collaborator's, is not a claim. Only the real owner can write there, so nothing needs reserving. A claim names the outside account by its stable ID, such as a YouTube channel ID (`UC…`) or an X user ID; the handle in "✓ youtube.com/@X" is only a label the verifier refreshes, so a rename keeps the claim and whoever takes a freed handle cannot inherit it. Keybase proofs and Mastodon's verified links use the same pattern.
- **Verifiers are providers.** A static client cannot read youtube.com pages, because the browser blocks cross-origin requests, so a verifier service checks claims and signs the result. Verifiers are a provider list like search and views: Forge runs the default, and viewers can switch or add their own. The client shows "✓ youtube.com/@X" only for claims a verifier they trust has confirmed.
- **A confirmation outlives the outside account.** Verifiers sign each confirmation with its date. When the outside account itself is gone, for example because YouTube terminated it, the channel keeps the confirmation, shown as verified on that account until its last check. Otherwise a creator would lose the ✓ exactly when YouTube bans them and they bring their audience to WeTube. Only removing the statement from an account that still exists withdraws the claim. One account can claim several channels, each with its own statement.
- **Visibility follows verification.** Reviewed category membership gets one more veto reason: a channel that reposts another creator's channel as its own, so copies stay out of the categories. Search and recommendation providers rank the verified original above copies, which lowers a copy's reach in their results and feeds but does not remove it. Copies still exist at their address.
- **The tip button shows verification.** It shows each outside identity that at least one trusted verifier confirmed, such as "✓ youtube.com/@X". When every verifier that answered confirmed none, it says the channel's identity is unverified, whether or not the channel claims one, so a copy that lists no claim still reads as unverified. When no trusted verifier answers, it shows a signed result the client has stored with its date, such as "verified as of 2026-11-18", since only a verifier that rechecks can see a withdrawn claim; with no stored result it says verification is unavailable instead of calling the real creator unverified. This reduces tips sent to copies by mistake; it cannot stop a viewer who tips anyway ([monetization.md](monetization.md#tipping)).
- **Claim your channel.** A creator adds a claim statement for their channel to their YouTube description, and WeTube imports their uploads as video posts with the YouTube video as the first source. The verified original then outranks every copy. The import alone is not a backup: if YouTube removes a video whose only source is YouTube, the post keeps its comments and likes but stops playing until the owner adds a mirror on another host or IPFS ([video-sources.md](video-sources.md)). When pirates show there is demand for a creator, claiming becomes that creator's easiest response.

**Keep the defaults clean.** The app cannot be taken down, but its defaults can: the web origin, app store listings, the Forge index and the curated lists are run by identifiable people. If those defaults promote impersonating or pirated channels, that is where legal pressure lands. Hosting stays uncensorable for everyone. So far the proposal keeps copies out of the curated categories and ranks them below a verified original; whether default search and feeds leave copies out entirely is still open.

Still open: see [open-questions.md](open-questions.md#naming-and-branding).
