import React, { createContext, useContext, useState } from 'react';

interface Bet {
    id: string;
    match: string;
    odd: number;
    metric_type?: string; // Added metric_type
    user_id?: string;     // Added user_id
    duration?: string;    // Added duration
    matchAction?: 'BULL' | 'BEAR'; 
  }

interface BetSlipContextProps {
  bets: Bet[];
  stake: number;
  addBet: (bet: Bet) => void;
  removeBet: (id: string) => void;
  setStake: (amount: number) => void;
  calculatePotentialWin: () => number;
  clearBets: () => void;
}

const BetSlipContext = createContext<BetSlipContextProps | undefined>(undefined);

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (!context) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  return context;
};

// Define the type for the children prop
export const BetSlipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stake, setStake] = useState<number>(0);

  const addBet = (bet: Bet) => {
    setBets((prev) => [...prev, bet]);
  };

  const removeBet = (id: string) => {
    setBets((prev) => prev.filter((bet) => bet.id !== id));
  };

  const calculatePotentialWin = () => {
    const totalOdds = bets.reduce((acc, bet) => acc * bet.odd, 1);
    return stake * totalOdds;
  };

  const clearBets = () => {
    setBets([]);
    setStake(0);
  };

  return (
    <BetSlipContext.Provider value={{ bets, stake, addBet, removeBet, setStake, calculatePotentialWin, clearBets }}>
      {children}
    </BetSlipContext.Provider>
  );
};

