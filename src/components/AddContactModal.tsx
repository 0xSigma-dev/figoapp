import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabaseClient'; // Make sure to import your Supabase client
import { useRouter } from 'next/router';

interface AddContactModalProps {
  isOpen: boolean;
  userDetails: { displayName?: string; publicKey: string; id: string; avatar: string; bio: string; };
  onClose: () => void;
  onContactAdded: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ userDetails, onClose, onContactAdded }) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const userId = Cookies.get('userId');

  useEffect(() => {
    if (userDetails) {
      setDisplayName(userDetails.displayName || '');
      setAvatar(userDetails.avatar || '');
      setPublicKey(userDetails.publicKey || '');
      setBio(userDetails.bio || '');
      setIsLoading(false);
    }
  }, [userDetails]);

  const handleSaveContact = async () => {
    if (!userId) {
      setMessageType('error');
      setMessage('User ID is missing.');
      return;
    }

    // Construct the new contact object
    const newContact = {
      displayName,
      publicKey: userDetails.publicKey,
      id: userDetails.id,
      avatar: userDetails.avatar,
      bio: userDetails.bio,
    };

    try {
      // Fetch current friends array from the database
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('friends')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch user data: ' + fetchError.message);
      }

      // Check if the user already has friends
      const currentFriends = userData?.friends || [];
      
      // Check if the new contact already exists in the friends array
      const friendExists = currentFriends.some((friend: any) => friend.id === newContact.id);
      if (friendExists) {
        setMessageType('error');
        setMessage('Contact already exists in your friends list.');
        return;
      }

      // Add the new contact to the current friends array
      const updatedFriends = [...currentFriends, newContact];

      // Update the friends array in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ friends: updatedFriends })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update friends: ' + updateError.message);
      }

      setMessageType('success');
      setMessage('Contact added successfully.');
      onContactAdded();
      onClose();

    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Failed to save contact. Please try again.');
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





