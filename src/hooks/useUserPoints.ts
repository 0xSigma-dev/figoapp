import { doc, onSnapshot } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../lib/firebaseConfig';

const useUserPoints = () => {
  const [points, setPoints] = useState<number>(0);
  const [currentEnergy, setCurrentEnergy] = useState<number>(0);

  const fetchUserPoints = useCallback((userId: string | undefined) => {
    if (!userId) {
      console.error('No userId provided');
      return;
    }

    // Navigate to the 'details' document inside the 'private' subcollection
    const userDetailsDocRef = doc(db, 'users', userId, 'private', 'details');

    if (!userDetailsDocRef) {
      console.error('Invalid document reference');
      return;
    }

    const unsubscribe = onSnapshot(userDetailsDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) {
        console.error('Document does not exist');
        return;
      }

      const userData = docSnapshot.data();
      if (userData) {
        console.log('userdata', userData);
        setPoints(userData.points || 0);
        setCurrentEnergy(userData.currentEnergy || 0);
      } else {
        console.error('No user data found');
      }
    }, (error) => {
      console.error('Error fetching user data:', error);
    });

    return () => unsubscribe();
  }, []);

  return { points, currentEnergy, fetchUserPoints };
};

export default useUserPoints;





