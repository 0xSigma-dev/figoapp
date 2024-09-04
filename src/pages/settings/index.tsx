"use client";
import React, { useState } from "react";
import Link from "next/link";

const SettingsPage = () => {
  // State for notifications and theme settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState("system");

  // Handler functions
  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleThemeChange = (e:any) => {
    setTheme(e.target.value);
  };

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {/* Account Settings Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-2">Manage your account settings like username and avatar.</p>
          <Link href="/settings/account">
            <span className="text-purple-600 hover:underline">Edit Account</span>
          </Link>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Notifications</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between">
          <p>Enable Notifications</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={handleNotificationToggle}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Appearance</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-2">Choose your preferred theme:</p>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="bg-white dark:bg-gray-900 text-black dark:text-white p-2 rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Help and Support Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Help and Support</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-2">Need help? Contact our support team.</p>
          <Link href="mailto:support@example.com">
            <span className="text-purple-600 hover:underline">Email Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
