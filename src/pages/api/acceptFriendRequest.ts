import { doc, collection, writeBatch, getDoc, getDocs, query, where, arrayRemove, arrayUnion } from 'firebase/firestore';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { userId, friendId, action } = req.body;

    if (!userId || !friendId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (typeof userId !== 'string' || typeof friendId !== 'string' || (action !== 'accept' && action !== 'reject')) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    if (token !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const userPublicCollectionRef = collection(db, `users/${userId}/public`);
    const userPublicDocsSnapshot = await getDocs(userPublicCollectionRef);

    const friendPublicCollectionRef = collection(db, `users/${friendId}/public`);
    const friendPublicDocsSnapshot = await getDocs(friendPublicCollectionRef);

    if (userPublicDocsSnapshot.empty || friendPublicDocsSnapshot.empty) {
      return res.status(404).json({ message: 'User or Friend public details not found' });
    }

    const userPublicDocRef = userPublicDocsSnapshot.docs[0].ref;
    const userPublicDetails = userPublicDocsSnapshot.docs[0].data();

    const friendPublicDocRef = friendPublicDocsSnapshot.docs[0].ref;
    const friendPublicDetails = friendPublicDocsSnapshot.docs[0].data();

    const batch = writeBatch(db);

    if (action === 'accept') {
      // Add friend to the user's friends subcollection
      const userFriendsRef = collection(userPublicDocRef, 'friends');
      batch.set(doc(userFriendsRef, friendId), friendPublicDetails);

      // Add user to the friend's friends subcollection
      const friendFriendsRef = collection(friendPublicDocRef, 'friends');
      batch.set(doc(friendFriendsRef, userId), userPublicDetails);

      // Remove friend from receivedFriendRequests
      const receivedFriendRequestsRef = doc(userPublicDocRef, `receivedFriendRequests/${friendId}`);
      batch.delete(receivedFriendRequestsRef);

      // Remove user from friend's friendRequests
      const friendRequestsRef = doc(friendPublicDocRef, `friendRequests/${userId}`);
      batch.delete(friendRequestsRef);

    } else if (action === 'reject') {
      // Remove friend from receivedFriendRequests
      const receivedFriendRequestsRef = doc(userPublicDocRef, `receivedFriendRequests/${friendId}`);
      batch.delete(receivedFriendRequestsRef);

      // Remove user from friend's friendRequests
      const friendRequestsRef = doc(friendPublicDocRef, `friendRequests/${userId}`);
      batch.delete(friendRequestsRef);
    }

    await batch.commit();

    //console.log(`Friend request ${action}ed from ${userId} to ${friendId}`);

    return res.status(200).json({ message: `Friend request ${action}ed` });
  } catch (error) {
    //console.error('Error handling friend request:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    return res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}




