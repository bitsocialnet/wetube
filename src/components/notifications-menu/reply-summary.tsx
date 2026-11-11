import { Trans, useTranslation } from 'react-i18next';

/** "**Bob** replied: great video". The name and reply are user text, so they are escaped: tags in them stay text. */
export const ReplySummary = ({ author, text }: { author: string; text: string }) => {
  const { t } = useTranslation();
  return (
    <Trans t={t} i18nKey='user_replied' values={{ author, text }} components={{ bold: <strong /> }} tOptions={{ interpolation: { escapeValue: true } }} shouldUnescape />
  );
};
