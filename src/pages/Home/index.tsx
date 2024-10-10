"use client"
import React, { useEffect, useState, } from 'react';
import { useRouter } from 'next/router';
import AOS from 'aos';
import 'aos/dist/aos.css';
import EnergyProgressBar from '../../components/EnergyProgressBar';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import PurpleIcon from '../../components/PurpleIcon';
//import WelcomeModal from '../../components/WelcomeModal';
import useUserPoints from '../../hooks/useUserPoints';
import { useUser } from '../../context/UserContext';
import Cookies from 'js-cookie';
import WalletGuard from '../../components/WalletGuard';
import ContactPage from '@/components/ContactPage';
import { saveUserData, getAllChannels, subscribeToNewMessages , countMessagesByChannelAndSender, updateUserDataFields, deleteChannel } from '../../utils/indexedDB';
import PointsDisplay from '../../components/PointsDisplay';
import AvatarComponent from '../../components/AvatarComponent';
import UserDetailsCard from '../../components/UserDetailsCard';
import { supabase } from '@/lib/supabaseClient';
import Confetti from 'react-confetti';
import ChannelItem from '@/components/ChannelItem';
import { useUserStatus } from '@/context/UserStatusContext';
import { format, isBefore, subDays } from 'date-fns';




interface HomePageProps {
  theme: 'light' | 'dark';
}

interface Channel {
  id: string;
  // add any other properties that a channel might have
}

interface LatestMessage {
  
  content: string; // Or Date, depending on how you handle it
}



const HomePage: React.FC<HomePageProps> = ({ theme }) => {
  const [menu, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { points, fetchUserPoints } = useUserPoints();
  const [isUserDataStale, setIsUserDataStale] = useState<boolean>(false);
  const [showContactPage, setShowContactPage] = useState(false);
  const [friends, setFriends] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [clickedConversationId, setClickedConversationId] = useState<string | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [latestMessages, setLatestMessages] = useState<{ [key: string]: any }>({});
  const [pendingPoints, setPendingPoints] = useState<any>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const { setUserId } = useUserStatus();
  const userId = Cookies.get('userId');
  const [isClaiming, setIsClaiming] = useState(false);
  const [messageCounts, setMessageCounts] = useState<{ [key: string]: number }>({});


  useEffect(() => {
     // Get userId from cookies or wherever you store it
    if (userId) {
      setUserId(userId); // Set userId when available (after login or wallet connection)
    }
  }, [setUserId]);

 

  const startConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false); // Stop confetti after 5 seconds
    }, 10000);
  };


  

  
  
  const router = useRouter();
  
  const { user, setUser } = useUser();
  

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const storedPendingPoints = localStorage.getItem('pendingPoints');
    if (storedPendingPoints) {
      const parsedData = JSON.parse(storedPendingPoints);
      if (parsedData && parsedData.userId === userId) {
        setPendingPoints(parsedData.points);
      } else {
        // If data exists for a different user, reset it for this user
        const newPendingPoints = { userId, points: 0 };
        localStorage.setItem('pendingPoints', JSON.stringify(newPendingPoints));
        setPendingPoints(0);
      }
    } else {
      // If no pending points exist at all, initialize it
      const newPendingPoints = { userId, points: 0 };
      localStorage.setItem('pendingPoints', JSON.stringify(newPendingPoints));
      setPendingPoints(0);
    }
  }, [userId]);

  // Save pending points to localStorage
  const savePendingPointsToLocalStorage = (points: number) => {
    const newPendingPoints = { userId, points };
    localStorage.setItem('pendingPoints', JSON.stringify(newPendingPoints));
  };

  // Handle point changes and save to localStorage
  const handlePointChange = (newPoints: number) => {
    setPendingPoints(newPoints);
    savePendingPointsToLocalStorage(newPoints);
  };


  useEffect(() => {
    setIsUserDataStale(true);
  }, [user]);
  

  const fetchUserData = async () => {
    try {
      const token = userId;
      if (!token) {
        throw new Error('User ID not found.');
      }
  
      // Fetch user data from the API directly
      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
  
      const data = await response.json();
      setUser(data.user); // Set user data in the state
  
      // Optionally save user data locally for later use if needed
      await saveUserData({ id: userId, ...data.user });
  
      // Fetch user points if needed
      fetchUserPoints(token);
  
    } catch (error) {
      //console.error('Error fetching user data:', error);
      //setErrorMessage('Error fetching user data. Please try again.');
    }
  };
  
  
  

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserPoints(userId);
    }
  }, [userId]);
  
  

  


  const handleCloseMenus = () => {
    setMenuOpen(false);
    setShowDrawer(false);
  };

  const  handleToggleContactPage = () => {
    setShowContactPage(!showContactPage); // Toggle ContactPage visibility
  };


  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (router.pathname !== url) {
        return false;
      }
      return true;
    };
    router.beforePopState(({ url }) => handleRouteChange(url));
    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);
  const loadingClass = loading ? 'blurred-blink' : '';
  const renderFriendAvatar = (avatarId: any) => {
    const numericAvatarId = Number(avatarId);
  
    return (
      <AvatarComponent
        avatarId={numericAvatarId}
        width={70}
        height={70}
      />
    );
  };
  

  
    const handleClaimPoints = async () => {
      if (!userId || !user || isClaiming) return; // Prevent function from running if already claiming
  
      setIsClaiming(true); // Lock function from being called again
  
      try {
        // Reset pending points in localStorage
        const newTotalPoints = (user.points || 0) + pendingPoints;
        
        // Update points in IndexedDB
        await updateUserDataFields(userId, { points: newTotalPoints });
        startConfetti();
        
        const messageSound = new Audio('/sounds/clapping.wav');
        messageSound.play();
  
        // Update points in Supabase
        const { error } = await supabase
          .from('users')
          .update({ points: newTotalPoints })
          .eq('id', userId);
  
        if (error) {
          throw new Error('Error updating points in Supabase: ' + error.message);
        }
  
        // Update localStorage and user state
        localStorage.setItem('pendingPoints', JSON.stringify({ userId, points: 0 }));
        setPendingPoints(0);
  
        setUser({
          ...user,
          points: newTotalPoints,
        });
  
        fetchUserPoints(userId);
      } catch (error) {
        //console.error('Error claiming points:', error);
      } finally {
        setIsClaiming(false); // Unlock the function after the process is completed
      }
    };


    
    
  
    // Function to format the timestamp
    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - date.getTime(); // Difference in milliseconds
  
      const seconds = Math.floor(timeDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
  
      if (days >= 30) {
          return `${months} month${months > 1 ? 's' : ''} ago`;
      } else if (days >= 2) {
          return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (days === 1) {
          return 'yesterday';
      } else if (hours >= 1) {
          return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (minutes >= 1) {
          return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else {
          return 'just now';
      }
  };
  
  



  const handleDeleteConversation = async (channelId: string) => {
    try {
      await deleteChannel(channelId); 
      setChannels((prevChannels) => prevChannels.filter((channel) => channel.id !== channelId)); 
    } catch (error) {
      
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchChannelsAndMessages = async () => {
      const fetchedChannels = await getAllChannels(userId);
      setChannels(fetchedChannels);
  
      const messagesMap: { [key: string]: LatestMessage } = {};
  
      // Fetch message counts for each channel
      const counts = await Promise.all(
        fetchedChannels.map(async (channel: any) => {
          const count = await countMessagesByChannelAndSender(channel.channel_id, userId);
        
          messagesMap[channel.channel_id] = {
            content: channel.content, // Assuming messages are sorted by created_at
          };
          return { channelId: channel.channel_id, count };
        })
      );
  
      // Set the message counts state
      const countsObject: { [key: string]: number } = {};
      counts.forEach(({ channelId, count }) => {
        countsObject[channelId] = count;
      });
      setMessageCounts(countsObject);
  
      // Update the latestMessages state
      setLatestMessages(messagesMap);
    };
  
    fetchChannelsAndMessages();
    const intervalId = setInterval(fetchChannelsAndMessages, 500);
    const unsubscribe = subscribeToNewMessages(userId, (updatedChannels) => {
      setChannels(updatedChannels);
    });
  
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [userId]);
  

  const handleNavigate2 = (friendId: string, conversationId: string) => {
    setActiveConversationId(conversationId); // Set active conversation
    setTimeout(() => {
      router.push(`/Chat/${friendId}`);
    }, 10);
  };

  

  return (
    <WalletGuard>
      <div className={`flex flex-col h-screen bg-white dark:bg-deep-purple ${loadingClass}`} onClick={handleCloseMenus}>
        <Header user={user || { displayName: 'Guest' }} points={points} />

        <div className='mt-4'>
        <div className='bg-white dark:bg-deep-purple z-30'>
  <PointsDisplay points={points} />
</div>
        <div className="flex justify-center mt-1">
        {user && (
              <UserDetailsCard
                user={{
                  publicKey: user.publicKey,
                  avatar: user.avatar,
                  displayName: user.displayName,
                  pendingPoints: pendingPoints,
                }}
                onClaimPoints={handleClaimPoints} // Reset points on claim
              />
            )}
        </div>
        </div>
        <main className="flex-1 overflow-y-auto scroll-smooth">
        {channels.length > 0 ? (
          <div className="w-full max-w-4xl p-4">
            {channels.map((channel) => {
              const latestMessage = latestMessages[channel.channel_id];
              const messageCount = messageCounts[channel.channel_id];
              const formattedTime = latestMessage
          ? formatTimestamp(channel.created_at) // Use the updated formatTimestamp function
          : '';

                return (
                  <ChannelItem
                    key={channel.channel_id}
                    channel={channel}
                    latestMessage={latestMessage}
                    messageCount={messageCount}
                    formattedTime={formattedTime}
                    onDelete={handleDeleteConversation}
                    onClick={handleNavigate2}
                    renderFriendAvatar={renderFriendAvatar}
                  />
                );
            })}
          </div>
        ) : (
          <div className="text-lg text-black dark:text-gray-500 ml-4">You have no conversations</div>
        )}
      </main>

      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
  
        {showContactPage && <ContactPage  theme={theme} />}
        <EnergyProgressBar userId={userId || ''} />
        <PurpleIcon onClick={handleToggleContactPage} showContactPage={showContactPage} />
        <Footer theme={theme} />
      </div>
    </WalletGuard>
  );
};
export default HomePage;
