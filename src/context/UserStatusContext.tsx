import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserStatusContextProps {
  setUserId: (id: string) => void; // Provide a function to update userId
}

interface UserStatusProviderProps {
  children: ReactNode;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const UserStatusContext = createContext<UserStatusContextProps | undefined>(undefined);

export const UserStatusProvider: React.FC<UserStatusProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null); // Track userId in state

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return; // Only send heartbeat if userId is defined

    const sendHeartbeat = async (online: boolean) => {
      if (!online) return;
      try {
        await fetch(`${apiUrl}/api/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, online }),
        });
      } catch (error) {
        // Optionally log the error
        // console.error('Error sending heartbeat:', error);
      }
    };

    const handleOnlineStatusChange = (online: boolean) => {
      sendHeartbeat(online);
    };

    handleOnlineStatusChange(navigator.onLine);

    window.addEventListener('online', () => handleOnlineStatusChange(true));
    window.addEventListener('offline', () => handleOnlineStatusChange(false));

    const heartbeatInterval = setInterval(() => {
      sendHeartbeat(navigator.onLine);
    }, 5000); // Send heartbeat every 5 seconds

    return () => {
      window.removeEventListener('online', () => handleOnlineStatusChange(true));
      window.removeEventListener('offline', () => handleOnlineStatusChange(false));
      clearInterval(heartbeatInterval);
    };
  }, [userId]); // Effect will run only when userId changes

  return (
    <UserStatusContext.Provider value={{ setUserId }}>
      {children}
    </UserStatusContext.Provider>
  );
};

// Custom hook to use the UserStatus context
export const useUserStatus = (): UserStatusContextProps => {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
};


