import React from 'react';

const ContactSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-4 ml-3">
      <div className="flex items-center">
        <div className="bg-gray-700 rounded-full" style={{ width: '50px', height: '50px' }}></div>
        <div className="ml-4">
          <div className="bg-gray-700 h-4 w-32 mb-2 rounded"></div>
          <div className="bg-gray-700 h-3 w-24 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ContactSkeleton;
