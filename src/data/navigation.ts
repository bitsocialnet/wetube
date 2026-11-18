// The sidebar's sections, modeled on hackertube.org; components/sidebar gives each its icon and labels.
export const SIDEBAR_PATHS = ['/', '/feed/subscriptions', '/feed/liked', '/feed/history', '/feed/watch-later', '/categories', '/feed/playlists', '/settings'] as const;
export type SidebarPath = (typeof SIDEBAR_PATHS)[number];

// Pages that are not built yet, from the sidebar, sign-in and the Create menu; views/planned says what each will do.
export const PLANNED_PAGE_PATHS = [
  '/feed/subscriptions',
  '/feed/liked',
  '/feed/history',
  '/categories',
  '/feed/playlists',
  '/settings',
  '/signin',
  '/upload',
  '/create-post',
] as const;
export type PlannedPagePath = (typeof PLANNED_PAGE_PATHS)[number];

export const REPOSITORY_URL = 'https://github.com/bitsocialnet/wetube';
