import React, { useEffect, useState} from 'react';
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
import { saveUserData, getUserData, getAllChannels,  getLatestMessagesForAllChannels, saveChannel, getDBInstance, saveMessage, updateUserDataFields } from '../../utils/indexedDB';
import PointsDisplay from '../../components/PointsDisplay';
import AvatarComponent from '../../components/AvatarComponent';
import UserDetailsCard from '../../components/UserDetailsCard';
import { supabase } from '@/lib/supabaseClient';
import Confetti from 'react-confetti';
import { useAbly } from '@/context/AblyContext';
import { subscribeToChannel, unsubscribeFromChannel } from '@/utils/ablyService';


interface HomePageProps {
  theme: 'light' | 'dark';
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
  const [latestMessages, setLatestMessages] = useState<{ [key: string]: any }>({});
  const [channels, setChannels] = useState<any[]>([]);
  const [pendingPoints, setPendingPoints] = useState<any>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const { ablyClient } = useAbly();


  useEffect(() => {
    const initializeDB = async () => {
      const userId = Cookies.get('userId');
      if (userId) {
        await getDBInstance();
      }
    };
  
    initializeDB();
  }, []);

  const startConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false); // Stop confetti after 5 seconds
    }, 5000);
  };


  

  
  
  const router = useRouter();
  
  const { user, setUser } = useUser();
  const userId = Cookies.get('userId');

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
      const storedData = await getUserData(userId || '');
      if (storedData && storedData.id === userId) {
        setUser(storedData);
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
        setUser(data.user);
        await saveUserData({ id: userId, ...data.user });
      }
      fetchUserPoints(token);
    } catch (error) {
    }
  };
  
  

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserPoints(userId);
    }
  }, [userId]);
  
  

  const handleNavigate2 = (friendId: string, conversationId: string) => {
    setActiveConversationId(conversationId); // Set active conversation
    setTimeout(() => {
      router.push(`/Chat/${friendId}`);
    }, 10);
  };


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
        width={50}
        height={50}
      />
    );
  };
  

  
  const handleClaimPoints = async () => {
    if (!userId || !user) return;

    // Step 1: Reset pending points in localStorage

    try {
      // Step 2: Update points in IndexedDB
      const newTotalPoints = (user.points || 0) + pendingPoints;
      await updateUserDataFields(userId, { points: newTotalPoints });

      // Step 3: Update points in Supabase
      const { error } = await supabase
        .from('users')
        .update({ points: newTotalPoints })
        .eq('id', userId);

      if (error) {
        throw new Error('Error updating points in Supabase: ' + error.message);
      }

      localStorage.setItem('pendingPoints', JSON.stringify({ userId, points: 0 }));
      setPendingPoints(0);

      // Step 4: Update local user context with new points
      setUser({
        ...user,
        points: newTotalPoints,
      });
      startConfetti();

    } catch (error) {
    }
  };


  useEffect(() => {
    const fetchChannelsAndMessages = async () => {
      try {
        const channelsData = await getAllChannels();
        const latestMessagesData = await getLatestMessagesForAllChannels();
        const validMessages = latestMessagesData.filter((message) => message !== null);
        const messagesByChannel = validMessages.reduce((acc, message) => {
          if (message && message.channelId) {
            acc[message.channelId] = message;
          }
          return acc;
        }, {});
        const sortedChannels = channelsData.sort((a, b) => {
          const timestampA = messagesByChannel[a.id] ? new Date(messagesByChannel[a.id].timestamp).getTime() : 0;
          const timestampB = messagesByChannel[b.id] ? new Date(messagesByChannel[b.id].timestamp).getTime() : 0;
          return timestampB - timestampA;
        });
        setChannels(sortedChannels);
        setLatestMessages(validMessages);
      } catch (error) {
      }
    };
    fetchChannelsAndMessages();
    const interval = setInterval(fetchChannelsAndMessages, 1000);
    return () => clearInterval(interval);
  }, []);
  

  const checkIfChannelExists = async (channelName: string): Promise<boolean> => {
    try {
      const channels = await getAllChannels();
      return channels.some(channel => channel.id === channelName);
    } catch (error) {
      return false;
    }
  };

  const fetchUserChannels = async (userId: any) => {
    if (!ablyClient) return;
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .ilike('name', `%${userId}%`); 
      if (error) {
        return [];
      }
      if (data) {
        for (const channel of data) {
          const channelName = channel.name;
          subscribeToChannel(ablyClient, channelName, async (message: any) => {
            await saveMessage(message.data, message.id, channelName);
          });
          const exists = await checkIfChannelExists(channelName);
          if (!exists) {
            const isFriend = channel.friend_id !== userId;
            const newChannel = {
              id: channelName,
              name: channelName,
              friendId: isFriend ? channel.friend_id : channel.sender_id,
              friendName: isFriend ? channel.friend_name : channel.sender_name,
              friendAvatar: isFriend ? channel.friend_avatar : channel.sender_avatar,
            };
            await saveChannel(newChannel);
          }
        }
      }
      return data;
    } catch (error) {
      return [];
    }
  };
  

  useEffect(() => {
    if (userId) {
      fetchUserChannels(userId);
      const interval = setInterval(() => fetchUserChannels(userId), 5000);
      return () => clearInterval(interval);
    }
  }, [userId, ablyClient]);

  const subscribeToFigoChannel = () => {
    if (ablyClient) {
      subscribeToChannel(ablyClient, 'Figo', (message: any) => {
      });
    }
  };

  useEffect(() => {
    if (userId) {
      subscribeToFigoChannel();
    }
  }, [userId]);

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
        <main className={`flex-1 overflow-y-auto flex ${loadingClass}`}>
        {channels.length > 0 ? (
          <div className={`w-full max-w-4xl p-4 ${loadingClass}`}>
            {channels.map((channel) => {
              const latestMessage = latestMessages.find((msg: any) => msg.channelId === channel.id);
              return (
                <div
                  key={channel.id}
                  className={`flex items-center p-2 cursor-pointer ${
                    clickedConversationId === channel.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleNavigate2(channel.friendId, channel.id)}
                >
                  {renderFriendAvatar(channel.friendAvatar)}
                  <div className='flex-1 ml-4'>
                    <div className='font-bold text-lg text-black dark:text-white'>{channel.friendName}</div>
                    <div className='text-sm text-black dark:text-white'>
                      {latestMessage?.text && latestMessage.text.length > 40
                        ? `${latestMessage.text.substring(0, 32)}...`
                        : latestMessage?.text || 'You might Know this user, Say Hi'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-lg text-black dark:text-gray-500 ml-4 ${loadingClass}`}>You have no conversations</div>
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
