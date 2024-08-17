"use client"
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'react-lottie-player';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faUser, faCog, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ReferralComponent from './ReferralComponent';

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
  displayName?: string;
  avatarId?: number;
  status?: string;
  level?: number;
  messagesSent?: number;
  totalMessagesRequired?: number;
  timeSpentHours?: number;
  totalHoursRequired?: number;
  pointsObtained?: number;
  totalPointsRequired?: number;
}

interface PlaceholderComponentProps {
  user: User;
  onClose: () => void;
}

const PlaceholderComponent: React.FC<PlaceholderComponentProps> = ({ user, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  //const avatar = avatars.find(a => a.id === user.avatarId)?.animation;

  const avatarId = user?.public?.[0]?.data?.avatar;
  const points = user?.private?.[0]?.data?.points;
  const totalPointsRequired = 100000;

  // Find the corresponding avatar object in the avatars array
  const selectedAvatar = avatars.find((item) => item.id === avatarId);
  console.log('selectedAvatar', selectedAvatar);
  console.log('user', user);

  

  const handleReferralClick = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 100); // Blink duration
    setTimeout(() => setIsReferralOpen(true), 100); // Open referral after blink
  };
  
  const closeReferral = () => {
    setIsReferralOpen(false);
  };

  return (
    <motion.div
      ref={drawerRef}
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="fixed top-0 left-0 h-full bg-white dark:bg-black text-white p-4 z-40 shadow-lg overflow-y-auto"
      style={{ width: '70%', maxWidth: '800px' }} // Limit to 70% of screen width with a max-width
    >
      <button
        className="absolute top-2 right-2 text-black dark:text-white hover:text-gray-300"
        onClick={onClose}
      >
        &times;
      </button>

      <div className="flex flex-col items-center space-y-4">
      {isReferralOpen && <ReferralComponent user={user} onClose={closeReferral} />}
        {selectedAvatar && (
          <Lottie
            animationData={selectedAvatar.animation}
            play
            style={{ width: 240, height: 240 }}
          />
        )}
        <p className="text-2xl text-black dark:text-white font-bold">{user.public[0].data.displayName || 'FIGO'}</p>

        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-semibold">Online</span>
          <span className="w-3 h-3 bg-green-400 rounded-full"></span>
        </div>

        <div className="w-full text-center space-y-2">
          <p className="text-lg text-black dark:text-white">{user.public[0].data.level || 1}</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-400 h-2 rounded-full"
              style={{
                width: `${
                  totalPointsRequired && points
                    ? (points / totalPointsRequired) * 100
                    : 0
                }%`
              }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-black dark:text-white-400 font-semibold">{user.public[0].data.bio}</span>
          
        </div>


        <hr className="w-full border-gray-600 my-4" />

        

        <div className="w-full text-left">
          <div className="flex items-center space-x-2 ml-4">
          <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-2" style={{ fontSize:'16px'}} />
            <span className="text-black dark:text-white text-lg ">Profile</span>
          </div>


          <hr className="w-full border-gray-600 my-4" />

          <div className={`flex items-center space-x-2 ml-4 cursor-pointer ${
              isBlinking ? 'bg-gray-400' : ''
            }`} onClick={handleReferralClick}>
          <FontAwesomeIcon icon={faShareAlt} className="text-gray-400 mr-2" style={{ fontSize:'16px'}}/>
            <span className="text-black dark:text-white">Referral</span>
          </div>

          <hr className="w-full border-gray-600 my-4" />

          <div className="flex items-center space-x-2 mt-2 ml-4">
          <FontAwesomeIcon icon={faCog} className="text-gray-400 mr-2" style={{ fontSize:'16px'}} />
            <span className="text-black dark:text-white">Settings</span>
          </div>

          <hr className="w-full border-gray-600 my-4" />

          <div className="flex items-center space-x-2 mt-2 ml-4">
          <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 mr-2" style={{ fontSize:'16px'}} />
            <span className="text-black dark:text-white">About</span>
          </div>
        </div>
      </div>
      
    </motion.div>
  );
};

export default PlaceholderComponent;






