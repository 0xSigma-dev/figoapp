import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';

const useTypingStatus = (
  channelId: any, // Using the channelId instead of the Ably channel
  userId: any,
  timeoutDuration = 1000
) => {
  const [startedTyping, setStartedTyping] = useState(false);
  const [whoIsCurrentlyTyping, setWhoIsCurrentlyTyping] = useState<string[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to start typing status
  const startTyping = async () => {
    if (!startedTyping) {
      setStartedTyping(true);
      // Update typing status in the database
      await supabase
        .from('typing_status')
        .upsert({ user_id: userId, channel_id: channelId, is_typing: true });
    }

    if (timer) {
      clearTimeout(timer);
    }
  };

  // Function to stop typing
  const stopTyping = async () => {
    setStartedTyping(false);
    // Update typing status in the database
    await supabase
      .from('typing_status')
      .upsert({ user_id: userId, channel_id: channelId, is_typing: false });

    if (timer) {
      clearTimeout(timer);
    }
  };

  // Function to handle typing event
  const onType = (inputValue: string) => {
    if (inputValue === "") {
      stopTyping();
    } else {
      startTyping();
      const newTimer = setTimeout(stopTyping, timeoutDuration);
      setTimer(newTimer);
    }
  };

  // Subscribe to real-time updates from the `typing_status` table
  useEffect(() => {
    const subscribeToTypingStatus = () => {
      const channel = supabase
        .channel('typing-status-channel')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public', // Adjust this if your schema is different
            table: 'typing_status',
            filter: `channel_id=eq.${channelId}`, // Subscribe to the channel's typing status
          },
          (payload) => {
            const { user_id, is_typing } = payload.new;

            if (user_id !== userId) {
              if (is_typing) {
                setWhoIsCurrentlyTyping((prev) => [...prev, user_id]);
              } else {
                setWhoIsCurrentlyTyping((prev) =>
                  prev.filter((id) => id !== user_id)
                );
              }
            }
          }
        )
        .subscribe();

      // Cleanup on component unmount
      return () => {
        channel.unsubscribe();
      };
    };

    subscribeToTypingStatus();
  }, [channelId, userId]);

  return { onType, whoIsCurrentlyTyping };
};

export default useTypingStatus;


