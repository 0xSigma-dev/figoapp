import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig'; // Import Firestore instance from your firebase setup

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //console.log('API Handler invoked');

  if (req.method === 'POST') {
    //console.log('Received POST request');

    try {
      const { friendIds } = req.body;
      //console.log('Request body:', req.body); // Log the full request body
      //console.log('Received Friend IDs:', friendIds); // Log the received friend IDs

      if (!friendIds || !Array.isArray(friendIds)) {
        //console.error('Invalid friend IDs:', friendIds); // Log invalid friend IDs
        return res.status(400).json({ message: 'Invalid friend IDs' });
      }

      // Create a reference to the 'users' collection
      const usersRef = collection(db, 'users');
      //console.log('Users reference created:', usersRef);

      // Create a query to fetch documents where the document ID is in the friendIds array
      const friendsQuery = query(usersRef, where('__name__', 'in', friendIds));
      //console.log('Created friends query:', friendsQuery);

      // Get the documents
      const friendDocs = await getDocs(friendsQuery);
      //console.log('Fetched Friend Docs:', friendDocs.docs); // Log the fetched friend docs

      // Check if any documents were fetched
      if (friendDocs.empty) {
        console.warn('No documents found for friend IDs:', friendIds); // Log if no documents are found
      }

      // Map the documents to a list of friend data
      const friends = friendDocs.docs.map(doc => {
        //console.log('Document data:', doc.data()); // Log each document's data
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      //console.log('Mapped friends data:', friends); // Log the final mapped friends data

      res.status(200).json({ friends });
    } catch (error) {
      //console.error('Server Error:', error); // Log server error details
      res.status(500).json({ message: 'Server error', error });
    }
  } else {
    console.warn(`Method ${req.method} not allowed`); // Log unsupported methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
