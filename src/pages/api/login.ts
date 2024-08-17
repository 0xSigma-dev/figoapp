import { collection, getDocs } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../lib/firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //console.log('Received request:', req.method);

  if (req.method !== 'POST') {
    //console.log('Invalid request method:', req.method);
    return res.status(405).end(); // Method Not Allowed
  }

  const { publicKey } = req.body;
  //console.log('Request body:', req.body);

  if (!publicKey) {
    //console.log('Public key not provided in the request body.');
    return res.status(400).json({ message: 'Public key is required' });
  }

  try {
    //console.log('Starting search for user with public key:', publicKey);

    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    //console.log('Fetched users collection:', usersSnapshot.size);

    let userFound = false;
    let userData = null;

    // Iterate through each document in the 'users' collection
    for (const userDoc of usersSnapshot.docs) {
      if (userFound) break;

      //console.log('Checking user document:', userDoc.id);

      // Get the 'public' subcollection
      const publicSubCollection = collection(db, `users/${userDoc.id}/public`);
      const publicSnapshot = await getDocs(publicSubCollection);
      //console.log('Fetched public subcollection:', publicSnapshot.size);

      // Iterate through each document in the 'public' subcollection
      for (const publicDoc of publicSnapshot.docs) {
        const publicData = publicDoc.data();
        //console.log('Checking public subcollection document:', publicDoc.id);

        if (publicData.publicKey === publicKey) {
          //console.log('Public key match found:', publicKey);
          userFound = true;
          userData = publicData;
          break;
        }
      }
    }

    if (!userFound) {
      //console.log('No user found with the provided public key.');
      return res.status(400).json({ message: 'User not found' });
    }

    const username = userData?.username;
    //console.log('Username found:', username);

    if (!username) {
      //console.log('Username not found for the provided public key.');
      return res.status(400).json({ message: 'Username not found for the provided public key' });
    }

    const auth = getAuth();
    //console.log('Firebase Auth initialized.');

    await signInWithEmailAndPassword(auth, `${username}@figoapp.xyz`, publicKey)
      .then(async (userCredential) => {
        const user = userCredential.user;
        //console.log('Signed in successfully:', user);

        const accessToken = await user.getIdToken();

        //console.log('Access and refresh tokens generated.');
        return res.status(200).json({ 
          message: 'Signed in successfully', 
          user: { 
            public: { ...userData}
          }, 
          accessToken
        });
      })
      .catch((error) => {
        //console.error('Error during sign in:', error);
        return res.status(500).json({ message: 'Error during sign in', error: error.message });
      });

  } catch (error) {
    //console.error('Error checking credentials:', error);

    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error checking credentials: ' + error.message });
    }

    return res.status(500).json({ message: 'Error checking credentials: An unknown error occurred' });
  }
}







