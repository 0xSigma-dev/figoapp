import { useState, useEffect } from 'react';
import { getContactById } from '@/utils/indexedDB';

const useFriendDetails = (friendId: any) => {
  const [avatar, setAvatar] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isUserDetailsFetched, setIsUserDetailsFetched] = useState(false);

  useEffect(() => {
    const fetchFriendDetails = async () => {
      try {
        if (!friendId) return;

        // First, check if the contact is in the local IndexedDB
        const contact = await getContactById(friendId);
        if (contact) {
          // If the contact is found locally, set the avatar and display name
          setAvatar(contact.avatar);
          setDisplayName(contact.displayName);
        } else {
          // If not found in local storage, fetch the friend details from the API
          const response = await fetch(`/api/user/`, {
            headers: {
              Authorization: `Bearer ${friendId}`, // Use friendId as the token here
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch friend details');
          }

          // Parse the response
          const data = await response.json();
          setAvatar(data.user.avatar);
          setDisplayName(data.user.displayName);
        }
      } catch (error) {
        
      } finally {
        // Mark that the user details have been fetched
        setIsUserDetailsFetched(true);
      }
    };

    // Call the function to fetch the friend details
    fetchFriendDetails();
  }, [friendId]);

  // Return the fetched details to the component that uses this hook
  return { avatar, displayName, isUserDetailsFetched };
};

export default useFriendDetails;

