"use client"
import { useEffect } from 'react';

const useInstallPrompt = () => {
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show your own install button
      const installButton = document.getElementById('install-button');

      if (installButton) {
        installButton.style.display = 'block';

        installButton.addEventListener('click', () => {
          if (installButton) {
            installButton.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
              } else {
                console.log('User dismissed the install prompt');
              }
              deferredPrompt = null;
            });
          }
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
};

export default useInstallPrompt;

