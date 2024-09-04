// ChatInput.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faClock, faFile, faCamera, faMicrophone, faPause, faStop, faTrash, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface ChatInputProps {
  message: string;
  isRecording: boolean;
  onSend: () => void;
  onRecord: () => void;
  onStopRecording: () => void;
  setMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ message, isRecording, onSend, onRecord, onStopRecording, setMessage }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className={`flex items-center w-full ${isRecording ? 'flex-col p-4' : ''}`}>
      {isRecording ? (
        <div className="flex flex-col  items-center h-16 w-full">
          <div className="flex justify-between w-full">
            <div className="text-purple-500">00:00</div>
            <div className="flex gap-4">
              <button onClick={onStopRecording}>
                <FontAwesomeIcon icon={faTrash} className="text-purple-500" />
              </button>
              <button onClick={onRecord}>
                <FontAwesomeIcon icon={faPause} className="text-purple-500" />
              </button>
              <button>
                <FontAwesomeIcon icon={faClock} className="text-purple-500" />
              </button>
            </div>
          </div>
          <div className="wave-analyzer h-16 w-full bg-gray-800 my-4 rounded"></div>
        </div>
      ) : (
        <div className="flex items-center w-full p-2 bg-gray-800 rounded-full">
          <button className="px-2">
            <FontAwesomeIcon icon={faSmile} className="text-white" />
          </button>
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Message"
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 h-10 outline-none border-none px-2"
            style={{ caretColor: '#7E22CE', caretShape:'bar' }}
          />
          <button className="px-2">
            <FontAwesomeIcon icon={faClock} className="text-white" />
          </button>
          <button className="px-2">
            <FontAwesomeIcon icon={faFile} className="text-white" />
          </button>
          <button className="px-2">
            <FontAwesomeIcon icon={faCamera} className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
