import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { saveContact, getUserData } from '../utils/indexedDB'; // Import the IndexedDB functions
import { useRouter } from 'next/router';

interface AddContactModalProps {
  isOpen: boolean;
  userDetails: { displayName?: string; publicKey: string; id: string; avatar: string; bio: string; }; // Define userDetails structure
  onClose: () => void;
  onContactAdded: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ userDetails, onClose, onContactAdded }) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>(''); // State to hold success or error message
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>(''); // State to determine the type of message
  const userId = Cookies.get('userId');
  const router = useRouter();

  useEffect(() => {
    if (userDetails) {
      setDisplayName(userDetails.displayName || '');
      setAvatar(userDetails.avatar || '');
      setPublicKey(userDetails.publicKey || '');
      setBio(userDetails.bio || '');
      setIsLoading(false); // Only set loading to false when userDetails are set
    }
  }, [userDetails]);

  const handleSaveContact = async () => {
    const contact = {
      displayName,
      email: userDetails.publicKey, // Assuming publicKey as email in this context
      id: userDetails.id,
      avatar: userDetails.avatar,
      bio: userDetails.bio
    };

    if (!userId) {
      return;
    }

    try {
      // Check if contacts API is available and save to device contact list first
      if ('contacts' in navigator && 'ContactsManager' in window) {
        await (navigator as any).contacts.save(contact);
        setMessageType('success');
        setMessage('Contact saved to device contact list successfully.');
      }

      // Save to IndexedDB
      await saveContact(contact);
      setMessageType('success');
      setMessage('Contact saved successfully.');
      

      onContactAdded();
      onClose();

    } catch (error) {
      //console.error('Failed to save contact:', error);
      setMessageType('error');
      setMessage('Failed to save contact. Please try again.');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">Add Contact</h2>
        {message && (
          <div
            className={`mb-4 p-2 rounded ${
              messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {message}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-white mb-1">Display Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-white mb-1">Wallet Address</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-200 dark:bg-gray-700"
            value={publicKey}
            disabled
          />
        </div>
        <button
          onClick={handleSaveContact}
          className="w-full bg-blue-500 dark:bg-blue-600 text-white p-2 rounded"
        >
          Save Contact
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 bg-red-500 dark:bg-red-600 text-white p-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddContactModal;




