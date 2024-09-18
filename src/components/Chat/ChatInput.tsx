import React, { useState, forwardRef, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faTrash, faPause, faCamera } from '@fortawesome/free-solid-svg-icons';
import debounce from 'lodash.debounce';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ChatInputProps {
  message: string;
  isRecording: boolean;
  onSend: () => void;
  onKeyDown: () => void;
  onRecord: () => void;
  onStopRecording: () => void;
  setMessage: (message: string) => void;
  onType: (inputValue: string) => void; // New prop for typing status
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ message, isRecording, onSend, onKeyDown, onRecord, onStopRecording, setMessage, onType }, ref) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0); // Timer for recording
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Ref for the waveform canvas
    const audioContextRef = useRef<AudioContext | null>(null); // Ref for AudioContext
    const analyserRef = useRef<AnalyserNode | null>(null); // Ref for AnalyserNode
    const dataArrayRef = useRef<Uint8Array | null>(null); // Ref for storing waveform data
    const animationFrameRef = useRef<number | null>(null); // Ref for animation frame

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        onSend();
      }
    };

    const adjustTextareaHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`; // Max 8 lines
      }
    };

    useEffect(() => {
      adjustTextareaHeight();
    }, [message]);

    const debouncedFocus = debounce(() => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 10);

    useEffect(() => {
      debouncedFocus();
    }, [message, debouncedFocus]);

    // Handle typing and update typing status
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const inputValue = e.target.value;
      setMessage(inputValue);
      onType(inputValue); // Trigger typing status update
    };

    // Toggle emoji picker visibility
    const toggleEmojiPicker = () => {
      setShowEmojiPicker((prev) => !prev);
    };

    // Handle emoji selection
    const handleEmojiClick = (emojiData: EmojiClickData) => {
      setMessage(message + emojiData.emoji); // Append emoji to message
      onType(message + emojiData.emoji); // Update typing status with new emoji
      setShowEmojiPicker(false); // Hide emoji picker after selection
    };

    // Start timer for recording
    const startTimer = () => {
      setRecordingTime(0);
      const id = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(id);
    };

    // Stop timer
    const stopTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Draw the waveform on the canvas
    const drawWaveform = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF'; // Purple color for the waveform

      ctx.beginPath();
      const sliceWidth = (width * 1.0) / analyserRef.current.fftSize;
      let x = 0;

      for (let i = 0; i < analyserRef.current.fftSize; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    };

    // Start analyzing the waveform
    const startWaveform = (stream: MediaStream) => {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Set the size for the FFT (Fast Fourier Transform)
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      source.connect(analyser);
      drawWaveform();
      startTimer(); // Start the timer when recording starts
    };

    // Stop analyzing the waveform
    const stopWaveform = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      stopTimer(); // Stop the timer when recording stops
    };

    const handleStartRecording = () => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          startWaveform(stream);  // Start the waveform analysis when recording begins
          onRecord();
        })
        .catch(err => console.error('Error accessing microphone:', err));
    };

    const handleStopRecording = () => {
      stopWaveform();
      onStopRecording();
    };

    return (
      <div className={`relative flex flex-col items-center w-full ${isRecording ? 'p-4' : ''}`}>
        {isRecording ? (
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-between w-full">
              <div className="text-purple-500">{formatTime(recordingTime)}</div>
              <div className="flex gap-4">
                <button onClick={handleStopRecording}>
                  <FontAwesomeIcon icon={faTrash} className="text-purple-500" />
                </button>
                <button onClick={onRecord}>
                  <FontAwesomeIcon icon={faPause} className="text-purple-500" />
                </button>
              </div>
            </div>

            {/* Waveform display */}
            <canvas
              ref={canvasRef}
              className="wave-analyzer w-full h-16 bg-gray-800 rounded mt-4"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center w-full p-2 bg-gray-800 rounded-full">
              {/* Sentiment (Emoji) Picker button */}
              <button className="px-2" onClick={toggleEmojiPicker}>
                <FontAwesomeIcon icon={faSmile} className="text-white" />
              </button>

              {/* Chat Input */}
              <textarea
                ref={(el) => {
                  textareaRef.current = el;
                  if (typeof ref === 'function') ref(el);
                  if (inputRef.current === null) inputRef.current = el;
                }}
                value={message}
                onChange={handleChange} // Handle change here
                onKeyDown={handleKeyDown}
                placeholder="Message"
                className="flex-1 bg-gray-800 text-white placeholder-gray-500 h-10 max-h-40 outline-none border-none resize-none overflow-y-auto px-2"
                rows={1}
                style={{ caretColor: '#7E22CE' }}
              />

              {/* Other buttons */}
              <button className="px-2">
                <FontAwesomeIcon icon={faCamera} className="text-white" />
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-600 z-50" style={{ height: '40vh' }}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;











