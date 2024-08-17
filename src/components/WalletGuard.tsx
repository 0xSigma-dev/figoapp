import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/')
    // If the wallet is not connected, redirect to the onboarding page
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  // Render children if wallet is connected, otherwise, null (to prevent flashing content)
  return connected ? <>{children}</> : null;
};

export default WalletGuard;
