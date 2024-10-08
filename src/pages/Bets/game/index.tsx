import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Token {
  symbol: string;
  logo: string;
}

interface Odds {
  volume: {
    token_a_odds: number;
    token_b_odds: number;
    draw_odds: number;
  };
  trades: {
    token_a_odds: number;
    token_b_odds: number;
    draw_odds: number;
  };
  price: {
    token_a_odds: number;
    token_b_odds: number;
    draw_odds: number;
  };
  marketcap: {
    token_a_odds: number;
    token_b_odds: number;
    draw_odds: number;
  };
}

const GamePage: React.FC = () => {
  const router = useRouter();
  const { token1Symbol, token1Logo, token2Symbol, token2Logo, action, match_id } = router.query;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState('');
  const [matchAction, setMatchAction] = useState<'BULL' | 'BEAR' | null>(null);
  const [selectedOdd, setSelectedOdd] = useState<'home' | 'draw' | 'away' | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const userId = Cookies.get('userId');
  const [odds, setOdds] = useState<Odds | null>(null);

  // Set match action based on the query parameter
  useEffect(() => {
    if (action === 'BULL' || action === 'BEAR') {
      setMatchAction(action as 'BULL' | 'BEAR');
    }
  }, [action]);

  const handleDurationChange = (selectedDuration: string) => {
    //const formattedDuration = formatDuration(selectedDuration);
    setDuration(selectedDuration);
  };
  
  const formatDuration = (duration: string): string => {
    if (duration.includes('minutes')) {
      return duration.replace(' minutes', 'm');
    } else if (duration.includes('hour')) {
      return duration.replace(' hour', 'h').replace('s', '');
    } else if (duration.includes('hours')) {
      return duration.replace(' hours', 'h');
    }
    return duration; // Fallback in case of other formats
  };

  const handleOddSelection = (oddType: 'home' | 'draw' | 'away') => {
    setSelectedOdd(oddType);
  };


  // Get the current user's ID from cookies (Assuming it's already set somewhere)

  const fetchOdds = useCallback(async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const response = await fetch(`${apiUrl}/api/getOdds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id, 
          user_id: userId, 
          duration, 
          bull_or_bear: matchAction,
        }),
      });
      const data = await response.json();
      setOdds(data); // Assume data contains odds for home, draw, away
      setLoading(false); // Stop loading after fetching
    } catch (error) {
      setErrorMessage('Failed to load odds. Please try again later.');
      setLoading(false); // Stop loading even if there's an error
    }
  }, [match_id, userId, duration, matchAction]);

  // Call fetchOdds when duration changes
  useEffect(() => {
    if (duration) {
      fetchOdds();
    }
  }, [duration, fetchOdds]);

  return (
    <div className="flex flex-col items-center min-h-screen overflow-x-hidden">
      {/* Match Information */}
      <div className="flex justify-center items-center space-x-4 my-8">
        <div className="flex items-center space-x-2">
          <Image src={token1Logo as string} alt={token1Symbol as string} width={60} height={60} />
          <span className="text-2xl font-bold">{token1Symbol}</span>
        </div>
        <span className="text-sm font-bold">VS</span>
        <div className="flex items-center space-x-2">
          <Image src={token2Logo as string} alt={token2Symbol as string} width={80} height={80} />
          <span className="text-2xl font-bold">{token2Symbol}</span>
        </div>
      </div>

      {/* Bull/Bear Indicator */}
      {matchAction && (
        <div
          className={`absolute top-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-bold ${
            matchAction === 'BULL' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {matchAction}
        </div>
      )}

      {/* Duration Selection */}
      <div className="my-6  w-full">
        <h3 className="text-lg font-semibold">Select Duration</h3>
        <div className="flex space-x-4 mt-4 overflow-x-auto whitespace-nowrap">
          {['15m', '30m', '1h', '4h', '6h', '24h'].map((d) => (
            <button
              key={d}
              className={`px-6 py-2 border rounded-lg ${
                duration === d ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'
              }`}
              onClick={() => handleDurationChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Odds Section */}
      {duration && odds && (
        <div className="mt-8 w-full px-4">
          {['volume', 'trades', 'price', 'marketcap'].map((metric) => (
            <div key={metric} className="mt-6 w-full px-4">
              <h3 className="text-xl font-bold capitalize">
                {matchAction === 'BULL'
                  ? `Percentage ${metric} Increase`
                  : `Percentage ${metric} Decrease`} in the next {duration}
              </h3>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Home</span>
                  <span className="text-sm">Draw</span>
                  <span className="text-sm">Away</span>
                </div>

                {loading ? (
                  <div className="flex justify-between animate-pulse">
                    <div className="bg-gray-200 h-6 w-12"></div>
                    <div className="bg-gray-200 h-6 w-12"></div>
                    <div className="bg-gray-200 h-6 w-12"></div>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-bold">{odds[metric as keyof Odds].token_a_odds}</span>
                    <span className="text-sm text-gray-500 font-bold">{odds[metric as keyof Odds].draw_odds}</span>
                    <span className="text-sm text-gray-500 font-bold">{odds[metric as keyof Odds].token_b_odds}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default GamePage;
