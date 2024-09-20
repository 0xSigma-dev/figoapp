import * as Ably from 'ably';

const subscribedChannels = new Set<string>(); // Keeps track of subscribed channels

const fetchChannelHistory = async (ablyClient: Ably.Realtime, channelName: string): Promise<Ably.Message[]> => {
  if (!ablyClient) return [];

  const channel = ablyClient.channels.get(channelName);
  try {
    const result = await channel.history({ limit: 100 });
    //console.log('message history', result);
    return result.items;
  } catch (error) {
    console.error('Error fetching channel history:', error);
    return [];
  }
};

const subscribeToChannel = (
  ablyClient: Ably.Realtime,
  channelName: string,
  messageListener: (message: Ably.Message) => void,
  errorListener?: (error: any) => void // Optional error listener
) => {
  if (!ablyClient) {
    //console.error('Ably client is not initialized');
    return;
  }

  // Check if already subscribed to the channel
  

  const channel = ablyClient.channels.get(channelName);

  try {
    channel.subscribe('message', messageListener);
    subscribedChannels.add(channelName); // Add to the set of subscribed channels
    //console.log(`Subscribed to channel: ${channelName}`);

    // Listen for specific connection state changes (disconnected, failed)
    ablyClient.connection.on(['disconnected', 'failed'], (stateChange) => {
      if (stateChange.current === 'disconnected') {
        
      } else if (stateChange.current === 'failed') {
        //console.error('Connection failed');
        if (errorListener) errorListener('Connection failed to server.');
      }
    });
  } catch (error) {
    //console.error(`Error subscribing to channel: ${channelName}`, error);
    if (errorListener) errorListener(error);
  }
};

const unsubscribeFromChannel = (
  ablyClient: Ably.Realtime,
  channelName: string,
  messageListener: (message: Ably.Message) => void
) => {
  if (!ablyClient) return;

  const channel = ablyClient.channels.get(channelName);
  channel.unsubscribe('message', messageListener);
  subscribedChannels.delete(channelName); // Remove from the set of subscribed channels
  //console.log(`Unsubscribed from channel: ${channelName}`);
};

export { fetchChannelHistory, subscribeToChannel, unsubscribeFromChannel };


