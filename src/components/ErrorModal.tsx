"use client"
import React, { useEffect } from 'react';

interface ErrorModalProps {
  message: string | null;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Close after 2 seconds

      // Cleanup the timer if the component unmounts or message changes
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null; // Don't render if there's no message

  return (
    <div className="fixed z-50 bottom-0 left-0 mb-4 ml-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">
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

export default ErrorModal;

