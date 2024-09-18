import { useState, useEffect, useCallback } from 'react';
import { getUserData } from '@/utils/indexedDB';

const useFetchUserData = (userId: string | undefined) => {
  const [senderAvatar, setSenderAvatar] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = useCallback( async () => {
    try {
      if (!userId) return;

      const token = userId;
      const storedData = await getUserData(userId);
      if (storedData && storedData.id === userId) {
        setSenderAvatar(storedData.avatar);
        setSenderName(storedData.displayName || []);
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
        setSenderAvatar(data.user.avatar);
        setSenderName(data.user.displayName || []);
      }
    } catch (error) {
      //console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  return { senderAvatar, senderName, loading };
};

export default useFetchUserData;
