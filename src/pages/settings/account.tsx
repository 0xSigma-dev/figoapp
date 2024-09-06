"use client";
import React, { useState } from "react";

const AccountSettingsPage = () => {
  // State for managing username and avatar
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);

  // Handler functions
  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handleAvatarChange = (e: any) => {
    setAvatar(e.target.files[0]);
  };

  const handleSave = () => {
  
  };

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

      {/* Username Update Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Change Username</h2>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Enter new username"
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded w-full"
        />
      </div>

      {/* Avatar Update Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Change Avatar</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded w-full"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
      >
        Save Changes
      </button>
    </div>
  );
};

export default AccountSettingsPage;
