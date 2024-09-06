import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { displayName, username, publicKey, referralId, bio } = req.body;

    if (!displayName || !username || !publicKey) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      // Check if username is already taken
      const { data: userByUsername, error: usernameError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();  // Changed from .single() to .maybeSingle()

      if (usernameError) {
        //console.error('Error checking username availability:', usernameError.message, usernameError.details);
        return res.status(500).json({ message: 'Error checking username availability' });
      }

      if (userByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Check if public key is already associated with an existing user
      const { data: userByPublicKey, error: publicKeyError } = await supabase
        .from('users')
        .select('id')
        .eq('publicKey', publicKey)
        .maybeSingle();  // Changed from .single() to .maybeSingle()

      if (publicKeyError) {

        return res.status(500).json({ message: 'Error checking public key availability' });
      }

      if (userByPublicKey) {
        return res.status(400).json({ message: 'Public key already associated with an existing user' });
      }

      // Create a new user in Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: `${username}@figoapp.xyz`,
        password: publicKey, // Using public key as the password
      });

      if (authError) {
      
        return res.status(500).json({ message: 'Error creating user Authentication' });
      }

      const uniqueId = authUser.user?.id;
      const referralLink = `https://app.figoapp.xyz?referralId=${uniqueId}`;
      const newUser = {
        id: uniqueId,
        displayName,
        username,
        publicKey,
        referralLink,
        referredBy: referralId || '',
        pendingref: 0,
        premium: false,
        referralCount: 0,
        status: true,
        bio: bio,
        level: 'novice',
        points: 1000,
        createdAt: new Date(),
        totalEnergy: 500,
        currentEnergy: 500,
        friends: [],
        friendRequests: [],
        solanaagecheck: false,
        welcomedisplayed: false,
        solanaaccountage: 0,
        avatar: null, // Placeholder for avatar
      };

      // Insert the new user into the 'users' table
      const { data: insertedUser, error: userInsertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single(); // Use .single() to get the inserted record

        //console.log('Inserted user data:', insertedUser);


      if (userInsertError) {
        //console.error('Error inserting new user data:', userInsertError.message, userInsertError.details);
        return res.status(500).json({ message: 'Error inserting new user data' });
      }

      // If there is a referrer, update the referrer's referral count and points
      if (referralId) {
        const { data: referrer, error: referrerError } = await supabase
          .from('users')
          .select('referralCount, pendingref')
          .eq('id', referralId)
          .maybeSingle();  // Changed from .single() to .maybeSingle()

        if (referrerError) {
          //console.error('Error retrieving referrer data:', referrerError.message, referrerError.details);
          return res.status(500).json({ message: 'Error retrieving referrer data' });
        }

        if (referrer) {  // Ensure referrer exists before updating
          const newReferralCount = (referrer?.referralCount || 0) + 1;
          const newpendingPoints = (referrer?.pendingref || 0) + 1;

          const { error: referrerUpdateError } = await supabase
            .from('users')
            .update({ referralCount: newReferralCount, pendingref: newpendingPoints })
            .eq('id', referralId);

          if (referrerUpdateError) {
            //console.error('Error updating referrer data:', referrerUpdateError.message, referrerUpdateError.details);
            return res.status(500).json({ message: 'Error updating referrer data' });
          }
        }
      }

      // Return the complete user information
      return res.status(200).json({ 
        user: insertedUser, 
        uniqueId: uniqueId 
      });
    } catch (error) {
      //console.error('Unexpected error occurred:', error);
      return res.status(500).json({ message: 'Unexpected error occurred' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}













