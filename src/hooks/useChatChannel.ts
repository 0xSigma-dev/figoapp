import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { subscribeToChannel, fetchChannelHistory } from '@/utils/ablyService';
import { getAllChannels, saveChannel, saveMessage, loadMessages, updateMessageStatus } from '@/utils/indexedDB';
import * as Ably from 'ably';

const useChatChannel = (userId: any, friendId: any, ablyClient: any, friendAvatar: any, friendName: any, senderName: any, senderAvatar: any, isFriendDetailsFetched: boolean) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [channelName, setChannelName] = useState<string>('');
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  const fetchMessages = useCallback( async (newMessage: any) => {
    if (!channelRef.current || !ablyClient) return;
  
    try {
      // Load stored messages from IndexedDB
      const storedMessages = await loadMessages(channelRef.current.name);
  
      // Fetch messages from history
      const fetchedMessages = await fetchChannelHistory(ablyClient, channelRef.current.name);
  
      // Create a Set of IDs for quick lookup
      const storedMessageIds = new Set(storedMessages.map(msg => msg.id));
      
      // Filter out new messages from the fetched ones that are not in IndexedDB
      const newMessages = fetchedMessages.filter(message => !storedMessageIds.has(message.data.id));
  
      // Save new messages to IndexedDB
      if (newMessages.length > 0) {
        for (const message of newMessages) {
          await saveMessage(message.data, message.data.id, 'delivered', message.data.channelName);
        }
      }
  
      // Reload all messages from IndexedDB
      const updatedMessages = await loadMessages(channelRef.current.name);
  
      // Append the new message if provided
      if (newMessage) {
        updatedMessages.push(newMessage);
      }
  
      // Update UI with the updated list of messages
      setMessages(updatedMessages);
  
    } catch (error) {
     // console.error('Error fetching messages:', error);
    }
  }, [ablyClient]);;
  
  

  useEffect(() => {
    if (!isFriendDetailsFetched) return;
    const sortedIds = [userId, friendId].sort().join('-');
    const newChannelName = `figo:figofly-private-chat-${sortedIds}`;
    setChannelName(newChannelName);

    const checkIfChannelExists = async (channelName: string): Promise<boolean> => {
      try {
        const channels = await getAllChannels();
        return channels.some(channel => channel.id === channelName);
      } catch (error) {
        //console.error('Failed to check if channel exists:', error);
        return false;
      }
    };

    const saveChannelNameToSupabase = async (
      channelName: string,
      friendId: any,
      friendAvatar: any,
      friendName: string,
      senderId: any,
      senderName: string,
      senderAvatar: any
    ) => {
      try {
        const { data: existingChannel, error: checkError } = await supabase
          .from('channels')
          .select('*')
          .eq('name', channelName)
          .maybeSingle();

        if (checkError) {
         // console.error('Error checking for existing channel:', checkError);
          return;
        }

        if (existingChannel) return; // Channel already exists

        const { error } = await supabase.from('channels').insert([
          {
            name: channelName,
            friend_id: friendId,
            friend_avatar: friendAvatar,
            friend_name: friendName,
            sender_id: senderId,
            sender_name: senderName,
            sender_avatar: senderAvatar,
          },
        ]);

        if (error) throw error;
        //console.log('Channel details saved to Supabase');
      } catch (error) {
       // console.error('Failed to save channel details to Supabase:', error);
      }
    };

    const createChannel = async () => {
      const exists = await checkIfChannelExists(newChannelName);
      if (!exists) {

        await saveChannel({
          id: newChannelName,
          name: newChannelName,
          friendId,
          friendAvatar,
          friendName,
        });

        await saveChannelNameToSupabase(
          newChannelName,
          friendId,
          friendAvatar,
          friendName,
          userId,
          senderName,
          senderAvatar
        );
      }
    };

    const subscribeToAbly = () => {
      if (!ablyClient) return;
    
      const channel = ablyClient.channels.get(newChannelName);
      channelRef.current = channel;
    
      subscribeToChannel(ablyClient, newChannelName, async (message) => {
        // Check if the message is defined before accessing its properties
        if (!message || !message.data) {
          //console.warn("Received undefined message or message without data:", message);
          return; // Exit early if the message is not valid
        }
    
        try {
          // Ensure message data has valid properties before proceeding
          if (message.data.sender !== userId && message.data.text) {
            await saveMessage(message.data, message.data.id, message.data.status, message.data.channelName);
          }
    
          // Fetch and update the messages in the UI
          fetchMessages(message.data);
        } catch (error) {
          //console.error("Error processing message:", error);
        }
      });
    };
    
    

    createChannel();
    subscribeToAbly();

   
  }, [userId, friendId, ablyClient, friendAvatar, friendName, senderName, senderAvatar, isFriendDetailsFetched, fetchMessages]);

  return { messages, channelRef, channelName, fetchMessages };
};

export default useChatChannel;


  

