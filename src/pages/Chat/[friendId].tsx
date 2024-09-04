import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Lottie from 'react-lottie-player';
import * as Ably from 'ably';
import Cookies from 'js-cookie';
import ablyService from '@/utils/ablyService';
import ChatButton from '@/components/Chat/Chatbutton';
import ChatInput from '@/components/Chat/ChatInput';
import { getAllChannels, getContactById, getUserData, loadMessages, saveChannel, saveMessage } from '@/utils/indexedDB';
import { supabase } from '@/lib/supabaseClient';
import AvatarComponent from '@/components/AvatarComponent';


const Chat: React.FC = () => {
    const router = useRouter();
    const { friendId } = router.query;
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const userId = Cookies.get('userId'); // Replace with actual user ID
    const ably = useRef<Ably.Realtime | null>(null);
    const channelRef = useRef<Ably.RealtimeChannel | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const isCurrentUser = String(friendId) === String(userId);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [contactExists, setContactExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [channelName, setChannelName] = useState<string>('');
    const [avatar, setAvatar] = useState<any>(null);
    const [displayName, setDisplayName] = useState<any>(null);
    const [senderAvatar, setSenderAvatar] = useState<any>(null);
    const [senderName, setSenderName] = useState<any>(null);
    const [isUserDetailsFetched, setIsUserDetailsFetched] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('/img/wallpaper1.jpg');



    const fetchUserData = async () => {
      try {
        const token = userId;
        const storedData = await getUserData(userId || '');
        if (storedData && storedData.id === userId) {
          setSenderAvatar(storedData.avatar);
          setSenderName(storedData.displayName || []);
        } else {
          const response = await fetch('/api/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const data = await response.json();
          setSenderAvatar(data.user.avatar);
          setSenderName(data.user.displayName || []);
        }
      } catch (error) {
      }
    };


    useEffect(() => {
      if (userId) {
        fetchUserData(); // Fetch user points after fetching user data
      }
    }, [userId]);


    useEffect(() => {
      const fetchFriendDetails = async () => {
        try {
          if (typeof window !== 'undefined' && friendId) {
            const contact = await getContactById(friendId as string);
            if (contact) {
              setAvatar(contact.avatar);
              setDisplayName(contact.displayName);
            } else {
              const token = friendId;
              const response = await fetch(`/api/user/`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
  
              if (!response.ok) {
                throw new Error("Failed to fetch friend details");
              }
  
              const data = await response.json();
              // Update avatar and displayName from API data
              setAvatar(data.user.avatar);
              setDisplayName(data.user.displayName);
             
            }
          }
        } catch (error) {
          console.error("Error fetching friend details:", error);
        } finally {
          setLoading(false);
          setIsUserDetailsFetched(true);
        }
      };
  
      fetchFriendDetails();
    }, [friendId]);
    

    useEffect(() => {
      if (!isUserDetailsFetched || !userId || !friendId) return;
    
      const sortedIds = [userId, friendId].sort().join('-');
      const newChannelName = `figofly-private-chat-${sortedIds}`;
      setChannelName(newChannelName);
    
      const checkIfChannelExists = async (channelName: string): Promise<boolean> => {
        try {
          const channels = await getAllChannels();
          return channels.some(channel => channel.id === channelName);
        } catch (error) {
          console.error('Failed to check if channel exists:', error);
          return false;
        }
      };

      // Function to save the channel name to Supabase
      const saveChannelNameToSupabase = async (
        channelName: string,
        friendId: any,
        friendName: string,
        friendAvatar: string,
        senderId: any,
        senderName: string,
        senderAvatar: string
      ) => {
        try {
          // Check if the channel already exists
          const { data: existingChannel, error: checkError } = await supabase
            .from('channels')
            .select('*')
            .eq('name', channelName)
            .maybeSingle();
      
          if (checkError) {
            console.error('Error checking for existing channel:', checkError);
            return;
          }
      
          // If the channel already exists, do nothing
          if (existingChannel) {
            return;
          }
      
          // Insert new channel if it does not exist
          const { data, error } = await supabase.from('channels').insert([
            {
              name: channelName,
              friend_id: friendId,
              friend_name: friendName,
              friend_avatar: friendAvatar,
              sender_id: senderId,
              sender_name: senderName,
              sender_avatar: senderAvatar,
            },
          ]);
      
          if (error) {
            throw error;
          }
      
          console.log('Channel details saved to Supabase:', data);
        } catch (error) {
          console.error('Failed to save channel details to Supabase:', error);
        }
      };
      
    
      const createChannel = async () => {
        const exists = await checkIfChannelExists(newChannelName);
        if (!exists) {
          const friendAvatar = avatar; // Check if userDetails is null
          const friendName = displayName;
          const senderId = userId;
          const userName = senderName;
          const userAvatar = senderAvatar;
      
          saveChannel({
            id: newChannelName,
            name: newChannelName,
            friendId,
            friendAvatar,
            friendName,
          })
            .then(() => console.log(`Channel ${newChannelName} saved to IndexedDB`))
            .catch(error => console.error('Failed to save channel:', error));
            saveChannelNameToSupabase(newChannelName,friendId, friendName, friendAvatar, senderId, userName, userAvatar);
        } else {
          console.log(`Channel ${newChannelName} already exists.`);
        }
      };
    
      createChannel();
    
      const subscribeToAbly = () => {
        if (ably.current) {
            const channel = ably.current.channels.get(newChannelName);
            channelRef.current = channel;

            channel.subscribe((message) => {
                try {
                    saveMessage(message.data, message.id, newChannelName);
                    fetchMessages(message);
                } catch (error) {
                    console.error('Error handling received message:', error);
                }
            });
        }
    };
    
      subscribeToAbly();
    }, [isUserDetailsFetched,friendId, userId]);
    
    
  
    const sendMessage = async () => {
      if (!messageInput.trim() || !channelRef.current) return;
  
      const message = { text: messageInput, sender: userId };
      
      try {
        await ablyService.publishToChannel(channelRef.current, message);
        setMessageInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    const fetchMessages = async (newMessage: any = null) => {
      if (!channelRef.current) return;
      try {
        // Check if there are messages already in IndexedDB
        const storedMessages = await loadMessages(channelRef.current);
    
        // If no messages are stored, fetch from Ably
        if (storedMessages.length === 0) {
          const fetchedMessages = await ablyService.fetchChannelHistory(channelRef.current);
          if (fetchedMessages.length > 0) {
            // Save fetched messages to IndexedDB
            for (const msg of fetchedMessages) {
              await saveMessage(msg.data, msg.id, channelRef.current);
            }
            setMessages(fetchedMessages);
          } else {
            setMessages(storedMessages);
          }
        } else {
          // If there's a new message, add it to the list of stored messages
          const updatedMessages = newMessage ? [...storedMessages, newMessage] : storedMessages;
          setMessages(updatedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Use effect to fetch messages when the component mounts or channelRef changes
    useEffect(() => {
      fetchMessages(); // Load old messages initially
    }, [channelRef.current]);
    
    
    const fetchUserChannels = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .ilike('name', `%${userId}%`); // Use ilike for case-insensitive pattern matching
    
        if (error) {
          console.error('Error fetching channels from Supabase:', error);
          return [];
        }
    
        console.log('Fetched channels:', data);
        return data;
      } catch (error) {
        console.error('Unexpected error fetching channels:', error);
        return [];
      }
    };
  
    useEffect(() => {
      if (userId) {
        fetchUserChannels(userId).then(channels => {
          console.log('User channels:', channels);
        });
      }
    }, [userId]);
    
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
    };




    const startRecording = () => {
        setIsRecording(true);
        // Add your recording logic here
      };
    
      const stopRecording = () => {
        setIsRecording(false);
        // Add your logic to send the recorded audio message here
      };

      return (
        <div className="flex flex-col bg-black h-screen max-w-full overflow-x-hidden">
          <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1, // Make sure the background is behind all other elements
        }}
      />
          <div className="flex items-center p-4 border-b bg-gray-800 text-white">
            <FontAwesomeIcon
              icon={faArrowLeft}
              onClick={() => router.back()}
              className="text-xl cursor-pointer"
            />
            <div className="flex-1 text-center">Chat</div>
            <AvatarComponent avatarId={avatar} width={70} height={70} /> 
          </div>
      
          <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">No messages</div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === userId ? 'justify-end' : 'justify-start'
                  } mb-2`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      msg.sender === userId
                        ? 'bg-purple-800 text-white'
                        : 'bg-gray-800 text-white'
                    } max-w-xs relative`}
                  >
                    {msg.text}
                    <span className="text-xs text-gray-400 ml-4 justify-end bottom-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
      
          {/* Adjust the bottom input section */}
          <div className="p-2 border-t flex items-center max-w-full bg-black">
            <div className="flex-grow flex  items-center">
              <ChatInput
                message={messageInput}
                isRecording={isRecording}
                onSend={sendMessage}
                onRecord={startRecording}
                onStopRecording={stopRecording}
                setMessage={setMessageInput}
              />
            </div>
      
            <div className="ml-2">
              <ChatButton
                isRecording={isRecording}
                message={messageInput}
                onSend={sendMessage}
                onRecord={startRecording}
              />
            </div>
          </div>
        </div>
      );
      
};

export default Chat;

