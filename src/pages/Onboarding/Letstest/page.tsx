"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Connection, PublicKey } from '@solana/web3.js';
import Confetti from 'react-confetti';
import { useUser } from '@/context/UserContext';
import Cookies from 'js-cookie';
import WalletGuard from '../../../components/WalletGuard';

const SolanaAgeGuessingGame: React.FC = () => {
  const [isTyping, setIsTyping] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [guessedAge, setGuessedAge] = useState('');
  const [guessedTransactions, setGuessedTransactions] = useState('');
  const [accountAge, setAccountAge] = useState<number | null>(null);
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  const typingText = "Can you guess how old your Solana account is? And can you guess how many transactions you have done on Solana so far? If yes, enter your guesses below and win points! Just guess , you will still earn points anyways";

  useEffect(() => {
    router.prefetch('../../Home/page');
    const typeText = (text: string, index: number) => {
      if (index < text.length) {
        setTypedText((prev) => prev + text.charAt(index));
        setTimeout(() => typeText(text, index + 1), 50); // Adjust typing speed by changing 50
      } else {
        setIsTyping(false);
      }
    };

    typeText(typingText, 0);
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = Cookies.get('userId');
      if (!userId) throw new Error('User ID not found');

      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.subcollections);
      //console.log('Fetched user data:', data);
    } catch (error) {
      //console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);


const HELIUS_RPC_URL = "https://devnet.helius-rpc.com/?api-key=4881c3ea-d963-43c2-a841-ceea3ff78e6a"; // Replace with your Helius API key

// Remove publicKey from getTransactionCount
const getAccountAgeAndTransactions = async (publicKeyBase58: string) => {
  //console.log('Starting function execution');
  const address = 'GEyTb1DUhPQQiCbSaHGY6PNZXK2QaFKxSvYrPq9r2ZUt';
  const connection = new Connection("https://api.devnet.solana.com");
  const publicKey = new PublicKey(address);

  try {
    // Fetch account info using getAccountInfo
    const accountInfo = await connection.getAccountInfo(publicKey);
    //console.log('Fetched accountInfo:', accountInfo);

    if (!accountInfo || accountInfo.rentEpoch === undefined) {
      //console.error('Account not found or rentEpoch is undefined.');
      throw new Error("Account not found or rentEpoch is undefined");
    }

    const { rentEpoch } = accountInfo; // Correctly retrieve rentEpoch
    //console.log('Fetched rentEpoch:', rentEpoch);

    // Fetch block time for rentEpoch
    const creationBlockTime = (await connection.getBlockTime(rentEpoch)) || Date.now() / 1000;
    //console.log('Fetched creationBlockTime:', creationBlockTime);

    const currentTime = Date.now() / 1000;
    //console.log('Current time:', currentTime);

    const ageInSeconds = currentTime - creationBlockTime;
    //console.log('Calculated ageInSeconds:', ageInSeconds);

    const ageInMonths = Math.floor(ageInSeconds / (30 * 24 * 60 * 60)); // Approximate age in months
    //console.log('Calculated ageInMonths:', ageInMonths);

    // Fetch transaction count
    //console.log('Fetching transaction count...');
    const transactionCount = await connection.getTransactionCount(); // No need for publicKey here
    //console.log('Fetched transactionCount:', transactionCount);

    // Update UI with the results
    console.log('Setting account age and transaction count in the UI');
    setAccountAge(ageInMonths);
    setTransactionCount(transactionCount);
    setShowResults(true);

    //console.log('Function execution complete');
  } catch (error: any) {
    //console.error("Failed to fetch account info:", error);
    //console.error("Error details:", error.message || error.response || error.toString());
    return null;
  }
};




  const handleCheck = async () => {
    router.prefetch('../../Home/page');
    router.push('../../Home/page')
    const publicKey = user?.public?.[0]?.data?.publicKey;
    if (publicKey) {
      await getAccountAgeAndTransactions(publicKey);
    } else {
      //console.log('No public key available');
    }
  };

  const handleClaimRewards = () => {
    setShowConfetti(true);
    // Call updatePoints function here to update the user's points
    // Example: updatePoints(newPoints);
  };

  useEffect(() => {
    if (user?.private?.[0]?.solanaagecheck === 'false') {
      handleCheck();
    }
  }, [user]);

  return (
    <WalletGuard>
    <div className="mr-6 ml-6 flex flex-col h-screen items-center justify-center bg-white dark:bg-black text-center">
      {isTyping ? (
        <div className="text-xl font-mono ml-4 mr-4 text-black dark:text-white-700">{typedText}</div>
      ) : (
        <div className="text-xl font-mono text-black dark:text-white-700 mb-8">
          {typedText}
          <div className="mt-8">
            <input
              type="text"
              className="p-2 border rounded mr-4"
              placeholder="Solana account age in months"
              value={guessedAge}
              onChange={(e) => setGuessedAge(e.target.value)}
            />
            <input
              type="text"
              className="p-2 border rounded mr-4"
              placeholder="Number of  transactions"
              value={guessedTransactions}
              onChange={(e) => setGuessedTransactions(e.target.value)}
            />
            <button onClick={handleCheck} className="p-2 bg-purple-500 text-white rounded">
              Check
            </button>
          </div>
        </div>
      )}

      {showResults && accountAge !== null && transactionCount !== null && (
        <div className="text-center mt-8">
          <div className="text-8xl text-purple-500">{accountAge}</div>
          <div className="text-2xl text-black dark:text-white-700">months old</div>
          <div className="text-6xl text-green-500 mt-4">{transactionCount}</div>
          <div className="text-xl text-black dark:text-white-700">transactions completed</div>
          <button
            onClick={handleClaimRewards}
            className="mt-8 p-4 bg-purple-500 text-white rounded-lg"
          >
            Claim Rewards
          </button>
          {showConfetti && <Confetti />}
        </div>
      )}
    </div>
    </WalletGuard>
  );
};

export default SolanaAgeGuessingGame;


