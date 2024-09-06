"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { getUserData } from '@/utils/indexedDB'; // Update the path accordingly
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoltLightning } from '@fortawesome/free-solid-svg-icons';

interface EnergyProgressBarProps {
  userId: string;
}

const EnergyProgressBar: React.FC<EnergyProgressBarProps> = ({ userId }) => {
  const [currentEnergy, setCurrentEnergy] = useState<number>(0);
  const [totalEnergy, setTotalEnergy] = useState<number>(100); // Default total energy

  const fetchEnergyData = useCallback(async () => {
    if (!userId) {
      //console.error('No userId provided');
      return;
    }

    try {
      // Fetch user data from IndexedDB
      const userData = await getUserData(userId);

      if (userData) {
        setCurrentEnergy(userData.currentEnergy || 0);
        setTotalEnergy(userData.totalEnergy || 100); // Default to 100 if totalEnergy is not set
      } else {
        //console.error('No energy data found for this user in IndexedDB');
      }
    } catch (error) {
      //console.error('Error fetching energy data from IndexedDB:', error);
    }
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEnergyData();
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchEnergyData]);

  const progress = totalEnergy > 0 ? (currentEnergy / totalEnergy) * 100 : 0;

  return (
    <div style={{
      width: '60%',
      backgroundColor: '#eee',
      borderRadius: '5px',
      overflow: 'hidden',
      position: 'relative',
      alignSelf: 'justify-end',
      zIndex: 26, // Adjust the z-index as needed
    }} className='fixed bottom-28 mr-3 ml-6'>
      
      <div
        style={{
          width: `${progress}%`,
          height: '14px',
          backgroundColor: '#4caf50',
          transition: 'width 0.5s ease-in-out',
          textAlign: 'center',
          color: 'white',
          lineHeight: '10px',
          zIndex: 20, // Ensure the progress bar fill is above the container
          position: 'relative',
        }}
      >
        <FontAwesomeIcon icon={faBoltLightning} className="text-xs mr-2 text-yellow-500" />
        <span className='text-xs'>{currentEnergy} / {totalEnergy}</span>
      </div>
    </div>
  );
};

export default EnergyProgressBar;





