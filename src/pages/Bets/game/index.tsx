import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Image from 'next/image';
import SubHeader from '@/components/SubHeader';
import Footer from '@/components/Footer';

interface Token {
  symbol: string;
  logo: string;
}


interface GameProps {
  theme: 'light' | 'dark';
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


type OddsMetric = keyof Odds;

const GamePage: React.FC<GameProps> = ({ theme }) => {
  const router = useRouter();
  const { token1Symbol, token1Logo, token2Symbol, token2Logo, action } = router.query;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState('');
  const [matchAction, setMatchAction] = useState<'BULL' | 'BEAR' | null>(null);
  const [selectedOdd, setSelectedOdd] = useState<{ metric: OddsMetric, oddType: 'home' | 'draw' | 'away' } | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const userId = Cookies.get('userId');
  const matchId = Cookies.get('matchId');
  const [odds, setOdds] = useState<Odds | null>(null);

  

  useEffect(() => {
    if (action === 'BULL' || action === 'BEAR') {
      setMatchAction(action as 'BULL' | 'BEAR');
    }
  }, [action]);

  const handleDurationChange = (selectedDuration: string) => {
    setDuration(selectedDuration);
  };

  const handleOddClick = (metric: OddsMetric, oddType: 'home' | 'draw' | 'away') => {
    setSelectedOdd({ metric, oddType });
  };

  const fetchOdds = useCallback(async () => {

    if (!matchId) {
      console.error('matchId is not defined');
      return;
    }

    try {
      setLoading(true); 
      const response = await fetch(`${apiUrl}/api/getOdds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId, 
          user_id: userId, 
          duration, 
          bull_or_bear: matchAction,
        }),
      });
      

      if (!response.ok) {
        throw new Error('Match not found');
      }

      const data = await response.json();
      console.log('data', data)
      setOdds(data);
      setLoading(false);
    } catch (error) {
      console.error('error', error);
      setErrorMessage('Failed to load odds. Please try again later.');
      setLoading(false);
    }
  }, [matchId, userId, duration, matchAction]);

  useEffect(() => {
    if (duration && matchId && matchAction){
      fetchOdds();
    }
  }, [duration, matchId, matchAction, fetchOdds]);

  return (
    <div className="flex flex-col items-center min-h-screen overflow-x-hidden">

      <SubHeader title="Pick Your Odds" />
      <div className="flex justify-center items-center space-x-4 my-8">
        <div className="flex items-center space-x-2">
          <Image src={token1Logo as string} alt={token1Symbol as string} width={80} height={80} />
          <span className="text-2xl font-bold">{token1Symbol}</span>
        </div>
        <span className="text-sm font-bold">VS</span>
        <div className="flex items-center space-x-2">
          <Image src={token2Logo as string} alt={token2Symbol as string} width={80} height={80} />
          <span className="text-2xl font-bold">{token2Symbol}</span>
        </div>
      </div>

      {matchAction && (
        <div className={`absolute top-4 right-4 px-2 py-2 rounded-lg text-white text-xs font-bold ${matchAction === 'BULL' ? 'bg-green-500' : 'bg-red-500'}`}>
          {matchAction}
        </div>
      )}

      <div className="my-6  w-full">
        <h3 className="text-lg font-semibold">Select Duration</h3>
        <div className="flex space-x-4 mt-4 overflow-x-auto whitespace-nowrap">
          {['15m', '30m', '1h', '4h', '6h', '24h'].map((d) => (
            <button
              key={d}
              className={`px-6 py-2 border rounded-lg ${duration === d ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
              onClick={() => handleDurationChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {duration && (
  <div className="mt-6 w-full px-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}> {/* Added scroll */}
    {odds ? (
      (['volume', 'trades', 'price', 'marketcap'] as OddsMetric[]).map((metric) => (
        <div key={metric} className="mt-6 w-full px-4">
          <h3 className="text-lg font-bold capitalize">
            {matchAction === 'BULL' ? `Percentage ${metric} Increase` : `Percentage ${metric} Decrease`} in the next {duration}
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Home</span>
              <span className="text-sm">Draw</span>
              <span className="text-sm">Away</span>
            </div>
            {loading ? (
              <div className="flex justify-between animate-pulse">
                <div className="bg-gray-200 h-6 w-1/3"></div>
                <div className="bg-gray-200 h-6 w-1/3"></div>
                <div className="bg-gray-200 h-6 w-1/3"></div>
              </div>
            ) : (
              <div className="flex justify-between w-full">
                <button
                  className={`px-4 py-2 w-1/3 rounded-lg ${
                    selectedOdd?.metric === metric && selectedOdd?.oddType === 'home'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                  onClick={() => handleOddClick(metric, 'home')}
                >
                  {odds[metric]?.token_a_odds ?? 'No odds'}x
                </button>
                <button
                  className={`px-4 py-2 w-1/3 rounded-lg ${
                    selectedOdd?.metric === metric && selectedOdd?.oddType === 'draw'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                  onClick={() => handleOddClick(metric, 'draw')}
                >
                  {odds[metric]?.draw_odds ?? 'No odds'}x
                </button>
                <button
                  className={`px-4 py-2 w-1/3 rounded-lg ${
                    selectedOdd?.metric === metric && selectedOdd?.oddType === 'away'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                  onClick={() => handleOddClick(metric, 'away')}
                >
                  {odds[metric]?.token_b_odds ?? 'No odds'}x
                </button>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <p>No odds available</p>
    )}
  </div>
)}

      <Footer theme={theme} />
    </div>
  );
};

export default GamePage;

