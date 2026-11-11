import type { CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { HOME_CHANNELS } from '../data/channels';

/** A channel address from a route or a post, as the identifier the Bitsocial hooks expect. */
export const getChannelIdentifier = (address: string): CommunityIdentifier => {
  const listed = HOME_CHANNELS.find((channel) => channel.address === address || channel.publicKey === address);
  if (listed) return listed.publicKey ? { name: listed.address, publicKey: listed.publicKey } : { name: listed.address };
  return address.includes('.') ? { name: address } : { publicKey: address };
};

export const channelPath = (address: string) => `/c/${encodeURIComponent(address)}`;

export const videoPath = (channelAddress: string, cid: string) => `${channelPath(channelAddress)}/v/${encodeURIComponent(cid)}`;

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
