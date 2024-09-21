import React, { useState, useEffect, Suspense, lazy } from 'react';
import Cookies from 'js-cookie';
import Confetti from 'react-confetti';
import Footer from '@/components/Footer';
import SubHeader from '@/components/SubHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
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
      setMatches(data.matches); 
      setLoading(false); // Assuming the API returns an array of match objects
    } catch (error) {
      setLoading(false);
      setErrorMessage('Failed to load matches. Please try again later.');
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Function to handle "Next Round" click
  const handleNextRound = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/next-round`, { method: 'POST' });
      const data = await response.json();
      setMatches(data.matches); // Update matches with new round data
      setSuccessMessage('New matches loaded!');
      setLoading(false);
    } catch (error) {
      setLoading(false);
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

  return (
    <div className="container mx-auto p-4">
      <div className={`${errorMessage || successMessage ? 'blur-background' : ''}`}>
        <SubHeader title="Bet, Predict & Win" />

        <div className="grid grid-cols-1 gap-4 my-8">
          {loading
            ? Array(10)  // Show up to 10 skeletons while loading
                .fill(0)
                .map((_, index) => <MatchSkeleton key={index} />)
            : matches.map((match) => (
                <div
                  key={match.id}
                  className="flex justify-between items-center border p-4 rounded-lg shadow-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleMatchClick(match.id)}
                >
                  <div className="flex items-center">
                    <img src={match.token1.logo} alt={match.token1.symbol} className="w-8 h-8 mr-2" />
                    <span className="font-bold text-xl">{match.token1.symbol}</span>
                  </div>
                  <div className="text-2xl font-bold">VS</div>
                  <div className="flex items-center">
                    <img src={match.token2.logo} alt={match.token2.symbol} className="w-8 h-8 mr-2" />
                    <span className="font-bold text-xl">{match.token2.symbol}</span>
                  </div>
                </div>
              ))}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            onClick={handleNextRound}
          >
            Next Round
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
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
