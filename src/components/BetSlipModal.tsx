import React from 'react';
import { useBetSlip } from '@/context/BetSlipContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface BetSlipModalProps {
  onClose: () => void; // Function to handle modal close
}

const BetSlipModal: React.FC<BetSlipModalProps> = ({ onClose }) => {
  const { bets, stake, setStake, calculatePotentialWin, removeBet, clearBets } = useBetSlip();

  return (
    <div className="fixed bottom-0 w-full bg-white p-4 shadow-lg border-t z-50 overflow-x-hidden">
      {/* Close button */}
      <button className="absolute top-4 right-4 text-red-500" onClick={onClose}>
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
              <li key={bet.id} className="flex justify-between items-center">
                <span>{bet.match} - Odd: {bet.odd}</span>
                <button onClick={() => removeBet(bet.id)} className="text-red-500">Remove</button>
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
            <button className="bg-green-500 text-white px-4 py-2 rounded">Kick Off</button>
          </div>
        </>
      )}
    </div>
  );
};

export default BetSlipModal;


