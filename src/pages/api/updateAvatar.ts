// pages/api/updateAvatar.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig';
import { doc, updateDoc, getDoc, setDoc, collection } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, avatarId } = req.body;

    if (!userId || !avatarId) {
      return res.status(400).json({ message: 'Missing userId or avatarId' });
    }

    try {
      // Get a reference to the user's document
      const userRef = doc(db, 'users', userId);

      // Get a reference to the 'public' subcollection
      const publicSubcollectionRef = collection(userRef, 'public');
      
      // Get a reference to the 'details' document in the 'public' subcollection
      const detailsDocRef = doc(publicSubcollectionRef, 'details');

      // Check if the 'details' document exists
      const detailsDoc = await getDoc(detailsDocRef);

      if (!detailsDoc.exists()) {
        // Create the 'details' document if it doesn't exist
        await setDoc(detailsDocRef, {
          avatar: avatarId,
        });
      } else {
        // Update the 'avatar' field in the existing 'details' document
        await updateDoc(detailsDocRef, {
          avatar: avatarId,
        });
      }

      return res.status(200).json({ message: 'Avatar updated successfully' });
    } catch (error) {
      //console.error('Error updating avatar:', error);
      return res.status(500).json({ message: 'Error updating avatar' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}




