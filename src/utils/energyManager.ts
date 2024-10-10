// Utility to manage energy in IndexedDB
import { updateUserDataFields, getUserData } from './indexedDB';

// Function to save current energy in IndexedDB
export const saveCurrentEnergy = async (userId: any, currentEnergy: number) => {
  try {
    await updateUserDataFields(userId, { currentEnergy });
  } catch (error) {
  }
};

// Function to refill energy every second if no message is sent in the past 3 seconds
export const autoRefillEnergy = async (userId: string, totalEnergy: number) => {
  let lastMessageTime = Date.now();
  let refillInterval: any = null;

  // Start energy refill process
  const startRefill = async () => {
    if (refillInterval) return; // Prevent multiple intervals from starting

    refillInterval = setInterval(async () => {
      const userData = await getUserData(userId);
      if (!userData || userData.currentEnergy >= totalEnergy) {
        clearInterval(refillInterval); // Stop refill if energy is full or no data
        refillInterval = null;
        return;
      }

      const timeSinceLastMessage = Date.now() - lastMessageTime;
      if (timeSinceLastMessage >= 5000) { // No messages for 5 seconds
        const newEnergy = Math.min(userData.currentEnergy + 1, totalEnergy); // Increment energy by 1
        await saveCurrentEnergy(userId, newEnergy);
      }
    }, 1000); // Refill every second
  };

  // Stop energy refill
  const stopRefill = () => {
    if (refillInterval) {
      clearInterval(refillInterval);
      refillInterval = null;
    }
  };

  // Call this function whenever the user sends a message
  const resetRefillTimer = async () => {
    lastMessageTime = Date.now(); // Reset timer when a message is sent
    stopRefill(); // Stop current refill process
    setTimeout(() => {
      startRefill(); // Start refill again after 5 seconds of no messages
    }, 5000);
  };

  await startRefill(); // Initially start refill process

  return { resetRefillTimer, startRefill, stopRefill }; // Return the methods to manage refill externally
};
