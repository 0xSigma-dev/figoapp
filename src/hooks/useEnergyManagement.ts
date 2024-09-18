import { useState, useEffect, useRef } from 'react';
import { autoRefillEnergy, saveCurrentEnergy } from '@/utils/energyManager';
import { getUserData } from '@/utils/indexedDB';

const useEnergyManagement = (userId: any) => {
  const [currentEnergy, setCurrentEnergy] = useState<number>(0);
  const [totalEnergy, setTotalEnergy] = useState<number>(300);
  
  // Refs to store functions from the refill manager
  const resetRefillTimer = useRef<(() => void) | null>(null);
  const startRefill = useRef<(() => void) | null>(null);

  useEffect(() => {
    const initEnergy = async () => {
      // Fetch user data and energy levels
      const userData = await getUserData(userId);
      setCurrentEnergy(userData?.currentEnergy || 0);
      setTotalEnergy(userData?.totalEnergy || 300);

      // Initialize the auto refill system
      const refillManager = await autoRefillEnergy(userId, userData?.totalEnergy || 300);

      // Assign functions to refs for resetting or starting the refill timer
      resetRefillTimer.current = refillManager.resetRefillTimer;
      startRefill.current = refillManager.startRefill;
    };

    initEnergy();
  }, [userId]);

  return { currentEnergy, totalEnergy, setCurrentEnergy, resetRefillTimer, startRefill };
};

export default useEnergyManagement;

