import React from 'react';

const ChatSkeleton = () => {
  return (
    <div className="p-4 animate-pulse space-y-6">
      {/* Avatar and Name */}
      <div className="flex space-x-4 items-center">
        <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
      </div>

      {/* Messages */}
      <div className="space-y-6">
        {/* Received messages on the left */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-start">
            <div className="bg-gray-300 dark:bg-gray-700 p-4 rounded-lg max-w-xs w-1/2"></div>
          </div>
          <div className="flex justify-start">
            <div className="bg-gray-300 dark:bg-gray-700 p-4 rounded-lg max-w-xs w-1/3"></div>
          </div>
          <div className="flex justify-start">
            <div className="bg-gray-300 dark:bg-gray-700 p-4 rounded-lg max-w-xs w-1/4"></div>
          </div>
        </div>

        {/* Sent messages on the right */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-end">
            <div className="bg-gray-300 dark:bg-gray-700 p-4 rounded-lg max-w-xs w-1/2"></div>
          </div>
          <div className="flex justify-end">
            <div className="bg-gray-300 dark:bg-gray-700 p-4 rounded-lg max-w-xs w-1/3"></div>
          </div>
          <div className="flex justify-end">
            <div className="bg-gray-300 dark:bg-gray-700 p-4 rounded-lg max-w-xs w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;


