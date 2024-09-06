import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useUser } from "@/context/UserContext";
import ErrorModal from './ErrorModal';
import SuccessModal from './SuccessModal';
import Cookies from 'js-cookie';
import AvatarComponent from './AvatarComponent';

interface UserSearchProps {
  onClose: () => void;
}

interface User {
  id: string;
  avatar: any;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentUser(userId);
  }, [userId]);

  useEffect(() => {
    const fetchMatchingUsers = async () => {
      if (searchTerm === "") {
        setSearchResults([]);
        return;
      }
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, displayName, username, bio, avatar')
          .or(`username.ilike.%${searchTerm}%, publicKey.ilike.%${searchTerm}%`);

        if (error) {
          //console.error("Error searching users:", error.message);
          return;
        }

        // Filter out the current user from results
        const results = data?.filter((user: User) => user.id !== currentUser) || [];
        setSearchResults(results);
      } catch (error) {
        //console.error("Unknown error occurred:", error);
      }
      setLoading(false);
    };
    
    fetchMatchingUsers();
  }, [searchTerm, currentUser]);


  const handleUserClick = (userId: string) => {
    const userDiv = document.getElementById(userId);
    if (userDiv) {
      userDiv.classList.add('blink-effect');
      setTimeout(() => {
        userDiv.classList.remove('blink-effect');
        router.push(`/profile/${userId}`);
      }, 300);
    }
  };

  const SkeletonLoader = () => {
    return (
      <div className="animate-pulse flex space-x-4 p-4">
        <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  };

  
  return (
    <div className="fixed inset-0 bg-white dark:bg-black z-30 p-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search users with username or wallet address"
          className="w-full rounded-lg p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={onClose} className="ml-2 p-2 bg-purple-500 text-white rounded-lg">
          Close
        </button>
      </div>
      <div className='overflow-y-auto'>
        {loading ? (
          <>
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </>
        ) : (
          searchResults.map((user) => (
            <div 
              key={user.id} 
              id={user.id}
              className="flex items-center justify-between p-2"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center cursor-pointer">
                <AvatarComponent avatarId={user.avatar} width={70} height={70} /> 
                <div>
                  <div className="font-bold text-lg text-black dark:text-white">
                    {user.displayName}<span className="text-sm text-gray-700">(@{user.username})</span>
                  </div>
                  <div className="text-sm font-mono text-gray-900 dark:text-gray-400">{user.bio}</div>
                </div>
              </div>
            </div>
          ))
        )}
        <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
        <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
      </div>
    </div>
  );
};

export default UserSearch;








