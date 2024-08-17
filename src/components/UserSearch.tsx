import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';  // Import useRouter for navigation
import { db } from "../lib/firebaseConfig";
import friendRequest from "../utils/friendRequest";
import Image from 'next/image';
import Lottie from 'react-lottie-player';
import { useUser } from "@/context/UserContext";
import ErrorModal from './ErrorModal';
import SuccessModal from './SuccessModal';
import Cookies from 'js-cookie';

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

interface UserSearchProps {
  onClose: () => void;
}

interface User {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  profileImage?: string;
  level?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { user } = useUser();
  const userId = Cookies.get('userId') || null;
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUserDataStale, setIsUserDataStale] = useState<boolean>(false);
  const router = useRouter();  // Initialize router

  useEffect(() => {
    setCurrentUser(userId);
  }, [userId]);

  useEffect(() => {
    const fetchMatchingUsers = async () => {
      if (searchTerm === "") {
        setSearchResults([]);
        return;
      }

      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);

        const results: User[] = [];

        for (const userDoc of usersSnapshot.docs) {
          if (userDoc.id === currentUser) {
            continue;
          }

          const publicRef = collection(db, `users/${userDoc.id}/public`);
          const q = query(publicRef, where("username", ">=", searchTerm), where("username", "<=", searchTerm + "\uf8ff"));
          const publicSnapshot = await getDocs(q);

          publicSnapshot.forEach((publicDoc) => {
            const userData = publicDoc.data() as User;
            results.push({ ...userData, id: userDoc.id });
          });
        }

        setSearchResults(results);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error searching users:", error.message);
        } else {
          console.error("Unknown error occurred:", error);
        }
      }
    };

    fetchMatchingUsers();
  }, [searchTerm, currentUser]);

  const handleAddFriend = async (userId: string, friendId: string) => {
    setLoadingStates((prevState) => ({ ...prevState, [friendId]: true }));
    try {
      await friendRequest(userId, friendId);
      setSuccessMessage("Friend request sent!");
      setIsUserDataStale(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sending friend request:", error.message);
        setErrorMessage('Failed to send Friend Request');
      } else {
        console.error("Unknown error occurred:", error);
        setErrorMessage('Failed to send Friend Request');
      }
    } finally {
      setLoadingStates((prevState) => ({ ...prevState, [friendId]: false }));
    }
  };

  const handleUserClick = (userId: string) => {
    // Add blinking effect class
    const userDiv = document.getElementById(userId);
    if (userDiv) {
      userDiv.classList.add('blink-effect');
      setTimeout(() => {
        userDiv.classList.remove('blink-effect');
        // Navigate to profile page
        router.push(`/profile/${userId}`);
      }, 300);  // Duration of the blink effect
    }
  };

  const renderFriendAvatar = (user: any) => {
    const selectedAvatar = avatars.find((item) => item.id === user.avatar);
    return selectedAvatar ? (
      <Lottie
        loop
        animationData={selectedAvatar.animation}
        play
        style={{
          width: 100,
          height: 100,
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      />
    ) : (
      <Image
        src={user.profileImage || '/img/boy1.png'}
        alt={user.displayName || 'boy'}
        width={100}
        height={100}
        className="rounded-full mr-4"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-black z-30 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search users"
          className="w-full border border-gray-300 rounded-lg p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={onClose} className="ml-2 p-2 bg-purple-500 text-white rounded-lg">
          Close
        </button>
      </div>
      <div>
        {searchResults.map((user) => (
          <div 
            key={user.id} 
            id={user.id}
            className="flex items-center  justify-between p-2"
            onClick={() => handleUserClick(user.id)}
          >
            <div 
              className="flex items-center cursor-pointer" 
              
            >
              {renderFriendAvatar(user)}
              <div>
                <div className="font-bold text-lg text-black dark:text-white">{user.displayName}</div>
                <div className="text-sm text-gray-700">@{user.username}</div>
                <div className="text-sm font-mono text-black dark:text-white-600">{user.bio}</div>
              </div>
            </div>
            <button
              onClick={() => handleAddFriend(userId as string, user.id)}
              className="bg-purple-500 text-white p-2 rounded-lg"
            >
              {loadingStates[user.id] ? "Sending..." : "Add Friend"}
            </button>
          </div>
        ))}
        <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
        <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
      </div>
    </div>
  );
};

export default UserSearch;









