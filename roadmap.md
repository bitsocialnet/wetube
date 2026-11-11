# Roadmap

What is built, what is next, and where each decision is written down. Update this file in the same change that finishes or reshapes an item.

## Built

- [x] Read-only web client: home grid, channel pages at `/@<address>`, watch page with comments, likes and more videos from the channel (2026-11-10).
- [x] Multiple sources per video: `link` plus a `Mirrors:` list in `content`, parsed in `src/lib/video-sources.ts` ([video-sources.md](video-sources.md)).
- [x] Real fallback: a file falls through on its load error; YouTube, Vimeo and PeerTube sources are checked against the host's oEmbed or API and skipped when gone, with a notice naming the host that failed (2026-11-11).
- [x] Open Movies demo channel: the Blender open movies with mirrors on YouTube, Vimeo, Blender's PeerTube, the Internet Archive and IPFS. Its Sintel post's main link is a YouTube video that does not exist, recreating Sintel's 2014 takedown, and the owner reordered its mirrors with an edit after posting. Only the owner can post ([how-it-works.md](how-it-works.md#the-channel-configuration)).
- [x] YouTube-style shell: compact sidebar with HackerTube's sections, Filters (upload date, source, mirrored, sort) and chips on the home page, search, account menu with theme, feedback, source and version. Sections not built yet explain what they will do.
- [x] Shared agent workflow of the Bitsocial clients (`AGENTS.md`, skills, playbooks, `agent:verify`).
- [x] Watch page laid out like YouTube's: channel row with Subscribe, like/dislike, Share (copies the link) and Watch later, a description that expands to the video's sources and when the owner last changed them, and a related column with "All" and "From <channel>" chips (2026-11-11).
- [x] Header and sidebar like YouTube's: no sidebar on the watch page (the menu button opens it as a drawer), like/dislike and Watch later buttons, comment sort (top, newest) and a comment box, a notification bell fed by `useNotifications()`, and a sign-in section and footer in the full sidebar (2026-11-11). Watch later works, kept in the browser; liking, commenting and signing in open a sign-in prompt until sign-in exists.

## Next

- [ ] **View counts.** View providers as planned in [views.md](views.md): a settings list, reporting after real playback, a batch count endpoint, a Forge-run default, and the provider API as a BSIP. Cards show "? views" until then. Required before distributing the app.
- [ ] **Video post BSIP.** Standardize sources, thumbnail, duration and captions, proposing an author-editable `comment.sources` ([video-sources.md](video-sources.md#the-post-format-now-and-in-the-bsip)). Then a pkc-js issue for the field; the pkc-js maintainers decide.
- [ ] **Categories.** One community list (BSIP-15) per category for membership, fetched at runtime from `bitsocialnet/lists` so updates need no release; channels ranked live by pubsub voting (BSIP-18); votes for unlisted channels count as nominations ([curation-and-discovery.md](curation-and-discovery.md#categories-community-lists-ranked-by-users)). The chips become categories.
- [ ] **Channel creation from WeTube.** Through Forge RPC, on by default, with the WeTube channel configuration as Forge's default for WeTube channels. Then uploads: publishing a video post with its mirrors, and editing mirrors later.
- [ ] **Sign-in and interactions.** Sign in with a Bitsocial profile, an author community ([BSIP-14](https://bsips.bitsocial.net/bsip-14)) hosted through Forge RPC by default. Then liking, commenting and subscribing publish for real, with a challenge prompt for the channel's anti-spam (the spam blocker shows an iframe), and the sidebar's sign-in section becomes the subscriptions list.
- [ ] **PeerTube playback.** Blender's PeerTube embed fails to load its preview image at some player widths ("Invalid width to find appropriate image"). Play PeerTube videos from the files its API lists, in WeTube's own player, instead of the embed.
- [ ] **IPFS playback.** `ipfs://` sources go through a public gateway, which cannot find content that a Bitsocial node provides only to Bitsocial's HTTP routers. Fetch them in the browser through pkc-js's libp2p node, or through a gateway that uses those routers.
- [ ] **Sidebar sections.** Subscriptions, liked videos, history and playlists (account data), settings (view providers, IPFS gateway, preferred hosts, RPC or own node). Watch later is built but kept in the browser; it moves to the account with sign-in.
- [ ] **WeTube index (Forge).** A bitsocial-indexer instance, like 5archive and Seedit Archive, crawling the channels in the category lists: the search bar, related-video candidates, view counts, and server-rendered video pages for search engines. Not part of Forge RPC ([curation-and-discovery.md](curation-and-discovery.md#search-related-videos-and-feeds-come-from-providers)).
- [ ] **Provider settings.** Search, recommendation and view providers as separate lists with on/off and custom entries; a Forge "For you" feed as the default recommendation provider, each item showing why it was recommended.
- [ ] **Seeding.** Add WeTube channels to the Bitsocial seeder's list so their posts stay available when the owner's node is offline.
- [ ] **Durations** on cards and the duration filter, once video posts carry a duration.

## Later

- [ ] A second recommendation provider and a local algorithm, to test switching ([bitsocial-algorithms](https://github.com/bitsocialnet/bitsocial-algorithms)).
- [ ] Monetization on Bitsocial Chain: tips, revenue sharing, memberships ([monetization.md](monetization.md)).
- [ ] Live streams as posts whose sources point at live embeds ([open-questions.md](open-questions.md#live-streaming)).
- [ ] Mobile apps.
