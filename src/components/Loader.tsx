"use client";
import React, { useEffect, useState, memo } from 'react';
import { useRouter } from 'next/router';
import Lottie from 'react-lottie-player';
import lightModeAnimation from './lottie/loader.json'; // Corrected path for light mode Lottie JSON file
import darkModeAnimation from './lottie/loaderblack.json'; // Corrected path for dark mode Lottie JSON file

// Memoize the Lottie component to avoid unnecessary re-renders
const MemoizedLottie = memo(Lottie);

const Loader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const { query } = router;

  // Extract referralId from query parameters
  const referralId = query.referralId as string | undefined;

  useEffect(() => {
    // Disable scroll on mount
    document.body.style.overflow = 'hidden';

    // Re-enable scroll on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, [router]);

  useEffect(() => {
    let animationFrameId: any;

    const updateProgress = () => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          // Include referralId in the URL if present
          const nextUrl = referralId 
            ? `/Onboarding/page?referralId=${referralId}`
            : '/Onboarding/page';
          router.push(nextUrl);
          return 100;
        }
        return prevProgress + 0.5; // Slower progress for smoother animation
      });
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, [router, referralId]);

  return (
    <div className="loader-container">
      <div className="flex flex-col items-center justify-center relative w-64">
        {progress < 100 && (
          <MemoizedLottie
            loop
            animationData={isDarkMode ? darkModeAnimation : lightModeAnimation}
            play
            style={{
              width: 128,
              height: 128,
              position: 'absolute',
              left: `${progress}%`,
              transform: 'translateX(-50%)',
            }}
          />
        )}
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;



