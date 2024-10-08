import React from 'react';
import { useBetSlip } from '@/context/BetSlipContext';

const BetSlipModal: React.FC = () => {
  const { bets, stake, setStake, calculatePotentialWin, removeBet, clearBets } = useBetSlip();

  if (bets.length === 0) return null;

  return (
    <div className="fixed bottom-0 w-full bg-white p-4 shadow-lg border-t">
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
    </div>
  );
};

export default BetSlipModal;
