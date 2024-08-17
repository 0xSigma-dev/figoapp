import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { collection, onSnapshot, addDoc, orderBy, serverTimestamp, query, setDoc, doc, updateDoc, getDoc, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust the path as necessary
import { useUser } from '@/context/UserContext'; // Adjust the path as necessary
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch, faEllipsisV, faPaperPlane, faClock, faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import Lottie from 'react-lottie-player'; // Importing FontAwesome icons
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useInView } from 'react-intersection-observer';
import FloatingPointsAnimation from './FloatingPointsAnimation';
import avatar1 from './lottie/avatar1.json';
import avatar2 from './lottie/avatar2.json';
import avatar3 from './lottie/avatar3.json';
import avatar4 from './lottie/avatar4.json';
import avatar5 from './lottie/avatar5.json';
import avatar6 from './lottie/avatar6.json';
import avatar7 from './lottie/avatar7.json';
import avatar8 from './lottie/avatar8.json';
import avatar9 from './lottie/avatar9.json';
import avatar10 from './lottie/avatar10.json';
import avatar11 from './lottie/avatar11.json';
import avatar12 from './lottie/avatar12.json';
import avatar13 from './lottie/avatar13.json';
import typing from './lottie/typing.json';
import EnergyProgressBar from '@/components/EnergyProgressBar';
import ReactDOM from 'react-dom';
import useUserPoints from '@/hooks/useUserPoints';

interface ChatProps {
  friendId: string;
  onClose: () => void; // function to close the chat
}

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

const Chat: React.FC<ChatProps> = ({ friendId, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set()); // State to track typing users
  const userId = Cookies.get('userId') || ''; // Ensure userId is a string
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Reference for auto-scrolling
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null); // Reference for input focus
  const [friendData, setFriendData] = useState<any>(null); // Updated to any for simplicity
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now());
  const [refillTimer, setRefillTimer] = useState<NodeJS.Timeout | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<{ points: number; x: number; y: number } | null>(null);
  const { points, fetchUserPoints } = useUserPoints();

  const fetchUserData = async () => {
    try {
      // Check if friend data exists in localStorage
      const storedFriendData = localStorage.getItem(`friendData_${friendId}`);
  
      if (storedFriendData) {
        // If data exists in localStorage, parse it and use it
        const friendPublicData = JSON.parse(storedFriendData);
        setFriendData(friendPublicData);
        setIsLoading(false);
        console.log('Loaded friend data from localStorage:', friendPublicData);
      } else {
        // If not found in localStorage, fetch from API
        const token = friendId;
        const response = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
  
        const data = await response.json();
        console.log('Fetched user data:', data);
        const friendPublicData = data?.subcollections?.public?.[0]?.data || {};
  
        // Store the fetched data in localStorage for future use
        localStorage.setItem(`friendData_${friendId}`, JSON.stringify(friendPublicData));
  
        setFriendData(friendPublicData);
        console.log('Updated friendData:', friendPublicData);
        setIsLoading(false);
      }
  
      // Fetch user points regardless of where the friend data came from
      fetchUserPoints(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  useEffect(() => {
    if (friendId) {
      fetchUserData();
    }
  }, [friendId]);
  

//message fetch
useEffect(() => {
  if (userId && friendId) {
    const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    const messagesRef = collection(db, 'figos', chatId, 'messages');

    // Fetch all messages, not just new ones
    const messagesQuery = query(messagesRef, orderBy('timestamp'), limit(20));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        // Set the messages to state directly from the fetched messages
        setMessages(newMessages);

        // Update local storage
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(newMessages));
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }
}, [userId, friendId]);


useEffect(() => {
  if (userId && friendId) {
    const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    const storedMessages = JSON.parse(localStorage.getItem(`messages_${chatId}`) || '[]');
    setMessages(storedMessages); // Set stored messages as initial messages
  }
}, [userId, friendId]);


const handleScroll = () => {
  if (messagesContainerRef.current && messagesContainerRef.current.scrollTop === 0) {
    // Load older messages from localStorage
    const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    const storedMessages = JSON.parse(localStorage.getItem(`messages_${chatId}`) || '[]');

    // Here you can set how many older messages to load at once (e.g., 20 messages)
    const olderMessages = storedMessages.slice(0, 20);

    setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
  }
};


useEffect(() => {
  const messagesContainer = messagesContainerRef.current;

  if (messagesContainer) {
    messagesContainer.addEventListener('scroll', handleScroll);
  }

  return () => {
    if (messagesContainer) {
      messagesContainer.removeEventListener('scroll', handleScroll);
    }
  };
}, []);



  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

//typing status
  useEffect(() => {
    if (userId && friendId) {
      const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
      const typingStatusRef = collection(db, 'figos', chatId, 'typingStatus');
      const unsubscribe = onSnapshot(
        typingStatusRef,
        (snapshot) => {
          const typingData = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            if (data.isTyping) {
              acc.add(doc.id);
            }
            return acc;
          }, new Set<string>());
          setTypingUsers(typingData);
        },
        (error) => {
          console.error('Error fetching typing status:', error); // Error handling
        }
      );
      return () => {
        unsubscribe();
      };
    }
  }, [userId, friendId]);

  const updateTypingStatus = async (typing: boolean) => {
    if (userId && friendId) {
      const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
      const typingStatusRef = doc(db, 'figos', chatId, 'typingStatus', userId);
  
      try {
        // Create or update the typing status document
        await setDoc(typingStatusRef, { isTyping: typing }, { merge: true });
      } catch (error) {
        console.error('Error updating typing status:', error); // Error handling
      }
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (e.target.value) {
      updateTypingStatus(true);
    } else {
      updateTypingStatus(false);
    }
  };

  const refillEnergy = async () => {
    const userRef = doc(db, 'users', userId);
    const privateRef = collection(userRef, 'private');
    const detailsRef = doc(privateRef, 'details');
  
    try {
      const userDoc = await getDoc(detailsRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const currentEnergy = data?.currentEnergy || 0;
        const totalEnergy = data?.totalEnergy || 100; // Default totalEnergy if not found
  
        // Refill energy if it's less than totalEnergy
        if (currentEnergy < totalEnergy) {
          const newEnergy = Math.min(currentEnergy + 20, totalEnergy);
          await updateDoc(detailsRef, { currentEnergy: newEnergy });
  
          // Stop refilling if energy is full
          if (newEnergy < totalEnergy) {
            // Schedule next refill
            const timer = setTimeout(refillEnergy, 1000);
            setRefillTimer(timer);
          } else {
            // Clear the timer when energy is full
            if (refillTimer) {
              clearTimeout(refillTimer);
              setRefillTimer(null);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refilling energy:', error);
    }
  };

  
  useEffect(() => {
    const checkRefill = () => {
      const now = Date.now();
      if (now - lastMessageTime >= 3000 && !refillTimer) {
        refillEnergy();
      }
    };
  
    // Check every second
    const interval = setInterval(checkRefill, 1000);
    return () => clearInterval(interval);
  }, [lastMessageTime, refillTimer]);

  const handleMessageSent = () => {
    setLastMessageTime(Date.now());
  };
  

  const sendMessage = async () => {
    if (messageInput.trim() !== '' && userId && friendId) {
      const chatId = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
      const chatRef = doc(db, 'figos', chatId);
  
      try {
        const chatDoc = await getDoc(chatRef);
  
        if (!chatDoc.exists()) {
          await setDoc(chatRef, { createdAt: serverTimestamp(), users: [userId, friendId] });
        }
  
        const messagesRef = collection(db, 'figos', chatId, 'messages');
        const message = {
          senderId: userId,
          receiverId: friendId,
          content: messageInput,
          timestamp: serverTimestamp(),
        };
  
        await addDoc(messagesRef, message);
        setMessageInput('');
        if (inputRef.current) {
          inputRef.current.focus();
        }
        updateTypingStatus(false);
        handleMessageSent();
  
        // Fetch user details
        const userRef = doc(db, 'users', userId);
        const privateRef = collection(userRef, 'private');
        const detailsRef = doc(privateRef, 'details');
  
        const userDoc = await getDoc(detailsRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentPoints = userData?.points || 0;
          const currentEnergy = userData?.currentEnergy || 0;
          const totalEnergy = userData?.totalEnergy || 100; // Default totalEnergy if not found
  
          const pointsToAdd = 20; // Points to add
          const newEnergy = Math.max(currentEnergy - pointsToAdd, 0); // Calculate new energy
  
          // Update user points
          if (newEnergy > 0) {
            await updateDoc(detailsRef, { points: currentPoints + pointsToAdd, currentEnergy: newEnergy });
            setFloatingPoints({ points: pointsToAdd, x: 300, y: 500 });

            setTimeout(() => {
              setFloatingPoints(null);
            }, 1000);
           
          } else {
            await updateDoc(detailsRef, { points: currentPoints + pointsToAdd, currentEnergy: 0 });
          }
  
  
          // Update points for the receiver
          const receiverRef = doc(db, 'users', friendId);
          const receiverPrivateRef = collection(receiverRef, 'private');
          const receiverDetailsRef = doc(receiverPrivateRef, 'details');
          
          const receiverDoc = await getDoc(receiverDetailsRef);
          if (receiverDoc.exists()) {
            const receiverData = receiverDoc.data();
            const receiverCurrentPoints = receiverData?.points || 0;
            await updateDoc(receiverDetailsRef, { points: receiverCurrentPoints + 30 });
            
            
          }

          
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.warn('Message input is empty or userId/friendId is missing');
    }
  };
  
  

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };


  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleDateString();
  };

 
 const formatTime = (timestamp: any) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };
 
 const isSameDay = (timestamp1: any, timestamp2: any) => {
  // Check if timestamp1 and timestamp2 are defined and have a seconds property
  if (
    timestamp1?.seconds !== undefined &&
    timestamp2?.seconds !== undefined
  ) {
    const date1 = new Date(timestamp1.seconds * 1000);
    const date2 = new Date(timestamp2.seconds * 1000);
    return date1.toDateString() === date2.toDateString();
  }
  
  // Return false or handle the undefined case as needed
  return false;
};

 
  

  const isTyping = typingUsers.has(friendId);

  const renderFriendAvatar = () => {
    if (!friendData) {
      return <div>Loading...</div>; // Or any placeholder UI
    }
    
    const selectedAvatar = avatars.find((item:any) => item.id === friendData.avatar);
    
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
        src={friendData?.profileImage || '/img/boy1.png'}
        alt={friendData?.displayName}
        width={60}
        height={60}
        className="rounded-full mr-4"
      />
    );
  };





  return (
    <div className="flex fixed bottom-0 top 0 flex-col w-screen h-screen z-50" style={{ backgroundColor: 'black' }}>
     

      <div className="flex items-center justify-between p-2 bg-transparent">
  <div className="flex items-center space-x-2">
    <FontAwesomeIcon
      icon={faArrowLeft}
      className="w-4 h-4 text-white cursor-pointer " // Reduced margin-right
      onClick={() => onClose()}
    />
    {isLoading ? (
      <div>Loading...</div>
    ) : (
      <div className="flex items-center space-x-1">
        {renderFriendAvatar()}
        <div className='mr-2'>
          <h2 className="text-white font-bold">{friendData?.displayName || 'User'}</h2>
          <p className="text-green-300 text-sm">{friendData?.onlineStatus || ''}</p>
        </div>
      </div>
    )}
  </div>
  <EnergyProgressBar userId={userId || ''} />
  <div className="flex items-center space-x-2">
    <div className="text-white font-semibold">{points}</div>
    <FontAwesomeIcon icon={faEllipsisV} className="w-6 h-6 text-white cursor-pointer" />
  </div>
  
</div>




{messages.length === 0 ? (
  <div className="flex-grow flex items-center justify-center">
    <div className="flex flex-col items-center justify-center bg-gray-700 w-40 rounded-lg p-6">
      <div className="mb-4">{renderFriendAvatar()}</div>
      <p className="text-white font-mono text-xs">Hi, Happy to meet you. Let&apos;s talk!</p>
    </div>
  </div>
) : (
  <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-4">
  <div className="space-y-2">
    {messages.map((msg, index) => {
      const showDate =
        index === 0 || !isSameDay(messages[index - 1].timestamp, msg.timestamp);
      return (
        <div key={msg.id}>
          {showDate && (
            <div className="text-center text-gray-500 text-sm">
              {formatDate(msg.timestamp)}
            </div>
          )}
          <div className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-3 rounded-lg ${
                msg.senderId === userId ? 'bg-purple-500 text-white' : 'bg-gray-700 text-white'
              }`}
              style={{ maxWidth: '80%' }}
            >
              <div className="text-sm break-words">{msg.content}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-300">
                  {formatTime(msg.timestamp)}
                </span>
                {msg.senderId === userId && (
                  <FontAwesomeIcon
                    icon={msg.seen ? faCheckDouble : faCheck}
                    className={`ml-2 ${
                      msg.seen ? 'text-blue-400' : 'text-gray-400'
                    }`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    })}
    <div ref={messagesEndRef}></div>
  </div>
</div>

)}


      {isTyping && (
        <div className="p-2"><Lottie
        loop
        animationData={typing}
        play
        style={{
          width: 100,
          height: 100,
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      /></div>
      )}

      
      {floatingPoints && (
        <FloatingPointsAnimation 
          points={floatingPoints.points} 
          x={floatingPoints.x} 
          y={floatingPoints.y} 
        />
      )}


      <div className="p-4 bg-gray-800">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-grow p-2 bg-gray-600 text-white rounded-md focus:outline-none"
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            className="ml-4 bg-purple-500 text-white px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
