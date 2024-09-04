import React from 'react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onClose, onDisconnect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">Warning</h2>
        <p className="mb-4">
          Disconnecting your wallet will result in loss of data, chats and  messages, saved contacts, unclaimed points, bet tickets or unsaved progress. Are you sure you want to proceed?
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 dark:bg-gray-600 text-white p-2 rounded mr-2"
          >
            Close
          </button>
          <button
            onClick={onDisconnect}
            className="bg-red-500 dark:bg-red-600 text-white p-2 rounded"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
