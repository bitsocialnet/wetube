import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ui-sdk/react/dialog';
import { ExternalLink, Layers, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSourceAvailability } from '../../hooks/use-source-availability';
import type { VideoSource } from '../../lib/video-sources';
import type { SourceStatus } from './player-state';
import styles from './player.module.css';

type SourceType = 'embed' | 'file' | 'ipfs';

// How far a source sits from a host that can take it down (video-sources.md): an embed lives on one
// host's site, a file on one server, and IPFS content on whichever peers hold it.
const getSourceType = (source: VideoSource): SourceType => {
  if (source.kind !== 'file') return 'embed';
  return source.label.startsWith('IPFS') ? 'ipfs' : 'file';
};

interface SourceRowProps {
  source: VideoSource;
  index: number;
  status: SourceStatus;
  onSelect: (index: number) => void;
  onUnavailable: (source: VideoSource) => void;
  onAvailable: (source: VideoSource) => void;
}

const SourceRow = ({ source, index, status, onSelect, onUnavailable, onAvailable }: SourceRowProps) => {
  const { t } = useTranslation();
  // Opening the list asks each host it can about the sources not tried yet; the row unmounts when it closes.
  useSourceAvailability(status === 'unchecked' ? source : undefined, onUnavailable, onAvailable);
  const statusLabels: Record<SourceStatus, string> = { playing: t('playing'), online: t('online'), offline: t('offline'), unchecked: t('not_checked') };
  const typeLabels: Record<SourceType, string> = { embed: t('source_type_embed'), file: t('source_type_file'), ipfs: t('source_type_ipfs') };

  return (
    <li className={styles.sourceRow} data-status={status}>
      <span className={styles.statusDot} aria-hidden='true' />
      <div className={styles.sourceText}>
        <span className={styles.sourceName}>
          {source.label}
          <span className={styles.sourceType}>{typeLabels[getSourceType(source)]}</span>
        </span>
        <span className={styles.sourceUrl} title={source.url}>
          {source.url}
        </span>
      </div>
      <span className={styles.sourceStatus}>{statusLabels[status]}</span>
      {status !== 'playing' && (
        // Choosing a failed source retries it.
        <DialogClose className={styles.playButton} action={() => onSelect(index)} aria-label={t('play_from', { source: source.label })}>
          {t('play')}
        </DialogClose>
      )}
      <a
        className={styles.openButton}
        href={source.url}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={t('open_on', { source: source.label })}
        title={t('open_on', { source: source.label })}
      >
        <ExternalLink size={18} aria-hidden='true' />
      </a>
    </li>
  );
};

interface SourcesDialogProps {
  sources: VideoSource[];
  getStatus: (index: number) => SourceStatus;
  onSelect: (index: number) => void;
  onUnavailable: (source: VideoSource) => void;
  onAvailable: (source: VideoSource) => void;
}

/** The button next to the video title, and the list it opens: every source, its status, and a way to switch. */
export const SourcesDialog = ({ sources, getStatus, onSelect, onUnavailable, onAvailable }: SourcesDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog presentation='auto'>
      <DialogTrigger className={styles.sourcesButton}>
        <Layers size={20} aria-hidden='true' />
        {sources.length === 1 ? t('source') : t('x_sources', { number: sources.length })}
      </DialogTrigger>
      <DialogBackdrop className={styles.backdrop} />
      <DialogContent className={styles.dialog} initialFocus='content'>
        <div className={styles.dialogHeader}>
          <DialogTitle className={styles.dialogTitle}>{t('sources')}</DialogTitle>
          <DialogClose className={styles.closeButton} aria-label={t('close')}>
            <X size={20} aria-hidden='true' />
          </DialogClose>
        </div>
        <DialogDescription className={styles.dialogNote}>{t('sources_note')}</DialogDescription>
        <ol className={styles.sourceList}>
          {sources.map((source, index) => (
            <SourceRow
              key={source.playUrl}
              source={source}
              index={index}
              status={getStatus(index)}
              onSelect={onSelect}
              onUnavailable={onUnavailable}
              onAvailable={onAvailable}
            />
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
};
