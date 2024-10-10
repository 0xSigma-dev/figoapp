"use client"

import React, { useEffect, useRef, useState, } from 'react';
import AvatarComponent from '@/components/AvatarComponent';
import ChatButton from '@/components/Chat/Chatbutton';
import ChatInput from '@/components/Chat/ChatInput';
import ChatSkeleton from '@/components/Skeleton/ChatSkeleton';
import WallpaperManager from '@/components/WallpaperManager';
import MessageItem from '@/components/Chat/MessageItem'; 
import useEnergyManagement from '@/hooks/useEnergyManagement';
import useFriendDetails from '@/hooks/useFriendDetails';
import useTypingStatus from "@/hooks/useTypingStatus";
import { supabase } from '@/lib/supabaseClient';
import { getPendingPoints } from '@/utils/pendingPoints';
import { faArrowLeft, faBan, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import WalletGuard from '../../components/WalletGuard';
import usePresentStatus from "@/hooks/usePresentStatus";
import WaveSurfer from 'wavesurfer.js';
import useSendMessage from '@/hooks/useSendMessage';

const generateChannelId = (userId: any, friendId: any) => {
  
  const sortedIds = [userId, friendId].sort();
  
  return sortedIds.join('-');
};

const Chat: React.FC = () => {
    const router = useRouter();
    const { friendId } = router.query;
    const friendIdStr = Array.isArray(friendId) ? friendId[0] : friendId;
    const [messageInput, setMessageInput] = useState<string>('');
    const userId = Cookies.get('userId'); // Replace with actual user ID
    const channelId = generateChannelId(userId, friendIdStr);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const isCurrentUser = String(friendId) === String(userId);
    const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [backgroundImage, setBackgroundImage] = useState('/img/wallpaper1.jpg');
    const [friendStatus, setFriendStatus] = useState<string>('Away'); // Initialize status
    const [statusColor, setStatusColor] = useState<string>('text-gray-500');
    const [pendingPoints, setPendingPoints] = useState<number>(getPendingPoints(userId));
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null); 
    const { avatar, displayName, isUserDetailsFetched } = useFriendDetails(friendId);
    const [messagesFetched, setMessagesFetched] = useState(false);
    const { onType, whoIsCurrentlyTyping: typingUsers } = useTypingStatus(channelId, userId);
    const { currentEnergy, totalEnergy, setCurrentEnergy, resetRefillTimer, startRefill } = useEnergyManagement(userId);
    const isFriendOnline = usePresentStatus(friendId);
    const [messages, setMessages] = useState<any[]>([]); // Assuming messages are objects
    const { sendMessage, floatingPoints } = useSendMessage(channelId,  userId, friendId, currentEnergy, setCurrentEnergy, resetRefillTimer, setMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLastMessageVisible, setIsLastMessageVisible] = useState(false);
    

    

    useEffect(() => {
      if (typeof window !== 'undefined') { // Ensure this code only runs on the client
        setViewportHeight(window.innerHeight);
    
        const handleResize = () => {
          setViewportHeight(window.innerHeight);
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }
    }, []);


    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    
    useEffect(() => {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channelId);
  
        if (data) {
          setMessages(data);
        }
  
        if (error) {
          //console.error('Error fetching messages:', error);
        }
      };
  
      if (friendId) {
        fetchMessages();
      }
    }, [friendId]);


    useEffect(() => {
      const channel = supabase
        .channel(`realtime-messages-${channelId}`)
        
        // Listen for new messages (INSERT)
        .on(
          'postgres_changes', 
          {
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages', 
            filter: `channel_id=eq.${channelId}`
          }, 
          (payload) => {
            const newMessage = payload.new;
            //console.log('New message:', newMessage);
    
            if (isFriendOnline && newMessage.sender_id === userId && newMessage.status === 'sent') {
              supabase
                .from('messages')
                .update({ status: 'delivered' })
                .eq('id', newMessage.id)
            }
    
            // Add the new message to the local state
            setMessages((prevMessages: any) => [...prevMessages, newMessage]);
          }
        )
        
        // Listen for message updates (UPDATE)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE', 
            schema: 'public', 
            table: 'messages', 
            filter: `channel_id=eq.${channelId}`
          },
          (payload) => {
            const updatedMessage = payload.new;
            //console.log('Updated message:', updatedMessage);
    
            // Update the local message state
            setMessages((prevMessages: any) =>
              prevMessages.map((msg: any) => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
        )
    
        .subscribe();
    
      // Cleanup on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }, [channelId, setMessages]);
    
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        async ([entry]) => {
          setIsLastMessageVisible(entry.isIntersecting);
          
          // Check if the last message is visible and if the sender is not the current user
          if (entry.isIntersecting && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
    
            if (lastMessage.sender_id !== userId && lastMessage.status !== 'seen') {
              try {
                // Update message status to 'seen' in Supabase
                const { error } = await supabase
                  .from('messages')
                  .update({ status: 'seen' })
                  .eq('id', lastMessage.id);
    
                if (error) {
                  //console.error('Error updating message status:', error);
                } else {
                  //console.log('Message marked as seen');
                }
              } catch (err) {
                //console.error('Error:', err);
              }
            }
          }
        },
        {
          root: document.querySelector('#messages'), // The scrollable message container
          threshold: 0.1, // Trigger when at least 10% of the message is visible
        }
      );
    
      if (messagesEndRef.current) {
        observer.observe(messagesEndRef.current);
      }
    
      // Cleanup observer on component unmount
      return () => {
        if (messagesEndRef.current) {
          observer.unobserve(messagesEndRef.current);
        }
      };
    }, [messages, userId]);

      const handleMenuClick = () => {
        setShowMenu(!showMenu);
      };
      const handleProfileClick = () => {
        setShowMenu(false);
        router.push(`/profile/${friendId}`);
      };
    
      

      function handleOpenWarning(event: React.MouseEvent<HTMLButtonElement>): void {
        throw new Error('Function not implemented.');
    }

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const isClickInsideMenu = menuRef.current?.contains(event.target as Node); 
        if (!isClickInsideMenu) {
          setShowMenu(false);
        }
      };
    
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const openWallpaperModal = () => {
      setIsWallpaperModalOpen(true);
    };

    useEffect(() => {
     
      if (isFriendOnline) {
        setFriendStatus("Online");
        setStatusColor("text-green-500");
      } else {
        setFriendStatus("Away");
        setStatusColor("text-gray-500");
      }
    }, [isFriendOnline]);

    useEffect(() => {
      if ('virtualKeyboard' in navigator) {
        (navigator as any).virtualKeyboard.overlaysContent = true;
      }
    }, []);
    

    if (loading) {
      return <ChatSkeleton />
    }

    if (!friendIdStr) {
      return <div>Error: No friend ID specified.</div>;
    }
    
  
  function handlerecord(): void {
    throw new Error('Function not implemented.');
  }

  
  


  
  

    return (
      <WalletGuard>
        <div className="relative flex flex-col  max-w-full overflow-x-hidden" style={{ height: viewportHeight }}>
        

          {/* Background image */}
          <div
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: -1,
            }}
          />
          
          {/* Sticky Header */}
          <header className="sticky top-0 left-0 right-0 bg-black text-white z-20 p-2 flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <FontAwesomeIcon
      icon={faArrowLeft}
      onClick={() => router.back()}
      className="text-xl cursor-pointer"
    />
    <div className="flex items-center space-x-1">
      <AvatarComponent avatarId={avatar} width={50} height={50} />
      <div className="ml-2 hover:bg-gray-700" onClick={handleProfileClick}>
        <h2 className="text-white font-bold">{displayName || 'User'}</h2>
        <p className={`${statusColor} text-sm`}>
          {typingUsers.includes(friendIdStr) ? 'typing...' : friendStatus || 'Away'}
        </p>
      </div>
    </div>
  </div>

  <div className="flex items-center space-x-4">
    <div className="text-white font-semibold">{pendingPoints}</div>
    <div className="relative">
      <FontAwesomeIcon
        icon={faEllipsisV}
        className="text-xl cursor-pointer mr-4"
        onClick={handleMenuClick}
      />
      {showMenu && (
        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-2">
          <button
            onClick={handleProfileClick}
            className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
          >
            View Profile
          </button>
          <button
            onClick={handleOpenWarning}
            className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
          >
            Backup OnChain
          </button>
          <button
            onClick={openWallpaperModal}
            className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
          >
            Wallpaper
          </button>
          <button
            onClick={handleOpenWarning}
            className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
          >
            Clear Chat
          </button>
          <button
            onClick={handleOpenWarning}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faBan} className="text-red-600 mr-2" />
            Block
          </button>
        </div>
      )}
    </div>
  </div>
</header>

    
          {/* Scrollable message area */}
          <div id="messages"  className='flex-1 flex overflow-y-scroll mt-16 mb-16 flex-col'>
          <div className="flex-1 p-4 overflow-x-hidden">
            {messages.length === 0 ? (
              <div className="flex-grow mt-20 flex items-center justify-center overflow-x-hidden">
                <div className="flex flex-col items-center justify-center bg-black w-40 rounded-lg p-6">
                  <div className="mb-4">
                    <AvatarComponent avatarId={avatar} width={80} height={80} />
                  </div>
                  <p className="text-white font-mono text-xs">
                    Hi, Happy to meet you. Let&apos;s talk!
                  </p>
                </div>
              </div>
            ) :  (
              messages.map((msg: any, index: any) => (
                <MessageItem
                  key={index}
                  content={msg.content}
                  sender_id={msg.sender_id}
                  created_at={msg.created_at}
                  isCurrentUser={msg.sender_id === userId}
                  status={msg.status || 'unknown'}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          </div>
    
          {/* Sticky Chat Input and Buttons */}
          <footer className="fixed chat-input-container bottom-0 left-0 right-0 p-4 flex w-full z-10 mt-6 mb-2 items-center space-x-6">
              <div className="flex-grow  flex items-center">
                <ChatInput
                  message={messageInput}
                  ref={inputRef}
                  isRecording={isRecording}
                  onSend={() => sendMessage(messageInput, onType, setMessageInput, inputRef)}
                  onRecord={handlerecord}
                  onStopRecording={handlerecord}
                  setMessage={setMessageInput}
                  onKeyDown={() => sendMessage(messageInput, onType, setMessageInput, inputRef)}
                  onType={onType}
                />
              </div>
              <div className="ml-2">
                <ChatButton
                  isRecording={isRecording}
                  message={messageInput}
                  onSend={() => sendMessage(messageInput, onType, setMessageInput, inputRef,)}
                  onRecord={handlerecord}
                />
              </div>
          
          </footer>
    
          <WallpaperManager
             backgroundImage={backgroundImage}
             setBackgroundImage={setBackgroundImage}
             openWallpaperModal={openWallpaperModal}
          />
        </div>
      </WalletGuard>
    );
    
      
};

export default Chat;

