"use client";
import React, { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCopy, faGift, faLink, faShareAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@/context/UserContext';
import Lottie from 'react-lottie-player';
import confetti from '../../../components/lottie/confetti.json';
import { supabase } from '@/lib/supabaseClient';
import { getUserData, updateUserDataFields } from '@/utils/indexedDB';
import { Suspense, lazy } from 'react';
import Cookies from 'js-cookie';
import Confetti from 'react-confetti';

const ErrorModal = lazy(() => import('../../../components/ErrorModal'));
const SuccessModal = lazy(() => import('../../../components/SuccessModal'));

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

const ReferralPage = () => {
  const router = useRouter();
  const { user } = useUser() || null;
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [pendingPoints, setPendingPoints] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const userId = Cookies.get('userId')
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      if (userId) {
        const response = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data from API');
        }

        const apiData = await response.json();
        console.log('apiData', apiData); // Make sure you see this in the console

        startTransition(() => {
          setReferralCode(apiData?.user.referralLink || "ABC123");
          setReferralCount(apiData?.user.referralCount || 0);
          setPendingPoints(apiData?.user.pendingref ? apiData.pendingref * 3000 : 0);
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to fetch user data. Please try again later.');
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  };

  // UseEffect to call fetchUserData initially
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const startConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false); // Stop confetti after 5 seconds
    }, 5000);
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralCode)
        .then(() => {
          setSuccessMessage("Referral code copied to clipboard!");
        })
        .catch((err) => {
          setErrorMessage("Failed to copy the referral code. Please try again.");
        });
    } else {
      // Fallback for browsers that do not support the Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = referralCode;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
  
      try {
        document.execCommand('copy');
        setSuccessMessage("Referral code copied to clipboard!");
      } catch (err) {
        setErrorMessage("Failed to copy the referral code. Please try again.");
      }
  
      document.body.removeChild(textArea);
    }
  };
  
  const handleClose = () => {
    router.push('../../Home/page');  // Redirect to the homepage or another route
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Figo Today!',
        text: `Join me on Figo Chat and Earn App today. Figo is changing the Social Media Industry. Don't miss. You earn 3000 points immediately you Signup with my referral link: ${referralCode}`,
      }).catch(error => console.log('Error sharing', error));
    } else {
      setErrorMessage('Sharing is not supported in this browser.');
    }
  };


  const handleClaimPoints = async () => {
    if (pendingPoints <= 0 || !user?.id) return;
  
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (error) {
        throw new Error('Failed to fetch user data');
      }
      const updatedPoints = (userData.points || 0) + pendingPoints;
      const { error: updateError } = await supabase
        .from('users')
        .update({ points: updatedPoints, pendingref: 0 })
        .eq('id', user.id);
  
      if (updateError) {
        throw new Error('Failed to update user points');
      }
      await updateUserDataFields(user.id || '', {
        points: updatedPoints,
        pendingref: 0,
      });
      startConfetti();
      const messageSound = new Audio('/sounds/clapping.wav'); // Path to your sound file
      messageSound.play();
      await fetchUserData();
  
      setSuccessMessage('Points claimed successfully!');
    } catch (error) {
      setErrorMessage('Failed to claim points. Please try again later.');
    }
  };
  


  return (
    <div className="fixed top-0 left-0 h-full w-full bg-white dark:bg-black text-black dark:text-white p-6 z-50 flex flex-col items-center overflow-y-auto">
      <div className="flex items-center w-full">
        <button
          className="text-black dark:text-white hover:text-gray-300"
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
        </button>
        <h2 className="text-2xl text-black dark:text-white font-bold ml-8">
          Invite friends
        </h2>
      </div>
     
      {loading ? (
        <SkeletonLoader /> // Render the skeleton screen while loading
      ) : (
        <>
      <div className="flex-1 flex justify-center items-center">
      <Lottie
            loop
            animationData={confetti}
            play
            style={{
              width: 300,
              height: 300
            }}
          />
      </div>

      <h1 className="text-2xl text-purple-600 font-semibold mb-6">
        Invite friends, Get rewarded
      </h1>

      <div className="w-full max-w-md p-4 border rounded-lg flex items-center justify-between mb-4">
        <span className="text-lg text-black dark:text-white truncate">
          {referralCode}
        </span>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={handleCopy}
        >
          <FontAwesomeIcon icon={faCopy} className="mr-2" />
          Copy
        </button>
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center mb-6"
        onClick={handleShare}
      >
        <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
        Share
      </button>

      <div className="w-full max-w-md p-4 border-t pt-4 mt-4">
        <div className="flex justify-between mb-4">
          <div className="text-lg font-bold text-black dark:text-white">
            Referred Users
          </div>
          <div className="text-lg text-black dark:text-white">
            {referralCount} {/* Replace with actual referred users count */}
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <div className="text-lg font-bold text-black dark:text-white">
            Total Points Earned
          </div>
          <div className="text-lg text-black dark:text-white">
            {referralCount * 3000 || 0} {/* Replace with actual earned points */}
          </div>
        </div>

        <div className="text-center text-8xl font-extrabold animate-bounce mt-5 mb-6">
  {pendingPoints}
</div>


<button
          className={`${
            pendingPoints > 0
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-gray-400 cursor-not-allowed"
          } text-white px-4 py-2 rounded-lg w-full`}
          onClick={handleClaimPoints}
          disabled={pendingPoints <= 0}
        >
          Claim Points
        </button>
           {/* How It Works Section */}
           <div className="mt-8 w-full ">
  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
    How It Works
  </h3>
  
  <div className="flex-1 mb-4 flex justify-center">
  <div className="w-full max-w-xs p-4 border border-purple-600 rounded-lg flex items-center text-center mx-2">
    <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 mr-4">
      <FontAwesomeIcon icon={faLink} className="text-white text-xl" />
    </div>
    <div className="flex flex-col items-start">
      <div className="font-bold text-purple-600 mb-2">Step 1</div>
      <div>Copy your referral link above</div>
    </div>
  </div>
</div>

<div className="flex-1 mb-4 flex justify-center">
  <div className="w-full max-w-xs p-4 border border-purple-600 rounded-lg flex items-center text-center mx-2">
    <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 mr-4">
      <FontAwesomeIcon icon={faShareAlt} className="text-white text-xl" />
    </div>
    <div className="flex flex-col items-start">
      <div className="font-bold text-purple-600 mb-2">Step 2</div>
      <div>Share with your friends</div>
    </div>
  </div>
</div>
{showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

<div className="flex-1 mb-4 flex justify-center">
  <div className="w-full max-w-xs p-4 border border-purple-600 rounded-lg flex items-center text-center mx-2">
    <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 mr-4">
      <FontAwesomeIcon icon={faUserPlus} className="text-white text-xl" />
    </div>
    <div className="flex flex-col items-start">
      <div className="font-bold text-purple-600 mb-2">Step 3</div>
      <div>Your friend Signs Up</div>
    </div>
  </div>
</div>

<div className="flex-1 mb-4 flex justify-center">
  <div className="w-full max-w-xs p-4 border border-purple-600 rounded-lg flex items-center text-center mx-2">
    <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 mr-4">
      <FontAwesomeIcon icon={faGift} className="text-white text-xl" />
    </div>
    <div className="flex flex-col items-start">
      <div className="font-bold text-purple-600 mb-2">Step 4</div>
      <div>Claim your referral points</div>
    </div>
  </div>
</div>

          </div>
      </div>
      </>
      )}
      <Suspense fallback={<div>Loading...</div>}>
  <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
  <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
</Suspense>
    </div>
  );
};

export default ReferralPage;

