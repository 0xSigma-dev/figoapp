import React, { createContext, useContext, useEffect, ReactNode } from 'react';

interface UserStatusContextProps {
  // Add any values you want to expose from the context, or leave as an empty object
}

interface UserStatusProviderProps {
  userId: string;
  children: ReactNode;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const UserStatusContext = createContext<UserStatusContextProps | undefined>(undefined);

export const UserStatusProvider: React.FC<UserStatusProviderProps> = ({ userId, children }) => {
  
  useEffect(() => {
    // Only run if window (and thus navigator) is defined, i.e., in the browser
    if (typeof window !== 'undefined') {
      const sendHeartbeat = async (online: boolean) => {
        try {
          await fetch(`${apiUrl}/api/heartbeat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, online }),
          });
        } catch (error) {
          //console.error('Error sending heartbeat:', error);
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
    }
  }, [userId]);

  return (
    <UserStatusContext.Provider value={{}}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = (): UserStatusContextProps => {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
};


