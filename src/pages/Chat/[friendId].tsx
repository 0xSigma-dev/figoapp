"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AvatarComponent from '@/components/AvatarComponent';
import ChatButton from '@/components/Chat/Chatbutton';
import ChatInput from '@/components/Chat/ChatInput';
import ChatSkeleton from '@/components/Skeleton/ChatSkeleton';
import WallpaperManager from '@/components/WallpaperManager';
import MessageItem from '@/components/Chat/MessageItem'; 
import { useAbly } from '@/context/AblyContext';
import useChatChannel from '@/hooks/useChatChannel';
import useEnergyManagement from '@/hooks/useEnergyManagement';
import useFetchUserData from '@/hooks/useFetchUserData';
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



const Chat: React.FC = () => {
    const router = useRouter();
    const { friendId } = router.query;
    const friendIdStr = Array.isArray(friendId) ? friendId[0] : friendId;
    const { ablyClient } = useAbly();
    const [messageInput, setMessageInput] = useState<string>('');
    const userId = Cookies.get('userId'); // Replace with actual user ID
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const isCurrentUser = String(friendId) === String(userId);
    const { senderAvatar, senderName, loading: userLoading } = useFetchUserData(userId);
    const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('/img/wallpaper1.jpg');
    const [friendStatus, setFriendStatus] = useState<string>('Away'); // Initialize status
    const [statusColor, setStatusColor] = useState<string>('text-gray-500');
    const [pendingPoints, setPendingPoints] = useState<number>(getPendingPoints(userId));
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null); 
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { avatar, displayName, isUserDetailsFetched } = useFriendDetails(friendId);
    const { messages, channelRef, channelName, fetchMessages } = useChatChannel(userId, friendId, ablyClient, avatar, displayName, senderName, senderAvatar, isUserDetailsFetched);
    const { onType, whoIsCurrentlyTyping: typingUsers, markMessageAsRead } = useTypingStatus(channelRef.current, userId);
    const { currentEnergy, totalEnergy, setCurrentEnergy, resetRefillTimer, startRefill } = useEnergyManagement(userId);
    const isFriendOnline = usePresentStatus(channelRef.current, userId, friendId);
    const { sendMessage, floatingPoints } = useSendMessage(channelRef, userId, currentEnergy, setCurrentEnergy, resetRefillTimer);


    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    
    useEffect(() => {
      if (channelRef.current) {
        fetchMessages(null);  
      }
    }, [channelRef,  fetchMessages ]);
    
    
    const fetchUserChannels = useCallback( async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .ilike('name', `%${userId}%`);
    
        if (error) {
          return [];
        }
        return data;
      } catch (error) {
        return [];
      }
    }, [userId]);
  
    useEffect(() => {
      if (userId) {
        fetchUserChannels(userId).then(channels => {
        });
      }
    }, [userId]);

    channelRef.current?.subscribe('audio', (message) => {
      const audioBase64 = message.data.audio;
      const audioBlob = dataURItoBlob(audioBase64);
      const url = URL.createObjectURL(audioBlob);
      
      // Play or visualize audio
      const audio = new Audio(url);
      audio.play();
    });
    
    const dataURItoBlob = (dataURI: string) => {
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    };
    



  


  const sendRecording = (blob: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64Audio = reader.result as string;
          channelRef.current?.publish('audio', { audio: base64Audio });
      };
      reader.readAsDataURL(blob);
  };


    


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
        setFriendStatus("Present");
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
        <div className="relative flex flex-col min-h-screen max-w-full overflow-x-hidden" >
        

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
          <div className='flex-1 flex flex-col'>
          <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
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
              messages.map((msg, index) => (
                <MessageItem
                  key={index}
                  text={msg.text}
                  sender={msg.sender}
                  timestamp={msg.timestamp}
                  isCurrentUser={msg.sender === userId}
                  status={msg.status || 'unknown'}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          </div>
    
          {/* Sticky Chat Input and Buttons */}
          <div className="sticky bottom-0 p-2 bg-opacity-50 w-full z-10">
            <div className="flex items-center max-w-full">
              <div className="flex-grow flex items-center">
                <ChatInput
                  message={messageInput}
                  ref={inputRef}
                  isRecording={isRecording}
                  onSend={() => sendMessage(messageInput, onType, setMessageInput, inputRef, channelName)}
                  onRecord={handlerecord}
                  onStopRecording={handlerecord}
                  setMessage={setMessageInput}
                  onKeyDown={() => sendMessage(messageInput, onType, setMessageInput, inputRef, channelName)}
                  onType={onType}
                />
              </div>
              <div className="ml-2">
                <ChatButton
                  isRecording={isRecording}
                  message={messageInput}
                  onSend={() => sendMessage(messageInput, onType, setMessageInput, inputRef, channelName)}
                  onRecord={handlerecord}
                />
              </div>
            </div>
          </div>
    
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

