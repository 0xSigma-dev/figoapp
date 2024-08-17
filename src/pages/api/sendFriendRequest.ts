import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig';
import { doc, collection, setDoc, getDocs, query, where } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //console.log('Received request:', req.method);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    //console.log('Invalid request method:', req.method);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { authorization } = req.headers;

  if (!authorization) {
    //console.log('Authorization header is missing');
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  //console.log('Authorization token:', token);

  try {
    const { userId, friendId } = req.body;
    //console.log('Request body:', req.body);

    if (!userId || !friendId) {
      //console.log('Missing required fields:', { userId, friendId });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (typeof userId !== 'string' || typeof friendId !== 'string') {
      //console.log('Invalid data types:', { userIdType: typeof userId, friendIdType: typeof friendId });
      return res.status(400).json({ message: 'User ID and Friend ID must be strings' });
    }

    if (token !== userId) {
      //console.log('Unauthorized request:', { token, userId });
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Fetch the user public document within the 'public' subcollection
    const userPublicCollectionRef = collection(db, `users/${userId}/public`);
    const userPublicDocsSnapshot = await getDocs(userPublicCollectionRef);

    let userPublicDocRef;
    let userPublicDetails;

    if (!userPublicDocsSnapshot.empty) {
      userPublicDocRef = userPublicDocsSnapshot.docs[0].ref; // Reference to the public document
      userPublicDetails = userPublicDocsSnapshot.docs[0].data();
      //console.log('User public document ID:', userPublicDocRef.id);
      //console.log('User public details:', userPublicDetails);
    } else {
      //console.log('User public details not found:', userId);
      return res.status(404).json({ message: 'User public details not found' });
    }

    // Fetch the friend public document within the 'public' subcollection
    const friendPublicCollectionRef = collection(db, `users/${friendId}/public`);
    const friendPublicDocsSnapshot = await getDocs(friendPublicCollectionRef);

    let friendPublicDocRef;
    let friendPublicDetails;

    if (!friendPublicDocsSnapshot.empty) {
      friendPublicDocRef = friendPublicDocsSnapshot.docs[0].ref; // Reference to the public document
      friendPublicDetails = friendPublicDocsSnapshot.docs[0].data();
      //console.log('Friend public document ID:', friendPublicDocRef.id);
      //console.log('Friend public details:', friendPublicDetails);
    } else {
      //console.log('Friend public details not found:', friendId);
      return res.status(404).json({ message: 'Friend public details not found' });
    }

    // Create a subcollection 'friendRequests' for the user within the userPublicDocRef
    const userFriendRequestDocRef = doc(userPublicDocRef, `friendRequests/${friendId}`);
    await setDoc(userFriendRequestDocRef, friendPublicDetails);
    //console.log(`Added friend request from ${userId} to ${friendId} in userFriendRequestDocRef`);

    // Create a subcollection 'receivedFriendRequests' for the friend within the friendPublicDocRef
    const friendReceivedRequestDocRef = doc(friendPublicDocRef, `receivedFriendRequests/${userId}`);
    await setDoc(friendReceivedRequestDocRef, userPublicDetails);
    //console.log(`Added received friend request from ${userId} to ${friendId} in friendReceivedRequestDocRef`);

    //console.log(`Friend request sent from ${userId} to ${friendId}`);

    return res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    //console.error('Error sending friend request:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}















