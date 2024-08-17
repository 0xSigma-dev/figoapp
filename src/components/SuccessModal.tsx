"use client"
import React, { useEffect } from 'react';

interface SuccessModalProps {
  message: string | null;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      // Set a timer to call the onClose function after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // 3 seconds

      // Cleanup the timer if the component unmounts or message changes
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null; // Don't render if there's no message

  return (
    <div className="z-50 fixed bottom-0 left-0 mb-4 ml-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button
          className="ml-4 text-white font-bold"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
