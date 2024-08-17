import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust the path

const updateStatus = async (userId: string, status: string) => {
  const statusRef = doc(db, 'user_status', userId);
  
  // Check if the document exists
  const docSnapshot = await getDoc(statusRef);
  
  if (!docSnapshot.exists()) {
    // If the document doesn't exist, create it
    await setDoc(statusRef, {
      status: status,
      lastActive: serverTimestamp(),
    });
  } else {
    // If the document exists, update the status and lastActive fields
    await setDoc(statusRef, {
      status: status,
      lastActive: serverTimestamp(),
    }, { merge: true });
  }
};
  