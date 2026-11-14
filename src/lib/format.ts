// Relative times and counts in the interface language, from the browser's Intl data.
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

const perLanguage = <T>(create: (language: string) => T) => {
  const cache = new Map<string, T>();
  return (language: string) => {
    let value = cache.get(language);
    if (value === undefined) {
      value = create(language);
      cache.set(language, value);
    }
    return value;
  };
};

const relativeTimeFormat = perLanguage((language) => new Intl.RelativeTimeFormat(language, { numeric: 'auto' }));
const dateFormat = perLanguage((language) => new Intl.DateTimeFormat(language, { year: 'numeric', month: 'short', day: 'numeric' }));
const compactNumberFormat = perLanguage((language) => new Intl.NumberFormat(language, { notation: 'compact', maximumFractionDigits: 1 }));

/** "3 days ago" from a Bitsocial timestamp in seconds; `justNow` for anything under a minute. */
export const timeAgo = (timestampSeconds: number | undefined, { language, justNow }: { language: string; justNow: string }, nowMs = Date.now()) => {
  if (!timestampSeconds) return '';
  const elapsed = Math.max(0, nowMs / 1000 - timestampSeconds);
  for (const [unit, seconds] of UNITS) {
    if (elapsed >= seconds) return relativeTimeFormat(language).format(-Math.floor(elapsed / seconds), unit);
  }
  return justNow;
};

/** "12.4K" */
export const formatCount = (count: number | undefined, language: string) => compactNumberFormat(language).format(count ?? 0);

/** "Nov 11, 2026" from a Bitsocial timestamp in seconds. */
export const formatDate = (timestampSeconds: number | undefined, language: string) => (timestampSeconds ? dateFormat(language).format(timestampSeconds * 1000) : '');
