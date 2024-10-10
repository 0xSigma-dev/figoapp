import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust the import based on your Supabase setup
import Cookies from 'js-cookie';

const useFriendDetails = (friendId: any) => {
  const [avatar, setAvatar] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [isUserDetailsFetched, setIsUserDetailsFetched] = useState(false);

  useEffect(() => {
    const fetchFriendDetails = async () => {
      try {
        if (!friendId) return;

        // Get the current user's ID from cookies
        const userId = Cookies.get('userId');
        if (!userId) return;

        // Fetch the current user from Supabase
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('friends')
          .eq('id', userId)
          .single();

        if (userError || !user) {
          throw new Error('Failed to fetch user data');
        }

        // Check if the friendId is in the friends array
        const friendData = user.friends.find((friend: any) => friend.id === friendId);

        if (friendData) {
          // If friend data exists in the friends array, use it
          setAvatar(friendData.avatar);
          setDisplayName(friendData.displayName);
        } else {
          // Friend not found in the user's friends array, fetch directly from the friend user's profile
          const { data: friendProfile, error: friendError } = await supabase
            .from('users')
            .select('avatar, displayName')
            .eq('id', friendId)
            .single();

          if (friendError || !friendProfile) {
            throw new Error('Friend data not found');
          }

          // Set the fetched friend data
          setAvatar(friendProfile.avatar);
          setDisplayName(friendProfile.displayName);
        }
      } catch (error) {
        //console.error('Error fetching friend details:', error);
      } finally {
        setIsUserDetailsFetched(true);
      }
    };

    fetchFriendDetails();
  }, [friendId]);

  // Return the fetched details to the component that uses this hook
  return { avatar, displayName, isUserDetailsFetched };
};

export default useFriendDetails;



