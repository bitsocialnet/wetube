import { useTranslation } from 'react-i18next';
import { formatCount, timeAgo } from '../lib/format';

/** The translation function with relative-time and count formatters in the interface language. */
export const useFormat = () => {
  const { t, i18n } = useTranslation();
  const { language } = i18n;
  return {
    t,
    language,
    timeAgo: (timestampSeconds: number | undefined) => timeAgo(timestampSeconds, { language, justNow: t('just_now') }),
    count: (count: number | undefined) => formatCount(count, language),
  };
};
