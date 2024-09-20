import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { subscribeToChannel, fetchChannelHistory } from '@/utils/ablyService';
import { getAllChannels, saveChannel, saveMessage, loadMessages } from '@/utils/indexedDB';
import * as Ably from 'ably';

const useChatChannel = (userId: any, friendId: any, ablyClient: any, friendAvatar: any, friendName: any, senderName: any, senderAvatar: any, isFriendDetailsFetched: boolean, messagesFetched: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [channelName, setChannelName] = useState<string>(''); // Track if messages have been fetched
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  const fetchMessages = async () => {
    console.log("Fetching messages...");
    if (!channelRef.current || !ablyClient) return;
    
    try {
      const fetchedMessages = await fetchChannelHistory(ablyClient, channelRef.current.name);
      
      // Extract the relevant data from each fetched message
      const formattedMessages = fetchedMessages.map((message: any) => {
        const { text, sender, timestamp, status } = message.data;
        return { text, sender, timestamp, status };
      });
      
      setMessages(formattedMessages.reverse());
    } catch (error) {
      
    }
  };
  

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

        if (checkError) return;

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
      } catch (error) {}
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

      channel.on('error', (error: any) => {
        console.error('Ably Channel Error:', error);
        // You can set some state here to notify the user or retry the connection
      });

      subscribeToChannel(ablyClient, newChannelName, async (message) => {
        if (!message) return;

        console.log('message from use chat', message)

        try {
          if (message.data.sender !== userId && message.data.text) {
            
            setMessages((prevMessages: any) => {
              ///console.log("Previous messages:", prevMessages);  // Logs the previous messages
              return [...prevMessages, message.data];  // Updates the state with the new message
            });
            await saveMessage(message.data, message.data.id, message.data.status, message.data.channelName);
            
          }
        } catch (error) {}
      });
    };

    const setupChannel = async () => {
      await createChannel();
      subscribeToAbly();
    };

    setupChannel();
  }, [userId, friendId, ablyClient, friendAvatar, friendName, senderName, senderAvatar, isFriendDetailsFetched]);

  return { messages, channelRef, channelName, fetchMessages, setMessages };
};

export default useChatChannel;



{/* import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { subscribeToChannel, fetchChannelHistory } from '@/utils/ablyService';
import { getAllChannels, saveChannel, saveMessage, loadMessages } from '@/utils/indexedDB';
import * as Ably from 'ably';

const useChatChannel = (userId: any, friendId: any, ablyClient: any, friendAvatar: any, friendName: any, senderName: any, senderAvatar: any, isFriendDetailsFetched: boolean, messagesFetched: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [channelName, setChannelName] = useState<string>(''); // Track if messages have been fetched
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  const fetchMessages = async (newMessage: any) => {
    console.log("Fetching messages...");
  if (!channelRef.current || !ablyClient) return;
  
    try {
      // Load stored messages from IndexedDB
      //const storedMessages = await loadMessages(channelRef.current.name);
  
      // Fetch messages from history
      const fetchedMessages = await fetchChannelHistory(ablyClient, channelRef.current.name);
  
      // Create a Set of IDs for quick lookup
      //const storedMessageIds = new Set(storedMessages.map(msg => msg.id));
  
      // Filter out new messages from the fetched ones that are not in IndexedDB
      //const newMessages = fetchedMessages.filter(message => !storedMessageIds.has(message.data.id));
  
      // Save new messages to IndexedDB
      //if (newMessages.length > 0) {
       // for (const message of newMessages) {
          //await saveMessage(message.data, message.data.id, 'delivered', message.data.channelName);
        //}
     // }
  
      // Combine stored messages and new messages, removing duplicates
      //const combinedMessages = [
      //  ...storedMessages,
       // ...newMessages.filter(msg => !storedMessageIds.has(msg.id)), // Ensure no duplicates
     // ];
  
      // Append the new message if provided and not already in combinedMessages
      //if (newMessage && !combinedMessages.some(msg => msg.id === newMessage.id)) {
       // combinedMessages.push(newMessage);
     // }
  
      // Update UI with the updated list of messages
      setMessages(fetchedMessages);

  
    } catch (error) {
      // console.error('Error fetching messages:', error);
    }
  };

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

        if (checkError) return;

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
      } catch (error) {}
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

      channel.on('error', (error: any) => {
        console.error('Ably Channel Error:', error);
        // You can set some state here to notify the user or retry the connection
      });

      subscribeToChannel(ablyClient, newChannelName, async (message) => {
        if (!message || !message.data) return;

        try {
          if (message.data.sender !== userId && message.data.text) {
            await saveMessage(message.data, message.data.id, message.data.status, message.data.channelName);
            setMessages((prevMessages) => [...prevMessages, message.data]);
          }

          // Fetch and update the messages in the UI only if they haven't been fetched yet
          //if (messagesFetched) {
            //setMessages((prevMessages) => [...prevMessages, message.data]); // Append new message
          //} else {
            //fetchMessages(message.data); // Fetch messages if not yet fetched
          //}
        } catch (error) {}
      });
    };

    const setupChannel = async () => {
      await createChannel();
      subscribeToAbly();
    };

    setupChannel();
  }, [userId, friendId, ablyClient, friendAvatar, friendName, senderName, senderAvatar, isFriendDetailsFetched, messagesFetched]);

  return { messages, channelRef, channelName, fetchMessages, setMessages };
};

export default useChatChannel;*/}  

