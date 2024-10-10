"use client";

import { useEffect, useState } from 'react';

const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e); // Save the event to trigger later
      setIsInstallable(true); // Show the install button
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show the install prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        //console.log('User accepted the install prompt');
      } else {
        //console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null); // Reset the prompt
      setIsInstallable(false); // Hide the install button
    });
  };

  return { isInstallable, promptInstall };
};

export default useInstallPrompt;


