import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Ensure you have initialized Firebase
import { useUser } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Lottie from 'react-lottie-player';


interface FriendRecommendationProps {
  currentUserId: string | undefined;
}

interface Friend {
  id: string;
  displayName: string;
  avatar: number;
  username: string;
}

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
]

const FriendRecommendations: React.FC<FriendRecommendationProps> = ({ currentUserId }) => {
  const [recommendedFriends, setRecommendedFriends] = useState<Friend[]>([]);
  const { user } = useUser();
  const userId = Cookies.get('userId');

  useEffect(() => {
    const fetchRecommendedFriends = async () => {
      if (!user) return;

      try {
        // Step 1: Get the current user's friends list
        const friendsList = user.subcollections?.public[0]?.subcollections?.friends || [];
        const friendsIds = friendsList.map((friend: any) => friend.id);

        // Step 2: Fetch all users except the current user
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '!=', currentUserId)); // Fetch all users except the current user
        const snapshot = await getDocs(q);

        // Step 3: Get IDs of recommended users
        const recommendedIds = snapshot.docs
          .map(doc => doc.id)
          .filter(id => !friendsIds.includes(id)) // Filter out existing friends
          .slice(0, 10); // Limit to 10 recommendations

        // Step 4: Fetch detailed information for each recommended friend
        const detailedFriendsPromises = recommendedIds.map(async id => {
          try {
            // Fetch the public subcollection details for each user
            const userRef = doc(db, 'users', id, 'public', 'details');
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                id,
                displayName: data?.displayName || '',
                avatar: data?.avatar || '',
                username: data?.username || ''
              } as Friend;
            }
          } catch (error) {
            console.error(`Error fetching details for user ${id}:`, error);
          }
          return null;
        });

        const detailedFriends = (await Promise.all(detailedFriendsPromises)).filter(
          (friend): friend is Friend => friend !== null
        );

        setRecommendedFriends(detailedFriends);
        console.log('recfriend', detailedFriends )
      } catch (error) {
        console.error('Error fetching recommended friends:', error);
      }
    };

    fetchRecommendedFriends();
  }, [user, currentUserId]);

  const handleSendFriendRequest = async (friendId: string) => {
    try {
      const response = await fetch('/api/sendFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({
          userId: currentUserId,
          friendId,
        }),
      });

      if (response.ok) {
        // Remove from recommended friends list after sending friend request
        setRecommendedFriends(prevRecommendations =>
          prevRecommendations.filter(recommendedUser => recommendedUser.id !== friendId)
        );
      } else {
        console.error('Error sending friend request:', await response.json());
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const renderFriendAvatar = (friend: any) => {
    const selectedAvatar = avatars.find((item) => item.id === friend.avatar);
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
        alt={friend.displayName || 'boy'}
        width={50}
        height={50}
        className="rounded-full mr-4"
      />
    );
  };

  return (
    <div className='w-full mt-11 overflow-x-scroll flex space-x-4'>
      {recommendedFriends.map(friend => (
        <div key={friend.id} className='flex-shrink-0 w-40 p-2  bg-gray-900 rounded-lg shadow-lg'>
          {renderFriendAvatar(friend)}
          <div className='text-white text-center'>{friend.displayName}</div><span className='text-gray-500 text-xs '>(@{friend.username})</span>
          <FontAwesomeIcon
            icon={faPlusCircle}
            className='mt-2 text-lg ml-4 text-purple-500 cursor-pointer'
            onClick={() => handleSendFriendRequest(friend.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default FriendRecommendations;
