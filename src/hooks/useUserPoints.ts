import { useCallback, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { getUserData, saveUserData } from '@/utils/indexedDB'; // Import the IndexedDB utility function

interface User {
  id: string;
  displayName: string;
  username: string;
  publicKey: string;
  avatar?: string;
  points?: number;
  currentEnergy?: number;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useUserPoints = () => {
  const [points, setPoints] = useState<number>(0);
  const [currentEnergy, setCurrentEnergy] = useState<number>(0);
  const { user, setUser } = useUser();

  const fetchUserPoints = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      return;
    }
    const storedData = await getUserData(userId);

    if (storedData && storedData.id === userId) {
      setPoints(storedData.points || 0);
      setCurrentEnergy(storedData.currentEnergy || 0);
    } else {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('points, currentEnergy')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setPoints(data.points || 0);
          setCurrentEnergy(data.currentEnergy || 0);
          await saveUserData({
            id: userId,
            points: data.points,
            currentEnergy: data.currentEnergy,
          });
        } else {
        }
      } catch (error) {
      }
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserPoints(user.id);
    }
  }, [user?.id, fetchUserPoints]);

  return { points, currentEnergy, fetchUserPoints };
};

export default useUserPoints;











