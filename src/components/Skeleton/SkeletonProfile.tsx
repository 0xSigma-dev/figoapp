import React from 'react';

const SkeletonProfile: React.FC = () => {
  return (
    <div className="relative w-full h-screen flex flex-col items-center bg-gradient-to-r from-purple-900 via-purple-400 to-blue-500">
      <div className="relative w-full h-1/3 bg-gradient-to-r from-purple-900 via-purple-400 to-blue-500 flex justify-center items-center">
        <div className="w-1/2 h-8 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
      </div>

      <div className="relative w-full h-full rounded-tl-2xl rounded-tr-3xl bg-white dark:bg-black">
        <div className="relative -mt-16 ml-10 w-32 h-25 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="mt-2 text-center">
          <div className="w-1/2 h-8 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse mx-auto"></div>
          <div className="w-1/3 h-6 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse mx-auto mt-2"></div>
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <div className="flex flex-col w-1/4 h-auto border items-center border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse mt-2"></div>
          </div>
          <div className="flex flex-col w-1/4 h-auto border items-center border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse mt-2"></div>
          </div>
          <div className="flex flex-col w-1/4 h-auto border items-center border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProfile;
