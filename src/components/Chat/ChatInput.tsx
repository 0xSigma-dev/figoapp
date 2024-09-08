import React, { useState, forwardRef, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faClock, faFile, faCamera, faMicrophone, faPause, faTrash, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface ChatInputProps {
  message: string;
  isRecording: boolean;
  onSend: () => void;
  onKeyDown: () => void;
  onRecord: () => void;
  onStopRecording: () => void;
  setMessage: (message: string) => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ message, isRecording, onSend, onKeyDown, onRecord, onStopRecording, setMessage }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      adjustTextareaHeight();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        onSend();
      }
    };

    // Adjust the textarea height dynamically
    const adjustTextareaHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`; // 8 lines max (approx. 160px)
      }
    };

    useEffect(() => {
      adjustTextareaHeight(); // Adjust on initial render or when the message changes
    }, [message]);

    return (
      <div className={`flex items-center w-full ${isRecording ? 'flex-col p-4' : ''}`}>
        {isRecording ? (
          <div className="flex flex-col items-center h-16 w-full">
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
            <textarea
              ref={(el) => {
                textareaRef.current = el;
                if (typeof ref === 'function') ref(el);
              }}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Message"
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 h-10 max-h-40 outline-none border-none resize-none overflow-y-auto px-2"
              rows={1}
              style={{ caretColor: '#7E22CE' }}
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
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;


