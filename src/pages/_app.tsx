import AppWalletProvider from '@/components/AppWalletProvider';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app'; // Import AppProps for typing
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'; // Ensure this imports your CSS file with theme styles
import { UserProvider } from '../context/UserContext'; // Adjust the import path as necessary
import Head from "next/head";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Montaga } from '@next/font/google';
import { UserStatusProvider } from '../context/UserStatusContext';
import { BetSlipProvider } from '@/context/BetSlipContext';


const montaga = Montaga({
  weight: '400',
  subsets: ['latin'], // Specify subsets if needed
});


config.autoAddCss = false



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
          //console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          //console.error('Service Worker registration failed:', error);
        });
    });
  }

  

  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Figo - Next Gen Social App</title>
        <meta name="description" content="Best Web3 Gamified Social App!" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/icons/mask-icon.svg" color="#FFFFFF" />
        <meta name="theme-color" content="#F7F7F7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#290131" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/ios/50.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/ios/50.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/ios/50.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/ios/50.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://app.figoapp.xyz" />
        <meta name="twitter:title" content="Figo" />
        <meta name="twitter:description" content="First Gamified Social Web App!" />
        <meta name="twitter:image" content="/icons/twitter.png" />
        <meta name="twitter:creator" content="@DavidWShadow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Figo" />
        <meta property="og:description" content="First Gamified Scial Web App!" />
        <meta property="og:site_name" content="Figo" />
        <meta property="og:url" content="https://app.figoapp.xyz" />
        <meta property="og:image" content="/ios/60.png" />
      </Head>
      <div className={montaga.className}>
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="dark">
    
      <AppWalletProvider>
        <UserProvider>
        <UserStatusProvider>
          <BetSlipProvider>
             <Component {...pageProps} />
             <ToastContainer />
          </BetSlipProvider>
        </UserStatusProvider>
        </UserProvider> 
      </AppWalletProvider> 
    </ThemeProvider>
    </div>
    
    </>
  );
}

export default MyApp;




