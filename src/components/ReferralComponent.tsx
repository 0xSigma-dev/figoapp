"use client";
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface ReferralComponentProps {
  user: any;
  onClose: () => void;
}

const ReferralComponent: React.FC<ReferralComponentProps> = ({ user, onClose }) => {
  const referralCode = user?.public?.[0]?.data?.referralCode || "ABC123"; // Default referral code

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Referral code copied to clipboard!");
  };

  return (
    <div className="fixed top-0 left-0 h-full w-full bg-black bg-opacity-90 text-white p-6 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-300"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Referral Program</h2>
        <p className="text-lg text-center mb-4">
          Invite your friends using the referral code below and earn rewards!
        </p>

        <div className="flex items-center justify-center mb-4">
          <span className="text-xl bg-gray-700 px-4 py-2 rounded-lg mr-2">
            {referralCode}
          </span>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg"
            onClick={handleCopy}
          >
            <FontAwesomeIcon icon={faCopy} className="mr-1" />
            Copy Code
          </button>
        </div>

        <p className="text-center">
          Share this code with your friends and get rewards when they sign up!
        </p>
      </div>
    </div>
  );
};

export default ReferralComponent;
