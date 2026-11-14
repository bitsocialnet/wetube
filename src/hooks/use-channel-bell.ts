import { useSyncExternalStore } from 'react';
import { getChannelNotifications, isChannelBellOn, subscribeChannelNotifications } from '../lib/channel-notifications';

/** Whether the bell of a subscribed channel is on in this browser. */
export const useChannelBell = (channelAddress: string) => isChannelBellOn(useSyncExternalStore(subscribeChannelNotifications, getChannelNotifications), channelAddress);
