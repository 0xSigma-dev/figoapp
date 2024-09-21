import React, { useState, useEffect, Suspense, lazy } from 'react';
import Cookies from 'js-cookie';
import Confetti from 'react-confetti';
import Footer from '@/components/Footer';
import SubHeader from '@/components/SubHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';

// Lazy load modals
const ErrorModal = lazy(() => import('@/components/ErrorModal'));
const SuccessModal = lazy(() => import('@/components/SuccessModal'));

interface BetProps {
  theme: 'light' | 'dark';
}

interface Token {
  symbol: string;
  logo: string;
}

interface Match {
  id: string;
  token1: Token;
  token2: Token;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const MatchSkeleton: React.FC = () => (
  <div className="flex justify-between items-center border p-4 rounded-lg shadow-lg animate-pulse">
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gray-700 rounded-full mr-2"></div>
      <div className="w-16 h-6 bg-gray-700 rounded"></div>
    </div>
    <div className="text-2xl font-bold w-12 h-6 bg-gray-700 rounded"></div>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gray-700 rounded-full mr-2"></div>
      <div className="w-16 h-6 bg-gray-700 rounded"></div>
    </div>
  </div>
);

const BetList: React.FC<BetProps> = ({ theme }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const fetchMatches = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/get-matches`);
      const data = await response.json();
      //console.log('bey data', data)
      setMatches(data);
      setLoading(false); // Assuming the API returns an array of match objects
    } catch (error) {
      setErrorMessage('Failed to load matches. Please try again later.');
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Function to handle "Next Round" click
  const handleNextRound = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/get-matches`);
      const data = await response.json();
      setMatches(data); // Update matches with new round data
      setSuccessMessage('New matches loaded!');
      setLoading(false);
    } catch (error) {
      setErrorMessage('Error loading next round.');
    }
  };

  // Navigate to Bet Slips page
  const handleBetSlips = () => {
    router.push('/bet-slips');
  };

  // Navigate to the match details page
  const handleMatchClick = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };


  const handleBullClick = async (matchId: string) => {
    try {
      await fetch(`${apiUrl}/api/increase`, {
        method: 'POST',
        body: JSON.stringify({ matchId }),
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccessMessage('Bull bet placed!');
    } catch (error) {
      setErrorMessage('Error placing Bull bet.');
    }
  };

  const handleBearClick = async (matchId: string) => {
    try {
      await fetch(`${apiUrl}/api/decrease`, {
        method: 'POST',
        body: JSON.stringify({ matchId }),
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccessMessage('Bear bet placed!');
    } catch (error) {
      setErrorMessage('Error placing Bear bet.');
    }
  };

  return (
    <div className="container mx-auto h-screen p-4">
      <div className="">
        <SubHeader title="Bet, Predict & Win" />

        <div className="grid grid-cols-1 gap-1 h-50 overflow-y-auto my-1">
          {loading
            ? Array(10)
                .fill(0)
                .map((_, index) => <MatchSkeleton key={index} />)
            : matches.map((match) => (
                <div
                  key={match.id}
                  className="flex justify-between items-center border-b border-t p-4 shadow-md cursor-pointer hover:bg-gray-800"
                  onClick={() => handleMatchClick(match.id)}
                  style={{ minHeight: '50px' }}
                >
                  {/* Tokens */}
                  <div className="flex items-center space-x-2 w-2/3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={match.token1.logo}
                        alt={match.token1.symbol}
                        className="w-6 h-6"
                      />
                      <span className="font-bold text-xs truncate">
                        {match.token1.symbol}
                      </span>
                    </div>
                    <div className="text-xxs  mx-4">VS</div>
                    <div className="flex items-center space-x-2">
                      <img
                        src={match.token2.logo}
                        alt={match.token2.symbol}
                        className="w-6 h-6"
                      />
                      <span className="font-bold text-xs truncate">
                        {match.token2.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBullClick(match.id);
                      }}
                      className="flex items-center space-x-2 px-3 py-1 border border-green-500 text-green-500 bg-transparent rounded-lg hover:bg-green-500 hover:text-white transition"
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                      <span className='text-xs'>BULL</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBearClick(match.id);
                      }}
                      className="flex items-center space-x-2 px-3 py-1 border border-red-500 text-red-500 bg-transparent rounded-lg hover:bg-red-500 hover:text-white transition"
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                      <span className='text-xs'>BEAR</span>
                    </button>
                  </div>
                </div>
              ))}
        </div>

    <div className="flex justify-center w-full space-x-4 mt-4">
      <button
        className="bg-purple-600 text-white w-1/2 px-4 py-2 rounded-lg"
        onClick={handleNextRound}
      >
        Next Round
      </button>
      <button
        className="bg-purple-600 text-white w-1/2 px-4 py-2 rounded-lg"
        onClick={handleBetSlips}
      >
        Bet Slips
      </button>
    </div>

        <Suspense fallback={<div>Loading...</div>}>
          {errorMessage && (
            <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
          )}
          {successMessage && (
            <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
          )}
        </Suspense>

        {showConfetti && <Confetti />}

        <Footer theme={theme} />
      </div>
    </div>
  );
};

export default BetList;
