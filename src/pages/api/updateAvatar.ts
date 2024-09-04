import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, avatarId } = req.body;

    if (!userId || !avatarId) {
      return res.status(400).json({ message: 'Missing userId or avatarId' });
    }

    try {
      // Check if the user exists and fetch their current avatar data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, avatar')
        .eq('id', userId)
        .single();

      if (userError) {
        return res.status(500).json({ message: 'Error fetching user data' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the avatar field exists and update or insert accordingly
      const { data: updateResponse, error: updateError } = await supabase
        .from('users')
        .update({ avatar: avatarId })
        .eq('id', userId);

      if (updateError) {
        return res.status(500).json({ message: 'Error updating avatar' });
      }

      return res.status(200).json({ message: 'Avatar updated successfully' });
    } catch (error) {
      console.error('Unexpected error occurred:', error);
      return res.status(500).json({ message: 'Unexpected error occurred' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}





