import React, { useState, useEffect  } from 'react';
import { useBetSlip } from '@/context/BetSlipContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faTrashAlt  } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient'; 
import Cookies from 'js-cookie'

interface BetSlipModalProps {
  onClose: () => void; // Function to handle modal close
}

const BetSlipModal: React.FC<BetSlipModalProps> = ({ onClose }) => {
  const { bets, stake, setStake, calculatePotentialWin, removeBet, clearBets } = useBetSlip();
  const [tab, setTab] = useState<'single' | 'multiple'>('single');
  const [individualStakes, setIndividualStakes] = useState<{ [id: string]: number }>({});
  const [points, setPoints] = useState<number>(0);
  const [error, setError] = useState<string>(''); // Handle errors
  const [currency, setCurrency] = useState<'figoPoints' | 'figoToken'>('figoPoints'); // State for currency selection
  const userId = Cookies.get('userId');
  const [isExpanded, setIsExpanded] = useState(false); // Track if the modal is expanded or collapsed
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);


  const toggleExpand = () => setIsExpanded(!isExpanded);


  const handleDragStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  // Handle drag move
  const handleDragMove = (e: React.TouchEvent) => {
    if (!isDragging || startY === null) return;
    const currentY = e.touches[0].clientY;
    const dragDistance = currentY - startY;

    if (dragDistance > 50) {
      // If the user drags down, collapse the modal
      setIsExpanded(false);
    } else if (dragDistance < -50) {
      // If the user drags up, expand the modal
      setIsExpanded(true);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setStartY(null);
  };




  useEffect(() => {
    const fetchUserPoints = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching points:', error);
      } else {
        setPoints(data?.points || 0);
      }
    };

    fetchUserPoints();
  }, [userId]);

  const canKickOff = () => {
    const matchMap = new Map<string, Set<string>>(); // Map to hold matchId and metrics
    bets.forEach(bet => {
      const metrics = matchMap.get(bet.match) || new Set<string>();
      metrics.add(bet.metric_type); // Use metric_type for differentiation
      matchMap.set(bet.match, metrics);
    });
  
    // Check if there is at least one matchId with two different metrics
    let multipleMetricsMatch = false;
    for (const metrics of matchMap.values()) {
      if (metrics.size >= 2) {
        multipleMetricsMatch = true;
        break; // We found a match with two different metrics, no need to continue
      }
    }
  
    // Validate stake based on points
    const totalStake = tab === 'single'
      ? Object.values(individualStakes).reduce((sum, curr) => sum + curr, 0)
      : stake;
  
    if (totalStake > points) {
      setError('Insufficient Figo points');
      return false;
    }
  
    // Check for multiple bet validation
    if (tab === 'multiple' && stake > points) {
      setError('Insufficient Figo points for multiple');
      return false;
    }
  
    // Check for single bet validation (each input should be <= available points)
    if (tab === 'single') {
      for (let key in individualStakes) {
        if (individualStakes[key] > points) {
          setError(`Insufficient Figo points for bet: ${key}`);
          return false;
        }
      }
    }
  
    // Clear error if all checks pass
    setError('');
  
    // Enable Kick Off if a match has at least two different metrics
    return multipleMetricsMatch;
  };
  

  const handleStakeChange = (betId: string, value: number) => {
    setIndividualStakes({ ...individualStakes, [betId]: value });
  };

  return (
    <div
      className={`fixed bottom-0 w-full bg-black shadow-lg rounded-t-lg z-50 transition-transform duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-2/3'}`} // Adjust sliding based on `isExpanded`
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >

      <div className="w-full flex justify-center py-2">
        <div className="w-12 h-1 bg-gray-400 rounded-full cursor-pointer" onClick={toggleExpand} />
      </div>
      {/* Close button */}
      <button className="absolute top-4 right-4 px-2 mr-2 text-red-500" onClick={onClose}>
        <FontAwesomeIcon icon={faTimesCircle} size="2x" />
      </button>

      {bets.length === 0 && (
        <div className="text-center">
          <h3 className="font-bold">You have no bets</h3>
        </div>
      )} 


      {bets.length === 1 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Your Bets</h3>
            {/* Clear All button with delete icon */}
            <button onClick={clearBets} className="flex items-center text-red-500">
              <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
              Clear All
            </button>
          </div>

          {/* User Points */}
          <div className="mt-2 text-sm text-gray-300">FP: {points}</div>

          {/* Currency Selection Box */}
          <div className="mt-4">
            <label className="block mb-2">Payment Method</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'figoPoints' | 'figoToken')}
              className="border p-2 w-full rounded-lg"
            >
              <option value="figoPoints">Figo Points</option>
              <option value="figoToken" disabled>
                $FIGO Token (soon)
              </option>
            </select>
          </div>

          {/* Tabs for Single and Multiple */}
          <div className="mt-4 flex">
            <button
              className={`w-1/2 p-2 text-center ${tab === 'single' ? 'bg-gray-700 text-white' : 'bg-gray-300'}`}
              onClick={() => setTab('single')}
            >
              Single
            </button>
            <button
              className={`w-1/2 p-2 text-center ${tab === 'multiple' ? 'bg-gray-700 text-white' : 'bg-gray-300'}`}
              onClick={() => setTab('multiple')}
            >
              Multiple
            </button>
          </div>

          {/* Bet list */}
          <ul className="mt-4">
            {bets.map((bet) => (
              <li key={bet.id} className="flex justify-between mt-2 p-4 items-start">
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{bet.tokenPairs}</span>
                  <span className="text-sm">{bet.metric_type}</span>
                </div>

                <div className="flex flex-col text-sm text-right">
                  <span>{bet.odd_type}</span>
                  <span>{bet.odd}</span>
                </div>

                <div className="flex flex-col text-xs">
                  <span>{bet.matchAction}</span>
                  <span>{bet.duration}</span>
                </div>

                <button onClick={() => removeBet(bet.id)} className="text-white bg-red-600 rounded-full px-2 text-xs ml-2">Remove</button>
              </li>
            ))}
          </ul>

          {/* Stake Input based on tab */}
          {tab === 'single' ? (
            <>
              {bets.map((bet) => (
                <div key={bet.id} className="mt-4">
                  <label className="block mb-2">Stake for {bet.tokenPairs}</label>
                  <input
                    type="number"
                    value={individualStakes[bet.id] || ''}
                    onChange={(e) => handleStakeChange(bet.id, Number(e.target.value))}
                    className="border p-2 w-full rounded-lg"
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="mt-4">
              <label className="block mb-2">Total Stake</label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="border p-2 w-full rounded-lg"
              />
            </div>
          )}

          {/* Error message */}
          {error && <div className="text-red-500 mt-2">{error}</div>}

          {/* Potential Win */}
          <div className="mt-4">
            <h4>Pot Win: {calculatePotentialWin().toFixed(2)}</h4>
          </div>

          {/* Kick Off button */}
          <div className="mt-4 w-full">
            <button
              className={`bg-purple-500 text-white w-full px-4 py-2 rounded ${canKickOff() ? '' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!canKickOff()}
            >
              Kick Off
            </button>
          </div>
        </>
      )}

      {/* If expanded, show full modal content */}
      {bets.length > 1 && isExpanded ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Your Bets</h3>
            {/* Clear All button with delete icon */}
            <button onClick={clearBets} className="flex items-center text-red-500">
              <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
              Clear All
            </button>
          </div>

          {/* User Points */}
          <div className="mt-2 text-sm text-gray-300">FP: {points}</div>

          {/* Currency Selection Box */}
          <div className="mt-4">
            <label className="block mb-2">Payment Method</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'figoPoints' | 'figoToken')}
              className="border p-2 w-full rounded-lg"
            >
              <option value="figoPoints">Figo Points</option>
              <option value="figoToken" disabled>
                $FIGO Token (soon)
              </option>
            </select>
          </div>

          {/* Tabs for Single and Multiple */}
          <div className="mt-4 flex">
            <button
              className={`w-1/2 p-2 text-center ${tab === 'single' ? 'bg-gray-700 text-white' : 'bg-gray-300'}`}
              onClick={() => setTab('single')}
            >
              Single
            </button>
            <button
              className={`w-1/2 p-2 text-center ${tab === 'multiple' ? 'bg-gray-700 text-white' : 'bg-gray-300'}`}
              onClick={() => setTab('multiple')}
            >
              Multiple
            </button>
          </div>

          {/* Bet list */}
          <ul className="mt-4">
            {bets.map((bet) => (
              <li key={bet.id} className="flex justify-between mt-2 p-4 items-start">
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{bet.tokenPairs}</span>
                  <span className="text-sm">{bet.metric_type}</span>
                </div>

                <div className="flex flex-col text-sm text-right">
                  <span>{bet.odd_type}</span>
                  <span>{bet.odd}</span>
                </div>

                <div className="flex flex-col text-xs">
                  <span>{bet.matchAction}</span>
                  <span>{bet.duration}</span>
                </div>

                <button onClick={() => removeBet(bet.id)} className="text-white bg-red-600 rounded-full px-2 text-xs ml-2">Remove</button>
              </li>
            ))}
          </ul>

          {/* Stake Input based on tab */}
          {tab === 'single' ? (
            <>
              {bets.map((bet) => (
                <div key={bet.id} className="mt-4">
                  <label className="block mb-2">Stake for {bet.tokenPairs}</label>
                  <input
                    type="number"
                    value={individualStakes[bet.id] || ''}
                    onChange={(e) => handleStakeChange(bet.id, Number(e.target.value))}
                    className="border p-2 w-full rounded-lg"
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="mt-4">
              <label className="block mb-2">Total Stake</label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="border p-2 w-full rounded-lg"
              />
            </div>
          )}

          {/* Error message */}
          {error && <div className="text-red-500 mt-2">{error}</div>}

          {/* Potential Win */}
          <div className="mt-4">
            <h4>Pot Win: {calculatePotentialWin().toFixed(2)}</h4>
          </div>

          {/* Kick Off button */}
          <div className="mt-4 w-full">
            <button
              className={`bg-purple-500 text-white w-full px-4 py-2 rounded ${canKickOff() ? '' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!canKickOff()}
            >
              Kick Off
            </button>
          </div>
        </>
      ) : (
        // If not expanded, only show the number of active bets and close button
        <div className="flex justify-between items-center px-4 py-2">
          <span className="text-white">{bets.length} active bet{bets.length !== 1 ? 's' : ''}</span>
          <button className="text-red-500" onClick={onClose}>
            <FontAwesomeIcon icon={faTimesCircle} size="2x" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BetSlipModal;



