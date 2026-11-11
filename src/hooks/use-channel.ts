import { useMemo } from 'react';
import { useCommunity } from '@bitsocial/bitsocial-react-hooks';
import { getChannelIdentifier } from '../lib/channels';

/** The Bitsocial community behind a channel address. onlyIfCached reads what feeds already loaded. */
export const useChannel = (address: string | undefined, options: { onlyIfCached?: boolean } = {}) => {
  const community = useMemo(() => (address ? getChannelIdentifier(address) : undefined), [address]);
  return useCommunity({ community, onlyIfCached: options.onlyIfCached });
};
