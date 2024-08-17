"use client"
import { collection, doc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';

interface EnergyProgressBarProps {
  userId: string;
}

const EnergyProgressBar: React.FC<EnergyProgressBarProps> = ({ userId }) => {
  const [currentEnergy, setCurrentEnergy] = useState<number>(0);
  const [totalEnergy, setTotalEnergy] = useState<number>(0);

  const fetchEnergyData = useCallback(() => {
    if (!userId) {
      console.error('No userId provided');
      return;
    }
  
    // Reference to the user's document in the main collection
    const userDocRef = doc(db, 'users', userId);
  
    // Reference to the private subcollection and details document
    const detailsDocRef = doc(userDocRef, 'private', 'details');
  
    // Subscribe to the details document to fetch data
    const unsubscribe = onSnapshot(detailsDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) {
        console.error('No document found in the private subcollection');
        return;
      }
  
      const privateData = docSnapshot.data();
  
      if (privateData) {
        console.log('Private data:', privateData);
        setCurrentEnergy(privateData.currentEnergy || 0);
        setTotalEnergy(privateData.totalEnergy || 100); // Default to 100 if totalEnergy is not set
      } else {
        console.error('No data found in the details document');
      }
    }, (error) => {
      console.error('Error fetching private data:', error);
    });
  
    return () => unsubscribe();
  }, [userId]);
  
  useEffect(() => {
    fetchEnergyData();
  }, [fetchEnergyData]);

  const progress = totalEnergy > 0 ? (currentEnergy / totalEnergy) * 100 : 0;

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#eee',
      borderRadius: '5px',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10, // Adjust the z-index as needed
    }}>
      <div
        style={{
          width: `${progress}%`,
          height: '8px',
          backgroundColor: '#4caf50',
          transition: 'width 0.5s ease-in-out',
          textAlign: 'center',
          color: 'white',
          lineHeight: '10px',
          zIndex: 20, // Ensure the progress bar fill is above the container
          position: 'relative',
        }}
      >
        {`${Math.round(progress)}%`}
      </div>
    </div>
  );
};

export default EnergyProgressBar;




