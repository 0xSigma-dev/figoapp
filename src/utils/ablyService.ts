// utils/ablyService.ts
// Remove client initialization from here since AblyClient is handled via context

import * as Ably from 'ably';

// Refactor to make it depend on context's ablyClient
const fetchChannelHistory = async (ablyClient: Ably.Realtime, channelName: string): Promise<Ably.Message[]> => {
  if (!ablyClient) return [];

  const channel = ablyClient.channels.get(channelName);
  try {
    const result = await channel.history({ limit: 100 });
    console.log('message history', result)
    return result.items;
  } catch (error) {
    return [];
  }
};

const subscribeToChannel = (
  ablyClient: Ably.Realtime,
  channelName: string,
  messageListener: (message: Ably.Message) => void
) => {
  if (!ablyClient) return;

  const channel = ablyClient.channels.get(channelName);
  channel.subscribe('message', messageListener);
};

const unsubscribeFromChannel = (
  ablyClient: Ably.Realtime,
  channelName: string,
  messageListener: (message: Ably.Message) => void
) => {
  if (!ablyClient) return;

  const channel = ablyClient.channels.get(channelName);
  channel.unsubscribe('message', messageListener);
};

export { fetchChannelHistory, subscribeToChannel, unsubscribeFromChannel };


