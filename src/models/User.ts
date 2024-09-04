import { Timestamp } from '@firebase/firestore-types';

export interface User {
  id: string;
  displayName: string;
  username: string; // should be unique
  publicKey: string;
  referralLink: string;
  referredBy: string;
  referralCount: number;
  pendingref: number;
  premium?: boolean;
  avatar?: number;
  status: boolean;
  level: string;
  points: number;
  bio?: string;
  profilePicture?: string; // URL to the profile picture
  createdAt?: Timestamp;
  totalEnergy: number; // Max energy level (e.g., 500)
  currentEnergy: number; // Current energy level
  lastActionTime?: Timestamp; // The time of the last action
  friends: string[]; // List of friend usernames
  friendRequests: string[];
  tip: string;
  solanaagecheck: boolean;
  welcomedisplayed: boolean;
  solanaaccountage: number; // List of incoming friend requests
}
  