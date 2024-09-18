"use client"
import React, { useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const TaskDashboard = () => {
  const [taskSource, setTaskSource] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [points, setPoints] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [taskLink, setTaskLink] = useState('');  // New state for task link

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const taskData = {
      taskSource,
      taskTitle,
      taskDescription,
      points,
      verificationCode,
      taskLink, // Add task link to taskData
    };

    try {
      const response = await fetch(`${apiUrl}/api/saveTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        alert('Task saved successfully!');
        // Reset form
        setTaskSource('');
        setTaskTitle('');
        setTaskDescription('');
        setPoints('');
        setVerificationCode('');
        setTaskLink('');  // Reset taskLink
      } else {
        alert('Error saving task');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving task');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg h-screen flex flex-col">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Create a New Task</h2>
      
      {/* Scrollable Form */}
      <div className="flex-grow overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Source</label>
            <select
              value={taskSource}
              onChange={(e) => setTaskSource(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Source</option>
              <option value="Figo">Figo</option>
              <option value="X">X (formerly Twitter)</option>
              <option value="Telegram">Telegram</option>
              <option value="Youtube">Youtube</option>
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              placeholder="Enter task title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
              placeholder="Enter task description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={4} 
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points (FP)</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              placeholder="Enter points"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Verification Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              placeholder="Enter verification code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Task Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Link</label>
            <input
              type="url"
              value={taskLink}
              onChange={(e) => setTaskLink(e.target.value)}
              required
              placeholder="Enter task link"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Save Task Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDashboard;



