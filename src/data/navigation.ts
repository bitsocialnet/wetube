// The sidebar's sections after Home, modeled on hackertube.org. None is built yet: each route shows what it
// will do. `label` is the full name in the expanded sidebar, `shortLabel` fits the compact one.
export interface PlannedPage {
  path: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const PLANNED_PAGES: PlannedPage[] = [
  {
    path: '/feed/subscriptions',
    label: 'Subscriptions',
    shortLabel: 'Subscriptions',
    description: 'New videos from the channels you subscribe to, loaded peer-to-peer. Your subscriptions live in your Bitsocial account, not on a server.',
  },
  { path: '/feed/liked', label: 'Liked videos', shortLabel: 'Liked', description: 'The videos you liked. A like is a Bitsocial vote signed by your account.' },
  { path: '/feed/history', label: 'History', shortLabel: 'History', description: 'The videos you watched, kept only in this browser.' },
  { path: '/feed/watch-later', label: 'Watch later', shortLabel: 'Later', description: 'Videos you saved to watch later, from any channel.' },
  {
    path: '/categories',
    label: 'Categories',
    shortLabel: 'Categories',
    description:
      'Popular channels by topic. Each category is a community list (BSIP-15) that WeTube users rank with pubsub voting (BSIP-18), with the defaults reviewed by the developers.',
  },
  { path: '/feed/playlists', label: 'Playlists', shortLabel: 'Playlists', description: 'Playlists you put together from any channel’s videos.' },
  {
    path: '/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    description: 'Your account, view providers, IPFS gateway, preferred video hosts, and whether channels are hosted through Forge RPC or your own node.',
  },
];
