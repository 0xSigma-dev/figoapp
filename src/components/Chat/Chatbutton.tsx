import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface ChatButtonProps {
  isRecording: boolean;
  message: string;
  onSend: () => void;
  onRecord: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ isRecording, message, onSend, onRecord }) => {
  const [showPlaneIcon, setShowPlaneIcon] = useState(false);

  useEffect(() => {
    if (message.trim() || isRecording) {
      setShowPlaneIcon(true);
    } else {
      setShowPlaneIcon(false);
    }
  }, [message, isRecording]);

  const handleClick = () => {
    if (showPlaneIcon) {
      onSend();
    } else {
      onRecord();
    }
  };

 

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full"
    >
      <FontAwesomeIcon icon={showPlaneIcon ? faPaperPlane : faMicrophone} />
    </button>
  );
};

export default ChatButton;
