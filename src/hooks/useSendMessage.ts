import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { saveMessage, updateMessageStatus } from '@/utils/indexedDB';
import { saveCurrentEnergy } from '@/utils/energyManager';
import { addPendingPoints } from '@/utils/pendingPoints';
import { v4 as uuidv4 } from 'uuid';

const useSendMessage = (channelRef: any, userId: any, currentEnergy: number, setCurrentEnergy: (energy: number) => void, resetRefillTimer: any) => {
  const [floatingPoints, setFloatingPoints] = useState<{ points: number; x: number; y: number } | null>(null);


  const sendMessage = async (messageInput: string, onType: (status: string) => void, setMessageInput: (value: string) => void, inputRef: any, channelName: string) => {
    if (!messageInput.trim() || !channelRef.current) return;
  
    const pointsToAdd = 30;
    const messageId = uuidv4();
  
    try {
      // Create the message object with initial status 'sent'
      const message = { 
        text: messageInput, 
        id: messageId, 
        sender: userId, 
        status: 'sent', 
        timestamp: new Date().toISOString(), 
        channelName 
      };
  
      // Save the message in IndexedDB with 'sent' status
      await saveMessage(message, message.id, message.status, channelName);
      setMessageInput('');  
  
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
  
      // Publish the message using the channel
      try {
        await channelRef.current.publish('message', message); // Ensure publish succeeds before updating status
        //console.log('Message published:', message);
  
        // Update the message status to 'delivered' after publishing
        await updateMessageStatus(message.id, 'delivered', channelName);
        //console.log('Message status updated to delivered for ID:', message.id);
        
      } catch (publishError) {
        //console.error('Error publishing message:', publishError);
      }
  
      // Update energy and floating points logic
      if (currentEnergy >= pointsToAdd) {
        const updatedEnergy = Math.max(currentEnergy - pointsToAdd, 0);
        setFloatingPoints({ points: pointsToAdd, x: 300, y: 500 });
        setTimeout(() => setFloatingPoints(null), 1000);
        addPendingPoints(userId, pointsToAdd);
        setCurrentEnergy(updatedEnergy);
        await saveCurrentEnergy(userId, updatedEnergy);
      } else {
        toast.warn('Not enough energy to add points!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
  
      // Play the sound after sending the message
      const messageSound = new Audio('/sounds/longpop.wav');
      messageSound.play();
  
      // Reset the refill timer
      resetRefillTimer.current && resetRefillTimer.current();
  
    } catch (error) {
      //console.error('Error sending message:', error);
    }
  };
  

  return { sendMessage, floatingPoints };
};

export default useSendMessage;

