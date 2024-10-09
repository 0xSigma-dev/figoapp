import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV,faMousePointer, faDownload,  faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, useRef, useMemo} from 'react';
import { Suspense, lazy } from 'react';
import Lottie from 'react-lottie-player';
import Welcome from '../../components/lottie/welcome.json';
import Cookies from 'js-cookie';
import { useUser } from '../../context/UserContext';
import IsLoading from '../../components/isLoading';
import { supabase } from '@/lib/supabaseClient';
import { Gajraj_One } from '@next/font/google';
import useInstallPrompt from '@/hooks/useInstallPrompt';


const gajrajOne = Gajraj_One({
  weight: '400', 
  subsets: ['latin'], 
});

const ErrorModal = lazy(() => import('../../components/ErrorModal'));
const SuccessModal = lazy(() => import('../../components/SuccessModal'));
const UserDetailsModal = lazy(() => import('../../components/UserDetailsModal'));



const PwaInstallModal = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full relative p-6" data-aos="zoom-in">
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-red-500"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimesCircle} size="2x" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Install the Figo App!</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To install the Figo app on your device, follow these simple steps:
          </p>

          {/* Step 1 */}
          <div className="flex items-center justify-start mb-2 animate-bounce">
            <FontAwesomeIcon icon={faEllipsisV} className="text-gray-800 dark:text-white" size="lg" />
            <span className="ml-2 text-gray-800 dark:text-white text-lg">Tap the menu icon</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-start mb-2 animate-bounce">
            <FontAwesomeIcon icon={faMousePointer} className="text-gray-800 dark:text-white" size="lg" />
            <span className="ml-2 text-gray-800 dark:text-white text-lg">Select <strong>Add to Home Screen</strong></span>
          </div>

          <div className="flex items-center justify-start mb-2 animate-bounce">
            <FontAwesomeIcon icon={faDownload} className="text-gray-800 dark:text-white" size="lg" />
            <span className="ml-2 text-gray-800 dark:text-white text-lg">Click <strong>Install Figo</strong></span>
          </div>

          {/* Animation */}
          <div className="w-full h-32 mt-6">
            {/* You can customize this part with a small Lottie animation */}
            <div className="animate-bounce bg-gradient-to-r from-purple-400 to-blue-500 h-full w-full rounded-md shadow-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Validate username
const validateUsername = (username: string) => {
  const errors: string[] = [];
  if (username.length < 4 || username.length > 12) {
    errors.push('Username must be between 4 and 12 characters.');
  }
  if (/\s/.test(username)) {
    errors.push('Username cannot contain spaces.');
  }
  if (!/^[a-zA-Z_]/.test(username)) {
    errors.push('Username must start with a letter or an underscore (_).');
  }
  return errors;
};

// SignUp Component
const SignUp = () => {
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState<string>('');
  const errors = useMemo(() => validateUsername(username), [username]);
  const memoizedUsernameErrors = useMemo(() => errors, [errors]);
  const [isUsernameTaken, setIsUsernameTaken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const wallet = useWallet();
  const { connect, connected, publicKey } = useWallet();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [hasModalBeenShown, setHasModalBeenShown] = useState<boolean>(false);
  const { referralId } = router.query;
  const userId = Cookies.get('userId');
  const { isInstallable, promptInstall } = useInstallPrompt();

  
  useEffect(() => {
    AOS.init({ duration: 1200 });
  }, [router]);

  useEffect(() => {
    // Check if the user is already connected
    if (connected && userId && !isRegistering) {
      router.push('/Home');
    }
  }, [connected, userId, router, isRegistering]);
  

  const checkUserByPublicKey = async () => {
    if (!wallet.publicKey) {
        return;
    }

    const publicKeyStr = wallet.publicKey.toBase58();

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')  
            .eq('publicKey', publicKeyStr); 

        if (error) {
         // console.log("rror",error)
            throw error;
        }

        if (data && data.length > 0 ) {
            await loginUser();
        } else {
            setErrorMessage('No Account Found. Create a new account');
            if (!hasModalBeenShown) {
                setIsModalOpen(true);
                setHasModalBeenShown(true);
            }
        }
    } catch (error: any) {
        setErrorMessage('Error checking user: ' + error.message);
    }
};

const checkUserOnceRef = useRef(false);

useEffect(() => {
    if (connected && !checkUserOnceRef.current) {
        checkUserByPublicKey();
        checkUserOnceRef.current = true;
    } else if (!connected) {
        checkUserOnceRef.current = false;
        setHasModalBeenShown(false);
        setIsModalOpen(false);
    }
}, [connected, checkUserByPublicKey]);

  
  
  

  const loginUser = async () => {
    //console.log('logging in')
    
    if (!wallet.publicKey) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({publicKey: wallet.publicKey.toBase58() })
      });
      const data = await response.json();

      if (response.ok && !isRegistering) {
        setSuccessMessage("Welcome Back");
        Cookies.set('userId', data.user.public.id);
        Cookies.set('token', data.accessToken);
        router.push('/Home');
      } else {
        setIsModalOpen(true);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage('Error checking user: ' + error.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
    setIsLoading(false);
  };

 
  

  useEffect(() => {
    const checkUsername = async () => {
        if (username.length === 0) {
            setIsUsernameTaken(null);
            setIsLoading(false);
            setUsernameErrors([]);
            return;
        }

        setIsLoading(true);

        const errors = validateUsername(username);
        setUsernameErrors(errors);

        if (errors.length > 0) {
            setIsUsernameTaken(null);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('username')
                .eq('username', username);

            if (error) {
                throw error;
            }

            setIsUsernameTaken(data.length > 0);
        } catch (error: any) {
            setErrorMessage('Error checking username: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const debounceTimeout = setTimeout(checkUsername, 500);

    return () => clearTimeout(debounceTimeout);
}, [username]);


  const registerUser = async (displayName: string, username: string, bio: string) => {
    
    
    if (!wallet.publicKey) {
      setErrorMessage('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setIsRegistering(true);
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayName,
        username,
        publicKey: wallet.publicKey.toBase58(),
        referralId: referralId || '',
        bio: bio || ''
      })
    };
  
    try {
      const response = await fetch('/api/register', requestOptions);
      const data = await response.json();
      if (response.ok) {
        Cookies.set('userId', data.uniqueId);
        setSuccessMessage("Welcome To The Purple Family");
        router.push('/Onboarding/Avatar');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage('Error Registering user: ' + error.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
    setIsRegistering(false);
    setIsLoading(false);
  };
  

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-deep-purple p-4 overflow-hidden">
<svg
  className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"
  width="400"
  height="400"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 300 300"
>
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style={{ stopColor: '#8c52ff', stopOpacity: 1 }} />
      <stop offset="100%" style={{ stopColor: '#5ce1e6', stopOpacity: 1 }} />
    </linearGradient>
  </defs>
  <circle cx="150" cy="150" r="150" fill="url(#gradient1)" />
</svg>

<IsLoading loading={isLoading} />

      <div className="text-center mt-24" data-aos="fade-down">
        <h1 className={`text-primary font-bold text-4xl logo ${gajrajOne.className}`}>Figo</h1>
        <p className="mt-2 text-lg text-black dark:text-white whitespace-nowrap slogan">Fly High, Connect Fast</p>
      </div>
      <div className='mb-8'>
      <Lottie
          loop
          animationData={Welcome}
          play
          style={{
            width: 280,
            height: 280,
            position: 'absolute'
          }}
        />
      </div>
      <div className="mt-24" data-aos="fade-up">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-11 mt-4 welcome">Welcome</h2>
        {wallet.connected ? (
          <div className="text-center mt-4 ml-4" data-aos="fade-up">
            <p className="text-lg text-black dark:text-white">Connected Wallet:</p>
            <WalletMultiButton style={{}} />
          </div>
        ) : (
          <WalletMultiButton style={{}} />
        )}
      </div>

     
      <Suspense fallback={<div>Loading...</div>}>
  <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
  <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
  {isPwaModalOpen && <PwaInstallModal onClose={() => setIsPwaModalOpen(false)} />}
  <UserDetailsModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSave={(displayName, username, bio) => {
      setUsername(username);
      registerUser(displayName, username, bio);
    }}
  />
</Suspense>
    </div>
  );
};

export default SignUp;

























