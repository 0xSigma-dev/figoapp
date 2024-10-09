import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust the import path as necessary

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (displayName: string, username: string, bio: string) => void;
}

const validateUsername = (username: string) => {
  const errors: string[] = [];
  if (username.length < 4 || username.length > 32) {
    errors.push('Username must be between 4 and 32 characters.');
  }
  if (/\s/.test(username)) {
    errors.push('Username cannot contain spaces.');
  }
  if (!/^[a-zA-Z_0-9]/.test(username)) {
    errors.push('Username must start with a letter, number, or an underscore (_).');
  }
  return errors;
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
  const [isUsernameTaken, setIsUsernameTaken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUsername = async () => {
      if (username.length === 0) {
        setIsUsernameTaken(null);
        setIsLoading(false);
        setUsernameErrors([]);
        return;
      }

      setIsLoading(true);

      const errors = validateUsername(username);
      setUsernameErrors(errors);

      if (errors.length > 0) {
        setIsUsernameTaken(null);
        setIsLoading(false);
        return;
      }

      try {
        // Supabase query to check if the username already exists
        const { data, error } = await supabase
          .from('users')
          .select('id')  // Selecting 'id' or any other field
          .eq('username', username);  // Matching the username

        if (error) {
          throw error;
        }

        // If data is returned, the username is already taken
        setIsUsernameTaken(data.length > 0);
      } catch (error) {
        if (error instanceof Error) {
          setUsernameErrors(['Error checking username: ' + error.message]);
        } else {
          setUsernameErrors(['Unknown error occurred']);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(checkUsername, 500);

    return () => clearTimeout(debounceTimeout);
  }, [username]);

  const handleSave = () => {
    onSave(displayName, username, bio);
    onClose();
  };

  const isSaveButtonDisabled = username.length === 0 || isUsernameTaken || usernameErrors.length > 0 || isLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 w-full inset-0 flex items-center justify-center bg-black z-50 overflow-x-hidden">
      <div className="bg-white dark:bg-black border-t border-teal-400 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4">Enter Your Details</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
          {usernameErrors.length > 0 && (
            <p className="text-red-500 text-sm mt-1">{usernameErrors.join(' ')}</p>
          )}
          {isUsernameTaken && (
            <p className="text-red-500 text-sm mt-1">Username is already taken.</p>
          )}
        </div>
      
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
          <button onClick={handleSave} disabled={isSaveButtonDisabled} className={`bg-purple-500 text-white py-2 px-4 rounded ${isSaveButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>Create Account</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;



