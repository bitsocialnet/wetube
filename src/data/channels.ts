export interface ChannelListing {
  /** A .bso name or a 12D3KooW… public key. */
  address: string;
  /** Lets the client skip name resolution when it is known. */
  publicKey?: string;
}

// Channels on the home page. No WeTube channels exist yet, so this lists Seedit's video-only community
// (bitsocialnet/lists, seedit-videos-directory.json) as a stand-in. Replace it with real channels once
// they are hosted.
export const HOME_CHANNELS: ChannelListing[] = [{ address: 'videos-posting.bso', publicKey: '12D3KooWQt3UJ6A3AeZxJSFJnspVmYQK1Epj8VeSzrFG1tHiZC9o' }];
