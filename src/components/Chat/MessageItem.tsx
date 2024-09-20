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
const splitTextIntoLines = (text: string | undefined, maxCharsPerLine: number) => {
  if (!text) return [];

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
};

const MessageItem: React.FC<MessageItemProps> = ({ text, sender, timestamp, isCurrentUser, status }) => {
  const maxCharsPerLine = 35;
  const lines = splitTextIntoLines(text, maxCharsPerLine);

  const renderStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <FontAwesomeIcon icon={faCheck} className="text-gray-500" />;
      case 'delivered':
        return <FontAwesomeIcon icon={faCheckDouble} className="text-gray-500" />;
      case 'read':
        return <FontAwesomeIcon icon={faCheckDouble} className="text-green-500" />;
      default:
        return null;
    }
  };

  // Calculate if the message is older than 24 hours
  const messageDate = new Date(timestamp);
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - messageDate.getTime();
  const isOlderThan24Hours = timeDifference > 24 * 60 * 60 * 1000;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}  mb-2`}>
      <div
        className={`p-2 rounded-lg text-xs font-serif ${isCurrentUser ? 'bg-purple-800 text-white' : 'bg-gray-800 text-white'} max-w-xs relative`}
        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
      >
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}

        {/* Display status and timestamp */}
        <div className="flex items-center justify-end text-xs font-serif text-gray-400 mt-1">
          <span className="mr-1">
            {isOlderThan24Hours
              ? messageDate.toLocaleDateString() // Display date if older than 24 hours
              : new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-gray-500">
              {renderStatusIcon()}
            </span>
          )}
        </div>
        
      </div>
     
    </div>
  );
};

export default MessageItem;




