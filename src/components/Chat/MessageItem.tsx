import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

interface MessageItemProps {
  text: string;
  sender: string;
  timestamp: string;
  isCurrentUser: boolean;
  status: 'sent' | 'delivered' | 'read'; // Explicit status type
}

// Helper function to split the message into lines of 35 characters
const splitTextIntoLines = (text: string, maxCharsPerLine: number) => {
  const words = text.split(' '); // Split the text into words
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim()); // Add the current line and start a new one
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim()); // Add the last line if any
  }

  return lines;
};

const MessageItem: React.FC<MessageItemProps> = ({ text, sender, timestamp, isCurrentUser, status }) => {
  const maxCharsPerLine = 35; // Max number of characters per line
  const lines = splitTextIntoLines(text, maxCharsPerLine);

  const renderStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <FontAwesomeIcon icon={faCheck} className="text-gray-500" />; // Grey single check
      case 'delivered':
        return <FontAwesomeIcon icon={faCheckDouble} className="text-gray-500" />; // Grey double check
      case 'read':
        return <FontAwesomeIcon icon={faCheckDouble} className="text-green-500" />; // Green double check
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`p-2 rounded-lg ${isCurrentUser ? 'bg-purple-800 text-white' : 'bg-gray-800 text-white'} max-w-xs relative`}
        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
      >
        {/* Display the text broken into lines */}
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}

        <span className="text-xs text-gray-400 ml-4">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {isCurrentUser && (
          <span className="text-xs text-gray-500 ml-2">
            {renderStatusIcon()}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageItem;


