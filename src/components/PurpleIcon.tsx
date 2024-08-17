"use client"
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

interface PurpleIconProps {
  onClick?: () => void;
  showContactPage?: boolean;
}

const PurpleIcon: React.FC<PurpleIconProps> = ({ onClick, showContactPage }) => {
  const [isContactPageVisible, setIsContactPageVisible] = useState(showContactPage || false);

  const handleButtonClick = () => {
    setIsContactPageVisible(!isContactPageVisible);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="fixed bottom-16 right-4 flex flex-col items-end z-30">
      <div
        className="bg-purple-500 w-12 h-12 flex items-center justify-center rounded-full cursor-pointer mb-6"
        onClick={handleButtonClick}
      >
        <FontAwesomeIcon
          icon={isContactPageVisible ? faMinus : faPlus}
          className="text-white"
          style={{ fontSize:'16px'}}
        />
      </div>
    </div>
  );
};

export default PurpleIcon;







