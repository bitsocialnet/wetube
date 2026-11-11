export interface ChannelListing {
  /** A .bso name or a 12D3KooW… public key. */
  address: string;
  /** Lets the client skip name resolution when it is known. */
  publicKey?: string;
}

// Channels on the home page until categories exist (community lists, see curation-and-discovery.md).
// - Open Movies: the WeTube demo channel, hosted on a Bitsocial team node, with the Blender open
//   movies and their mirrors; only its owner can post.
// - Seedit's video-only community (bitsocialnet/lists, seedit-videos-directory.json), for more content.
export const HOME_CHANNELS: ChannelListing[] = [
  { address: '12D3KooWGrpURz4BR1EWChGnwmAavSLkW2ie6YWoj2dZE3XLU7bw' },
  { address: 'videos-posting.bso', publicKey: '12D3KooWQt3UJ6A3AeZxJSFJnspVmYQK1Epj8VeSzrFG1tHiZC9o' },
];
