import React, { useEffect, useState, Suspense } from 'react';
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
import { db } from '../../lib/firebaseConfig'; // Ensure you have initialized Firebase
import { collection, query, where, orderBy, onSnapshot, getDocs, getDoc, limit, doc as firestoreDoc} from 'firebase/firestore';
import WalletGuard from '../../components/WalletGuard';
import ContactPage from '@/components/ContactPage';
import Image from 'next/image';
import FriendRecommendations from '../../components/FriendRecommendations';

interface HomePageProps {
  theme: 'light' | 'dark';
}

import avatar1 from '../../components/lottie/avatar1.json';
import avatar2 from '../../components/lottie/avatar2.json';
import avatar3 from '../../components/lottie/avatar3.json';
import avatar4 from '../../components/lottie/avatar4.json';
import avatar5 from '../../components/lottie/avatar5.json';
import avatar6 from '../../components/lottie/avatar6.json';
import avatar7 from '../../components/lottie/avatar7.json';
import avatar8 from '../../components/lottie/avatar8.json';
import avatar9 from '../../components/lottie/avatar9.json';
import avatar10 from '../../components/lottie/avatar10.json';
import avatar11 from '../../components/lottie/avatar11.json';
import avatar12 from '../../components/lottie/avatar12.json';
import avatar13 from '../../components/lottie/avatar13.json';
import Lottie from 'react-lottie-player';
import Chat from '@/components/Chat';

const avatars = [
  { id: 1, animation: avatar1 },
  { id: 2, animation: avatar2 },
  { id: 3, animation: avatar3 },
  { id: 4, animation: avatar4 },
  { id: 5, animation: avatar5 },
  { id: 6, animation: avatar6 },
  { id: 7, animation: avatar7 },
  { id: 8, animation: avatar8 },
  { id: 9, animation: avatar9 },
  { id: 10, animation: avatar10 },
  { id: 11, animation: avatar11 },
  { id: 12, animation: avatar12 },
  { id: 13, animation: avatar13 },
];

const HomePage: React.FC<HomePageProps> = ({ theme }) => {
  const [hasContent, setHasContent] = useState(false);
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatFriend, setCurrentChatFriend] = useState<string | null>(null);
  const [clickedConversationId, setClickedConversationId] = useState<string | null>(null);

  
  
  const router = useRouter();
  
  const { user, setUser } = useUser();
  const userId = Cookies.get('userId');

  useEffect(() => {
    router.prefetch('/Home/Contact/page');
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    setIsUserDataStale(true);
    console.log('Logged in user details:', user);
  }, [user]);
  

  const fetchUserData = async () => {
    try {
      const token = userId;
  
      // Check if data exists in local storage
      const storedData = localStorage.getItem('userData');
      const parsedData = storedData ? JSON.parse(storedData) : null;
  
      if (parsedData) {
        // Use data from local storage if it exists
        setUser(parsedData);
        setFriends(parsedData.subcollections?.public[0]?.subcollections?.friends || []);
      }
  
      // Fetch new data from the server
      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
  
      const data = await response.json();
  
      // Compare new data with local storage data
      if (JSON.stringify(data) !== JSON.stringify(parsedData)) {
        // Update state and local storage if data has changed
        setUser(data);
        setFriends(data.subcollections?.public[0]?.subcollections?.friends || []);
        localStorage.setItem('userData', JSON.stringify(data));
      }
  
      // Fetch user points if not already fetched
      fetchUserPoints(token);
  
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserPoints(userId); // Fetch user points after fetching user data
    }
  }, [userId]);

  // Fetch conversations from Firestore
  useEffect(() => {
    //console.log('useEffect triggered with userId:', userId);
  
    if (!userId) {
     //console.log('No userId, exiting useEffect.');
      return;
    }

    const fetchConversations = async () => {
      try {
        // Fetch all conversation documents
        const q = query(collection(db, 'figos'));
        const snapshot = await getDocs(q);
    
        const conversations = await Promise.all(
          snapshot.docs
            .filter((snapshotDoc) => {
              const [docUserId, friendId] = snapshotDoc.id.split('_');
              return docUserId === userId || friendId === userId;
            })
            .map(async (snapshotDoc) => {
              const [docUserId, friendId] = snapshotDoc.id.split('_');
              const friendIdToFetch = docUserId === userId ? friendId : docUserId;
    
              // Fetch latest message
              const messagesRef = collection(db, `figos/${snapshotDoc.id}/messages`);
              const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
              const latestMessageSnapshot = await getDocs(messagesQuery);
              const latestMessage = latestMessageSnapshot.docs.length > 0 ? latestMessageSnapshot.docs[0].data() : null;
    
              // Fetch friend details from public subcollection
              const friendDocRef = firestoreDoc(db, `users/${friendIdToFetch}/public/details`);
              const friendDoc = await getDoc(friendDocRef);
              const friendData = friendDoc.exists() ? friendDoc.data() : {};
    
              return {
                id: snapshotDoc.id,
                friendId: friendIdToFetch,
                latestMessage,
                friendName: friendData.displayName || 'Unknown',
                friendAvatar: friendData.avatar || null,
              };
            })
        );
    
        // Sort conversations by the latest message timestamp
        const sortedConversations = conversations.sort((a, b) => {
          const aTimestamp = a.latestMessage?.timestamp?.toMillis() || 0;
          const bTimestamp = b.latestMessage?.timestamp?.toMillis() || 0;
          return bTimestamp - aTimestamp;
        });
    
        setConversations(sortedConversations);
      } catch (error) {
        //console.error('Error fetching conversations:', error);
      }
    };


    
    
    
  
    // Set up Firestore real-time listener
    const q = query(collection(db, 'figos'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversations = await Promise.all(
        snapshot.docs
          .filter((doc) => {
            const [docUserId, friendId] = doc.id.split('_');
            return docUserId === userId || friendId === userId;
          })
          .map(async (doc) => {
            const [docUserId, friendId] = doc.id.split('_');
            const friendData = docUserId === userId ? friendId : docUserId;
            const messagesRef = collection(db, `figos/${doc.id}/messages`);
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
            const latestMessageSnapshot = await getDocs(messagesQuery);
            const latestMessage = latestMessageSnapshot.docs.length > 0 ? latestMessageSnapshot.docs[0].data() : null;
            return {
              id: doc.id,
              friendId: friendData,
              latestMessage,
            };
          })
      );
      const sortedConversations = conversations.sort((a, b) => {
        const aTimestamp = a.latestMessage?.timestamp?.toMillis() || 0;
        const bTimestamp = b.latestMessage?.timestamp?.toMillis() || 0;
        return bTimestamp - aTimestamp;
      });
      setConversations(sortedConversations);
    });
    const intervalId = setInterval(fetchConversations, 100);
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [userId]);
  
  

  const handleNavigate2 = (friendId: string, conversationId: string) => {
    setActiveConversationId(conversationId); // Set active conversation
    setTimeout(() => {
      router.push(`/chat/${friendId}`);
    }, 10); // Add a slight delay before navigation to show the background change
  };

  const handleMessage2Click = (friendId: string, conversationId: string) => {
    setClickedConversationId(conversationId); // Trigger the blink effect
    setTimeout(() => {
      setClickedConversationId(null); // Reset the blink effect after a short delay
     // Set active conversation
      setCurrentChatFriend(friendId || null); // Open chat with the selected friend
      setIsChatOpen(true);
    }, 100); // Adjust the delay (200ms) to control the blink duration
  };

  const handleCloseMenus = () => {
    setMenuOpen(false);
    setShowDrawer(false);
  };

  const  handleToggleContactPage = () => {
    setShowContactPage(!showContactPage); // Toggle ContactPage visibility
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };


  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (router.pathname !== url) {
        // Block the back navigation by returning false
        return false;
      }
      return true;
    };
  
    router.beforePopState(({ url }) => handleRouteChange(url));
  
    return () => {
      router.beforePopState(() => true); // Reset behavior on cleanup
    };
  }, [router]);
  

  const loadingClass = loading ? 'blurred-blink' : '';


  const renderFriendAvatar = (avatar: any, profileImage: string) => {
    // Check if avatar exists
    if (!avatar) {
      return (
        <Image
          src={profileImage || '/img/boy1.png'}
          alt='Avatar'
          width={100}
          height={100}
          className='rounded-full mr-4'
        />
      );
    }
  
    const selectedAvatar = avatars.find((item) => item.id === avatar);
    return selectedAvatar ? (
      <Lottie
        loop
        animationData={selectedAvatar.animation}
        play
        style={{
          width: 50,
          height: 50,
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      />
    ) : (
      <Image
        src={profileImage || '/img/boy1.png'}
        alt='Avatar'
        width={50}
        height={50}
        className='rounded-full mr-4'
      />
    );
  };
  
  return (
    <WalletGuard>
      <div className={`flex flex-col h-screen bg-white dark:bg-black ${loadingClass}`} onClick={handleCloseMenus}>
        <Header user={user?.subcollections || { displayName: 'Guest' }} points={points} />
        <div>
          <EnergyProgressBar userId={userId || ''} />
        </div>
        <div className='mt-11 p-4'>
        <FriendRecommendations currentUserId={userId} />
        </div>
        <main className={`flex-1 overflow-y-auto flex  ${loadingClass}`}>
          {conversations.length > 0 ? (
            <div className={`w-full max-w-4xl p-4 ${loadingClass}`}>
            {conversations.map((conversation) => (
  <div
    key={conversation.id}
    className={`flex items-center p-2 cursor-pointer ${
      clickedConversationId === conversation.id ? 'bg-gray-700' : ''
    }`}
    onClick={() => handleMessage2Click(conversation.friendId, conversation.id)}
  >
    {renderFriendAvatar(conversation.friendAvatar, conversation.friendAvatar)}
    <div className='flex-1 ml-4'>
      <div className='font-bold  text-lg text-black dark:text-white-600'>{conversation.friendName}</div>
      <div className='text-sm font-mono text-black dark:text-white-400'>
        {conversation.latestMessage?.content.length > 40
          ? `${conversation.latestMessage.content.substring(0, 32)}...`
          : conversation.latestMessage?.content || ''}
      </div>
    </div>
  </div>
))}
            </div>
          ) : (
            <div className={`text-lg text-black dark:text-gray-500 ml-4 ${loadingClass}`}>You have no conversations</div>
          )}
        </main>
        {isChatOpen && currentChatFriend && (
  <Chat friendId={currentChatFriend} onClose={handleCloseChat} />
)}
        {showContactPage && <ContactPage  theme={theme} />}
        <PurpleIcon onClick={handleToggleContactPage} showContactPage={showContactPage} />
        <Footer theme={theme} />
      </div>
    </WalletGuard>
  );
};
export default HomePage;
