import { useEffect, useState } from "react";
import * as Ably from "ably";
import { saveMessage, updateMessageStatus } from '@/utils/indexedDB';

const useTypingStatus = (
  channel: Ably.RealtimeChannel | null,
  userId: any,
  timeoutDuration = 1000
) => {
  const [startedTyping, setStartedTyping] = useState(false);
  const [whoIsCurrentlyTyping, setWhoIsCurrentlyTyping] = useState<string[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [readMessages, setReadMessages] = useState<string[]>([]); // Array to track read messages

  useEffect(() => {
    if (!channel) return;

    // User enters presence
    channel.presence.enter({ userId }).catch((err) => {
      //console.error("Error entering presence:", err);
    });

    return () => {
      channel.presence.leave({ userId }).catch((err) => {
       // console.error("Error leaving presence:", err);
      });
    };
  }, [channel, userId]);

  // Function to stop typing
  const stopTyping = () => {
    setStartedTyping(false);
    channel?.presence.update({ typing: false });
  };

  // Typing event handler
  const onType = (inputValue: string) => {
    if (!startedTyping) {
      setStartedTyping(true);
      channel?.presence.update({ typing: true }).catch((err) => {
        //console.error("Error updating typing status:", err);
      });
    }

    if (timer) {
      clearTimeout(timer);
    }

    if (inputValue === "") {
      stopTyping();
    } else {
      const newTimer = setTimeout(stopTyping, timeoutDuration);
      setTimer(newTimer);
    }
  };

  // Function to handle when a message is read
  const markMessageAsRead = async (messageId: string, channelName: string) => {
    // Update the local state
    setReadMessages((prev) => [...prev, messageId]);
  
    // Update the message status in IndexedDB
    await updateMessageStatus(messageId, 'read', channelName);
  
    // Optionally send presence update for the other user
    channel?.presence.update({ userId, lastReadMessage: messageId }).catch((err) => {
      //console.error("Error updating read receipt:", err);
    });
  };

  // Listen for presence updates (who is typing, who has read messages)
  useEffect(() => {
    if (!channel) return;

    const handlePresenceUpdate = (update: Ably.PresenceMessage) => {
      const { data, clientId } = update;

      // Typing status updates
      if (data.typing && clientId !== userId) {
        setWhoIsCurrentlyTyping((currentlyTyping) => [
          ...currentlyTyping,
          clientId,
        ]);
      } else {
        setWhoIsCurrentlyTyping((currentlyTyping) =>
          currentlyTyping.filter((id) => id !== clientId)
        );
      }

      // Read receipt updates
      if (data.lastReadMessage && clientId !== userId) {
        // Handle read receipt for other users
        //console.log(`User ${clientId} has read message ${data.lastReadMessage}`);
        // Update message status in UI based on this information
      }
    };

    channel?.presence.subscribe("update", handlePresenceUpdate);

    return () => {
      channel?.presence.unsubscribe("update");
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [channel, userId, timer]);

  return { onType, whoIsCurrentlyTyping, markMessageAsRead };
};

export default useTypingStatus;
