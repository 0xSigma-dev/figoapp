import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

interface UserDetailsCardProps {
  user: {
    displayName: string;
    publicKey: string;
    avatar: any;
    pendingPoints: number;
  };
  onClaimPoints: () => void;
}

const UserDetailsCard: React.FC<UserDetailsCardProps> = ({ user, onClaimPoints }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const currentHour = new Date().getHours();
    setGreeting(currentHour < 12 ? 'fm' : 'fn');
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.publicKey);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000); // Reset the copy success message after 2 seconds
  };

  // Formatting public key to show only the first 6 and last 2 characters
  const formattedPublicKey = `${user?.publicKey?.slice(0, 6)}...${user?.publicKey?.slice(-2)}`;

  return (
    <div className="w-screen mx-auto bg-cover bg-center rounded-t-xl rounded-b-xl shadow-md overflow-hidden" style={{ backgroundImage: `url('/img/banner.png')` }}>
      <div className="flex items-center p-4">
        <div className="flex-shrink-0">
          <Image
            src={'/img/rat.jpg'}
            alt="User Avatar"
            width={50}
            height={50}
            className="rounded-full border-2 border-white"
          />
        </div>
        <div className="ml-4 flex-1">
          {/* Greeting and Display Name */}
          <div className="text-white text-lg font-bold mb-2">
            {greeting}, {user.displayName || 'FIGO'}
          </div>
          {/* Public Key and Actions */}
          <div className="text-white font-bold">
            {formattedPublicKey}
            <button onClick={copyToClipboard} className="ml-2 text-sm text-blue-300">
              <FontAwesomeIcon icon={faCopy} className="text-gray-600 mr-2" style={{ fontSize: "16px" }} />
            </button>
            {copySuccess && <span className="ml-2 text-green-500">Copied!</span>}
          </div>
          <div className="mt-2">
            <span className="text-white">Pending Points: {user.pendingPoints}</span>
            <button onClick={onClaimPoints} disabled={user?.pendingPoints <= 0} className={`${
            user?.pendingPoints > 0
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-gray-400 cursor-not-allowed"
          } text-white ml-4 px-3 py-1 rounded-full w-full`}>
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsCard;

