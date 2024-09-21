import React, { useState, useEffect, Suspense, lazy } from 'react';
import Cookies from 'js-cookie';
import Confetti from 'react-confetti';
import Footer from '@/components/Footer';
import SubHeader from '@/components/SubHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';

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
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0); // Countdown timer
  const [isNextRoundDisabled, setIsNextRoundDisabled] = useState<boolean>(true);
  const router = useRouter();

  const userId = Cookies.get('userId'); // Get the current user's ID from cookies (Assuming it's already set somewhere)

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/get-matches`);
      const data = await response.json();
      setMatches(data);
      setLoading(false);
    } catch (error) {
      setErrorMessage('Failed to load matches. Please try again later.');
    }
  };

  useEffect(() => {
    const storedUserId = Cookies.get('lastFetchUserId'); // Fetch stored userId with last fetch time
    const lastFetch = Cookies.get('lastFetchTime');

    // Only use the lastFetchTime if the userIds match
    if (lastFetch && storedUserId === userId) {
      setLastFetchTime(Number(lastFetch));
      const currentTime = Date.now();
      const timeDiff = 120000 - (currentTime - Number(lastFetch));

      if (timeDiff > 0) {
        setCountdown(timeDiff / 1000);
        setIsNextRoundDisabled(true);
      }
    } else {
      // Reset last fetch if userId does not match
      Cookies.remove('lastFetchTime');
      Cookies.remove('lastFetchUserId');
    }

    fetchMatches();
  }, [userId]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsNextRoundDisabled(false); // Enable button once countdown reaches zero
    }
  }, [countdown]);

  const handleNextRound = async () => {
    const currentTime = Date.now();
    if (lastFetchTime && currentTime - lastFetchTime < 120000) {
      setErrorMessage('Please wait 2 minutes before reshuffling matches.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/get-matches`);
      const data = await response.json();
      setMatches(data);
      setSuccessMessage('New matches loaded!');
      setLoading(false);

      // Store both lastFetchTime and userId to ensure the correct user
      Cookies.set('lastFetchTime', currentTime.toString());
      Cookies.set('lastFetchUserId', userId || '');

      setLastFetchTime(currentTime);
      setCountdown(120); // Reset countdown to 2 minutes (120 seconds)
      setIsNextRoundDisabled(true);
    } catch (error) {
      setErrorMessage('Error loading next round.');
    }
  };

  return (
    <div className="container flex flex-col mx-auto h-screen p-4">
      <div className="">
        <SubHeader title="Bet, Predict & Win" />

        <div className="flex-1 grid grid-cols-1 gap-1 h-50 overflow-y-auto my-1">
          {loading
            ? Array(10)
                .fill(0)
                .map((_, index) => <MatchSkeleton key={index} />)
            : matches.map((match) => (
                <div
                  key={match.id}
                  className="flex justify-between items-center border-b p-6 shadow-md cursor-pointer hover:bg-gray-800"
                  style={{ minHeight: '50px' }}
                >
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
                    <div className="text-xxs mx-4">VS</div>
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

                  <div className="flex space-x-4">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center space-x-2 px-3 py-1 border border-green-500 text-green-500 bg-transparent rounded-lg hover:bg-green-500 hover:text-white transition"
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                      <span className="text-xs">BULL</span>
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center space-x-2 px-3 py-1 border border-red-500 text-red-500 bg-transparent rounded-lg hover:bg-red-500 hover:text-white transition"
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                      <span className="text-xs">BEAR</span>
                    </button>
                  </div>
                </div>
              ))}
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          {errorMessage && (
            <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
          )}
          {successMessage && (
            <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
          )}
        </Suspense>

        <div className="fixed bottom-16 left-0 right-0 flex justify-center w-full space-x-4 z-50 px-4">
          {countdown > 0 ? (
            <div className="text-center text-gray-700">{`Next round in ${Math.floor(countdown)} seconds`}</div>
          ) : (
            <button
              className="bg-purple-600 text-white w-1/2 px-4 py-4 rounded-lg"
              onClick={handleNextRound}
              disabled={isNextRoundDisabled}
            >
              Next Round
            </button>
          )}

            <button
              className="bg-green-600 text-white w-1/2 px-4 py-4 rounded-lg"
              onClick={handleNextRound}
            >
             BetSlip
            </button>
        </div>

        <Footer theme={theme} />
      </div>
    </div>
  );
};


export default BetList;

