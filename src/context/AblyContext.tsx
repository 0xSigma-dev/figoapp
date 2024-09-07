// context/AblyContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Ably from 'ably';
import Cookies from 'js-cookie';

interface AblyContextType {
  ablyClient: Ably.Realtime | null;
}

const AblyContext = createContext<AblyContextType | undefined>(undefined);

// Ably Provider component
export const AblyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null);

  useEffect(() => {
    const userId = Cookies.get('userId') || '';
    const client = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      clientId: userId
    });
    setAblyClient(client);
  }, []);

  return (
    <AblyContext.Provider value={{ ablyClient }}>
      {children}
    </AblyContext.Provider>
  );
};

// Custom hook to use the Ably context
export const useAbly = (): AblyContextType => {
  const context = useContext(AblyContext);
  if (!context) {
    throw new Error('useAbly must be used within an AblyProvider');
  }
  return context;
};
