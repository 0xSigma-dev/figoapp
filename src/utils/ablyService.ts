import * as Ably from 'ably';
import Cookies from 'js-cookie';

const userId = Cookies.get('userId') || ''; 

class AblyService {
  private ablyClient: Ably.Realtime | null = null;
  private channels: Record<string, Ably.RealtimeChannel> = {};
  private messageListeners: Record<string, ((message: Ably.Message) => void)[]> = {};
  

  constructor() {
    this.ablyClient = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      clientId: userId
    });
  }

  getClient() {
    return this.ablyClient;
  }

  async fetchChannelHistory(channelName: any): Promise<Ably.Message[]> {
    if (!this.ablyClient) return [];

    const channel = this.ablyClient.channels.get(channelName);
    try {
      const result = await channel.history({ limit: 100 });
      return result.items;
    } catch (error) {
      return [];
    }
  }

  subscribeToChannel(channelName: string, messageListener: (message: Ably.Message) => void) {
    if (!this.ablyClient) return;

    if (!this.channels[channelName]) {
      this.channels[channelName] = this.ablyClient.channels.get(channelName);
      this.messageListeners[channelName] = [];
    }

    this.channels[channelName].subscribe('message', messageListener);
    this.messageListeners[channelName].push(messageListener);
  }

  unsubscribeFromChannel(channelName: string) {
    if (!this.ablyClient || !this.channels[channelName]) return;

    this.messageListeners[channelName].forEach((listener) => {
      this.channels[channelName].unsubscribe('message', listener);
    });

    delete this.channels[channelName];
    delete this.messageListeners[channelName];
  }

  publishToChannel(channelName: any, message: any) {
    if (!this.ablyClient || !this.channels[channelName]) return;

    this.channels[channelName].publish('message', message);
  }

  /**
   * Checks if the client is subscribed to a specific channel.
   * @param channelName The name of the channel to check.
   * @returns Boolean indicating subscription status.
   */
  isSubscribed(channelName: string): boolean {
    return !!this.channels[channelName];
  }
}


const ablyService = new AblyService();
export default ablyService;

