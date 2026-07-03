# Video Sources: Censorship-Resistant Video Without Hosting Video

This is WeTube's core design idea, and the reason a text-only protocol can power a video platform.

## The Problem

Video files are large. A peer-to-peer text protocol like Bitsocial is deliberately lightweight — community nodes run on Raspberry Pi class hardware. Hosting and serving video at YouTube scale from community nodes is not realistic, and it doesn't need to be.

The thing that actually gets censored on YouTube is not bytes on a CDN — it's the *page*: the video's identity, its comments, its likes, its place in a channel. Kill the page and the video is gone even if copies of the file exist everywhere.

## The Solution: The Post Is a List of Sources

A WeTube video post does not contain a video file. It contains **a list of links that embed the video** — the same video, mirrored across multiple independent hosts. For example:

- embeds on conventional video hosts and mirrors,
- an IPFS CID, for users who accept slower loading in exchange for full decentralization,
- a WebTorrent magnet link, streamed peer-to-peer in the browser.

The client tries sources in order (or by user preference) and plays the first one that works.

**Bitsocial doesn't need to host the video file. It just needs to host the list of sources — and the list is what is censorship-resistant.**

## Why This Works

- **Redundancy beats takedowns.** If a video has 10+ embed sources, censoring it means winning takedowns against 10+ independent hosts in different jurisdictions, plus IPFS, plus WebTorrent. Any single host banning the file is a non-event: the client falls through to the next source.
- **The list is updatable, the post is permanent.** The channel owner can update the source list at any time — replace dead links, add new mirrors — without the post changing identity. The video keeps its comments, its likes and dislikes, its position in the channel. On YouTube, a re-upload starts from zero; on WeTube, the post survives and only its sources rotate underneath it.
- **The post outlives the owner's node.** The post, its source list, its votes, and its comments are ordinary Bitsocial content: users who load them seed them back to the network. There is no single place where the "page" lives, so there is no single place to take it down from.

## Degrees of Censorship Resistance

Not every video needs maximum resistance, and the model lets each video sit where its owner wants on the spectrum:

1. **Convenient:** a couple of fast web embeds. Loads instantly; resistant to any *one* host, not to a coordinated purge.
2. **Redundant:** many embeds across independent hosts. Practically immune to ordinary takedowns.
3. **Fully decentralized:** IPFS and/or WebTorrent sources, seeded by viewers. No host to pressure at all, at the cost of loading speed.

A well-sourced video mixes all three: fast embeds first, peer-to-peer sources as the fallback of last resort.

## Client Behavior (Sketch)

- Try sources in the order listed by the owner, skipping ones that fail to load; remember dead sources locally to avoid retrying them every view.
- Let the user pin a preference ("always prefer IPFS", "never load host X").
- Surface source health to the channel owner so they know when to update the list.
- Render everything else — title, description, thumbnail, duration, comments, votes — from Bitsocial data, so the page works even while sources are loading or dead.

## The Schema Will Be a BSIP

The video post shape (how sources, thumbnails, and video metadata are encoded in a community post) should be standardized as a **BSIP** (Application category, `bitsocialnet/BSIPs`), so every Bitsocial client — not just WeTube — renders video posts consistently instead of falling back to a raw link list. The encoding details are still open — see [open-questions.md](open-questions.md).

## A Side Effect: Embeds Are Where View Counts Live

Pure peer-to-peer playback can't count views — there is no server to count them, and viewers don't broadcast signed "I watched this" events. But most embed hosts already expose per-video view counters, so a video's source list doubles as the input to **view aggregation**: an aggregator (plausibly run by RPCs/indexers) sums the counters across a video's sources to estimate total views. This is the least-solved part of WeTube and has its own section in [open-questions.md](open-questions.md).
