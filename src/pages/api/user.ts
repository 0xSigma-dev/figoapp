import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const userId = authorization.split(' ')[1];

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();

    // Fetch 'public' and 'private' subcollections
    const publicData = await fetchSubcollectionData(userDocRef, 'public', ['friends', 'friendRequests', 'receivedFriendRequests']);
    const privateData = await fetchSubcollectionData(userDocRef, 'private');

    const result = {
      user: userData,
      subcollections: {
        public: publicData,
        private: privateData,
      },
    };

    //console.log('User data with all nested subcollections:', result);

    return res.status(200).json(result);

  } catch (error) {
    //console.error('Error fetching user data and subcollections:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Helper function to fetch subcollection data, including nested subcollections
async function fetchSubcollectionData(
  docRef: any,
  subcollectionName: string,
  nestedSubcollectionNames: string[] = []
): Promise<any> {
  const subcollectionRef = collection(docRef, subcollectionName);
  const subcollectionSnapshot = await getDocs(subcollectionRef);
  const subcollectionData = [];

  for (const subdocSnapshot of subcollectionSnapshot.docs) {
    const subdocData = subdocSnapshot.data();

    // Initialize the nested subcollections object with dynamic string keys
    const nestedSubcollections: { [key: string]: any } = {};

    // Recursively fetch nested subcollections if any are specified
    for (const nestedSubcollectionName of nestedSubcollectionNames) {
      nestedSubcollections[nestedSubcollectionName] = await fetchSubcollectionData(
        subdocSnapshot.ref,
        nestedSubcollectionName
      );
    }

    subcollectionData.push({
      id: subdocSnapshot.id,
      data: subdocData,
      subcollections: nestedSubcollections,
    });
  }

  return subcollectionData;
}







