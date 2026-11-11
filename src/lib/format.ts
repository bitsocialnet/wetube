const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "3 days ago" from a Bitsocial timestamp in seconds. */
export const timeAgo = (timestampSeconds: number | undefined, nowMs = Date.now()) => {
  if (!timestampSeconds) return '';
  const elapsed = Math.max(0, nowMs / 1000 - timestampSeconds);
  for (const [unit, seconds] of UNITS) {
    if (elapsed >= seconds) return relativeTime.format(-Math.floor(elapsed / seconds), unit);
  }
  return 'just now';
};

export const formatCount = (count: number | undefined) => compactNumber.format(count ?? 0);

export const plural = (count: number | undefined, singular: string, pluralForm = `${singular}s`) => `${formatCount(count)} ${(count ?? 0) === 1 ? singular : pluralForm}`;
