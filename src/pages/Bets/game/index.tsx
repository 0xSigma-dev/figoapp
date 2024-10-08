import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Token {
  symbol: string;
  logo: string;
}

const GamePage: React.FC = () => {
  const router = useRouter();
  const { token1Symbol, token1Logo, token2Symbol, token2Logo, action } = router.query;

  const [duration, setDuration] = useState('');
  const [matchAction, setMatchAction] = useState<'BULL' | 'BEAR' | null>(null);

  // Set match action based on the query parameter
  useEffect(() => {
    if (action === 'BULL' || action === 'BEAR') {
      setMatchAction(action as 'BULL' | 'BEAR');
    }
  }, [action]);

  const handleDurationChange = (selectedDuration: string) => {
    setDuration(selectedDuration);
  };

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
      <div className="my-6">
        <h3 className="text-lg font-semibold">Select Duration</h3>
        <div className="flex space-x-4 mt-4 overflow-x-auto">
          {['15 minutes', '30 minutes', '1 hour', '4 hours', '6 hours', '24 hours'].map((d) => (
            <button
              key={d}
              className={`px-4 py-2 border rounded-lg ${
                duration === d ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'
              }`}
              onClick={() => handleDurationChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Volume/Trade/Price Information */}
      {duration && (
      <div className='overflow-y-auto overflow-x-hidden'>
        <div className="mt-8 w-full px-4">
          <h3 className="text-xl font-bold">
            {matchAction === 'BULL' ? 'Volume Increase' : 'Volume Decrease'} in the next {duration}
          </h3>

          {/* Odds Section */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Home</span>
              <span className="text-sm">Draw</span>
              <span className="text-sm">Away</span>
             
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500 font-bold">Odds for Home</span>
              <span className="text-sm text-gray-500  font-bold">Odds for Draw</span>
              <span className="text-sm text-gray-500  font-bold">Odds for Away</span>
             
            </div>
          </div>

          {/* Trades Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold">
              {matchAction === 'BULL' ? 'Number of Trades Increase' : 'Number of Trades Decrease'} in
              the next {duration}
            </h3>
           {/* Odds Section */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Home</span>
              <span className="text-sm">Draw</span>
              <span className="text-sm">Away</span>
             
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500  font-bold">Odds for Home</span>
              <span className="text-sm text-gray-500  font-bold">Odds for Draw</span>
              <span className="text-sm text-gray-500  font-bold">Odds for Away</span>
             
            </div>
          </div>
          </div>

          {/* Price Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold">
              {matchAction === 'BULL' ? 'Price Increase' : 'Price Decrease'} in the next {duration}
            </h3>
            {/* Odds Section */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Home</span>
              <span className="text-sm">Draw</span>
              <span className="text-sm">Away</span>
             
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500  font-bold">Odds for Home</span>
              <span className="text-sm text-gray-500  font-bold">Odds for Draw</span>
              <span className="text-sm text-gray-500  font-bold">Odds for Away</span>
             
            </div>
          </div>
          </div>

          {/* MarketCap Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold">
              {matchAction === 'BULL' ? 'Marketcap Increase' : 'Marketcap Decrease'} in the next {duration}
            </h3>
            {/* Odds Section */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Home</span>
              <span className="text-sm">Draw</span>
              <span className="text-sm">Away</span>
             
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500  font-bold">Odds for Home</span>
              <span className="text-sm text-gray-500 font-bold">Odds for Draw</span>
              <span className="text-sm text-gray-500  font-bold">Odds for Away</span>
             
            </div>
          </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
