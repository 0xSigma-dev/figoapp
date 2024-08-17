import AppWalletProvider from '@/components/AppWalletProvider';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app'; // Import AppProps for typing
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'; // Ensure this imports your CSS file with theme styles
import { UserProvider } from '../context/UserContext'; // Adjust the import path as necessary
import Head from "next/head";



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
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Figo - Next Gen Social App</title>
        <meta name="description" content="Best Web3 Social Media Gamified App!" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/icons/mask-icon.svg" color="#FFFFFF" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/touch-icon-ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/touch-icon-iphone-retina.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/touch-icon-ipad-retina.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://app.figoapp.xyz" />
        <meta name="twitter:title" content="Figo Web3 App" />
        <meta name="twitter:description" content="First Multidimensional Gamified Web App!" />
        <meta name="twitter:image" content="/icons/twitter.png" />
        <meta name="twitter:creator" content="@DavidWShadow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Figo Web3 App" />
        <meta property="og:description" content="First Multidimensional Gamified Web App!" />
        <meta property="og:site_name" content="Figo Web3 App" />
        <meta property="og:url" content="https://app.figoapp.xyz" />
        <meta property="og:image" content="/icons/og.png" />
      </Head>
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
      <AppWalletProvider>
        <UserProvider>
          <Component {...pageProps} />
          <ToastContainer />
        </UserProvider>
      </AppWalletProvider>
    </ThemeProvider>
    </>
  );
}

export default MyApp;




