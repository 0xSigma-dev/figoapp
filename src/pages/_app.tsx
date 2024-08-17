import AppWalletProvider from '@/components/AppWalletProvider';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app'; // Import AppProps for typing
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'; // Ensure this imports your CSS file with theme styles
import { UserProvider } from '../context/UserContext'; // Adjust the import path as necessary


export const metadata: Metadata = {
  title: 'Figo',
  description: 'Next Generation Social Media App',
};




function MyApp({ Component, pageProps }: AppProps) {

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
  
      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
  

  
  return (
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
      <AppWalletProvider>
        <UserProvider>
          <Component {...pageProps} />
          <ToastContainer />
        </UserProvider>
      </AppWalletProvider>
    </ThemeProvider>
  );
}

export default MyApp;




