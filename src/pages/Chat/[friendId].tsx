import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import * as Ably from 'ably';
import Cookies from 'js-cookie';
import ablyService from '@/utils/ablyService';
import ChatButton from '@/components/Chat/Chatbutton';
import ChatInput from '@/components/Chat/ChatInput';
import { getAllChannels, getContactById, getUserData, loadMessages, saveChannel, saveMessage } from '@/utils/indexedDB';
import { supabase } from '@/lib/supabaseClient';
import AvatarComponent from '@/components/AvatarComponent';
import WallpaperModal from '@/components/WallpaperModal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { addPendingPoints, removePendingPoints, getPendingPoints } from '@/utils/pendingPoints';
import { autoRefillEnergy, saveCurrentEnergy } from '@/utils/energyManager'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FloatingPointsAnimation from '../../components/FloatingPointsAnimation';
import WalletGuard from '../../components/WalletGuard';



const Chat: React.FC = () => {
    const router = useRouter();
    const { friendId } = router.query;
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const userId = Cookies.get('userId'); // Replace with actual user ID
    const channelRef = useRef<Ably.RealtimeChannel | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const isCurrentUser = String(friendId) === String(userId);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [contactExists, setContactExists] = useState(false);
    const [channelName, setChannelName] = useState<string>('');
    const [avatar, setAvatar] = useState<any>(null);
    const [displayName, setDisplayName] = useState<any>(null);
    const [senderAvatar, setSenderAvatar] = useState<any>(null);
    const [senderName, setSenderName] = useState<any>(null);
    const [isUserDetailsFetched, setIsUserDetailsFetched] = useState(false);
    const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('/img/wallpaper1.jpg');
    const [friendStatus, setFriendStatus] = useState<string>('Away'); // Initialize status
    const [statusColor, setStatusColor] = useState<string>('text-gray-500');
    const [pendingPoints, setPendingPoints] = useState<number>(getPendingPoints(userId));
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [currentEnergy, setCurrentEnergy] = useState<number>(0);
    const [totalEnergy, setTotalEnergy] = useState<number>(500);
    const resetRefillTimer = useRef<(() => void) | null>(null);
    const startRefill = useRef<(() => void) | null>(null);
    const [floatingPoints, setFloatingPoints] = useState<{ points: number; x: number; y: number } | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    };

    useEffect(() => {
      // Scroll to the bottom when messages change
      scrollToBottom();
    }, [messages]);

    useEffect(() => {
      const savedWallpaper = localStorage.getItem('chatWallpaper');
      if (savedWallpaper) {
        setBackgroundImage(savedWallpaper);
      }
    }, []);
  
    const openWallpaperModal = () => {
      setShowMenu(false);
      setIsWallpaperModalOpen(true);
    };
  
    const closeWallpaperModal = () => {
      setIsWallpaperModalOpen(false);
    };
  
    const saveWallpaper = (selectedWallpaper: any) => {
      setBackgroundImage(selectedWallpaper);
    };



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

    const handleAddPoints = () => {
      addPendingPoints(userId, 10);
      setPendingPoints(getPendingPoints(userId)); // Update state
    };

    useEffect(() => {
      const initEnergy = async () => {
        // Fetch the user's current energy from IndexedDB
        const userData = await getUserData(userId);
        setCurrentEnergy(userData?.currentEnergy || 0);
        setTotalEnergy(userData?.totalEnergy || 500);
  
        // Initialize the auto refill system
        const refillManager = await autoRefillEnergy(userId, totalEnergy);
        
        // Assign functions to refs
        resetRefillTimer.current = refillManager.resetRefillTimer;
        startRefill.current = refillManager.startRefill;
      };
  
      initEnergy();
    }, [userId, totalEnergy]);


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
              setAvatar(data.user.avatar);
              setDisplayName(data.user.displayName);
             
            }
          }
        } catch (error) {
          //console.error("Error fetching friend details:", error);
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
          //console.error('Failed to check if channel exists:', error);
          return false;
        }
      };
    
      const saveChannelNameToSupabase = async (
        channelName: string,
        friendId: any,
        friendName: string,
        friendAvatar: any,
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
            //console.error('Error checking for existing channel:', checkError);
            return;
          }
    
          if (existingChannel) return; // Channel already exists
    
          const { error } = await supabase.from('channels').insert([
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
    
          if (error) throw error;
          //console.log('Channel details saved to Supabase');
        } catch (error) {
          //console.error('Failed to save channel details to Supabase:', error);
        }
      };
    
      const createChannel = async () => {
        const exists = await checkIfChannelExists(newChannelName);
        if (!exists) {
          const friendAvatar = avatar || '';
          const friendName = displayName || '';
    
          try {
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
              friendName,
              friendAvatar,
              userId,
              senderName,
              senderAvatar
            );
          } catch (error) {
          }
        } else {
        }
      };
    
      const subscribeToAbly = () => {
        const ablyClient = ablyService.getClient();
        if (!ablyClient) {
          //console.log('Ably is not initialized');
          return;
        }
          
        //console.log('Subscribing to channel:', channelName);
        const channel = ablyClient.channels.get(newChannelName);
        channelRef.current = channel;
    
        channel.subscribe((message) => {
          try {
            saveMessage(message.data, message.id, newChannelName);
            fetchMessages(message);
          } catch (error) {
          }
        });
      };
    
      createChannel();
      subscribeToAbly();
    
      return () => {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current.presence.unsubscribe();
        }
      };
    }, [isUserDetailsFetched, userId, friendId]);
    
    
    
  
    const sendMessage = async () => {
      if (!messageInput.trim() || !channelRef.current) return;
    
      const pointsToAdd = 20; // Points added to pendingPoints
    
      try {
        const message = { text: messageInput, sender: userId };
        await ablyService.publishToChannel(channelRef.current.name, message);
        
        // Check if currentEnergy is sufficient before adding points
        if (currentEnergy >= pointsToAdd) {
          const updatedEnergy = Math.max(currentEnergy - pointsToAdd, 0); // Ensure energy doesn't go below 0
          
          setFloatingPoints({ points: pointsToAdd, x: 300, y: 500 });
  
            setTimeout(() => {
              setFloatingPoints(null);
            }, 1000);
          addPendingPoints(userId, pointsToAdd);
          setPendingPoints(getPendingPoints(userId));
    
          setCurrentEnergy(updatedEnergy);
          await saveCurrentEnergy(userId, updatedEnergy); // Save updated currentEnergy to IndexedDB
        } else {
          toast.warn('Not enough energy to add points!', {
            position: "bottom-right",
            autoClose: 3000, // Toast will automatically close in 3 seconds
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
    
        setMessageInput('');
        inputRef.current?.focus();
        resetRefillTimer.current && resetRefillTimer.current(); // Reset refill timer after sending message
      } catch (error) {
      }
    };
    
    

    const fetchMessages = async (newMessage: any = null) => {
      if (!channelRef.current) return;
      try {
        // Check if there are messages already in IndexedDB
        const storedMessages = await loadMessages(channelRef.current.name);
        //console.log('channelref',channelRef.current)
    
        // If no messages are stored, fetch from Ably
        if (storedMessages.length === 0) {
          const fetchedMessages = await ablyService.fetchChannelHistory(channelRef.current.name);
          if (fetchedMessages.length > 0) {
            // Save fetched messages to IndexedDB
            for (const msg of fetchedMessages) {
              await saveMessage(msg.data, msg.id, channelRef.current.name);
            }
            setMessages(fetchedMessages);
          } else {
            setMessages(storedMessages);
          }
        } else {
          // If there's a new message, add it to the list of stored messages
          const updatedMessages = newMessage ? [...storedMessages, newMessage] : storedMessages;
          setMessages(updatedMessages);
          scrollToBottom();
          inputRef.current?.focus();
        }
      } catch (error) {
        //console.error('Error loading messages:', error);
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
          //console.error('Error fetching channels from Supabase:', error);
          return [];
        }
    
        //console.log('Fetched channels:', data);
        return data;
      } catch (error) {
        //console.error('Unexpected error fetching channels:', error);
        return [];
      }
    };
  
    useEffect(() => {
      if (userId) {
        fetchUserChannels(userId).then(channels => {
          //console.log('User channels:', channels);
        });
      }
    }, [userId]);
    
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    };

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


      const handleMenuClick = () => {
        setShowMenu(!showMenu);
      };
      const handleProfileClick = () => {
        setShowMenu(false);
        router.push(`/profile/${friendId}`);
      };
    
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

      function handleOpenWarning(event: React.MouseEvent<HTMLButtonElement>): void {
        throw new Error('Function not implemented.');
    }

      return (
        <WalletGuard>
        <div className="flex flex-col h-screen max-w-full overflow-x-hidden overflow-y-hidden">
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
        <div className="flex left-0 right-0 top-0 items-center p-1 bg-black text-white z-10">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faArrowLeft}
              onClick={() => router.back()}
              className="text-xl cursor-pointer"
            />
            <div className="flex items-center space-x-1">
            {loading ? (
                <Skeleton circle={true} height={50} width={50} />
            ) : (
            <AvatarComponent avatarId={avatar} width={60} height={60} /> )}
             {loading ? (
                <Skeleton width={150} height={25} />
            ) : (
            <div className='mr-2 hover:bg-gray-700' onClick={handleProfileClick}>
           
              <h2 className="text-white font-bold">{displayName || 'User'}</h2>
              <p className={`${statusColor} text-sm`}>{friendStatus || ''}</p> 
            </div>
            )}
          </div> 
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <div className="text-white font-semibold mr-3">{pendingPoints}</div>
            <div className="relative" ref={menuRef}>
          <div className="cursor-pointer mr-6 text-black dark:text-white" onClick={handleMenuClick}>
            <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize: '24px'}} />
          </div>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-2 z-20">
              <button
                onClick={handleProfileClick}
                className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
              >
              <span>View Profile</span>
              </button>
              <button
                onClick={handleOpenWarning}
                className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
              >
              <span>Backup OnChain</span>
              </button>
              <button
                onClick={openWallpaperModal}
                className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
              >
              <span>Wallpaper</span>
              </button>
             
              <button
                onClick={handleOpenWarning}
                className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700"
              >
              <span>Clear Chat</span>
              </button>
              <button
                onClick={handleOpenWarning}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
              <FontAwesomeIcon icon={faBan} className="text-red-600 mr-2" style={{ fontSize: "24px" }} />
              <span className="text-red-600">Block</span>
              </button>
              
            </div>
          )}
        </div>
        </div>
        </div>

        {loading ? (
                    <div>
                        <Skeleton count={10} height={40} style={{ marginBottom: '10px' }} />
                    </div>
                ) : (
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex-grow mt-20 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center bg-black w-40 rounded-lg p-6">
                <div className="mb-4"><AvatarComponent avatarId={avatar} width={80} height={80} /></div>
                <p className="text-white font-mono text-xs">Hi, Happy to meet you. Let&apos;s talk!</p>
              </div>
            </div>
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
            <div ref={messagesEndRef} />
          </div>
                )}




{floatingPoints && (
        <FloatingPointsAnimation 
          points={floatingPoints.points} 
          x={floatingPoints.x} 
          y={floatingPoints.y} 
        />
      )}
      
          {/* Adjust the bottom input section */}
          <div className="p-2 flex items-center max-w-full">
            <div className="flex-grow flex  items-center">
              <ChatInput
                message={messageInput}
                ref={inputRef} 
                isRecording={isRecording}
                onSend={sendMessage}
                onRecord={startRecording}
                onStopRecording={stopRecording}
                setMessage={setMessageInput}
                onKeyDown={sendMessage}
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
          <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={closeWallpaperModal}
        onSave={saveWallpaper}
      />
        </div>
        </WalletGuard>
      );
      
};

export default Chat;

