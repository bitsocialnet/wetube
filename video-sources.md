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

## The Post Format: Now and in the BSIP

**Now (decided 2026-11-11):** a video is an ordinary post. `title` is the video title, `link` is the primary source, and `content` is the description followed by an optional `Mirrors:` line with one URL per line. Every Bitsocial client already renders it: 5chan and Seedit show the link as a video and the mirrors as plain links. The client parses it in [src/lib/video-sources.ts](src/lib/video-sources.ts).

A post's `link` cannot change after publishing, but its author can edit `content` (BSIP-7), so the mirror list is the part that rotates: the owner adds a mirror, drops a dead one, or reorders them, and the post keeps its CID, comments and likes. The Open Movies demo channel did this to its Sintel post on 2026-11-11.

**Later: a video post BSIP with an editable `comment.sources`.** The BSIP (Application category, `bitsocialnet/BSIPs`) will standardize sources, thumbnails and video metadata so every client renders video posts the same way instead of parsing text. It will propose a structured `comment.sources` field that authors can edit like `content`, checked only as `https` or `ipfs://` URLs. Adding a field to comments and comment edits is a pkc-js change, so it goes to a pkc-js issue once the demo shows the need; whether to add it is the pkc-js maintainers' call.

Why not the fields pkc-js already has:

- **`comment.gallery`** (pkcprotocol/pkc-js#436) holds media files only: the community rejects any item whose URL path lacks a media file extension, so YouTube, Vimeo, PeerTube and Odysee pages fail, and `ipfs://` fails because items must be `https`. Galleries are also off unless a community enables them, and they cannot be edited. A gallery is several different media; sources are one video in several places.
- **`comment.links`**, proposed in the same issue, was a replacement for `link`, could not be edited either, and was dropped in favor of `link` plus `gallery`.

## Source Types and Availability

The client plays YouTube and Invidious, Vimeo, PeerTube (any instance, recognized by its URL shapes), Odysee, Bitchute and Streamable embeds, direct video files, and `ipfs://` links. A file reports its own load error. Embeds show their errors inside the iframe without telling the page, so before playing a YouTube, Vimeo or PeerTube source the client asks the host's oEmbed or API whether the video still exists; a 404 skips it. A check that cannot answer (network error, rate limit) lets the source play.

Known gaps are tracked in [roadmap.md](roadmap.md): `ipfs://` sources go through a public gateway, which cannot find content provided only to Bitsocial's routers, and Blender's PeerTube embed fails at some player widths.

## View Counts

Peer-to-peer playback cannot count views, and viewers do not broadcast signed "I watched this" events. WeTube counts them through view providers that viewers can choose or turn off, and providers can also report the counters of a video's embed hosts. See [views.md](views.md).
