import type { CommentsFilter } from '@bitsocial/bitsocial-react-hooks';

// A WeTube video is an ordinary Bitsocial post. Until a BSIP standardizes the schema, the demo
// convention is:
//   - post.title is the video title, post.link is the primary source, so other Bitsocial clients
//     (5chan, Seedit) still render the video;
//   - post.content is the description, optionally followed by a "Mirrors:" line and one URL per
//     line. Authors can edit content but not link, so the mirror list is the part that can rotate.

export type VideoSourceKind = 'youtube' | 'vimeo' | 'peertube' | 'odysee' | 'bitchute' | 'streamable' | 'file';

export interface VideoSource {
  /** The URL as the channel owner published it. */
  url: string;
  kind: VideoSourceKind;
  /** iframe src for embeds, <video> src for files. */
  playUrl: string;
  /** Short label for the source switcher. */
  label: string;
  thumbnailUrl?: string;
  /**
   * A CORS-enabled metadata URL (oEmbed or API) that answers 404 when the video is gone, so the player can
   * skip a removed embed. Embeds do not tell the page when they fail; files do, through the video element.
   */
  availabilityUrl?: string;
}

export interface VideoComment {
  cid?: string;
  title?: string;
  content?: string;
  link?: string;
  linkHtmlTagName?: string;
  thumbnailUrl?: string;
  removed?: boolean;
  deleted?: boolean;
  // Hook results carry other fields (state, error, refresh…).
  [key: string]: unknown;
}

export interface Video {
  title: string;
  description: string;
  sources: VideoSource[];
  /** Thumbnail candidates in order: the sources' own, then the one the community fetched for the link. */
  thumbnailUrls: string[];
}

// ipfs:// sources load through a public gateway for now; verified in-browser IPFS playback comes later.
export const IPFS_GATEWAY_URL = 'https://ipfs.io';

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);
// Invidious instances that 5chan also embeds.
const INVIDIOUS_HOSTS = new Set(['yewtu.be', 'inv.nadeko.net', 'yt.artemislena.eu', 'invidious.nerdvpn.de']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
const ODYSEE_HOSTS = new Set(['odysee.com', 'www.odysee.com']);
const BITCHUTE_HOSTS = new Set(['bitchute.com', 'www.bitchute.com']);
const STREAMABLE_HOSTS = new Set(['streamable.com', 'www.streamable.com']);

// PeerTube runs on many independent hosts, so it is recognized by its URL shapes: /w/<short id>,
// /videos/watch/<uuid> and /videos/embed/<id>.
const PEERTUBE_PATH = /^\/(?:w|videos\/watch|videos\/embed)\/([1-9A-HJ-NP-Za-km-z]{22}|[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})\/?$/i;

const YOUTUBE_ID = /^[\w-]{11}$/;
const VIDEO_FILE_EXTENSION = /\.(mp4|webm|m4v|mov|ogv)$/i;

const hostLabel = (url: URL) => url.hostname.replace(/^www\./, '');

const getYouTubeId = (url: URL): string | undefined => {
  const parts = url.pathname.split('/').filter(Boolean);
  let id = url.searchParams.get('v') ?? undefined;
  if (!id && url.hostname.endsWith('youtu.be')) id = parts[0];
  if (!id && ['shorts', 'embed', 'live', 'v'].includes(parts[0] ?? '')) id = parts[1];
  return id && YOUTUBE_ID.test(id) ? id : undefined;
};

// Covers vimeo.com/{id}, unlisted vimeo.com/{id}/{hash}, channels/{name}/{id}, album|showcase/{id}/video/{id},
// groups/{name}/videos/{id} and player.vimeo.com/video/{id}?h={hash}. Same rules as 5chan's embeds.
const getVimeoVideo = (url: URL): { id: string; hash?: string } | undefined => {
  const parts = url.pathname.split('/').filter(Boolean);
  const keywordIndex = Math.max(parts.lastIndexOf('video'), parts.lastIndexOf('videos'));
  const idIndex = keywordIndex >= 0 ? keywordIndex + 1 : parts[0] === 'channels' ? 2 : 0;
  const id = parts[idIndex];
  if (!id || !/^\d+$/.test(id)) return undefined;
  const hash = url.searchParams.get('h') || parts[idIndex + 1];
  return hash && /^[\da-f]+$/i.test(hash) ? { id, hash } : { id };
};

const parseIpfsSource = (rawUrl: string): VideoSource | undefined => {
  const path = rawUrl.slice('ipfs://'.length).replace(/^ipfs\//, '');
  const cid = path.split(/[/?#]/)[0];
  if (!cid || !/^[a-z0-9]+$/i.test(cid)) return undefined;
  return { url: rawUrl, kind: 'file', playUrl: `${IPFS_GATEWAY_URL}/ipfs/${path}`, label: 'IPFS' };
};

/** Returns a playable source for a URL, or undefined when WeTube cannot play it. */
export const parseVideoSource = (rawUrl: string, options: { linkHtmlTagName?: string } = {}): VideoSource | undefined => {
  const trimmed = rawUrl.trim();
  if (/^ipfs:\/\//i.test(trimmed)) return parseIpfsSource(trimmed);

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return undefined;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;

  const host = url.hostname.toLowerCase();
  const label = hostLabel(url);

  if (YOUTUBE_HOSTS.has(host) || INVIDIOUS_HOSTS.has(host)) {
    const id = getYouTubeId(url);
    if (!id) return undefined;
    const invidious = INVIDIOUS_HOSTS.has(host);
    return {
      url: trimmed,
      kind: 'youtube',
      playUrl: invidious ? `https://${host}/embed/${id}` : `https://www.youtube-nocookie.com/embed/${id}`,
      label,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      // Invidious instances have no common CORS-enabled check; YouTube's oEmbed answers 404 for removed videos.
      availabilityUrl: invidious ? undefined : `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
    };
  }

  if (VIMEO_HOSTS.has(host)) {
    const video = getVimeoVideo(url);
    if (!video) return undefined;
    // dnt=1 stops the player from setting tracking cookies.
    const params = new URLSearchParams({ dnt: '1' });
    if (video.hash) params.set('h', video.hash);
    return {
      url: trimmed,
      kind: 'vimeo',
      playUrl: `https://player.vimeo.com/video/${video.id}?${params}`,
      label: 'vimeo.com',
      availabilityUrl: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(trimmed)}`,
    };
  }

  if (ODYSEE_HOSTS.has(host)) {
    if (url.pathname.startsWith('/$/embed/')) return { url: trimmed, kind: 'odysee', playUrl: `https://odysee.com${url.pathname}`, label: 'odysee.com' };
    if (!url.pathname.startsWith('/@')) return undefined;
    return { url: trimmed, kind: 'odysee', playUrl: `https://odysee.com/$/embed${url.pathname}`, label: 'odysee.com' };
  }

  if (BITCHUTE_HOSTS.has(host)) {
    const match = url.pathname.match(/^\/(?:video|embed)\/([\w-]+)\/?$/);
    if (!match) return undefined;
    return { url: trimmed, kind: 'bitchute', playUrl: `https://www.bitchute.com/embed/${match[1]}/`, label: 'bitchute.com' };
  }

  if (STREAMABLE_HOSTS.has(host)) {
    const match = url.pathname.match(/^\/(?:e\/)?([a-z0-9]+)\/?$/i);
    if (!match) return undefined;
    return { url: trimmed, kind: 'streamable', playUrl: `https://streamable.com/e/${match[1]}`, label: 'streamable.com' };
  }

  const peertube = url.pathname.match(PEERTUBE_PATH);
  if (peertube) {
    const origin = `https://${host}${url.port ? `:${url.port}` : ''}`;
    return {
      url: trimmed,
      kind: 'peertube',
      playUrl: `${origin}/videos/embed/${peertube[1]}`,
      label,
      availabilityUrl: `${origin}/api/v1/videos/${peertube[1]}`,
    };
  }

  if (VIDEO_FILE_EXTENSION.test(url.pathname) || options.linkHtmlTagName === 'video') {
    return { url: trimmed, kind: 'file', playUrl: trimmed, label: url.pathname.startsWith('/ipfs/') ? `IPFS (${label})` : label };
  }

  return undefined;
};

const MIRRORS_HEADING = /^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:mirrors|sources)(?:\*\*)?\s*:?\s*$/i;
const URL_IN_LINE = /(?:https?|ipfs):\/\/[^\s<>()"'\]]+/i;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

/** Splits a video post's content into its description and the URLs listed under "Mirrors:". */
export const splitVideoContent = (content: string | undefined): { description: string; mirrorUrls: string[] } => {
  if (!content) return { description: '', mirrorUrls: [] };
  const lines = content.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => MIRRORS_HEADING.test(line));
  if (headingIndex === -1) return { description: content.trim(), mirrorUrls: [] };

  const mirrorUrls: string[] = [];
  let end = headingIndex + 1;
  for (; end < lines.length; end++) {
    const line = lines[end].trim();
    if (!line) {
      if (mirrorUrls.length > 0) break;
      continue;
    }
    const match = line.match(URL_IN_LINE);
    if (!match) break;
    mirrorUrls.push(match[0].replace(TRAILING_PUNCTUATION, ''));
  }

  const description = [...lines.slice(0, headingIndex), ...lines.slice(end)].join('\n').trim();
  return { description, mirrorUrls };
};

/** Every playable source of a post, the post link first, without duplicates. */
export const getVideoSources = (comment: VideoComment | undefined): VideoSource[] => {
  if (!comment) return [];
  const { mirrorUrls } = splitVideoContent(comment.content);
  const sources: VideoSource[] = [];
  const seen = new Set<string>();
  const add = (source: VideoSource | undefined) => {
    if (!source || seen.has(source.playUrl)) return;
    seen.add(source.playUrl);
    sources.push(source);
  };
  if (comment.link) add(parseVideoSource(comment.link, { linkHtmlTagName: comment.linkHtmlTagName }));
  for (const url of mirrorUrls) add(parseVideoSource(url));
  return sources;
};

const firstLine = (text: string) =>
  text
    .split(/\r?\n/)
    .find((line) => line.trim())
    ?.trim() ?? '';

export const getVideo = (comment: VideoComment | undefined): Video | undefined => {
  if (!comment) return undefined;
  const sources = getVideoSources(comment);
  const { description } = splitVideoContent(comment.content);
  const fallbackTitle = firstLine(description).slice(0, 100);
  return {
    title: comment.title?.trim() || fallbackTitle || 'Untitled video',
    description,
    sources,
    thumbnailUrls: [...sources.flatMap((source) => (source.thumbnailUrl ? [source.thumbnailUrl] : [])), ...(comment.thumbnailUrl ? [comment.thumbnailUrl] : [])],
  };
};

export const isPlayableVideoPost = (comment: VideoComment | undefined) => Boolean(comment && !comment.removed && !comment.deleted && getVideoSources(comment).length > 0);

// Change the key whenever the filter's rules change, so cached feeds are rebuilt.
export const videoPostsFilter: CommentsFilter = { key: 'wetube-playable-video-v1', filter: (comment) => isPlayableVideoPost(comment) };
