"use client";

import React from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface SubHeaderProps {
  title: string;
}

const SubHeader: React.FC<SubHeaderProps> = ({ title }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigates to the previous page
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-black shadow-md">
      <button onClick={handleBack} className="text-black dark:text-white hover:text-gray-500">
        <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
      </button>
      <h1 className="flex-1 text-center text-2xl ml-10 font-bold text-purple-600">
        {title}
      </h1>
      {/* Placeholder for spacing on the right side */}
      <div className="w-8" />
    </div>
  );
};

export default SubHeader;
