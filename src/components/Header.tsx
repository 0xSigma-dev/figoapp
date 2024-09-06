import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import PlaceholderComponent from './PlaceholderComponent';
import Link from 'next/link'; // Import Link
import Cookies from 'js-cookie';
import AvatarComponent from './AvatarComponent';
import router from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Gajraj_One } from '@next/font/google';
import { deleteDatabase } from '@/utils/indexedDB';
import WarningModal from './WarningModal';
const gajrajOne = Gajraj_One({
  weight: '400',
  subsets: ['latin'], 
});

interface User {
  user?: User;
  displayName?: any;
  avatar?: any;
}

interface HeaderProps {
  user: User;
  points: any;
}

const Header: React.FC<HeaderProps> = ({ user, points }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [previousPoints, setPreviousPoints] = useState(points);
  const [animationClass, setAnimationClass] = useState('');
  const { disconnect } = useWallet();
  const drawerRef = useRef<HTMLDivElement>(null);
  const pointsString = points.toString().split('');
  const [showWarning, setShowWarning] = useState(false); 
  

  useEffect(() => {
    if (points !== previousPoints) {
      setAnimationClass('change');
      setTimeout(() => setAnimationClass(''), 100);
      setPreviousPoints(points);
    }
  }, [points, previousPoints]);

  const handleImageClick = () => {
    setShowDrawer(!showDrawer);
    setShowMenu(false);
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    setShowDrawer(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideMenu = menuRef.current?.contains(event.target as Node);
      const isClickInsideDrawer = drawerRef.current?.contains(event.target as Node);
      
      if (!isClickInsideMenu && !isClickInsideDrawer) {
        setShowMenu(false);
        setShowDrawer(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  


  const handleDisconnectWallet = async () => {
    try {
      const userId = Cookies.get('userId');
      if (userId) {
        await deleteDatabase(userId); // Pass userId to deleteDatabase
        //console.log("All database content deleted successfully.");
      } else {
        //console.error('User ID is not available for database deletion.');
      }
  
      await disconnect();
      Cookies.remove('userId');
      localStorage.clear();
      router.push('/');
    } catch (error) {
      //console.error('Error disconnecting wallet:', error);
    }
  };

  const handleCloseWarning = () => {
    setShowWarning(false);  // Function to close the warning modal
  };

  const handleOpenWarning = () => {
    setShowWarning(true);
    setShowMenu(false);
  };
  

  return (
    <>
      <header className="fixed top-0 w-screen left-0 right-0 bg-white dark:bg-deep-purple text-black dark:text-white  flex items-center justify-between z-10 border-b border-gray-900">
        <div className="flex items-center">
        {user?.avatar ? (
            <AvatarComponent avatarId={user.avatar} onClick={handleImageClick} />
          ) : (
            <Image
              src="/img/boy1.png"
              alt="Avatar"
              className="h-12 w-12 rounded-full cursor-pointer"
              width={50}
              height={50}
              onClick={handleImageClick}
            />
          )}
        </div>
        <div>
        <div className={` text-purple-500 text-2xl ${pointsString.length === 1 ? 'single' : 'multi'} `}>   
            <span className={`${gajrajOne.className}`}>Figo</span>
        </div>
      </div>
        <div className="relative" ref={menuRef}>
          <div className="cursor-pointer mr-6 text-black dark:text-white" onClick={handleMenuClick}>
            <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize: '24px'}} />
          </div>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-2 z-20">
              <Link href="/StatsPage">
                <p className="block px-4 py-2 text-black dark:text-white hover:bg-gray-700">Statistics</p>
              </Link>
              <button
                onClick={handleOpenWarning}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-red-600 mr-2" style={{ fontSize: "24px" }} />
              <span className="text-red-600">DisConnect</span>
              </button>
              
            </div>
          )}
        </div>
      </header>
      {showDrawer && <PlaceholderComponent user={user} onClose={handleImageClick} ref={drawerRef} />}
      <WarningModal
        isOpen={showWarning}
        onClose={handleCloseWarning}
        onDisconnect={handleDisconnectWallet} // Call the disconnect function when confirmed
      />
    </>
  );
};

export default Header;