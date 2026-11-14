import type { CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { HOME_CHANNELS } from '../data/channels';

/** A channel address from a route or a post, as the identifier the Bitsocial hooks expect. */
export const getChannelIdentifier = (address: string): CommunityIdentifier => {
  const listed = HOME_CHANNELS.find((channel) => channel.address === address || channel.publicKey === address);
  if (listed) return listed.publicKey ? { name: listed.address, publicKey: listed.publicKey } : { name: listed.address };
  return address.includes('.') ? { name: address } : { publicKey: address };
};

/** The home channels as hook identifiers, for feeds across all of them. */
export const HOME_COMMUNITIES: CommunityIdentifier[] = HOME_CHANNELS.map((channel) => getChannelIdentifier(channel.address));

// Channels live at /@<address>, like YouTube's /@handle. The address is a .bso name or a public key.
export const channelPath = (address: string) => `/@${encodeURIComponent(address)}`;

/** The channel address in a /@<address> route segment, or undefined when the segment is not a channel. */
export const getChannelAddressFromHandle = (handle: string | undefined) => (handle?.startsWith('@') && handle.length > 1 ? handle.slice(1) : undefined);

export const videoPath = (channelAddress: string, cid: string) => `${channelPath(channelAddress)}/v/${encodeURIComponent(cid)}`;

/** A feed post's own page, with its comments; videos open on the watch page instead. */
export const postPath = (channelAddress: string, cid: string) => `${channelPath(channelAddress)}/post/${encodeURIComponent(cid)}`;

// A channel page's tabs, as on YouTube: Home is the channel's own path, the others a segment after it.
// Search has no tab; it opens from the search button in the tab bar.
const CHANNEL_SECTIONS = ['videos', 'playlists', 'posts', 'search'] as const;
export type ChannelSection = 'home' | (typeof CHANNEL_SECTIONS)[number];

/** The section a /@<address>/<segment> route shows, or undefined when the segment is not one. */
export const getChannelSection = (segment: string | undefined): ChannelSection | undefined =>
  segment === undefined ? 'home' : CHANNEL_SECTIONS.find((section) => section === segment);

export const channelSectionPath = (address: string, section: Exclude<ChannelSection, 'search'>) =>
  section === 'home' ? channelPath(address) : `${channelPath(address)}/${section}`;

export const channelSearchPath = (address: string, query: string) => `${channelPath(address)}/search?${new URLSearchParams({ query })}`;

/** The page a pathname scrolls as: a channel's tabs are one page, so switching tabs keeps the scroll position. */
export const getScrollPage = (pathname: string) => {
  const [, handle, section, ...rest] = pathname.split('/');
  return getChannelAddressFromHandle(handle) && rest.length === 0 && getChannelSection(section) ? `/${handle}` : pathname;
};

/** 12D3KooW… public keys are 52 characters; show the start and the end. */
export const shortAddress = (address: string | undefined) => {
  if (!address) return '';
  return address.length > 20 && !address.includes('.') ? `${address.slice(0, 8)}…${address.slice(-4)}` : address;
};

/** A stable hue per channel for avatars without an image. */
export const channelHue = (address: string) => {
  let hash = 0;
  for (const char of address) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 360;
};

const PUBLIC_KEY_ADDRESS = /^12D3KooW[1-9A-HJ-NP-Za-km-z]{44}$/;

/** True for a .bso-style name or a 12D3KooW… public key, which the search box opens as a channel. */
export const looksLikeChannelAddress = (query: string) => !/\s/.test(query) && (PUBLIC_KEY_ADDRESS.test(query) || /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(query));
