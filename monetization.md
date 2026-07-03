# Monetization

Monetization is the most important part of WeTube. Creators leave a platform for a better one only if they can earn on it — and "credible YouTube alternative" means credible income, not just credible hosting. WeTube's economic layer is **Bitsocial Chain** (see `bitsocialnet/bitsocial-chain` and https://bitsocial.net/chain), the Ethereum L2 that gives Bitsocial apps unstoppable financial structures without putting any social content on-chain.

## Design Principles

- **No bank or platform can seize creator funds.** Payments settle on Bitsocial Chain to keys the creator holds. There is no payout account to freeze, no demonetization switch.
- **Content stays off-chain.** The chain carries names, payments, and economic structures only. Videos, comments, and votes remain peer-to-peer Bitsocial content.
- **Every party monetizes what they actually provide.** Creators monetize their channels, RPCs monetize their infrastructure, directories and clients monetize their curation. Nobody takes a cut of someone else's layer by force — cuts are terms you agree to and can exit.

## Creator Revenue Streams

### Tipping

The baseline primitive: viewers send money directly to the channel or to a specific video. On-chain, permissionless, no middleman able to block it or take a cut the creator didn't agree to.

### Revenue Sharing

Bitsocial Chain structures for splitting income between parties — for example between a creator and collaborators, or between a creator and the RPC or client that brought the paying viewer. Revenue sharing is what lets the ecosystem fund itself without a central platform setting the split unilaterally: the split is a term of the deal, chosen by the channel owner.

### Owner-Run Ads

A channel is like the owner's own site, so **the channel owner can run ads by themselves, for their specific channel** — sponsor segments, display placements in their channel's pages, direct deals with advertisers — with no adpocalypse risk and no platform taking the majority cut. No RPC or client is needed for this; it works even for a fully self-hosted channel.

### Future Structures

Bitsocial Chain is designed to grow additional primitives over time — memberships and subscriptions, awards/superchat-style payments, shared liquidity across Bitsocial apps. These are open design work (see [open-questions.md](open-questions.md)); tipping and revenue sharing are the foundation.

## Infrastructure Revenue: RPCs

Public RPCs like Forge RPC can monetize the convenience they provide:

- **Ads** shown to users of their free tier, subsidizing free access to full nodes,
- **paid tiers** removing ads and adding premium features (analytics, backups, `.bso` registration, moderation tooling).

Because RPCs are non-custodial and competitive, their revenue has to be earned with service quality — users can always exit to a competing RPC or their own full node. An RPC that abuses its position loses its users, not the other way around.

## Why This Beats YouTube's Model

| | YouTube | WeTube |
|---|---|---|
| Who holds the money | Platform, until payout | Creator, on-chain, immediately |
| Demonetization | Unilateral, opaque, global | Impossible — no party controls another's revenue |
| Ad revenue split | Set by the platform (~45% cut) | Set by whoever runs the ads; owner-run ads = 100% |
| Payment rails | Banks; accounts can be frozen | Bitsocial Chain; funds can't be seized |
| Who can monetize | Channels the platform approves | Anyone with a channel |
