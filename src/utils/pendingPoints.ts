// Utility function to check if running in the browser
const isBrowser = (): boolean => typeof window !== 'undefined';

export const getPendingPoints = (userId: any): number => {
  if (!isBrowser()) return 0; // Return 0 if not in browser environment

  const storedPendingPoints = localStorage.getItem('pendingPoints');
  const storedData = storedPendingPoints ? JSON.parse(storedPendingPoints) : null;

  if (storedData && storedData.userId === userId) {
    return storedData.points;
  } else {
    return 0; // If no pending points or different user, return 0
  }
};

// Function to add points
export const addPendingPoints = (userId: any, pointsToAdd: number) => {
  if (!isBrowser()) return;

  const currentPoints = getPendingPoints(userId);
  const newPendingPoints = { userId, points: currentPoints + pointsToAdd };
  localStorage.setItem('pendingPoints', JSON.stringify(newPendingPoints));
};

// Function to remove points
export const removePendingPoints = (userId: any, pointsToRemove: number) => {
  if (!isBrowser()) return;

  const currentPoints = getPendingPoints(userId);
  const newPendingPoints = { userId, points: Math.max(currentPoints - pointsToRemove, 0) }; // Ensure points never go below 0
  localStorage.setItem('pendingPoints', JSON.stringify(newPendingPoints));
};
