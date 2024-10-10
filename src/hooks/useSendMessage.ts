import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabaseClient';
import { saveCurrentEnergy } from '@/utils/energyManager';
import { addPendingPoints } from '@/utils/pendingPoints';
import { v4 as uuidv4 } from 'uuid';

const useSendMessage = (
  channelId: any, 
  userId: any, 
  friendId: any,
  currentEnergy: number, 
  setCurrentEnergy: (energy: number) => void, 
  resetRefillTimer: any, 
  setMessages: any
) => {
  const [floatingPoints, setFloatingPoints] = useState<{ points: number; x: number; y: number } | null>(null);

  const sendMessage = async (
    messageInput: string, 
    onType: (status: string) => void,
    setMessageInput: (value: string) => void, 
    inputRef: any
  ) => {
    if (!messageInput.trim()) return;

    const pointsToAdd = 30;
    const messageId = uuidv4(); // Generate a unique message ID
  
    try {
      const message = { 
        id: messageId, 
        sender_id: userId, 
        friend_id: friendId,
        content: messageInput, 
        created_at: new Date().toISOString(), 
        channel_id: channelId, 
        status: 'sent' 
      };
      
      // Save the message to Supabase
      const { error } = await supabase
        .from('messages')
        .insert([message]);

      if (error) {
        //console.error('Error saving message:', error);
        toast.error('Error sending message.');
        return;
      }

      setMessageInput('');  

      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }

      // Energy management
      if (currentEnergy >= pointsToAdd) {
        const updatedEnergy = Math.max(currentEnergy - pointsToAdd, 0);
        setFloatingPoints({ points: pointsToAdd, x: 300, y: 500 });
        setTimeout(() => setFloatingPoints(null), 1000);
        addPendingPoints(userId, pointsToAdd);
        setCurrentEnergy(updatedEnergy);
        
        await supabase
          .from('users')
          .update({ currentEnergy: updatedEnergy })
          .eq('id', userId);
      } else {
        toast.warn('Not enough energy to send message!');
      }

      const messageSound = new Audio('/sounds/longpop.wav');
      messageSound.play();

      // Reset the refill timer
      resetRefillTimer.current && resetRefillTimer.current();

    } catch (error) {
      //console.error('Error sending message:', error);
      toast.error('Failed to send the message.');
    }
  };

  

  return { sendMessage, floatingPoints };
};

export default useSendMessage;

