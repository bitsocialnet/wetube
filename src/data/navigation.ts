// The sidebar's sections, modeled on hackertube.org. `label` is the full name in the expanded sidebar,
// `shortLabel` fits the compact one.
export interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
}

export const SIDEBAR_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', shortLabel: 'Home' },
  { path: '/feed/subscriptions', label: 'Subscriptions', shortLabel: 'Subscriptions' },
  { path: '/feed/liked', label: 'Liked videos', shortLabel: 'Liked' },
  { path: '/feed/history', label: 'History', shortLabel: 'History' },
  { path: '/feed/watch-later', label: 'Watch later', shortLabel: 'Later' },
  { path: '/categories', label: 'Categories', shortLabel: 'Categories' },
  { path: '/feed/playlists', label: 'Playlists', shortLabel: 'Playlists' },
  { path: '/settings', label: 'Settings', shortLabel: 'Settings' },
];

// Pages that are not built yet, each saying what it will do.
export interface PlannedPage {
  path: string;
  title: string;
  description: string;
}

export const PLANNED_PAGES: PlannedPage[] = [
  {
    path: '/feed/subscriptions',
    title: 'Subscriptions',
    description: 'New videos from the channels you subscribe to, loaded peer-to-peer. Your subscriptions live in your Bitsocial account, not on a server.',
  },
  { path: '/feed/liked', title: 'Liked videos', description: 'The videos you liked. A like is a Bitsocial vote signed by your account.' },
  { path: '/feed/history', title: 'History', description: 'The videos you watched, kept only in this browser.' },
  {
    path: '/categories',
    title: 'Categories',
    description:
      'Popular channels by topic. Each category is a community list (BSIP-15) whose channels WeTube users rank with pubsub voting (BSIP-18), updated without app releases.',
  },
  { path: '/feed/playlists', title: 'Playlists', description: 'Playlists you put together from any channel’s videos.' },
  {
    path: '/settings',
    title: 'Settings',
    description: 'Your account, view providers, IPFS gateway, preferred video hosts, and whether channels are hosted through Forge RPC or your own node.',
  },
  {
    path: '/signin',
    title: 'Sign in',
    description:
      'Your WeTube account will be a Bitsocial profile (BSIP-14) hosted free through Forge RPC, so you can like videos, comment, subscribe and upload from any device, and move it to your own node whenever you want.',
  },
];

export const REPOSITORY_URL = 'https://github.com/bitsocialnet/wetube';
