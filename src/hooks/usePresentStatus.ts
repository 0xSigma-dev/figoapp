import { useEffect, useState } from "react";
import * as Ably from "ably";
import { updateMessagesToRead } from '@/utils/indexedDB';

const usePresentStatus = (
  channel: Ably.RealtimeChannel | null,
  userId: any,
  friendId: any,
) => {
  const [isFriendOnline, setIsFriendOnline] = useState(false);

  // Enter presence for the current user
  useEffect(() => {
    if (!channel) return;

    //console.log('channel', channel.name)
    channel.presence.enter({ userId }).catch((err) => {
      //console.error("Error entering presence:", err);
    });

    return () => {
      channel.presence.leave({ userId }).catch((err) => {
        //console.error("Error leaving presence:", err);
      });
    };
  }, [channel, userId]);

  // Check if the friend is currently online
  useEffect(() => {
    if (!channel) return;

    // Get the current members present in the channel
    const checkIfFriendIsOnline = async () => {
      try {
        const members = await channel.presence.get();
        const isOnline = members.some((member) => member.clientId === friendId);
        setIsFriendOnline(isOnline);
        
        // If the friend is online, update messages to 'read'
        if (isOnline) {
          await updateMessagesToRead(channel.name);
        }
      } catch (error) {
        //console.error("Error fetching presence:", error);
      }
    };

    // Call the function to check if the friend is online
    checkIfFriendIsOnline();

    const intervalId = setInterval(checkIfFriendIsOnline, 5000);

    // Subscribe to presence updates
    const handlePresenceUpdate = (presenceMessage: Ably.PresenceMessage) => {
      if (presenceMessage.clientId === friendId) {
        if (presenceMessage.action === 'enter' || presenceMessage.action === 'present') {
          setIsFriendOnline(true); // Friend has joined
          updateMessagesToRead(channel.name);
        } else if (presenceMessage.action === 'leave' || presenceMessage.action === 'absent') {
          setIsFriendOnline(false); // Friend has left
        }
      }
    };

    channel.presence.subscribe(handlePresenceUpdate);

    return () => {
      channel.presence.unsubscribe(handlePresenceUpdate);
    };
  }, [channel, friendId]);

  return isFriendOnline; // Return the online status of the friend
};

export default usePresentStatus;
