"use client";
import React from 'react';
import Lottie from 'react-lottie-player';
import isLoadingAnimation from './lottie/isloading.json'; // Corrected path for Lottie JSON file

interface IsLoadingProps {
  loading: boolean;
}

const IsLoading: React.FC<IsLoadingProps> = ({ loading }) => {
  if (!loading) return null; // Don't render the modal if not loading

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
      <div className="flex flex-col items-center justify-center relative">
        <Lottie
          loop
          animationData={isLoadingAnimation}
          play
          style={{
            width: 240,
            height: 240,
          }}
        />
      </div>
    </div>
  );
};

export default IsLoading;
