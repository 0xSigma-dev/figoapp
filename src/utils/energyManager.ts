// Utility to manage energy in IndexedDB
import { getDBInstance, updateUserDataFields, getUserData } from './indexedDB';

// Function to save current energy in IndexedDB
export const saveCurrentEnergy = async (userId: any, currentEnergy: number) => {
  try {
    const db = await getDBInstance();
    await updateUserDataFields(userId, { currentEnergy });
  } catch (error) {
  }
};

// Function to refill energy every second if no message is sent in the past 3 seconds
export const autoRefillEnergy = async (userId: any, totalEnergy: number) => {
  let lastMessageTime = Date.now();
  let refillInterval: any = null;
  
  // Start energy refill
  const startRefill = async () => {
    if (refillInterval) return; // If refill is already active, don't start again

    refillInterval = setInterval(async () => {
      const userData = await getUserData(userId);
      if (!userData || userData.currentEnergy >= totalEnergy) {
        clearInterval(refillInterval);
        refillInterval = null;
        return;
      }

      const timeSinceLastMessage = Date.now() - lastMessageTime;
      if (timeSinceLastMessage >= 5000) {
        const newEnergy = Math.min(userData.currentEnergy + 1, totalEnergy);
        await saveCurrentEnergy(userId, newEnergy);
      }
    }, 1000);
  };

  // Stop energy refill
  const stopRefill = () => {
    if (refillInterval) {
      clearInterval(refillInterval);
      refillInterval = null;
    }
  };

  // Call this function whenever a user sends a message
  const resetRefillTimer = async () => {
    lastMessageTime = Date.now();
    stopRefill();
    setTimeout(() => {
      startRefill();
    }, 5000); 
  };

  await startRefill();

  return { resetRefillTimer, startRefill, stopRefill };
};
