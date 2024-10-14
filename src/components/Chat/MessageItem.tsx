import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

interface MessageItemProps {
  content: string;
  sender_id: string;
  created_at: string;
  isCurrentUser: boolean;
  status: 'sent' | 'delivered' | 'seen'; // Explicit status type
}

const splitTextIntoLines = (content: string | undefined, maxCharsPerLine: number) => {
  if (!content) return [];

  const words = content.split(' ');
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

const MessageItem: React.FC<MessageItemProps> = ({ content, sender_id, created_at, isCurrentUser, status }) => {
  const maxCharsPerLine = 35;
  const lines = splitTextIntoLines(content, maxCharsPerLine);

  const renderStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <FontAwesomeIcon icon={faCheck} className="text-gray-500" />;
      case 'delivered':
        return <FontAwesomeIcon icon={faCheckDouble} className="text-gray-500" />;
      case 'seen':
        return <FontAwesomeIcon icon={faCheckDouble} className="text-green-500" />;
      default:
        return null;
    }
  };

  const messageDate = new Date(created_at);
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - messageDate.getTime();
  const isOlderThan24Hours = timeDifference > 24 * 60 * 60 * 1000;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`relative p-2 rounded-lg text-xs font-serif ${isCurrentUser ? 'bg-purple-800 text-white' : 'bg-gray-800 text-white'} max-w-xs`}
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          borderRadius: isCurrentUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          position: 'relative',
        }}
      >
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}

        {/* Status and timestamp */}
        <div className="flex items-center justify-end text-xs font-serif text-gray-400 mt-1">
          <span className="mr-1">
            {isOlderThan24Hours
              ? messageDate.toLocaleDateString()
              : new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-gray-500">{renderStatusIcon()}</span>
          )}
        </div>

        {/* Message bubble tail */}
        <div
          className={`absolute bottom-0 h-3 w-3 bg-inherit transform rotate-45 ${isCurrentUser ? 'right-[-6px]' : 'left-[-6px]'}`}
          style={{
            borderBottomRightRadius: isCurrentUser ? '2px' : '0',
            borderBottomLeftRadius: isCurrentUser ? '0' : '2px',
          }}
        />
      </div>
    </div>
  );
};

export default MessageItem;





