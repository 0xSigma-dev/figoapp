import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import PlaceholderComponent from './PlaceholderComponent';
import Lottie from 'react-lottie-player';
import Link from 'next/link'; // Import Link

// Lottie animation imports
import avatar1 from './lottie/avatar1.json';
import avatar2 from './lottie/avatar2.json';
import avatar3 from './lottie/avatar3.json';
import avatar4 from './lottie/avatar4.json';
import avatar5 from './lottie/avatar5.json';
import avatar6 from './lottie/avatar6.json';
import avatar7 from './lottie/avatar7.json';
import avatar8 from './lottie/avatar8.json';
import avatar9 from './lottie/avatar9.json';
import avatar10 from './lottie/avatar10.json';
import avatar11 from './lottie/avatar11.json';
import avatar12 from './lottie/avatar12.json';
import avatar13 from './lottie/avatar13.json';

const avatars = [
  { id: 1, animation: avatar1 },
  { id: 2, animation: avatar2 },
  { id: 3, animation: avatar3 },
  { id: 4, animation: avatar4 },
  { id: 5, animation: avatar5 },
  { id: 6, animation: avatar6 },
  { id: 7, animation: avatar7 },
  { id: 8, animation: avatar8 },
  { id: 9, animation: avatar9 },
  { id: 10, animation: avatar10 },
  { id: 11, animation: avatar11 },
  { id: 12, animation: avatar12 },
  { id: 13, animation: avatar13 },
];

interface User {
  public: any;
  private: any;
  displayName?: string; // Allow displayName to be undefined
  subcollections?: {
    public?: Array<{ data?: { avatar?: any } }>;
  };
}

interface HeaderProps {
  user: User;
  points: number;
}

const Header: React.FC<HeaderProps> = ({ user, points }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [previousPoints, setPreviousPoints] = useState(points);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (points !== previousPoints) {
      setAnimationClass('change');
      setTimeout(() => setAnimationClass(''), 100); // Remove animation class after 0.5s
      setPreviousPoints(points);
    }
  }, [points, previousPoints]);

  const pointsString = points.toString().split('');
  
  // Assuming avatar returned from the user is an ID (e.g., 9)
  const avatarId = user?.public?.[0]?.data?.avatar;

  // Find the corresponding avatar object in the avatars array
  const selectedAvatar = avatars.find((item) => item.id === avatarId);

  console.log('selectedAvatar', selectedAvatar);

  const handleImageClick = () => {
    setShowDrawer(!showDrawer);
    setShowMenu(false); // Ensure the menu is closed when the drawer is opened
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    setShowDrawer(false); // Ensure the drawer is closed when the menu is opened
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowDrawer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-black border-b border-purple-300 text-black dark:text-white p-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          {selectedAvatar ? (
            <Lottie
              loop
              animationData={selectedAvatar.animation}
              play
              onLoad={() => setLottieLoaded(true)}
              style={{
                width: 50, // Adjusted size
                height: 50, // Adjusted size
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
              onClick={handleImageClick}  
            />
          ) : (
            <Image
              src="/img/boy1.png"
              alt="Avatar"
              className="h-12 w-12 rounded-full cursor-pointer"
              width={50}
              height={50}
              onClick={handleImageClick}
              onError={() => setLottieLoaded(false)}
            />
          )}
          <span className={`ml-2 text-lg font-bold ${!user?.public?.[0]?.data?.displayName ? 'text-purple-500' : ''}`}>
            {user?.public?.[0]?.data?.displayName || 'FIGO'}
          </span>
        </div>
        <div>
        <div className={`points-container ${pointsString.length === 1 ? 'single' : 'multi'} ${animationClass}`}>
          {pointsString.map((digit, index) => (
            <span key={index}>{digit}</span>
          ))}
        </div>
      </div>
        <div className="relative" ref={menuRef}>
          <div className="cursor-pointer mr-3" onClick={handleMenuClick}>
            <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize: '16px'}} />
          </div>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-600 rounded-md shadow-lg py-2 z-20">
              <a href="#" className="block px-4 py-2 text-black dark:text-white-800 hover:bg-white-100">
                Roadmap
              </a>
              <Link href="/StatsPage">
                <p className="block px-4 py-2 text-black dark:text-white-800 hover:bg-white-100">Statistics</p>
              </Link>
              
            </div>
          )}
        </div>
      </header>
      {showDrawer && <PlaceholderComponent user={user} onClose={handleImageClick} />}
    </>
  );
};

export default Header;