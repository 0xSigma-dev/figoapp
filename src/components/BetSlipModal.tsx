import React from 'react';
import { useBetSlip } from '@/context/BetSlipContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface BetSlipModalProps {
  onClose: () => void; // Function to handle modal close
}

const BetSlipModal: React.FC<BetSlipModalProps> = ({ onClose }) => {
  const { bets, stake, setStake, calculatePotentialWin, removeBet, clearBets } = useBetSlip();

  const canKickOff = () => {
    const matchMap = new Map<string, Set<string>>(); // Map to hold matchId and metrics
    bets.forEach(bet => {
      const metrics = matchMap.get(bet.match) || new Set<string>();
      metrics.add(bet.metric_type); // Use metric_type for differentiation
      matchMap.set(bet.match, metrics);
    });

    // Check if there is at least one matchId with two different metrics
    for (const metrics of matchMap.values()) {
      if (metrics.size >= 2) {
        return true; // Enable Kick Off if found
      }
    }
    return false; // Disable Kick Off otherwise
  };

  return (
    <div className="fixed bottom-0 mb-2 w-full p-4 bg-black shadow-lg rounded-lg border-t z-50 overflow-x-hidden">
      {/* Close button */}
      <button className="absolute top-4 right-4 px-2 mr-2 text-red-500" onClick={onClose}>
        <FontAwesomeIcon icon={faTimesCircle} size="2x" />
      </button>
  
      {bets.length === 0 ? (
        <div className="text-center">
          <h3 className="font-bold">You have no bets</h3>
        </div>
      ) : (
        <>
          <h3 className="font-bold">Your Bets</h3>
          <ul>
            {bets.map((bet) => (
              <li key={bet.id} className="flex justify-between mt-2 p-4 items-start">
                {/* Token Pair */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{bet.tokenPairs}</span> {/* Token Pair */}
                  <span className="text-sm">{bet.metric_type}</span> {/* Metric Type */}
                </div>

                {/* Odd Type and Odd */}
                <div className="flex flex-col text-sm text-right">
                  <span>{bet.odd_type}</span> {/* Odd Type */}
                  <span>{bet.odd}</span> {/* Odd */}
                </div>

                {/* Match Action and Duration */}
                <div className="flex flex-col text-xs">
                  <span>{bet.matchAction}</span> {/* Match Action */}
                  <span>{bet.duration}</span> {/* Duration */}
                </div>
                
                {/* Remove Button */}
                <button onClick={() => removeBet(bet.id)} className="text-white bg-red-600 text-xs ml-2">Remove</button>
              </li>
            ))}
          </ul>
  
          <div className="mt-4">
            <label className="block mb-2">Enter Stake</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="border p-2 w-full"
            />
          </div>
  
          <div className="mt-4">
            <h4>Pot Win: {calculatePotentialWin().toFixed(2)}</h4>
          </div>
  
          <div className="mt-4 flex justify-between">
            <button onClick={clearBets} className="bg-red-500 text-white px-4 py-2 rounded">Clear All</button>
            <button 
              className={`bg-purple-500 text-white px-4 py-2 rounded ${canKickOff() ? '' : 'opacity-50 cursor-not-allowed'}`} 
              disabled={!canKickOff()}
            >
              Kick Off
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BetSlipModal;



