import type { CommentsFilter } from '@bitsocial/bitsocial-react-hooks';
import { isPlayableVideoPost, splitVideoContent, type VideoComment } from './video-sources';

// A channel's posts are of two kinds, as on YouTube: videos (the Videos tab) and feed posts (the Posts
// tab: text, an image or a link). Until the video post BSIP gives videos an explicit field, the kind is
// derived: a post with a playable source is a video, every other post is a feed post (video-sources.md).

const isVisible = (comment: VideoComment | undefined): comment is VideoComment => Boolean(comment && !comment.removed && !comment.deleted);

/** A channel post that is not a video, for the Posts tab. */
export const isFeedPost = (comment: VideoComment | undefined) => isVisible(comment) && !isPlayableVideoPost(comment);

// Change the key whenever the filter's rules change, so cached feeds are rebuilt.
export const feedPostsFilter: CommentsFilter = { key: 'wetube-feed-post-v1', filter: (comment) => isFeedPost(comment) };

const IMAGE_EXTENSION = /\.(avif|gif|jpe?g|png|webp)$/i;

export interface FeedPostMedia {
  kind: 'image' | 'link';
  url: string;
  host: string;
  /** The preview image the community fetched for a link. */
  thumbnailUrl?: string;
}

/** What a feed post shows under its text: its link as an image, or as a link card. Only http(s) links. */
export const getFeedPostMedia = (comment: VideoComment | undefined): FeedPostMedia | undefined => {
  if (!comment?.link) return undefined;
  let url: URL;
  try {
    url = new URL(comment.link.trim());
  } catch {
    return undefined;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
  const kind = comment.linkHtmlTagName === 'img' || IMAGE_EXTENSION.test(url.pathname) ? 'image' : 'link';
  return { kind, url: url.href, host: url.hostname.replace(/^www\./, ''), thumbnailUrl: comment.thumbnailUrl };
};

/** The text a search looks in: the title and the description, without a video's mirror list. */
const searchableText = (comment: VideoComment) => `${comment.title ?? ''}\n${splitVideoContent(comment.content).description}`.toLowerCase();

const searchTerms = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean);

/** True when every word of the query appears in the post's title or description. */
export const matchesChannelSearch = (comment: VideoComment | undefined, query: string) => {
  const terms = searchTerms(query);
  if (!isVisible(comment) || terms.length === 0) return false;
  const text = searchableText(comment);
  return terms.every((term) => text.includes(term));
};

/**
 * The in-channel search, run on the posts the feed loads from peers: the feed keeps loading the channel's
 * pages while it finds too few matches, so a small channel is searched whole. Large channels will search
 * through the WeTube index (roadmap.md).
 */
export const channelSearchFilter = (query: string): CommentsFilter => ({
  key: `wetube-channel-search-v1:${searchTerms(query).join(' ')}`,
  filter: (comment) => matchesChannelSearch(comment, query),
});

interface PostsPages {
  pages?: Record<string, { comments?: VideoComment[]; nextCid?: string } | undefined>;
  pageCids?: Record<string, string | undefined>;
}

/**
 * The channel's video count when it is known without loading more pages: the community record preloads
 * its first page of posts, and when that page has no next page it holds every post. Undefined for larger
 * channels, until the count comes from community stats or the index.
 */
export const getKnownVideoCount = (posts: PostsPages | undefined): number | undefined => {
  if (!posts) return undefined;
  const pages = Object.values(posts.pages ?? {});
  const completePage = pages.find((page) => page && !page.nextCid);
  if (completePage) return (completePage.comments ?? []).filter(isPlayableVideoPost).length;
  // A channel without posts publishes no pages at all.
  return pages.length === 0 && Object.keys(posts.pageCids ?? {}).length === 0 ? 0 : undefined;
};
