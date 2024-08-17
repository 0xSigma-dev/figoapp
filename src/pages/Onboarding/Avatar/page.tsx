"use client"
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Lottie from 'react-lottie-player';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import ErrorModal from '../../../components/ErrorModal';
import SuccessModal from '../../../components/SuccessModal';
import IsLoading from '../../../components/isLoading';
import WalletGuard from '../../../components/WalletGuard';

// Import your Lottie files
import avatar1 from '../../../components/lottie/avatar1.json';
import avatar2 from '../../../components/lottie/avatar2.json';
import avatar3 from '../../../components/lottie/avatar3.json';
import avatar4 from '../../../components/lottie/avatar4.json';
import avatar5 from '../../../components/lottie/avatar5.json';
import avatar6 from '../../../components/lottie/avatar6.json';
import avatar7 from '../../../components/lottie/avatar7.json';
import avatar8 from '../../../components/lottie/avatar8.json';
import avatar9 from '../../../components/lottie/avatar9.json';
import avatar10 from '../../../components/lottie/avatar10.json';
import avatar11 from '../../../components/lottie/avatar11.json';
import avatar12 from '../../../components/lottie/avatar12.json';
import avatar13 from '../../../components/lottie/avatar13.json';

const avatars = [
  { id: 1, animation: avatar1 },
  { id: 2, animation: avatar2 },
  { id: 3, animation: avatar3 },
  { id: 4, animation: avatar4 },
  { id: 5, animation: avatar5 },
  { id: 6, animation: avatar6 },
  { id: 7, animation: avatar7 },
  { id: 8, animation: avatar8 },
  { id: 9, animation: avatar9 },
  { id: 10, animation: avatar10 },
  { id: 11, animation: avatar11 },
  { id: 12, animation: avatar12 },
  { id: 13, animation: avatar13 },
];

const AvatarSelection: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const router = useRouter();
  const userId = Cookies.get('userId');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAvatarSelect = (avatarId: number) => {
    setSelectedAvatar(avatarId);
  };

  //console.log('userId',userId);

  const handleContinue = async () => {
    router.prefetch('../Letstest/page');
    setIsLoading(true);
    if (selectedAvatar !== null && userId !== null) {
      try {
        const response = await fetch('/api/updateAvatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, avatarId: selectedAvatar }),
        });

        if (response.ok) { 
          router.push('../Letstest/page');
          setSuccessMessage('Avatar updated successfully');
          setIsLoading(false);
        } else {
          setErrorMessage('Failed to update avatar');
        }
      } catch (error) {
        //console.error('Error updating avatar:', error);
        setErrorMessage('Error updating avatar');
      }
    } else {
      setErrorMessage('Please select an avatar!');
    }
    setIsLoading(false);
  };

  return (
    <WalletGuard>
    <div className="h-screen flex flex-col items-center bg-white dark:bg-black">
      <div className="fixed top-0 left-0 right-0 flex flex-col items-center justify-center bg-white dark:bg-black p-4 z-10">
        <h1 className="text-2xl font-bold text-white">Pick Your Avatar</h1>
        <p className="text-l font-bold text-black dark:text-white text-center">
          Soon your NFT will be your identity on Figo. No more useless NFTs. But before then, choose an avatar for your account.
        </p>
      </div>

      <div className="flex-row mt-32 mb-16 w-full max-w-3xl overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-4">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`p-2 rounded-lg cursor-pointer border-2 ${
                selectedAvatar === avatar.id ? 'border-purple-500' : 'border-transparent'
              }`}
              onClick={() => handleAvatarSelect(avatar.id)}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <Lottie
                  animationData={avatar.animation}
                  play
                  loop
                  style={{ height: 150, width: 150 }}
                />
              </Suspense>
            </div>
          ))}
        </div>
      </div>

      <IsLoading loading={isLoading} />

      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 z-10">
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700"
        >
          Continue
        </button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
      <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
      <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
      </Suspense>
    </div>
    </WalletGuard>
  );
};

export default AvatarSelection;






