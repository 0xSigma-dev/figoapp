import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { db } from '../lib/firebaseConfig'; // Adjust this import based on your Firebase setup
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';

const StatsPage: React.FC = () => {
  const router = useRouter();
  const [userCount, setUserCount] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    
    // Listener to count number of users
    const unsubscribeUsers = onSnapshot(usersCollectionRef, async (snapshot) => {
      setUserCount(snapshot.size);

      let total = 0;
      for (const userDoc of snapshot.docs) {
        const userId = userDoc.id;
        const privateCollectionRef = collection(db, `users/${userId}/private`);
        const detailsDocRef = doc(privateCollectionRef, 'details');
        
        const detailsDoc = await getDoc(detailsDocRef);
        if (detailsDoc.exists()) {
          const data = detailsDoc.data();
          total += data?.points || 0;
        }
      }
      setTotalPoints(total);
    });

    return () => {
      unsubscribeUsers();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-black text-white h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex items-center space-x-4">
        <button onClick={() => router.push('/Home/page')} className="text-black dark:text-white text-3xl">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-4xl text-black dark:text-white font-bold">Statistics</h1>
      </div>
      <div className="text-center mt-16">
        <div className="mb-8">
          <p className="text-8xl font-bold text-purple-400 shadow-lg">
            {userCount}
          </p>
          <p className="text-xl font-semibold text-black dark:text-gray-400 mt-2">
            Total Number of Users
          </p>
        </div>
        <div>
          <p className="text-4xl font-bold text-purple-400 shadow-lg">
            {totalPoints}
          </p>
          <p className="text-xl font-semibold text-black dark:text-gray-400 mt-2">
            Total Points Farmed
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;


