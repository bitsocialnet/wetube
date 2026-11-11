import type { CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { HOME_CHANNELS } from '../data/channels';

/** A channel address from a route or a post, as the identifier the Bitsocial hooks expect. */
export const getChannelIdentifier = (address: string): CommunityIdentifier => {
  const listed = HOME_CHANNELS.find((channel) => channel.address === address || channel.publicKey === address);
  if (listed) return listed.publicKey ? { name: listed.address, publicKey: listed.publicKey } : { name: listed.address };
  return address.includes('.') ? { name: address } : { publicKey: address };
};

// Channels live at /@<address>, like YouTube's /@handle. The address is a .bso name or a public key.
export const channelPath = (address: string) => `/@${encodeURIComponent(address)}`;

/** The channel address in a /@<address> route segment, or undefined when the segment is not a channel. */
export const getChannelAddressFromHandle = (handle: string | undefined) => (handle?.startsWith('@') && handle.length > 1 ? handle.slice(1) : undefined);

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
