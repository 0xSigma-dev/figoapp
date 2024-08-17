"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface User {
  displayName: string;
}

interface WelcomeModalProps {
  user: User;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg overflow-hidden shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          &times;
        </button>

        <motion.div
          initial={{ y: -1000 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex justify-center"
        >
          <Image src="/img/boy1.png" alt="Welcome" width={300} height={200} />
        </motion.div>

        <motion.div
          initial={{ y: -1000 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          className="text-center mt-2"
        >
          <h2 className="text-xl font-bold">Welcome, {user.displayName}!</h2>
        </motion.div>

        <motion.div
          initial={{ y: -1000 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
          className="flex justify-center mt-1"
        >
          <Image src="/img/newbie1.png" alt="Novice Badge" width={100} height={100} />
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeModal;

