import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, increment, updateDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { User } from '../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { displayName, username, publicKey, referralId } = req.body;

    if (!displayName || !username || !publicKey) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const batch = writeBatch(db);

      // Check if username or public key is already taken
      const userDocRef = doc(db, 'users', username);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const publicKeyQuery = query(collection(db, 'users'), where('publicKey', '==', publicKey));
      const publicKeySnapshot = await getDocs(publicKeyQuery);

      if (!publicKeySnapshot.empty) {
        return res.status(400).json({ message: 'Public key already associated with an existing user' });
      }

      // Create a new user with Firebase Authentication
      const auth = getAuth();
      const email = `${username}@figoapp.xyz`;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, publicKey);
        const user = userCredential.user;
        const accessToken = await user.getIdToken();

        // Define the new user document data
        const uniqueId = user.uid;
        const referralLink = `http://localhost:3000?referralId=${uniqueId}`;
        const newUser: User = {
          id: uniqueId,
          displayName,
          username,
          publicKey,
          referralLink,
          referredBy: referralId || '',
          premium: false,
          referralCount: 0,
          status: true,
          bio: '',
          level: 'novice',
          points: 1000,
          createdAt: Timestamp.now(),
          totalEnergy: 500,
          currentEnergy: 500,
          friends: [],
          friendRequests: [],
          tip: accessToken,
          solanaagecheck: false,
          welcomedisplayed: false,
          solanaaccountage: 0
        };

        // Create references to the new user document
        const newUserRef = doc(db, 'users', uniqueId);
        const publicDocRef = doc(db, 'users', uniqueId, 'public', 'details');
        const privateDocRef = doc(db, 'users', uniqueId, 'private', 'details');

        // Set user document data with placeholders for public and private subcollections
        await setDoc(newUserRef, {
          id: uniqueId,
          createdAt: newUser.createdAt,
        });

        // Set public document data
        await setDoc(publicDocRef, {
          username,
          displayName,
          publicKey,
          bio: newUser.bio,
          level: newUser.level,
          id: uniqueId,
          createdAt: newUser.createdAt,
        });

        // Set private document data
        await setDoc(privateDocRef, {
          referralLink: newUser.referralLink,
          referredBy: newUser.referredBy,
          premium: newUser.premium,
          referralCount: newUser.referralCount,
          points: newUser.points,
          totalEnergy: newUser.totalEnergy,
          currentEnergy: newUser.currentEnergy,
          friends: newUser.friends,
          friendRequests: newUser.friendRequests,
          tip: accessToken,
          solanaagecheck: newUser.solanaagecheck,
          welcomedisplayed: newUser.welcomedisplayed,
          solanaaccountage: newUser.solanaaccountage
        });

        // Commit all batched writes
        await batch.commit();

        // If there is a referrer, update the referrer’s referral count and points
        if (referralId) {
          const referrerPrivateDocRef = doc(db, 'users', referralId, 'private', 'details');
          const referrerDoc = await getDoc(referrerPrivateDocRef);

          if (referrerDoc.exists()) {
            const referrerData = referrerDoc.data();
            const newReferralCount = (referrerData?.referralCount || 0) + 1;
            const newPoints = (referrerData?.points || 0) + 1000;

            await updateDoc(referrerPrivateDocRef, {
              referralCount: newReferralCount,
              points: newPoints,
            });
          }
        }

        return res.status(200).json({ user: uniqueId, accessToken });
      } catch (authError) {
        //console.error('Authentication error:', authError);
        return res.status(500).json({ message: 'Error creating user with Firebase Authentication' });
      }

    } catch (error) {
      //console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'Unexpected error occurred' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}









