// src/components/ContactPage.tsx
"use client";
import { faArrowLeft, faEllipsisV, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import SearchIcon from './SearchIcon';
import UserSearch from './UserSearch';
import { useUser } from '@/context/UserContext';
import Lottie from 'react-lottie-player';
import Chat from './Chat';

interface ContactPageProps {
  theme: 'light' | 'dark';
}


interface Friend {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage?: string;
  data: {
    avatar: number;
  };
}

interface FriendRequest extends Friend {} // Same structure for simplicity


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

const ContactPage: React.FC<ContactPageProps> = ({ theme }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedFriendRequests, setReceivedFriendRequests] = useState<FriendRequest[]>([]); 
  const [hasContent, setHasContent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { user } = useUser(); // Removed setUser since it's not used for friends/requests
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const router = useRouter();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isUserDataStale, setIsUserDataStale] = useState<boolean>(false);
  const menuRef = useRef(null);
  const userId = Cookies.get('userId');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatFriend, setCurrentChatFriend] = useState<string | null>(null);
  const [showContactPage, setShowContactPage] = useState(true);

  //const [ showContactPage ,setShowContactPage ] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const token = userId;
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
  
      setFriends(data.subcollections.public[0].subcollections.friends || []);
      setReceivedFriendRequests(data.subcollections.public[0].subcollections.receivedFriendRequests || []);
  
      console.log('friendsinrequests', data.subcollections.public[0].subcollections.friends);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [userId]); // Include necessary dependencies
  
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); 

  const handleMenuToggle = (e: any) => {
    e.stopPropagation();
    setMenuOpen(prevState => !prevState);
  };
  
  const handleCloseMenus = () => {
    setMenuOpen(false);
    setShowDrawer(false);
  };

 

  const handleSearchClick = () => {
    setShowSearchModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
  };


  const handleMessage2Click = (friendId: string) => {
    setShowContactPage(false);
    //const selectedFriend = friends.find((f) => f.id === friendId);
    setCurrentChatFriend(friendId || null); 
    setIsChatOpen(true);
  };
  

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setShowContactPage(true); 
  };


  const handleAcceptRejectClick = async (friendId: string, action: 'accept' | 'reject') => {
    try {
      const token = userId;
      console.log('Sending request with:', { userId, friendId, action });

      const response = await fetch('/api/acceptFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          friendId,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Friend request ${action}ed:`, data.message);

        setIsUserDataStale(true);
        fetchUserData();
      } else {
        const errorData = await response.json();
        console.error('Failed to handle friend request:', errorData.message);
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadingClass = loading ? 'blurred-blink' : '';

  const renderFriendAvatar = (friend: any) => {
    const selectedAvatar = avatars.find((item) => item.id === friend.data.avatar);
    console.log('selected', selectedAvatar)
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
        src={friend.profileImage || '/img/boy1.png'}
        alt={friend.displayName}
        width={50}
        height={50}
        className="rounded-full mr-4"
      />
    );
  };

  return (
    <div className={`flex flex-col h-screen z-25 ${loadingClass}`} onClick={handleCloseMenus}>
      <header className="fixed top-0 left-0 right-0 bg-black text-white p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold ml-4">Choose Friend</span>
            <span className="text-sm bg-grey-800 ml-4">{friends.length || 0} friends</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SearchIcon onClick={handleSearchClick} />
          <div className="relative" ref={menuRef}>
            <FontAwesomeIcon icon={faEllipsisV} className="cursor-pointer mr-4 ml-4 text-lg" onClick={handleMenuToggle} />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-2 z-50">
                <a href="#" className="block px-4 py-2 text-white-800 hover:bg-gray-100">
                  Refresh
                </a>
                <a href="#" className="block px-4 py-2 text-white-800 hover:bg-gray-100">
                  Invite
                </a>
                <a href="#" className="block px-4 py-2 text-white-800 hover:bg-gray-100">
                  Help
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-1 overflow-auto ${loadingClass}`}>
        <div className="mt-5 ml-5 text-purple-800 mb-4 font-bold" >Purple Family</div>
        {friends.length > 0 && (
  friends.map((friend: any) => (
    <div
      key={friend.id}
      className="flex items-center justify-between p-4 ml-3 cursor-pointer hover:bg-gray-800"
      onClick={() => handleMessage2Click(friend.id)}
    >
      <div className="flex items-center space-x-4">
        {renderFriendAvatar(friend)}
        <div >
          <p className="text-white-900 font-extrabold">{friend.data.displayName}</p>
          <p className="text-sm text-gray-400" >
            @{friend.data.username || 'Friend'}
          </p>
          <p className="text-gray-400 text-sm">{friend.data.bio}</p> {/* Displaying the bio */}
        </div>
      </div>
    </div>
    
  ))
)}



        {friends.length === 0 && (
          <p className="text-gray-500 text-center mt-5">You don&apos;t have any friends yet.</p>
        )}

        {receivedFriendRequests.length > 0 && (
          <>
            <div className="ml-5 text-purple-800 mb-4 font-bold">Friend Requests</div>
            {receivedFriendRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  {renderFriendAvatar(request)}
                  <div>
                    <p className="text-white-400 font-extrabold">{request.data.displayName}</p>
                    <p className="font-bold text-sm text-gray-400">@{request.data.username || 'Friend Request'}</p> 
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleAcceptRejectClick(request.id, 'accept')}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleAcceptRejectClick(request.id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      {isChatOpen && currentChatFriend && (
  <Chat friendId={currentChatFriend} onClose={handleCloseChat} />
)}
     
      {showSearchModal && <UserSearch onClose={closeSearchModal} />}
    </div>
  );
}

export default ContactPage;
