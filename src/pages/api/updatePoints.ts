import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig';

// Define types for user levels and reasons
type UserLevel = 'novice' /* Add other levels as needed */;
type ActionReason = 'message' | 'task' | 'friend' | 'boost' | 'tap';

interface EnergyCosts {
  [level: string]: {
    [reason in ActionReason]: number;
  };
}

// Define energy costs for actions based on user level and reason
const energyCosts: EnergyCosts = {
  novice: { message: 2, task: 5, friend: 3, boost: 10, tap: 2 },
  // Add other levels as needed
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, change, reason } = req.body;

    if (!username || typeof change !== 'number' || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const userDocRef = doc(db, 'users', username);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = userDoc.data();
      const { level, currentEnergy, totalEnergy } = userData;
      const energyCost = getEnergyCost(level, reason);

      if (currentEnergy < energyCost) {
        return res.status(400).json({ message: 'Not enough energy' });
      }

      const newPoints = userData.points + change;
      const newEnergy = currentEnergy - energyCost;

      await updateDoc(userDocRef, {
        points: newPoints,
        currentEnergy: newEnergy,
        lastActionTime: Timestamp.now()
      });

      return res.status(200).json({ points: newPoints, currentEnergy: newEnergy });
    } catch (error) {
      //console.error('Error updating points:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getEnergyCost(level: string, reason: ActionReason): number {
  // Make sure `level` and `reason` are valid keys
  return energyCosts[level as UserLevel]?.[reason] || 0;
}

