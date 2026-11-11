# View Counts

Views are one of the numbers people judge a video by, so WeTube needs them before it is distributed. They are also the one YouTube primitive with no peer-to-peer equivalent: a view is passive, nobody signs it, and a counter needs someone to keep it. This document is the plan.

## View Providers

WeTube counts views the way 5chan loads its home page stats and uploads media: through **providers**, services listed in a setting that viewers can reorder, turn off, or add to. Any operator can run one. The client ships with a default list, and no single counter is forced on anyone.

| | Stats providers (5chan) | View providers (WeTube) |
|---|---|---|
| What they serve | Popular threads and board stats | View counts per video |
| Default | `stats.bitsocial.net` | A Forge-run provider |
| Without any | The client loads boards over P2P | No view counts; everything else works |

### Counting

- After real playback, about 30 seconds or half of a short video, the client reports the video's post CID to each enabled provider.
- The report carries no account signature by default, so a view does not tie a viewer's watch history to their Bitsocial identity.
- Viewers can turn reporting off and still see counts.

### Filtering fake views

Each provider decides what counts, with per-IP limits, bot heuristics and its own anti-abuse methods. The number it returns is its estimate, as YouTube's is YouTube's own filtered estimate. Providers compete on how trustworthy their numbers are.

### Showing counts

- A batch endpoint returns counts for many CIDs at once, enough for a grid of videos.
- The client shows the first enabled provider's number and names the provider (for example in a tooltip).
- It never adds providers' counts together: one view reported to two providers would count twice.

### Counts from the embed hosts

A video's sources live on hosts that count views themselves. A provider can fetch those counters (YouTube's view count, PeerTube's `views`) and return them separately, so a card can read "1.2K on WeTube · 48K on YouTube". That is honest about where each number comes from and useful to creators who mirror their videos.

### Privacy

A provider learns which videos an IP address watches. Providers should keep totals only, never per-viewer logs, and say so. The setting lets viewers choose a provider they trust or none.

## Who Runs Providers

Bitsocial Forge runs the default provider as part of its WeTube index, which also serves search and related videos ([curation-and-discovery.md](curation-and-discovery.md#search-related-videos-and-feeds-come-from-providers)). Paid creator analytics built on it (watch time, retention, audience by country, all aggregated) are a Forge product. The provider API should become a BSIP so that other operators can run compatible providers and clients can list them.

## Until Then

Cards and the watch page show "? views". The count is a placeholder, not a zero.
